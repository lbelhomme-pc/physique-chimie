/**
 * Scientific model for an ideal first-order series RC circuit.
 *
 * Public parameters use classroom-friendly units:
 * - voltage: V
 * - resistance: kΩ
 * - capacitance: µF
 * - time: s
 *
 * Internal calculations use SI units.
 *
 * Model scope and hypotheses:
 * - ideal voltage source;
 * - ideal resistor and capacitor;
 * - negligible wire and source resistance;
 * - no dielectric leakage;
 * - fixed component values;
 * - the charge starts with uC(0) = 0;
 * - the discharge starts with uC(0) = U0.
 *
 * Sign convention:
 * - uC is measured from the upper capacitor plate to the lower plate;
 * - the positive current reference is the clockwise charging direction;
 * - during discharge, the physical conventional current is counter-clockwise,
 *   therefore i and uR are negative in the fixed charging reference.
 */

export const RC_MODE = Object.freeze({
  CHARGE: 'charge',
  DISCHARGE: 'discharge',
});

export const DEFAULT_RC_PARAMETERS = Object.freeze({
  mode: RC_MODE.CHARGE,
  voltageV: 5,
  resistanceKOhm: 10,
  capacitanceMicroF: 100,
});

export const RC_PARAMETER_LIMITS = Object.freeze({
  voltageV: Object.freeze({ min: 1, max: 12 }),
  resistanceKOhm: Object.freeze({ min: 1, max: 100 }),
  capacitanceMicroF: Object.freeze({ min: 10, max: 1000 }),
});

const EXP_MINUS_ONE = Math.exp(-1);

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function finiteOrFallback(value, fallback) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

/**
 * Normalize external values and enforce the documented model domain.
 *
 * @param {Partial<typeof DEFAULT_RC_PARAMETERS>} raw
 */
export function normalizeRcParameters(raw = {}) {
  const mode = raw.mode === RC_MODE.DISCHARGE ? RC_MODE.DISCHARGE : RC_MODE.CHARGE;

  return {
    mode,
    voltageV: clamp(
      finiteOrFallback(raw.voltageV, DEFAULT_RC_PARAMETERS.voltageV),
      RC_PARAMETER_LIMITS.voltageV.min,
      RC_PARAMETER_LIMITS.voltageV.max,
    ),
    resistanceKOhm: clamp(
      finiteOrFallback(raw.resistanceKOhm, DEFAULT_RC_PARAMETERS.resistanceKOhm),
      RC_PARAMETER_LIMITS.resistanceKOhm.min,
      RC_PARAMETER_LIMITS.resistanceKOhm.max,
    ),
    capacitanceMicroF: clamp(
      finiteOrFallback(raw.capacitanceMicroF, DEFAULT_RC_PARAMETERS.capacitanceMicroF),
      RC_PARAMETER_LIMITS.capacitanceMicroF.min,
      RC_PARAMETER_LIMITS.capacitanceMicroF.max,
    ),
  };
}

/**
 * Convert classroom units to SI.
 */
export function toSiRcParameters(raw = {}) {
  const parameters = normalizeRcParameters(raw);

  return {
    ...parameters,
    resistanceOhm: parameters.resistanceKOhm * 1e3,
    capacitanceF: parameters.capacitanceMicroF * 1e-6,
  };
}

/**
 * Time constant τ = R C in seconds.
 */
export function computeTimeConstantSeconds(raw = {}) {
  const { resistanceOhm, capacitanceF } = toSiRcParameters(raw);
  return resistanceOhm * capacitanceF;
}

/**
 * State of the circuit at a given time.
 *
 * @param {Partial<typeof DEFAULT_RC_PARAMETERS>} raw
 * @param {number} timeSeconds
 */
export function computeRcState(raw = {}, timeSeconds = 0) {
  const parameters = toSiRcParameters(raw);
  const t = Math.max(0, finiteOrFallback(timeSeconds, 0));
  const tauSeconds = parameters.resistanceOhm * parameters.capacitanceF;
  const decay = Math.exp(-t / tauSeconds);
  const maximumCurrentA = parameters.voltageV / parameters.resistanceOhm;
  const maximumEnergyJ = 0.5 * parameters.capacitanceF * parameters.voltageV ** 2;

  let capacitorVoltageV;
  let resistorVoltageV;
  let currentA;

  if (parameters.mode === RC_MODE.CHARGE) {
    capacitorVoltageV = parameters.voltageV * (1 - decay);
    resistorVoltageV = parameters.voltageV * decay;
    currentA = maximumCurrentA * decay;
  } else {
    capacitorVoltageV = parameters.voltageV * decay;
    currentA = -maximumCurrentA * decay;
    resistorVoltageV = parameters.resistanceOhm * currentA;
  }

  const capacitorEnergyJ = 0.5 * parameters.capacitanceF * capacitorVoltageV ** 2;
  const resistorPowerW = parameters.resistanceOhm * currentA ** 2;
  const capacitorChargeC = parameters.capacitanceF * capacitorVoltageV;
  const normalizedTime = t / tauSeconds;
  const practicalCompletion = parameters.mode === RC_MODE.CHARGE
    ? capacitorVoltageV / parameters.voltageV
    : 1 - capacitorVoltageV / parameters.voltageV;

  return {
    mode: parameters.mode,
    timeSeconds: t,
    normalizedTime,
    tauSeconds,
    decay,
    voltageV: parameters.voltageV,
    resistanceOhm: parameters.resistanceOhm,
    capacitanceF: parameters.capacitanceF,
    capacitorVoltageV,
    resistorVoltageV,
    currentA,
    currentMilliA: currentA * 1e3,
    maximumCurrentA,
    maximumCurrentMilliA: maximumCurrentA * 1e3,
    capacitorEnergyJ,
    capacitorEnergyMilliJ: capacitorEnergyJ * 1e3,
    maximumEnergyJ,
    maximumEnergyMilliJ: maximumEnergyJ * 1e3,
    resistorPowerW,
    capacitorChargeC,
    practicalCompletion,
    chargeLoopResidualV: parameters.mode === RC_MODE.CHARGE
      ? parameters.voltageV - capacitorVoltageV - resistorVoltageV
      : capacitorVoltageV + resistorVoltageV,
  };
}

/**
 * Exact reference values at τ and 5τ, useful for tests and pedagogical markers.
 */
export function computeRcReferenceMarkers(raw = {}) {
  const parameters = normalizeRcParameters(raw);
  const tauSeconds = computeTimeConstantSeconds(parameters);

  return {
    atTau: computeRcState(parameters, tauSeconds),
    atFiveTau: computeRcState(parameters, 5 * tauSeconds),
    voltageRatioAtTauCharge: 1 - EXP_MINUS_ONE,
    resistorRatioAtTauCharge: EXP_MINUS_ONE,
    voltageRatioAtFiveTauCharge: 1 - Math.exp(-5),
    energyRatioAtTauCharge: (1 - EXP_MINUS_ONE) ** 2,
  };
}

/**
 * Tangent to uC(t) at the origin.
 *
 * Charge: uT(t) = E t/τ, intersects u = E at t = τ.
 * Discharge: uT(t) = U0(1 - t/τ), intersects u = 0 at t = τ.
 */
export function computeCapacitorTangentVoltage(raw = {}, timeSeconds = 0) {
  const parameters = normalizeRcParameters(raw);
  const tauSeconds = computeTimeConstantSeconds(parameters);
  const t = Math.max(0, finiteOrFallback(timeSeconds, 0));

  if (parameters.mode === RC_MODE.CHARGE) {
    return parameters.voltageV * t / tauSeconds;
  }

  return parameters.voltageV * (1 - t / tauSeconds);
}

/**
 * Generate a single coherent scientific series for all visual representations.
 */
export function createRcSeries(raw = {}, options = {}) {
  const parameters = normalizeRcParameters(raw);
  const tauSeconds = computeTimeConstantSeconds(parameters);
  const maxTau = clamp(finiteOrFallback(options.maxTau, 5), 1, 10);
  const sampleCount = Math.round(clamp(finiteOrFallback(options.sampleCount, 181), 21, 1201));
  const maxTimeSeconds = maxTau * tauSeconds;
  const points = [];

  for (let index = 0; index < sampleCount; index += 1) {
    const fraction = index / (sampleCount - 1);
    const timeSeconds = fraction * maxTimeSeconds;
    points.push(computeRcState(parameters, timeSeconds));
  }

  return {
    parameters,
    tauSeconds,
    maxTau,
    maxTimeSeconds,
    points,
  };
}

/**
 * Compact textual summary used as an accessible alternative to the graph.
 */
export function describeRcState(state) {
  const direction = state.mode === RC_MODE.CHARGE
    ? 'dans le sens de référence de charge'
    : 'dans le sens opposé au sens de référence de charge';

  return [
    `À t = ${state.timeSeconds.toFixed(3)} s, soit ${state.normalizedTime.toFixed(2)} tau`,
    `uC = ${state.capacitorVoltageV.toFixed(3)} V`,
    `uR = ${state.resistorVoltageV.toFixed(3)} V`,
    `i = ${state.currentMilliA.toFixed(3)} mA, ${direction}`,
    `énergie du condensateur = ${state.capacitorEnergyMilliJ.toFixed(3)} mJ`,
  ].join(' ; ');
}
