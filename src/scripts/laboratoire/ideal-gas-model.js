/**
 * Modèle scientifique pur pour la simulation « Modèle des gaz parfaits ».
 *
 * Hypothèses : gaz parfait homogène à l'équilibre thermodynamique, pression
 * uniforme, volume imposé, quantité de matière constante pendant un relevé.
 * L'animation microscopique est uniquement qualitative : les points visibles
 * ne représentent pas n·N_A et ne servent jamais au calcul de la pression.
 */

export const IDEAL_GAS_CONSTANT = 8.314; // J·mol⁻¹·K⁻¹, valeur arrondie imposée par l'activité.
export const CELSIUS_OFFSET = 273.15;
export const CUBIC_METERS_PER_LITER = 1e-3;
export const PASCALS_PER_KILOPASCAL = 1e3;
export const PASCALS_PER_BAR = 1e5;
export const REFERENCE_TEMPERATURE_K = 293.15;

export const GAS_PARAMETER_LIMITS = Object.freeze({
  temperatureC: Object.freeze({ min: -100, max: 400 }),
  volumeL: Object.freeze({ min: 5, max: 60 }),
  amountMol: Object.freeze({ min: 0.2, max: 5 }),
});

export const DEFAULT_GAS_PARAMETERS = Object.freeze({
  temperatureC: 20,
  volumeL: 20,
  amountMol: 2,
});

export const PRESSURE_UNITS = Object.freeze({
  Pa: Object.freeze({ symbol: 'Pa', factorFromPa: 1, decimals: 0 }),
  kPa: Object.freeze({ symbol: 'kPa', factorFromPa: 1 / PASCALS_PER_KILOPASCAL, decimals: 1 }),
  bar: Object.freeze({ symbol: 'bar', factorFromPa: 1 / PASCALS_PER_BAR, decimals: 3 }),
});

export const PROTOCOLS = Object.freeze({
  isochoric: Object.freeze({
    id: 'isochoric',
    title: 'V et n constants',
    independentKey: 'temperatureC',
    lockedKeys: Object.freeze(['volumeL', 'amountMol']),
    xKey: 'temperatureKelvin',
    xLabel: 'Température thermodynamique T',
    xUnit: 'K',
    predictionSubject: 'la température T augmente',
    expectedPrediction: 'increase',
    relation: 'P = (nR/V)·T',
  }),
  isothermal: Object.freeze({
    id: 'isothermal',
    title: 'T et n constants',
    independentKey: 'volumeL',
    lockedKeys: Object.freeze(['temperatureC', 'amountMol']),
    xKey: 'inverseVolumePerLiter',
    xLabel: 'Inverse du volume 1/V',
    xUnit: 'L⁻¹',
    predictionSubject: 'le volume V augmente',
    expectedPrediction: 'decrease',
    relation: 'P = (1000 nRT)·(1/V en L⁻¹)',
  }),
  isomolar: Object.freeze({
    id: 'isomolar',
    title: 'T et V constants',
    independentKey: 'amountMol',
    lockedKeys: Object.freeze(['temperatureC', 'volumeL']),
    xKey: 'amountMol',
    xLabel: 'Quantité de matière n',
    xUnit: 'mol',
    predictionSubject: 'la quantité de matière n augmente',
    expectedPrediction: 'increase',
    relation: 'P = (RT/V)·n',
  }),
});

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function finiteOr(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function celsiusToKelvin(temperatureC) {
  return Number(temperatureC) + CELSIUS_OFFSET;
}

export function kelvinToCelsius(temperatureK) {
  return Number(temperatureK) - CELSIUS_OFFSET;
}

export function litersToCubicMeters(volumeL) {
  return Number(volumeL) * CUBIC_METERS_PER_LITER;
}

export function cubicMetersToLiters(volumeM3) {
  return Number(volumeM3) / CUBIC_METERS_PER_LITER;
}

export function normalizeGasParameters(input = {}) {
  const source = { ...DEFAULT_GAS_PARAMETERS, ...input };
  return {
    temperatureC: clamp(
      finiteOr(source.temperatureC, DEFAULT_GAS_PARAMETERS.temperatureC),
      GAS_PARAMETER_LIMITS.temperatureC.min,
      GAS_PARAMETER_LIMITS.temperatureC.max,
    ),
    volumeL: clamp(
      finiteOr(source.volumeL, DEFAULT_GAS_PARAMETERS.volumeL),
      GAS_PARAMETER_LIMITS.volumeL.min,
      GAS_PARAMETER_LIMITS.volumeL.max,
    ),
    amountMol: clamp(
      finiteOr(source.amountMol, DEFAULT_GAS_PARAMETERS.amountMol),
      GAS_PARAMETER_LIMITS.amountMol.min,
      GAS_PARAMETER_LIMITS.amountMol.max,
    ),
  };
}

export function computePressurePa({ amountMol, temperatureKelvin, volumeM3 }) {
  const n = Number(amountMol);
  const T = Number(temperatureKelvin);
  const V = Number(volumeM3);

  if (!Number.isFinite(n) || n <= 0) {
    throw new RangeError('La quantité de matière doit être strictement positive.');
  }
  if (!Number.isFinite(T) || T <= 0) {
    throw new RangeError('La température thermodynamique doit être strictement positive.');
  }
  if (!Number.isFinite(V) || V <= 0) {
    throw new RangeError('Le volume doit être strictement positif.');
  }

  return n * IDEAL_GAS_CONSTANT * T / V;
}

export function convertPressureFromPa(pressurePa, unit = 'Pa') {
  const definition = PRESSURE_UNITS[unit] ?? PRESSURE_UNITS.Pa;
  return Number(pressurePa) * definition.factorFromPa;
}

export function particleSpeedFactor(temperatureKelvin) {
  const T = Number(temperatureKelvin);
  if (!Number.isFinite(T) || T <= 0) {
    throw new RangeError('La température doit être positive pour calculer l’agitation relative.');
  }
  return Math.sqrt(T / REFERENCE_TEMPERATURE_K);
}

export function representativeParticleCount(amountMol) {
  const normalized = normalizeGasParameters({ amountMol }).amountMol;
  const minCount = 22;
  const maxCount = 72;
  const fraction = (normalized - GAS_PARAMETER_LIMITS.amountMol.min)
    / (GAS_PARAMETER_LIMITS.amountMol.max - GAS_PARAMETER_LIMITS.amountMol.min);
  return Math.round(minCount + fraction * (maxCount - minCount));
}

export function assessIdealGasDomain({ temperatureKelvin, pressurePa }) {
  const reasons = [];

  // Seuils didactiques de prudence, et non frontières universelles du modèle.
  if (temperatureKelvin < 200) {
    reasons.push('température inférieure à 200 K : les écarts au modèle parfait peuvent devenir importants selon le gaz');
  }
  if (pressurePa > 1e6) {
    reasons.push('pression supérieure à 10 bar : les interactions entre particules peuvent ne plus être négligeables');
  }

  return {
    level: reasons.length === 0 ? 'classroom-domain' : 'caution',
    reasons,
    thresholdsAreUniversal: false,
  };
}

export function computeIdealGasState(parameters = DEFAULT_GAS_PARAMETERS) {
  const normalized = normalizeGasParameters(parameters);
  const temperatureKelvin = celsiusToKelvin(normalized.temperatureC);
  const volumeM3 = litersToCubicMeters(normalized.volumeL);
  const pressurePa = computePressurePa({
    amountMol: normalized.amountMol,
    temperatureKelvin,
    volumeM3,
  });

  return {
    ...normalized,
    temperatureKelvin,
    volumeM3,
    pressurePa,
    pressureKPa: pressurePa / PASCALS_PER_KILOPASCAL,
    pressureBar: pressurePa / PASCALS_PER_BAR,
    inverseVolumePerLiter: 1 / normalized.volumeL,
    particleSpeedFactor: particleSpeedFactor(temperatureKelvin),
    visibleParticleCount: representativeParticleCount(normalized.amountMol),
    validity: assessIdealGasDomain({ temperatureKelvin, pressurePa }),
  };
}

export function getProtocol(protocolId = 'isochoric') {
  return PROTOCOLS[protocolId] ?? PROTOCOLS.isochoric;
}

export function protocolXValue(state, protocolId) {
  const protocol = getProtocol(protocolId);
  return Number(state[protocol.xKey]);
}

export function protocolControlRange(protocolId) {
  const protocol = getProtocol(protocolId);
  const limit = GAS_PARAMETER_LIMITS[protocol.independentKey];
  return { ...limit };
}

export function createProtocolSeries(parameters, protocolId, options = {}) {
  const protocol = getProtocol(protocolId);
  const base = normalizeGasParameters(parameters);
  const sampleCount = Math.max(2, Math.round(finiteOr(options.sampleCount, 81)));
  const limits = protocolControlRange(protocolId);
  const points = [];

  for (let index = 0; index < sampleCount; index += 1) {
    const fraction = sampleCount === 1 ? 0 : index / (sampleCount - 1);
    const independentValue = limits.min + fraction * (limits.max - limits.min);
    const state = computeIdealGasState({ ...base, [protocol.independentKey]: independentValue });
    points.push({
      independentValue,
      x: protocolXValue(state, protocolId),
      pressurePa: state.pressurePa,
      state,
    });
  }

  points.sort((a, b) => a.x - b.x);
  return {
    protocol,
    fixedParameters: Object.fromEntries(protocol.lockedKeys.map((key) => [key, base[key]])),
    points,
    xMinimum: points[0].x,
    xMaximum: points.at(-1).x,
    pressureMinimumPa: Math.min(...points.map((point) => point.pressurePa)),
    pressureMaximumPa: Math.max(...points.map((point) => point.pressurePa)),
  };
}

export function createMeasurement(parameters, protocolId) {
  const state = computeIdealGasState(parameters);
  return {
    protocolId: getProtocol(protocolId).id,
    x: protocolXValue(state, protocolId),
    pressurePa: state.pressurePa,
    temperatureC: state.temperatureC,
    temperatureKelvin: state.temperatureKelvin,
    volumeL: state.volumeL,
    amountMol: state.amountMol,
  };
}

export function computeLinearRegression(points) {
  if (!Array.isArray(points) || points.length < 2) {
    return null;
  }

  const clean = points
    .map((point) => ({ x: Number(point.x), y: Number(point.y ?? point.pressurePa) }))
    .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));

  if (clean.length < 2) return null;

  const meanX = clean.reduce((sum, point) => sum + point.x, 0) / clean.length;
  const meanY = clean.reduce((sum, point) => sum + point.y, 0) / clean.length;
  const varianceX = clean.reduce((sum, point) => sum + (point.x - meanX) ** 2, 0);

  if (varianceX === 0) return null;

  const covariance = clean.reduce(
    (sum, point) => sum + (point.x - meanX) * (point.y - meanY),
    0,
  );
  const slope = covariance / varianceX;
  const intercept = meanY - slope * meanX;
  const residualSum = clean.reduce(
    (sum, point) => sum + (point.y - (slope * point.x + intercept)) ** 2,
    0,
  );
  const totalSum = clean.reduce((sum, point) => sum + (point.y - meanY) ** 2, 0);
  const rSquared = totalSum === 0 ? 1 : 1 - residualSum / totalSum;

  return { slope, intercept, rSquared, count: clean.length };
}

export function protocolTheoreticalSlopePa(protocolId, parameters) {
  const protocol = getProtocol(protocolId);
  const state = computeIdealGasState(parameters);

  switch (protocol.id) {
    case 'isochoric':
      return state.amountMol * IDEAL_GAS_CONSTANT / state.volumeM3;
    case 'isothermal':
      return 1000 * state.amountMol * IDEAL_GAS_CONSTANT * state.temperatureKelvin;
    case 'isomolar':
      return IDEAL_GAS_CONSTANT * state.temperatureKelvin / state.volumeM3;
    default:
      return Number.NaN;
  }
}

export function evaluatePrediction(protocolId, prediction) {
  const protocol = getProtocol(protocolId);
  const normalizedPrediction = ['increase', 'decrease', 'same'].includes(prediction)
    ? prediction
    : null;

  return {
    expected: protocol.expectedPrediction,
    submitted: normalizedPrediction,
    isCorrect: normalizedPrediction === protocol.expectedPrediction,
  };
}

export function describeGasState(state) {
  const validity = state.validity.level === 'classroom-domain'
    ? 'dans le domaine scolaire usuel du modèle'
    : `avec prudence : ${state.validity.reasons.join(' ; ')}`;

  return `À ${state.temperatureKelvin.toFixed(2)} K, pour ${state.volumeL.toFixed(1)} L et ${state.amountMol.toFixed(2)} mol, la pression calculée par PV = nRT vaut ${state.pressureKPa.toFixed(1)} kPa, ${validity}.`;
}
