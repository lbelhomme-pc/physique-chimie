import test from 'node:test';
import assert from 'node:assert/strict';

import {
  RC_MODE,
  computeCapacitorTangentVoltage,
  computeRcReferenceMarkers,
  computeRcState,
  computeTimeConstantSeconds,
  createRcSeries,
  normalizeRcParameters,
} from '../../src/scripts/laboratoire/circuit-rc-model.js';

const REFERENCE = Object.freeze({
  mode: RC_MODE.CHARGE,
  voltageV: 5,
  resistanceKOhm: 10,
  capacitanceMicroF: 100,
});

function closeTo(actual, expected, tolerance, message = '') {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${message} attendu ${expected}, obtenu ${actual}`,
  );
}

test('R = 10 kΩ et C = 100 µF donnent τ = 1,00 s', () => {
  closeTo(computeTimeConstantSeconds(REFERENCE), 1, 1e-12);
});

test('les valeurs de charge à τ et 5τ sont conformes aux repères', () => {
  const markers = computeRcReferenceMarkers(REFERENCE);
  closeTo(markers.atTau.capacitorVoltageV / REFERENCE.voltageV, 1 - Math.exp(-1), 1e-12);
  closeTo(markers.atTau.resistorVoltageV / REFERENCE.voltageV, Math.exp(-1), 1e-12);
  closeTo(markers.atFiveTau.capacitorVoltageV / REFERENCE.voltageV, 1 - Math.exp(-5), 1e-12);
  closeTo(markers.atTau.capacitorVoltageV / REFERENCE.voltageV, 0.6321205588, 1e-9);
  closeTo(markers.atFiveTau.capacitorVoltageV / REFERENCE.voltageV, 0.993262053, 1e-9);
});

test('pour E = 5,00 V et R = 10 kΩ, i(0) = 0,500 mA', () => {
  const initial = computeRcState(REFERENCE, 0);
  closeTo(initial.currentMilliA, 0.5, 1e-12);
});

test('la loi des mailles uC + uR = E est vérifiée pendant la charge', () => {
  const tau = computeTimeConstantSeconds(REFERENCE);
  for (const multiple of [0, 0.1, 0.5, 1, 2, 5, 20]) {
    const point = computeRcState(REFERENCE, multiple * tau);
    closeTo(point.capacitorVoltageV + point.resistorVoltageV, REFERENCE.voltageV, 1e-12);
    closeTo(point.chargeLoopResidualV, 0, 1e-12);
  }
});

test('la décharge utilise une convention de courant signée cohérente', () => {
  const parameters = { ...REFERENCE, mode: RC_MODE.DISCHARGE };
  const tau = computeTimeConstantSeconds(parameters);
  const initial = computeRcState(parameters, 0);
  const atTau = computeRcState(parameters, tau);

  closeTo(initial.capacitorVoltageV, 5, 1e-12);
  closeTo(initial.currentMilliA, -0.5, 1e-12);
  closeTo(initial.resistorVoltageV, -5, 1e-12);
  closeTo(atTau.capacitorVoltageV / 5, Math.exp(-1), 1e-12);
  closeTo(atTau.capacitorVoltageV + atTau.resistorVoltageV, 0, 1e-12);
});

test('l’énergie à τ ne suit pas le repère 63 % de la tension', () => {
  const tau = computeTimeConstantSeconds(REFERENCE);
  const point = computeRcState(REFERENCE, tau);
  const expectedEnergyRatio = (1 - Math.exp(-1)) ** 2;
  closeTo(point.capacitorEnergyJ / point.maximumEnergyJ, expectedEnergyRatio, 1e-12);
  assert.ok(Math.abs(expectedEnergyRatio - 0.632) > 0.2);
  closeTo(expectedEnergyRatio, 0.3995764, 1e-7);
});

test('la tangente à l’origine permet de lire τ', () => {
  const tau = computeTimeConstantSeconds(REFERENCE);
  closeTo(computeCapacitorTangentVoltage(REFERENCE, 0), 0, 1e-12);
  closeTo(computeCapacitorTangentVoltage(REFERENCE, tau), REFERENCE.voltageV, 1e-12);

  const discharge = { ...REFERENCE, mode: RC_MODE.DISCHARGE };
  closeTo(computeCapacitorTangentVoltage(discharge, 0), REFERENCE.voltageV, 1e-12);
  closeTo(computeCapacitorTangentVoltage(discharge, tau), 0, 1e-12);
});

test('les séries restent monotones et synchronisées de 0 à 5τ', () => {
  const charge = createRcSeries(REFERENCE, { maxTau: 5, sampleCount: 101 });
  for (let index = 1; index < charge.points.length; index += 1) {
    const before = charge.points[index - 1];
    const after = charge.points[index];
    assert.ok(after.capacitorVoltageV >= before.capacitorVoltageV);
    assert.ok(after.resistorVoltageV <= before.resistorVoltageV);
    assert.ok(after.currentA <= before.currentA);
    assert.ok(after.capacitorEnergyJ >= before.capacitorEnergyJ);
    closeTo(after.capacitorVoltageV + after.resistorVoltageV, REFERENCE.voltageV, 1e-12);
  }

  const discharge = createRcSeries({ ...REFERENCE, mode: RC_MODE.DISCHARGE }, { maxTau: 5, sampleCount: 101 });
  for (let index = 1; index < discharge.points.length; index += 1) {
    const before = discharge.points[index - 1];
    const after = discharge.points[index];
    assert.ok(after.capacitorVoltageV <= before.capacitorVoltageV);
    assert.ok(Math.abs(after.currentA) <= Math.abs(before.currentA));
    assert.ok(after.capacitorEnergyJ <= before.capacitorEnergyJ);
    closeTo(after.capacitorVoltageV + after.resistorVoltageV, 0, 1e-12);
  }
});

test('les paramètres externes sont bornés au domaine documenté', () => {
  assert.deepEqual(
    normalizeRcParameters({
      mode: 'impossible',
      voltageV: -30,
      resistanceKOhm: 5000,
      capacitanceMicroF: Number.NaN,
    }),
    {
      mode: RC_MODE.CHARGE,
      voltageV: 1,
      resistanceKOhm: 100,
      capacitanceMicroF: 100,
    },
  );
});
