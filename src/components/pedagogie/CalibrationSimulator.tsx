import { useMemo, useState } from "react";

type Scenario = "normal" | "dirty" | "outlier" | "saturated";

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

const noise = [0.000, 0.0006, -0.0011, 0.0015, -0.0037, 0.0024];

function fr(value: number, digits = 3) {
  return value.toLocaleString("fr-FR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function absorbanceFor(c: number, index: number, scenario: Scenario) {
  let value = 0.0038 + 3.214 * c + noise[index % noise.length];
  if (scenario === "dirty") value += 0.035;
  if (scenario === "outlier" && index === 3) value += 0.085;
  if (scenario === "saturated" && c > 0.22) {
    value = 0.74 + 0.65 * (1 - Math.exp(-(c - 0.22) * 8));
  }
  return Math.max(0, value);
}

function linearRegression(points: { c: number; a: number }[]) {
  const n = points.length;
  const sx = points.reduce((sum, p) => sum + p.c, 0);
  const sy = points.reduce((sum, p) => sum + p.a, 0);
  const sxx = points.reduce((sum, p) => sum + p.c * p.c, 0);
  const sxy = points.reduce((sum, p) => sum + p.c * p.a, 0);
  const denominator = n * sxx - sx * sx;
  const slope = denominator === 0 ? 0 : (n * sxy - sx * sy) / denominator;
  const intercept = n === 0 ? 0 : (sy - slope * sx) / n;
  const mean = sy / n;
  const ssTot = points.reduce((sum, p) => sum + (p.a - mean) ** 2, 0);
  const ssRes = points.reduce((sum, p) => sum + (p.a - (slope * p.c + intercept)) ** 2, 0);
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;
  return { slope, intercept, r2 };
}

export default function CalibrationSimulator() {
  const [concentrations, setConcentrations] = useState([0.000, 0.040, 0.080, 0.120, 0.160, 0.200]);
  const [scenario, setScenario] = useState<Scenario>("normal");
  const unknownAbsorbance = 0.426;

  const points = useMemo(
    () => concentrations.map((c, index) => ({ c, a: absorbanceFor(c, index, scenario) })),
    [concentrations, scenario]
  );
  const regression = useMemo(() => linearRegression(points), [points]);
  const unknownC = regression.slope > 0 ? (unknownAbsorbance - regression.intercept) / regression.slope : 0;
  const maxC = scenario === "saturated" ? 0.36 : Math.max(0.22, ...concentrations) + 0.02;
  const maxA = scenario === "saturated" ? 1.25 : 0.78;

  function setConcentration(index: number, value: number) {
    setConcentrations((current) => current.map((c, i) => (i === index ? value : c)));
  }

  const summary = `Droite affichée : A = ${fr(regression.slope, 3)} c + ${fr(regression.intercept, 3)} avec c en mmol.L-1. Pour A = ${fr(unknownAbsorbance, 3)}, c vaut environ ${fr(unknownC, 3)} mmol.L-1.`;
  const isOutside = unknownC < 0 || unknownC > Math.max(...concentrations);

  return (
    <section
      aria-labelledby="calibration-sim-title"
      style={{
        background: V.bg,
        border: `1px solid ${V.border}`,
        borderRadius: 12,
        boxShadow: "var(--shadow-card)",
        margin: "1.5rem 0",
        padding: "1rem",
      }}
    >
      <h3 id="calibration-sim-title" style={{ color: V.primary, fontSize: "1rem", margin: "0 0 0.8rem" }}>
        Construire une gamme étalon
      </h3>

      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        <div style={{ display: "grid", gap: "0.75rem" }}>
          <label style={{ display: "grid", gap: "0.35rem", color: V.textSec, fontWeight: 700 }}>
            Situation expérimentale
            <select
              value={scenario}
              onChange={(event) => setScenario(event.target.value as Scenario)}
              style={{
                border: `1px solid ${V.border}`,
                borderRadius: 8,
                background: V.bgSec,
                color: V.text,
                font: "inherit",
                padding: "0.6rem 0.7rem",
              }}
            >
              <option value="normal">mesures correctes</option>
              <option value="dirty">cuve avec traces</option>
              <option value="outlier">un point aberrant</option>
              <option value="saturated">solution trop concentrée</option>
            </select>
          </label>

          <div style={{ display: "grid", gap: "0.45rem" }}>
            {concentrations.map((c, index) => (
              index === 0 ? (
                <p key={index} style={{ color: V.textSec, fontSize: "0.9rem", fontWeight: 700, margin: 0 }}>
                  Blanc : c = {fr(c, 3)} mmol.L-1, référence non modifiable
                </p>
              ) : (
                <label key={index} style={{ display: "grid", gap: "0.25rem", color: V.textSec, fontSize: "0.9rem" }}>
                  Étalon E{index} : c = {fr(c, 3)} mmol.L-1
                  <input
                    type="range"
                    min="0"
                    max={scenario === "saturated" ? 0.34 : 0.22}
                    step="0.005"
                    value={c}
                    onChange={(event) => setConcentration(index, Number(event.target.value))}
                    aria-label={`Concentration de l'étalon E${index}`}
                  />
                </label>
              )
            ))}
          </div>
        </div>

        <div>
          <svg
            viewBox="0 0 520 360"
            role="img"
            aria-labelledby="calibration-graph-title calibration-graph-desc"
            style={{ display: "block", height: "auto", maxWidth: "100%" }}
          >
            <title id="calibration-graph-title">Courbe d'étalonnage simulée</title>
            <desc id="calibration-graph-desc">
              Graphique de l'absorbance en fonction de la concentration, avec points expérimentaux, droite d'ajustement et lecture d'une inconnue.
            </desc>
            <rect x="18" y="18" width="484" height="320" rx="12" fill={V.bgSec} stroke={V.border} />
            <line x1="70" y1="280" x2="455" y2="280" stroke={V.textSec} strokeWidth="2" />
            <line x1="70" y1="280" x2="70" y2="55" stroke={V.textSec} strokeWidth="2" />
            {[0, 0.25, 0.5, 0.75, 1.0].map((tick) => {
              const y = 280 - (tick / maxA) * 225;
              return (
                <g key={tick}>
                  <line x1="65" y1={y} x2="455" y2={y} stroke={V.border} strokeDasharray="4 5" />
                  <text x="35" y={y + 4} fill={V.textMut} fontSize="12">{tick.toFixed(2).replace(".", ",")}</text>
                </g>
              );
            })}
            {[0, maxC / 2, maxC].map((tick, index) => {
              const x = 70 + (tick / maxC) * 385;
              return (
                <g key={index}>
                  <line x1={x} y1="280" x2={x} y2="285" stroke={V.textSec} />
                  <text x={x - 20} y="304" fill={V.textMut} fontSize="12">{fr(tick, 2)}</text>
                </g>
              );
            })}
            <text x="230" y="328" fill={V.textSec} fontSize="13">c (mmol.L-1)</text>
            <text x="28" y="48" fill={V.textSec} fontSize="13">A</text>
            {scenario === "saturated" && (
              <rect x={70 + (0.22 / maxC) * 385} y="58" width={455 - (70 + (0.22 / maxC) * 385)} height="222" fill={V.warningLt} opacity="0.75" />
            )}
            <line
              x1="70"
              y1={280 - (regression.intercept / maxA) * 225}
              x2="455"
              y2={280 - ((regression.slope * maxC + regression.intercept) / maxA) * 225}
              stroke={scenario === "outlier" ? V.warning : V.primary}
              strokeWidth="3"
            />
            {points.map((p, index) => {
              const x = 70 + (p.c / maxC) * 385;
              const y = 280 - (p.a / maxA) * 225;
              return (
                <g key={index}>
                  <circle cx={x} cy={y} r="6" fill={index === 3 && scenario === "outlier" ? V.danger : V.primary} />
                  <rect
                    x={32 + index * 28}
                    y={26}
                    width="18"
                    height="42"
                    rx="4"
                    fill={`rgba(121, 63, 214, ${Math.min(0.18 + p.c * 2.7, 0.92)})`}
                    stroke={V.border}
                  />
                </g>
              );
            })}
            <line x1="70" y1={280 - (unknownAbsorbance / maxA) * 225} x2={70 + (Math.max(0, Math.min(unknownC, maxC)) / maxC) * 385} y2={280 - (unknownAbsorbance / maxA) * 225} stroke={V.success} strokeDasharray="6 4" />
            <line x1={70 + (Math.max(0, Math.min(unknownC, maxC)) / maxC) * 385} y1={280 - (unknownAbsorbance / maxA) * 225} x2={70 + (Math.max(0, Math.min(unknownC, maxC)) / maxC) * 385} y2="280" stroke={V.success} strokeDasharray="6 4" />
            <text x="245" y="83" fill={V.text} fontSize="13">A = {fr(regression.slope, 3)} c + {fr(regression.intercept, 3)}</text>
            <text x="245" y="103" fill={V.textMut} fontSize="12">R2 = {Math.max(0, Math.min(1, regression.r2)).toFixed(4)}</text>
            {scenario === "saturated" && <text x="317" y="74" fill={V.warning} fontSize="12">hors domaine linéaire</text>}
          </svg>
        </div>
      </div>

      <div role="status" aria-live="polite" style={{ background: V.bgSec, border: `1px solid ${V.border}`, borderRadius: 8, color: V.text, marginTop: "0.9rem", padding: "0.75rem 0.85rem" }}>
        <strong>{summary}</strong>
        {isOutside && (
          <p style={{ color: V.warning, margin: "0.4rem 0 0" }}>
            La lecture sort de la gamme étalon : il faut diluer ou préparer une gamme adaptée avant de conclure.
          </p>
        )}
        {scenario !== "normal" && (
          <p style={{ color: scenario === "dirty" ? V.warning : V.danger, margin: "0.4rem 0 0" }}>
            Observe l'effet du défaut : la droite ou certains points deviennent moins fiables, même si le calcul reste possible.
          </p>
        )}
      </div>
    </section>
  );
}
