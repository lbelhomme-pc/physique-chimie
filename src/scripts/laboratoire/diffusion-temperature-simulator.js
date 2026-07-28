import {
  DEFAULT_DIFFUSION_PARAMETERS,
  DISH_RADIUS_UM,
  MAX_SIMULATION_TIME_S,
  advanceCloud,
  buildTheoreticalSeries,
  cloneCloud,
  computeDiffusionComparison,
  createInitialCloud,
  createSeededRandom,
  createStandardNoise,
  normalizeDiffusionParameters,
  summarizeCloud,
} from './diffusion-temperature-model.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const DISH_VIEW = Object.freeze({ cx: 180, cy: 165, radiusPx: 116 });
const CHART = Object.freeze({ x: 78, y: 34, width: 650, height: 330 });
const FIXED_STEP_S = 0.04;
const SAMPLE_INTERVAL_S = 0.4;

const formatters = Object.freeze({
  zero: new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }),
  one: new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
  two: new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  three: new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
});

function query(root, selector) {
  return root.querySelector(selector);
}

function queryAll(root, selector) {
  return Array.from(root.querySelectorAll(selector));
}

function setText(root, selector, value) {
  const element = query(root, selector);
  if (element) element.textContent = String(value);
}

function svgElement(name, attributes = {}) {
  const element = document.createElementNS(SVG_NS, name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
  return element;
}

function pathFromPoints(points, mapPoint) {
  return points.map((point, index) => {
    const mapped = mapPoint(point);
    return `${index === 0 ? 'M' : 'L'} ${mapped.x.toFixed(2)} ${mapped.y.toFixed(2)}`;
  }).join(' ');
}

function metricValue(summary, key) {
  return Number.isFinite(summary?.[key]) ? summary[key] : 0;
}

export function initDiffusionTemperatureSimulator(root) {
  if (!(root instanceof HTMLElement)) return () => {};

  let parameters = normalizeDiffusionParameters(DEFAULT_DIFFUSION_PARAMETERS);
  let comparison = computeDiffusionComparison(parameters);
  let cloudA = [];
  let cloudB = [];
  let random = createSeededRandom(parameters.seed + 1);
  let deposited = false;
  let running = false;
  let stirring = false;
  let speed = 1;
  let simulationTimeS = 0;
  let accumulatorS = 0;
  let lastSampleTimeS = -Infinity;
  let lastTimestamp = 0;
  let frameId = 0;
  let destroyed = false;
  let samplesA = [];
  let samplesB = [];
  let lastLiveSecond = -1;
  const cleanup = [];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const listen = (target, type, handler, options) => {
    target?.addEventListener(type, handler, options);
    cleanup.push(() => target?.removeEventListener(type, handler, options));
  };

  const setStatus = (message, state = 'ready') => {
    setText(root, '[data-sim-state-text]', message);
    root.dataset.simulationState = state;
  };

  const updateComparison = () => {
    comparison = computeDiffusionComparison(parameters);
  };

  const renderControls = () => {
    queryAll(root, '[data-param]').forEach((control) => {
      if (!(control instanceof HTMLInputElement)) return;
      const key = control.dataset.param;
      if (!key) return;
      control.value = String(parameters[key]);
      control.disabled = deposited;
      control.setAttribute('aria-disabled', String(deposited));
    });
    setText(root, '[data-param-output="temperatureA_C"]', `${formatters.zero.format(parameters.temperatureA_C)} °C`);
    setText(root, '[data-param-output="temperatureB_C"]', `${formatters.zero.format(parameters.temperatureB_C)} °C`);

    const toggleButton = query(root, '[data-action="toggle"]');
    if (toggleButton instanceof HTMLButtonElement) toggleButton.disabled = !deposited;
    setText(root, '[data-play-label]', running ? 'Mettre en pause' : simulationTimeS > 0 ? 'Reprendre' : 'Lancer');
  };

  const createParticleElements = () => {
    ['A', 'B'].forEach((label) => {
      const group = query(root, `[data-particles="${label}"]`);
      if (!group) return;
      group.replaceChildren();
      const cloud = label === 'A' ? cloudA : cloudB;
      cloud.forEach((particle) => {
        const circle = svgElement('circle', {
          r: reducedMotion.matches ? 2.8 : 2.4,
          class: `dt-particle dt-particle-${label.toLowerCase()}`,
          'data-particle-id': particle.id,
        });
        group.append(circle);
      });
    });
  };

  const renderCloud = (label, cloud) => {
    const scale = DISH_VIEW.radiusPx / DISH_RADIUS_UM;
    queryAll(root, `[data-particles="${label}"] [data-particle-id]`).forEach((circle) => {
      const id = Number(circle.getAttribute('data-particle-id'));
      const particle = cloud[id];
      if (!particle) return;
      circle.setAttribute('cx', String(DISH_VIEW.cx + particle.x * scale));
      circle.setAttribute('cy', String(DISH_VIEW.cy + particle.y * scale));
    });
  };

  const currentSummaries = () => ({
    A: summarizeCloud(cloudA),
    B: summarizeCloud(cloudB),
  });

  const updateDishDescription = (label, summary, temperatureState) => {
    const element = query(root, `[data-dish-desc="${label}"]`);
    if (!element) return;
    if (!deposited) {
      element.textContent = 'Aucun traceur n’a encore été déposé.';
      return;
    }
    element.textContent = `À ${formatters.zero.format(temperatureState.temperatureC)} degrés Celsius et après ${formatters.one.format(simulationTimeS)} secondes, le nuage contient ${summary.count} traceurs, sa distance RMS vaut ${formatters.one.format(summary.rmsDistanceUm)} micromètres et son centre est décalé de ${formatters.one.format(summary.meanPositionDistanceUm)} micromètres.`;
  };

  const renderMetrics = () => {
    const summaries = currentSummaries();
    const { stateA, stateB, diffusionRatio } = comparison;

    setText(root, '[data-output="time"]', `${formatters.one.format(simulationTimeS)} s`);
    setText(root, '[data-output="temperatureA"]', `${formatters.zero.format(stateA.temperatureC)} °C`);
    setText(root, '[data-output="temperatureB"]', `${formatters.zero.format(stateB.temperatureC)} °C`);
    setText(root, '[data-output="viscosityA"]', `${formatters.three.format(stateA.viscosityMilliPaS)} mPa·s`);
    setText(root, '[data-output="viscosityB"]', `${formatters.three.format(stateB.viscosityMilliPaS)} mPa·s`);
    setText(root, '[data-output="diffusionA"]', `${formatters.two.format(stateA.diffusionUm2S)} µm²·s⁻¹`);
    setText(root, '[data-output="diffusionB"]', `${formatters.two.format(stateB.diffusionUm2S)} µm²·s⁻¹`);
    setText(root, '[data-output="rmsA"]', `${formatters.one.format(metricValue(summaries.A, 'rmsDistanceUm'))} µm`);
    setText(root, '[data-output="rmsB"]', `${formatters.one.format(metricValue(summaries.B, 'rmsDistanceUm'))} µm`);
    setText(root, '[data-output="driftA"]', `${formatters.one.format(metricValue(summaries.A, 'meanPositionDistanceUm'))} µm`);
    setText(root, '[data-output="driftB"]', `${formatters.one.format(metricValue(summaries.B, 'meanPositionDistanceUm'))} µm`);
    setText(root, '[data-output="msdA"]', `${formatters.one.format(metricValue(summaries.A, 'meanSquareDisplacementUm2'))} µm²`);
    setText(root, '[data-output="msdB"]', `${formatters.one.format(metricValue(summaries.B, 'meanSquareDisplacementUm2'))} µm²`);
    setText(root, '[data-output="diffusionRatio"]', formatters.two.format(diffusionRatio));

    updateDishDescription('A', summaries.A, stateA);
    updateDishDescription('B', summaries.B, stateB);

    let summaryText = 'Dépose le traceur puis observe quel nuage s’élargit le plus vite.';
    if (deposited && simulationTimeS === 0) {
      summaryText = 'Les deux nuages sont identiques au départ. Lance l’expérience pour comparer leur dispersion.';
    } else if (simulationTimeS > 0) {
      const wider = summaries.A.rmsDistanceUm === summaries.B.rmsDistanceUm
        ? 'Les deux nuages ont actuellement la même largeur.'
        : summaries.A.rmsDistanceUm > summaries.B.rmsDistanceUm
          ? 'Le nuage A est actuellement le plus large.'
          : 'Le nuage B est actuellement le plus large.';
      summaryText = stirring
        ? `${wider} Le brassage ajoute toutefois un transport organisé : ce protocole ne mesure plus la diffusion seule.`
        : `${wider} Cette comparaison est réalisée sans brassage, avec la même suite aléatoire.`;
    }
    setText(root, '[data-observation-summary]', summaryText);
  };

  const addSample = (force = false) => {
    if (!deposited) return;
    if (!force && simulationTimeS - lastSampleTimeS < SAMPLE_INTERVAL_S) return;
    const summaries = currentSummaries();
    samplesA.push({ timeS: simulationTimeS, meanSquareDisplacementUm2: summaries.A.meanSquareDisplacementUm2 });
    samplesB.push({ timeS: simulationTimeS, meanSquareDisplacementUm2: summaries.B.meanSquareDisplacementUm2 });
    lastSampleTimeS = simulationTimeS;
  };

  const renderChart = () => {
    const grid = query(root, '[data-chart-grid]');
    const axes = query(root, '[data-chart-axes]');
    const theory = query(root, '[data-chart-theory]');
    const measured = query(root, '[data-chart-measured]');
    const cursor = query(root, '[data-chart-cursor]');
    if (!grid || !axes || !theory || !measured || !cursor) return;

    grid.replaceChildren();
    axes.replaceChildren();
    theory.replaceChildren();
    measured.replaceChildren();
    cursor.replaceChildren();

    const theoreticalA = buildTheoreticalSeries(comparison.stateA.diffusionUm2S);
    const theoreticalB = buildTheoreticalSeries(comparison.stateB.diffusionUm2S);
    const observedMaximum = Math.max(
      0,
      ...samplesA.map((point) => point.meanSquareDisplacementUm2),
      ...samplesB.map((point) => point.meanSquareDisplacementUm2),
    );
    const theoryMaximum = Math.max(
      theoreticalA.at(-1).meanSquareDisplacementUm2,
      theoreticalB.at(-1).meanSquareDisplacementUm2,
    );
    const yMaximum = Math.max(100, Math.ceil(Math.max(observedMaximum, theoryMaximum) / 250) * 250);

    const mapPoint = (point) => ({
      x: CHART.x + (point.timeS / MAX_SIMULATION_TIME_S) * CHART.width,
      y: CHART.y + CHART.height - (point.meanSquareDisplacementUm2 / yMaximum) * CHART.height,
    });

    for (let tick = 0; tick <= 6; tick += 1) {
      const time = tick * 10;
      const x = CHART.x + (time / MAX_SIMULATION_TIME_S) * CHART.width;
      grid.append(svgElement('line', { x1: x, y1: CHART.y, x2: x, y2: CHART.y + CHART.height, class: 'dt-grid-line' }));
      const label = svgElement('text', { x, y: CHART.y + CHART.height + 28, 'text-anchor': 'middle', class: 'dt-axis-label' });
      label.textContent = String(time);
      axes.append(label);
    }

    for (let tick = 0; tick <= 5; tick += 1) {
      const value = (yMaximum / 5) * tick;
      const y = CHART.y + CHART.height - (value / yMaximum) * CHART.height;
      grid.append(svgElement('line', { x1: CHART.x, y1: y, x2: CHART.x + CHART.width, y2: y, class: 'dt-grid-line' }));
      const label = svgElement('text', { x: CHART.x - 12, y: y + 5, 'text-anchor': 'end', class: 'dt-axis-label' });
      label.textContent = formatters.zero.format(value);
      axes.append(label);
    }

    axes.append(svgElement('line', { x1: CHART.x, y1: CHART.y + CHART.height, x2: CHART.x + CHART.width, y2: CHART.y + CHART.height, class: 'dt-axis' }));
    axes.append(svgElement('line', { x1: CHART.x, y1: CHART.y, x2: CHART.x, y2: CHART.y + CHART.height, class: 'dt-axis' }));
    const xTitle = svgElement('text', { x: CHART.x + CHART.width / 2, y: 420, 'text-anchor': 'middle', class: 'dt-axis-title' });
    xTitle.textContent = 'Temps t (s)';
    axes.append(xTitle);
    const yTitle = svgElement('text', { x: 20, y: CHART.y + CHART.height / 2, transform: `rotate(-90 20 ${CHART.y + CHART.height / 2})`, 'text-anchor': 'middle', class: 'dt-axis-title' });
    yTitle.textContent = 'Distance quadratique moyenne ⟨r²⟩ (µm²)';
    axes.append(yTitle);

    [
      { points: theoreticalA, className: 'dt-theory dt-theory-a' },
      { points: theoreticalB, className: 'dt-theory dt-theory-b' },
    ].forEach(({ points, className }) => {
      theory.append(svgElement('path', { d: pathFromPoints(points, mapPoint), class: className }));
    });

    [
      { points: samplesA, className: 'dt-measure dt-measure-a', marker: 'circle' },
      { points: samplesB, className: 'dt-measure dt-measure-b', marker: 'square' },
    ].forEach(({ points, className, marker }) => {
      if (points.length > 1) measured.append(svgElement('path', { d: pathFromPoints(points, mapPoint), class: className }));
      points.filter((_, index) => index % 5 === 0 || index === points.length - 1).forEach((point) => {
        const mapped = mapPoint(point);
        if (marker === 'circle') {
          measured.append(svgElement('circle', { cx: mapped.x, cy: mapped.y, r: 4, class: 'dt-marker-a' }));
        } else {
          measured.append(svgElement('rect', { x: mapped.x - 4, y: mapped.y - 4, width: 8, height: 8, class: 'dt-marker-b' }));
        }
      });
    });

    if (deposited) {
      const cursorX = CHART.x + (simulationTimeS / MAX_SIMULATION_TIME_S) * CHART.width;
      cursor.append(svgElement('line', { x1: cursorX, y1: CHART.y, x2: cursorX, y2: CHART.y + CHART.height, class: 'dt-time-cursor' }));
    }

    const chartDesc = query(root, '[data-chart-desc]');
    if (chartDesc) {
      const summaries = currentSummaries();
      chartDesc.textContent = deposited
        ? `À ${formatters.one.format(simulationTimeS)} secondes, la valeur mesurée de r carré moyen vaut ${formatters.one.format(summaries.A.meanSquareDisplacementUm2)} micromètres carrés dans le milieu A et ${formatters.one.format(summaries.B.meanSquareDisplacementUm2)} micromètres carrés dans le milieu B. Les droites fines représentent 4 D t.`
        : 'Le graphique est vide tant que l’expérience n’a pas commencé.';
    }
  };

  const render = () => {
    renderControls();
    renderCloud('A', cloudA);
    renderCloud('B', cloudB);
    renderMetrics();
    renderChart();
    queryAll(root, '[data-stirrer]').forEach((element) => element.toggleAttribute('hidden', !stirring));
    root.dataset.mode = stirring ? 'stirring' : 'diffusion';
  };

  const resetExperiment = ({ keepParameters = true } = {}) => {
    running = false;
    deposited = false;
    simulationTimeS = 0;
    accumulatorS = 0;
    lastSampleTimeS = -Infinity;
    lastTimestamp = 0;
    lastLiveSecond = -1;
    samplesA = [];
    samplesB = [];
    cloudA = [];
    cloudB = [];
    if (!keepParameters) parameters = normalizeDiffusionParameters(DEFAULT_DIFFUSION_PARAMETERS);
    updateComparison();
    random = createSeededRandom(parameters.seed + 1);
    createParticleElements();
    setStatus('Prêt à déposer le traceur', 'ready');
    render();
  };

  const deposit = () => {
    const initial = createInitialCloud({
      particleCount: parameters.particleCount,
      seed: parameters.seed,
    });
    cloudA = cloneCloud(initial);
    cloudB = cloneCloud(initial);
    random = createSeededRandom(parameters.seed + 1);
    deposited = true;
    running = false;
    simulationTimeS = 0;
    accumulatorS = 0;
    lastSampleTimeS = -Infinity;
    samplesA = [];
    samplesB = [];
    createParticleElements();
    addSample(true);
    setStatus('Traceur déposé — deux états initiaux identiques', 'paused');
    render();
  };

  const advanceStep = (deltaTimeS) => {
    const noise = createStandardNoise(cloudA.length, random);
    cloudA = advanceCloud(cloudA, {
      diffusionUm2S: comparison.stateA.diffusionUm2S,
      deltaTimeS,
      standardNoise: noise,
      stirring,
    });
    cloudB = advanceCloud(cloudB, {
      diffusionUm2S: comparison.stateB.diffusionUm2S,
      deltaTimeS,
      standardNoise: noise,
      stirring,
    });
    simulationTimeS = Math.min(MAX_SIMULATION_TIME_S, simulationTimeS + deltaTimeS);
    addSample();
  };

  const animate = (timestamp) => {
    if (destroyed || !running) return;
    if (!lastTimestamp) lastTimestamp = timestamp;
    const realDeltaS = Math.min(0.15, (timestamp - lastTimestamp) / 1000);
    lastTimestamp = timestamp;
    accumulatorS += realDeltaS * speed;

    while (accumulatorS >= FIXED_STEP_S && simulationTimeS < MAX_SIMULATION_TIME_S) {
      advanceStep(FIXED_STEP_S);
      accumulatorS -= FIXED_STEP_S;
    }

    if (simulationTimeS >= MAX_SIMULATION_TIME_S) {
      simulationTimeS = MAX_SIMULATION_TIME_S;
      addSample(true);
      running = false;
      setStatus('Expérience terminée à 60 s', 'finished');
    }

    render();

    const wholeSecond = Math.floor(simulationTimeS);
    if (wholeSecond !== lastLiveSecond && wholeSecond % 5 === 0) {
      lastLiveSecond = wholeSecond;
      const summaries = currentSummaries();
      setText(root, '[data-live-update]', `Temps ${wholeSecond} secondes. Largeur RMS A ${formatters.one.format(summaries.A.rmsDistanceUm)} micromètres. Largeur RMS B ${formatters.one.format(summaries.B.rmsDistanceUm)} micromètres.`);
    }

    if (running) frameId = requestAnimationFrame(animate);
  };

  const toggleRunning = () => {
    if (!deposited) return;
    running = !running;
    lastTimestamp = 0;
    if (running) {
      setStatus(stirring ? 'Brassage et diffusion en cours' : 'Diffusion en cours', 'running');
      frameId = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(frameId);
      setStatus('Expérience en pause — l’état est conservé', 'paused');
      render();
    }
  };

  queryAll(root, '[data-param]').forEach((control) => {
    listen(control, 'input', (event) => {
      const input = event.currentTarget;
      if (!(input instanceof HTMLInputElement) || deposited) return;
      const key = input.dataset.param;
      if (!key) return;
      parameters = normalizeDiffusionParameters({ ...parameters, [key]: Number(input.value) });
      updateComparison();
      render();
    });
  });

  queryAll(root, '[data-mode]').forEach((control) => {
    listen(control, 'change', (event) => {
      const input = event.currentTarget;
      if (!(input instanceof HTMLInputElement) || !input.checked) return;
      stirring = input.value === 'stirring';
      setStatus(
        stirring
          ? 'Mode brassage sélectionné — une advection organisée sera ajoutée'
          : 'Mode diffusion seule sélectionné',
        deposited ? 'paused' : 'ready',
      );
      if (running) {
        running = false;
        cancelAnimationFrame(frameId);
      }
      render();
    });
  });

  listen(query(root, '[data-speed]'), 'change', (event) => {
    const select = event.currentTarget;
    if (select instanceof HTMLSelectElement) speed = Number(select.value) || 1;
  });

  listen(query(root, '[data-action="drop"]'), 'click', deposit);
  listen(query(root, '[data-action="toggle"]'), 'click', toggleRunning);
  listen(query(root, '[data-action="reset"]'), 'click', () => resetExperiment({ keepParameters: true }));
  listen(query(root, '[data-action="new-seed"]'), 'click', () => {
    parameters = normalizeDiffusionParameters({
      ...parameters,
      seed: (parameters.seed + 104729) >>> 0 || 1,
    });
    deposit();
    setStatus('Nouvelle réalisation déposée avec une autre suite aléatoire', 'paused');
  });

  const reducedMotionHandler = () => {
    if (deposited) createParticleElements();
    render();
  };
  listen(reducedMotion, 'change', reducedMotionHandler);

  resetExperiment({ keepParameters: true });

  return () => {
    destroyed = true;
    running = false;
    cancelAnimationFrame(frameId);
    cleanup.splice(0).forEach((dispose) => dispose());
  };
}
