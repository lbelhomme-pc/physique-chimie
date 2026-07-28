/**
 * Scientific model for a pH-metric titration at 25 °C.
 *
 * The module is intentionally free of DOM access so it can be tested independently.
 * All concentrations are expressed in mol·L⁻¹ and all volumes in mL at the public API.
 * Internally, amounts of substance are expressed in mol.
 *
 * Model scope:
 * - monoprotic strong acid titrated by a strong base;
 * - monoprotic weak acid titrated by a strong base;
 * - ideal dilute aqueous solutions at 25 °C;
 * - activity coefficients are taken equal to 1;
 * - volume additivity is assumed.
 */

export const MODEL_TEMPERATURE_C = 25;
export const KW_25 = 1.0e-14;

export const TITRATION_PRESETS = Object.freeze({
  strongAcid: Object.freeze({
    id: 'strong-acid',
    label: 'Acide fort / base forte',
    analyteName: 'solution d’acide chlorhydrique',
    analyteFormula: 'HCl(aq)',
    titrantName: 'solution d’hydroxyde de sodium',
    titrantFormula: 'NaOH(aq)',
    reaction: 'H₃O⁺(aq) + HO⁻(aq) → 2 H₂O(l)',
    reactionText: 'H3O+ + HO− → 2 H2O',
    acidKind: 'strong',
    pKa: null,
    stoichiometry: Object.freeze({ analyte: 1, titrant: 1 }),
    defaultAnalyteConcentration: 0.100,
    defaultAnalyteVolumeMl: 20.0,
    defaultTitrantConcentration: 0.100,
  }),
  weakAcid: Object.freeze({
    id: 'weak-acid',
    label: 'Acide faible / base forte',
    analyteName: 'solution d’acide éthanoïque',
    analyteFormula: 'CH₃COOH(aq)',
    titrantName: 'solution d’hydroxyde de sodium',
    titrantFormula: 'NaOH(aq)',
    reaction: 'CH₃COOH(aq) + HO⁻(aq) → CH₃COO⁻(aq) + H₂O(l)',
    reactionText: 'CH3COOH + HO− → CH3COO− + H2O',
    acidKind: 'weak',
    pKa: 4.76,
    stoichiometry: Object.freeze({ analyte: 1, titrant: 1 }),
    defaultAnalyteConcentration: 0.100,
    defaultAnalyteVolumeMl: 20.0,
    defaultTitrantConcentration: 0.100,
  }),
});

export const PARAMETER_LIMITS = Object.freeze({
  analyteConcentration: Object.freeze({ min: 0.050, max: 0.200 }),
  titrantConcentration: Object.freeze({ min: 0.050, max: 0.200 }),
  analyteVolumeMl: Object.freeze({ min: 10.0, max: 25.0 }),
  addedVolumeMl: Object.freeze({ min: 0.0, max: 120.0 }),
});

const PRESET_BY_ID = new Map(
  Object.values(TITRATION_PRESETS).map((preset) => [preset.id, preset]),
);

/** @param {number} value */
function isFiniteNumber(value) {
  return Number.isFinite(value);
}

/** @param {number} value @param {number} min @param {number} max */
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * @param {string} presetId
 * @returns {typeof TITRATION_PRESETS.strongAcid}
 */
export function getPreset(presetId) {
  return PRESET_BY_ID.get(presetId) ?? TITRATION_PRESETS.strongAcid;
}

/**
 * @typedef {Object} TitrationParameters
 * @property {string} presetId
 * @property {number} analyteConcentration - mol·L⁻¹
 * @property {number} analyteVolumeMl - mL
 * @property {number} titrantConcentration - mol·L⁻¹
 */

/**
 * Sanitize external parameters and enforce the documented model domain.
 *
 * @param {Partial<TitrationParameters>} parameters
 * @returns {TitrationParameters}
 */
export function normalizeParameters(parameters = {}) {
  const preset = getPreset(parameters.presetId ?? TITRATION_PRESETS.strongAcid.id);

  const analyteConcentration = clamp(
    isFiniteNumber(parameters.analyteConcentration)
      ? parameters.analyteConcentration
      : preset.defaultAnalyteConcentration,
    PARAMETER_LIMITS.analyteConcentration.min,
    PARAMETER_LIMITS.analyteConcentration.max,
  );

  const analyteVolumeMl = clamp(
    isFiniteNumber(parameters.analyteVolumeMl)
      ? parameters.analyteVolumeMl
      : preset.defaultAnalyteVolumeMl,
    PARAMETER_LIMITS.analyteVolumeMl.min,
    PARAMETER_LIMITS.analyteVolumeMl.max,
  );

  const titrantConcentration = clamp(
    isFiniteNumber(parameters.titrantConcentration)
      ? parameters.titrantConcentration
      : preset.defaultTitrantConcentration,
    PARAMETER_LIMITS.titrantConcentration.min,
    PARAMETER_LIMITS.titrantConcentration.max,
  );

  return {
    presetId: preset.id,
    analyteConcentration,
    analyteVolumeMl,
    titrantConcentration,
  };
}

/**
 * Theoretical equivalence volume obtained from the reaction stoichiometry.
 *
 * For νA A + νB B → products:
 *   cB VE / νB = cA VA / νA
 *
 * @param {Partial<TitrationParameters>} rawParameters
 * @returns {number} volume in mL
 */
export function computeEquivalentVolumeMl(rawParameters) {
  const parameters = normalizeParameters(rawParameters);
  const preset = getPreset(parameters.presetId);
  const { analyte: nuA, titrant: nuB } = preset.stoichiometry;

  return (
    parameters.analyteConcentration
    * parameters.analyteVolumeMl
    * nuB
    / (parameters.titrantConcentration * nuA)
  );
}

/**
 * Stable positive solution of h² - Δh - Kw = 0.
 * Δ = [strong acid anion] - [strong base cation].
 *
 * @param {number} delta
 * @returns {number} [H3O+] in mol·L⁻¹
 */
function solveStrongAcidHydronium(delta) {
  const discriminantRoot = Math.sqrt(delta * delta + 4 * KW_25);

  if (delta >= 0) {
    return 0.5 * (delta + discriminantRoot);
  }

  // Rationalized form avoids catastrophic cancellation for a large base excess.
  return (2 * KW_25) / (discriminantRoot - delta);
}

/**
 * Full charge-balance solution for HA / A⁻ in the presence of Na⁺.
 *
 * Electroneutrality:
 *   [H3O+] + [Na+] = [HO−] + [A−]
 * with:
 *   [HO−] = Kw / [H3O+]
 *   [A−] = CT Ka / (Ka + [H3O+])
 *
 * This single equation remains valid before, at and after equivalence.
 *
 * @param {number} totalAcidConcentration CT in mol·L⁻¹
 * @param {number} sodiumConcentration in mol·L⁻¹
 * @param {number} ka
 * @returns {number} [H3O+] in mol·L⁻¹
 */
function solveWeakAcidHydronium(totalAcidConcentration, sodiumConcentration, ka) {
  const residual = (h) => (
    h
    + sodiumConcentration
    - KW_25 / h
    - (totalAcidConcentration * ka) / (ka + h)
  );

  // The chosen domain safely brackets all concentrations admitted by PARAMETER_LIMITS.
  let lower = 1e-16;
  let upper = 10;
  let fLower = residual(lower);
  let fUpper = residual(upper);

  if (!(fLower <= 0 && fUpper >= 0)) {
    throw new RangeError('Impossible de borner la résolution de l’équilibre acido-basique.');
  }

  // Bisection on log(h) gives uniform precision over the whole pH scale.
  for (let iteration = 0; iteration < 100; iteration += 1) {
    const logMid = 0.5 * (Math.log10(lower) + Math.log10(upper));
    const middle = 10 ** logMid;
    const fMiddle = residual(middle);

    if (Math.abs(fMiddle) < 1e-14) {
      return middle;
    }

    if (fMiddle > 0) {
      upper = middle;
      fUpper = fMiddle;
    } else {
      lower = middle;
      fLower = fMiddle;
    }
  }

  return Math.sqrt(lower * upper);
}

/**
 * @typedef {Object} TitrationState
 * @property {TitrationParameters} parameters
 * @property {ReturnType<typeof getPreset>} preset
 * @property {number} addedVolumeMl
 * @property {number} totalVolumeMl
 * @property {number} equivalenceVolumeMl
 * @property {number} pH
 * @property {number} hydroniumConcentration
 * @property {number} hydroxideConcentration
 * @property {number} analyteInitialMoles
 * @property {number} titrantAddedMoles
 * @property {number} reactionExtentMoles
 * @property {number} analyteRemainingMoles
 * @property {number} titrantRemainingMoles
 * @property {'titrant'|'analyte'|'equivalence'} limitingReagent
 * @property {number} progressRatio
 */

/**
 * Compute the complete scientific state for one added volume.
 *
 * @param {Partial<TitrationParameters>} rawParameters
 * @param {number} rawAddedVolumeMl
 * @returns {TitrationState}
 */
export function computeTitrationState(rawParameters, rawAddedVolumeMl) {
  const parameters = normalizeParameters(rawParameters);
  const preset = getPreset(parameters.presetId);
  const addedVolumeMl = clamp(
    isFiniteNumber(rawAddedVolumeMl) ? rawAddedVolumeMl : 0,
    PARAMETER_LIMITS.addedVolumeMl.min,
    PARAMETER_LIMITS.addedVolumeMl.max,
  );

  const analyteVolumeL = parameters.analyteVolumeMl / 1000;
  const addedVolumeL = addedVolumeMl / 1000;
  const totalVolumeL = analyteVolumeL + addedVolumeL;

  const analyteInitialMoles = parameters.analyteConcentration * analyteVolumeL;
  const titrantAddedMoles = parameters.titrantConcentration * addedVolumeL;

  const { analyte: nuA, titrant: nuB } = preset.stoichiometry;
  const maxExtentFromAnalyte = analyteInitialMoles / nuA;
  const maxExtentFromTitrant = titrantAddedMoles / nuB;
  const reactionExtentMoles = Math.min(maxExtentFromAnalyte, maxExtentFromTitrant);

  const analyteRemainingMoles = Math.max(0, analyteInitialMoles - nuA * reactionExtentMoles);
  const titrantRemainingMoles = Math.max(0, titrantAddedMoles - nuB * reactionExtentMoles);

  const equivalenceVolumeMl = computeEquivalentVolumeMl(parameters);
  const equivalenceToleranceMoles = Math.max(1e-12, analyteInitialMoles * 1e-9);
  const stoichiometricDifference = (
    maxExtentFromAnalyte - maxExtentFromTitrant
  );

  /** @type {'titrant'|'analyte'|'equivalence'} */
  let limitingReagent = 'equivalence';
  if (Math.abs(stoichiometricDifference) > equivalenceToleranceMoles) {
    limitingReagent = stoichiometricDifference > 0 ? 'titrant' : 'analyte';
  }

  let hydroniumConcentration;

  if (preset.acidKind === 'strong') {
    const chlorideConcentration = analyteInitialMoles / totalVolumeL;
    const sodiumConcentration = titrantAddedMoles / totalVolumeL;
    hydroniumConcentration = solveStrongAcidHydronium(
      chlorideConcentration - sodiumConcentration,
    );
  } else {
    const totalAcidConcentration = analyteInitialMoles / totalVolumeL;
    const sodiumConcentration = titrantAddedMoles / totalVolumeL;
    const ka = 10 ** (-preset.pKa);
    hydroniumConcentration = solveWeakAcidHydronium(
      totalAcidConcentration,
      sodiumConcentration,
      ka,
    );
  }

  const hydroxideConcentration = KW_25 / hydroniumConcentration;
  const pH = -Math.log10(hydroniumConcentration);

  return {
    parameters,
    preset,
    addedVolumeMl,
    totalVolumeMl: parameters.analyteVolumeMl + addedVolumeMl,
    equivalenceVolumeMl,
    pH,
    hydroniumConcentration,
    hydroxideConcentration,
    analyteInitialMoles,
    titrantAddedMoles,
    reactionExtentMoles,
    analyteRemainingMoles,
    titrantRemainingMoles,
    limitingReagent,
    progressRatio: equivalenceVolumeMl > 0 ? addedVolumeMl / equivalenceVolumeMl : 0,
  };
}

/**
 * @typedef {{volumeMl:number, pH:number}} CurvePoint
 */

/**
 * Generate a deterministic theoretical curve from the same state model used by the apparatus.
 *
 * @param {Partial<TitrationParameters>} rawParameters
 * @param {{maxVolumeMl?:number, points?:number}} [options]
 * @returns {CurvePoint[]}
 */
export function generateTitrationCurve(rawParameters, options = {}) {
  const parameters = normalizeParameters(rawParameters);
  const equivalenceVolumeMl = computeEquivalentVolumeMl(parameters);
  const maxVolumeMl = clamp(
    isFiniteNumber(options.maxVolumeMl)
      ? options.maxVolumeMl
      : Math.max(2 * equivalenceVolumeMl, equivalenceVolumeMl + 10),
    Math.max(1, equivalenceVolumeMl * 1.1),
    PARAMETER_LIMITS.addedVolumeMl.max,
  );
  const points = Math.round(clamp(
    isFiniteNumber(options.points) ? options.points : 401,
    101,
    2001,
  ));

  /** @type {CurvePoint[]} */
  const curve = [];
  for (let index = 0; index < points; index += 1) {
    const volumeMl = (maxVolumeMl * index) / (points - 1);
    const state = computeTitrationState(parameters, volumeMl);
    curve.push({ volumeMl, pH: state.pH });
  }

  return curve;
}

/**
 * Linear interpolation of the theoretical pH curve.
 *
 * @param {CurvePoint[]} curve
 * @param {number} volumeMl
 * @returns {number}
 */
export function interpolateCurvePH(curve, volumeMl) {
  if (!curve.length) return Number.NaN;
  if (volumeMl <= curve[0].volumeMl) return curve[0].pH;
  if (volumeMl >= curve[curve.length - 1].volumeMl) return curve[curve.length - 1].pH;

  let low = 0;
  let high = curve.length - 1;
  while (high - low > 1) {
    const middle = Math.floor((low + high) / 2);
    if (curve[middle].volumeMl <= volumeMl) low = middle;
    else high = middle;
  }

  const left = curve[low];
  const right = curve[high];
  const ratio = (volumeMl - left.volumeMl) / (right.volumeMl - left.volumeMl);
  return left.pH + ratio * (right.pH - left.pH);
}

/**
 * Estimate the equivalence volume from the maximum numerical derivative dpH/dV.
 * This is an experimental reading from sampled curve data, not the theoretical stoichiometric value.
 *
 * @param {CurvePoint[]} curve
 * @returns {{volumeMl:number, slope:number, index:number, uncertaintyMl:number}}
 */
export function estimateEquivalenceByDerivative(curve) {
  if (curve.length < 5) {
    throw new RangeError('La courbe doit contenir au moins cinq points.');
  }

  const derivatives = new Array(curve.length).fill(Number.NaN);
  let peakIndex = 1;
  let peakSlope = -Infinity;

  for (let index = 1; index < curve.length - 1; index += 1) {
    const left = curve[index - 1];
    const right = curve[index + 1];
    const slope = (right.pH - left.pH) / (right.volumeMl - left.volumeMl);
    derivatives[index] = slope;
    if (slope > peakSlope) {
      peakSlope = slope;
      peakIndex = index;
    }
  }

  const step = curve[1].volumeMl - curve[0].volumeMl;
  let subIndexOffset = 0;

  if (peakIndex > 1 && peakIndex < curve.length - 2) {
    const yMinus = derivatives[peakIndex - 1];
    const yZero = derivatives[peakIndex];
    const yPlus = derivatives[peakIndex + 1];
    const denominator = yMinus - 2 * yZero + yPlus;
    if (Math.abs(denominator) > 1e-12) {
      subIndexOffset = clamp(0.5 * (yMinus - yPlus) / denominator, -1, 1);
    }
  }

  return {
    volumeMl: curve[peakIndex].volumeMl + subIndexOffset * step,
    slope: peakSlope,
    index: peakIndex,
    uncertaintyMl: Math.abs(step),
  };
}

/**
 * Approximate graphical construction using two parallel local tangents.
 *
 * The algorithm finds two points on either side of the derivative maximum where the
 * local slope has fallen to about 35 % of the maximum. It replaces their slopes by
 * their mean so the tangents are exactly parallel, then takes the mid-parallel.
 * Its intersection with the pH curve gives a readable, explicitly approximate VE.
 *
 * @param {CurvePoint[]} curve
 * @returns {{
 *   volumeMl:number,
 *   uncertaintyMl:number,
 *   slope:number,
 *   left:{x:number,y:number,intercept:number},
 *   right:{x:number,y:number,intercept:number},
 *   middleIntercept:number,
 *   peakIndex:number
 * }}
 */
export function buildParallelTangents(curve) {
  const derivativeEstimate = estimateEquivalenceByDerivative(curve);
  const derivatives = new Array(curve.length).fill(Number.NaN);

  for (let index = 1; index < curve.length - 1; index += 1) {
    derivatives[index] = (
      (curve[index + 1].pH - curve[index - 1].pH)
      / (curve[index + 1].volumeMl - curve[index - 1].volumeMl)
    );
  }

  const peakIndex = derivativeEstimate.index;
  const targetSlope = derivativeEstimate.slope * 0.35;

  let leftIndex = Math.max(1, peakIndex - 1);
  while (leftIndex > 1 && derivatives[leftIndex] > targetSlope) {
    leftIndex -= 1;
  }

  let rightIndex = Math.min(curve.length - 2, peakIndex + 1);
  while (rightIndex < curve.length - 2 && derivatives[rightIndex] > targetSlope) {
    rightIndex += 1;
  }

  if (rightIndex - leftIndex < 4) {
    const span = Math.max(2, Math.round(curve.length * 0.025));
    leftIndex = Math.max(1, peakIndex - span);
    rightIndex = Math.min(curve.length - 2, peakIndex + span);
  }

  const leftPoint = curve[leftIndex];
  const rightPoint = curve[rightIndex];
  const leftSlope = derivatives[leftIndex];
  const rightSlope = derivatives[rightIndex];
  const commonSlope = Math.max(1e-9, 0.5 * (leftSlope + rightSlope));

  const leftIntercept = leftPoint.pH - commonSlope * leftPoint.volumeMl;
  const rightIntercept = rightPoint.pH - commonSlope * rightPoint.volumeMl;
  const middleIntercept = 0.5 * (leftIntercept + rightIntercept);

  let intersectionVolume = derivativeEstimate.volumeMl;
  let bestDistance = Infinity;

  for (let index = leftIndex; index < rightIndex; index += 1) {
    const first = curve[index];
    const second = curve[index + 1];
    const f1 = first.pH - (commonSlope * first.volumeMl + middleIntercept);
    const f2 = second.pH - (commonSlope * second.volumeMl + middleIntercept);

    if (f1 === 0 || f1 * f2 <= 0) {
      const denominator = f2 - f1;
      const ratio = Math.abs(denominator) < 1e-12 ? 0 : -f1 / denominator;
      const candidate = first.volumeMl + ratio * (second.volumeMl - first.volumeMl);
      const distance = Math.abs(candidate - derivativeEstimate.volumeMl);
      if (distance < bestDistance) {
        intersectionVolume = candidate;
        bestDistance = distance;
      }
    }
  }

  return {
    volumeMl: intersectionVolume,
    uncertaintyMl: Math.max(
      derivativeEstimate.uncertaintyMl,
      0.5 * Math.abs(curve[1].volumeMl - curve[0].volumeMl),
    ),
    slope: commonSlope,
    left: {
      x: leftPoint.volumeMl,
      y: leftPoint.pH,
      intercept: leftIntercept,
    },
    right: {
      x: rightPoint.volumeMl,
      y: rightPoint.pH,
      intercept: rightIntercept,
    },
    middleIntercept,
    peakIndex,
  };
}

/**
 * Recover the analyte concentration from a graphically read equivalence volume.
 *
 * @param {Partial<TitrationParameters>} rawParameters
 * @param {number} readEquivalenceVolumeMl
 * @returns {number} concentration in mol·L⁻¹
 */
export function computeAnalyteConcentrationFromReadEquivalence(
  rawParameters,
  readEquivalenceVolumeMl,
) {
  const parameters = normalizeParameters(rawParameters);
  const preset = getPreset(parameters.presetId);
  const { analyte: nuA, titrant: nuB } = preset.stoichiometry;
  const safeReadVolumeMl = clamp(
    isFiniteNumber(readEquivalenceVolumeMl) ? readEquivalenceVolumeMl : 0,
    0,
    PARAMETER_LIMITS.addedVolumeMl.max,
  );

  return (
    parameters.titrantConcentration
    * safeReadVolumeMl
    * nuA
    / (parameters.analyteVolumeMl * nuB)
  );
}

/**
 * Return a short, accessible interpretation of the limiting reagent.
 *
 * @param {TitrationState} state
 * @returns {string}
 */
export function describeLimitingReagent(state) {
  if (state.limitingReagent === 'equivalence') {
    return 'Équivalence stœchiométrique : les réactifs ont été introduits dans les proportions de l’équation.';
  }
  if (state.limitingReagent === 'titrant') {
    return 'Avant l’équivalence : les ions hydroxyde ajoutés sont limitants et sont consommés.';
  }
  return 'Après l’équivalence : l’espèce acide titrée est limitante ; les ions hydroxyde sont en excès.';
}

/** @param {number} value @param {number} [digits] */
export function formatDecimal(value, digits = 2) {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

/** @param {number} value */
export function formatConcentration(value) {
  if (!Number.isFinite(value)) return '—';
  if (Math.abs(value) >= 0.01) return `${formatDecimal(value, 3)} mol·L⁻¹`;
  return `${value.toExponential(2).replace('.', ',')} mol·L⁻¹`;
}
