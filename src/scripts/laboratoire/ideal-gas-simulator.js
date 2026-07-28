import {
  DEFAULT_GAS_PARAMETERS,
  PRESSURE_UNITS,
  computeIdealGasState,
  computeLinearRegression,
  convertPressureFromPa,
  createMeasurement,
  createProtocolSeries,
  describeGasState,
  evaluatePrediction,
  getProtocol,
  normalizeGasParameters,
  protocolXValue,
} from './ideal-gas-model.js';

const CHAMBER = Object.freeze({ x: 80, y: 70, height: 250, minWidth: 220, maxWidth: 540 });
const CHART = Object.freeze({ x: 82, y: 45, width: 628, height: 345 });
const MAX_PARTICLES = 72;

const formatters = Object.freeze({
  zero: new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }),
  one: new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
  two: new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  three: new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
  four: new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 4, maximumFractionDigits: 4 }),
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

function setAttribute(element, name, value) {
  if (element) element.setAttribute(name, String(value));
}

function createSvgElement(name, attributes = {}) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', name);
  Object.entries(attributes).forEach(([key, value]) => setAttribute(element, key, value));
  return element;
}

function seededRandomGenerator(seed = 208314) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function createParticleState() {
  const random = seededRandomGenerator();
  return Array.from({ length: MAX_PARTICLES }, (_, index) => {
    const angle = random() * Math.PI * 2;
    const speed = 0.055 + random() * 0.045;
    return {
      index,
      x: 0.04 + random() * 0.92,
      y: 0.05 + random() * 0.90,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 3 + random() * 1.8,
    };
  });
}

function pressureFormat(pressurePa, unit) {
  const definition = PRESSURE_UNITS[unit] ?? PRESSURE_UNITS.kPa;
  const value = convertPressureFromPa(pressurePa, unit);
  const formatter = definition.decimals === 0
    ? formatters.zero
    : definition.decimals === 1
      ? formatters.one
      : formatters.three;
  return `${formatter.format(value)} ${definition.symbol}`;
}

function xFormat(value, protocolId) {
  if (protocolId === 'isochoric') return formatters.one.format(value);
  if (protocolId === 'isothermal') return formatters.three.format(value);
  return formatters.two.format(value);
}

function yTickFormat(value, unit) {
  if (unit === 'Pa') return formatters.zero.format(value);
  if (unit === 'kPa') return formatters.one.format(value);
  return formatters.two.format(value);
}

function measurementXLabel(measurement, protocolId) {
  if (protocolId === 'isochoric') return `${formatters.two.format(measurement.temperatureKelvin)} K`;
  if (protocolId === 'isothermal') return `${formatters.four.format(measurement.x)} L⁻¹`;
  return `${formatters.two.format(measurement.amountMol)} mol`;
}

function protocolHelpText(protocolId) {
  if (protocolId === 'isochoric') {
    return 'Le volume et la quantité de matière sont verrouillés : seule la température varie.';
  }
  if (protocolId === 'isothermal') {
    return 'La température et la quantité de matière sont verrouillées : seul le volume varie. Le graphique utilise 1/V.';
  }
  return 'La température et le volume sont verrouillés : seule la quantité de matière varie.';
}

function predictionPrompt(protocolId) {
  const protocol = getProtocol(protocolId);
  return `Lorsque ${protocol.predictionSubject}, la pression P…`;
}

function predictionWord(value) {
  return {
    increase: 'augmente',
    decrease: 'diminue',
    same: 'reste constante',
  }[value] ?? 'n’est pas définie';
}

function relationConclusion(protocolId) {
  if (protocolId === 'isochoric') {
    return 'À volume et quantité de matière constants, la pression est proportionnelle à la température thermodynamique T.';
  }
  if (protocolId === 'isothermal') {
    return 'À température et quantité de matière constantes, la pression est proportionnelle à 1/V : elle diminue lorsque le volume augmente.';
  }
  return 'À température et volume constants, la pression est proportionnelle à la quantité de matière n.';
}

function createPath(points, mapPoint) {
  return points.map((point, index) => {
    const mapped = mapPoint(point);
    return `${index === 0 ? 'M' : 'L'} ${mapped.x.toFixed(2)} ${mapped.y.toFixed(2)}`;
  }).join(' ');
}

export function initIdealGasSimulator(root) {
  if (!(root instanceof HTMLElement)) return () => {};

  let parameters = normalizeGasParameters(DEFAULT_GAS_PARAMETERS);
  let protocolId = 'isochoric';
  let pressureUnit = 'kPa';
  let animationSpeed = 1;
  let running = false;
  let frameId = 0;
  let previousTimestamp = 0;
  let previousReducedTimestamp = 0;
  let destroyed = false;
  let records = [];
  let prediction = null;
  let modelVisible = false;
  let particles = createParticleState();
  let currentState = computeIdealGasState(parameters);
  const cleanupCallbacks = [];
  const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');

  const listen = (target, type, handler, options) => {
    target?.addEventListener(type, handler, options);
    cleanupCallbacks.push(() => target?.removeEventListener(type, handler, options));
  };

  const setStatus = (message, state = 'ready') => {
    setText(root, '[data-sim-state-text]', message);
    root.dataset.simulationState = state;
  };

  const chamberWidth = () => {
    const fraction = (currentState.volumeL - 5) / (60 - 5);
    return CHAMBER.minWidth + fraction * (CHAMBER.maxWidth - CHAMBER.minWidth);
  };

  const initializeParticleElements = () => {
    const group = query(root, '[data-particles]');
    if (!group) return;
    group.replaceChildren();
    particles.forEach((particle) => {
      const circle = createSvgElement('circle', {
        r: particle.radius,
        'data-particle-index': particle.index,
        class: 'ig-particle',
      });
      group.append(circle);
    });
  };

  const renderParticlePositions = () => {
    const width = chamberWidth();
    queryAll(root, '[data-particle-index]').forEach((circle) => {
      const index = Number(circle.getAttribute('data-particle-index'));
      const particle = particles[index];
      if (!particle) return;
      const visible = index < currentState.visibleParticleCount;
      circle.toggleAttribute('hidden', !visible);
      if (!visible) return;
      setAttribute(circle, 'cx', CHAMBER.x + particle.x * width);
      setAttribute(circle, 'cy', CHAMBER.y + particle.y * CHAMBER.height);
    });
  };

  const advanceParticles = (elapsedSeconds) => {
    const speedFactor = currentState.particleSpeedFactor * animationSpeed;
    particles.forEach((particle) => {
      particle.x += particle.vx * elapsedSeconds * speedFactor;
      particle.y += particle.vy * elapsedSeconds * speedFactor;

      if (particle.x < 0.02) {
        particle.x = 0.02;
        particle.vx = Math.abs(particle.vx);
      } else if (particle.x > 0.98) {
        particle.x = 0.98;
        particle.vx = -Math.abs(particle.vx);
      }

      if (particle.y < 0.03) {
        particle.y = 0.03;
        particle.vy = Math.abs(particle.vy);
      } else if (particle.y > 0.97) {
        particle.y = 0.97;
        particle.vy = -Math.abs(particle.vy);
      }
    });
  };

  const renderControls = () => {
    const protocol = getProtocol(protocolId);
    queryAll(root, '[data-param]').forEach((control) => {
      if (!(control instanceof HTMLInputElement)) return;
      const key = control.dataset.param;
      if (!key) return;
      const locked = protocol.lockedKeys.includes(key);
      control.disabled = locked;
      control.setAttribute('aria-disabled', String(locked));
      const wrapper = query(root, `[data-control-wrap="${key}"]`);
      wrapper?.classList.toggle('is-locked', locked);
      setText(
        root,
        `[data-lock-label="${key}"]`,
        locked ? 'Verrouillé par le protocole' : 'Grandeur manipulée',
      );
      control.value = String(parameters[key]);
    });

    setText(root, '[data-protocol-help]', protocolHelpText(protocolId));
    setText(root, '[data-prediction-prompt]', predictionPrompt(protocolId));
    setText(root, '[data-param-output="temperatureC"]', `${formatters.one.format(parameters.temperatureC)} °C`);
    setText(root, '[data-param-output="volumeL"]', `${formatters.one.format(parameters.volumeL)} L`);
    setText(root, '[data-param-output="amountMol"]', `${formatters.two.format(parameters.amountMol)} mol`);
  };

  const renderVessel = () => {
    const width = chamberWidth();
    const pistonX = CHAMBER.x + width;
    const fill = query(root, '[data-gas-fill]');
    const clip = query(root, '[data-gas-clip]');
    const piston = query(root, '[data-piston]');
    setAttribute(fill, 'width', width);
    setAttribute(clip, 'width', width);
    setAttribute(piston, 'transform', `translate(${pistonX} 0)`);
    setAttribute(query(root, '[data-volume-marker]'), 'x', CHAMBER.x + width / 2);
    setText(root, '[data-volume-marker]', `V = ${formatters.one.format(currentState.volumeL)} L`);

    const logMin = 4;
    const logMax = 7;
    const logPressure = Math.log10(Math.max(currentState.pressurePa, 1));
    const fraction = Math.min(Math.max((logPressure - logMin) / (logMax - logMin), 0), 1);
    const angle = -62 + fraction * 124;
    setAttribute(query(root, '[data-gauge-needle]'), 'transform', `rotate(${angle.toFixed(2)} 0 40)`);
    setText(root, '[data-output="gaugePressure"]', pressureFormat(currentState.pressurePa, pressureUnit));

    setText(
      root,
      '[data-vessel-desc]',
      `Enceinte de ${currentState.volumeL.toFixed(1)} litres contenant ${currentState.visibleParticleCount} points représentatifs. La pression calculée vaut ${pressureFormat(currentState.pressurePa, pressureUnit)}.`,
    );
    renderParticlePositions();
  };

  const renderMeasurementsTable = () => {
    const body = query(root, '[data-measurement-body]');
    if (!(body instanceof HTMLElement)) return;
    body.replaceChildren();

    if (records.length === 0) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 5;
      cell.textContent = 'Aucun relevé pour le moment.';
      row.append(cell);
      body.append(row);
      return;
    }

    [...records].sort((a, b) => a.x - b.x).forEach((measurement) => {
      const row = document.createElement('tr');
      const values = [
        measurementXLabel(measurement, protocolId),
        pressureFormat(measurement.pressurePa, pressureUnit),
        `${formatters.one.format(measurement.temperatureC)} °C`,
        `${formatters.one.format(measurement.volumeL)} L`,
        `${formatters.two.format(measurement.amountMol)} mol`,
      ];
      values.forEach((value) => {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.append(cell);
      });
      body.append(row);
    });
  };

  const renderChart = () => {
    const protocol = getProtocol(protocolId);
    const series = createProtocolSeries(parameters, protocolId, { sampleCount: 91 });
    const converted = series.points.map((point) => ({
      x: point.x,
      y: convertPressureFromPa(point.pressurePa, pressureUnit),
    }));
    const currentX = protocolXValue(currentState, protocolId);
    const currentY = convertPressureFromPa(currentState.pressurePa, pressureUnit);
    const xMaximum = Math.max(series.xMaximum * 1.06, currentX * 1.06, 1e-9);
    const yMaximum = Math.max(
      ...converted.map((point) => point.y),
      currentY,
      ...records.map((record) => convertPressureFromPa(record.pressurePa, pressureUnit)),
    ) * 1.08;

    const map = (point) => ({
      x: CHART.x + (point.x / xMaximum) * CHART.width,
      y: CHART.y + CHART.height - (point.y / yMaximum) * CHART.height,
    });

    const grid = query(root, '[data-chart-grid]');
    const xTicks = query(root, '[data-x-ticks]');
    const yTicks = query(root, '[data-y-ticks]');
    grid?.replaceChildren();
    xTicks?.replaceChildren();
    yTicks?.replaceChildren();

    for (let index = 0; index <= 5; index += 1) {
      const fraction = index / 5;
      const x = CHART.x + fraction * CHART.width;
      const y = CHART.y + CHART.height - fraction * CHART.height;
      grid?.append(
        createSvgElement('line', { x1: x, y1: CHART.y, x2: x, y2: CHART.y + CHART.height }),
        createSvgElement('line', { x1: CHART.x, y1: y, x2: CHART.x + CHART.width, y2: y }),
      );

      const xText = createSvgElement('text', { x, y: CHART.y + CHART.height + 26, 'text-anchor': 'middle' });
      xText.textContent = xFormat(fraction * xMaximum, protocolId);
      xTicks?.append(xText);

      const yText = createSvgElement('text', { x: CHART.x - 12, y: y + 5, 'text-anchor': 'end' });
      yText.textContent = yTickFormat(fraction * yMaximum, pressureUnit);
      yTicks?.append(yText);
    }

    setText(root, '[data-x-axis-label]', `${protocol.xLabel} (${protocol.xUnit})`);
    setText(root, '[data-y-axis-label]', `Pression P (${PRESSURE_UNITS[pressureUnit].symbol})`);
    setText(root, '[data-table-x-heading]', `${protocol.xLabel.replace('Température thermodynamique ', '').replace('Inverse du volume ', '')} (${protocol.xUnit})`);

    const modelPath = query(root, '[data-model-path]');
    const modelPoints = [{ x: 0, y: 0 }, ...converted];
    setAttribute(modelPath, 'd', createPath(modelPoints, map));
    modelPath?.toggleAttribute('hidden', !modelVisible);

    const recordedGroup = query(root, '[data-recorded-points]');
    recordedGroup?.replaceChildren();
    records.forEach((record, index) => {
      const mapped = map({ x: record.x, y: convertPressureFromPa(record.pressurePa, pressureUnit) });
      const circle = createSvgElement('circle', {
        cx: mapped.x,
        cy: mapped.y,
        r: 7,
        class: 'ig-recorded-point',
        tabindex: '0',
        role: 'img',
        'aria-label': `Relevé ${index + 1} : ${measurementXLabel(record, protocolId)}, pression ${pressureFormat(record.pressurePa, pressureUnit)}`,
      });
      recordedGroup?.append(circle);
    });

    const current = map({ x: currentX, y: currentY });
    const size = 9;
    setAttribute(
      query(root, '[data-current-point]'),
      'd',
      `M ${current.x} ${current.y - size} L ${current.x + size} ${current.y} L ${current.x} ${current.y + size} L ${current.x - size} ${current.y} Z`,
    );

    const regression = computeLinearRegression(
      records.map((record) => ({
        x: record.x,
        y: convertPressureFromPa(record.pressurePa, pressureUnit),
      })),
    );

    const countLabel = `${records.length} relevé${records.length > 1 ? 's' : ''}`;
    setText(root, '[data-output="recordCount"]', countLabel);
    const revealButton = query(root, '[data-action="reveal-model"]');
    if (revealButton instanceof HTMLButtonElement) {
      revealButton.disabled = records.length < 3;
      revealButton.textContent = modelVisible ? 'Masquer le modèle' : 'Comparer au modèle';
    }

    if (records.length < 3) {
      setText(root, '[data-output="analysisText"]', 'Effectue au moins trois relevés distincts pour comparer les données au modèle.');
      setText(root, '[data-output="regressionText"]', 'La régression sera calculée après plusieurs points distincts.');
      setText(root, '[data-graph-caption]', 'Ajoute au moins trois relevés distincts, puis affiche le modèle pour comparer.');
    } else if (!modelVisible) {
      setText(root, '[data-output="analysisText"]', 'Les relevés sont suffisants. Compare maintenant leur alignement à la droite du modèle.');
      setText(
        root,
        '[data-output="regressionText"]',
        regression
          ? `Régression des relevés : R² = ${formatters.four.format(regression.rSquared)}. La conclusion reste à vérifier avec le modèle.`
          : 'Les abscisses doivent être distinctes pour calculer une régression.',
      );
      setText(root, '[data-graph-caption]', 'Tes relevés sont visibles ; la droite théorique est encore masquée.');
    } else {
      const predictionResult = prediction ? evaluatePrediction(protocolId, prediction) : null;
      const predictionSentence = predictionResult
        ? predictionResult.isCorrect
          ? `Ta prédiction « P ${predictionWord(prediction)} » est compatible avec les observations.`
          : `Ta prédiction « P ${predictionWord(prediction)} » doit être révisée à partir du graphique.`
        : 'Aucune prédiction n’avait été enregistrée.';
      setText(root, '[data-output="analysisText"]', `${relationConclusion(protocolId)} ${predictionSentence}`);
      setText(
        root,
        '[data-output="regressionText"]',
        regression
          ? `Régression des relevés : P = ${formatters.three.format(regression.slope)}x + ${formatters.three.format(regression.intercept)} ; R² = ${formatters.four.format(regression.rSquared)}.`
          : 'Les relevés ne permettent pas encore une régression.',
      );
      setText(root, '[data-graph-caption]', `Les cercles sont les relevés ; la ligne en tirets représente le modèle ${protocol.relation}.`);
    }

    const graphDescription = records.length === 0
      ? `Aucun relevé. Le point en losange représente l’état actuel : abscisse ${xFormat(currentX, protocolId)} ${protocol.xUnit}, pression ${pressureFormat(currentState.pressurePa, pressureUnit)}.`
      : `${records.length} relevés sont affichés. ${modelVisible ? `La droite du modèle ${protocol.relation} est visible.` : 'La droite du modèle est masquée.'} L’état actuel vaut ${pressureFormat(currentState.pressurePa, pressureUnit)}.`;
    setText(root, '[data-graph-desc]', graphDescription);
  };

  const render = () => {
    if (destroyed) return;
    currentState = computeIdealGasState(parameters);
    renderControls();

    setText(root, '[data-output="temperatureC"]', `${formatters.one.format(currentState.temperatureC)} °C`);
    setText(root, '[data-output="temperatureK"]', `${formatters.two.format(currentState.temperatureKelvin)} K`);
    setText(root, '[data-output="volumeL"]', `${formatters.one.format(currentState.volumeL)} L`);
    setText(root, '[data-output="amountMol"]', `${formatters.two.format(currentState.amountMol)} mol`);
    setText(root, '[data-output="pressurePrimary"]', pressureFormat(currentState.pressurePa, pressureUnit));
    setText(root, '[data-output="speedFactor"]', `× ${formatters.two.format(currentState.particleSpeedFactor)}`);
    setText(
      root,
      '[data-output="equationSubstitution"]',
      `P = (${formatters.two.format(currentState.amountMol)} × 8,314 × ${formatters.two.format(currentState.temperatureKelvin)}) / ${formatters.four.format(currentState.volumeM3)}`,
    );
    setText(
      root,
      '[data-output="pressureConversions"]',
      `${formatters.zero.format(currentState.pressurePa)} Pa = ${formatters.one.format(currentState.pressureKPa)} kPa = ${formatters.three.format(currentState.pressureBar)} bar`,
    );

    if (currentState.validity.level === 'classroom-domain') {
      setText(root, '[data-output="validityBadge"]', 'Domaine scolaire usuel');
      setText(
        root,
        '[data-output="validityNote"]',
        'Modèle utilisé dans son domaine scolaire usuel. À forte pression ou basse température, un gaz réel peut s’en écarter.',
      );
      root.dataset.validity = 'usual';
    } else {
      setText(root, '[data-output="validityBadge"]', 'Prudence : gaz réel');
      setText(
        root,
        '[data-output="validityNote"]',
        `Prudence : ${currentState.validity.reasons.join(' ; ')}. Les seuils affichés sont didactiques et non universels.`,
      );
      root.dataset.validity = 'caution';
    }

    renderVessel();
    renderChart();
    renderMeasurementsTable();
    setText(root, '[data-accessible-summary]', describeGasState(currentState));
  };

  const stopAnimation = (message = 'Animation microscopique en pause') => {
    running = false;
    previousTimestamp = 0;
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
    setText(root, '[data-play-label]', 'Reprendre l’animation');
    setStatus(message, 'paused');
  };

  const animate = (timestamp) => {
    if (!running || destroyed) return;
    if (!previousTimestamp) previousTimestamp = timestamp;
    const elapsedSeconds = Math.min((timestamp - previousTimestamp) / 1000, 0.08);
    previousTimestamp = timestamp;
    advanceParticles(elapsedSeconds);

    const shouldRender = !reducedMotionMedia.matches || timestamp - previousReducedTimestamp >= 550;
    if (shouldRender) {
      renderParticlePositions();
      previousReducedTimestamp = timestamp;
    }
    frameId = requestAnimationFrame(animate);
  };

  const startAnimation = () => {
    if (running) return;
    running = true;
    previousTimestamp = 0;
    setText(root, '[data-play-label]', 'Mettre en pause');
    setStatus(
      reducedMotionMedia.matches
        ? 'Mouvement réduit : positions mises à jour par étapes'
        : 'Animation microscopique illustrative en cours',
      'running',
    );
    frameId = requestAnimationFrame(animate);
  };

  const resetProtocolWork = (message) => {
    records = [];
    prediction = null;
    modelVisible = false;
    const predictionSelect = query(root, '[data-prediction]');
    if (predictionSelect instanceof HTMLSelectElement) predictionSelect.value = '';
    setText(root, '[data-prediction-feedback]', 'La réponse n’est pas donnée tout de suite : réalise d’abord plusieurs relevés.');
    setStatus(message, 'ready');
  };

  queryAll(root, '[data-param]').forEach((control) => {
    listen(control, 'input', () => {
      if (!(control instanceof HTMLInputElement)) return;
      const key = control.dataset.param;
      if (!key || control.disabled) return;
      parameters = normalizeGasParameters({ ...parameters, [key]: Number(control.value) });
      render();
      setStatus('Paramètre modifié : observe l’état puis ajoute un relevé', running ? 'running' : 'ready');
    });
  });

  const protocolControl = query(root, '[data-protocol]');
  listen(protocolControl, 'change', () => {
    if (!(protocolControl instanceof HTMLSelectElement)) return;
    protocolId = getProtocol(protocolControl.value).id;
    resetProtocolWork('Nouveau protocole : formule une prédiction avant de manipuler');
    render();
  });

  const unitControl = query(root, '[data-pressure-unit]');
  listen(unitControl, 'change', () => {
    if (!(unitControl instanceof HTMLSelectElement)) return;
    pressureUnit = PRESSURE_UNITS[unitControl.value] ? unitControl.value : 'kPa';
    render();
    setStatus(`Pression affichée en ${PRESSURE_UNITS[pressureUnit].symbol}`, running ? 'running' : 'ready');
  });

  const speedControl = query(root, '[data-speed]');
  listen(speedControl, 'change', () => {
    if (!(speedControl instanceof HTMLSelectElement)) return;
    animationSpeed = Number(speedControl.value) || 1;
    setStatus(`Vitesse illustrative réglée sur × ${speedControl.value.replace('.', ',')}`, running ? 'running' : 'ready');
  });

  listen(query(root, '[data-action="toggle"]'), 'click', () => {
    if (running) stopAnimation();
    else startAnimation();
  });

  listen(query(root, '[data-action="reset"]'), 'click', () => {
    stopAnimation('Simulation réinitialisée');
    parameters = normalizeGasParameters(DEFAULT_GAS_PARAMETERS);
    protocolId = 'isochoric';
    pressureUnit = 'kPa';
    animationSpeed = 1;
    records = [];
    prediction = null;
    modelVisible = false;
    particles = createParticleState();
    if (protocolControl instanceof HTMLSelectElement) protocolControl.value = protocolId;
    if (unitControl instanceof HTMLSelectElement) unitControl.value = pressureUnit;
    if (speedControl instanceof HTMLSelectElement) speedControl.value = '1';
    const predictionSelect = query(root, '[data-prediction]');
    if (predictionSelect instanceof HTMLSelectElement) predictionSelect.value = '';
    setText(root, '[data-play-label]', 'Lancer l’animation');
    setText(root, '[data-prediction-feedback]', 'La réponse n’est pas donnée tout de suite : réalise d’abord plusieurs relevés.');
    render();
  });

  listen(query(root, '[data-action="save-prediction"]'), 'click', () => {
    const select = query(root, '[data-prediction]');
    if (!(select instanceof HTMLSelectElement) || !select.value) {
      setStatus('Choisis une prédiction avant de l’enregistrer', 'error');
      select?.focus();
      return;
    }
    prediction = select.value;
    setText(
      root,
      '[data-prediction-feedback]',
      `Prédiction enregistrée : « P ${predictionWord(prediction)} ». Effectue maintenant au moins trois relevés.`,
    );
    setStatus('Prédiction enregistrée sans révéler la réponse', running ? 'running' : 'ready');
  });

  listen(query(root, '[data-action="record"]'), 'click', () => {
    const measurement = createMeasurement(parameters, protocolId);
    const duplicate = records.some((record) => Math.abs(record.x - measurement.x) <= Math.max(1e-9, Math.abs(measurement.x) * 1e-8));
    if (duplicate) {
      setStatus('Ce réglage a déjà été relevé : modifie la grandeur active', 'error');
      return;
    }
    records.push(measurement);
    records.sort((a, b) => a.x - b.x);
    modelVisible = false;
    render();
    setStatus(`Relevé ${records.length} ajouté au graphique`, running ? 'running' : 'ready');
  });

  listen(query(root, '[data-action="clear-records"]'), 'click', () => {
    records = [];
    modelVisible = false;
    render();
    setStatus('Relevés effacés ; les paramètres sont conservés', running ? 'running' : 'ready');
  });

  listen(query(root, '[data-action="reveal-model"]'), 'click', () => {
    if (records.length < 3) {
      setStatus('Trois relevés distincts sont nécessaires avant la comparaison', 'error');
      return;
    }
    modelVisible = !modelVisible;
    render();
    setStatus(
      modelVisible ? 'Modèle affiché : compare la droite aux relevés' : 'Modèle masqué',
      running ? 'running' : 'ready',
    );
  });

  const reducedMotionChange = () => {
    if (running) {
      setStatus(
        reducedMotionMedia.matches
          ? 'Mouvement réduit activé : animation par étapes'
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
    root.dataset.igInitialized = 'false';
  };

  listen(document, 'astro:before-swap', cleanup, { once: true });

  initializeParticleElements();
  render();
  return cleanup;
}
