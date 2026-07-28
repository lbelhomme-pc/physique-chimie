import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CELSIUS_OFFSET,
  DEFAULT_GAS_PARAMETERS,
  IDEAL_GAS_CONSTANT,
  computeIdealGasState,
  computeLinearRegression,
  computePressurePa,
  createMeasurement,
  createProtocolSeries,
  evaluatePrediction,
  litersToCubicMeters,
  normalizeGasParameters,
  particleSpeedFactor,
  protocolTheoreticalSlopePa,
  representativeParticleCount,
} from '../../src/scripts/laboratoire/ideal-gas-model.js';

function closeTo(actual, expected, tolerance, message = '') {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${message} attendu ${expected}, obtenu ${actual}`,
  );
}

test('cas de référence : 2,00 mol, 293,15 K et 20,0 L donnent environ 2,44×10⁵ Pa', () => {
  const state = computeIdealGasState({ temperatureC: 20, volumeL: 20, amountMol: 2 });
  closeTo(state.temperatureKelvin, 293.15, 1e-12);
  closeTo(state.volumeM3, 0.02, 1e-15);
  closeTo(state.pressurePa, 243724.91, 0.01);
  closeTo(state.pressureBar, 2.4372491, 1e-9);
});

test('la conversion Celsius vers kelvin ajoute exactement 273,15', () => {
  const state = computeIdealGasState({ ...DEFAULT_GAS_PARAMETERS, temperatureC: 0 });
  closeTo(state.temperatureKelvin, CELSIUS_OFFSET, 1e-12);
});

test('le volume en litres est converti en mètres cubes', () => {
  closeTo(litersToCubicMeters(20), 0.02, 1e-15);
});

test('à V et n constants, doubler T en kelvins double P', () => {
  const p1 = computePressurePa({ amountMol: 1.5, temperatureKelvin: 250, volumeM3: 0.03 });
  const p2 = computePressurePa({ amountMol: 1.5, temperatureKelvin: 500, volumeM3: 0.03 });
  closeTo(p2 / p1, 2, 1e-14);
});

test('à T et n constants, doubler V divise P par deux', () => {
  const p1 = computePressurePa({ amountMol: 1.5, temperatureKelvin: 300, volumeM3: 0.02 });
  const p2 = computePressurePa({ amountMol: 1.5, temperatureKelvin: 300, volumeM3: 0.04 });
  closeTo(p2 / p1, 0.5, 1e-14);
});

test('à T et V constants, doubler n double P', () => {
  const p1 = computePressurePa({ amountMol: 1, temperatureKelvin: 300, volumeM3: 0.02 });
  const p2 = computePressurePa({ amountMol: 2, temperatureKelvin: 300, volumeM3: 0.02 });
  closeTo(p2 / p1, 2, 1e-14);
});

test('T ≤ 0 K, V ≤ 0 et n ≤ 0 sont interdits dans le calcul fondamental', () => {
  assert.throws(
    () => computePressurePa({ amountMol: 1, temperatureKelvin: 0, volumeM3: 0.02 }),
    RangeError,
  );
  assert.throws(
    () => computePressurePa({ amountMol: 1, temperatureKelvin: 300, volumeM3: 0 }),
    RangeError,
  );
  assert.throws(
    () => computePressurePa({ amountMol: 0, temperatureKelvin: 300, volumeM3: 0.02 }),
    RangeError,
  );
});

test('la vitesse microscopique illustrative croît comme √T', () => {
  const factor1 = particleSpeedFactor(250);
  const factor2 = particleSpeedFactor(1000);
  closeTo(factor2 / factor1, 2, 1e-14);
});

test('le nombre de points visibles est représentatif et borné, pas égal à nNA', () => {
  const countLow = representativeParticleCount(0.2);
  const countHigh = representativeParticleCount(5);
  assert.equal(countLow, 22);
  assert.equal(countHigh, 72);
  assert.ok(countHigh < 100);
});

test('les trois protocoles produisent une relation linéaire dans la variable tracée', () => {
  for (const protocolId of ['isochoric', 'isothermal', 'isomolar']) {
    const series = createProtocolSeries(DEFAULT_GAS_PARAMETERS, protocolId, { sampleCount: 41 });
    const regression = computeLinearRegression(
      series.points.map((point) => ({ x: point.x, y: point.pressurePa })),
    );
    assert.ok(regression);
    assert.ok(regression.rSquared > 0.999999999999);
    closeTo(
      regression.slope,
      protocolTheoreticalSlopePa(protocolId, DEFAULT_GAS_PARAMETERS),
      Math.abs(regression.slope) * 1e-12,
      protocolId,
    );
  }
});

test('les grandeurs verrouillées restent constantes dans chaque série de protocole', () => {
  const parameters = { temperatureC: 80, volumeL: 27, amountMol: 1.3 };
  const isochoric = createProtocolSeries(parameters, 'isochoric', { sampleCount: 9 });
  assert.ok(isochoric.points.every((point) => point.state.volumeL === 27));
  assert.ok(isochoric.points.every((point) => point.state.amountMol === 1.3));

  const isothermal = createProtocolSeries(parameters, 'isothermal', { sampleCount: 9 });
  assert.ok(isothermal.points.every((point) => point.state.temperatureC === 80));
  assert.ok(isothermal.points.every((point) => point.state.amountMol === 1.3));

  const isomolar = createProtocolSeries(parameters, 'isomolar', { sampleCount: 9 });
  assert.ok(isomolar.points.every((point) => point.state.temperatureC === 80));
  assert.ok(isomolar.points.every((point) => point.state.volumeL === 27));
});

test('une mesure utilise le même état pour P, T, V, n et l’abscisse', () => {
  const measurement = createMeasurement({ temperatureC: 42, volumeL: 17, amountMol: 0.85 }, 'isothermal');
  closeTo(measurement.x, 1 / 17, 1e-15);
  closeTo(
    measurement.pressurePa,
    0.85 * IDEAL_GAS_CONSTANT * (42 + 273.15) / 0.017,
    1e-9,
  );
});

test('la prédiction attendue dépend du protocole sans être révélée avant validation', () => {
  assert.equal(evaluatePrediction('isochoric', 'increase').isCorrect, true);
  assert.equal(evaluatePrediction('isothermal', 'decrease').isCorrect, true);
  assert.equal(evaluatePrediction('isomolar', 'same').isCorrect, false);
});

test('les paramètres externes sont ramenés dans le domaine annoncé', () => {
  assert.deepEqual(
    normalizeGasParameters({ temperatureC: -999, volumeL: 999, amountMol: Number.NaN }),
    { temperatureC: -100, volumeL: 60, amountMol: 2 },
  );
});
