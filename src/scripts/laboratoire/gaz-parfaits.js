import { createLabRuntime, fitCanvas, frNumber, onLabReady, prefersReducedMotion } from "./lab-utils.js";

onLabReady('[data-lab-app="gaz-parfaits"]', (root) => {
  const q = (selector) => root.querySelector(selector);

  const sliderTemp = q("#slider-temp");
  const sliderVol = q("#slider-vol");
  const sliderMol = q("#slider-mol");
  const valTempC = q("#val-temp-c");
  const valTempK = q("#val-temp-k");
  const valVol = q("#val-vol");
  const valMol = q("#val-mol");
  const valPressure = q("#val-pressure");
  const pressureWarning = q("#pressure-warning");
  const observation = q("#gas-observation");
  const objective = q("#gas-objective");
  const valCollisions = q("#val-collisions");
  const valDensity = q("#val-density");
  const valGasSpeed = q("#val-gas-speed");
  const btnToggle = q("#btn-gas-toggle");
  const btnReset = q("#btn-gas-reset");
  const canvas = q("#gasCanvas");
  const cylinder = q("#cylinderWalls");
  const piston = q("#piston");

  if (!sliderTemp || !sliderVol || !sliderMol || !canvas || !cylinder || !piston) return;

  const runtime = createLabRuntime(root);
  const R = 8.314;
  const particles = [];
  const reducedMotion = prefersReducedMotion();
  let canvasState = fitCanvas(canvas);
  let temperatureK = 293.15;
  let volumeL = 20;
  let amountMol = 2;
  let isPaused = true;
  let collisionCount = 0;
  let recentCollisions = 0;
  let collisionWindow = 0;

  runtime.observe(cylinder, () => {
    canvasState = fitCanvas(canvas);
    particles.forEach((particle) => {
      particle.x = Math.min(particle.x, canvasState.width - 8);
      particle.y = Math.min(particle.y, canvasState.height - 8);
    });
    updatePhysics();
  });

  function pressureBar() {
    const volumeM3 = volumeL / 1000;
    return (amountMol * R * temperatureK) / volumeM3 / 100000;
  }

  function createParticle() {
    const pistonX = (volumeL / 50) * canvasState.width;
    const speed = Math.sqrt(temperatureK) * 0.11 * (0.75 + Math.random() * 0.55);
    const angle = Math.random() * Math.PI * 2;
    return {
      r: 3,
      x: 8 + Math.random() * Math.max(12, pistonX - 16),
      y: 8 + Math.random() * Math.max(12, canvasState.height - 16),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
    };
  }

  function syncParticles() {
    const target = Math.round(amountMol * 48);
    while (particles.length < target) particles.push(createParticle());
    while (particles.length > target) particles.pop();
  }

  function updatePhysics() {
    const oldTemperature = temperatureK;
    const tempC = Number(sliderTemp.value);
    temperatureK = tempC + 273.15;
    volumeL = Number(sliderVol.value);
    amountMol = Number(sliderMol.value);

    valTempC.textContent = `${frNumber(tempC, 0)} °C`;
    valTempK.textContent = `${frNumber(temperatureK, 1)} K`;
    valVol.textContent = frNumber(volumeL, 0);
    valMol.textContent = frNumber(amountMol, 1);

    const pressure = pressureBar();
    valPressure.textContent = `${frNumber(pressure, 2)} bar`;
    if (valDensity) valDensity.textContent = `${frNumber(amountMol / volumeL, 3)} mol/L`;
    if (valGasSpeed) valGasSpeed.textContent = `${frNumber(Math.sqrt(temperatureK / 293.15), 2)}×`;

    const ratio = Math.max(0, Math.min(1, (tempC + 50) / 200));
    const red = Math.round(60 + ratio * 195);
    const blue = Math.round(230 - ratio * 170);
    const tempColor = `rgb(${red}, 80, ${blue})`;
    [valTempC, valTempK].forEach((node) => {
      node.style.borderColor = tempColor;
      node.style.color = tempColor;
    });

    if (pressure > 6) {
      valPressure.style.color = "#ef4444";
      pressureWarning.style.opacity = "1";
    } else if (pressure > 4) {
      valPressure.style.color = "#f59e0b";
      pressureWarning.style.opacity = "0";
    } else {
      valPressure.style.color = "#22d3ee";
      pressureWarning.style.opacity = "0";
    }

    const pistonX = (volumeL / 50) * canvasState.width;
    piston.style.left = `${pistonX}px`;
    const speedRatio = Math.sqrt(temperatureK) / Math.sqrt(oldTemperature || temperatureK);
    particles.forEach((particle) => {
      particle.vx *= speedRatio;
      particle.vy *= speedRatio;
      particle.x = Math.min(particle.x, pistonX - particle.r);
    });
    syncParticles();
    updateObservation(pressure);
  }

  function setPaused(nextPaused) {
    isPaused = nextPaused;
    root.classList.toggle("is-gas-running", !isPaused);
    root.classList.toggle("is-gas-paused", isPaused);
    if (!btnToggle) return;
    btnToggle.textContent = isPaused ? "Lancer" : "Pause";
    btnToggle.setAttribute("aria-pressed", String(!isPaused));
    btnToggle.classList.toggle("is-active", !isPaused);
    updateObservation();
  }

  function resetSimulation() {
    sliderTemp.value = "20";
    sliderVol.value = "20";
    sliderMol.value = "2";
    particles.length = 0;
    collisionCount = 0;
    recentCollisions = 0;
    collisionWindow = 0;
    updatePhysics();
    setPaused(true);
  }

  function updateObservation(pressure = pressureBar()) {
    if (!observation) return;
    if (objective) {
      objective.textContent = isPaused
        ? "Clique sur Lancer : les particules vont frapper les parois et la pression sera reliée aux chocs."
        : "Change T, V ou n une par une : P augmente si les chocs deviennent plus fréquents ou plus intenses.";
    }
    if (pressure > 6) {
      observation.textContent = "La pression devient très élevée : diminue n ou T, ou augmente le volume.";
    } else if (pressure > 4) {
      observation.textContent = "La pression augmente fortement : les chocs contre les parois sont plus nombreux ou plus intenses.";
    } else {
      observation.textContent = `Pression calculée : ${frNumber(pressure, 2)} bar. Observe l'effet de T, V et n sur les collisions.`;
    }
  }

  function draw() {
    const { ctx, width, height } = canvasState;
    const tempC = Number(sliderTemp.value);
    const ratio = Math.max(0, Math.min(1, (tempC + 50) / 200));
    const red = Math.round(70 + ratio * 185);
    const blue = Math.round(230 - ratio * 140);
    const pistonX = (volumeL / 50) * width;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = `rgb(${red}, 150, ${blue})`;

    particles.forEach((particle) => {
      if (!isPaused) {
        particle.x += particle.vx;
        particle.y += particle.vy;
      }

      if (particle.x - particle.r < 0) {
        particle.x = particle.r;
        particle.vx *= -1;
      }
      if (particle.y - particle.r < 0) {
        particle.y = particle.r;
        particle.vy *= -1;
      }
      if (particle.y + particle.r > height) {
        particle.y = height - particle.r;
        particle.vy *= -1;
      }
      if (particle.x + particle.r > pistonX) {
        particle.x = pistonX - particle.r;
        particle.vx = -Math.abs(particle.vx);
        if (!isPaused) collisionCount += 1;
      }

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.fill();
    });

    collisionWindow += 1;
    if (collisionWindow >= 18) {
      recentCollisions = collisionCount;
      collisionCount = 0;
      collisionWindow = 0;
      if (valCollisions) valCollisions.textContent = String(recentCollisions);
    }
  }

  [sliderTemp, sliderVol, sliderMol].forEach((slider) => runtime.on(slider, "input", updatePhysics));
  runtime.on(btnToggle, "click", () => setPaused(!isPaused));
  runtime.on(btnReset, "click", resetSimulation);

  updatePhysics();
  setPaused(true);
  runtime.frame(draw);
});
