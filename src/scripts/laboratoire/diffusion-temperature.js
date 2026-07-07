import { createLabRuntime, fitCanvas, onLabReady, prefersReducedMotion } from "./lab-utils.js";

onLabReady('[data-lab-app="diffusion-temperature"]', (root) => {
  const q = (selector) => root.querySelector(selector);
  const TAU = Math.PI * 2;

  const canvas = q("#diffusionCanvas");
  const beaker = q("#beaker");
  const tempSlider = q("#temperature");
  const tempValText = q("#tempValText");
  const thermoLiquid = q("#thermoLiquid");
  const thermoBulb = q("#thermoBulb");
  const colorantSelect = q("#colorantSelect");
  const btnDrop = q("#drop");
  const btnStirrer = q("#toggleStirrer");
  const btnMotion = q("#toggleMotion");
  const btnReset = q("#reset");
  const observation = q("#diffusionObservation");
  const dispersionValue = q("#dispersionValue");
  const thermalAgitation = q("#thermalAgitation");
  const elapsedTime = q("#elapsedTime");
  const waterLayer = q("#waterLayer");
  const stirrerBar = q("#stirrerBar");
  const surface = q("#surface");

  if (!canvas || !beaker || !tempSlider || !colorantSelect || !btnDrop || !btnStirrer || !btnReset) return;

  const runtime = createLabRuntime(root);
  const colorants = {
    blue: { label: "bleu", r: 37, g: 99, b: 235, diffusion: 1 },
    green: { label: "vert", r: 22, g: 163, b: 74, diffusion: 1 },
    red: { label: "rouge", r: 220, g: 38, b: 38, diffusion: 1 },
  };
  const STIR_DIRECTION = -1;

  let canvasState = fitCanvas(canvas);
  let currentColorant = colorants.blue;
  const reducedMotion = prefersReducedMotion();
  let isStirring = false;
  let isPaused = true;
  let stirPower = 0;
  let elapsedSeconds = 0;
  let clock = 0;
  let lastFrameTime = 0;
  const particles = [];
  let dropCenter = null;

  runtime.observe(beaker, () => {
    canvasState = fitCanvas(canvas);
  });

  function randn() {
    return Math.random() + Math.random() + Math.random() + Math.random() - 2;
  }

  function waterRect() {
    const waterTop = canvasState.height * 0.24;
    return { x: 0, y: waterTop, w: canvasState.width, h: canvasState.height - waterTop };
  }

  function updateTemperatureUI() {
    const temp = Number(tempSlider.value);
    const color = temp < 30 ? "#3b82f6" : temp < 60 ? "#f59e0b" : "#ef4444";
    const waterBackground = temp < 30
      ? "linear-gradient(180deg, rgba(125, 211, 252, 0.22), rgba(56, 189, 248, 0.36))"
      : temp < 60
        ? "linear-gradient(180deg, rgba(251, 191, 36, 0.16), rgba(56, 189, 248, 0.32))"
        : "linear-gradient(180deg, rgba(248, 113, 113, 0.16), rgba(56, 189, 248, 0.3))";
    tempValText.textContent = `${temp} °C`;
    tempValText.style.color = color;
    thermoLiquid.style.height = `${Math.max(6, temp)}%`;
    thermoLiquid.style.background = color;
    thermoBulb.style.background = color;
    if (waterLayer) waterLayer.style.background = waterBackground;
    if (thermalAgitation) thermalAgitation.textContent = `${thermalFactor(temp).toLocaleString("fr-FR", { maximumFractionDigits: 1, minimumFractionDigits: 1 })}×`;
    updateObservation();
  }

  function thermalFactor(temp) {
    return 0.6 + (temp / 100) * 2.4;
  }

  function setStirrer(on) {
    isStirring = on;
    btnStirrer.textContent = `Mélanger : ${on ? "ON" : "OFF"}`;
    btnStirrer.setAttribute("aria-pressed", String(on));
    btnStirrer.classList.toggle("is-active", on);
    stirrerBar.classList.toggle("stirring-anim", on);
    waterLayer.classList.toggle("vortex-active", on);
    updateObservation();
  }

  function setPaused(nextPaused) {
    isPaused = nextPaused;
    root.classList.toggle("is-diffusion-running", !isPaused);
    if (!btnMotion) return;
    btnMotion.textContent = isPaused ? "Lancer" : "Pause";
    btnMotion.setAttribute("aria-pressed", String(!isPaused));
    btnMotion.classList.toggle("is-active", !isPaused);
    updateObservation();
  }

  function updateObservation() {
    if (!observation) return;
    const temp = Number(tempSlider.value);
    const waterState = temp < 30 ? "froide" : temp < 65 ? "tiède" : "chaude";
    const action = particles.length === 0
      ? "Dépose une goutte, puis compare froid et chaud."
      : isPaused
        ? "Clique sur Lancer pour suivre la dispersion."
        : "Observe le diamètre du nuage : il augmente avec l'agitation microscopique.";
    observation.textContent = `${action} Eau ${waterState}. ${isStirring ? "Mélange mécanique activé." : "Diffusion seule."}`;
  }

  function updateMetrics() {
    const wr = waterRect();
    if (elapsedTime) elapsedTime.textContent = `${elapsedSeconds.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} s`;
    if (!dispersionValue) return;
    if (!particles.length || !dropCenter) {
      dispersionValue.textContent = "0 %";
      return;
    }
    const meanDistance = particles.reduce((sum, particle) => {
      return sum + Math.hypot(particle.x - dropCenter.x, particle.y - dropCenter.y);
    }, 0) / particles.length;
    const maxDistance = Math.hypot(wr.w, wr.h) * 0.42;
    const percent = Math.min(100, Math.round((meanDistance / maxDistance) * 100));
    dispersionValue.textContent = `${percent} %`;
  }

  function addDrop() {
    const wr = waterRect();
    particles.length = 0;
    elapsedSeconds = 0;
    const cx = canvasState.width * 0.48 + randn() * canvasState.width * 0.025;
    const cy = wr.y + wr.h * 0.42;
    const count = reducedMotion ? 120 : 260;
    dropCenter = { x: cx, y: cy };

    for (let i = 0; i < count; i += 1) {
      particles.push({
        x: cx + randn() * canvasState.width * 0.012,
        y: cy + randn() * wr.h * 0.018,
        vx: randn() * 1.4,
        vy: randn() * 1.4,
        alpha: 0.1 + Math.random() * 0.22,
        radius: 1.1 + Math.random() * 1.5,
        phase: Math.random() * TAU,
        color: currentColorant,
      });
    }
    setPaused(false);

    if (!reducedMotion && surface?.animate) {
      surface.animate([{ transform: "translateY(3px)" }, { transform: "translateY(0)" }], {
        duration: 350,
        easing: "ease-out",
      });
    }
    updateMetrics();
    updateObservation();
  }

  function draw(time = 0) {
    const { ctx, width, height } = canvasState;
    const wr = waterRect();
    const centerX = width / 2;
    const centerY = wr.y + wr.h * 0.5;
    const temp = Number(tempSlider.value);
    const tempMultiplier = thermalFactor(temp);
    const rawDt = lastFrameTime ? Math.min(0.034, Math.max(0.001, (time - lastFrameTime) / 1000)) : 0.016;
    const dt = reducedMotion ? Math.min(0.012, rawDt) : rawDt;
    lastFrameTime = time;
    if (!isPaused) {
      elapsedSeconds += dt;
      clock += dt;
    }

    stirPower = isStirring ? Math.min(1, stirPower + dt * 2) : Math.max(0, stirPower - dt * 2);
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.beginPath();
    if (stirPower > 0) {
      const vortexDepth = 14 * stirPower;
      ctx.moveTo(wr.x, wr.y + vortexDepth);
      ctx.quadraticCurveTo(centerX, wr.y + vortexDepth * 2.1, wr.x + wr.w, wr.y + vortexDepth);
      ctx.lineTo(wr.x + wr.w, wr.y + wr.h);
      ctx.lineTo(wr.x, wr.y + wr.h);
    } else {
      ctx.rect(wr.x, wr.y, wr.w, wr.h);
    }
    ctx.closePath();
    ctx.clip();

    drawWaterAgitation(ctx, wr, tempMultiplier, clock);

    if (particles.length && dropCenter) {
      const centroid = particles.reduce((sum, particle) => {
        sum.x += particle.x;
        sum.y += particle.y;
        return sum;
      }, { x: 0, y: 0 });
      centroid.x /= particles.length;
      centroid.y /= particles.length;
      const meanDistance = particles.reduce((sum, particle) => {
        return sum + Math.hypot(particle.x - centroid.x, particle.y - centroid.y);
      }, 0) / particles.length;
      const cloudRadius = Math.max(14, Math.min(meanDistance * 1.25, Math.min(wr.w, wr.h) * 0.42));
      const halo = ctx.createRadialGradient(centroid.x, centroid.y, 4, centroid.x, centroid.y, cloudRadius);
      halo.addColorStop(0, `rgba(${currentColorant.r}, ${currentColorant.g}, ${currentColorant.b}, 0.14)`);
      halo.addColorStop(0.58, `rgba(${currentColorant.r}, ${currentColorant.g}, ${currentColorant.b}, 0.065)`);
      halo.addColorStop(1, `rgba(${currentColorant.r}, ${currentColorant.g}, ${currentColorant.b}, 0)`);
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(centroid.x, centroid.y, cloudRadius, 0, TAU);
      ctx.fill();

      if (stirPower < 0.18) {
        ctx.save();
        ctx.strokeStyle = `rgba(${currentColorant.r}, ${currentColorant.g}, ${currentColorant.b}, 0.22)`;
        ctx.lineWidth = 1.4;
        ctx.setLineDash([4, 10]);
        ctx.beginPath();
        ctx.arc(centroid.x, centroid.y, cloudRadius, 0, TAU);
        ctx.stroke();
        ctx.restore();
      }
    }

    if (stirPower > 0.04) {
      drawStirringCues(ctx, wr, centerX, centerY, stirPower);
    }

    particles.forEach((particle) => {
      const diffusionStep = 10.5 * particle.color.diffusion * tempMultiplier;
      if (!isPaused) {
        particle.vx += randn() * diffusionStep * dt;
        particle.vy += randn() * diffusionStep * dt;

        if (stirPower > 0) {
          const dx = particle.x - centerX;
          const horizontalSweep = Math.sin(clock * 5.2 + particle.phase) * STIR_DIRECTION;
          const fineTurbulence = Math.cos(clock * 4.1 + particle.phase * 0.7);
          particle.vx += horizontalSweep * 42 * stirPower * dt;
          particle.vx += -dx * 0.08 * stirPower * dt;
          particle.vy += fineTurbulence * 5 * stirPower * dt;
        }

        particle.vx *= stirPower > 0 ? 0.89 : 0.88;
        particle.vy *= stirPower > 0 ? 0.89 : 0.88;
        particle.x += particle.vx;
        particle.y += particle.vy;
      }

      if (particle.x < wr.x + 5) {
        particle.x = wr.x + 5;
        particle.vx *= -0.5;
      }
      if (particle.x > wr.x + wr.w - 5) {
        particle.x = wr.x + wr.w - 5;
        particle.vx *= -0.5;
      }
      if (particle.y < wr.y + 2) {
        particle.y = wr.y + 2;
        particle.vy *= -0.5;
      }
      if (particle.y > wr.y + wr.h - 8) {
        particle.y = wr.y + wr.h - 8;
        particle.vy *= -0.2;
      }

      ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${particle.alpha})`;
      ctx.shadowBlur = 4;
      ctx.shadowColor = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, 0.2)`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    ctx.restore();
    updateMetrics();
  }

  function drawWaterAgitation(ctx, wr, tempMultiplier, time) {
    const count = 28;
    const opacity = 0.045 + tempMultiplier * 0.018;
    const jitter = 1.6 + tempMultiplier * 2.2;
    ctx.fillStyle = `rgba(15, 118, 160, ${opacity})`;
    for (let i = 0; i < count; i += 1) {
      const baseX = wr.x + 18 + ((i * 37) % Math.max(40, wr.w - 36));
      const baseY = wr.y + 24 + ((i * 53) % Math.max(40, wr.h - 50));
      const x = baseX + Math.sin(time * (1.7 + tempMultiplier) + i) * jitter;
      const y = baseY + Math.cos(time * (1.4 + tempMultiplier) + i * 0.7) * jitter;
      ctx.beginPath();
      ctx.arc(x, y, 1.4, 0, TAU);
      ctx.fill();
    }
  }

  function drawStirringCues(ctx, wr, centerX, _centerY, power) {
    const radiusX = Math.min(wr.w * 0.22, 110);
    const radiusY = Math.max(12, Math.min(wr.h * 0.09, 24));
    const baseY = wr.y + wr.h - 38;
    const alpha = 0.12 + power * 0.22;
    ctx.save();
    ctx.strokeStyle = `rgba(37, 99, 235, ${alpha})`;
    ctx.fillStyle = `rgba(37, 99, 235, ${alpha + 0.12})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    drawEllipseArrow(ctx, centerX, baseY, radiusX, radiusY, 0.15, Math.PI * 1.18, STIR_DIRECTION);
    ctx.globalAlpha = 0.58;
    drawEllipseArrow(ctx, centerX, baseY, radiusX * 0.58, radiusY * 0.62, Math.PI * 1.05, Math.PI * 1.9, STIR_DIRECTION);
    ctx.restore();
  }

  function drawEllipseArrow(ctx, cx, cy, radiusX, radiusY, startAngle, endAngle, direction) {
    const anticlockwise = direction < 0;
    ctx.beginPath();
    ctx.ellipse(cx, cy, radiusX, radiusY, 0, startAngle, endAngle, anticlockwise);
    ctx.stroke();

    const angle = endAngle;
    const x = cx + Math.cos(angle) * radiusX;
    const y = cy + Math.sin(angle) * radiusY;
    const tangentX = anticlockwise ? radiusX * Math.sin(angle) : -radiusX * Math.sin(angle);
    const tangentY = anticlockwise ? -radiusY * Math.cos(angle) : radiusY * Math.cos(angle);
    const tangent = Math.atan2(tangentY, tangentX);
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - Math.cos(tangent - 0.55) * 9, y - Math.sin(tangent - 0.55) * 9);
    ctx.lineTo(x - Math.cos(tangent + 0.55) * 9, y - Math.sin(tangent + 0.55) * 9);
    ctx.closePath();
    ctx.fill();
  }

  runtime.on(tempSlider, "input", updateTemperatureUI);
  runtime.on(colorantSelect, "change", () => {
    currentColorant = colorants[colorantSelect.value] || colorants.blue;
    updateObservation();
  });
  runtime.on(btnDrop, "click", addDrop);
  runtime.on(btnStirrer, "click", () => setStirrer(!isStirring));
  runtime.on(btnMotion, "click", () => setPaused(!isPaused));
  runtime.on(btnReset, "click", () => {
    particles.length = 0;
    dropCenter = null;
    elapsedSeconds = 0;
    clock = 0;
    setStirrer(false);
    setPaused(true);
    updateMetrics();
    updateObservation();
  });

  updateTemperatureUI();
  setStirrer(false);
  setPaused(true);
  updateMetrics();
  runtime.frame(draw);
});
