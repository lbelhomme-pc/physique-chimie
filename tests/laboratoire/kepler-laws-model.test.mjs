import test from 'node:test';
import assert from 'node:assert/strict';

import {
  SOLAR_MU_AU3_PER_YEAR2,
  computeOrbitState,
  computeOrbitalGeometry,
  computeOrbitalPeriodYears,
  createEqualTimeSectorComparison,
  createOrbitSeries,
  createThirdLawRows,
  normalizeKeplerParameters,
  solveEccentricAnomaly,
} from '../../src/scripts/laboratoire/kepler-laws-model.js';

function closeTo(actual, expected, tolerance, message = '') {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${message} attendu ${expected}, obtenu ${actual}`,
  );
}

const REFERENCE = Object.freeze({
  semiMajorAxisAu: 1,
  eccentricity: 0.6,
  deltaTFraction: 0.1,
});

test('pour a = 1,00 UA, la période vaut 1,00 an', () => {
  closeTo(computeOrbitalPeriodYears({ semiMajorAxisAu: 1 }), 1, 1e-14);
});

test('pour a = 2,00 UA, T = √8 et T²/a³ = 1', () => {
  const a = 2;
  const period = computeOrbitalPeriodYears({ semiMajorAxisAu: a });
  closeTo(period, Math.sqrt(8), 1e-14);
  closeTo(period ** 2 / a ** 3, 1, 1e-14);
});

test('la géométrie de l’ellipse respecte c = ae et b = a√(1-e²)', () => {
  const geometry = computeOrbitalGeometry({ semiMajorAxisAu: 2.5, eccentricity: 0.6 });
  closeTo(geometry.c, 1.5, 1e-14);
  closeTo(geometry.b, 2, 1e-14);
  closeTo(geometry.secondFocus.xAu, -3, 1e-14);
  closeTo(geometry.center.xAu, -1.5, 1e-14);
});

test('le Soleil est au foyer et les distances périhélie/aphélie valent a(1∓e)', () => {
  const geometry = computeOrbitalGeometry(REFERENCE);
  const perihelion = computeOrbitState(REFERENCE, 0);
  const aphelion = computeOrbitState(REFERENCE, geometry.periodYears / 2);

  closeTo(perihelion.xAu, geometry.perihelionDistanceAu, 1e-12);
  closeTo(perihelion.radiusAu, 0.4, 1e-12);
  closeTo(aphelion.xAu, -geometry.aphelionDistanceAu, 1e-12);
  closeTo(aphelion.radiusAu, 1.6, 1e-12);
});

test('le solveur de l’équation de Kepler converge avec un résidu négligeable', () => {
  for (const eccentricity of [0, 0.2, 0.6, 0.85]) {
    for (const meanAnomaly of [0, 0.1, 1, Math.PI, 5.8]) {
      const solution = solveEccentricAnomaly(meanAnomaly, eccentricity);
      assert.equal(solution.converged, true);
      assert.ok(Math.abs(solution.residual) < 1e-11);
    }
  }
});

test('une orbite circulaire a une distance et une vitesse constantes', () => {
  const parameters = { semiMajorAxisAu: 1.7, eccentricity: 0 };
  const period = computeOrbitalPeriodYears(parameters);
  const expectedSpeed = Math.sqrt(SOLAR_MU_AU3_PER_YEAR2 / 1.7);

  for (const fraction of [0, 0.1, 0.25, 0.5, 0.9]) {
    const state = computeOrbitState(parameters, fraction * period);
    closeTo(state.radiusAu, 1.7, 1e-12);
    closeTo(state.speedAuPerYear, expectedSpeed, 1e-12);
  }
});

test('la vitesse est plus grande au périhélie qu’à l’aphélie', () => {
  const geometry = computeOrbitalGeometry(REFERENCE);
  const perihelion = computeOrbitState(REFERENCE, 0);
  const aphelion = computeOrbitState(REFERENCE, geometry.periodYears / 2);

  assert.ok(perihelion.speedAuPerYear > aphelion.speedAuPerYear);
  closeTo(
    perihelion.speedAuPerYear / aphelion.speedAuPerYear,
    (1 + REFERENCE.eccentricity) / (1 - REFERENCE.eccentricity),
    1e-12,
  );
});

test('deux durées égales balaient des aires égales dans la tolérance annoncée', () => {
  const comparison = createEqualTimeSectorComparison(REFERENCE, {
    deltaTFraction: 0.1,
    sampleCount: 401,
  });

  closeTo(comparison.sectorA.exactAreaAu2, comparison.sectorB.exactAreaAu2, 1e-14);
  closeTo(comparison.exactRelativeDifference, 0, 1e-14);
  assert.ok(comparison.polygonRelativeDifference < comparison.announcedPolygonTolerance);
  assert.ok(comparison.sectorA.polygonRelativeError < comparison.announcedPolygonTolerance);
  assert.ok(comparison.sectorB.polygonRelativeError < comparison.announcedPolygonTolerance);
});

test('des durées égales ne correspondent pas à des angles vrais égaux sur une ellipse', () => {
  const geometry = computeOrbitalGeometry(REFERENCE);
  const delta = 0.08 * geometry.periodYears;
  const periStart = computeOrbitState(REFERENCE, 0);
  const periEnd = computeOrbitState(REFERENCE, delta);
  const apheStart = computeOrbitState(REFERENCE, 0.5 * geometry.periodYears);
  const apheEnd = computeOrbitState(REFERENCE, 0.5 * geometry.periodYears + delta);

  const periAngle = periEnd.trueAnomalyRadians - periStart.trueAnomalyRadians;
  const apheAngle = apheEnd.trueAnomalyRadians - apheStart.trueAnomalyRadians;
  assert.ok(periAngle > apheAngle * 3);
});

test('l’énergie mécanique spécifique reste constante sur l’orbite', () => {
  const geometry = computeOrbitalGeometry(REFERENCE);
  const expected = -SOLAR_MU_AU3_PER_YEAR2 / (2 * REFERENCE.semiMajorAxisAu);
  for (const fraction of [0, 0.07, 0.25, 0.5, 0.83]) {
    const state = computeOrbitState(REFERENCE, fraction * geometry.periodYears);
    closeTo(state.specificMechanicalEnergyAu2PerYear2, expected, 1e-12);
  }
});

test('la série orbitale se ferme et conserve les bornes de vitesse attendues', () => {
  const series = createOrbitSeries(REFERENCE, { sampleCount: 361 });
  const first = series.points[0];
  const last = series.points.at(-1);
  closeTo(first.xAu, last.xAu, 1e-12);
  closeTo(first.yAu, last.yAu, 1e-12);

  const speeds = series.points.map((point) => point.speedAuPerYear);
  closeTo(Math.max(...speeds), first.speedAuPerYear, 1e-12);
  closeTo(Math.min(...speeds), computeOrbitState(REFERENCE, 0.5).speedAuPerYear, 1e-12);
});

test('la table de la troisième loi renvoie toujours le rapport 1 autour du Soleil', () => {
  const rows = createThirdLawRows(3.25);
  assert.ok(rows.some((row) => row.isCurrent));
  for (const row of rows) {
    closeTo(row.ratioYear2PerAu3, 1, 1e-13);
  }
});

test('les paramètres externes sont bornés au domaine annoncé', () => {
  assert.deepEqual(
    normalizeKeplerParameters({
      semiMajorAxisAu: 50,
      eccentricity: -2,
      deltaTFraction: Number.NaN,
    }),
    {
      semiMajorAxisAu: 5,
      eccentricity: 0,
      deltaTFraction: 0.1,
    },
  );
});
