/**
 * Modèle scientifique pur — diffusion brownienne d'un traceur dans l'eau.
 *
 * Hypothèses : particules sphériques diluées, rayon constant, fluide newtonien,
 * régime de Stokes, absence d'interaction entre traceurs et température uniforme.
 * La viscosité de l'eau est estimée par une loi empirique de type Vogel.
 * Le mouvement brownien 2D vérifie, avant effet notable des parois : <r²> = 4 D t.
 */

export const BOLTZMANN_CONSTANT = 1.380649e-23; // J·K⁻¹, valeur SI exacte
export const TRACER_RADIUS_M = 100e-9; // 100 nm
export const DISH_RADIUS_UM = 75;
export const MAX_SIMULATION_TIME_S = 60;

export const DEFAULT_DIFFUSION_PARAMETERS = Object.freeze({
  temperatureA_C: 20,
  temperatureB_C: 60,
  particleCount: 160,
  seed: 20260715,
});

export const DIFFUSION_LIMITS = Object.freeze({
  temperatureC: Object.freeze({ min: 5, max: 90 }),
  particleCount: Object.freeze({ min: 40, max: 300 }),
  seed: Object.freeze({ min: 1, max: 0xffffffff }),
});

export function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function celsiusToKelvin(temperatureC) {
  return Number(temperatureC) + 273.15;
}

/**
 * Approximation empirique de la viscosité dynamique de l'eau liquide :
 * η = A × 10^(B / (T - C)), avec T en kelvins et η en Pa·s.
 * Domaine pédagogique utilisé ici : 5 à 90 °C.
 */
export function waterDynamicViscosityPaS(temperatureKelvin) {
  const T = Number(temperatureKelvin);
  if (!Number.isFinite(T) || T <= 140) {
    throw new RangeError('La température doit être supérieure à 140 K pour la loi de viscosité utilisée.');
  }
  return 2.414e-5 * 10 ** (247.8 / (T - 140));
}

export function stokesEinsteinDiffusionM2S({
  temperatureKelvin,
  viscosityPaS,
  tracerRadiusM = TRACER_RADIUS_M,
}) {
  const T = Number(temperatureKelvin);
  const eta = Number(viscosityPaS);
  const radius = Number(tracerRadiusM);
  if (!(T > 0) || !(eta > 0) || !(radius > 0)) {
    throw new RangeError('T, η et le rayon du traceur doivent être strictement positifs.');
  }
  return (BOLTZMANN_CONSTANT * T) / (6 * Math.PI * eta * radius);
}

export function normalizeDiffusionParameters(parameters = {}) {
  const source = { ...DEFAULT_DIFFUSION_PARAMETERS, ...parameters };
  return {
    temperatureA_C: clamp(
      Number(source.temperatureA_C),
      DIFFUSION_LIMITS.temperatureC.min,
      DIFFUSION_LIMITS.temperatureC.max,
    ),
    temperatureB_C: clamp(
      Number(source.temperatureB_C),
      DIFFUSION_LIMITS.temperatureC.min,
      DIFFUSION_LIMITS.temperatureC.max,
    ),
    particleCount: Math.round(clamp(
      Number(source.particleCount),
      DIFFUSION_LIMITS.particleCount.min,
      DIFFUSION_LIMITS.particleCount.max,
    )),
    seed: Math.round(clamp(
      Number(source.seed),
      DIFFUSION_LIMITS.seed.min,
      DIFFUSION_LIMITS.seed.max,
    )),
  };
}

export function computeTemperatureState(temperatureC) {
  const boundedC = clamp(
    Number(temperatureC),
    DIFFUSION_LIMITS.temperatureC.min,
    DIFFUSION_LIMITS.temperatureC.max,
  );
  const temperatureKelvin = celsiusToKelvin(boundedC);
  const viscosityPaS = waterDynamicViscosityPaS(temperatureKelvin);
  const diffusionM2S = stokesEinsteinDiffusionM2S({
    temperatureKelvin,
    viscosityPaS,
  });
  return {
    temperatureC: boundedC,
    temperatureKelvin,
    viscosityPaS,
    viscosityMilliPaS: viscosityPaS * 1000,
    diffusionM2S,
    diffusionUm2S: diffusionM2S * 1e12,
  };
}

export function computeDiffusionComparison(parameters = {}) {
  const normalized = normalizeDiffusionParameters(parameters);
  const stateA = computeTemperatureState(normalized.temperatureA_C);
  const stateB = computeTemperatureState(normalized.temperatureB_C);
  const lower = Math.min(stateA.diffusionUm2S, stateB.diffusionUm2S);
  const higher = Math.max(stateA.diffusionUm2S, stateB.diffusionUm2S);
  return {
    parameters: normalized,
    stateA,
    stateB,
    diffusionRatio: higher / lower,
    hotterLabel: stateA.temperatureC === stateB.temperatureC
      ? 'same'
      : stateA.temperatureC > stateB.temperatureC ? 'A' : 'B',
  };
}

export function theoreticalMeanSquareDisplacementUm2(diffusionUm2S, timeS) {
  const D = Math.max(0, Number(diffusionUm2S));
  const time = Math.max(0, Number(timeS));
  return 4 * D * time;
}

export function theoreticalRmsDistanceUm(diffusionUm2S, timeS) {
  return Math.sqrt(theoreticalMeanSquareDisplacementUm2(diffusionUm2S, timeS));
}

/** Mulberry32 : générateur pseudo-aléatoire déterministe pour reproduire un protocole. */
export function createSeededRandom(seed = DEFAULT_DIFFUSION_PARAMETERS.seed) {
  let state = Number(seed) >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function createGaussianPair(random = Math.random) {
  const u1 = Math.max(Number.EPSILON, random());
  const u2 = random();
  const radius = Math.sqrt(-2 * Math.log(u1));
  const angle = 2 * Math.PI * u2;
  return [radius * Math.cos(angle), radius * Math.sin(angle)];
}

export function createStandardNoise(count, random = Math.random) {
  return Array.from({ length: count }, () => createGaussianPair(random));
}

export function createInitialCloud({
  particleCount = DEFAULT_DIFFUSION_PARAMETERS.particleCount,
  seed = DEFAULT_DIFFUSION_PARAMETERS.seed,
  initialSpreadUm = 1.2,
} = {}) {
  const count = Math.round(clamp(
    Number(particleCount),
    DIFFUSION_LIMITS.particleCount.min,
    DIFFUSION_LIMITS.particleCount.max,
  ));
  const random = createSeededRandom(seed);
  return Array.from({ length: count }, (_, index) => {
    const [zx, zy] = createGaussianPair(random);
    const x = zx * initialSpreadUm;
    const y = zy * initialSpreadUm;
    return {
      id: index,
      x,
      y,
      x0: x,
      y0: y,
    };
  });
}

export function cloneCloud(particles) {
  return particles.map((particle) => ({ ...particle }));
}

export function reflectInsideCircle(x, y, radiusUm = DISH_RADIUS_UM) {
  const radius = Math.hypot(x, y);
  if (radius <= radiusUm || radius === 0) return { x, y };
  // Réflexion radiale du dépassement. Les pas sont bornés dans le contrôleur,
  // mais la boucle protège aussi les appels de test très grands.
  let reflectedRadius = radius;
  while (reflectedRadius > radiusUm) {
    reflectedRadius = Math.abs(2 * radiusUm - reflectedRadius);
  }
  const scale = reflectedRadius / radius;
  return { x: x * scale, y: y * scale };
}

export function advanceCloud(particles, {
  diffusionUm2S,
  deltaTimeS,
  standardNoise,
  stirring = false,
  angularSpeedRadS = 0.22,
  dishRadiusUm = DISH_RADIUS_UM,
} = {}) {
  const D = Math.max(0, Number(diffusionUm2S));
  const dt = Math.max(0, Number(deltaTimeS));
  const sigma = Math.sqrt(2 * D * dt);
  const noise = standardNoise ?? createStandardNoise(particles.length);

  return particles.map((particle, index) => {
    const [zx = 0, zy = 0] = noise[index] ?? [0, 0];
    const advectiveX = stirring ? -angularSpeedRadS * particle.y * dt : 0;
    const advectiveY = stirring ? angularSpeedRadS * particle.x * dt : 0;
    const proposedX = particle.x + sigma * zx + advectiveX;
    const proposedY = particle.y + sigma * zy + advectiveY;
    const reflected = reflectInsideCircle(proposedX, proposedY, dishRadiusUm);
    return { ...particle, x: reflected.x, y: reflected.y };
  });
}

export function summarizeCloud(particles) {
  if (!Array.isArray(particles) || particles.length === 0) {
    return {
      count: 0,
      meanXUm: 0,
      meanYUm: 0,
      meanPositionDistanceUm: 0,
      meanSquareDisplacementUm2: 0,
      rmsDistanceUm: 0,
      widthXUm: 0,
      widthYUm: 0,
    };
  }

  const totals = particles.reduce((accumulator, particle) => {
    const dx = particle.x - particle.x0;
    const dy = particle.y - particle.y0;
    accumulator.x += particle.x;
    accumulator.y += particle.y;
    accumulator.dx2 += dx * dx;
    accumulator.dy2 += dy * dy;
    return accumulator;
  }, { x: 0, y: 0, dx2: 0, dy2: 0 });

  const count = particles.length;
  const meanXUm = totals.x / count;
  const meanYUm = totals.y / count;
  const varianceX = totals.dx2 / count;
  const varianceY = totals.dy2 / count;
  const meanSquareDisplacementUm2 = varianceX + varianceY;

  return {
    count,
    meanXUm,
    meanYUm,
    meanPositionDistanceUm: Math.hypot(meanXUm, meanYUm),
    meanSquareDisplacementUm2,
    rmsDistanceUm: Math.sqrt(meanSquareDisplacementUm2),
    widthXUm: Math.sqrt(varianceX),
    widthYUm: Math.sqrt(varianceY),
  };
}

export function buildTheoreticalSeries(diffusionUm2S, {
  durationS = MAX_SIMULATION_TIME_S,
  stepS = 2,
} = {}) {
  const duration = Math.max(0, Number(durationS));
  const step = Math.max(0.1, Number(stepS));
  const points = [];
  for (let timeS = 0; timeS < duration; timeS += step) {
    points.push({
      timeS,
      meanSquareDisplacementUm2: theoreticalMeanSquareDisplacementUm2(diffusionUm2S, timeS),
    });
  }
  points.push({
    timeS: duration,
    meanSquareDisplacementUm2: theoreticalMeanSquareDisplacementUm2(diffusionUm2S, duration),
  });
  return points;
}
