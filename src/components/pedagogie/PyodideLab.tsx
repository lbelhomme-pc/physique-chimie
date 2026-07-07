import { useEffect, useMemo, useRef, useState } from "react";

type LabState = "idle" | "loading" | "ready" | "running" | "error";

type Example = {
  id: string;
  title: string;
  objective: string;
  observe: string;
  commonMistake: string;
  code: string;
};

type WorkerMessage =
  | { type: "status"; message: string }
  | { type: "loaded"; version: string }
  | { type: "result"; id: number; stdout: string; stderr: string; images: string[]; result: string }
  | { type: "error"; id?: number; message: string; stdout?: string; stderr?: string };

const RUN_TIMEOUT_MS = 15000;

const EXAMPLES: Example[] = [
  {
    id: "moyenne",
    title: "Moyenne de mesures",
    objective: "Calculer une moyenne sur une série de mesures de période.",
    observe: "Compare la moyenne avec les valeurs extrêmes et vérifie l'unité.",
    commonMistake: "En Python, écris 0.82 et non 0,82.",
    code: `mesures = [0.82, 0.85, 0.83, 0.84, 0.82, 0.86]
moyenne = sum(mesures) / len(mesures)

print("Nombre de mesures :", len(mesures))
print("Moyenne :", moyenne, "s")`,
  },
  {
    id: "positions",
    title: "Positions successives",
    objective: "Tracer les positions successives d'un mobile modélisé par un point.",
    observe: "Les axes indiquent les grandeurs et les unités.",
    commonMistake: "N'oublie pas plt.axis(\"equal\") quand tu veux préserver les proportions.",
    code: `import matplotlib.pyplot as plt

x = [0, 1.2, 2.4, 3.6, 4.8]
y = [0, 0, 0, 0, 0]

plt.plot(x, y, "o")
plt.xlabel("x (m)")
plt.ylabel("y (m)")
plt.title("Positions successives")
plt.axis("equal")
plt.grid()
plt.show()`,
  },
  {
    id: "vecteurs",
    title: "Vecteurs vitesse",
    objective: "Calculer et représenter des vecteurs vitesse approchés.",
    observe: "La longueur des flèches est réduite pour rendre le schéma lisible.",
    commonMistake: "Le facteur 0.2 modifie seulement l'affichage, pas le calcul de la vitesse.",
    code: `import matplotlib.pyplot as plt

x = [0, 1, 2, 3, 4]
y = [0, 0.5, 2, 4.5, 8]
dt = 1.0

vx = []
vy = []

for i in range(len(x) - 1):
    vx.append((x[i + 1] - x[i]) / dt)
    vy.append((y[i + 1] - y[i]) / dt)

plt.plot(x, y, "o")

for i in range(len(vx)):
    plt.arrow(
        x[i], y[i],
        0.2 * vx[i], 0.2 * vy[i],
        head_width=0.12,
        length_includes_head=True
    )

plt.xlabel("x (m)")
plt.ylabel("y (m)")
plt.title("Vecteurs vitesse approchés")
plt.axis("equal")
plt.grid()
plt.show()`,
  },
  {
    id: "dipole",
    title: "Caractéristique d'un dipôle",
    objective: "Tracer U en fonction de I et estimer une résistance.",
    observe: "Les intensités en mA sont converties en A avant le calcul.",
    commonMistake: "Oublier de convertir les mA en A donne une résistance fausse.",
    code: `import matplotlib.pyplot as plt

I_mA = [0, 20, 40, 60, 80]
U = [0.0, 1.9, 4.1, 6.0, 8.2]

I = [valeur / 1000 for valeur in I_mA]

plt.plot(I, U, "o")
plt.xlabel("I (A)")
plt.ylabel("U (V)")
plt.title("Caractéristique tension-intensité")
plt.grid()
plt.show()

R = U[-1] / I[-1]
print("Résistance estimée :", R, "ohms")`,
  },
  {
    id: "histogramme",
    title: "Histogramme de mesures",
    objective: "Visualiser la dispersion d'une série de mesures.",
    observe: "Change le nombre de classes pour voir l'effet sur la représentation.",
    commonMistake: "Un histogramme montre une répartition, il ne donne pas automatiquement la valeur vraie.",
    code: `import matplotlib.pyplot as plt

mesures = [0.82, 0.85, 0.83, 0.84, 0.82, 0.86, 0.83, 0.84]

plt.hist(mesures, bins=4, edgecolor="black")
plt.xlabel("Période T (s)")
plt.ylabel("Effectif")
plt.title("Répartition des mesures")
plt.grid(axis="y")
plt.show()`,
  },
];

function createWorker() {
  return new Worker(new URL("../../scripts/pyodide-worker.ts", import.meta.url), { type: "module" });
}

export default function PyodideLab() {
  const [selectedId, setSelectedId] = useState(EXAMPLES[0].id);
  const selectedExample = useMemo(
    () => EXAMPLES.find((example) => example.id === selectedId) ?? EXAMPLES[0],
    [selectedId],
  );
  const [code, setCode] = useState(selectedExample.code);
  const [state, setState] = useState<LabState>("idle");
  const [statusMessage, setStatusMessage] = useState("Python n'est pas encore chargé.");
  const [stdout, setStdout] = useState("");
  const [stderr, setStderr] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [version, setVersion] = useState("");
  const [lastError, setLastError] = useState("");
  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  function configureWorker(worker: Worker) {
    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const message = event.data;

      if (message.type === "status") {
        setStatusMessage(message.message);
        return;
      }

      if (message.type === "loaded") {
        setVersion(message.version);
        setState("ready");
        setStatusMessage("Python est prêt. Tu peux lancer un script.");
        return;
      }

      if (message.type === "result") {
        if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
        setStdout(message.stdout || message.result);
        setStderr(message.stderr);
        setImages(message.images);
        setLastError("");
        setState("ready");
        setStatusMessage("Script terminé.");
        return;
      }

      if (message.type === "error") {
        if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
        setStdout(message.stdout ?? "");
        setStderr(message.stderr ?? "");
        setImages([]);
        setLastError(message.message);
        setState(version ? "ready" : "error");
        setStatusMessage(
          version
            ? "Le script contient une erreur Python. Corrige le code puis relance."
            : "Une erreur de chargement Python s'est produite."
        );
      }
    };

    worker.onerror = (event) => {
      setLastError(event.message);
      setState("error");
      setStatusMessage("Le worker Python a rencontré une erreur.");
    };
  }

  function ensureWorker() {
    if (!workerRef.current) {
      workerRef.current = createWorker();
      configureWorker(workerRef.current);
    }
    return workerRef.current;
  }

  function loadPython() {
    setLastError("");
    setState("loading");
    setStatusMessage("Chargement de Python. Le premier lancement peut prendre quelques secondes.");
    ensureWorker().postMessage({ type: "load" });
  }

  function runCode() {
    if (state !== "ready") {
      setLastError("Charge Python avant d'exécuter un script.");
      setState("error");
      return;
    }

    const worker = ensureWorker();
    const id = requestIdRef.current + 1;
    requestIdRef.current = id;
    setStdout("");
    setStderr("");
    setImages([]);
    setLastError("");
    setState("running");
    setStatusMessage("Exécution en cours...");
    worker.postMessage({ type: "run", id, code });

    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      interrupt("Le script a été interrompu après 15 s. Vérifie qu'il ne contient pas de boucle infinie.");
    }, RUN_TIMEOUT_MS);
  }

  function interrupt(message = "Exécution interrompue. Recharge Python pour relancer un script.") {
    workerRef.current?.terminate();
    workerRef.current = null;
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setState("idle");
    setStatusMessage(message);
  }

  function resetExample() {
    setCode(selectedExample.code);
    setStdout("");
    setStderr("");
    setImages([]);
    setLastError("");
  }

  function selectExample(id: string) {
    const next = EXAMPLES.find((example) => example.id === id) ?? EXAMPLES[0];
    setSelectedId(next.id);
    setCode(next.code);
    setStdout("");
    setStderr("");
    setImages([]);
    setLastError("");
  }

  const isBusy = state === "loading" || state === "running";
  const canRun = state === "ready";

  return (
    <section className="python-lab" aria-labelledby="python-lab-title">
      <div className="lab-panel lab-intro">
        <p className="lab-eyebrow">Pyodide dans le navigateur</p>
        <h2 id="python-lab-title">Console Python scolaire</h2>
        <p>
          Le code est exécuté dans ton navigateur, pas sur un serveur. Garde des scripts courts,
          évite les boucles infinies et pense toujours aux unités.
        </p>
      </div>

      <div className="lab-grid">
        <aside className="lab-panel lab-examples" aria-labelledby="examples-title">
          <h3 id="examples-title">Exemples</h3>
          <label htmlFor="python-example">Choisir un script de départ</label>
          <select id="python-example" value={selectedId} onChange={(event) => selectExample(event.target.value)}>
            {EXAMPLES.map((example) => (
              <option key={example.id} value={example.id}>
                {example.title}
              </option>
            ))}
          </select>

          <div className="example-note">
            <strong>Objectif</strong>
            <p>{selectedExample.objective}</p>
            <strong>À observer</strong>
            <p>{selectedExample.observe}</p>
            <strong>Erreur fréquente</strong>
            <p>{selectedExample.commonMistake}</p>
          </div>
        </aside>

        <div className="lab-panel lab-code">
          <label htmlFor="python-code">Code Python</label>
          <textarea
            id="python-code"
            spellCheck={false}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            rows={18}
          />

          <div className="lab-actions" aria-label="Actions Python">
            <button type="button" onClick={loadPython} disabled={isBusy || state === "ready"}>
              {state === "ready" ? "Python chargé" : "Charger Python"}
            </button>
            <button type="button" onClick={runCode} disabled={!canRun || state === "running"}>
              Exécuter
            </button>
            <button type="button" onClick={() => interrupt()} disabled={state !== "running"}>
              Interrompre
            </button>
            <button type="button" onClick={resetExample}>
              Réinitialiser
            </button>
            <button
              type="button"
              onClick={() => {
                setStdout("");
                setStderr("");
                setImages([]);
                setLastError("");
              }}
            >
              Effacer la sortie
            </button>
          </div>
        </div>
      </div>

      <section className="lab-panel lab-results" aria-labelledby="results-title">
        <div className="results-header">
          <h3 id="results-title">Résultats</h3>
          <p role="status" aria-live="polite">
            {statusMessage}
            {version ? ` Version Pyodide : ${version}.` : ""}
          </p>
        </div>

        {lastError && (
          <div className="lab-error" role="alert">
            <strong>Erreur</strong>
            <pre>{lastError}</pre>
          </div>
        )}

        <div className="output-grid">
          <div>
            <h4>Sortie texte</h4>
            <pre className="lab-output" tabIndex={0} aria-label="Sortie texte Python">
              {stdout || "La sortie du programme apparaîtra ici."}
            </pre>
          </div>
          <div>
            <h4>Erreurs et avertissements</h4>
            <pre className="lab-output lab-stderr" tabIndex={0} aria-label="Erreurs Python">
              {stderr || "Aucune erreur standard pour l'instant."}
            </pre>
          </div>
        </div>

        {images.length > 0 && (
          <div className="graph-zone" aria-label="Graphiques produits par matplotlib">
            <h4>Graphique</h4>
            {images.map((src, index) => (
              <img key={src} src={src} alt={`Graphique matplotlib produit par le script ${index + 1}`} />
            ))}
          </div>
        )}
      </section>

      <section className="lab-panel lab-help" aria-labelledby="help-title">
        <h3 id="help-title">Aide rapide</h3>
        <details>
          <summary>Pourquoi le premier chargement est long ?</summary>
          <p>Pyodide télécharge Python et WebAssembly. Le navigateur met ensuite ces fichiers en cache.</p>
        </details>
        <details>
          <summary>Pourquoi écrire 0.82 et pas 0,82 ?</summary>
          <p>Python utilise le point comme séparateur décimal. La virgule sert à séparer des éléments.</p>
        </details>
        <details>
          <summary>Que faire si une boucle bloque ?</summary>
          <p>Utilise le bouton Interrompre. Il arrête le worker Python et il faudra recharger Python.</p>
        </details>
      </section>
    </section>
  );
}
