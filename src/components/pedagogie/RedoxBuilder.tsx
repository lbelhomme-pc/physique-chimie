import { useMemo, useState } from "react";

type ReactionId = "zn-cu" | "fe-cu" | "fe-ag" | "zn-ag";

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

const REACTIONS = [
  {
    id: "zn-cu" as ReactionId,
    label: "Zn(s) avec Cu2+(aq)",
    couples: ["Zn2+/Zn", "Cu2+/Cu"],
    species: ["Zn(s)", "Cu2+(aq)", "Zn2+(aq)", "Cu(s)"],
    reducteur: "Zn(s)",
    oxydant: "Cu2+(aq)",
    oxydation: "Zn(s) = Zn2+(aq) + 2 e-",
    reduction: "Cu2+(aq) + 2 e- = Cu(s)",
    balance: "2 électrons cédés et 2 électrons captés",
    equation: "Zn(s) + Cu2+(aq) -> Zn2+(aq) + Cu(s)",
    hint: "Le métal qui disparaît en solution est souvent l'espèce qui cède des électrons.",
  },
  {
    id: "fe-cu" as ReactionId,
    label: "Fe(s) avec Cu2+(aq)",
    couples: ["Fe2+/Fe", "Cu2+/Cu"],
    species: ["Fe(s)", "Cu2+(aq)", "Fe2+(aq)", "Cu(s)"],
    reducteur: "Fe(s)",
    oxydant: "Cu2+(aq)",
    oxydation: "Fe(s) = Fe2+(aq) + 2 e-",
    reduction: "Cu2+(aq) + 2 e- = Cu(s)",
    balance: "2 électrons cédés et 2 électrons captés",
    equation: "Fe(s) + Cu2+(aq) -> Fe2+(aq) + Cu(s)",
    hint: "Un dépôt de cuivre indique que les ions cuivre(II) gagnent des électrons.",
  },
  {
    id: "fe-ag" as ReactionId,
    label: "Fe2+(aq) avec Ag+(aq)",
    couples: ["Fe3+/Fe2+", "Ag+/Ag"],
    species: ["Fe2+(aq)", "Ag+(aq)", "Fe3+(aq)", "Ag(s)"],
    reducteur: "Fe2+(aq)",
    oxydant: "Ag+(aq)",
    oxydation: "Fe2+(aq) = Fe3+(aq) + e-",
    reduction: "Ag+(aq) + e- = Ag(s)",
    balance: "1 électron cédé et 1 électron capté",
    equation: "Fe2+(aq) + Ag+(aq) -> Fe3+(aq) + Ag(s)",
    hint: "Dans le couple Fe3+/Fe2+, Fe2+ peut perdre un électron pour devenir Fe3+.",
  },
  {
    id: "zn-ag" as ReactionId,
    label: "Zn(s) avec Ag+(aq)",
    couples: ["Zn2+/Zn", "Ag+/Ag"],
    species: ["Zn(s)", "Ag+(aq)", "Zn2+(aq)", "Ag(s)"],
    reducteur: "Zn(s)",
    oxydant: "Ag+(aq)",
    oxydation: "Zn(s) = Zn2+(aq) + 2 e-",
    reduction: "Ag+(aq) + e- = Ag(s)",
    balance: "Il faut multiplier la réduction de Ag+ par 2.",
    equation: "Zn(s) + 2 Ag+(aq) -> Zn2+(aq) + 2 Ag(s)",
    hint: "Le zinc cède deux électrons, mais chaque ion argent n'en capte qu'un.",
  },
];

export default function RedoxBuilder() {
  const [reactionId, setReactionId] = useState<ReactionId>("zn-cu");
  const [reducteur, setReducteur] = useState("Zn(s)");
  const [oxydant, setOxydant] = useState("Cu2+(aq)");
  const [chargesOk, setChargesOk] = useState(false);
  const [electronsOk, setElectronsOk] = useState(false);
  const [finalNoElectrons, setFinalNoElectrons] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);

  const reaction = useMemo(() => REACTIONS.find((item) => item.id === reactionId) ?? REACTIONS[0], [reactionId]);
  const species = reaction.species;
  const choicesOk = reducteur === reaction.reducteur && oxydant === reaction.oxydant;
  const methodOk = chargesOk && electronsOk && finalNoElectrons;
  const allOk = choicesOk && methodOk;

  function changeReaction(value: ReactionId) {
    const next = REACTIONS.find((item) => item.id === value) ?? REACTIONS[0];
    setReactionId(value);
    setReducteur(next.species[0]);
    setOxydant(next.species[1]);
    setChargesOk(false);
    setElectronsOk(false);
    setFinalNoElectrons(false);
    setSubmitted(false);
    setHintLevel(0);
  }

  const progressiveHints = [
    reaction.hint,
    `Couples fournis : ${reaction.couples.join(" et ")}.`,
    "Le réducteur est oxydé ; l'oxydant est réduit.",
  ];

  return (
    <section
     aria-labelledby="redox-builder-title"
      className="ui5-u-background-ui5-surface ui5-u-border-1px-solid-ui5-border ui5-u-border-radius-ui5-radius-sm ui5-u-box-shadow-none ui5-u-margin-1-5rem-0 ui5-u-padding-1rem"
    >
      <h3 id="redox-builder-title" className="ui5-u-color-ui5-action ui5-u-font-size-1rem ui5-u-margin-0-0-0-75rem">
        Construire une réaction d'oxydoréduction
      </h3>

      <div className="ui5-u-display-grid ui5-u-gap-1rem ui5-u-grid-template-columns-repeat-auto-fit-minmax-240px-1fr">
        <div className="ui5-u-display-grid ui5-u-gap-0-75rem ui5-u-align-content-start">
          <label className="ui5-u-display-grid ui5-u-gap-0-35rem ui5-u-color-ui5-text-2 ui5-u-font-weight-700">
            Transformation étudiée
            <select
              value={reactionId}
              onChange={(event) => changeReaction(event.target.value as ReactionId)}
              className="ui5-u-border-1px-solid-ui5-border ui5-u-border-radius-ui5-radius-sm ui5-u-background-ui5-surface-soft ui5-u-color-ui5-text ui5-u-font-inherit ui5-u-padding-0-6rem"
            >
              {REACTIONS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>

          <label className="ui5-u-display-grid ui5-u-gap-0-35rem ui5-u-color-ui5-text-2 ui5-u-font-weight-700">
            Espèce qui cède les électrons
            <select
              value={reducteur}
              onChange={(event) => { setReducteur(event.target.value); setSubmitted(false); }}
              className="ui5-u-border-1px-solid-ui5-border ui5-u-border-radius-ui5-radius-sm ui5-u-background-ui5-surface-soft ui5-u-color-ui5-text ui5-u-font-inherit ui5-u-padding-0-6rem"
            >
              {species.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>

          <label className="ui5-u-display-grid ui5-u-gap-0-35rem ui5-u-color-ui5-text-2 ui5-u-font-weight-700">
            Espèce qui capte les électrons
            <select
              value={oxydant}
              onChange={(event) => { setOxydant(event.target.value); setSubmitted(false); }}
              className="ui5-u-border-1px-solid-ui5-border ui5-u-border-radius-ui5-radius-sm ui5-u-background-ui5-surface-soft ui5-u-color-ui5-text ui5-u-font-inherit ui5-u-padding-0-6rem"
            >
              {species.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>

        <div className="ui5-u-display-grid ui5-u-gap-0-55rem ui5-u-align-content-start">
          <p className="ui5-u-color-ui5-text-2 ui5-u-font-weight-700 ui5-u-margin-0">Contrôles avant validation</p>
          <label className="ui5-u-color-ui5-text ui5-u-display-flex ui5-u-gap-0-5rem ui5-u-align-items-center">
            <input type="checkbox" checked={chargesOk} onChange={(event) => { setChargesOk(event.target.checked); setSubmitted(false); }} />
            J'ai vérifié la conservation des charges.
          </label>
          <label className="ui5-u-color-ui5-text ui5-u-display-flex ui5-u-gap-0-5rem ui5-u-align-items-center">
            <input type="checkbox" checked={electronsOk} onChange={(event) => { setElectronsOk(event.target.checked); setSubmitted(false); }} />
            Les électrons cédés et captés sont en même nombre.
          </label>
          <label className="ui5-u-color-ui5-text ui5-u-display-flex ui5-u-gap-0-5rem ui5-u-align-items-center">
            <input type="checkbox" checked={finalNoElectrons} onChange={(event) => { setFinalNoElectrons(event.target.checked); setSubmitted(false); }} />
            L'équation finale ne contient plus d'électrons.
          </label>

          <div className="ui5-u-display-flex ui5-u-gap-0-5rem ui5-u-flex-wrap-wrap ui5-u-margin-top-0-25rem">
            <button
              type="button"
              onClick={() => setHintLevel((value) => Math.min(progressiveHints.length, value + 1))}
              className="ui5-u-border-1px-solid-ui5-border ui5-u-border-radius-ui5-radius-sm ui5-u-background-ui5-surface-soft ui5-u-color-ui5-text ui5-u-cursor-pointer ui5-u-font-inherit ui5-u-padding-0-55rem-0-8rem"
            >
              Obtenir un indice
            </button>
            <button
              type="button"
              onClick={() => setSubmitted(true)}
              className="ui5-u-border-none ui5-u-border-radius-ui5-radius-sm ui5-u-background-ui5-action ui5-u-color-fff ui5-u-cursor-pointer ui5-u-font-inherit ui5-u-font-weight-700 ui5-u-padding-0-55rem-0-8rem"
            >
              Valider
            </button>
          </div>
        </div>
      </div>

      {hintLevel > 0 && (
        <div className="ui5-u-background-accent-warning-light ui5-u-border-1px-solid-accent-warning ui5-u-border-radius-ui5-radius-sm ui5-u-color-ui5-text ui5-u-margin-top-0-9rem ui5-u-padding-0-75rem">
          {progressiveHints.slice(0, hintLevel).map((hint, index) => <p key={index} className={(index === 0 ? "ui5-u-margin-0" : "ui5-u-margin-0-35rem-0-0")}>{hint}</p>)}
        </div>
      )}

      <div
        role="status"
       aria-live="polite"
        className={(submitted ? (allOk ? "ui5-u-background-accent-success-light" : "ui5-u-background-accent-warning-light") : "ui5-u-background-ui5-surface-soft") + " " + "ui5-u-border-ui5-value-border ui5-u-border-radius-ui5-radius-sm ui5-u-color-ui5-text ui5-u-margin-top-0-9rem ui5-u-padding-0-85rem"} style={{ "--ui5-value-border": `1px solid ${submitted ? (allOk ? V.success : V.warning) : V.border}` } as React.CSSProperties}
      >
        {!submitted && <p className="ui5-u-margin-0">Choisis les deux rôles, vérifie les demi-équations, puis valide.</p>}
        {submitted && !choicesOk && (
          <p className="ui5-u-margin-0">
            Revois les rôles : l'espèce qui cède les électrons est le réducteur, celle qui capte les électrons est l'oxydant.
          </p>
        )}
        {submitted && choicesOk && !methodOk && (
          <p className="ui5-u-margin-0">
            Les rôles sont corrects. Il reste à cocher toutes les vérifications de méthode avant d'obtenir le bilan.
          </p>
        )}
        {submitted && allOk && (
          <div className="ui5-u-display-grid ui5-u-gap-0-35rem">
            <p className="ui5-u-margin-0 ui5-u-font-weight-700">Validation réussie.</p>
            <p className="ui5-u-margin-0">Oxydation : {reaction.oxydation}</p>
            <p className="ui5-u-margin-0">Réduction : {reaction.reduction}</p>
            <p className="ui5-u-margin-0">{reaction.balance}</p>
            <p className="ui5-u-margin-0 ui5-u-font-weight-700">Équation finale : {reaction.equation}</p>
          </div>
        )}
      </div>
    </section>
  );
}
