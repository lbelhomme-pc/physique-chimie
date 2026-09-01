import {
  PYODIDE_BASE_URL,
  PYODIDE_LOAD_TIMEOUT_MS,
  PYODIDE_MODULE_URL,
  PYODIDE_VERSION,
} from "../config/pyodide";

export {};

type WorkerRequest =
  | { type: "load" }
  | { type: "run"; id: number; code: string };

type WorkerResponse =
  | { type: "status"; message: string }
  | { type: "loaded"; version: string }
  | {
      type: "result";
      id: number;
      stdout: string;
      stderr: string;
      images: string[];
      result: string;
    }
  | { type: "error"; id?: number; message: string; stdout?: string; stderr?: string };

type PyodideRuntime = {
  loadPackagesFromImports: (code: string) => Promise<void>;
  runPythonAsync: (code: string) => Promise<unknown>;
  setStdin: (options: { error: true }) => void;
  setStdout: (options: { batched: (text: string) => void }) => void;
  setStderr: (options: { batched: (text: string) => void }) => void;
  globals: {
    get: (name: string) => { toJs?: () => unknown; destroy?: () => void };
  };
};

const worker = self as unknown as {
  postMessage: (message: WorkerResponse) => void;
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
};

let pyodide: PyodideRuntime | null = null;
let pyodideReadyPromise: Promise<PyodideRuntime> | null = null;

function send(message: WorkerResponse) {
  worker.postMessage(message);
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), timeoutMs);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function loadErrorMessage(error: unknown) {
  const detail = error instanceof Error ? error.message : String(error);
  return `Impossible de charger Python depuis le CDN. Vérifie ta connexion puis réessaie. Détail : ${detail}`;
}

async function loadPython() {
  if (pyodide) return pyodide;

  if (!pyodideReadyPromise) {
    pyodideReadyPromise = (async () => {
      try {
        send({ type: "status", message: "Téléchargement du moteur Python..." });
        const module = await withTimeout(
          import(/* @vite-ignore */ PYODIDE_MODULE_URL),
          PYODIDE_LOAD_TIMEOUT_MS,
          "Délai de téléchargement de Pyodide dépassé.",
        );
        send({ type: "status", message: "Initialisation de Pyodide..." });
        const runtime = await withTimeout<PyodideRuntime>(
          module.loadPyodide({ indexURL: PYODIDE_BASE_URL }),
          PYODIDE_LOAD_TIMEOUT_MS,
          "Délai d'initialisation de Pyodide dépassé.",
        );
        runtime.setStdin({ error: true });
        pyodide = runtime;
        return runtime;
      } catch (error) {
        pyodideReadyPromise = null;
        throw new Error(loadErrorMessage(error));
      }
    })();
  }

  return pyodideReadyPromise;
}

function usesMatplotlib(code: string) {
  return /(^|\n)\s*(import\s+matplotlib|from\s+matplotlib|import\s+numpy|from\s+numpy)|plt\./.test(code);
}

function withGraphCapture(code: string) {
  return `
import matplotlib
matplotlib.use("Agg")
__pyodide_graphs = []

${code}

try:
    import base64
    import io
    import matplotlib.pyplot as plt

    for __figure_number in plt.get_fignums():
        __figure = plt.figure(__figure_number)
        __buffer = io.BytesIO()
        __figure.savefig(__buffer, format="png", dpi=120, bbox_inches="tight")
        __pyodide_graphs.append("data:image/png;base64," + base64.b64encode(__buffer.getvalue()).decode("ascii"))
    plt.close("all")
except Exception as __graph_error:
    print("Graphique non rendu :", __graph_error)
`;
}

async function runPython(id: number, code: string) {
  const runtime = await loadPython();
  const stdout: string[] = [];
  const stderr: string[] = [];
  const graphMode = usesMatplotlib(code);
  const executableCode = graphMode ? withGraphCapture(code) : code;

  runtime.setStdout({ batched: (text) => stdout.push(text) });
  runtime.setStderr({ batched: (text) => stderr.push(text) });

  try {
    send({ type: "status", message: graphMode ? "Chargement des bibliothèques graphiques..." : "Exécution du script..." });
    await runtime.loadPackagesFromImports(executableCode);
    const rawResult = await runtime.runPythonAsync(executableCode);
    let images: string[] = [];

    if (graphMode) {
      const proxy = runtime.globals.get("__pyodide_graphs");
      const value = proxy?.toJs?.();
      if (Array.isArray(value)) {
        images = value.filter((item): item is string => typeof item === "string");
      }
      proxy?.destroy?.();
    }

    const result = rawResult === undefined || rawResult === null ? "" : String(rawResult);
    send({
      type: "result",
      id,
      stdout: stdout.join("\n"),
      stderr: stderr.join("\n"),
      images,
      result,
    });
  } catch (error) {
    send({
      type: "error",
      id,
      message: error instanceof Error ? error.message : String(error),
      stdout: stdout.join("\n"),
      stderr: stderr.join("\n"),
    });
  }
}

worker.onmessage = (event) => {
  const message = event.data;

  if (message.type === "load") {
    loadPython()
      .then(() => send({ type: "loaded", version: PYODIDE_VERSION }))
      .catch((error) => send({ type: "error", message: error instanceof Error ? error.message : String(error) }));
    return;
  }

  if (message.type === "run") {
    runPython(message.id, message.code);
  }
};
