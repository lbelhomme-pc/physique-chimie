import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildParallelTangents,
  computeAnalyteConcentrationFromReadEquivalence,
  computeEquivalentVolumeMl,
  computeTitrationState,
  estimateEquivalenceByDerivative,
  generateTitrationCurve,
} from '../../src/scripts/laboratoire/titration-ph-model.js';

const strong = {
  presetId: 'strong-acid',
  analyteConcentration: 0.100,
  analyteVolumeMl: 20.0,
  titrantConcentration: 0.100,
};

const weak = { ...strong, presetId: 'weak-acid' };

function close(actual, expected, tolerance, message) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} au lieu de ${expected}`);
}

test('volume équivalent stœchiométrique', () => {
  close(computeEquivalentVolumeMl(strong), 20.0, 1e-12, 'VE');
});

test('titrage acide fort / base forte : points de référence', () => {
  close(computeTitrationState(strong, 0).pH, 1.0, 1e-9, 'pH initial');
  close(computeTitrationState(strong, 20).pH, 7.0, 1e-9, 'pH à équivalence');
  close(computeTitrationState(strong, 30).pH, 12.30103, 1e-5, 'pH après équivalence');
});

test('titrage acide faible / base forte : demi-équivalence et équivalence non neutre', () => {
  close(computeTitrationState(weak, 10).pH, 4.76, 0.01, 'pH à demi-équivalence');
  assert.ok(computeTitrationState(weak, 20).pH > 7, 'Le pH à équivalence doit être basique.');
});

test('avancement et réactif limitant restent cohérents', () => {
  const before = computeTitrationState(strong, 10);
  const at = computeTitrationState(strong, 20);
  const after = computeTitrationState(strong, 30);

  assert.equal(before.limitingReagent, 'titrant');
  assert.equal(at.limitingReagent, 'equivalence');
  assert.equal(after.limitingReagent, 'analyte');
  close(before.reactionExtentMoles, before.titrantAddedMoles, 1e-12, 'ξ avant équivalence');
  close(after.reactionExtentMoles, after.analyteInitialMoles, 1e-12, 'ξ après équivalence');
});

test('la courbe est monotone croissante dans les scénarios proposés', () => {
  for (const parameters of [strong, weak]) {
    const curve = generateTitrationCurve(parameters, { maxVolumeMl: 40, points: 801 });
    for (let index = 1; index < curve.length; index += 1) {
      assert.ok(curve[index].pH >= curve[index - 1].pH - 1e-9);
    }
  }
});

test('les lectures par dérivée et tangentes retrouvent VE', () => {
  for (const parameters of [strong, weak]) {
    const curve = generateTitrationCurve(parameters, { maxVolumeMl: 40, points: 801 });
    const derivative = estimateEquivalenceByDerivative(curve);
    const tangents = buildParallelTangents(curve);
    close(derivative.volumeMl, 20.0, 0.06, 'VE par dérivée');
    close(tangents.volumeMl, 20.0, 0.08, 'VE par tangentes parallèles');
  }
});

test('le calcul inverse retrouve la concentration titrée', () => {
  close(
    computeAnalyteConcentrationFromReadEquivalence(strong, 20.0),
    0.100,
    1e-12,
    'C_A calculée',
  );
});
