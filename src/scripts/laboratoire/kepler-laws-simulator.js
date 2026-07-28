import {
  DEFAULT_KEPLER_PARAMETERS,
  computeOrbitState,
  createEqualTimeSectorComparison,
  createOrbitSeries,
  createThirdLawRows,
  describeOrbitState,
  normalizeKeplerParameters,
} from './kepler-laws-model.js';

const ORBIT_BOX = Object.freeze({ x: 70, y: 48, width: 580, height: 390 });
const CHART_BOX = Object.freeze({ x: 70, y: 30, width: 600, height: 220 });
const ORBIT_DURATION_SECONDS_AT_NORMAL_SPEED = 12;

const formatters = {
  one: new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
  two: new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  three: new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
  percent3: new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
};

function query(root, selector) {
  return root.querySelector(selector);
}

function queryAll(root, selector) {
  return [...root.querySelectorAll(selector)];
}

function setText(root, selector, value) {
  const node = query(root, selector);
  if (node) node.textContent = value;
}

function setAttribute(node, name, value) {
  if (node) node.setAttribute(name, String(value));
}

function setSvgPosition(node, x, y) {
  setAttribute(node, 'cx', x);
  setAttribute(node, 'cy', y);
}

function setTextPosition(node, x, y, anchor = 'start') {
  setAttribute(node, 'x', x);
  setAttribute(node, 'y', y);
  setAttribute(node, 'text-anchor', anchor);
}

function createCoordinateMapper(geometry) {
  const xMin = -geometry.a * (1 + geometry.eccentricity);
  const xMax = geometry.a * (1 - geometry.eccentricity);
  const yMin = -geometry.b;
  const yMax = geometry.b;
  const centerXAu = (xMin + xMax) / 2;
  const centerYAu = 0;
  const scale = Math.min(
    ORBIT_BOX.width / ((xMax - xMin) * 1.12),
    ORBIT_BOX.height / ((yMax - yMin) * 1.12),
  );
  const centerXPx = ORBIT_BOX.x + ORBIT_BOX.width / 2;
  const centerYPx = ORBIT_BOX.y + ORBIT_BOX.height / 2;

  return ({ xAu, yAu }) => ({
    x: centerXPx + (xAu - centerXAu) * scale,
    y: centerYPx - (yAu - centerYAu) * scale,
  });
}

function pathFromPoints(points, mapPoint, close = false) {
  if (!points.length) return '';
  const commands = points.map((point, index) => {
    const mapped = mapPoint(point);
    return `${index === 0 ? 'M' : 'L'} ${mapped.x.toFixed(2)} ${mapped.y.toFixed(2)}`;
  });
  if (close) commands.push('Z');
  return commands.join(' ');
}

function buildSectorPath(sector, mapPoint) {
  const points = [{ xAu: 0, yAu: 0 }, ...sector.orbitPoints, { xAu: 0, yAu: 0 }];
  return pathFromPoints(points, mapPoint, true);
}

function renderThirdLawTable(root, rows) {
  const body = query(root, '[data-third-law-body]');
  if (!body) return;
  body.innerHTML = rows.map((row) => `
    <tr${row.isCurrent ? ' class="is-current"' : ''}>
      <td>${formatters.two.format(row.semiMajorAxisAu)}</td>
      <td>${formatters.three.format(row.periodYears)}</td>
      <td>${formatters.three.format(row.ratioYear2PerAu3)}</td>
    </tr>
  `).join('');
}

function renderOrbit(root, series, currentState, sectors, sectorsVisible) {
  const mapPoint = createCoordinateMapper(series.geometry);
  const orbitPath = query(root, '[data-orbit-path]');
  setAttribute(orbitPath, 'd', pathFromPoints(series.points, mapPoint, true));

  const sun = mapPoint({ xAu: 0, yAu: 0 });
  const secondFocus = mapPoint(series.geometry.secondFocus);
  const center = mapPoint(series.geometry.center);
  const perihelion = mapPoint({ xAu: series.geometry.perihelionDistanceAu, yAu: 0 });
  const aphelion = mapPoint({ xAu: -series.geometry.aphelionDistanceAu, yAu: 0 });
  const planet = mapPoint(currentState);

  const sunGroup = query(root, '[data-sun]');
  setAttribute(sunGroup, 'transform', `translate(${sun.x.toFixed(2)} ${sun.y.toFixed(2)})`);

  const planetGroup = query(root, '[data-planet]');
  setAttribute(planetGroup, 'transform', `translate(${planet.x.toFixed(2)} ${planet.y.toFixed(2)})`);

  setSvgPosition(query(root, '[data-second-focus]'), secondFocus.x, secondFocus.y);
  setTextPosition(query(root, '[data-second-focus-label]'), secondFocus.x, secondFocus.y - 13, 'middle');
  setSvgPosition(query(root, '[data-center]'), center.x, center.y);
  setTextPosition(query(root, '[data-center-label]'), center.x, center.y + 25, 'middle');
  setSvgPosition(query(root, '[data-peri-point]'), perihelion.x, perihelion.y);
  setTextPosition(query(root, '[data-peri-label]'), perihelion.x, perihelion.y - 16, 'middle');
  setSvgPosition(query(root, '[data-aphe-point]'), aphelion.x, aphelion.y);
  setTextPosition(query(root, '[data-aphe-label]'), aphelion.x, aphelion.y - 16, 'middle');

  const vector = query(root, '[data-position-vector]');
  setAttribute(vector, 'x1', sun.x);
  setAttribute(vector, 'y1', sun.y);
  setAttribute(vector, 'x2', planet.x);
  setAttribute(vector, 'y2', planet.y);

  const sectorA = query(root, '[data-sector-a]');
  const sectorB = query(root, '[data-sector-b]');
  setAttribute(sectorA, 'd', buildSectorPath(sectors.sectorA, mapPoint));
  setAttribute(sectorB, 'd', buildSectorPath(sectors.sectorB, mapPoint));
  if (sectorA) sectorA.hidden = !sectorsVisible;
  if (sectorB) sectorB.hidden = !sectorsVisible;

  setText(root, '[data-orbit-desc]', describeOrbitState(currentState));
}

function renderSpeedChart(root, series, currentState) {
  const speeds = series.points.map((point) => point.speedKmPerSecond);
  const minimum = Math.min(...speeds);
  const maximum = Math.max(...speeds);
  const padding = Math.max((maximum - minimum) * 0.08, maximum * 0.02, 0.25);
  const yMin = Math.max(0, minimum - padding);
  const yMax = maximum + padding;

  const mapChart = (point) => ({
    x: CHART_BOX.x + point.plottedOrbitFraction * CHART_BOX.width,
    y: CHART_BOX.y + CHART_BOX.height
      - ((point.speedKmPerSecond - yMin) / (yMax - yMin)) * CHART_BOX.height,
  });

  const path = query(root, '[data-speed-path]');
  setAttribute(path, 'd', pathFromPoints(series.points, mapChart));

  const fraction = currentState.orbitFraction;
  const markerX = CHART_BOX.x + fraction * CHART_BOX.width;
  const markerY = CHART_BOX.y + CHART_BOX.height
    - ((currentState.speedKmPerSecond - yMin) / (yMax - yMin)) * CHART_BOX.height;
  const cursor = query(root, '[data-speed-cursor]');
  setAttribute(cursor, 'x1', markerX);
  setAttribute(cursor, 'x2', markerX);
  const point = query(root, '[data-speed-point]');
  setAttribute(point, 'cx', markerX);
  setAttribute(point, 'cy', markerY);

  setText(root, '[data-speed-max-label]', formatters.one.format(yMax));
  setText(root, '[data-speed-min-label]', formatters.one.format(yMin));
  setText(
    root,
    '[data-speed-summary]',
    `À t/T = ${formatters.three.format(fraction)}, la vitesse vaut ${formatters.two.format(currentState.speedKmPerSecond)} km·s⁻¹. Elle est maximale près du périhélie et minimale près de l’aphélie.`,
  );
  setText(
    root,
    '[data-speed-desc]',
    `Courbe de la vitesse sur une période : minimum ${formatters.two.format(minimum)} km par seconde et maximum ${formatters.two.format(maximum)} km par seconde.`,
  );
}

export function initKeplerLawsSimulator(root) {
  if (!(root instanceof HTMLElement)) return () => {};

  let parameters = normalizeKeplerParameters(DEFAULT_KEPLER_PARAMETERS);
  let timeYears = 0;
  let speedMultiplier = 1;
  let running = false;
  let sectorsVisible = true;
  let frameId = 0;
  let previousTimestamp = 0;
  let previousReducedRenderTimestamp = 0;
  let cachedKey = '';
  let cachedSeries = null;
  let destroyed = false;
  const cleanupCallbacks = [];
  const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');

  const listen = (target, type, handler, options) => {
    target?.addEventListener(type, handler, options);
    cleanupCallbacks.push(() => target?.removeEventListener(type, handler, options));
  };

  const getPeriod = () => Math.sqrt(parameters.semiMajorAxisAu ** 3);

  const getSeries = () => {
    const key = `${parameters.semiMajorAxisAu}|${parameters.eccentricity}`;
    if (!cachedSeries || cachedKey !== key) {
      cachedSeries = createOrbitSeries(parameters, { sampleCount: 321 });
      cachedKey = key;
    }
    return cachedSeries;
  };

  const setStatus = (message, state = 'ready') => {
    setText(root, '[data-sim-state-text]', message);
    root.dataset.simulationState = state;
  };

  const stopAnimation = (message = 'Simulation en pause') => {
    running = false;
    previousTimestamp = 0;
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
    setText(root, '[data-play-label]', 'Reprendre');
    setStatus(message, 'paused');
  };

  const render = () => {
    if (destroyed) return;
    const periodYears = getPeriod();
    timeYears = Math.min(Math.max(timeYears, 0), periodYears);
    const currentState = computeOrbitState(parameters, timeYears === periodYears ? 0 : timeYears);
    const series = getSeries();
    const sectors = createEqualTimeSectorComparison(parameters, {
      deltaTFraction: parameters.deltaTFraction,
      sampleCount: 181,
    });

    setText(root, '[data-param-output="semiMajorAxisAu"]', `${formatters.two.format(parameters.semiMajorAxisAu)} UA`);
    setText(root, '[data-param-output="eccentricity"]', formatters.two.format(parameters.eccentricity));
    setText(root, '[data-param-output="deltaTYears"]', `${formatters.three.format(sectors.durationYears)} an`);
    setText(root, '[data-delta-help]', `${formatters.one.format(parameters.deltaTFraction * 100)} % de la période orbitale.`);

    const orbitPercent = periodYears === 0 ? 0 : (timeYears / periodYears) * 100;
    setText(root, '[data-output="orbitPercent"]', `${formatters.one.format(orbitPercent)} %`);
    setText(root, '[data-output="timeYears"]', `${formatters.three.format(timeYears)} an`);
    setText(root, '[data-output="periodYears"]', `${formatters.three.format(periodYears)} an`);
    setText(root, '[data-output="radiusAu"]', `${formatters.three.format(currentState.radiusAu)} UA`);
    setText(root, '[data-output="speedKmPerSecond"]', `${formatters.two.format(currentState.speedKmPerSecond)} km·s⁻¹`);
    setText(root, '[data-output="semiMinorAxisAu"]', `${formatters.three.format(currentState.b)} UA`);
    setText(root, '[data-output="focusDistanceAu"]', `${formatters.three.format(currentState.c)} UA`);
    setText(root, '[data-output="orbitalZone"]', currentState.orbitalZone === 'orbite'
      ? 'Entre périhélie et aphélie'
      : currentState.orbitalZone[0].toUpperCase() + currentState.orbitalZone.slice(1));
    setText(
      root,
      '[data-output="solverStatus"]',
      currentState.solverConverged
        ? `Résolution convergée en ${currentState.solverIterations} itération${currentState.solverIterations > 1 ? 's' : ''} ; résidu < 10⁻¹² rad.`
        : 'La résolution de l’équation de Kepler n’a pas convergé.',
    );

    setText(root, '[data-output="sectorAreaA"]', `${formatters.three.format(sectors.sectorA.polygonAreaAu2)} UA²`);
    setText(root, '[data-output="sectorAreaB"]', `${formatters.three.format(sectors.sectorB.polygonAreaAu2)} UA²`);
    setText(root, '[data-output="sectorSpeedA"]', `Vitesse initiale : ${formatters.two.format(sectors.sectorA.startState.speedKmPerSecond)} km·s⁻¹`);
    setText(root, '[data-output="sectorSpeedB"]', `Vitesse initiale : ${formatters.two.format(sectors.sectorB.startState.speedKmPerSecond)} km·s⁻¹`);
    setText(root, '[data-output="sectorDifference"]', `${formatters.percent3.format(sectors.polygonRelativeDifference * 100)} %`);
    setText(
      root,
      '[data-output="sectorTolerance"]',
      `Tolérance numérique annoncée : ${formatters.one.format(sectors.announcedPolygonTolerance * 100)} %.`,
    );

    const ratio = currentState.periodYears ** 2 / currentState.a ** 3;
    setText(root, '[data-output="thirdLawCurrent"]', `T²/a³ = ${formatters.three.format(ratio)} an²·UA⁻³`);

    const timeSlider = query(root, '[data-time-slider]');
    if (timeSlider instanceof HTMLInputElement) {
      timeSlider.value = String(Math.round((timeYears / periodYears) * 1000));
    }

    renderOrbit(root, series, currentState, sectors, sectorsVisible);
    renderSpeedChart(root, series, currentState);
    renderThirdLawTable(root, createThirdLawRows(parameters.semiMajorAxisAu));

    setText(root, '[data-accessible-summary]', `${describeOrbitState(currentState)} ; les deux secteurs de durée ${sectors.durationYears.toFixed(3)} an ont un écart relatif de ${(sectors.polygonRelativeDifference * 100).toFixed(3)} pour cent.`);
  };

  const resetToStart = (message = 'Orbite réinitialisée au périhélie') => {
    running = false;
    previousTimestamp = 0;
    timeYears = 0;
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
    setText(root, '[data-play-label]', 'Lancer');
    setStatus(message, 'ready');
    render();
  };

  const animate = (timestamp) => {
    if (!running || destroyed) return;
    if (!previousTimestamp) previousTimestamp = timestamp;
    const elapsedSeconds = Math.min((timestamp - previousTimestamp) / 1000, 0.1);
    previousTimestamp = timestamp;
    const periodYears = getPeriod();
    timeYears += elapsedSeconds * periodYears / ORBIT_DURATION_SECONDS_AT_NORMAL_SPEED * speedMultiplier;

    if (timeYears >= periodYears) {
      timeYears %= periodYears;
      setStatus('Une période achevée : le mouvement se poursuit', 'running');
    }

    const shouldRender = !reducedMotionMedia.matches || timestamp - previousReducedRenderTimestamp >= 220;
    if (shouldRender) {
      render();
      previousReducedRenderTimestamp = timestamp;
    }
    frameId = requestAnimationFrame(animate);
  };

  const startAnimation = () => {
    if (running) return;
    if (timeYears >= getPeriod()) timeYears = 0;
    running = true;
    previousTimestamp = 0;
    setText(root, '[data-play-label]', 'Mettre en pause');
    setStatus(
      reducedMotionMedia.matches
        ? 'Animation par étapes, conformément à la préférence de mouvement réduit'
        : 'La planète avance avec un temps uniforme',
      'running',
    );
    frameId = requestAnimationFrame(animate);
  };

  queryAll(root, '[data-param]').forEach((control) => {
    listen(control, 'input', () => {
      if (!(control instanceof HTMLInputElement)) return;
      const key = control.dataset.param;
      if (!key) return;
      parameters = normalizeKeplerParameters({ ...parameters, [key]: Number(control.value) });
      cachedSeries = null;
      resetToStart('Paramètre modifié : l’orbite recommence au périhélie');
    });
  });

  const speedControl = query(root, '[data-speed]');
  listen(speedControl, 'change', () => {
    if (!(speedControl instanceof HTMLSelectElement)) return;
    speedMultiplier = Number(speedControl.value) || 1;
    setStatus(`Vitesse de lecture réglée sur × ${speedControl.value.replace('.', ',')}`, running ? 'running' : 'ready');
  });

  const timeSlider = query(root, '[data-time-slider]');
  listen(timeSlider, 'input', () => {
    if (!(timeSlider instanceof HTMLInputElement)) return;
    if (running) stopAnimation('Animation mise en pause pour la lecture temporelle');
    timeYears = Number(timeSlider.value) / 1000 * getPeriod();
    render();
  });

  listen(query(root, '[data-action="toggle"]'), 'click', () => {
    if (running) stopAnimation();
    else startAnimation();
  });

  listen(query(root, '[data-action="reset"]'), 'click', () => resetToStart());

  listen(query(root, '[data-action="perihelion"]'), 'click', () => {
    if (running) stopAnimation('Position fixée au périhélie');
    timeYears = 0;
    setStatus('Périhélie : distance minimale et vitesse maximale', 'ready');
    render();
  });

  listen(query(root, '[data-action="aphelion"]'), 'click', () => {
    if (running) stopAnimation('Position fixée à l’aphélie');
    timeYears = 0.5 * getPeriod();
    setStatus('Aphélie : distance maximale et vitesse minimale', 'ready');
    render();
  });

  const sectorsButton = query(root, '[data-action="compare-sectors"]');
  listen(sectorsButton, 'click', () => {
    sectorsVisible = !sectorsVisible;
    if (sectorsButton instanceof HTMLButtonElement) {
      sectorsButton.setAttribute('aria-pressed', String(sectorsVisible));
      sectorsButton.textContent = sectorsVisible ? 'Masquer les secteurs égaux' : 'Afficher les secteurs égaux';
    }
    setStatus(
      sectorsVisible ? 'Deux secteurs de même durée sont affichés' : 'Les secteurs comparatifs sont masqués',
      running ? 'running' : 'ready',
    );
    render();
  });

  const reducedMotionChange = () => {
    if (running) {
      setStatus(
        reducedMotionMedia.matches
          ? 'Animation par étapes activée pour réduire le mouvement'
          : 'Animation continue rétablie',
        'running',
      );
    }
  };
  listen(reducedMotionMedia, 'change', reducedMotionChange);

  const cleanup = () => {
    if (destroyed) return;
    destroyed = true;
    running = false;
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
    cleanupCallbacks.splice(0).forEach((callback) => callback());
    root.dataset.kplInitialized = 'false';
  };

  const beforeSwap = () => cleanup();
  listen(document, 'astro:before-swap', beforeSwap, { once: true });

  render();
  return cleanup;
}
