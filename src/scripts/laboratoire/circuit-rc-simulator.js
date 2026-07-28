import {
  RC_MODE,
  computeCapacitorTangentVoltage,
  computeRcState,
  computeTimeConstantSeconds,
  createRcSeries,
  describeRcState,
  normalizeRcParameters,
} from './circuit-rc-model.js';

const GRAPH = Object.freeze({
  x0: 82,
  x1: 640,
  voltageTop: 52,
  voltageBottom: 172,
  currentTop: 230,
  currentBottom: 350,
  energyTop: 408,
  energyBottom: 528,
  maxTau: 5,
});

const STATUS_LABELS = Object.freeze({
  ready: 'Prêt à manipuler',
  running: 'Animation en cours',
  paused: 'Animation en pause',
  complete: 'Fin pratique atteinte à 5τ',
});

function query(root, selector) {
  const element = root.querySelector(selector);
  if (!element) throw new Error(`Élément introuvable dans la simulation RC : ${selector}`);
  return element;
}

function queryAll(root, selector) {
  return [...root.querySelectorAll(selector)];
}

function formatNumber(value, digits = 2) {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function formatSigned(value, digits = 3) {
  const rounded = Math.abs(value) < 0.5 * 10 ** (-digits) ? 0 : value;
  return formatNumber(rounded, digits);
}

function formatOhm(value) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value);
}

function formatScientific(value, digits = 2) {
  if (value === 0) return '0';
  const exponent = Math.floor(Math.log10(Math.abs(value)));
  const mantissa = value / (10 ** exponent);
  const superscripts = String(exponent)
    .replace('-', '⁻')
    .replaceAll('0', '⁰')
    .replaceAll('1', '¹')
    .replaceAll('2', '²')
    .replaceAll('3', '³')
    .replaceAll('4', '⁴')
    .replaceAll('5', '⁵')
    .replaceAll('6', '⁶')
    .replaceAll('7', '⁷')
    .replaceAll('8', '⁸')
    .replaceAll('9', '⁹');
  return `${formatNumber(mantissa, digits)} × 10${superscripts}`;
}

function setOutput(root, name, text) {
  queryAll(root, `[data-output="${name}"]`).forEach((element) => {
    element.textContent = text;
  });
}

function mapLinear(value, min, max, pixelMin, pixelMax) {
  if (max === min) return 0.5 * (pixelMin + pixelMax);
  const fraction = (value - min) / (max - min);
  return pixelMin + fraction * (pixelMax - pixelMin);
}

function buildPath(points, xAccessor, yAccessor) {
  return points.map((point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${command}${xAccessor(point).toFixed(2)} ${yAccessor(point).toFixed(2)}`;
  }).join(' ');
}

function textForMode(mode) {
  return mode === RC_MODE.CHARGE ? 'Charge' : 'Décharge';
}

function createReferenceRows(parameters) {
  const tau = computeTimeConstantSeconds(parameters);
  return [0, 1, 2, 3, 5].map((multiple) => ({
    multiple,
    state: computeRcState(parameters, multiple * tau),
  }));
}

/**
 * Mount the RC simulator on a root element.
 * Returns a cleanup function for Astro view transitions and normal navigation.
 */
export function initCircuitRcSimulator(root) {
  if (!(root instanceof HTMLElement)) {
    throw new TypeError('La racine de la simulation RC doit être un HTMLElement.');
  }

  const abortController = new AbortController();
  const { signal } = abortController;

  const elements = {
    state: query(root, '[data-sim-state]'),
    stateText: query(root, '[data-sim-state-text]'),
    modeInputs: queryAll(root, '[data-param="mode"]'),
    voltageInput: query(root, '[data-param="voltageV"]'),
    resistanceInput: query(root, '[data-param="resistanceKOhm"]'),
    capacitanceInput: query(root, '[data-param="capacitanceMicroF"]'),
    speedInput: query(root, '[data-control="speed"]'),
    tangentInput: query(root, '[data-control="tangent"]'),
    timeCursor: query(root, '[data-control="time-cursor"]'),
    runButton: query(root, '[data-action="toggle-run"]'),
    runLabel: query(root, '[data-run-label]'),
    resetButton: query(root, '[data-action="reset"]'),
    jumpTauButton: query(root, '[data-action="jump-tau"]'),
    recordTrialButton: query(root, '[data-action="record-trial"]'),
    clearTrialsButton: query(root, '[data-action="clear-trials"]'),
    modeHelp: query(root, '[data-mode-help]'),
    modeBadge: query(root, '[data-output="modeBadge"]'),
    generator: query(root, '[data-generator]'),
    chargeBranch: query(root, '[data-charge-branch]'),
    dischargeBranch: query(root, '[data-discharge-branch]'),
    switchArm: query(root, '[data-switch-arm]'),
    currentCharge: query(root, '[data-current-charge]'),
    currentDischarge: query(root, '[data-current-discharge]'),
    currentLabel: query(root, '[data-current-label]'),
    positiveCharge: query(root, '[data-positive-charge]'),
    negativeCharge: query(root, '[data-negative-charge]'),
    circuitDescription: query(root, '[data-circuit-description]'),
    lawTitle: query(root, '[data-output="lawTitle"]'),
    lawEquation: query(root, '[data-output="lawEquation"]'),
    loopEquation: query(root, '[data-output="loopEquation"]'),
    curves: {
      uc: query(root, '[data-curve="uc"]'),
      ur: query(root, '[data-curve="ur"]'),
      i: query(root, '[data-curve="i"]'),
      energy: query(root, '[data-curve="energy"]'),
      tangent: query(root, '[data-curve="tangent"]'),
    },
    timeMarker: query(root, '[data-time-marker]'),
    markers: {
      uc: query(root, '[data-marker="uc"]'),
      ur: query(root, '[data-marker="ur"]'),
      i: query(root, '[data-marker="i"]'),
      energy: query(root, '[data-marker="energy"]'),
    },
    yLabels: {
      vTop: query(root, '[data-y="v-top"]'),
      vMid: query(root, '[data-y="v-mid"]'),
      vBottom: query(root, '[data-y="v-bottom"]'),
      iTop: query(root, '[data-y="i-top"]'),
      iMid: query(root, '[data-y="i-mid"]'),
      iBottom: query(root, '[data-y="i-bottom"]'),
      eTop: query(root, '[data-y="e-top"]'),
      eMid: query(root, '[data-y="e-mid"]'),
    },
    graphDescription: query(root, '[data-graph-description]'),
    graphSummary: query(root, '[data-graph-summary]'),
    referenceTable: query(root, '[data-reference-table]'),
    fiveTauNote: query(root, '[data-five-tau-note]'),
    trialTable: query(root, '[data-trial-table]'),
  };

  const state = {
    parameters: normalizeRcParameters({
      mode: RC_MODE.CHARGE,
      voltageV: elements.voltageInput.value,
      resistanceKOhm: elements.resistanceInput.value,
      capacitanceMicroF: elements.capacitanceInput.value,
    }),
    timeSeconds: 0,
    speed: Number(elements.speedInput.value),
    showTangent: elements.tangentInput.checked,
    status: 'ready',
    rafId: 0,
    lastTimestamp: null,
    curveKey: '',
    trials: [],
    destroyed: false,
  };

  function readParameters() {
    const checkedMode = elements.modeInputs.find((input) => input.checked)?.value ?? RC_MODE.CHARGE;
    return normalizeRcParameters({
      mode: checkedMode,
      voltageV: elements.voltageInput.value,
      resistanceKOhm: elements.resistanceInput.value,
      capacitanceMicroF: elements.capacitanceInput.value,
    });
  }

  function stopAnimation() {
    if (state.rafId) cancelAnimationFrame(state.rafId);
    state.rafId = 0;
    state.lastTimestamp = null;
  }

  function setStatus(status) {
    state.status = status;
    elements.state.dataset.status = status;
    elements.stateText.textContent = STATUS_LABELS[status];
    elements.runLabel.textContent = status === 'running' ? 'Mettre en pause' : 'Démarrer';
    elements.runButton.setAttribute('aria-pressed', String(status === 'running'));
  }

  function xForTime(timeSeconds, tauSeconds) {
    return mapLinear(timeSeconds / tauSeconds, 0, GRAPH.maxTau, GRAPH.x0, GRAPH.x1);
  }

  function voltageScale(parameters) {
    if (parameters.mode === RC_MODE.CHARGE) {
      return {
        min: 0,
        max: parameters.voltageV,
        y: (value) => mapLinear(value, 0, parameters.voltageV, GRAPH.voltageBottom, GRAPH.voltageTop),
      };
    }

    return {
      min: -parameters.voltageV,
      max: parameters.voltageV,
      y: (value) => mapLinear(value, -parameters.voltageV, parameters.voltageV, GRAPH.voltageBottom, GRAPH.voltageTop),
    };
  }

  function currentScale(parameters) {
    const i0MilliA = parameters.voltageV / (parameters.resistanceKOhm * 1e3) * 1e3;
    if (parameters.mode === RC_MODE.CHARGE) {
      return {
        min: 0,
        max: i0MilliA,
        y: (value) => mapLinear(value, 0, i0MilliA, GRAPH.currentBottom, GRAPH.currentTop),
      };
    }

    return {
      min: -i0MilliA,
      max: 0,
      y: (value) => mapLinear(value, -i0MilliA, 0, GRAPH.currentBottom, GRAPH.currentTop),
    };
  }

  function renderCurves() {
    const parameters = state.parameters;
    const curveKey = `${parameters.mode}|${parameters.voltageV}|${parameters.resistanceKOhm}|${parameters.capacitanceMicroF}|${state.showTangent}`;
    if (curveKey === state.curveKey) return;
    state.curveKey = curveKey;

    const series = createRcSeries(parameters, { maxTau: GRAPH.maxTau, sampleCount: 241 });
    const voltage = voltageScale(parameters);
    const current = currentScale(parameters);
    const maximumEnergyMilliJ = computeRcState(parameters, parameters.mode === RC_MODE.CHARGE ? 20 * series.tauSeconds : 0).maximumEnergyMilliJ;
    const energyY = (value) => mapLinear(value, 0, maximumEnergyMilliJ, GRAPH.energyBottom, GRAPH.energyTop);
    const x = (point) => xForTime(point.timeSeconds, series.tauSeconds);

    elements.curves.uc.setAttribute('d', buildPath(series.points, x, (point) => voltage.y(point.capacitorVoltageV)));
    elements.curves.ur.setAttribute('d', buildPath(series.points, x, (point) => voltage.y(point.resistorVoltageV)));
    elements.curves.i.setAttribute('d', buildPath(series.points, x, (point) => current.y(point.currentMilliA)));
    elements.curves.energy.setAttribute('d', buildPath(series.points, x, (point) => energyY(point.capacitorEnergyMilliJ)));

    if (state.showTangent) {
      const tangentTimes = parameters.mode === RC_MODE.CHARGE
        ? [0, series.tauSeconds]
        : [0, series.tauSeconds];
      const tangentPoints = tangentTimes.map((timeSeconds) => ({
        timeSeconds,
        tangentVoltageV: computeCapacitorTangentVoltage(parameters, timeSeconds),
      }));
      elements.curves.tangent.setAttribute('d', buildPath(
        tangentPoints,
        (point) => xForTime(point.timeSeconds, series.tauSeconds),
        (point) => voltage.y(point.tangentVoltageV),
      ));
      elements.curves.tangent.hidden = false;
    } else {
      elements.curves.tangent.setAttribute('d', '');
      elements.curves.tangent.hidden = true;
    }

    if (parameters.mode === RC_MODE.CHARGE) {
      elements.yLabels.vTop.textContent = formatNumber(parameters.voltageV, 1);
      elements.yLabels.vMid.textContent = formatNumber(parameters.voltageV / 2, 1);
      elements.yLabels.vBottom.textContent = '0';
      elements.yLabels.iTop.textContent = formatNumber(current.max, 3);
      elements.yLabels.iMid.textContent = formatNumber(current.max / 2, 3);
      elements.yLabels.iBottom.textContent = '0';
    } else {
      elements.yLabels.vTop.textContent = formatNumber(parameters.voltageV, 1);
      elements.yLabels.vMid.textContent = '0';
      elements.yLabels.vBottom.textContent = `−${formatNumber(parameters.voltageV, 1)}`;
      elements.yLabels.iTop.textContent = '0';
      elements.yLabels.iMid.textContent = formatSigned(current.min / 2, 3);
      elements.yLabels.iBottom.textContent = formatSigned(current.min, 3);
    }

    elements.yLabels.eTop.textContent = formatNumber(maximumEnergyMilliJ, 3);
    elements.yLabels.eMid.textContent = formatNumber(maximumEnergyMilliJ / 2, 3);

    const modeText = parameters.mode === RC_MODE.CHARGE ? 'charge' : 'décharge';
    elements.graphDescription.textContent = `Trois graphiques synchronisés montrent les tensions, le courant signé et l’énergie du condensateur pendant la ${modeText}, de zéro à cinq constantes de temps.`;
  }

  function renderReferenceTable() {
    const rows = createReferenceRows(state.parameters);
    elements.referenceTable.replaceChildren(...rows.map(({ multiple, state: point }) => {
      const row = document.createElement('tr');
      const timeLabel = multiple === 0 ? '0' : multiple === 1 ? 'τ' : `${multiple}τ`;
      row.innerHTML = `
        <th scope="row">${timeLabel}</th>
        <td>${formatSigned(point.capacitorVoltageV, 3)} V</td>
        <td>${formatSigned(point.resistorVoltageV, 3)} V</td>
        <td>${formatSigned(point.currentMilliA, 3)} mA</td>
        <td>${formatNumber(point.capacitorEnergyMilliJ, 3)} mJ</td>
      `;
      return row;
    }));

    elements.fiveTauNote.textContent = state.parameters.mode === RC_MODE.CHARGE
      ? 'À 5τ, la charge est pratiquement achevée (≈ 99,3 %), mais elle n’est jamais mathématiquement totale à temps fini.'
      : 'À 5τ, il reste environ 0,67 % de la tension initiale : la décharge est pratiquement achevée, mais jamais mathématiquement totale à temps fini.';
  }

  function renderTrials() {
    if (state.trials.length === 0) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 4;
      cell.textContent = 'Aucun essai mémorisé.';
      row.append(cell);
      elements.trialTable.replaceChildren(row);
      return;
    }

    elements.trialTable.replaceChildren(...state.trials.map((trial, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <th scope="row">${index === 0 ? 'A' : 'B'}</th>
        <td>${formatNumber(trial.resistanceKOhm, 0)} kΩ</td>
        <td>${formatNumber(trial.capacitanceMicroF, 0)} µF</td>
        <td>${formatNumber(trial.tauSeconds, trial.tauSeconds < 0.1 ? 3 : 2)} s</td>
      `;
      return row;
    }));
  }

  function renderCircuit(point) {
    const isCharge = state.parameters.mode === RC_MODE.CHARGE;
    elements.modeBadge.textContent = textForMode(state.parameters.mode);
    elements.generator.dataset.inactive = String(!isCharge);
    elements.chargeBranch.dataset.inactive = String(!isCharge);
    elements.dischargeBranch.dataset.inactive = String(isCharge);
    elements.switchArm.setAttribute('d', isCharge ? 'M185 105 L116 72' : 'M185 105 L116 148');
    elements.currentCharge.hidden = !isCharge;
    elements.currentDischarge.hidden = isCharge;
    elements.currentLabel.textContent = isCharge
      ? 'Flèches : courant conventionnel de charge'
      : 'Flèches : courant conventionnel de décharge';
    elements.circuitDescription.textContent = isCharge
      ? 'Le générateur, la résistance et le condensateur sont reliés en série. Les flèches indiquent le courant conventionnel de charge.'
      : 'Le générateur est déconnecté. Le condensateur se décharge dans la résistance et le courant conventionnel circule en sens opposé au sens positif choisi.';

    const chargeFraction = Math.min(1, Math.max(0, Math.abs(point.capacitorVoltageV / state.parameters.voltageV)));
    const chargeOpacity = 0.2 + 0.8 * chargeFraction;
    elements.positiveCharge.style.opacity = String(chargeOpacity);
    elements.negativeCharge.style.opacity = String(chargeOpacity);

    const currentFraction = Math.min(1, Math.abs(point.currentMilliA / point.maximumCurrentMilliA));
    root.style.setProperty('--crc-current-opacity', String(0.18 + 0.82 * currentFraction));
    root.style.setProperty('--crc-current-duration', `${Math.max(0.55, 2.4 - 1.7 * currentFraction)}s`);
    root.dataset.running = String(state.status === 'running');
  }

  function renderMarker(point) {
    const parameters = state.parameters;
    const tau = point.tauSeconds;
    const voltage = voltageScale(parameters);
    const current = currentScale(parameters);
    const energyY = (value) => mapLinear(value, 0, point.maximumEnergyMilliJ, GRAPH.energyBottom, GRAPH.energyTop);
    const x = xForTime(point.timeSeconds, tau);

    elements.timeMarker.setAttribute('transform', `translate(${(x - GRAPH.x0).toFixed(2)} 0)`);
    const markerX = GRAPH.x0;
    elements.markers.uc.setAttribute('cx', String(markerX));
    elements.markers.uc.setAttribute('cy', voltage.y(point.capacitorVoltageV).toFixed(2));
    elements.markers.ur.setAttribute('cx', String(markerX));
    elements.markers.ur.setAttribute('cy', voltage.y(point.resistorVoltageV).toFixed(2));
    elements.markers.i.setAttribute('cx', String(markerX));
    elements.markers.i.setAttribute('cy', current.y(point.currentMilliA).toFixed(2));
    elements.markers.energy.setAttribute('cx', String(markerX));
    elements.markers.energy.setAttribute('cy', energyY(point.capacitorEnergyMilliJ).toFixed(2));
  }

  function renderLaw(point) {
    if (state.parameters.mode === RC_MODE.CHARGE) {
      elements.modeHelp.innerHTML = 'Le condensateur est initialement déchargé : u<sub>C</sub>(0) = 0 V.';
      elements.lawTitle.textContent = 'Loi de charge';
      elements.lawEquation.textContent = 'uC(t) = E(1 − e⁻ᵗ⧸τ) ; i(t) = (E/R)e⁻ᵗ⧸τ';
      elements.loopEquation.textContent = `Loi des mailles : uC + uR = E ; écart numérique ${formatScientific(Math.abs(point.chargeLoopResidualV), 1)} V`;
    } else {
      elements.modeHelp.innerHTML = 'Le condensateur est initialement chargé : u<sub>C</sub>(0) = U<sub>0</sub>. Le courant est signé dans le sens positif de charge.';
      elements.lawTitle.textContent = 'Loi de décharge';
      elements.lawEquation.textContent = 'uC(t) = U0e⁻ᵗ⧸τ ; i(t) = −(U0/R)e⁻ᵗ⧸τ';
      elements.loopEquation.textContent = `Maille de décharge : uC + uR = 0 ; écart numérique ${formatScientific(Math.abs(point.chargeLoopResidualV), 1)} V`;
    }
  }

  function render() {
    const tau = computeTimeConstantSeconds(state.parameters);
    const maxTime = GRAPH.maxTau * tau;
    state.timeSeconds = Math.min(maxTime, Math.max(0, state.timeSeconds));
    const point = computeRcState(state.parameters, state.timeSeconds);

    setOutput(root, 'voltageV', `${formatNumber(state.parameters.voltageV, 1)} V`);
    setOutput(root, 'resistanceKOhm', `${formatNumber(state.parameters.resistanceKOhm, 0)} kΩ`);
    setOutput(root, 'capacitanceMicroF', `${formatNumber(state.parameters.capacitanceMicroF, 0)} µF`);
    setOutput(root, 'resistanceOhm', `R = ${formatOhm(point.resistanceOhm)} Ω`);
    setOutput(root, 'capacitanceF', `C = ${formatScientific(point.capacitanceF, 2)} F`);
    setOutput(root, 'speed', `× ${formatNumber(state.speed, state.speed % 1 === 0 ? 0 : 2)}`);
    setOutput(root, 'timeSeconds', `${formatNumber(point.timeSeconds, point.tauSeconds < 0.1 ? 4 : 3)} s`);
    setOutput(root, 'tauSeconds', `${formatNumber(point.tauSeconds, point.tauSeconds < 0.1 ? 3 : 2)} s`);
    setOutput(root, 'capacitorVoltageV', `${formatSigned(point.capacitorVoltageV, 3)} V`);
    setOutput(root, 'resistorVoltageV', `${formatSigned(point.resistorVoltageV, 3)} V`);
    setOutput(root, 'currentMilliA', `${formatSigned(point.currentMilliA, 3)} mA`);
    setOutput(root, 'energyMilliJ', `${formatNumber(point.capacitorEnergyMilliJ, 3)} mJ`);
    setOutput(root, 'normalizedTime', `${formatNumber(point.normalizedTime, 2)} τ`);

    elements.timeCursor.value = String(point.normalizedTime);
    elements.graphSummary.textContent = describeRcState(point);

    renderCurves();
    renderMarker(point);
    renderCircuit(point);
    renderLaw(point);
  }

  function resetForScientificChange() {
    stopAnimation();
    state.parameters = readParameters();
    state.timeSeconds = 0;
    state.curveKey = '';
    setStatus('ready');
    renderReferenceTable();
    render();
  }

  function animationFrame(timestamp) {
    if (state.destroyed || state.status !== 'running') return;
    const tau = computeTimeConstantSeconds(state.parameters);
    const maxTime = GRAPH.maxTau * tau;

    if (state.lastTimestamp == null) state.lastTimestamp = timestamp;
    const deltaSeconds = Math.min(0.1, (timestamp - state.lastTimestamp) / 1000);
    state.lastTimestamp = timestamp;
    state.timeSeconds += deltaSeconds * state.speed;

    if (state.timeSeconds >= maxTime) {
      state.timeSeconds = maxTime;
      stopAnimation();
      setStatus('complete');
      render();
      return;
    }

    render();
    state.rafId = requestAnimationFrame(animationFrame);
  }

  function startOrPause() {
    if (state.status === 'running') {
      stopAnimation();
      setStatus('paused');
      render();
      return;
    }

    const maxTime = GRAPH.maxTau * computeTimeConstantSeconds(state.parameters);
    if (state.timeSeconds >= maxTime) state.timeSeconds = 0;
    setStatus('running');
    state.lastTimestamp = null;
    state.rafId = requestAnimationFrame(animationFrame);
    render();
  }

  elements.modeInputs.forEach((input) => input.addEventListener('change', resetForScientificChange, { signal }));
  [elements.voltageInput, elements.resistanceInput, elements.capacitanceInput]
    .forEach((input) => input.addEventListener('input', resetForScientificChange, { signal }));

  elements.speedInput.addEventListener('input', () => {
    state.speed = Number(elements.speedInput.value);
    render();
  }, { signal });

  elements.tangentInput.addEventListener('change', () => {
    state.showTangent = elements.tangentInput.checked;
    state.curveKey = '';
    render();
  }, { signal });

  elements.timeCursor.addEventListener('input', () => {
    stopAnimation();
    const tau = computeTimeConstantSeconds(state.parameters);
    state.timeSeconds = Number(elements.timeCursor.value) * tau;
    setStatus(state.timeSeconds >= GRAPH.maxTau * tau ? 'complete' : 'paused');
    render();
  }, { signal });

  elements.runButton.addEventListener('click', startOrPause, { signal });

  elements.resetButton.addEventListener('click', () => {
    stopAnimation();
    state.timeSeconds = 0;
    setStatus('ready');
    render();
    elements.runButton.focus();
  }, { signal });

  elements.jumpTauButton.addEventListener('click', () => {
    stopAnimation();
    state.timeSeconds = computeTimeConstantSeconds(state.parameters);
    setStatus('paused');
    render();
  }, { signal });

  elements.recordTrialButton.addEventListener('click', () => {
    const trial = {
      resistanceKOhm: state.parameters.resistanceKOhm,
      capacitanceMicroF: state.parameters.capacitanceMicroF,
      tauSeconds: computeTimeConstantSeconds(state.parameters),
    };
    state.trials.push(trial);
    if (state.trials.length > 2) state.trials.shift();
    renderTrials();
    elements.stateText.textContent = `Essai ${state.trials.length === 1 ? 'A' : 'B'} mémorisé`;
  }, { signal });

  elements.clearTrialsButton.addEventListener('click', () => {
    state.trials = [];
    renderTrials();
    elements.stateText.textContent = 'Comparaison effacée';
  }, { signal });

  function cleanup() {
    if (state.destroyed) return;
    state.destroyed = true;
    stopAnimation();
    abortController.abort();
    root.dataset.crcInitialized = 'false';
  }

  document.addEventListener('astro:before-swap', cleanup, { once: true, signal });
  window.addEventListener('pagehide', cleanup, { once: true, signal });

  setStatus('ready');
  renderReferenceTable();
  renderTrials();
  render();

  return cleanup;
}
