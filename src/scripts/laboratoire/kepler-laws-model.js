/**
 * Pure scientific model for Kepler's laws around the Sun.
 *
 * Classroom units:
 * - distance: astronomical unit (AU)
 * - time: year
 * - speed: AU/year and km/s
 *
 * Internal convention:
 * - the Sun is at the origin, one focus of the ellipse;
 * - the perihelion lies on the positive x-axis;
 * - time increases uniformly;
 * - the eccentric anomaly E is obtained from Kepler's equation M = E - e sin(E);
 * - the displayed sizes of the Sun and planet are illustrative and not to scale.
 *
 * Model scope:
 * - two-body problem;
 * - planet mass negligible compared with the Sun;
 * - no perturbation by other bodies;
 * - fixed Keplerian ellipse;
 * - Newtonian gravitation;
 * - solar parameter expressed as μ = 4π² AU³·year⁻².
 */

export const TWO_PI = 2 * Math.PI;
export const SOLAR_MU_AU3_PER_YEAR2 = 4 * Math.PI ** 2;
export const AU_PER_YEAR_TO_KM_PER_S = 149_597_870.7 / (365.25 * 86_400);

export const DEFAULT_KEPLER_PARAMETERS = Object.freeze({
  semiMajorAxisAu: 1,
  eccentricity: 0.6,
  deltaTFraction: 0.10,
});

export const KEPLER_PARAMETER_LIMITS = Object.freeze({
  semiMajorAxisAu: Object.freeze({ min: 0.4, max: 5 }),
  eccentricity: Object.freeze({ min: 0, max: 0.85 }),
  deltaTFraction: Object.freeze({ min: 0.03, max: 0.25 }),
});

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function finiteOrFallback(value, fallback) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

export function normalizeAngle(angleRadians) {
  const wrapped = angleRadians % TWO_PI;
  return wrapped < 0 ? wrapped + TWO_PI : wrapped;
}

export function normalizeKeplerParameters(raw = {}) {
  return {
    semiMajorAxisAu: clamp(
      finiteOrFallback(raw.semiMajorAxisAu, DEFAULT_KEPLER_PARAMETERS.semiMajorAxisAu),
      KEPLER_PARAMETER_LIMITS.semiMajorAxisAu.min,
      KEPLER_PARAMETER_LIMITS.semiMajorAxisAu.max,
    ),
    eccentricity: clamp(
      finiteOrFallback(raw.eccentricity, DEFAULT_KEPLER_PARAMETERS.eccentricity),
      KEPLER_PARAMETER_LIMITS.eccentricity.min,
      KEPLER_PARAMETER_LIMITS.eccentricity.max,
    ),
    deltaTFraction: clamp(
      finiteOrFallback(raw.deltaTFraction, DEFAULT_KEPLER_PARAMETERS.deltaTFraction),
      KEPLER_PARAMETER_LIMITS.deltaTFraction.min,
      KEPLER_PARAMETER_LIMITS.deltaTFraction.max,
    ),
  };
}

export function computeOrbitalPeriodYears(raw = {}) {
  const { semiMajorAxisAu } = normalizeKeplerParameters(raw);
  return Math.sqrt(semiMajorAxisAu ** 3);
}

export function computeOrbitalGeometry(raw = {}) {
  const parameters = normalizeKeplerParameters(raw);
  const a = parameters.semiMajorAxisAu;
  const e = parameters.eccentricity;
  const c = a * e;
  const b = a * Math.sqrt(1 - e ** 2);
  const periodYears = Math.sqrt(a ** 3);

  return {
    ...parameters,
    a,
    b,
    c,
    periodYears,
    perihelionDistanceAu: a * (1 - e),
    aphelionDistanceAu: a * (1 + e),
    ellipseAreaAu2: Math.PI * a * b,
    firstFocus: Object.freeze({ xAu: 0, yAu: 0 }),
    secondFocus: Object.freeze({ xAu: -2 * c, yAu: 0 }),
    center: Object.freeze({ xAu: -c, yAu: 0 }),
  };
}

/**
 * Solve M = E - e sin(E) with Newton iterations and a bisection fallback.
 * M is normalized in [0, 2π). The returned residual is in radians.
 */
export function solveEccentricAnomaly(meanAnomalyRadians, eccentricity, options = {}) {
  const e = clamp(finiteOrFallback(eccentricity, 0), 0, 0.999_999);
  const M = normalizeAngle(finiteOrFallback(meanAnomalyRadians, 0));
  const tolerance = Math.max(1e-15, finiteOrFallback(options.tolerance, 1e-13));
  const maxIterations = Math.max(4, Math.round(finiteOrFallback(options.maxIterations, 24)));

  let E = e < 0.8 ? M : Math.PI;
  let iterations = 0;

  for (; iterations < maxIterations; iterations += 1) {
    const f = E - e * Math.sin(E) - M;
    const derivative = 1 - e * Math.cos(E);
    const step = f / derivative;
    E -= step;

    if (Math.abs(step) <= tolerance) {
      const residual = E - e * Math.sin(E) - M;
      return { eccentricAnomalyRadians: normalizeAngle(E), iterations: iterations + 1, residual, converged: true };
    }
  }

  let low = 0;
  let high = TWO_PI;
  let mid = M;
  for (let index = 0; index < 80; index += 1) {
    mid = 0.5 * (low + high);
    const value = mid - e * Math.sin(mid) - M;
    if (Math.abs(value) <= tolerance) {
      break;
    }
    if (value > 0) high = mid;
    else low = mid;
  }

  const residual = mid - e * Math.sin(mid) - M;
  return {
    eccentricAnomalyRadians: normalizeAngle(mid),
    iterations: iterations + 80,
    residual,
    converged: Math.abs(residual) <= Math.max(tolerance, 1e-12),
  };
}

export function eccentricToTrueAnomaly(eccentricAnomalyRadians, eccentricity) {
  const E = eccentricAnomalyRadians;
  const e = clamp(eccentricity, 0, 0.999_999);
  const numerator = Math.sqrt(1 + e) * Math.sin(E / 2);
  const denominator = Math.sqrt(1 - e) * Math.cos(E / 2);
  return normalizeAngle(2 * Math.atan2(numerator, denominator));
}

/**
 * Compute a coherent orbital state from uniformly advancing time.
 */
export function computeOrbitState(raw = {}, timeYears = 0) {
  const geometry = computeOrbitalGeometry(raw);
  const t = Math.max(0, finiteOrFallback(timeYears, 0));
  const periodYears = geometry.periodYears;
  const elapsedInOrbitYears = ((t % periodYears) + periodYears) % periodYears;
  const orbitFraction = elapsedInOrbitYears / periodYears;
  const meanAnomalyRadians = TWO_PI * orbitFraction;
  const solution = solveEccentricAnomaly(meanAnomalyRadians, geometry.eccentricity);
  const E = solution.eccentricAnomalyRadians;
  const trueAnomalyRadians = eccentricToTrueAnomaly(E, geometry.eccentricity);

  const xAu = geometry.a * (Math.cos(E) - geometry.eccentricity);
  const yAu = geometry.b * Math.sin(E);
  const radiusAu = geometry.a * (1 - geometry.eccentricity * Math.cos(E));
  const speedAuPerYear = Math.sqrt(
    SOLAR_MU_AU3_PER_YEAR2 * (2 / radiusAu - 1 / geometry.a),
  );
  const specificAngularMomentumAu2PerYear = Math.sqrt(
    SOLAR_MU_AU3_PER_YEAR2 * geometry.a * (1 - geometry.eccentricity ** 2),
  );
  const arealVelocityAu2PerYear = specificAngularMomentumAu2PerYear / 2;
  const specificMechanicalEnergyAu2PerYear2 = -SOLAR_MU_AU3_PER_YEAR2 / (2 * geometry.a);
  const radialVelocityAuPerYear = (
    Math.sqrt(SOLAR_MU_AU3_PER_YEAR2 * geometry.a)
    * geometry.eccentricity
    * Math.sin(E)
    / radiusAu
  );
  const transverseVelocityAuPerYear = specificAngularMomentumAu2PerYear / radiusAu;

  const nearPerihelion = orbitFraction < 0.015 || orbitFraction > 0.985;
  const nearAphelion = Math.abs(orbitFraction - 0.5) < 0.015;

  return {
    ...geometry,
    timeYears: t,
    elapsedInOrbitYears,
    orbitFraction,
    meanAnomalyRadians,
    eccentricAnomalyRadians: E,
    trueAnomalyRadians,
    trueAnomalyDegrees: trueAnomalyRadians * 180 / Math.PI,
    xAu,
    yAu,
    radiusAu,
    speedAuPerYear,
    speedKmPerSecond: speedAuPerYear * AU_PER_YEAR_TO_KM_PER_S,
    radialVelocityAuPerYear,
    transverseVelocityAuPerYear,
    specificAngularMomentumAu2PerYear,
    arealVelocityAu2PerYear,
    specificMechanicalEnergyAu2PerYear2,
    solverResidualRadians: solution.residual,
    solverIterations: solution.iterations,
    solverConverged: solution.converged,
    orbitalZone: nearPerihelion ? 'périhélie' : nearAphelion ? 'aphélie' : 'orbite',
  };
}

function polygonArea(points) {
  let twiceArea = 0;
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    twiceArea += current.xAu * next.yAu - next.xAu * current.yAu;
  }
  return Math.abs(twiceArea) / 2;
}

/**
 * Sector swept by the position vector over a duration.
 * Exact area follows Kepler's second law: A = (πab/T) Δt.
 * A sampled polygon is also returned for rendering and an independent visual check.
 */
export function computeSweptSector(raw = {}, startTimeYears = 0, durationYears = 0, sampleCount = 81) {
  const geometry = computeOrbitalGeometry(raw);
  const duration = clamp(
    Math.max(0, finiteOrFallback(durationYears, 0)),
    0,
    geometry.periodYears,
  );
  const count = Math.round(clamp(finiteOrFallback(sampleCount, 81), 9, 801));
  const orbitPoints = [];

  for (let index = 0; index < count; index += 1) {
    const fraction = index / (count - 1);
    const state = computeOrbitState(geometry, startTimeYears + fraction * duration);
    orbitPoints.push({ xAu: state.xAu, yAu: state.yAu });
  }

  const polygonPoints = [
    { xAu: 0, yAu: 0 },
    ...orbitPoints,
  ];

  const exactAreaAu2 = geometry.ellipseAreaAu2 * duration / geometry.periodYears;
  const polygonAreaAu2 = polygonArea(polygonPoints);

  return {
    startTimeYears,
    durationYears: duration,
    startState: computeOrbitState(geometry, startTimeYears),
    endState: computeOrbitState(geometry, startTimeYears + duration),
    orbitPoints,
    exactAreaAu2,
    polygonAreaAu2,
    polygonRelativeError: exactAreaAu2 === 0 ? 0 : Math.abs(polygonAreaAu2 - exactAreaAu2) / exactAreaAu2,
  };
}

export function createEqualTimeSectorComparison(raw = {}, options = {}) {
  const geometry = computeOrbitalGeometry(raw);
  const fraction = clamp(
    finiteOrFallback(options.deltaTFraction, geometry.deltaTFraction),
    KEPLER_PARAMETER_LIMITS.deltaTFraction.min,
    KEPLER_PARAMETER_LIMITS.deltaTFraction.max,
  );
  const durationYears = fraction * geometry.periodYears;
  const sampleCount = Math.round(clamp(finiteOrFallback(options.sampleCount, 121), 21, 801));
  const sectorA = computeSweptSector(geometry, 0, durationYears, sampleCount);
  const sectorB = computeSweptSector(geometry, 0.5 * geometry.periodYears, durationYears, sampleCount);
  const exactRelativeDifference = Math.abs(sectorA.exactAreaAu2 - sectorB.exactAreaAu2)
    / Math.max(sectorA.exactAreaAu2, sectorB.exactAreaAu2, Number.EPSILON);
  const polygonRelativeDifference = Math.abs(sectorA.polygonAreaAu2 - sectorB.polygonAreaAu2)
    / Math.max(sectorA.polygonAreaAu2, sectorB.polygonAreaAu2, Number.EPSILON);

  return {
    durationYears,
    deltaTFraction: fraction,
    sectorA,
    sectorB,
    exactRelativeDifference,
    polygonRelativeDifference,
    announcedPolygonTolerance: 0.003,
  };
}

export function createOrbitSeries(raw = {}, options = {}) {
  const geometry = computeOrbitalGeometry(raw);
  const sampleCount = Math.round(clamp(finiteOrFallback(options.sampleCount, 241), 61, 1201));
  const points = [];

  for (let index = 0; index < sampleCount; index += 1) {
    const fraction = index / (sampleCount - 1);
    const timeYears = fraction * geometry.periodYears;
    const state = index === sampleCount - 1
      ? computeOrbitState(geometry, 0)
      : computeOrbitState(geometry, timeYears);
    points.push({ ...state, plottedTimeYears: timeYears, plottedOrbitFraction: fraction });
  }

  return { geometry, points };
}

export function createThirdLawRows(currentSemiMajorAxisAu = 1) {
  const current = clamp(
    finiteOrFallback(currentSemiMajorAxisAu, 1),
    KEPLER_PARAMETER_LIMITS.semiMajorAxisAu.min,
    KEPLER_PARAMETER_LIMITS.semiMajorAxisAu.max,
  );
  const candidates = [0.5, 1, 2, current]
    .filter((value) => value >= KEPLER_PARAMETER_LIMITS.semiMajorAxisAu.min)
    .sort((a, b) => a - b);
  const unique = [...new Set(candidates.map((value) => Number(value.toFixed(6))))];

  return unique.map((semiMajorAxisAu) => {
    const periodYears = Math.sqrt(semiMajorAxisAu ** 3);
    return {
      semiMajorAxisAu,
      periodYears,
      ratioYear2PerAu3: periodYears ** 2 / semiMajorAxisAu ** 3,
      isCurrent: Math.abs(semiMajorAxisAu - current) < 1e-9,
    };
  });
}

export function describeOrbitState(state) {
  return [
    `Temps ${state.elapsedInOrbitYears.toFixed(3)} an sur une période de ${state.periodYears.toFixed(3)} an`,
    `distance au Soleil ${state.radiusAu.toFixed(3)} UA`,
    `vitesse ${state.speedKmPerSecond.toFixed(2)} km·s⁻¹`,
    `anomalie vraie ${state.trueAnomalyDegrees.toFixed(1)} degrés`,
    `zone ${state.orbitalZone}`,
  ].join(' ; ');
}
