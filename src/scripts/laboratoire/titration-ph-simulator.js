import {
  buildParallelTangents,
  clamp,
  computeAnalyteConcentrationFromReadEquivalence,
  computeEquivalentVolumeMl,
  computeTitrationState,
  describeLimitingReagent,
  formatDecimal,
  generateTitrationCurve,
  getPreset,
  interpolateCurvePH,
  normalizeParameters,
} from './titration-ph-model.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const ROOT_SELECTOR = '[data-titration-ph-root]';
const GLOBAL_KEY = '__astroTitrationPhRuntime__';

const GRAPH = Object.freeze({
  x: 82,
  y: 28,
  width: 642,
  height: 334,
  pHMin: 0,
  pHMax: 14,
});

const ADDITION_RATE_ML_PER_SECOND = 1.4;
const MANUAL_DROP_ML = 0.05;
const DISPLAY_FRAME_MS = 45;

/** @param {Element | null} element @param {string} name */
function requireElement(element, name) {
  if (!element) throw new Error(`Élément requis introuvable : ${name}`);
  return element;
}

/** @param {number} value @param {number} digits */
function fr(value, digits = 2) {
  return formatDecimal(value, digits);
}

/** @param {number} value */
function formatMolesAsMillimoles(value) {
  return `${fr(value * 1000, 3)} mmol`;
}

/** @param {number} maxValue */
function chooseNiceTickStep(maxValue) {
  const rough = maxValue / 6;
  const exponent = 10 ** Math.floor(Math.log10(Math.max(rough, 1e-9)));
  const normalized = rough / exponent;
  let nice = 1;
  if (normalized > 5) nice = 10;
  else if (normalized > 2) nice = 5;
  else if (normalized > 1) nice = 2;
  return nice * exponent;
}

/** @param {string} tag @param {Record<string, string | number>} attributes */
function svgElement(tag, attributes = {}) {
  const element = document.createElementNS(SVG_NS, tag);
  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, String(value));
  });
  return element;
}

class TitrationPhController {
  /** @param {HTMLElement} root */
  constructor(root) {
    this.root = root;
    this.abortController = new AbortController();
    this.signal = this.abortController.signal;
    this.timeouts = new Set();
    this.animationFrame = null;
    this.lastAnimationTime = null;
    this.lastDisplayTime = 0;
    this.running = false;
    this.completed = false;
    this.speed = 1;
    this.stepVolumeMl = 0.5;
    this.addedVolumeMl = 0;
    this.cursorVolumeMl = 0;
    this.readEquivalenceVolumeMl = 0;
    this.records = [];
    this.tangentConstruction = null;
    this.showTheoreticalReference = false;
    this.challengeMode = false;
    this.dragPointerId = null;
    this.reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reducedMotion = this.reducedMotionQuery.matches;

    this.cacheElements();
    this.parameters = this.readParameters();
    this.rebuildScientificData();
    this.bindEvents();
    this.renderAll({ announce: false });
  }

  cacheElements() {
    const q = (selector) => this.root.querySelector(selector);
    const qa = (selector) => [...this.root.querySelectorAll(selector)];

    this.elements = {
      parameterControls: qa('[data-param]'),
      outputAnalyteConcentration: requireElement(q('[data-output="analyteConcentration"]'), 'sortie C_A'),
      outputAnalyteVolume: requireElement(q('[data-output="analyteVolumeMl"]'), 'sortie V_A'),
      outputTitrantConcentration: requireElement(q('[data-output="titrantConcentration"]'), 'sortie C_B'),
      outputSpeed: requireElement(q('[data-output="speed"]'), 'sortie vitesse'),
      outputCursorVolume: requireElement(q('[data-output="cursorVolume"]'), 'sortie curseur'),
      reactionEquation: requireElement(q('[data-reaction-equation]'), 'équation'),
      simulationState: requireElement(q('[data-sim-state]'), 'état de simulation'),
      simulationStateText: requireElement(q('[data-sim-state-text]'), 'texte d’état'),
      runLabel: requireElement(q('[data-run-label]'), 'libellé démarrer/pause'),
      toggleRunButton: requireElement(q('[data-action="toggle-run"]'), 'bouton démarrer'),
      addDropButton: requireElement(q('[data-action="add-drop"]'), 'bouton goutte'),
      addStepButton: requireElement(q('[data-action="add-step"]'), 'bouton petit volume'),
      resetButton: requireElement(q('[data-action="reset"]'), 'bouton réinitialiser'),
      toggleChallengeButton: requireElement(q('[data-action="toggle-challenge"]'), 'bouton mode défi'),
      stepSelect: requireElement(q('[data-control="step-volume"]'), 'sélecteur de pas'),
      speedControl: requireElement(q('[data-control="speed"]'), 'curseur de vitesse'),
      cursorControl: requireElement(q('[data-control="cursor-volume"]'), 'curseur de lecture'),
      readVolumeInput: requireElement(q('[data-control="read-ve"]'), 'champ V_E lu'),
      graph: requireElement(q('[data-graph]'), 'graphique'),
      graphGrid: requireElement(q('[data-graph-grid]'), 'grille du graphique'),
      graphAxes: requireElement(q('[data-graph-axes]'), 'axes du graphique'),
      graphCurve: requireElement(q('[data-graph-curve]'), 'courbe'),
      graphTangents: requireElement(q('[data-graph-tangents]'), 'groupe des tangentes'),
      tangentLeft: requireElement(q('[data-tangent-left]'), 'tangente gauche'),
      tangentRight: requireElement(q('[data-tangent-right]'), 'tangente droite'),
      tangentMiddle: requireElement(q('[data-tangent-middle]'), 'parallèle médiane'),
      cursorLine: requireElement(q('[data-cursor-line]'), 'ligne du curseur'),
      currentPoint: requireElement(q('[data-current-point]'), 'point courant'),
      readPoint: requireElement(q('[data-read-point]'), 'point de lecture'),
      graphDescription: requireElement(q('[data-graph-description]'), 'description du graphique'),
      graphSummary: requireElement(q('[data-graph-summary]'), 'résumé du graphique'),
      pH: requireElement(q('[data-measure="pH"]'), 'pH'),
      addedVolume: requireElement(q('[data-measure="addedVolume"]'), 'volume versé'),
      totalVolume: requireElement(q('[data-measure="totalVolume"]'), 'volume total'),
      extent: requireElement(q('[data-measure="extent"]'), 'avancement'),
      limiting: requireElement(q('[data-measure="limiting"]'), 'réactif limitant'),
      limitingDescription: requireElement(q('[data-limiting-description]'), 'description stœchiométrique'),
      buretteLiquid: requireElement(q('[data-burette-liquid]'), 'niveau burette'),
      beakerLiquid: requireElement(q('[data-beaker-liquid]'), 'niveau bécher'),
      drop: requireElement(q('[data-drop]'), 'goutte'),
      stirBar: requireElement(q('[data-stir-bar]'), 'barreau agitateur'),
      useCursorButton: requireElement(q('[data-action="use-cursor"]'), 'bouton retenir lecture'),
      tangentButton: requireElement(q('[data-action="build-tangents"]'), 'bouton tangentes'),
      toggleReferenceButton: requireElement(q('[data-action="toggle-reference"]'), 'bouton référence'),
      tangentResult: requireElement(q('[data-tangent-result]'), 'résultat tangentes'),
      tangentText: requireElement(q('[data-tangent-text]'), 'texte tangentes'),
      theoreticalReference: requireElement(q('[data-theoretical-reference]'), 'référence théorique'),
      theoreticalText: requireElement(q('[data-theoretical-text]'), 'texte référence théorique'),
      recordButton: requireElement(q('[data-action="record-point"]'), 'bouton relever'),
      clearRecordsButton: requireElement(q('[data-action="clear-records"]'), 'bouton effacer relevés'),
      recordsBody: requireElement(q('[data-records-body]'), 'corps du tableau'),
      calculateButton: requireElement(q('[data-action="calculate-concentration"]'), 'bouton calculer concentration'),
      concentrationResult: requireElement(q('[data-concentration-result]'), 'résultat concentration'),
      concentrationFormula: requireElement(q('[data-concentration-formula]'), 'formule concentration'),
      liveRegion: requireElement(q('[data-live-region]'), 'zone d’annonce'),
    };
  }

  bindEvents() {
    const listenerOptions = { signal: this.signal };

    this.elements.parameterControls.forEach((control) => {
      control.addEventListener('change', () => this.handleParameterChange(), listenerOptions);
    });

    this.elements.stepSelect.addEventListener('change', () => {
      this.stepVolumeMl = Number(this.elements.stepSelect.value);
    }, listenerOptions);

    this.elements.speedControl.addEventListener('input', () => {
      this.speed = Number(this.elements.speedControl.value);
      this.elements.outputSpeed.textContent = `× ${fr(this.speed, this.speed % 1 === 0 ? 0 : 2)}`;
    }, listenerOptions);

    this.elements.toggleRunButton.addEventListener('click', () => this.toggleRunning(), listenerOptions);
    this.elements.addDropButton.addEventListener('click', () => this.addManualVolume(MANUAL_DROP_ML, 'Une goutte a été ajoutée.'), listenerOptions);
    this.elements.addStepButton.addEventListener('click', () => this.addManualVolume(this.stepVolumeMl, `${fr(this.stepVolumeMl, 2)} mL ont été ajoutés.`), listenerOptions);
    this.elements.resetButton.addEventListener('click', () => this.resetExperiment(), listenerOptions);
    this.elements.toggleChallengeButton.addEventListener('click', () => this.toggleChallengeMode(), listenerOptions);

    this.elements.cursorControl.addEventListener('input', () => {
      this.cursorVolumeMl = Number(this.elements.cursorControl.value);
      this.renderCursor();
    }, listenerOptions);

    this.elements.graph.addEventListener('pointerdown', (event) => this.startGraphDrag(event), listenerOptions);
    this.elements.graph.addEventListener('pointermove', (event) => this.moveGraphDrag(event), listenerOptions);
    this.elements.graph.addEventListener('pointerup', (event) => this.endGraphDrag(event), listenerOptions);
    this.elements.graph.addEventListener('pointercancel', (event) => this.endGraphDrag(event), listenerOptions);

    this.elements.useCursorButton.addEventListener('click', () => this.useCursorAsEquivalence(), listenerOptions);
    this.elements.tangentButton.addEventListener('click', () => this.constructTangents(), listenerOptions);
    this.elements.toggleReferenceButton.addEventListener('click', () => this.toggleTheoreticalReference(), listenerOptions);
    this.elements.recordButton.addEventListener('click', () => this.recordCurrentPoint(), listenerOptions);
    this.elements.clearRecordsButton.addEventListener('click', () => this.clearRecords(), listenerOptions);
    this.elements.calculateButton.addEventListener('click', () => this.calculateConcentration(), listenerOptions);

    this.elements.readVolumeInput.addEventListener('input', () => {
      this.readEquivalenceVolumeMl = clamp(Number(this.elements.readVolumeInput.value) || 0, 0, this.maxVolumeMl);
    }, listenerOptions);

    this.reducedMotionQuery.addEventListener('change', (event) => {
      this.reducedMotion = event.matches;
      this.root.classList.toggle('tph-reduced-motion', this.reducedMotion);
    }, listenerOptions);
  }

  readParameters() {
    const values = {};
    this.elements.parameterControls.forEach((control) => {
      const key = control.dataset.param;
      values[key] = control instanceof HTMLSelectElement ? control.value : Number(control.value);
    });
    return normalizeParameters(values);
  }

  handleParameterChange() {
    const previousPreset = this.parameters.presetId;
    this.parameters = this.readParameters();

    // Changing the chemical system keeps the chosen numerical protocol but resets all observations.
    if (this.parameters.presetId !== previousPreset) {
      this.announce(`Nouveau système : ${getPreset(this.parameters.presetId).label}. L’expérience est réinitialisée.`);
    }

    this.resetExperiment({ announce: false, keepParameters: true });
  }

  rebuildScientificData() {
    this.parameters = normalizeParameters(this.parameters);
    this.equivalenceVolumeMl = computeEquivalentVolumeMl(this.parameters);
    this.maxVolumeMl = clamp(
      Math.max(this.equivalenceVolumeMl * 2, this.equivalenceVolumeMl + 10),
      20,
      120,
    );
    const pointCount = Math.max(401, Math.min(1601, Math.ceil(this.maxVolumeMl / 0.05) + 1));
    this.fullCurve = generateTitrationCurve(this.parameters, {
      maxVolumeMl: this.maxVolumeMl,
      points: pointCount,
    });
    this.currentState = computeTitrationState(this.parameters, this.addedVolumeMl);
    this.cursorVolumeMl = clamp(this.cursorVolumeMl, 0, this.maxVolumeMl);

    this.elements.cursorControl.max = String(this.maxVolumeMl);
    this.elements.cursorControl.step = String(Math.max(0.01, this.maxVolumeMl / (pointCount - 1)));
    this.elements.readVolumeInput.max = String(this.maxVolumeMl);
  }

  resetExperiment(options = {}) {
    const { announce = true, keepParameters = true } = options;
    this.stopAnimation();
    if (!keepParameters) this.parameters = this.readParameters();
    this.addedVolumeMl = 0;
    this.cursorVolumeMl = 0;
    this.readEquivalenceVolumeMl = 0;
    this.records = [];
    this.tangentConstruction = null;
    this.showTheoreticalReference = false;
    this.completed = false;
    this.elements.readVolumeInput.value = '0';
    this.elements.concentrationResult.textContent = 'Renseigne d’abord une lecture graphique de Vₑ.';
    this.rebuildScientificData();
    this.renderAll({ announce: false });
    this.renderRecords();
    if (announce) this.announce('Expérience réinitialisée.');
  }


  toggleChallengeMode() {
    if (this.running) {
      this.announce('Mets l’expérience en pause avant de modifier le mode défi.');
      return;
    }
    this.challengeMode = !this.challengeMode;
    this.elements.toggleChallengeButton.setAttribute('aria-pressed', String(this.challengeMode));
    this.elements.toggleChallengeButton.innerHTML = this.challengeMode
      ? 'Afficher et modifier C<sub>A</sub>'
      : 'Masquer C<sub>A</sub> pour le mode défi';
    this.renderParameterOutputs();
    this.updateActionAvailability();
    this.announce(this.challengeMode
      ? 'Mode défi activé : la concentration de la solution titrée est maintenant inconnue.'
      : 'Mode défi désactivé : la concentration simulée est de nouveau visible.');
  }

  toggleRunning() {
    if (this.running) {
      this.pauseAnimation();
      this.announce(`Ajout en pause à ${fr(this.addedVolumeMl, 2)} mL.`);
      return;
    }

    if (this.addedVolumeMl >= this.maxVolumeMl - 1e-9) {
      this.announce('Le volume maximal de la burette simulée est atteint. Réinitialise pour recommencer.');
      return;
    }

    this.running = true;
    this.completed = false;
    this.lastAnimationTime = null;
    this.lastDisplayTime = 0;
    this.updateRunState();
    this.animationFrame = window.requestAnimationFrame((time) => this.animate(time));
    this.announce('Ajout continu démarré.');
  }

  pauseAnimation() {
    this.stopAnimation();
    this.updateRunState();
  }

  stopAnimation() {
    this.running = false;
    this.lastAnimationTime = null;
    if (this.animationFrame !== null) {
      window.cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    this.root.classList.remove('is-dropping');
  }

  /** @param {number} timestamp */
  animate(timestamp) {
    if (!this.running) return;

    if (this.lastAnimationTime === null) this.lastAnimationTime = timestamp;
    const elapsedSeconds = Math.min(0.1, (timestamp - this.lastAnimationTime) / 1000);
    this.lastAnimationTime = timestamp;

    this.addedVolumeMl = Math.min(
      this.maxVolumeMl,
      this.addedVolumeMl + ADDITION_RATE_ML_PER_SECOND * this.speed * elapsedSeconds,
    );

    if (timestamp - this.lastDisplayTime >= DISPLAY_FRAME_MS || this.addedVolumeMl >= this.maxVolumeMl) {
      this.lastDisplayTime = timestamp;
      this.currentState = computeTitrationState(this.parameters, this.addedVolumeMl);
      this.cursorVolumeMl = this.addedVolumeMl;
      this.renderAll({ announce: false });
    }

    if (this.addedVolumeMl >= this.maxVolumeMl - 1e-9) {
      this.completed = true;
      this.stopAnimation();
      this.updateRunState();
      this.announce('Ajout terminé : le volume maximal affiché a été atteint.');
      return;
    }

    this.animationFrame = window.requestAnimationFrame((time) => this.animate(time));
  }

  /** @param {number} amountMl @param {string} message */
  addManualVolume(amountMl, message) {
    this.pauseAnimation();
    if (this.addedVolumeMl >= this.maxVolumeMl - 1e-9) {
      this.announce('Le volume maximal est déjà atteint.');
      return;
    }

    this.addedVolumeMl = Math.min(this.maxVolumeMl, this.addedVolumeMl + amountMl);
    this.cursorVolumeMl = this.addedVolumeMl;
    this.currentState = computeTitrationState(this.parameters, this.addedVolumeMl);
    this.pulseDrop();
    this.renderAll({ announce: false });
    this.announce(`${message} Volume total versé : ${fr(this.addedVolumeMl, 2)} mL ; pH ${fr(this.currentState.pH, 2)}.`);
  }

  pulseDrop() {
    if (this.reducedMotion) return;
    this.root.classList.remove('is-dropping');
    // Restart the CSS animation even after repeated clicks.
    void this.root.offsetWidth;
    this.root.classList.add('is-dropping');
    const timeout = window.setTimeout(() => {
      this.root.classList.remove('is-dropping');
      this.timeouts.delete(timeout);
    }, 520);
    this.timeouts.add(timeout);
  }

  renderAll({ announce = false } = {}) {
    this.currentState = computeTitrationState(this.parameters, this.addedVolumeMl);
    this.renderParameterOutputs();
    this.renderReaction();
    this.renderState();
    this.renderApparatus();
    this.renderMeasurements();
    this.renderGraphBase();
    this.renderCurve();
    this.renderCursor();
    this.renderTangents();
    this.renderReferences();
    this.updateRunState();
    this.updateActionAvailability();

    if (announce) {
      this.announce(`Volume versé ${fr(this.addedVolumeMl, 2)} mL ; pH ${fr(this.currentState.pH, 2)}.`);
    }
  }

  renderParameterOutputs() {
    this.elements.outputAnalyteConcentration.textContent = this.challengeMode
      ? 'inconnue'
      : `${fr(this.parameters.analyteConcentration, 3)} mol·L⁻¹`;
    this.elements.outputAnalyteVolume.textContent = `${fr(this.parameters.analyteVolumeMl, 1)} mL`;
    this.elements.outputTitrantConcentration.textContent = `${fr(this.parameters.titrantConcentration, 3)} mol·L⁻¹`;
    this.elements.outputSpeed.textContent = `× ${fr(this.speed, this.speed % 1 === 0 ? 0 : 2)}`;
  }

  renderReaction() {
    const preset = getPreset(this.parameters.presetId);
    this.elements.reactionEquation.textContent = preset.reaction;
    this.elements.concentrationFormula.innerHTML = 'C<sub>A</sub> = C<sub>B</sub> × V<sub>E, lu</sub> / V<sub>A</sub>';
  }

  renderState() {
    let stateName = 'ready';
    let stateText = 'Prêt à manipuler';
    if (this.running) {
      stateName = 'running';
      stateText = 'Ajout en cours';
    } else if (this.completed) {
      stateName = 'finished';
      stateText = 'Ajout terminé';
    } else if (this.addedVolumeMl > 0) {
      stateName = 'paused';
      stateText = 'Expérience en pause';
    }
    this.root.dataset.state = stateName;
    this.elements.simulationState.dataset.state = stateName;
    this.elements.simulationStateText.textContent = stateText;
  }

  renderApparatus() {
    const buretteFraction = clamp(1 - this.addedVolumeMl / this.maxVolumeMl, 0, 1);
    const buretteHeight = 236 * buretteFraction;
    this.elements.buretteLiquid.setAttribute('y', String(40 + 236 - buretteHeight));
    this.elements.buretteLiquid.setAttribute('height', String(buretteHeight));

    const beakerRise = 48 * clamp(this.addedVolumeMl / this.maxVolumeMl, 0, 1);
    const beakerY = 307 - beakerRise;
    this.elements.beakerLiquid.setAttribute('y', String(beakerY));
    this.elements.beakerLiquid.setAttribute('height', String(410 - beakerY));

    this.root.classList.toggle('is-running', this.running);
    this.root.classList.toggle('tph-reduced-motion', this.reducedMotion);
  }

  renderMeasurements() {
    const state = this.currentState;
    this.elements.pH.textContent = fr(state.pH, 2);
    this.elements.addedVolume.textContent = `${fr(state.addedVolumeMl, 2)} mL`;
    this.elements.totalVolume.textContent = `${fr(state.totalVolumeMl, 2)} mL`;
    this.elements.extent.textContent = formatMolesAsMillimoles(state.reactionExtentMoles);

    if (state.limitingReagent === 'equivalence') {
      this.elements.limiting.textContent = 'Aucun : équivalence';
    } else if (state.limitingReagent === 'titrant') {
      this.elements.limiting.textContent = 'Solution titrante B';
    } else {
      this.elements.limiting.textContent = 'Solution titrée A';
    }
    this.elements.limitingDescription.textContent = describeLimitingReagent(state);
  }

  xScale(volumeMl) {
    return GRAPH.x + (clamp(volumeMl, 0, this.maxVolumeMl) / this.maxVolumeMl) * GRAPH.width;
  }

  yScale(pH) {
    const normalized = (clamp(pH, GRAPH.pHMin, GRAPH.pHMax) - GRAPH.pHMin) / (GRAPH.pHMax - GRAPH.pHMin);
    return GRAPH.y + GRAPH.height - normalized * GRAPH.height;
  }

  yScaleUnclamped(pH) {
    const normalized = (pH - GRAPH.pHMin) / (GRAPH.pHMax - GRAPH.pHMin);
    return GRAPH.y + GRAPH.height - normalized * GRAPH.height;
  }

  renderGraphBase() {
    const graphBaseKey = this.maxVolumeMl.toFixed(6);
    if (this.graphBaseKey === graphBaseKey) return;
    this.graphBaseKey = graphBaseKey;
    this.elements.graphGrid.replaceChildren();
    this.elements.graphAxes.replaceChildren();

    const xStep = chooseNiceTickStep(this.maxVolumeMl);
    for (let volume = 0; volume <= this.maxVolumeMl + xStep * 0.25; volume += xStep) {
      const safeVolume = Math.min(volume, this.maxVolumeMl);
      const x = this.xScale(safeVolume);
      this.elements.graphGrid.append(svgElement('line', {
        x1: x,
        x2: x,
        y1: GRAPH.y,
        y2: GRAPH.y + GRAPH.height,
        class: 'tph-grid-line',
      }));
      const label = svgElement('text', {
        x,
        y: GRAPH.y + GRAPH.height + 25,
        'text-anchor': 'middle',
        class: 'tph-tick-label',
      });
      label.textContent = fr(safeVolume, safeVolume % 1 === 0 ? 0 : 1);
      this.elements.graphAxes.append(label);
      if (safeVolume >= this.maxVolumeMl) break;
    }

    for (let pH = 0; pH <= 14; pH += 2) {
      const y = this.yScale(pH);
      this.elements.graphGrid.append(svgElement('line', {
        x1: GRAPH.x,
        x2: GRAPH.x + GRAPH.width,
        y1: y,
        y2: y,
        class: 'tph-grid-line',
      }));
      const label = svgElement('text', {
        x: GRAPH.x - 14,
        y: y + 5,
        'text-anchor': 'end',
        class: 'tph-tick-label',
      });
      label.textContent = String(pH);
      this.elements.graphAxes.append(label);
    }

    this.elements.graphAxes.append(svgElement('path', {
      d: `M ${GRAPH.x} ${GRAPH.y} V ${GRAPH.y + GRAPH.height} H ${GRAPH.x + GRAPH.width}`,
      class: 'tph-axis-line',
    }));
  }

  renderCurve() {
    const observed = this.fullCurve.filter((point) => point.volumeMl <= this.addedVolumeMl + 1e-9);
    const currentPoint = { volumeMl: this.addedVolumeMl, pH: this.currentState.pH };
    if (!observed.length || Math.abs(observed[observed.length - 1].volumeMl - currentPoint.volumeMl) > 1e-9) {
      observed.push(currentPoint);
    }

    const d = observed.map((point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${command} ${this.xScale(point.volumeMl).toFixed(2)} ${this.yScale(point.pH).toFixed(2)}`;
    }).join(' ');
    this.elements.graphCurve.setAttribute('d', d);

    this.elements.currentPoint.setAttribute('cx', String(this.xScale(this.addedVolumeMl)));
    this.elements.currentPoint.setAttribute('cy', String(this.yScale(this.currentState.pH)));

    const initialPH = this.fullCurve[0].pH;
    this.elements.graphDescription.textContent = (
      `Courbe construite de 0 à ${fr(this.addedVolumeMl, 2)} mL. `
      + `Le pH passe de ${fr(initialPH, 2)} à ${fr(this.currentState.pH, 2)}.`
    );
    this.elements.graphSummary.innerHTML = (
      `Points obtenus de V<sub>B</sub> = 0,00 mL à ${fr(this.addedVolumeMl, 2)} mL. `
      + `Le pH courant vaut <strong>${fr(this.currentState.pH, 2)}</strong>.`
    );
  }

  renderCursor() {
    this.cursorVolumeMl = clamp(this.cursorVolumeMl, 0, this.maxVolumeMl);
    this.elements.cursorControl.value = String(this.cursorVolumeMl);
    this.elements.outputCursorVolume.textContent = `${fr(this.cursorVolumeMl, 2)} mL`;

    const cursorPH = interpolateCurvePH(this.fullCurve, this.cursorVolumeMl);
    const x = this.xScale(this.cursorVolumeMl);
    const y = this.yScale(cursorPH);
    this.elements.cursorLine.setAttribute('x1', String(x));
    this.elements.cursorLine.setAttribute('x2', String(x));
    this.elements.readPoint.setAttribute('cx', String(x));
    this.elements.readPoint.setAttribute('cy', String(y));

    const cursorBeyondData = this.cursorVolumeMl > this.addedVolumeMl + 1e-9;
    this.elements.readPoint.toggleAttribute('hidden', cursorBeyondData);
    this.elements.cursorLine.classList.toggle('is-beyond-data', cursorBeyondData);
    this.elements.useCursorButton.disabled = cursorBeyondData || this.cursorVolumeMl <= 0;
  }

  renderTangents() {
    const construction = this.tangentConstruction;
    if (!construction) {
      this.elements.graphTangents.hidden = true;
      this.elements.tangentResult.hidden = true;
      return;
    }

    const createLinePath = (intercept) => {
      const x1Value = 0;
      const x2Value = this.maxVolumeMl;
      const y1Value = construction.slope * x1Value + intercept;
      const y2Value = construction.slope * x2Value + intercept;
      return `M ${this.xScale(x1Value)} ${this.yScaleUnclamped(y1Value)} L ${this.xScale(x2Value)} ${this.yScaleUnclamped(y2Value)}`;
    };

    this.elements.tangentLeft.setAttribute('d', createLinePath(construction.left.intercept));
    this.elements.tangentRight.setAttribute('d', createLinePath(construction.right.intercept));
    this.elements.tangentMiddle.setAttribute('d', createLinePath(construction.middleIntercept));
    this.elements.graphTangents.hidden = false;
    this.elements.tangentResult.hidden = false;
    this.elements.tangentText.textContent = (
      `Vₑ ≈ ${fr(construction.volumeMl, 2)} mL `
      + `(résolution numérique de la courbe : ± ${fr(construction.uncertaintyMl, 2)} mL).`
    );
  }

  renderReferences() {
    this.elements.theoreticalReference.hidden = !this.showTheoreticalReference;
    this.elements.theoreticalText.textContent = `Vₑ,th = ${fr(this.equivalenceVolumeMl, 2)} mL.`;
    this.elements.toggleReferenceButton.textContent = this.showTheoreticalReference
      ? 'Masquer la valeur théorique'
      : 'Afficher la valeur théorique';
  }

  updateRunState() {
    this.elements.runLabel.textContent = this.running
      ? 'Mettre l’ajout en pause'
      : 'Démarrer l’ajout continu';
    this.elements.toggleRunButton.setAttribute('aria-pressed', String(this.running));
    this.renderState();
  }

  updateActionAvailability() {
    const atMaximum = this.addedVolumeMl >= this.maxVolumeMl - 1e-9;
    this.elements.addDropButton.disabled = this.running || atMaximum;
    this.elements.addStepButton.disabled = this.running || atMaximum;
    this.elements.parameterControls.forEach((control) => {
      const isAnalyteConcentration = control.dataset.param === 'analyteConcentration';
      control.disabled = this.running || (this.challengeMode && isAnalyteConcentration);
    });
    this.elements.stepSelect.disabled = this.running;
    this.elements.toggleChallengeButton.disabled = this.running;
    this.elements.tangentButton.disabled = this.running || this.currentState.progressRatio < 1.10;
    this.elements.toggleReferenceButton.disabled = this.running || this.currentState.progressRatio < 0.75;
    this.elements.recordButton.disabled = this.running;
  }

  startGraphDrag(event) {
    if (!(event instanceof PointerEvent)) return;
    this.dragPointerId = event.pointerId;
    this.elements.graph.setPointerCapture(event.pointerId);
    this.updateCursorFromPointer(event);
  }

  moveGraphDrag(event) {
    if (!(event instanceof PointerEvent) || this.dragPointerId !== event.pointerId) return;
    this.updateCursorFromPointer(event);
  }

  endGraphDrag(event) {
    if (!(event instanceof PointerEvent) || this.dragPointerId !== event.pointerId) return;
    if (this.elements.graph.hasPointerCapture(event.pointerId)) {
      this.elements.graph.releasePointerCapture(event.pointerId);
    }
    this.dragPointerId = null;
  }

  updateCursorFromPointer(event) {
    const rect = this.elements.graph.getBoundingClientRect();
    if (rect.width <= 0) return;
    const svgX = ((event.clientX - rect.left) / rect.width) * 760;
    this.cursorVolumeMl = clamp(((svgX - GRAPH.x) / GRAPH.width) * this.maxVolumeMl, 0, this.maxVolumeMl);
    this.renderCursor();
  }

  useCursorAsEquivalence() {
    if (this.cursorVolumeMl > this.addedVolumeMl + 1e-9 || this.cursorVolumeMl <= 0) {
      this.announce('Le curseur doit rester sur la partie de courbe déjà construite.');
      return;
    }
    this.readEquivalenceVolumeMl = this.cursorVolumeMl;
    this.elements.readVolumeInput.value = this.readEquivalenceVolumeMl.toFixed(2);
    this.announce(`Lecture retenue : V E lu égale ${fr(this.readEquivalenceVolumeMl, 2)} millilitres.`);
  }

  constructTangents() {
    if (this.currentState.progressRatio < 1.10) {
      this.announce('Poursuis les ajouts après le saut de pH afin de disposer de points de part et d’autre de l’équivalence.');
      return;
    }

    const collectedCurve = generateTitrationCurve(this.parameters, {
      maxVolumeMl: this.addedVolumeMl,
      points: Math.max(401, Math.ceil(this.addedVolumeMl / 0.025) + 1),
    });
    this.tangentConstruction = buildParallelTangents(collectedCurve);
    this.cursorVolumeMl = this.tangentConstruction.volumeMl;
    this.readEquivalenceVolumeMl = this.tangentConstruction.volumeMl;
    this.elements.readVolumeInput.value = this.readEquivalenceVolumeMl.toFixed(2);
    this.renderCursor();
    this.renderTangents();
    this.announce(`Construction terminée. Lecture graphique approchée : ${fr(this.readEquivalenceVolumeMl, 2)} millilitres.`);
  }

  toggleTheoreticalReference() {
    this.showTheoreticalReference = !this.showTheoreticalReference;
    this.renderReferences();
    if (this.showTheoreticalReference) {
      this.announce(`Valeur théorique affichée : ${fr(this.equivalenceVolumeMl, 2)} millilitres.`);
    }
  }

  recordCurrentPoint() {
    const volumeKey = this.addedVolumeMl.toFixed(3);
    const alreadyRecorded = this.records.some((record) => record.volumeKey === volumeKey);
    if (alreadyRecorded) {
      this.announce('Ce volume est déjà présent dans le tableau.');
      return;
    }

    const situation = this.currentState.limitingReagent === 'equivalence'
      ? 'Équivalence'
      : this.currentState.limitingReagent === 'titrant'
        ? 'Avant l’équivalence'
        : 'Après l’équivalence';

    this.records.push({
      volumeKey,
      volumeMl: this.addedVolumeMl,
      pH: this.currentState.pH,
      situation,
    });
    this.records.sort((a, b) => a.volumeMl - b.volumeMl);
    this.renderRecords();
    this.announce(`Point relevé : ${fr(this.addedVolumeMl, 2)} millilitres, pH ${fr(this.currentState.pH, 2)}.`);
  }

  clearRecords() {
    this.records = [];
    this.renderRecords();
    this.announce('Tableau de mesures effacé.');
  }

  renderRecords() {
    this.elements.recordsBody.replaceChildren();
    if (!this.records.length) {
      const row = document.createElement('tr');
      row.dataset.emptyRow = '';
      const cell = document.createElement('td');
      cell.colSpan = 4;
      cell.textContent = 'Aucun relevé enregistré.';
      row.append(cell);
      this.elements.recordsBody.append(row);
      return;
    }

    this.records.forEach((record, index) => {
      const row = document.createElement('tr');
      const values = [
        String(index + 1),
        fr(record.volumeMl, 2),
        fr(record.pH, 2),
        record.situation,
      ];
      values.forEach((value, columnIndex) => {
        const cell = document.createElement(columnIndex === 0 ? 'th' : 'td');
        if (columnIndex === 0) cell.scope = 'row';
        cell.textContent = value;
        row.append(cell);
      });
      this.elements.recordsBody.append(row);
    });
  }

  calculateConcentration() {
    const readVolume = clamp(Number(this.elements.readVolumeInput.value) || 0, 0, this.maxVolumeMl);
    if (readVolume <= 0) {
      this.elements.concentrationResult.textContent = 'La lecture de Vₑ doit être strictement positive.';
      this.announce('Calcul impossible : renseigne une valeur positive pour le volume équivalent lu.');
      return;
    }

    this.readEquivalenceVolumeMl = readVolume;
    const calculated = computeAnalyteConcentrationFromReadEquivalence(this.parameters, readVolume);
    const relativeError = Math.abs(calculated - this.parameters.analyteConcentration) / this.parameters.analyteConcentration;
    const quality = relativeError <= 0.02
      ? 'La lecture est cohérente avec la valeur simulée.'
      : relativeError <= 0.05
        ? 'La lecture est plausible mais peut être affinée.'
        : 'L’écart est important : replace le curseur ou complète la construction.';

    this.elements.concentrationResult.innerHTML = (
      `<strong>C<sub>A</sub> ≈ ${fr(calculated, 3)} mol·L⁻¹</strong>`
      + `<span>C<sub>B</sub> × V<sub>E, lu</sub> / V<sub>A</sub> = `
      + `${fr(this.parameters.titrantConcentration, 3)} × ${fr(readVolume, 2)} / ${fr(this.parameters.analyteVolumeMl, 1)}</span>`
      + `<span>${quality}</span>`
    );
    this.announce(`Concentration calculée : ${fr(calculated, 3)} mole par litre. ${quality}`);
  }

  announce(message) {
    this.elements.liveRegion.textContent = '';
    const timeout = window.setTimeout(() => {
      this.elements.liveRegion.textContent = message;
      this.timeouts.delete(timeout);
    }, 20);
    this.timeouts.add(timeout);
  }

  destroy() {
    this.stopAnimation();
    this.abortController.abort();
    this.timeouts.forEach((timeout) => window.clearTimeout(timeout));
    this.timeouts.clear();
    this.root.removeAttribute('data-tph-initialized');
  }
}

function getRuntime() {
  if (!window[GLOBAL_KEY]) {
    window[GLOBAL_KEY] = {
      controllers: new Set(),
      bootstrapped: false,
    };
  }
  return window[GLOBAL_KEY];
}

function initializeAll() {
  const runtime = getRuntime();
  document.querySelectorAll(ROOT_SELECTOR).forEach((root) => {
    if (!(root instanceof HTMLElement) || root.dataset.tphInitialized === 'true') return;
    try {
      const controller = new TitrationPhController(root);
      root.dataset.tphInitialized = 'true';
      runtime.controllers.add(controller);
    } catch (error) {
      console.error('[TitrationPhSimulator] Initialisation impossible.', error);
      root.dataset.state = 'error';
      const liveRegion = root.querySelector('[data-live-region]');
      if (liveRegion) liveRegion.textContent = 'La simulation n’a pas pu être initialisée.';
    }
  });
}

function destroyAll() {
  const runtime = getRuntime();
  runtime.controllers.forEach((controller) => controller.destroy());
  runtime.controllers.clear();
}

const runtime = getRuntime();
if (!runtime.bootstrapped) {
  runtime.bootstrapped = true;
  document.addEventListener('astro:page-load', initializeAll);
  document.addEventListener('astro:before-swap', destroyAll);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAll, { once: true });
} else {
  initializeAll();
}
