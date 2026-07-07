import { useMemo, useState } from "react";

type ReactionId = "zn-cu" | "fe-cu" | "fe-ag" | "zn-ag";

const V = {
  bg: "var(--bg-card)",
  bgSec: "var(--bg-secondary)",
  bgTer: "var(--bg-tertiary)",
  text: "var(--text-primary)",
  textSec: "var(--text-secondary)",
  textMut: "var(--text-muted)",
  border: "var(--border-color)",
  primary: "var(--accent-primary)",
  primaryLt: "var(--accent-primary-light)",
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
      style={{
        background: V.bg,
        border: `1px solid ${V.border}`,
        borderRadius: 12,
        boxShadow: "var(--shadow-card)",
        margin: "1.5rem 0",
        padding: "1rem",
      }}
    >
      <h3 id="redox-builder-title" style={{ color: V.primary, fontSize: "1rem", margin: "0 0 0.75rem" }}>
        Construire une réaction d'oxydoréduction
      </h3>

      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        <div style={{ display: "grid", gap: "0.75rem", alignContent: "start" }}>
          <label style={{ display: "grid", gap: "0.35rem", color: V.textSec, fontWeight: 700 }}>
            Transformation étudiée
            <select
              value={reactionId}
              onChange={(event) => changeReaction(event.target.value as ReactionId)}
              style={{ border: `1px solid ${V.border}`, borderRadius: 8, background: V.bgSec, color: V.text, font: "inherit", padding: "0.6rem" }}
            >
              {REACTIONS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>

          <label style={{ display: "grid", gap: "0.35rem", color: V.textSec, fontWeight: 700 }}>
            Espèce qui cède les électrons
            <select
              value={reducteur}
              onChange={(event) => { setReducteur(event.target.value); setSubmitted(false); }}
              style={{ border: `1px solid ${V.border}`, borderRadius: 8, background: V.bgSec, color: V.text, font: "inherit", padding: "0.6rem" }}
            >
              {species.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>

          <label style={{ display: "grid", gap: "0.35rem", color: V.textSec, fontWeight: 700 }}>
            Espèce qui capte les électrons
            <select
              value={oxydant}
              onChange={(event) => { setOxydant(event.target.value); setSubmitted(false); }}
              style={{ border: `1px solid ${V.border}`, borderRadius: 8, background: V.bgSec, color: V.text, font: "inherit", padding: "0.6rem" }}
            >
              {species.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>

        <div style={{ display: "grid", gap: "0.55rem", alignContent: "start" }}>
          <p style={{ color: V.textSec, fontWeight: 700, margin: 0 }}>Contrôles avant validation</p>
          <label style={{ color: V.text, display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input type="checkbox" checked={chargesOk} onChange={(event) => { setChargesOk(event.target.checked); setSubmitted(false); }} />
            J'ai vérifié la conservation des charges.
          </label>
          <label style={{ color: V.text, display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input type="checkbox" checked={electronsOk} onChange={(event) => { setElectronsOk(event.target.checked); setSubmitted(false); }} />
            Les électrons cédés et captés sont en même nombre.
          </label>
          <label style={{ color: V.text, display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input type="checkbox" checked={finalNoElectrons} onChange={(event) => { setFinalNoElectrons(event.target.checked); setSubmitted(false); }} />
            L'équation finale ne contient plus d'électrons.
          </label>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
            <button
              type="button"
              onClick={() => setHintLevel((value) => Math.min(progressiveHints.length, value + 1))}
              style={{ border: `1px solid ${V.border}`, borderRadius: 8, background: V.bgSec, color: V.text, cursor: "pointer", font: "inherit", padding: "0.55rem 0.8rem" }}
            >
              Obtenir un indice
            </button>
            <button
              type="button"
              onClick={() => setSubmitted(true)}
              style={{ border: "none", borderRadius: 8, background: V.primary, color: "#fff", cursor: "pointer", font: "inherit", fontWeight: 700, padding: "0.55rem 0.8rem" }}
            >
              Valider
            </button>
          </div>
        </div>
      </div>

      {hintLevel > 0 && (
        <div style={{ background: V.warningLt, border: `1px solid ${V.warning}`, borderRadius: 8, color: V.text, marginTop: "0.9rem", padding: "0.75rem" }}>
          {progressiveHints.slice(0, hintLevel).map((hint, index) => <p key={index} style={{ margin: index === 0 ? 0 : "0.35rem 0 0" }}>{hint}</p>)}
        </div>
      )}

      <div
        role="status"
        aria-live="polite"
        style={{
          background: submitted ? (allOk ? V.successLt : V.warningLt) : V.bgSec,
          border: `1px solid ${submitted ? (allOk ? V.success : V.warning) : V.border}`,
          borderRadius: 8,
          color: V.text,
          marginTop: "0.9rem",
          padding: "0.85rem",
        }}
      >
        {!submitted && <p style={{ margin: 0 }}>Choisis les deux rôles, vérifie les demi-équations, puis valide.</p>}
        {submitted && !choicesOk && (
          <p style={{ margin: 0 }}>
            Revois les rôles : l'espèce qui cède les électrons est le réducteur, celle qui capte les électrons est l'oxydant.
          </p>
        )}
        {submitted && choicesOk && !methodOk && (
          <p style={{ margin: 0 }}>
            Les rôles sont corrects. Il reste à cocher toutes les vérifications de méthode avant d'obtenir le bilan.
          </p>
        )}
        {submitted && allOk && (
          <div style={{ display: "grid", gap: "0.35rem" }}>
            <p style={{ margin: 0, fontWeight: 700 }}>Validation réussie.</p>
            <p style={{ margin: 0 }}>Oxydation : {reaction.oxydation}</p>
            <p style={{ margin: 0 }}>Réduction : {reaction.reduction}</p>
            <p style={{ margin: 0 }}>{reaction.balance}</p>
            <p style={{ margin: 0, fontWeight: 700 }}>Équation finale : {reaction.equation}</p>
          </div>
        )}
      </div>
    </section>
  );
}
