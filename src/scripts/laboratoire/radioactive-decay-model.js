export const MAX_DISPLAYED_HALF_LIVES = 5;

export const RADIOACTIVE_DECAY_PRESETS = Object.freeze({
  pedagogical: Object.freeze({
    id: "pedagogical",
    label: "Échantillon pédagogique",
    isotope: "Noyaux radioactifs",
    halfLife: 8,
    unit: "s",
  }),
  fluorine18: Object.freeze({
    id: "fluorine18",
    label: "Fluor 18",
    isotope: "¹⁸F",
    halfLife: 109.8,
    unit: "min",
  }),
  iodine131: Object.freeze({
    id: "iodine131",
    label: "Iode 131",
    isotope: "¹³¹I",
    halfLife: 8.02,
    unit: "j",
  }),
  carbon14: Object.freeze({
    id: "carbon14",
    label: "Carbone 14",
    isotope: "¹⁴C",
    halfLife: 5730,
    unit: "ans",
  }),
});

export const DEFAULT_DECAY_PRESET_ID = "pedagogical";
export const DEFAULT_DECAY_PRESET = RADIOACTIVE_DECAY_PRESETS[DEFAULT_DECAY_PRESET_ID];
export const DEFAULT_INITIAL_NUCLEI = 80;
export const DEFAULT_RANDOM_SEED = 20260715;

export function getDecayPreset(presetId) {
  return RADIOACTIVE_DECAY_PRESETS[presetId] ?? DEFAULT_DECAY_PRESET;
}

export function clampHalfLife(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return DEFAULT_DECAY_PRESET.halfLife;
  return Math.max(0.01, Math.min(1e12, numericValue));
}

export function clampInitialNuclei(value) {
  const numericValue = Math.round(Number(value));
  if (!Number.isFinite(numericValue)) return DEFAULT_INITIAL_NUCLEI;
  return Math.max(20, Math.min(160, numericValue));
}

export function clampElapsedHalfLives(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 0;
  return Math.max(0, Math.min(MAX_DISPLAYED_HALF_LIVES, numericValue));
}

export function decayConstant(halfLife) {
  return Math.LN2 / clampHalfLife(halfLife);
}

export function expectedFraction(elapsedHalfLives) {
  return 2 ** (-clampElapsedHalfLives(elapsedHalfLives));
}

export function expectedRemaining(initialNuclei, elapsedHalfLives) {
  return clampInitialNuclei(initialNuclei) * expectedFraction(elapsedHalfLives);
}

function seededRandom(seed) {
  let state = Number(seed) >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Tire une date de désintégration indépendante pour chaque noyau.
 * Les dates sont exprimées en nombre de demi-vies : P(T > t) = 2^(-t).
 */
export function generateDecayTimes(initialNuclei, seed = DEFAULT_RANDOM_SEED) {
  const count = clampInitialNuclei(initialNuclei);
  const random = seededRandom(seed);
  return Array.from({ length: count }, () => {
    const draw = Math.max(Number.EPSILON, random());
    return -Math.log(draw) / Math.LN2;
  });
}

export function observedRemaining(decayTimes, elapsedHalfLives) {
  const elapsed = clampElapsedHalfLives(elapsedHalfLives);
  return decayTimes.reduce(
    (remaining, decayTime) => remaining + Number(decayTime > elapsed),
    0,
  );
}

export function createExpectedCurve(sampleCount = 180) {
  const count = Math.max(2, Math.round(sampleCount));
  return Array.from({ length: count + 1 }, (_, index) => {
    const elapsedHalfLives = (index / count) * MAX_DISPLAYED_HALF_LIVES;
    return Object.freeze({
      elapsedHalfLives,
      fraction: expectedFraction(elapsedHalfLives),
    });
  });
}

export function createObservedSteps(decayTimes) {
  const total = Math.max(1, decayTimes.length);
  const visibleEvents = decayTimes
    .filter((time) => time <= MAX_DISPLAYED_HALF_LIVES)
    .sort((first, second) => first - second);
  const points = [{ elapsedHalfLives: 0, fraction: 1 }];
  let remaining = total;

  visibleEvents.forEach((time) => {
    points.push({ elapsedHalfLives: time, fraction: remaining / total });
    remaining -= 1;
    points.push({ elapsedHalfLives: time, fraction: remaining / total });
  });
  points.push({
    elapsedHalfLives: MAX_DISPLAYED_HALF_LIVES,
    fraction: remaining / total,
  });
  return points;
}

export function createReferenceRows(initialNuclei, decayTimes) {
  const initial = clampInitialNuclei(initialNuclei);
  return Array.from({ length: MAX_DISPLAYED_HALF_LIVES + 1 }, (_, index) => ({
    elapsedHalfLives: index,
    expected: initial * expectedFraction(index),
    observed: observedRemaining(decayTimes, index),
    fractionPercent: expectedFraction(index) * 100,
  }));
}
