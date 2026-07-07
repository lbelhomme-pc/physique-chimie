import { useMemo, useState } from "react";

type ReactionPreset = {
  id: string;
  label: string;
  equation: string;
  titrated: string;
  titrant: string;
  nuTitrated: number;
  nuTitrant: number;
  cTitrated: number;
  cTitrant: number;
  sampleVolumeMl: number;
  beforeColor: string;
  nearColor: string;
  afterColor: string;
  endpoint: string;
  note: string;
};

const PRESETS: ReactionPreset[] = [
  {
    id: "fe-permanganate",
    label: "Ions fer(II) titrés par permanganate",
    equation:
      "MnO4−(aq) + 5 Fe2+(aq) + 8 H+(aq) → Mn2+(aq) + 5 Fe3+(aq) + 4 H2O(l)",
    titrated: "Fe2+(aq)",
    titrant: "MnO4−(aq)",
    nuTitrated: 5,
    nuTitrant: 1,
    cTitrated: 0.124,
    cTitrant: 0.0200,
    sampleVolumeMl: 10.0,
    beforeColor: "#fef9c3",
    nearColor: "#fde68a",
    afterColor: "#c084fc",
    endpoint: "teinte violette très pâle persistante",
    note: "Avant l'équivalence, tout ion permanganate ajouté est consommé. Après l'équivalence, MnO4− reste en excès et colore le milieu.",
  },
  {
    id: "iodine-thiosulfate",
    label: "Diiode titré par thiosulfate",
    equation: "I2(aq) + 2 S2O3^2−(aq) → 2 I−(aq) + S4O6^2−(aq)",
    titrated: "I2(aq)",
    titrant: "S2O3^2−(aq)",
    nuTitrated: 1,
    nuTitrant: 2,
    cTitrated: 0.0100,
    cTitrant: 0.0100,
    sampleVolumeMl: 10.0,
    beforeColor: "#dbeafe",
    nearColor: "#eff6ff",
    afterColor: "#f8fafc",
    endpoint: "disparition durable de la couleur bleu-noir avec amidon",
    note: "La couleur liée au diiode disparaît quand I2 est consommé. On ajoute l'amidon près de l'équivalence.",
  },
  {
    id: "ascorbic-iodine",
    label: "Vitamine C titrée par diiode",
    equation: "C6H8O6(aq) + I2(aq) → C6H6O6(aq) + 2 I−(aq) + 2 H+(aq)",
    titrated: "C6H8O6(aq)",
    titrant: "I2(aq)",
    nuTitrated: 1,
    nuTitrant: 1,
    cTitrated: 0.0060,
    cTitrant: 0.0050,
    sampleVolumeMl: 10.0,
    beforeColor: "#f8fafc",
    nearColor: "#fef3c7",
    afterColor: "#bfdbfe",
    endpoint: "coloration bleue persistante en présence d'amidon",
    note: "Avant l'équivalence, le diiode ajouté est consommé par l'acide ascorbique. Après l'équivalence, un léger excès de diiode colore le milieu.",
  },
];

const hints = [
  "Commence par écrire la relation n(titré)/ν(titré) = n(titrant)/ν(titrant) à l'équivalence.",
  "Avant l'équivalence, l'espèce titrante ajoutée est limitante : elle disparaît au fur et à mesure.",
  "Après l'équivalence, l'espèce titrée est totalement consommée : le titrant devient en excès.",
  "Les volumes peuvent rester en mL dans le rapport si les deux volumes sont exprimés dans la même unité, mais en calcul de quantité de matière on convertit en L.",
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function format(value: number, digits = 3) {
  return value.toLocaleString("fr-FR", {
    maximumFractionDigits: digits,
    minimumFractionDigits: value < 10 ? Math.min(1, digits) : 0,
  });
}

export default function ColorimetricTitrationSimulator() {
  const [presetId, setPresetId] = useState(PRESETS[0].id);
  const [cTitrant, setCTitrant] = useState(PRESETS[0].cTitrant);
  const [sampleVolumeMl, setSampleVolumeMl] = useState(PRESETS[0].sampleVolumeMl);
  const [addedVolumeMl, setAddedVolumeMl] = useState(0);
  const [showEquivalent, setShowEquivalent] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);

  const preset = PRESETS.find((item) => item.id === presetId) ?? PRESETS[0];

  function selectPreset(id: string) {
    const next = PRESETS.find((item) => item.id === id) ?? PRESETS[0];
    setPresetId(next.id);
    setCTitrant(next.cTitrant);
    setSampleVolumeMl(next.sampleVolumeMl);
    setAddedVolumeMl(0);
    setShowEquivalent(false);
    setHintIndex(0);
  }

  const equivalentVolumeMl =
    (preset.nuTitrant * preset.cTitrated * sampleVolumeMl) /
    (preset.nuTitrated * cTitrant);

  const maxSlider = Math.max(30, Math.ceil(equivalentVolumeMl * 1.6));
  const safeAdded = clamp(addedVolumeMl, 0, maxSlider);

  const state = useMemo(() => {
    const ratio = equivalentVolumeMl === 0 ? 0 : safeAdded / equivalentVolumeMl;
    if (ratio < 0.96) return "before";
    if (ratio <= 1.04) return "near";
    return "after";
  }, [equivalentVolumeMl, safeAdded]);

  const nTitrated = preset.cTitrated * (sampleVolumeMl / 1000);
  const nTitrantAdded = cTitrant * (safeAdded / 1000);
  const quotientTitrated = nTitrated / preset.nuTitrated;
  const quotientTitrant = nTitrantAdded / preset.nuTitrant;
  const limiting =
    state === "near"
      ? "aucun réactif n'est en excès sensible"
      : quotientTitrant < quotientTitrated
        ? `${preset.titrant} est limitant`
        : `${preset.titrated} est limitant, le titrant est en excès`;
  const color =
    state === "before" ? preset.beforeColor : state === "near" ? preset.nearColor : preset.afterColor;
  const status =
    state === "before"
      ? "Avant l'équivalence"
      : state === "near"
        ? "Zone de l'équivalence"
        : "Après l'équivalence";

  function addVolume(delta: number) {
    setAddedVolumeMl((value) => clamp(Number((value + delta).toFixed(2)), 0, maxSlider));
  }

  return (
    <section
      className="methode-box"
      aria-labelledby="titration-sim-title"
      style={{ display: "grid", gap: "1rem" }}
    >
      <div>
        <h3 id="titration-sim-title">Simulateur de titrage colorimétrique</h3>
        <p>
          Modifie le volume versé pour repérer le changement de réactif limitant. Le simulateur ne
          remplace pas le calcul : il sert à visualiser avant, à et après l'équivalence.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "0.75rem",
        }}
      >
        <label>
          Réaction support
          <select value={preset.id} onChange={(event) => selectPreset(event.target.value)}>
            {PRESETS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          c(titrant) en mol·L-1
          <input
            type="number"
            min="0.001"
            max="0.200"
            step="0.001"
            value={cTitrant}
            onChange={(event) => setCTitrant(clamp(Number(event.target.value) || 0.001, 0.001, 0.2))}
          />
        </label>
        <label>
          V(solution titrée) en mL
          <input
            type="number"
            min="1"
            max="50"
            step="0.1"
            value={sampleVolumeMl}
            onChange={(event) =>
              setSampleVolumeMl(clamp(Number(event.target.value) || 1, 1, 50))
            }
          />
        </label>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        <figure
          style={{
            margin: 0,
            padding: "1rem",
            border: "1px solid var(--border-color)",
            borderRadius: "12px",
            background: "var(--bg-card)",
          }}
        >
          <svg
            viewBox="0 0 300 260"
            role="img"
            aria-labelledby="sim-titrage-title sim-titrage-desc"
            style={{ width: "100%", height: "auto", display: "block" }}
          >
            <title id="sim-titrage-title">Simulation d'un titrage colorimétrique</title>
            <desc id="sim-titrage-desc">
              Une burette verse la solution titrante dans un erlenmeyer. La couleur indique avant,
              proche ou après l'équivalence, avec une légende textuelle associée.
            </desc>
            <rect x="128" y="18" width="38" height="122" rx="8" fill="#ffffff" stroke="#334155" strokeWidth="3" />
            <line x1="138" y1="36" x2="160" y2="36" stroke="#94a3b8" />
            <line x1="138" y1="62" x2="160" y2="62" stroke="#94a3b8" />
            <line x1="138" y1="88" x2="160" y2="88" stroke="#94a3b8" />
            <line x1="138" y1="114" x2="160" y2="114" stroke="#94a3b8" />
            <rect x="141" y="30" width="12" height="92" rx="4" fill="#c084fc" opacity="0.75" />
            <path d="M147 141 C147 154 147 160 147 172" stroke="#7c3aed" strokeWidth="4" strokeLinecap="round" />
            <circle cx="147" cy="182" r="5" fill="#7c3aed" opacity="0.75" />
            <path d="M76 218 L112 124 H188 L224 218 Z" fill="#ffffff" stroke="#334155" strokeWidth="3" />
            <path d="M92 210 L119 150 H181 L208 210 Z" fill={color} stroke="#94a3b8" />
            <ellipse cx="150" cy="210" rx="58" ry="10" fill={color} stroke="#94a3b8" />
            <text x="150" y="246" textAnchor="middle" fontSize="13" fill="#334155">
              {status}
            </text>
          </svg>
          <figcaption style={{ fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "center" }}>
            Couleur schématique : l'information importante est aussi écrite dans l'état du titrage.
          </figcaption>
        </figure>

        <div style={{ display: "grid", gap: "0.75rem" }}>
          <p>
            <strong>Équation support :</strong> {preset.equation}
          </p>
          <label>
            Volume de solution titrante versé : {format(safeAdded, 1)} mL
            <input
              type="range"
              min="0"
              max={maxSlider}
              step="0.1"
              value={safeAdded}
              onChange={(event) => setAddedVolumeMl(Number(event.target.value))}
              aria-label="Volume de solution titrante versé"
            />
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <button type="button" onClick={() => addVolume(-1)}>
              -1,0 mL
            </button>
            <button type="button" onClick={() => addVolume(0.1)}>
              +0,1 mL
            </button>
            <button type="button" onClick={() => addVolume(1)}>
              +1,0 mL
            </button>
            <button type="button" onClick={() => setAddedVolumeMl(0)}>
              Réinitialiser
            </button>
          </div>
          <div
            role="status"
            aria-live="polite"
            style={{
              padding: "0.75rem",
              border: "1px solid var(--border-color)",
              borderRadius: "10px",
              background: "var(--bg-secondary)",
            }}
          >
            <p>
              <strong>{status} :</strong> {limiting}.
            </p>
            <p>
              {preset.note} Le repère attendu est : <strong>{preset.endpoint}</strong>.
            </p>
            {showEquivalent ? (
              <p>
                Volume équivalent calculé : <strong>{format(equivalentVolumeMl, 2)} mL</strong>.
                Relation utilisée : n(titré)/{preset.nuTitrated} = n(titrant)/{preset.nuTitrant}.
              </p>
            ) : (
              <p>
                Volume équivalent masqué : établis d'abord la relation stœchiométrique, puis affiche
                la vérification.
              </p>
            )}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <button type="button" onClick={() => setShowEquivalent((value) => !value)}>
              {showEquivalent ? "Masquer V_E" : "Afficher V_E"}
            </button>
            <button type="button" onClick={() => setHintIndex((value) => (value + 1) % hints.length)}>
              Indice progressif
            </button>
          </div>
          <p className="sr-only" aria-live="polite">
            {status}. {limiting}. Volume versé {format(safeAdded, 1)} millilitres.
          </p>
          <p>
            <strong>Indice :</strong> {hints[hintIndex]}
          </p>
        </div>
      </div>
    </section>
  );
}
