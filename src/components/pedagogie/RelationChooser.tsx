import { useMemo, useState } from "react";

type Target = "n" | "m" | "c" | "Cm" | "mixture";

const KNOWN = [
  { id: "n", label: "quantité de matière n" },
  { id: "m", label: "masse m" },
  { id: "M", label: "masse molaire M" },
  { id: "Vgaz", label: "volume d'un gaz Vgaz" },
  { id: "Vm", label: "volume molaire Vm" },
  { id: "c", label: "concentration c" },
  { id: "Cm", label: "concentration en masse Cm" },
  { id: "Vsol", label: "volume de solution Vsolution" },
  { id: "N", label: "nombre d'entites N" },
  { id: "NA", label: "constante d'Avogadro NA" },
  { id: "composition", label: "composition d'un melange" },
];

const TARGETS: { id: Target; label: string }[] = [
  { id: "n", label: "quantite de matiere n" },
  { id: "m", label: "masse m" },
  { id: "c", label: "concentration c" },
  { id: "Cm", label: "concentration en masse Cm" },
  { id: "mixture", label: "quantites dans un melange" },
];

const V = {
  bg: "var(--ui5-surface)",
  bgSec: "var(--ui5-surface-soft)",
  bgTer: "var(--ui5-surface-soft)",
  text: "var(--ui5-text)",
  textSec: "var(--ui5-text-2)",
  textMut: "var(--ui5-text-3)",
  border: "var(--ui5-border)",
  primary: "var(--ui5-action)",
  primaryLt: "var(--ui5-action-soft)",
  success: "var(--accent-success)",
  successLt: "var(--accent-success-light)",
  warning: "var(--accent-warning)",
  warningLt: "var(--accent-warning-light)",
  danger: "var(--accent-danger)",
  dangerLt: "var(--accent-danger-light)",
};

function has(all: Set<string>, ...ids: string[]) {
  return ids.every((id) => all.has(id));
}

function relationFor(known: Set<string>, target: Target) {
  if (target === "n") {
    if (has(known, "m", "M")) return {
      title: "Relation adaptee : n = m / M",
      detail: "Utilise la masse de l'espece et sa masse molaire. La masse doit etre compatible avec l'unite de M.",
      units: "m en g et M en g.mol-1 donnent n en mol.",
      level: "success" as const,
    };
    if (has(known, "Vgaz", "Vm")) return {
      title: "Relation adaptee : n = Vgaz / Vm",
      detail: "Cette relation concerne un gaz et seulement dans les conditions de temperature et de pression indiquees.",
      units: "Vgaz et Vm doivent etre exprimes avec la meme unite de volume.",
      level: "success" as const,
    };
    if (has(known, "c", "Vsol")) return {
      title: "Relation adaptee : n = c x Vsolution",
      detail: "Le volume est le volume final de solution, pas le volume de solvant verse au depart.",
      units: "Si c est en mol.L-1, Vsolution doit etre en L.",
      level: "success" as const,
    };
    if (has(known, "N", "NA")) return {
      title: "Relation adaptee : n = N / NA",
      detail: "On passe du nombre d'entites a la quantite de matiere avec la constante d'Avogadro.",
      units: "N est sans unite ; NA s'exprime en mol-1.",
      level: "success" as const,
    };
    if (has(known, "Cm", "M", "Vsol")) return {
      title: "Deux etapes utiles : c = Cm / M puis n = c x Vsolution",
      detail: "Tu peux d'abord convertir la concentration en masse en concentration en quantite de matiere.",
      units: "Cm en g.L-1 et M en g.mol-1 donnent c en mol.L-1.",
      level: "success" as const,
    };
    if (has(known, "composition", "m", "M")) return {
      title: "Commence par la composition du melange",
      detail: "Determine la masse de l'espece etudiee dans le melange, puis applique n = m / M.",
      units: "Un pourcentage massique s'applique a une masse totale.",
      level: "success" as const,
    };
  }

  if (target === "m") {
    if (has(known, "n", "M")) return {
      title: "Relation adaptee : m = n x M",
      detail: "La masse d'un echantillon est proportionnelle a sa quantite de matiere.",
      units: "n en mol et M en g.mol-1 donnent m en g.",
      level: "success" as const,
    };
    if (has(known, "Cm", "Vsol")) return {
      title: "Relation adaptee : m = Cm x Vsolution",
      detail: "Cette relation utilise une concentration en masse.",
      units: "Si Cm est en g.L-1, Vsolution doit etre en L.",
      level: "success" as const,
    };
  }

  if (target === "c") {
    if (has(known, "n", "Vsol")) return {
      title: "Relation adaptee : c = n / Vsolution",
      detail: "La concentration en quantite de matiere est une quantite de matiere rapportee au volume de solution.",
      units: "n en mol et Vsolution en L donnent c en mol.L-1.",
      level: "success" as const,
    };
    if (has(known, "Cm", "M")) return {
      title: "Relation adaptee : c = Cm / M",
      detail: "Cette relation relie concentration en masse et concentration en quantite de matiere.",
      units: "Cm en g.L-1 et M en g.mol-1 donnent c en mol.L-1.",
      level: "success" as const,
    };
  }

  if (target === "Cm") {
    if (has(known, "c", "M")) return {
      title: "Relation adaptee : Cm = c x M",
      detail: "On retrouve la masse de solute par litre de solution.",
      units: "c en mol.L-1 et M en g.mol-1 donnent Cm en g.L-1.",
      level: "success" as const,
    };
    if (has(known, "m", "Vsol")) return {
      title: "Relation adaptee : Cm = m / Vsolution",
      detail: "C'est la definition de la concentration en masse.",
      units: "m en g et Vsolution en L donnent Cm en g.L-1.",
      level: "success" as const,
    };
  }

  if (target === "mixture" && has(known, "composition")) {
    return {
      title: "Procedure adaptee : isoler chaque espece, puis calculer n",
      detail: "Utilise le pourcentage massique ou volumique pour trouver m_i ou V_i, puis convertis en quantite de matiere.",
      units: "Pour un pourcentage volumique, il faut souvent une masse volumique avant d'utiliser n = m / M.",
      level: "success" as const,
    };
  }

  return {
    title: "Donnees insuffisantes ou cible incompatible",
    detail: "Ajoute une grandeur connue, ou change la grandeur recherchee. Commence toujours par identifier la nature du systeme : corps pur, gaz, solution ou melange.",
    units: "Le choix de la relation depend autant des donnees que de l'etat physique.",
    level: "warning" as const,
  };
}

export default function RelationChooser() {
  const [knownIds, setKnownIds] = useState<string[]>(["m", "M"]);
  const [target, setTarget] = useState<Target>("n");
  const [solutionVolumeConverted, setSolutionVolumeConverted] = useState(false);
  const [gasSameUnit, setGasSameUnit] = useState(true);

  const known = useMemo(() => new Set(knownIds), [knownIds]);
  const result = useMemo(() => relationFor(known, target), [known, target]);
  const tone = result.level === "success"
    ? { bg: V.successLt, border: V.success, color: V.success }
    : { bg: V.warningLt, border: V.warning, color: V.warning };

  const warnings: string[] = [];
  if (known.has("Vsol") && !solutionVolumeConverted) {
    warnings.push("Attention : si la concentration est en mol.L-1 ou g.L-1, convertis le volume de solution en litre avant le calcul.");
  }
  if (known.has("Vgaz") && known.has("Vm") && !gasSameUnit) {
    warnings.push("Attention : Vgaz et Vm doivent utiliser la meme unite de volume. Le volume molaire n'est pas une constante universelle.");
  }
  if (known.has("Cm") && known.has("c")) {
    warnings.push("Ne confonds pas Cm, en g.L-1, avec c, en mol.L-1.");
  }

  function toggleKnown(id: string) {
    setKnownIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  return (
    <section
     aria-labelledby="relation-chooser-title"
      className="ui5-u-background-ui5-surface ui5-u-border-1px-solid-ui5-border ui5-u-border-radius-ui5-radius-sm ui5-u-box-shadow-none ui5-u-padding-1rem ui5-u-margin-1-5rem-0"
    >
      <h3 id="relation-chooser-title" className="ui5-u-color-ui5-action ui5-u-margin-0-0-0-75rem ui5-u-font-size-1rem">
        Choisir la relation adaptée
      </h3>

      <div className="ui5-u-display-grid ui5-u-gap-1rem ui5-u-grid-template-columns-repeat-auto-fit-minmax-220px-1fr">
        <fieldset className="ui5-u-border-1px-solid-ui5-border ui5-u-border-radius-ui5-radius-sm ui5-u-padding-0-8rem">
          <legend className="ui5-u-color-ui5-text-2 ui5-u-font-weight-700 ui5-u-padding-0-0-35rem">Grandeurs connues</legend>
          <div className="ui5-u-display-grid ui5-u-gap-0-45rem">
            {KNOWN.map((item) => (
              <label key={item.id} className="ui5-u-display-flex ui5-u-gap-0-5rem ui5-u-align-items-center ui5-u-color-ui5-text">
                <input
                  type="checkbox"
                  checked={knownIds.includes(item.id)}
                  onChange={() => toggleKnown(item.id)}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="ui5-u-display-grid ui5-u-gap-0-8rem ui5-u-align-content-start">
          <label className="ui5-u-display-grid ui5-u-gap-0-35rem ui5-u-color-ui5-text-2 ui5-u-font-weight-700">
            Grandeur recherchée
            <select
              value={target}
              onChange={(event) => setTarget(event.target.value as Target)}
              className="ui5-u-width-100 ui5-u-padding-0-65rem-0-75rem ui5-u-border-1px-solid-ui5-border ui5-u-border-radius-ui5-radius-sm ui5-u-background-ui5-surface-soft ui5-u-color-ui5-text ui5-u-font-inherit"
            >
              {TARGETS.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </label>

          <label className="ui5-u-display-flex ui5-u-gap-0-5rem ui5-u-align-items-center ui5-u-color-ui5-text-2">
            <input
              type="checkbox"
              checked={solutionVolumeConverted}
              onChange={(event) => setSolutionVolumeConverted(event.target.checked)}
            />
            Volume de solution déjà converti en litre
          </label>

          <label className="ui5-u-display-flex ui5-u-gap-0-5rem ui5-u-align-items-center ui5-u-color-ui5-text-2">
            <input
              type="checkbox"
              checked={gasSameUnit}
              onChange={(event) => setGasSameUnit(event.target.checked)}
            />
            Vgaz et Vm exprimés dans la même unité
          </label>
        </div>
      </div>

      <div
        role="status"
       aria-live="polite"
        className="ui5-u-margin-top-1rem ui5-u-padding-0-9rem-1rem ui5-u-border-radius-ui5-radius-sm ui5-u-border-ui5-value-border ui5-u-background-ui5-value-background ui5-u-color-ui5-text" style={{ "--ui5-value-border": `1px solid ${tone.border}`, "--ui5-value-background": tone.bg } as React.CSSProperties}
      >
        <p className="ui5-u-margin-0-0-0-35rem ui5-u-color-ui5-value-color ui5-u-font-weight-800" style={{ "--ui5-value-color": tone.color } as React.CSSProperties}>{result.title}</p>
        <p className="ui5-u-margin-0-0-0-35rem ui5-u-color-ui5-text-2">{result.detail}</p>
        <p className="ui5-u-margin-0 ui5-u-color-ui5-text-2 ui5-u-font-weight-600">{result.units}</p>
      </div>

      {warnings.length > 0 && (
        <ul className="ui5-u-margin-0-75rem-0-0 ui5-u-padding-left-1-2rem ui5-u-color-accent-danger">
          {warnings.map((warning) => (
            <li key={warning} className="ui5-u-margin-0-25rem-0">{warning}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
