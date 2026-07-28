import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DISH_RADIUS_UM,
  advanceCloud,
  buildTheoreticalSeries,
  cloneCloud,
  computeDiffusionComparison,
  computeTemperatureState,
  createInitialCloud,
  createSeededRandom,
  createStandardNoise,
  normalizeDiffusionParameters,
  reflectInsideCircle,
  summarizeCloud,
  theoreticalMeanSquareDisplacementUm2,
  theoreticalRmsDistanceUm,
  waterDynamicViscosityPaS,
} from '../../src/scripts/laboratoire/diffusion-temperature-model.js';

function approximately(actual, expected, tolerance, message = '') {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${message} attendu ${expected}, obtenu ${actual}`);
}

test('la viscosité de l’eau diminue lorsque la température augmente', () => {
  const eta20 = waterDynamicViscosityPaS(293.15);
  const eta60 = waterDynamicViscosityPaS(333.15);
  assert.ok(eta60 < eta20);
  approximately(eta20, 1.002e-3, 0.01e-3);
});

test('Stokes-Einstein donne un coefficient de diffusion croissant avec T', () => {
  const state20 = computeTemperatureState(20);
  const state60 = computeTemperatureState(60);
  assert.ok(state60.diffusionUm2S > state20.diffusionUm2S);
  approximately(state20.diffusionUm2S, 2.14, 0.05);
  approximately(state60.diffusionUm2S, 5.27, 0.08);
});

test('<r²> = 4Dt en deux dimensions', () => {
  assert.equal(theoreticalMeanSquareDisplacementUm2(2.5, 8), 80);
});

test('multiplier le temps par quatre double la distance quadratique moyenne', () => {
  const rms1 = theoreticalRmsDistanceUm(3, 5);
  const rms4 = theoreticalRmsDistanceUm(3, 20);
  approximately(rms4 / rms1, 2, 1e-12);
});

test('la même graine reproduit exactement le même nuage initial', () => {
  assert.deepEqual(
    createInitialCloud({ particleCount: 80, seed: 42 }),
    createInitialCloud({ particleCount: 80, seed: 42 }),
  );
});

test('un même bruit produit une dispersion plus grande quand D augmente', () => {
  const initial = createInitialCloud({ particleCount: 120, seed: 7, initialSpreadUm: 0 });
  const noise = createStandardNoise(initial.length, createSeededRandom(99));
  const slow = advanceCloud(cloneCloud(initial), { diffusionUm2S: 2, deltaTimeS: 1, standardNoise: noise });
  const fast = advanceCloud(cloneCloud(initial), { diffusionUm2S: 8, deltaTimeS: 1, standardNoise: noise });
  const slowSummary = summarizeCloud(slow);
  const fastSummary = summarizeCloud(fast);
  approximately(fastSummary.rmsDistanceUm / slowSummary.rmsDistanceUm, 2, 1e-12);
});

test('le mouvement brownien échantillonné ne présente pas de dérive systématique', () => {
  const initial = createInitialCloud({ particleCount: 300, seed: 123, initialSpreadUm: 0 });
  let cloud = cloneCloud(initial);
  const random = createSeededRandom(456);
  for (let step = 0; step < 200; step += 1) {
    cloud = advanceCloud(cloud, {
      diffusionUm2S: 2.5,
      deltaTimeS: 0.02,
      standardNoise: createStandardNoise(cloud.length, random),
    });
  }
  const summary = summarizeCloud(cloud);
  assert.ok(summary.meanPositionDistanceUm < 1.5, `dérive mesurée : ${summary.meanPositionDistanceUm} µm`);
});

test('le nombre de traceurs est conservé avec et sans brassage', () => {
  const initial = createInitialCloud({ particleCount: 140, seed: 9 });
  const noise = createStandardNoise(initial.length, createSeededRandom(10));
  const diffusion = advanceCloud(initial, { diffusionUm2S: 3, deltaTimeS: 0.1, standardNoise: noise });
  const stirring = advanceCloud(initial, { diffusionUm2S: 3, deltaTimeS: 0.1, standardNoise: noise, stirring: true });
  assert.equal(diffusion.length, 140);
  assert.equal(stirring.length, 140);
});

test('le brassage ajoute une advection organisée distincte de la diffusion', () => {
  const particle = [{ id: 0, x: 10, y: 0, x0: 10, y0: 0 }];
  const still = advanceCloud(particle, { diffusionUm2S: 0, deltaTimeS: 1, standardNoise: [[0, 0]], stirring: false });
  const stirred = advanceCloud(particle, { diffusionUm2S: 0, deltaTimeS: 1, standardNoise: [[0, 0]], stirring: true, angularSpeedRadS: 0.2 });
  assert.equal(still[0].y, 0);
  assert.ok(stirred[0].y > 0);
});

test('la réflexion maintient les particules dans l’enceinte circulaire', () => {
  const reflected = reflectInsideCircle(100, 0, DISH_RADIUS_UM);
  assert.ok(Math.hypot(reflected.x, reflected.y) <= DISH_RADIUS_UM);
});

test('les paramètres hors bornes sont réparés', () => {
  const normalized = normalizeDiffusionParameters({
    temperatureA_C: -200,
    temperatureB_C: 800,
    particleCount: 2,
    seed: 0,
  });
  assert.deepEqual(normalized, {
    temperatureA_C: 5,
    temperatureB_C: 90,
    particleCount: 40,
    seed: 1,
  });
});

test('la comparaison identifie le milieu le plus chaud et son rapport D', () => {
  const comparison = computeDiffusionComparison({ temperatureA_C: 20, temperatureB_C: 60 });
  assert.equal(comparison.hotterLabel, 'B');
  assert.ok(comparison.diffusionRatio > 2);
});

test('la série théorique contient l’état initial et la durée finale', () => {
  const series = buildTheoreticalSeries(2, { durationS: 10, stepS: 3 });
  assert.deepEqual(series[0], { timeS: 0, meanSquareDisplacementUm2: 0 });
  assert.equal(series.at(-1).timeS, 10);
  assert.equal(series.at(-1).meanSquareDisplacementUm2, 80);
});
