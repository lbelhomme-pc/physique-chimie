import { useEffect, useMemo, useRef, useState } from "react";

type RunnerState = "idle" | "loading" | "ready" | "running" | "error";

type PythonExercise = {
  id: string;
  title: string;
  level: string;
  objective: string;
  instruction: string;
  hint: string;
  commonMistake: string;
  starterCode: string;
  successText: string;
  solution: string;
};

type WorkerMessage =
  | { type: "status"; message: string }
  | { type: "loaded"; version: string }
  | { type: "result"; id: number; stdout: string; stderr: string; images: string[]; result: string }
  | { type: "error"; id?: number; message: string; stdout?: string; stderr?: string };

const RUN_TIMEOUT_MS = 15000;

const EXERCISES: PythonExercise[] = [
  {
    id: "lecture-print",
    title: "Lire et modifier un affichage",
    level: "Niveau 1",
    objective: "Afficher une grandeur avec sa valeur et son unité.",
    instruction: "Complète le script pour afficher exactement une masse de 5.0 g avec une phrase lisible.",
    hint: "Utilise print avec du texte entre guillemets et la variable masse.",
    commonMistake: "Oublier les guillemets autour du texte provoque souvent une erreur NameError.",
    starterCode: `masse = 5.0

# Complète la ligne suivante.
print()`,
    successText: "La sortie doit contenir la valeur 5.0 et l'unité g.",
    solution: `masse = 5.0
print("Masse :", masse, "g")`,
  },
  {
    id: "vitesse",
    title: "Calculer une vitesse moyenne",
    level: "Niveau 1",
    objective: "Utiliser des variables pour calculer une vitesse.",
    instruction: "Calcule la vitesse moyenne pour une distance de 12.5 m parcourue en 2.0 s, puis affiche le résultat en m/s.",
    hint: "La relation à coder est vitesse = distance / duree.",
    commonMistake: "Python utilise le point décimal : écris 12.5 et non 12,5.",
    starterCode: `distance = 12.5
duree = 2.0

# Calcule puis affiche la vitesse.
`,
    successText: "La sortie doit contenir 6.25 et l'unité m/s.",
    solution: `distance = 12.5
duree = 2.0
vitesse = distance / duree
print("Vitesse :", vitesse, "m/s")`,
  },
  {
    id: "conversion",
    title: "Convertir des intensités",
    level: "Niveau 2",
    objective: "Parcourir une liste pour convertir des mA en A.",
    instruction: "Complète le script pour créer la liste I_A contenant les valeurs de I_mA converties en ampères, puis affiche-la.",
    hint: "Chaque valeur en mA doit être divisée par 1000.",
    commonMistake: "Dans la loi d'Ohm, utiliser des mA à la place des A donne une résistance mille fois trop petite.",
    starterCode: `I_mA = [0, 20, 40, 60, 80]
I_A = []

for valeur in I_mA:
    # Ajoute la valeur convertie dans I_A.
    pass

print(I_A)`,
    successText: "La sortie doit contenir notamment 0.02, 0.04, 0.06 et 0.08.",
    solution: `I_mA = [0, 20, 40, 60, 80]
I_A = []

for valeur in I_mA:
    I_A.append(valeur / 1000)

print(I_A)`,
  },
  {
    id: "moyenne",
    title: "Exploiter une liste de mesures",
    level: "Niveau 2",
    objective: "Calculer la moyenne d'une série de mesures.",
    instruction: "Calcule la moyenne des mesures de période et affiche-la avec l'unité s.",
    hint: "La moyenne se calcule avec sum(mesures) / len(mesures).",
    commonMistake: "len(mesures) donne le nombre de mesures, pas une durée.",
    starterCode: `mesures = [0.82, 0.85, 0.83, 0.84]

# Calcule la moyenne.
`,
    successText: "La sortie doit contenir 0.835 ou une valeur arrondie cohérente comme 0.84 s.",
    solution: `mesures = [0.82, 0.85, 0.83, 0.84]
moyenne = sum(mesures) / len(mesures)
print("Moyenne :", moyenne, "s")`,
  },
  {
    id: "fonction-vitesse",
    title: "Définir une fonction",
    level: "Niveau 2",
    objective: "Créer une fonction simple réutilisable.",
    instruction: "Complète la fonction vitesse(distance, duree), puis teste-la avec 12.5 m et 2.0 s.",
    hint: "Une fonction renvoie un résultat avec return.",
    commonMistake: "Les lignes dans la fonction doivent être indentées.",
    starterCode: `def vitesse(distance, duree):
    # À compléter.
    pass

resultat = vitesse(12.5, 2.0)
print(resultat, "m/s")`,
    successText: "La sortie doit contenir 6.25 m/s.",
    solution: `def vitesse(distance, duree):
    return distance / duree

resultat = vitesse(12.5, 2.0)
print(resultat, "m/s")`,
  },
  {
    id: "positions",
    title: "Tracer des positions",
    level: "Niveau 3",
    objective: "Produire un graphique scientifique avec titre, axes et unités.",
    instruction: "Complète le script matplotlib pour tracer les positions successives du mobile.",
    hint: "Utilise plt.plot(x, y, \"o\"), puis ajoute xlabel, ylabel, title, grid et show.",
    commonMistake: "Un graphique sans noms d'axes ni unités n'est pas exploitable en physique-chimie.",
    starterCode: `import matplotlib.pyplot as plt

x = [0, 1.2, 2.4, 3.6, 4.8]
y = [0, 0, 0, 0, 0]

# Trace les points et complète les axes.
`,
    successText: "Un graphique doit apparaître, avec les positions successives.",
    solution: `import matplotlib.pyplot as plt

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
    id: "dipole",
    title: "Caractéristique d'un dipôle",
    level: "Niveau 3",
    objective: "Tracer U en fonction de I et estimer une résistance.",
    instruction: "Convertis I_mA en A, trace U = f(I), puis affiche la résistance estimée avec R = U[-1] / I[-1].",
    hint: "Commence par créer I = [valeur / 1000 for valeur in I_mA].",
    commonMistake: "Si I reste en mA, l'unité du coefficient directeur n'est pas l'ohm.",
    starterCode: `import matplotlib.pyplot as plt

I_mA = [0, 20, 40, 60, 80]
U = [0.0, 1.9, 4.1, 6.0, 8.2]

# Convertis, trace et calcule R.
`,
    successText: "Un graphique doit apparaître et la résistance estimée doit être proche de 102.5 ohms.",
    solution: `import matplotlib.pyplot as plt

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
    title: "Construire un histogramme",
    level: "Niveau 3",
    objective: "Visualiser la dispersion d'une série de mesures.",
    instruction: "Trace un histogramme des mesures avec 4 classes et des axes légendés.",
    hint: "La fonction utile est plt.hist(mesures, bins=4, edgecolor=\"black\").",
    commonMistake: "Un histogramme représente une répartition ; ce n'est pas une courbe de position ou de tension.",
    starterCode: `import matplotlib.pyplot as plt

mesures = [0.82, 0.85, 0.83, 0.84, 0.82, 0.86, 0.83, 0.84]

# Trace l'histogramme.
`,
    successText: "Un histogramme doit apparaître avec la période en abscisse et l'effectif en ordonnée.",
    solution: `import matplotlib.pyplot as plt

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

function validateExercise(exerciseId: string, stdout: string, stderr: string, images: string[]) {
  if (stderr.trim()) {
    return { ok: false, message: "Le script produit un message d'erreur. Corrige-le avant de valider l'exercice." };
  }

  const normalized = stdout.replace(",", ".");

  switch (exerciseId) {
    case "lecture-print":
      return {
        ok: /5\.0/.test(normalized) && /\bg\b/i.test(stdout),
        message: /5\.0/.test(normalized) && /\bg\b/i.test(stdout)
          ? "La valeur et l'unité sont bien affichées."
          : "Il manque la valeur 5.0 ou l'unité g dans la sortie.",
      };
    case "vitesse":
    case "fonction-vitesse":
      return {
        ok: /6\.25/.test(normalized) && /m\/s/.test(stdout),
        message: /6\.25/.test(normalized) && /m\/s/.test(stdout)
          ? "Le calcul de vitesse est cohérent et l'unité est indiquée."
          : "La sortie doit contenir 6.25 et l'unité m/s.",
      };
    case "conversion":
      return {
        ok: ["0.02", "0.04", "0.06", "0.08"].every((value) => normalized.includes(value)),
        message: ["0.02", "0.04", "0.06", "0.08"].every((value) => normalized.includes(value))
          ? "Les intensités sont bien converties en ampères."
          : "Vérifie que chaque intensité en mA est divisée par 1000.",
      };
    case "moyenne":
      return {
        ok: /0\.835|0\.84/.test(normalized) && /\bs\b/i.test(stdout),
        message: /0\.835|0\.84/.test(normalized) && /\bs\b/i.test(stdout)
          ? "La moyenne est correcte et l'unité est indiquée."
          : "La moyenne attendue vaut 0.835 s, ou 0.84 s après arrondi.",
      };
    case "dipole":
      return {
        ok: images.length > 0 && /102\.5|102\.49|102\.50/.test(normalized),
        message: images.length > 0 && /102\.5|102\.49|102\.50/.test(normalized)
          ? "Le graphique est produit et la résistance est cohérente."
          : "Il faut produire un graphique et afficher une résistance proche de 102.5 ohms.",
      };
    case "positions":
    case "histogramme":
      return {
        ok: images.length > 0,
        message: images.length > 0
          ? "Le graphique est bien rendu par matplotlib."
          : "Le script doit produire un graphique avec plt.show().",
      };
    default:
      return { ok: false, message: "Exercice non reconnu." };
  }
}

export default function PythonExercisesRunner() {
  const [selectedId, setSelectedId] = useState(EXERCISES[0].id);
  const selectedExercise = useMemo(
    () => EXERCISES.find((exercise) => exercise.id === selectedId) ?? EXERCISES[0],
    [selectedId],
  );
  const [code, setCode] = useState(selectedExercise.starterCode);
  const [state, setState] = useState<RunnerState>("idle");
  const [statusMessage, setStatusMessage] = useState("Python n'est pas encore chargé.");
  const [stdout, setStdout] = useState("");
  const [stderr, setStderr] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [version, setVersion] = useState("");
  const [lastError, setLastError] = useState("");
  const [validation, setValidation] = useState<{ ok: boolean; message: string } | null>(null);
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
        setStatusMessage("Python est prêt. Tu peux tester ton exercice.");
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
        setValidation(validateExercise(selectedExercise.id, message.stdout || message.result, message.stderr, message.images));
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
            : "Une erreur de chargement Python s'est produite.",
        );
        setValidation({ ok: false, message: "Le code ne peut pas encore être validé car Python signale une erreur." });
      }
    };

    worker.onerror = (event) => {
      setLastError(event.message);
      setState("error");
      setStatusMessage("Le worker Python a rencontré une erreur.");
      setValidation(null);
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
    setValidation(null);
    setState("loading");
    setStatusMessage("Chargement de Python. Le premier lancement peut prendre quelques secondes.");
    ensureWorker().postMessage({ type: "load" });
  }

  function runCode() {
    if (state !== "ready") {
      setLastError("Charge Python avant de tester un exercice.");
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
    setValidation(null);
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

  function selectExercise(id: string) {
    const next = EXERCISES.find((exercise) => exercise.id === id) ?? EXERCISES[0];
    setSelectedId(next.id);
    setCode(next.starterCode);
    setStdout("");
    setStderr("");
    setImages([]);
    setLastError("");
    setValidation(null);
  }

  const isBusy = state === "loading" || state === "running";
  const canRun = state === "ready";

  return (
    <section className="python-exercises-runner" aria-labelledby="python-exercises-runner-title">
      <style>{`
        .python-exercises-runner {
          display: grid;
          gap: 1rem;
        }

        .python-exercises-runner .runner-panel {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-card);
          padding: 1rem;
        }

        .python-exercises-runner h3,
        .python-exercises-runner h4 {
          color: var(--text-primary);
          letter-spacing: 0;
          margin: 0;
        }

        .python-exercises-runner p,
        .python-exercises-runner li {
          color: var(--text-secondary);
          line-height: 1.65;
        }

        .python-exercises-runner .runner-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: minmax(230px, 310px) minmax(0, 1fr);
          align-items: start;
        }

        .python-exercises-runner label {
          color: var(--text-primary);
          display: grid;
          font-weight: 800;
          gap: 0.35rem;
        }

        .python-exercises-runner select,
        .python-exercises-runner textarea {
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font: inherit;
        }

        .python-exercises-runner select {
          padding: 0.65rem 0.75rem;
        }

        .python-exercises-runner textarea {
          font-family: Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 0.92rem;
          line-height: 1.55;
          min-height: 20rem;
          padding: 0.85rem;
          resize: vertical;
          width: 100%;
        }

        .python-exercises-runner button {
          background: var(--accent-primary);
          border: 1px solid var(--accent-primary);
          border-radius: var(--radius-pill);
          color: #fff;
          cursor: pointer;
          font: inherit;
          font-weight: 800;
          min-height: 2.5rem;
          padding: 0.55rem 0.95rem;
        }

        .python-exercises-runner button:hover:not(:disabled) {
          background: var(--accent-primary-hover);
          border-color: var(--accent-primary-hover);
        }

        .python-exercises-runner button:disabled {
          cursor: not-allowed;
          opacity: 0.55;
        }

        .python-exercises-runner .secondary-action {
          background: var(--bg-card);
          color: var(--text-primary);
        }

        .python-exercises-runner select:focus-visible,
        .python-exercises-runner textarea:focus-visible,
        .python-exercises-runner button:focus-visible,
        .python-exercises-runner summary:focus-visible,
        .python-exercises-runner .runner-output:focus-visible {
          outline: 3px solid var(--accent-primary);
          outline-offset: 2px;
        }

        .python-exercises-runner .exercise-meta {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          display: grid;
          gap: 0.55rem;
          margin-top: 0.85rem;
          padding: 0.85rem;
        }

        .python-exercises-runner .level-pill {
          align-self: start;
          background: var(--accent-primary-light);
          border-radius: var(--radius-pill);
          color: var(--accent-primary);
          display: inline-flex;
          font-size: 0.78rem;
          font-weight: 850;
          padding: 0.25rem 0.65rem;
          width: fit-content;
        }

        .python-exercises-runner details {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.75rem 0.85rem;
        }

        .python-exercises-runner summary {
          color: var(--text-primary);
          cursor: pointer;
          font-weight: 800;
        }

        .python-exercises-runner .runner-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.55rem;
          margin-top: 0.75rem;
        }

        .python-exercises-runner .status-box,
        .python-exercises-runner .validation-box {
          border-radius: var(--radius-sm);
          font-weight: 750;
          margin: 0;
          padding: 0.7rem 0.85rem;
        }

        .python-exercises-runner .status-box {
          background: var(--accent-primary-light);
          color: var(--text-primary);
        }

        .python-exercises-runner .validation-box.success {
          background: var(--accent-success-light);
          border: 1px solid var(--accent-success);
          color: var(--text-primary);
        }

        .python-exercises-runner .validation-box.warning {
          background: var(--accent-warning-light);
          border: 1px solid var(--accent-warning);
          color: var(--text-primary);
        }

        .python-exercises-runner .output-grid {
          display: grid;
          gap: 0.8rem;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .python-exercises-runner .runner-output,
        .python-exercises-runner .runner-error pre,
        .python-exercises-runner .solution-code {
          background: #0f172a;
          border-radius: var(--radius-sm);
          color: #e5e7eb;
          font-family: Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 0.9rem;
          line-height: 1.55;
          margin: 0;
          min-height: 7rem;
          overflow: auto;
          padding: 0.85rem;
          white-space: pre-wrap;
        }

        .python-exercises-runner .runner-stderr {
          color: #fecaca;
        }

        .python-exercises-runner .runner-error {
          background: var(--accent-danger-light);
          border: 1px solid var(--accent-danger);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          padding: 0.85rem;
        }

        .python-exercises-runner .graph-zone {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          margin-top: 0.85rem;
          overflow-x: auto;
          padding: 0.85rem;
        }

        .python-exercises-runner .graph-zone img {
          background: #fff;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          display: block;
          height: auto;
          margin: 0.6rem auto 0;
          max-width: 100%;
        }

        @media (max-width: 860px) {
          .python-exercises-runner .runner-grid,
          .python-exercises-runner .output-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 560px) {
          .python-exercises-runner .runner-actions {
            align-items: stretch;
            flex-direction: column;
          }

          .python-exercises-runner button {
            width: 100%;
          }
        }
      `}</style>

      <div className="runner-panel">
        <h3 id="python-exercises-runner-title">Exercices Python interactifs</h3>
        <p>
          Charge Python, complète le code, puis exécute-le. La validation vérifie le résultat attendu
          sans remplacer la correction : l'objectif reste d'expliquer scientifiquement ce que le script produit.
        </p>
      </div>

      <div className="runner-grid">
        <aside className="runner-panel" aria-labelledby="exercise-choice-title">
          <h4 id="exercise-choice-title">Choisir un exercice</h4>
          <label htmlFor="python-exercise">
            Exercice
            <select id="python-exercise" value={selectedId} onChange={(event) => selectExercise(event.target.value)}>
              {EXERCISES.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.level} - {exercise.title}
                </option>
              ))}
            </select>
          </label>

          <div className="exercise-meta">
            <span className="level-pill">{selectedExercise.level}</span>
            <strong>{selectedExercise.objective}</strong>
            <p>{selectedExercise.instruction}</p>
            <details>
              <summary>Indice</summary>
              <p>{selectedExercise.hint}</p>
            </details>
            <details>
              <summary>Erreur fréquente</summary>
              <p>{selectedExercise.commonMistake}</p>
            </details>
            <details>
              <summary>Correction</summary>
              <p>{selectedExercise.successText}</p>
              <pre className="solution-code"><code>{selectedExercise.solution}</code></pre>
            </details>
          </div>
        </aside>

        <div className="runner-panel">
          <label htmlFor="python-exercise-code">
            Code Python
            <textarea
              id="python-exercise-code"
              spellCheck={false}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              rows={16}
            />
          </label>

          <div className="runner-actions" aria-label="Actions des exercices Python">
            <button type="button" onClick={loadPython} disabled={isBusy || state === "ready"}>
              {state === "ready" ? "Python chargé" : "Charger Python"}
            </button>
            <button type="button" onClick={runCode} disabled={!canRun}>
              Tester l'exercice
            </button>
            <button type="button" onClick={() => interrupt()} disabled={state !== "running"}>
              Interrompre
            </button>
            <button type="button" className="secondary-action" onClick={() => selectExercise(selectedExercise.id)}>
              Réinitialiser
            </button>
            <button
              type="button"
              className="secondary-action"
              onClick={() => {
                setStdout("");
                setStderr("");
                setImages([]);
                setLastError("");
                setValidation(null);
              }}
            >
              Effacer la sortie
            </button>
          </div>
        </div>
      </div>

      <section className="runner-panel" aria-labelledby="runner-results-title">
        <h4 id="runner-results-title">Résultat de l'exécution</h4>
        <p className="status-box" role="status" aria-live="polite">
          {statusMessage}
          {version ? ` Version Pyodide : ${version}.` : ""}
        </p>

        {validation && (
          <p className={`validation-box ${validation.ok ? "success" : "warning"}`} role="status">
            {validation.ok ? "Validation réussie. " : "À corriger. "}
            {validation.message}
          </p>
        )}

        {lastError && (
          <div className="runner-error" role="alert">
            <strong>Erreur Python</strong>
            <pre>{lastError}</pre>
          </div>
        )}

        <div className="output-grid">
          <div>
            <h4>Sortie texte</h4>
            <pre className="runner-output" tabIndex={0} aria-label="Sortie texte Python">
              {stdout || "La sortie du programme apparaîtra ici."}
            </pre>
          </div>
          <div>
            <h4>Erreurs et avertissements</h4>
            <pre className="runner-output runner-stderr" tabIndex={0} aria-label="Erreurs Python">
              {stderr || "Aucune erreur standard pour l'instant."}
            </pre>
          </div>
        </div>

        {images.length > 0 && (
          <div className="graph-zone" aria-label="Graphiques produits par matplotlib">
            <h4>Graphique</h4>
            {images.map((src, index) => (
              <img key={src} src={src} alt={`Graphique matplotlib produit par l'exercice ${index + 1}`} />
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
