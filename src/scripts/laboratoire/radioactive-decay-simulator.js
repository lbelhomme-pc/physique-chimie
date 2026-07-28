import {
  clampElapsedHalfLives,
  clampHalfLife,
  clampInitialNuclei,
  createExpectedCurve,
  createObservedSteps,
  createReferenceRows,
  decayConstant,
  DEFAULT_RANDOM_SEED,
  expectedFraction,
  expectedRemaining,
  generateDecayTimes,
  getDecayPreset,
  MAX_DISPLAYED_HALF_LIVES,
  observedRemaining,
} from "./radioactive-decay-model.js";
import {
  createLabRuntime,
  frNumber,
  onLabReady,
  prefersReducedMotion,
} from "./lab-utils.js";

const PLOT = Object.freeze({ left: 72, top: 24, width: 648, height: 300 });

function mapGraphPoint(elapsedHalfLives, fraction) {
  return {
    x: PLOT.left + (elapsedHalfLives / MAX_DISPLAYED_HALF_LIVES) * PLOT.width,
    y: PLOT.top + PLOT.height - fraction * PLOT.height,
  };
}

function pathFromPoints(points) {
  return points
    .map((point, index) => {
      const mapped = mapGraphPoint(point.elapsedHalfLives, point.fraction);
      return `${index === 0 ? "M" : "L"}${mapped.x.toFixed(2)} ${mapped.y.toFixed(2)}`;
    })
    .join(" ");
}

const EXPECTED_CURVE_PATH = pathFromPoints(createExpectedCurve());

function observedPathUntil(decayTimes, elapsedHalfLives) {
  const total = Math.max(1, decayTimes.length);
  const visiblePoints = createObservedSteps(decayTimes).filter(
    (point) => point.elapsedHalfLives <= elapsedHalfLives,
  );
  const currentFraction = observedRemaining(decayTimes, elapsedHalfLives) / total;
  const lastPoint = visiblePoints.at(-1);

  if (!lastPoint || lastPoint.elapsedHalfLives < elapsedHalfLives) {
    visiblePoints.push({ elapsedHalfLives, fraction: currentFraction });
  }

  return pathFromPoints(visiblePoints);
}

function formatFlexible(value, maximumFractionDigits = 2) {
  return Number(value).toLocaleString("fr-FR", {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  });
}

function initRadioactiveDecayLab(root) {
  const runtime = createLabRuntime(root);
  const reducedMotion = prefersReducedMotion();
  const query = (selector) => root.querySelector(selector);

  const elements = {
    preset: query("[data-preset]"),
    halfLife: query("[data-half-life]"),
    unit: query("[data-unit]"),
    initialNuclei: query("[data-initial-nuclei]"),
    initialOutput: query("[data-initial-output]"),
    speed: query("[data-speed]"),
    play: query("[data-play]"),
    step: query("[data-step]"),
    newExperiment: query("[data-new-experiment]"),
    reset: query("[data-reset]"),
    status: query("[data-run-status]"),
    liveStatus: query("[data-live-status]"),
    timeReadout: query("[data-time-readout]"),
    halfLivesReadout: query("[data-half-lives-readout]"),
    expectedReadout: query("[data-expected-readout]"),
    observedReadout: query("[data-observed-readout]"),
    expectedCurve: query("[data-expected-curve]"),
    observedCurve: query("[data-observed-curve]"),
    currentLine: query("[data-current-line]"),
    currentExpected: query("[data-current-expected]"),
    currentObserved: query("[data-current-observed]"),
    graphSummary: query("[data-graph-summary]"),
    formulaApplication: query("[data-formula-application]"),
    decayConstant: query("[data-decay-constant]"),
    nucleiGrid: query("[data-nuclei-grid]"),
    populationReadout: query("[data-population-readout]"),
    interpretation: query("[data-interpretation]"),
    referenceTable: query("[data-reference-table]"),
  };

  if (Object.values(elements).some((element) => !element)) {
    runtime.cleanup();
    return false;
  }

  const state = {
    halfLife: clampHalfLife(elements.halfLife.value),
    unit: elements.unit.value,
    initialNuclei: clampInitialNuclei(elements.initialNuclei.value),
    elapsedHalfLives: 0,
    speed: Number(elements.speed.value),
    seed: DEFAULT_RANDOM_SEED,
    decayTimes: [],
    running: false,
    complete: false,
    previousFrameTime: null,
    previousRenderTime: 0,
  };

  const announce = (message) => {
    elements.liveStatus.textContent = message;
  };

  const stop = () => {
    state.running = false;
    state.previousFrameTime = null;
  };

  const rebuildNuclei = () => {
    const fragment = document.createDocumentFragment();
    state.decayTimes.forEach((_, index) => {
      const nucleus = document.createElement("span");
      nucleus.className = "decay-nucleus is-alive";
      nucleus.dataset.nucleusIndex = String(index);
      fragment.append(nucleus);
    });
    elements.nucleiGrid.replaceChildren(fragment);
  };

  const renderReferenceTable = () => {
    const rows = createReferenceRows(state.initialNuclei, state.decayTimes);
    const fragment = document.createDocumentFragment();

    rows.forEach((row) => {
      const tr = document.createElement("tr");
      const time = document.createElement("th");
      time.scope = "row";
      time.textContent = String(row.elapsedHalfLives);
      const fraction = document.createElement("td");
      fraction.textContent = `${formatFlexible(row.fractionPercent, 3)} %`;
      const expected = document.createElement("td");
      expected.textContent = formatFlexible(row.expected, 1);
      const observed = document.createElement("td");
      observed.textContent = String(row.observed);
      tr.append(time, fraction, expected, observed);
      fragment.append(tr);
    });

    elements.referenceTable.replaceChildren(fragment);
  };

  const regenerateExperiment = ({ changeSeed = false } = {}) => {
    if (changeSeed) state.seed = (state.seed + 0x9e3779b9) >>> 0;
    state.decayTimes = generateDecayTimes(state.initialNuclei, state.seed);
    rebuildNuclei();
    renderReferenceTable();
  };

  const updateNuclei = () => {
    elements.nucleiGrid.querySelectorAll("[data-nucleus-index]").forEach((nucleus) => {
      const index = Number(nucleus.dataset.nucleusIndex);
      const alive = state.decayTimes[index] > state.elapsedHalfLives;
      nucleus.classList.toggle("is-alive", alive);
      nucleus.classList.toggle("is-decayed", !alive);
    });
  };

  const updateStatus = () => {
    let label = "Prêt";
    let status = "idle";
    if (state.complete) {
      label = "5 demi-vies";
      status = "complete";
    } else if (state.running) {
      label = "En cours";
      status = "running";
    } else if (state.elapsedHalfLives > 0) {
      label = "En pause";
      status = "paused";
    }

    elements.status.textContent = label;
    elements.status.dataset.state = status;
    elements.play.textContent = state.running
      ? "Mettre en pause"
      : state.complete
        ? "Recommencer"
        : state.elapsedHalfLives > 0
          ? "Reprendre"
          : "Commencer";
    elements.play.setAttribute("aria-pressed", String(state.running));
    elements.step.disabled = state.complete || state.running;
    elements.reset.disabled = state.elapsedHalfLives === 0 && !state.running;
  };

  const updateInterpretation = (expected, observed) => {
    if (state.elapsedHalfLives === 0) {
      elements.interpretation.textContent = "Au départ, tous les noyaux sont présents. Leur désintégration commencera à des instants différents.";
      return;
    }

    const deviation = observed - expected;
    const comparison = Math.abs(deviation) < 0.5
      ? "très proche de"
      : deviation > 0
        ? "supérieur à"
        : "inférieur à";
    elements.interpretation.textContent = `Cette expérience donne ${observed} noyaux restants, un résultat ${comparison} la moyenne théorique de ${frNumber(expected, 1)}. Un nouvel essai donnerait une autre réalisation.`;
  };

  const render = () => {
    const expected = expectedRemaining(state.initialNuclei, state.elapsedHalfLives);
    const observed = observedRemaining(state.decayTimes, state.elapsedHalfLives);
    const fraction = expectedFraction(state.elapsedHalfLives);
    const elapsedTime = state.elapsedHalfLives * state.halfLife;
    const observedFraction = observed / state.initialNuclei;
    const currentExpectedPoint = mapGraphPoint(state.elapsedHalfLives, fraction);
    const currentObservedPoint = mapGraphPoint(state.elapsedHalfLives, observedFraction);

    elements.initialOutput.value = String(state.initialNuclei);
    elements.initialOutput.textContent = String(state.initialNuclei);
    elements.timeReadout.textContent = `${frNumber(elapsedTime, 2)} ${state.unit}`;
    elements.halfLivesReadout.innerHTML = `${frNumber(state.elapsedHalfLives, 2)} T<sub>1/2</sub>`;
    elements.expectedReadout.textContent = `${frNumber(expected, 1)} noyaux`;
    elements.observedReadout.textContent = `${observed} noyaux`;
    elements.populationReadout.textContent = `${observed} / ${state.initialNuclei} présents`;

    elements.expectedCurve.setAttribute("d", EXPECTED_CURVE_PATH);
    elements.observedCurve.setAttribute(
      "d",
      observedPathUntil(state.decayTimes, state.elapsedHalfLives),
    );
    elements.currentLine.setAttribute("x1", currentExpectedPoint.x);
    elements.currentLine.setAttribute("x2", currentExpectedPoint.x);
    elements.currentExpected.setAttribute("cx", currentExpectedPoint.x);
    elements.currentExpected.setAttribute("cy", currentExpectedPoint.y);
    elements.currentObserved.setAttribute("x", currentObservedPoint.x - 5);
    elements.currentObserved.setAttribute("y", currentObservedPoint.y - 5);

    const exponent = frNumber(state.elapsedHalfLives, 2);
    elements.formulaApplication.innerHTML = `N(${frNumber(elapsedTime, 2)} ${state.unit}) = ${state.initialNuclei} × 2<sup>−${exponent}</sup> = ${frNumber(expected, 1)}`;
    elements.decayConstant.innerHTML = `λ = ${formatFlexible(decayConstant(state.halfLife), 4)} ${state.unit}<sup>−1</sup>`;
    elements.graphSummary.textContent = `Après ${frNumber(elapsedTime, 2)} ${state.unit}, soit ${frNumber(state.elapsedHalfLives, 2)} demi-vie, la loi moyenne prévoit ${frNumber(expected, 1)} noyaux et cette expérience en compte ${observed} sur ${state.initialNuclei}.`;

    updateNuclei();
    updateInterpretation(expected, observed);
    updateStatus();
  };

  const resetTime = ({ announceReset = true } = {}) => {
    stop();
    state.elapsedHalfLives = 0;
    state.complete = false;
    render();
    if (announceReset) announce("Retour au départ. La même réalisation aléatoire est conservée.");
  };

  runtime.on(elements.play, "click", () => {
    if (state.complete) resetTime({ announceReset: false });
    state.running = !state.running;
    state.previousFrameTime = null;
    updateStatus();
    announce(state.running ? "Animation démarrée." : "Animation mise en pause.");
  });

  runtime.on(elements.step, "click", () => {
    stop();
    state.elapsedHalfLives = clampElapsedHalfLives(state.elapsedHalfLives + 0.5);
    state.complete = state.elapsedHalfLives >= MAX_DISPLAYED_HALF_LIVES;
    render();
    announce(`Temps avancé à ${frNumber(state.elapsedHalfLives, 1)} demi-vie.`);
  });

  runtime.on(elements.reset, "click", () => resetTime());

  runtime.on(elements.newExperiment, "click", () => {
    stop();
    state.elapsedHalfLives = 0;
    state.complete = false;
    regenerateExperiment({ changeSeed: true });
    render();
    announce("Nouvelle expérience générée. Les noyaux ont de nouvelles dates de désintégration aléatoires.");
  });

  runtime.on(elements.initialNuclei, "input", () => {
    stop();
    state.initialNuclei = clampInitialNuclei(elements.initialNuclei.value);
    state.elapsedHalfLives = 0;
    state.complete = false;
    regenerateExperiment();
    render();
    announce(`Échantillon réglé à ${state.initialNuclei} noyaux.`);
  });

  runtime.on(elements.halfLife, "change", () => {
    stop();
    state.halfLife = clampHalfLife(elements.halfLife.value);
    elements.halfLife.value = String(state.halfLife);
    state.elapsedHalfLives = 0;
    state.complete = false;
    render();
    announce(`Demi-vie réglée à ${formatFlexible(state.halfLife, 2)} ${state.unit}.`);
  });

  runtime.on(elements.unit, "change", () => {
    stop();
    state.unit = elements.unit.value;
    state.elapsedHalfLives = 0;
    state.complete = false;
    render();
    announce(`Unité de temps réglée sur ${state.unit}.`);
  });

  runtime.on(elements.speed, "change", () => {
    state.speed = Number(elements.speed.value);
    announce(`Vitesse réglée à ${formatFlexible(state.speed, 2)} demi-vie par seconde.`);
  });

  runtime.on(elements.preset, "change", () => {
    const preset = getDecayPreset(elements.preset.value);
    stop();
    state.halfLife = preset.halfLife;
    state.unit = preset.unit;
    state.elapsedHalfLives = 0;
    state.complete = false;
    elements.halfLife.value = String(preset.halfLife);
    elements.unit.value = preset.unit;
    regenerateExperiment({ changeSeed: true });
    render();
    announce(`${preset.label} sélectionné : demi-vie ${formatFlexible(preset.halfLife, 2)} ${preset.unit}.`);
  });

  runtime.on(document, "visibilitychange", () => {
    if (!document.hidden || !state.running) return;
    stop();
    render();
    announce("Animation mise en pause car la page n'est plus visible.");
  });

  regenerateExperiment();
  render();

  runtime.frame((frameTime) => {
    if (!state.running) {
      state.previousFrameTime = null;
      return;
    }

    if (state.previousFrameTime === null) {
      state.previousFrameTime = frameTime;
      return;
    }

    const deltaSeconds = Math.min(0.1, (frameTime - state.previousFrameTime) / 1000);
    state.previousFrameTime = frameTime;
    state.elapsedHalfLives = clampElapsedHalfLives(
      state.elapsedHalfLives + deltaSeconds * state.speed,
    );

    if (state.elapsedHalfLives >= MAX_DISPLAYED_HALF_LIVES) {
      state.complete = true;
      stop();
      render();
      announce("Cinq demi-vies se sont écoulées. L'expérience est terminée.");
      return;
    }

    const renderInterval = reducedMotion ? 140 : 42;
    if (frameTime - state.previousRenderTime >= renderInterval) {
      state.previousRenderTime = frameTime;
      render();
    }
  });

  return true;
}

onLabReady("[data-radioactive-decay-lab]", initRadioactiveDecayLab);
