import { createLabRuntime, fitCanvas, frNumber, getThemeColor, onLabReady, prefersReducedMotion } from "./lab-utils.js";

if (
  typeof CanvasRenderingContext2D !== "undefined" &&
  !CanvasRenderingContext2D.prototype.roundRect
) {
  CanvasRenderingContext2D.prototype.roundRect = function roundRectFallback(x, y, width, height, radius = 8) {
    const r = Math.min(radius, Math.abs(width) / 2, Math.abs(height) / 2);
    this.moveTo(x + r, y);
    this.lineTo(x + width - r, y);
    this.quadraticCurveTo(x + width, y, x + width, y + r);
    this.lineTo(x + width, y + height - r);
    this.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    this.lineTo(x + r, y + height);
    this.quadraticCurveTo(x, y + height, x, y + height - r);
    this.lineTo(x, y + r);
    this.quadraticCurveTo(x, y, x + r, y);
    return this;
  };
}

onLabReady("[data-generic-lab]", (root) => {
  const q = (selector) => root.querySelector(selector);
  const canvas = q("[data-canvas]");
  const inputA = q("[data-control-a]");
  const inputB = q("[data-control-b]");
  const labelB = q("[data-label-b]");
  const valueA = q("[data-value-a]");
  const valueB = q("[data-value-b]");
  const modeInput = q("[data-mode]");
  const resetButton = q("[data-reset]");
  const playToggle = q("[data-play-toggle]");
  const readout = q("[data-readout]");
  const orbitDistance = q("[data-orbit-distance]");
  const orbitPeriod = q("[data-orbit-period]");
  const orbitSpeed = q("[data-orbit-speed]");
  const orbitRatio = q("[data-orbit-ratio]");
  const contextMetricEls = Array.from(root.querySelectorAll("[data-context-metric]"));

  if (!canvas || !inputA || !inputB || !modeInput) return false;

  const kind = root.dataset.kind || "generic";
  const isTitration = kind === "titration-ph" || kind === "titration-cond";
  const playControlledKinds = new Set(["orbit", "mixture", "decay", "oscilloscope", "weight", "titration-ph", "titration-cond"]);
  const runtime = createLabRuntime(root);
  let state = fitCanvas(canvas);
  let clock = 0;
  let solarHitTargets = [];
  const reducedMotion = prefersReducedMotion();
  let isPaused = playControlledKinds.has(kind) && kind !== "weight";
  const initialValues = {
    a: inputA.value,
    b: inputB.value,
    mode: modeInput.value,
  };
  let titrationTimerId = 0;
  const modeValuePresets = kind === "ph-scale"
    ? {
        target: "a",
        customMode: "Personnalisée",
        values: new Map([
          ["Citron", 2],
          ["Eau pure", 7],
          ["Savon", 11],
        ]),
      }
    : kind === "weight"
      ? {
          target: "b",
          customMode: "Personnalisé",
          values: new Map([
            ["Terre", 9.8],
            ["Lune", 1.6],
            ["Jupiter", 24.8],
          ]),
        }
      : kind === "power"
        ? {
            target: "a",
            customMode: null,
            values: new Map([
              ["Lampe", 60],
              ["Bouilloire", 2000],
              ["Radiateur", 1200],
            ]),
          }
        : kind === "mole"
          ? {
              target: "b",
              customMode: null,
              values: new Map([
                ["Eau", 18],
                ["Dioxyde de carbone", 44],
                ["Chlorure de sodium", 58.5],
              ]),
            }
          : null;
  const solarPlanets = [
    { name: "Mercure", type: "rocheuse", a: 0.387, period: 0.241, e: 0.206, speed: 47.4, diameter: "4 879 km", color: "#9ca3af", glow: "#e5e7eb", size: 3.8 },
    { name: "Vénus", type: "rocheuse", a: 0.723, period: 0.615, e: 0.007, speed: 35.0, diameter: "12 104 km", color: "#fbbf24", glow: "#fde68a", size: 5.8 },
    { name: "Terre", type: "rocheuse", a: 1.000, period: 1.000, e: 0.017, speed: 29.8, diameter: "12 742 km", color: "#38bdf8", glow: "#bbf7d0", size: 6.1, moon: true },
    { name: "Mars", type: "rocheuse", a: 1.524, period: 1.881, e: 0.093, speed: 24.1, diameter: "6 779 km", color: "#f97316", glow: "#fed7aa", size: 4.9 },
    { name: "Jupiter", type: "géante gazeuse", a: 5.203, period: 11.862, e: 0.049, speed: 13.1, diameter: "139 820 km", color: "#d97706", glow: "#fed7aa", size: 11.8, bands: true },
    { name: "Saturne", type: "géante gazeuse", a: 9.537, period: 29.457, e: 0.057, speed: 9.7, diameter: "116 460 km", color: "#eab308", glow: "#fef3c7", size: 10.5, rings: true },
    { name: "Uranus", type: "géante de glaces", a: 19.191, period: 84.011, e: 0.046, speed: 6.8, diameter: "50 724 km", color: "#67e8f9", glow: "#cffafe", size: 8.2 },
    { name: "Neptune", type: "géante de glaces", a: 30.070, period: 164.79, e: 0.009, speed: 5.4, diameter: "49 244 km", color: "#2563eb", glow: "#93c5fd", size: 8.1 },
  ];

  runtime.observe(canvas, () => {
    state = fitCanvas(canvas);
    draw();
  });

  function colors() {
    return {
      text: getThemeColor("--text-primary", "#1a2332"),
      muted: getThemeColor("--text-muted", "#8896a6"),
      primary: getThemeColor("--accent-primary", "#4f46e5"),
      success: getThemeColor("--accent-success", "#10b981"),
      warning: getThemeColor("--accent-warning", "#f59e0b"),
      danger: getThemeColor("--accent-danger", "#ef4444"),
      grid: "rgba(148, 163, 184, 0.25)",
      panel: "rgba(255, 255, 255, 0.72)",
    };
  }

  function params() {
    return {
      a: Number(inputA.value),
      b: Number(inputB.value),
      mode: modeInput.value,
    };
  }

  function updateLabels() {
    const { a, b } = params();
    if (kind === "interference" && labelB) {
      labelB.textContent = modeInput.value === "Diffraction"
        ? "Largeur de fente a"
        : "Écartement des fentes d";
    }
    valueA.textContent = frNumber(a, Number.isInteger(a) ? 0 : 1);
    valueB.textContent = kind === "refraction"
      ? frNumber(b / 100, 2)
      : frNumber(b, Number.isInteger(b) ? 0 : 1);
  }

  function setReadout(text) {
    if (readout) readout.textContent = text;
  }

  function setContextMetrics(values) {
    contextMetricEls.forEach((element, index) => {
      element.textContent = values[index] ?? "—";
    });
  }

  function stopTitrationTimer() {
    if (!titrationTimerId) return;
    window.clearInterval(titrationTimerId);
    titrationTimerId = 0;
  }

  function advanceTitrationStep() {
    if (!isTitration || isPaused) return;
    const maxVolume = Number(inputA.max) || 30;
    const currentVolume = Number(inputA.value) || 0;
    const nextVolume = Math.min(maxVolume, currentVolume + maxVolume / 360);
    inputA.value = String(nextVolume);
    clock += 0.045;
    if (nextVolume >= maxVolume) {
      setPaused(true);
    }
    draw();
  }

  function startTitrationTimer() {
    if (!isTitration || titrationTimerId) return;
    titrationTimerId = runtime.every(advanceTitrationStep, 50);
  }

  function setPaused(nextPaused) {
    isPaused = nextPaused;
    if (isTitration) {
      if (isPaused) stopTitrationTimer();
      else startTitrationTimer();
    }
    root.classList.toggle("is-generic-running", !isPaused);
    root.classList.toggle("is-generic-paused", isPaused);
    if (!playToggle) return;
    const actionLabel = kind === "mixture" ? "Agiter" : kind === "weight" ? "Animer" : isTitration ? "Titrer" : "Lancer";
    playToggle.textContent = isPaused ? actionLabel : "Pause";
    playToggle.setAttribute("aria-pressed", String(!isPaused));
    playToggle.classList.toggle("is-active", !isPaused);
  }

  function applyModePreset() {
    if (!modeValuePresets) return;
    const preset = modeValuePresets.values.get(modeInput.value);
    if (preset === undefined) return;
    if (modeValuePresets.target === "b") inputB.value = String(preset);
    else inputA.value = String(preset);
  }

  function restartWeightAnimation() {
    if (kind !== "weight") return;
    clock = 0;
    if (!reducedMotion) setPaused(false);
  }

  function handleControlInput(event) {
    if (modeValuePresets) {
      const presetInput = modeValuePresets.target === "b" ? inputB : inputA;
      if (modeValuePresets.customMode && event?.currentTarget === presetInput && modeInput.value !== modeValuePresets.customMode) {
        modeInput.value = modeValuePresets.customMode;
      }
    }
    restartWeightAnimation();
    if (isTitration) setPaused(true);
    draw();
  }

  function handleModeInput() {
    applyModePreset();
    restartWeightAnimation();
    draw();
  }

  function clear() {
    const { ctx, width: w, height: h } = state;
    ctx.clearRect(0, 0, w, h);
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, "rgba(238, 242, 255, 0.9)");
    gradient.addColorStop(1, "rgba(240, 253, 250, 0.9)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  }

  function axes(ctx, w, h, xLabel = "x", yLabel = "y") {
    const c = colors();
    const pad = { l: 56, r: 24, t: 26, b: 44 };
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 5; i += 1) {
      const y = pad.t + ((h - pad.t - pad.b) * i) / 5;
      ctx.moveTo(pad.l, y);
      ctx.lineTo(w - pad.r, y);
    }
    for (let i = 0; i <= 6; i += 1) {
      const x = pad.l + ((w - pad.l - pad.r) * i) / 6;
      ctx.moveTo(x, pad.t);
      ctx.lineTo(x, h - pad.b);
    }
    ctx.stroke();
    ctx.strokeStyle = c.text;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pad.l, pad.t);
    ctx.lineTo(pad.l, h - pad.b);
    ctx.lineTo(w - pad.r, h - pad.b);
    ctx.stroke();
    ctx.fillStyle = c.muted;
    ctx.font = "12px Inter, system-ui, sans-serif";
    ctx.fillText(yLabel, 14, pad.t + 12);
    ctx.fillText(xLabel, w - 42, h - 12);
    return { pad, gw: w - pad.l - pad.r, gh: h - pad.t - pad.b };
  }

  function label(ctx, text, x, y, color = colors().text, size = 14) {
    ctx.fillStyle = color;
    ctx.font = `800 ${size}px Inter, system-ui, sans-serif`;
    ctx.fillText(text, x, y);
  }

  function centerLabel(ctx, text, x, y, color = colors().text, size = 14) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = `800 ${size}px Inter, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  function arrow(ctx, x1, y1, x2, y2, color = colors().warning, width = 3) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - Math.cos(angle - 0.42) * 13, y2 - Math.sin(angle - 0.42) * 13);
    ctx.lineTo(x2 - Math.cos(angle + 0.42) * 13, y2 - Math.sin(angle + 0.42) * 13);
    ctx.closePath();
    ctx.fill();
  }

  function drawOrbit(ctx, w, h, p) {
    const c = colors();
    const zoom = p.b / 100;
    const selected = solarPlanets.find((planet) => planet.name === p.mode) || solarPlanets[2];
    const minDim = Math.min(w, h);
    const cx = w * 0.5;
    const cy = h * 0.52;
    const minDisplay = Math.max(38, minDim * 0.08) * zoom;
    const maxDisplay = minDim * 0.45 * zoom;
    const minRoot = Math.sqrt(solarPlanets[0].a);
    const maxRoot = Math.sqrt(solarPlanets[solarPlanets.length - 1].a);
    const speedFactor = p.a / 80;
    solarHitTargets = [];

    const space = ctx.createLinearGradient(0, 0, w, h);
    space.addColorStop(0, "#050816");
    space.addColorStop(0.55, "#0f172a");
    space.addColorStop(1, "#111827");
    ctx.fillStyle = space;
    ctx.fillRect(0, 0, w, h);

    drawStarField(ctx, w, h);
    drawSolarScale(ctx, w);

    const displayRadius = (planet) => {
      const ratio = (Math.sqrt(planet.a) - minRoot) / (maxRoot - minRoot);
      return minDisplay + ratio * (maxDisplay - minDisplay);
    };

    const planetPosition = (planet, index) => {
      const r = displayRadius(planet);
      const rx = r;
      const ry = r * Math.sqrt(1 - planet.e * planet.e) * 0.74;
      const angle = clock * speedFactor * 1.25 / Math.pow(planet.period, 0.72) + index * 0.57;
      const focusOffset = rx * planet.e * 0.35;
      return {
        angle,
        rx,
        ry,
        x: cx + Math.cos(angle) * rx - focusOffset,
        y: cy + Math.sin(angle) * ry,
      };
    };

    solarPlanets.forEach((planet) => {
      const r = displayRadius(planet);
      const rx = r;
      const ry = r * Math.sqrt(1 - planet.e * planet.e) * 0.74;
      const isSelected = planet.name === selected.name;
      ctx.save();
      ctx.strokeStyle = isSelected ? "rgba(250, 204, 21, 0.82)" : "rgba(148, 163, 184, 0.18)";
      ctx.lineWidth = isSelected ? 2.5 : 1.15;
      ctx.setLineDash(isSelected ? [] : [4, 8]);
      ctx.beginPath();
      ctx.ellipse(cx - rx * planet.e * 0.35, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });

    const sunGlow = ctx.createRadialGradient(cx, cy, 8, cx, cy, 78);
    sunGlow.addColorStop(0, "rgba(253, 224, 71, 0.95)");
    sunGlow.addColorStop(0.28, "rgba(249, 115, 22, 0.55)");
    sunGlow.addColorStop(1, "rgba(249, 115, 22, 0)");
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, 78, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.arc(cx, cy, 15, 0, Math.PI * 2);
    ctx.fill();
    centerLabel(ctx, "Soleil", cx, cy + 34, "#fde68a", 12);

    const renderItems = solarPlanets.map((planet, index) => ({
      planet,
      position: planetPosition(planet, index),
    })).sort((left, right) => left.position.y - right.position.y);

    renderItems.forEach(({ planet, position }) => {
      const isSelected = planet.name === selected.name;
      const radius = Math.max(isSelected ? 6 : 4, planet.size * (isSelected ? 1.18 : 1));
      drawSolarPlanet(ctx, planet, position.x, position.y, radius, isSelected);

      if (planet.moon) {
        const moonAngle = clock * 4.2;
        const mr = 13;
        ctx.fillStyle = "rgba(226, 232, 240, 0.9)";
        ctx.beginPath();
        ctx.arc(position.x + Math.cos(moonAngle) * mr, position.y + Math.sin(moonAngle) * mr * 0.55, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      if (isSelected) {
        ctx.strokeStyle = "rgba(250, 204, 21, 0.55)";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(position.x, position.y);
        ctx.stroke();
        drawVelocityArrow(ctx, position.x, position.y, position.angle, position.rx, position.ry, "#fef08a");
      }

      solarHitTargets.push({ name: planet.name, x: position.x, y: position.y, r: Math.max(radius + 10, 18) });
      drawPlanetLabel(ctx, planet, position.x, position.y, isSelected, c);
    });

    drawSelectedPlanetCard(ctx, w, selected);

    if (orbitDistance) orbitDistance.textContent = `${frNumber(selected.a, 2)} UA`;
    if (orbitPeriod) orbitPeriod.textContent = selected.period < 1
      ? `${frNumber(selected.period * 365.25, 0)} j`
      : `${frNumber(selected.period, 1)} ans`;
    if (orbitSpeed) orbitSpeed.textContent = `${frNumber(selected.speed, 1)} km/s`;
    if (orbitRatio) orbitRatio.textContent = frNumber((selected.period ** 2) / (selected.a ** 3), 2);
    const law = selected.a > 5 ? "Sa grande orbite explique sa période très longue." : "Son orbite plus proche donne une révolution plus courte.";
    setReadout(`${selected.name} : ${selected.type}, ${frNumber(selected.a, 2)} UA du Soleil. ${law} Animation accélérée pour rester observable ; distances et tailles ne sont pas à la même échelle.`);
  }

  function drawStarField(ctx, w, h) {
    ctx.save();
    for (let i = 0; i < 96; i += 1) {
      const x = (i * 83) % Math.max(1, w);
      const y = (i * 47 + (i % 7) * 23) % Math.max(1, h);
      const opacity = 0.18 + ((i * 17) % 60) / 100;
      const radius = i % 11 === 0 ? 1.45 : 0.75;
      ctx.fillStyle = `rgba(226, 232, 240, ${opacity})`;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawSolarScale(ctx, w) {
    const x = 14;
    const y = 14;
    const width = Math.min(410, w - 28);
    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.62)";
    ctx.strokeStyle = "rgba(148, 163, 184, 0.18)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, width, 52, 14);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "800 12px Inter, system-ui, sans-serif";
    ctx.fillText("Distances compressées", x + 16, y + 24);
    ctx.font = "700 11px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("Ordre respecté ; animation accélérée ; tailles agrandies.", x + 16, y + 43);
    ctx.restore();
  }

  function drawSolarPlanet(ctx, planet, x, y, radius, isSelected) {
    ctx.save();
    if (isSelected) {
      const glow = ctx.createRadialGradient(x, y, radius, x, y, radius * 5.2);
      glow.addColorStop(0, `${planet.color}88`);
      glow.addColorStop(1, `${planet.color}00`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, radius * 5.2, 0, Math.PI * 2);
      ctx.fill();
    }

    if (planet.rings) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-0.22);
      ctx.strokeStyle = "rgba(254, 243, 199, 0.72)";
      ctx.lineWidth = Math.max(2, radius * 0.28);
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 2.1, radius * 0.66, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    const gradient = ctx.createRadialGradient(x - radius * 0.35, y - radius * 0.35, 1, x, y, radius);
    gradient.addColorStop(0, planet.glow);
    gradient.addColorStop(0.62, planet.color);
    gradient.addColorStop(1, "rgba(2, 6, 23, 0.95)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    if (planet.bands) {
      ctx.save();
      ctx.clip();
      ctx.strokeStyle = "rgba(254, 215, 170, 0.55)";
      ctx.lineWidth = 1.6;
      for (let i = -2; i <= 2; i += 1) {
        ctx.beginPath();
        ctx.moveTo(x - radius, y + i * radius * 0.32);
        ctx.quadraticCurveTo(x, y + i * radius * 0.32 + 2, x + radius, y + i * radius * 0.32);
        ctx.stroke();
      }
      ctx.restore();
    }

    if (isSelected) {
      ctx.strokeStyle = "#fef08a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawVelocityArrow(ctx, x, y, angle, rx, ry, color) {
    const tangentX = -Math.sin(angle) * rx;
    const tangentY = Math.cos(angle) * ry;
    const length = Math.max(1, Math.hypot(tangentX, tangentY));
    const ux = tangentX / length;
    const uy = tangentY / length;
    arrow(ctx, x + ux * 12, y + uy * 12, x + ux * 42, y + uy * 42, color, 2.4);
  }

  function drawPlanetLabel(ctx, planet, x, y, isSelected, c) {
    if (!isSelected && planet.a < 2) return;
    ctx.save();
    ctx.font = `${isSelected ? 900 : 750} ${isSelected ? 13 : 10}px Inter, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillStyle = isSelected ? "#f8fafc" : "rgba(203, 213, 225, 0.72)";
    ctx.fillText(planet.name, x, y - (isSelected ? 16 : 11));
    if (isSelected) {
      ctx.font = "750 10px Inter, system-ui, sans-serif";
      ctx.fillStyle = c.warning;
      ctx.fillText(`${frNumber(planet.a, 2)} UA`, x, y + 26);
    }
    ctx.restore();
  }

  function drawSelectedPlanetCard(ctx, w, planet) {
    const width = Math.min(300, w - 28);
    const x = w - width - 14;
    const y = 14;
    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.78)";
    ctx.strokeStyle = "rgba(148, 163, 184, 0.22)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, width, 104, 16);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#f8fafc";
    ctx.font = "900 17px Inter, system-ui, sans-serif";
    ctx.fillText(planet.name, x + 16, y + 28);
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "750 12px Inter, system-ui, sans-serif";
    ctx.fillText(planet.type, x + 16, y + 50);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "700 11px Inter, system-ui, sans-serif";
    ctx.fillText(`diamètre : ${planet.diameter}`, x + 16, y + 73);
    ctx.fillText(`vitesse orbitale moyenne : ${frNumber(planet.speed, 1)} km/s`, x + 16, y + 91);
    ctx.restore();
  }

  function drawMixture(ctx, w, h, p) {
    const c = colors();
    const amount = p.a / 100;
    const running = !isPaused && !reducedMotion;
    const agitation = running ? p.b / 100 : 0;
    const compact = w < 720;
    const beakerWidth = Math.min(compact ? w * 0.7 : w * 0.46, 440);
    const beakerHeight = compact ? Math.min(h * 0.48, 230) : Math.min(h * 0.66, 340);
    const beaker = {
      x: (w - beakerWidth) / 2,
      y: compact ? h * 0.34 : h * 0.16,
      width: beakerWidth,
      height: beakerHeight,
    };
    const inner = {
      x: beaker.x + 16,
      y: beaker.y + beaker.height * 0.2,
      width: beaker.width - 32,
      height: beaker.height * 0.72,
    };
    const cases = {
      "Eau + sel": {
        kind: "soluble",
        name: "sel",
        short: "sel",
        particle: "#f8fafc",
        accent: "#64748b",
        capacity: 0.72,
        separation: "évaporation",
      },
      "Eau + sucre": {
        kind: "soluble",
        name: "sucre",
        short: "sucre",
        particle: "#fef3c7",
        accent: "#d97706",
        capacity: 0.84,
        separation: "évaporation",
      },
      "Eau + sable": {
        kind: "insoluble",
        name: "sable",
        short: "sable",
        particle: "#b45309",
        accent: "#92400e",
        separation: "filtration",
      },
      "Eau + huile": {
        kind: "immiscible",
        name: "huile",
        short: "huile",
        particle: "#fbbf24",
        accent: "#f59e0b",
        separation: "décantation",
      },
      "Eau + sirop": {
        kind: "miscible",
        name: "sirop",
        short: "sirop",
        particle: "#dc2626",
        accent: "#b91c1c",
        separation: "aucune filtration",
      },
      "Eau + alcool": {
        kind: "miscible",
        name: "alcool",
        short: "alcool",
        particle: "#cbd5e1",
        accent: "#64748b",
        separation: "non visible",
      },
    };
    const mix = cases[p.mode] || cases["Eau + sel"];
    const saturated = mix.kind === "soluble" && amount > mix.capacity;
    const hasDeposit = mix.kind === "insoluble" || saturated;
    const temporaryEmulsion = mix.kind === "immiscible" && running && p.b >= 45;
    const syrupNotUniform = mix.kind === "miscible" && mix.name === "sirop" && (!running || p.b < 45);
    const aspect = temporaryEmulsion
      ? "émulsion"
      : mix.kind === "immiscible"
        ? "couches"
        : hasDeposit
          ? "dépôt visible"
          : syrupNotUniform
            ? "stries visibles"
            : "uniforme";
    const phases = mix.kind === "immiscible"
      ? "2 phases"
      : hasDeposit
        ? "liquide + dépôt"
        : "1 phase";
    const conclusion = (mix.kind === "immiscible" || hasDeposit || syrupNotUniform)
      ? (syrupNotUniform ? "à homogénéiser" : "hétérogène")
      : "homogène";

    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, "#f8fbff");
    bg.addColorStop(1, "#eefcf8");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "rgba(15, 23, 42, 0.04)";
    ctx.fillRect(0, h * 0.82, w, h * 0.18);
    ctx.strokeStyle = "rgba(148, 163, 184, 0.24)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w * 0.05, h * 0.82);
    ctx.lineTo(w * 0.95, h * 0.82);
    ctx.stroke();

    ctx.fillStyle = c.text;
    ctx.font = "900 16px Inter, system-ui, sans-serif";
    ctx.fillText(p.mode, compact ? 16 : 24, 30);
    ctx.fillStyle = c.muted;
    ctx.font = "750 12px Inter, system-ui, sans-serif";
    ctx.fillText(running ? `Agitation en cours : ${frNumber(p.b, 0)} %` : "Clique Agiter ou le bécher pour brasser", compact ? 16 : 24, 50);

    function drawSoftPanel(x, y, width, height, title, lines, accent = c.primary) {
      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 0.82)";
      ctx.strokeStyle = "rgba(148, 163, 184, 0.24)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, 16);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = accent;
      ctx.font = "900 12px Inter, system-ui, sans-serif";
      ctx.fillText(title, x + 14, y + 24);
      ctx.fillStyle = c.text;
      ctx.font = "750 12px Inter, system-ui, sans-serif";
      lines.forEach((line, index) => ctx.fillText(line, x + 14, y + 46 + index * 18));
      ctx.restore();
    }

    function drawSourceVessel(x, y) {
      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.strokeStyle = "rgba(100, 116, 139, 0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x, y, 74, 112, 14);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = mix.kind === "immiscible"
        ? "rgba(251, 191, 36, 0.82)"
        : mix.name === "sirop"
          ? "rgba(220, 38, 38, 0.58)"
          : mix.name === "alcool"
            ? "rgba(226, 232, 240, 0.46)"
            : "rgba(226, 232, 240, 0.84)";
      ctx.fillRect(x + 10, y + 42, 54, 54);
      ctx.fillStyle = c.text;
      ctx.font = "900 12px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(mix.short, x + 37, y + 32);
      ctx.fillStyle = mix.accent;
      for (let i = 0; i < 8; i += 1) {
        const px = x + 14 + ((i * 17) % 46);
        const py = y + 54 + ((i * 13) % 34);
        ctx.beginPath();
        ctx.arc(px, py, 2.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    function drawBeakerPath() {
      ctx.beginPath();
      ctx.moveTo(beaker.x, beaker.y + 10);
      ctx.lineTo(beaker.x, beaker.y + beaker.height - 26);
      ctx.quadraticCurveTo(beaker.x, beaker.y + beaker.height, beaker.x + 28, beaker.y + beaker.height);
      ctx.lineTo(beaker.x + beaker.width - 28, beaker.y + beaker.height);
      ctx.quadraticCurveTo(beaker.x + beaker.width, beaker.y + beaker.height, beaker.x + beaker.width, beaker.y + beaker.height - 26);
      ctx.lineTo(beaker.x + beaker.width, beaker.y + 10);
    }

    function drawWaterFill(fillStyle = "rgba(56, 189, 248, 0.44)") {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(inner.x, inner.y, inner.width, inner.height, 12);
      ctx.clip();
      ctx.fillStyle = fillStyle;
      ctx.fillRect(inner.x, inner.y, inner.width, inner.height);
      ctx.strokeStyle = "rgba(14, 165, 233, 0.32)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= 90; i += 1) {
        const x = inner.x + (i / 90) * inner.width;
        const y = inner.y + Math.sin(i * 0.22 + clock * 7 * agitation) * (agitation * 3);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    }

    function particlePosition(i, margin = 20) {
      const baseX = inner.x + margin + ((i * 53) % Math.max(20, inner.width - margin * 2));
      const baseY = inner.y + margin + ((i * 31) % Math.max(24, inner.height - margin * 2));
      return {
        x: baseX + Math.sin(clock * (2.2 + agitation * 5) + i) * agitation * 14,
        y: baseY + Math.cos(clock * (1.5 + agitation * 4) + i * 0.7) * agitation * 9,
      };
    }

    let solutionFill = "rgba(56, 189, 248, 0.42)";
    if (mix.name === "sirop") {
      solutionFill = ctx.createLinearGradient(0, inner.y, 0, inner.y + inner.height);
      solutionFill.addColorStop(0, `rgba(125, 211, 252, ${0.32 + agitation * 0.08})`);
      solutionFill.addColorStop(1, `rgba(220, 38, 38, ${0.16 + amount * 0.32 + (1 - agitation) * 0.18})`);
    } else if (mix.name === "alcool") {
      solutionFill = "rgba(125, 211, 252, 0.3)";
    } else if (mix.kind === "soluble") {
      solutionFill = `rgba(96, 165, 250, ${0.28 + Math.min(amount, mix.capacity) * 0.18})`;
    }
    drawWaterFill(solutionFill);

    if (mix.kind === "immiscible") {
      const oilHeight = Math.min(inner.height * 0.46, inner.height * (0.18 + amount * 0.36));
      const stirPulse = temporaryEmulsion ? Math.max(0.35, agitation) : agitation * 0.16;
      const oilShift = Math.sin(clock * 22) * stirPulse * 9;
      const waterShift = Math.sin(clock * 20 + Math.PI) * stirPulse * 7;
      const interfaceBase = inner.y + oilHeight;
      const interfaceAmp = 2.5 + stirPulse * 14;
      const surfaceAmp = 0.8 + stirPulse * 5;
      const phase = clock * (10 + stirPulse * 16);

      function waveAt(x, base, amp, frequency, offset = 0) {
        const nx = (x - inner.x) / inner.width;
        return base
          + Math.sin(nx * Math.PI * 2 * frequency + phase + offset) * amp
          + Math.sin(nx * Math.PI * 2 * (frequency * 1.9) - phase * 0.72 + offset) * amp * 0.32;
      }

      function drawVibratingLayer(topBase, bottomBase, fillStyle, shift, topAmp, bottomAmp, topOffset, bottomOffset) {
        const extra = 26;
        ctx.beginPath();
        for (let i = 0; i <= 96; i += 1) {
          const x = inner.x - extra + (i / 96) * (inner.width + extra * 2);
          const y = waveAt(x, topBase, topAmp, 2.2, topOffset);
          if (i === 0) ctx.moveTo(x + shift, y);
          else ctx.lineTo(x + shift, y);
        }
        for (let i = 96; i >= 0; i -= 1) {
          const x = inner.x - extra + (i / 96) * (inner.width + extra * 2);
          const y = waveAt(x, bottomBase, bottomAmp, 2.7, bottomOffset);
          ctx.lineTo(x + shift, y);
        }
        ctx.closePath();
        ctx.fillStyle = fillStyle;
        ctx.fill();
      }

      function drawTremorLines(yStart, yEnd, color, shift, count) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.4;
        ctx.globalAlpha = 0.36 + stirPulse * 0.28;
        for (let i = 0; i < count; i += 1) {
          const y = yStart + ((i + 1) / (count + 1)) * (yEnd - yStart);
          const amp = 1 + stirPulse * 3;
          ctx.beginPath();
          for (let j = 0; j <= 56; j += 1) {
            const x = inner.x + 8 + (j / 56) * (inner.width - 16);
            const yy = y + Math.sin(j * 0.7 + clock * 18 + i) * amp;
            if (j === 0) ctx.moveTo(x + shift, yy);
            else ctx.lineTo(x + shift, yy);
          }
          ctx.stroke();
        }
        ctx.restore();
      }

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(inner.x, inner.y, inner.width, inner.height, 12);
      ctx.clip();
      drawVibratingLayer(interfaceBase, inner.y + inner.height + 14, "rgba(56, 189, 248, 0.48)", waterShift, interfaceAmp, surfaceAmp, 0, 1.8);
      drawVibratingLayer(inner.y - 10, interfaceBase, temporaryEmulsion ? "rgba(251, 191, 36, 0.58)" : "rgba(251, 191, 36, 0.78)", oilShift, surfaceAmp, interfaceAmp, 1.2, 0);
      drawTremorLines(inner.y + 10, interfaceBase - 10, "rgba(146, 64, 14, 0.42)", oilShift, temporaryEmulsion ? 4 : 2);
      drawTremorLines(interfaceBase + 16, inner.y + inner.height - 18, "rgba(3, 105, 161, 0.34)", waterShift, temporaryEmulsion ? 5 : 2);
      ctx.strokeStyle = "rgba(245, 158, 11, 0.9)";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      for (let i = 0; i <= 90; i += 1) {
        const x = inner.x + (i / 90) * inner.width;
        const y = waveAt(x, interfaceBase, interfaceAmp, 2.2, 0);
        if (i === 0) ctx.moveTo(x + (oilShift + waterShift) * 0.5, y);
        else ctx.lineTo(x + (oilShift + waterShift) * 0.5, y);
      }
      ctx.stroke();
      if (temporaryEmulsion) {
        for (let i = 0; i < 48; i += 1) {
          const pos = particlePosition(i, 18);
          if (pos.y < inner.y + oilHeight + 10) continue;
          const wobbleX = Math.sin(clock * 28 + i * 1.7) * stirPulse * 10;
          const wobbleY = Math.cos(clock * 23 + i) * stirPulse * 6;
          ctx.strokeStyle = "rgba(251, 191, 36, 0.28)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(pos.x - wobbleX * 0.9, pos.y - wobbleY * 0.9);
          ctx.lineTo(pos.x + wobbleX * 0.35, pos.y + wobbleY * 0.35);
          ctx.stroke();
          ctx.fillStyle = "rgba(251, 191, 36, 0.74)";
          ctx.beginPath();
          ctx.arc(pos.x + wobbleX, pos.y + wobbleY, 3 + (i % 3), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
      centerLabel(ctx, "huile", beaker.x + beaker.width / 2, inner.y + oilHeight / 2 + 4, "#92400e", 13);
      centerLabel(ctx, "eau", beaker.x + beaker.width / 2, inner.y + oilHeight + 42, "#0369a1", 13);
    } else {
      const visibleParticles = mix.kind === "miscible"
        ? Math.round(18 + amount * 34)
        : Math.round(18 + Math.min(amount, mix.capacity || 0.8) * 58);
      if (mix.name === "sirop" && syrupNotUniform) {
        ctx.save();
        ctx.globalAlpha = 0.62;
        ctx.strokeStyle = "rgba(185, 28, 28, 0.46)";
        ctx.lineWidth = 7;
        for (let i = 0; i < 6; i += 1) {
          const x = inner.x + 28 + ((i * 41) % Math.max(30, inner.width - 56));
          ctx.beginPath();
          ctx.moveTo(x, inner.y + inner.height - 12);
          ctx.bezierCurveTo(x + 20, inner.y + inner.height - 64, x - 18, inner.y + inner.height - 114, x + 10, inner.y + 44);
          ctx.stroke();
        }
        ctx.restore();
      }
      if (mix.kind !== "insoluble") {
        for (let i = 0; i < visibleParticles; i += 1) {
          const pos = particlePosition(i, 18);
          ctx.fillStyle = mix.name === "alcool" ? "rgba(255, 255, 255, 0.38)" : mix.particle;
          ctx.globalAlpha = mix.name === "sirop" ? 0.45 : 0.72;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, mix.name === "sirop" ? 3.4 : 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }
      if (hasDeposit) {
        const depositHeight = mix.kind === "insoluble"
          ? 18 + amount * 44
          : 10 + ((amount - mix.capacity) / (1 - mix.capacity)) * 34;
        ctx.fillStyle = mix.kind === "insoluble" ? "rgba(180, 83, 9, 0.68)" : "rgba(226, 232, 240, 0.92)";
        ctx.beginPath();
        ctx.roundRect(inner.x + 10, inner.y + inner.height - depositHeight, inner.width - 20, depositHeight, 10);
        ctx.fill();
        const grainCount = mix.kind === "insoluble" ? 52 : 28;
        for (let i = 0; i < grainCount; i += 1) {
          const gx = inner.x + 18 + ((i * 37) % Math.max(24, inner.width - 36));
          const lift = running && mix.kind === "insoluble" && i % 3 === 0 ? Math.sin(clock * 5 + i) * agitation * 32 : 0;
          const gy = inner.y + inner.height - 8 - ((i * 11) % Math.max(8, depositHeight - 2)) - lift;
          ctx.fillStyle = mix.kind === "insoluble" ? "rgba(146, 64, 14, 0.78)" : "rgba(248, 250, 252, 0.95)";
          ctx.beginPath();
          ctx.arc(gx, gy, 2 + (i % 2), 0, Math.PI * 2);
          ctx.fill();
        }
        centerLabel(ctx, "dépôt", beaker.x + beaker.width / 2, inner.y + inner.height - depositHeight - 8, mix.accent, 12);
      } else {
        centerLabel(ctx, mix.kind === "miscible" ? "une seule phase" : "solution", beaker.x + beaker.width / 2, inner.y + 42, "#0369a1", 13);
      }
    }

    ctx.save();
    ctx.strokeStyle = "rgba(30, 41, 59, 0.58)";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    drawBeakerPath();
    ctx.stroke();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.62)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(beaker.x + 12, beaker.y + 26);
    ctx.lineTo(beaker.x + 12, beaker.y + beaker.height - 48);
    ctx.stroke();
    ctx.restore();

    for (let i = 0; i < 5; i += 1) {
      const y = inner.y + inner.height - i * (inner.height / 5);
      ctx.strokeStyle = "rgba(30, 41, 59, 0.22)";
      ctx.lineWidth = i % 2 === 0 ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(beaker.x + beaker.width - 20, y);
      ctx.lineTo(beaker.x + beaker.width - 36, y);
      ctx.stroke();
    }

    if (running) {
      const cx = beaker.x + beaker.width / 2;
      const cy = beaker.y + 38;
      ctx.strokeStyle = "rgba(16, 185, 129, 0.76)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(cx, cy, beaker.width * 0.26, 11, 0, 0, Math.PI * 1.72);
      ctx.stroke();
      arrow(ctx, cx + beaker.width * 0.21, cy - 6, cx + beaker.width * 0.24, cy - 2, "rgba(16, 185, 129, 0.82)", 2);
    }

    if (!compact) {
      drawSourceVessel(26, h * 0.18);
      arrow(ctx, 108, h * 0.29, beaker.x - 16, beaker.y + beaker.height * 0.38, mix.accent, 2.4);
      drawSoftPanel(w - 214, h * 0.18, 188, 128, "Observation", [
        aspect,
        phases,
        mix.separation,
        conclusion,
      ], conclusion === "homogène" ? c.success : conclusion === "à homogénéiser" ? c.warning : c.danger);
    } else {
      drawSoftPanel(14, 64, w - 28, 78, "Résultat", [
        `${aspect} ; ${phases}`,
        `${mix.separation} ; ${conclusion}`,
      ], conclusion === "homogène" ? c.success : c.warning);
    }

    if (!compact) {
      ctx.fillStyle = "rgba(15, 23, 42, 0.08)";
      ctx.fillRect(w * 0.12, h * 0.88, w * 0.76, 2);
      ctx.fillStyle = c.muted;
      ctx.font = "800 11px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("homogène : aspect uniforme", w * 0.33, h * 0.925);
      ctx.fillText("hétérogène : phases ou dépôt visibles", w * 0.68, h * 0.925);
      ctx.textAlign = "left";
    }

    setContextMetrics([aspect, phases, mix.separation, conclusion]);
    if (mix.kind === "immiscible") {
      setReadout(temporaryEmulsion
        ? "L'agitation disperse l'huile en gouttes : c'est une émulsion temporaire. Au repos, deux couches réapparaissent."
        : "L'huile et l'eau ne sont pas miscibles : deux phases visibles se séparent par décantation.");
    } else if (mix.kind === "insoluble") {
      setReadout("Le sable ne se dissout pas dans l'eau : les grains restent visibles et peuvent être retenus par filtration.");
    } else if (saturated) {
      setReadout(`Il y a trop de ${mix.name} pour cette quantité d'eau : la solution est saturée et un dépôt reste au fond.`);
    } else if (mix.name === "sirop") {
      setReadout(syrupNotUniform
        ? "Le sirop est miscible, mais il faut agiter pour obtenir une couleur uniforme dans tout le bécher."
        : "Le sirop devient homogène avec l'eau : on observe une seule phase colorée.");
    } else if (mix.name === "alcool") {
      setReadout("L'alcool et l'eau sont miscibles : le mélange reste transparent et forme une seule phase.");
    } else {
      setReadout(`Le ${mix.name} se dissout dans l'eau : les grains ne sont plus visibles et le mélange est homogène.`);
    }
  }

  function drawChrono(ctx, w, h, p) {
    const c = colors();
    const compact = w < 720;
    const frame = { x: 18, y: 18, width: w - 36, height: h - 36 };
    const y = frame.y + frame.height * (compact ? 0.58 : 0.57);
    const left = frame.x + (compact ? 30 : 44);
    const right = frame.x + frame.width - (compact ? 30 : 44);
    const points = compact ? 9 : 11;
    const baseSpacing = 1 + p.a / 90;
    const change = p.mode === "Uniforme" ? 0 : (p.b / 100) * (p.mode === "Ralenti" ? -0.42 : 0.5);
    const rawSpaces = Array.from({ length: points - 1 }, (_, i) => Math.max(0.38, baseSpacing * (1 + change * (i / (points - 2)))));
    const total = rawSpaces.reduce((sum, value) => sum + value, 0);
    const scale = (right - left) / total;
    const spaces = rawSpaces.map((value) => value * scale);
    const positions = [left];
    spaces.forEach((space) => positions.push(positions[positions.length - 1] + space));
    const firstGap = spaces[0];
    const lastGap = spaces[spaces.length - 1];
    const conclusion = Math.abs(lastGap - firstGap) < 4
      ? "uniforme"
      : lastGap > firstGap
        ? "accéléré"
        : "ralenti";

    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.86)";
    ctx.strokeStyle = "rgba(148, 163, 184, 0.24)";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.roundRect(frame.x, frame.y, frame.width, frame.height, 18);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    label(ctx, "Chronophotographie", frame.x + 18, frame.y + 30, c.text, compact ? 14 : 16);
    centerLabel(ctx, "même durée Δt entre deux images", frame.x + frame.width / 2, frame.y + (compact ? 58 : 64), c.primary, compact ? 12 : 13);

    const badgeColor = conclusion === "uniforme" ? c.primary : conclusion === "accéléré" ? c.success : c.danger;
    ctx.save();
    ctx.fillStyle = `${badgeColor}18`;
    ctx.strokeStyle = `${badgeColor}55`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(frame.x + frame.width - (compact ? 112 : 150), frame.y + 16, compact ? 94 : 128, 30, 10);
    ctx.fill();
    ctx.stroke();
    centerLabel(ctx, conclusion, frame.x + frame.width - (compact ? 65 : 86), frame.y + 36, badgeColor, compact ? 12 : 14);
    ctx.restore();

    const phase = ((clock * 1.35) % (points - 1) + (points - 1)) % (points - 1);
    const segment = Math.min(points - 2, Math.floor(phase));
    const local = phase - segment;
    const movingX = positions[segment] + (positions[segment + 1] - positions[segment]) * local;
    const movingY = y - (compact ? 34 : 42);

    ctx.strokeStyle = "rgba(30, 41, 59, 0.18)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(left - 10, y);
    ctx.lineTo(right + 10, y);
    ctx.stroke();

    ctx.save();
    ctx.setLineDash([4, 6]);
    ctx.strokeStyle = "rgba(79, 70, 229, 0.34)";
    ctx.beginPath();
    ctx.moveTo(movingX, y - 76);
    ctx.lineTo(movingX, y + 52);
    ctx.stroke();
    ctx.restore();

    positions.forEach((x, index) => {
      ctx.strokeStyle = "rgba(148, 163, 184, 0.36)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y - 72);
      ctx.lineTo(x, y + 50);
      ctx.stroke();

      ctx.fillStyle = index === 0 ? c.success : index === positions.length - 1 ? c.danger : c.primary;
      ctx.beginPath();
      ctx.arc(x, y, compact ? 7 : 8, 0, Math.PI * 2);
      ctx.fill();
      centerLabel(ctx, `t${index}`, x, y + (compact ? 24 : 28), c.muted, compact ? 10 : 11);

      if (index < positions.length - 1) {
        const nextX = positions[index + 1];
        const arrowLength = Math.max(18, Math.min(58, (nextX - x) * 0.52));
        arrow(ctx, x + 4, y - (compact ? 28 : 38), x + arrowLength, y - (compact ? 28 : 38), index < 3 ? c.success : index > points - 5 ? c.danger : c.warning, 2.2);
      }
    });

    ctx.save();
    const glow = ctx.createRadialGradient(movingX, movingY, 1, movingX, movingY, compact ? 22 : 28);
    glow.addColorStop(0, "rgba(79, 70, 229, 0.32)");
    glow.addColorStop(1, "rgba(79, 70, 229, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(movingX, movingY, compact ? 22 : 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c.text;
    ctx.beginPath();
    ctx.arc(movingX, movingY, compact ? 5 : 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const rulerY = y + (compact ? 66 : 72);
    ctx.strokeStyle = c.warning;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(positions[0], rulerY);
    ctx.lineTo(positions[1], rulerY);
    ctx.moveTo(positions.at(-2), rulerY);
    ctx.lineTo(positions.at(-1), rulerY);
    ctx.stroke();
    centerLabel(ctx, "écart début", (positions[0] + positions[1]) / 2, rulerY + (compact ? 22 : 24), c.success, compact ? 10 : 12);
    centerLabel(ctx, "écart fin", (positions.at(-2) + positions.at(-1)) / 2, rulerY + (compact ? 22 : 24), c.danger, compact ? 10 : 12);

    setContextMetrics([
      `${frNumber(firstGap, 0)} px`,
      `${frNumber(lastGap, 0)} px`,
      conclusion,
    ]);
    setReadout(conclusion === "uniforme"
      ? "Les écarts entre positions restent constants : la vitesse est constante."
      : conclusion === "accéléré"
        ? "Les écarts augmentent : l'objet parcourt plus de distance pendant le même temps."
        : "Les écarts diminuent : l'objet parcourt moins de distance pendant le même temps.");
  }

  function drawChain(ctx, w, h, p) {
    const c = colors();
    const chains = {
      Lampe: {
        source: "Pile",
        input: "stock chimique",
        transfer: "énergie électrique",
        converter: "Lampe",
        useful: "lumière",
        loss: "chaleur",
      },
      Moteur: {
        source: "Batterie",
        input: "stock chimique",
        transfer: "énergie électrique",
        converter: "Moteur",
        useful: "mouvement",
        loss: "chaleur + bruit",
      },
      "Panneau solaire": {
        source: "Soleil",
        input: "rayonnement",
        transfer: "énergie lumineuse",
        converter: "Panneau",
        useful: "électricité",
        loss: "énergie non captée",
      },
    };
    const chain = chains[p.mode] ?? chains.Lampe;
    const received = p.b;
    const useful = (p.a * received) / 100;
    const losses = received - useful;
    const compact = w < 720;

    if (compact) {
      const scene = { x: 18, y: 18, width: w - 36, height: h - 36 };
      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 0.86)";
      ctx.strokeStyle = "rgba(148, 163, 184, 0.24)";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.roundRect(scene.x, scene.y, scene.width, scene.height, 18);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      label(ctx, `Chaîne : ${p.mode}`, scene.x + 16, scene.y + 30, c.text, 14);
      centerLabel(ctx, `${frNumber(received, 0)} W reçus`, scene.x + scene.width * 0.28, scene.y + 60, c.primary, 13);
      centerLabel(ctx, `${frNumber(useful, 0)} W utiles`, scene.x + scene.width * 0.72, scene.y + 60, c.success, 13);

      const barX = scene.x + 26;
      const barY = scene.y + 78;
      const barW = scene.width - 52;
      ctx.fillStyle = "rgba(148, 163, 184, 0.15)";
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW, 12, 6);
      ctx.fill();
      ctx.fillStyle = c.success;
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW * (p.a / 100), 12, 6);
      ctx.fill();
      ctx.fillStyle = c.danger;
      ctx.beginPath();
      ctx.roundRect(barX + barW * (p.a / 100), barY, barW * (1 - p.a / 100), 12, 6);
      ctx.fill();

      const cardW = scene.width - 54;
      const cardH = 50;
      const gap = 18;
      const startY = scene.y + 112;
      const cardX = scene.x + 27;
      const boxes = [
        { x: cardX, y: startY, width: cardW, height: cardH, title: "source", value: chain.source, sub: chain.input, color: c.success },
        { x: cardX, y: startY + cardH + gap, width: cardW, height: cardH, title: "convertisseur", value: chain.converter, sub: chain.transfer, color: c.primary },
        { x: cardX, y: startY + 2 * (cardH + gap), width: cardW, height: cardH, title: "énergie utile", value: chain.useful, sub: `${frNumber(useful, 0)} W`, color: c.warning },
      ];

      boxes.forEach((box, index) => {
        ctx.save();
        ctx.fillStyle = `${box.color}12`;
        ctx.strokeStyle = `${box.color}66`;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(box.x, box.y, box.width, box.height, 14);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = c.muted;
        ctx.font = "800 10px Inter, system-ui, sans-serif";
        ctx.fillText(box.title, box.x + 12, box.y + 18);
        ctx.fillStyle = box.color;
        ctx.font = "900 16px Inter, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(box.value, box.x + box.width / 2, box.y + 32);
        ctx.fillStyle = c.muted;
        ctx.font = "800 10px Inter, system-ui, sans-serif";
        ctx.fillText(box.sub, box.x + box.width / 2, box.y + 45);
        ctx.restore();
        if (index < boxes.length - 1) {
          const next = boxes[index + 1];
          arrow(ctx, box.x + box.width / 2, box.y + box.height + 4, next.x + next.width / 2, next.y - 4, "rgba(79, 70, 229, 0.45)", 2.4);
        }
      });

      const lossBox = { x: cardX, y: startY + 3 * (cardH + gap) - 2, width: cardW, height: 46 };
      ctx.save();
      ctx.fillStyle = "rgba(239, 68, 68, 0.08)";
      ctx.strokeStyle = "rgba(239, 68, 68, 0.48)";
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.roundRect(lossBox.x, lossBox.y, lossBox.width, lossBox.height, 14);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = c.muted;
      ctx.font = "800 10px Inter, system-ui, sans-serif";
      ctx.fillText("pertes", lossBox.x + 12, lossBox.y + 18);
      centerLabel(ctx, `${chain.loss} · ${frNumber(losses, 0)} W`, lossBox.x + lossBox.width / 2, lossBox.y + 32, c.danger, 13);
      ctx.restore();
      arrow(ctx, boxes[1].x + boxes[1].width * 0.82, boxes[1].y + boxes[1].height, lossBox.x + lossBox.width * 0.82, lossBox.y - 4, c.danger, 2.3);

      for (let i = 0; i < 5; i += 1) {
        const t = ((clock * 0.7 + i / 5) % 1 + 1) % 1;
        const start = boxes[0];
        const end = boxes[2];
        const x = start.x + start.width * 0.18 + Math.sin(t * Math.PI) * start.width * 0.64;
        const y = start.y + start.height + t * ((end.y + end.height / 2) - (start.y + start.height));
        ctx.fillStyle = `${chain === chains["Panneau solaire"] ? "#f59e0b" : "#3b82f6"}aa`;
        ctx.beginPath();
        ctx.arc(x, y, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }

      setContextMetrics([
        `${frNumber(useful, 0)} W`,
        `${frNumber(losses, 0)} W`,
        `${frNumber(p.a, 0)} %`,
      ]);
      setReadout(`Le convertisseur reçoit ${frNumber(received, 0)} W : ${frNumber(useful, 0)} W deviennent utiles et ${frNumber(losses, 0)} W sont perdus.`);
      return;
    }

    const boxW = Math.min(142, w * 0.24);
    const boxH = 74;
    const y = h * 0.34;
    const x1 = w * 0.08;
    const x2 = w * 0.5 - boxW / 2;
    const x3 = w * 0.92 - boxW;
    const lossY = Math.min(h - 84, y + 130);

    function energyBox(x, title, subtitle, color, fill) {
      ctx.fillStyle = fill;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.roundRect(x, y, boxW, boxH, 12);
      ctx.fill();
      ctx.stroke();
      centerLabel(ctx, title, x + boxW / 2, y + 30, c.text, 14);
      centerLabel(ctx, subtitle, x + boxW / 2, y + 52, c.muted, 11);
    }

    energyBox(x1, chain.source, chain.input, c.success, "rgba(16, 185, 129, 0.13)");
    energyBox(x2, chain.converter, "convertisseur", c.primary, "rgba(79, 70, 229, 0.14)");
    energyBox(x3, chain.useful, "énergie utile", c.warning, "rgba(245, 158, 11, 0.16)");

    arrow(ctx, x1 + boxW + 12, y + boxH / 2, x2 - 12, y + boxH / 2, c.success, 3);
    arrow(ctx, x2 + boxW + 12, y + boxH / 2, x3 - 12, y + boxH / 2, c.warning, 3);
    centerLabel(ctx, `${frNumber(received, 0)} W reçus`, (x1 + boxW + x2) / 2, y + 20, c.success, 12);
    centerLabel(ctx, chain.transfer, (x1 + boxW + x2) / 2, y + 96, c.success, 11);
    centerLabel(ctx, `${frNumber(useful, 0)} W utiles`, (x2 + boxW + x3) / 2, y + 20, c.warning, 12);

    for (let i = 0; i < 6; i += 1) {
      const t = ((clock * 0.72 + i / 6) % 1 + 1) % 1;
      const fromX = x1 + boxW + 18;
      const midX = x2 + boxW + 18;
      const toX = x3 - 18;
      const x = t < 0.5
        ? fromX + (midX - fromX) * (t * 2)
        : midX + (toX - midX) * ((t - 0.5) * 2);
      ctx.fillStyle = "rgba(59, 130, 246, 0.68)";
      ctx.beginPath();
      ctx.arc(x, y + boxH / 2, 3.4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "rgba(239, 68, 68, 0.1)";
    ctx.strokeStyle = c.danger;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x2, lossY, boxW, 56, 12);
    ctx.fill();
    ctx.stroke();
    centerLabel(ctx, chain.loss, x2 + boxW / 2, lossY + 24, c.danger, 13);
    centerLabel(ctx, `${frNumber(losses, 0)} W`, x2 + boxW / 2, lossY + 43, c.danger, 12);
    arrow(ctx, x2 + boxW / 2, y + boxH + 12, x2 + boxW / 2, lossY - 10, c.danger, 2.8);

    setContextMetrics([
      `${frNumber(useful, 0)} W`,
      `${frNumber(losses, 0)} W`,
      `${frNumber(p.a, 0)} %`,
    ]);
    setReadout(`Le convertisseur reçoit ${frNumber(received, 0)} W : ${frNumber(useful, 0)} W deviennent utiles et ${frNumber(losses, 0)} W sont perdus.`);
  }

  function drawDecay(ctx, w, h, p) {
    const c = colors();
    const halfLife = Math.max(1, p.a);
    const initial = Math.max(1, p.b);
    const duration = 5 * halfLife;
    const t = clock % duration;
    const fraction = Math.pow(0.5, t / halfLife);
    const remaining = initial * fraction;
    const showCurve = p.mode !== "Noyaux";
    const showNuclei = p.mode !== "Courbe";
    const compact = w < 720;

    if (compact) {
      const scene = { x: 18, y: 18, width: w - 36, height: h - 36 };
      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 0.86)";
      ctx.strokeStyle = "rgba(148, 163, 184, 0.24)";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.roundRect(scene.x, scene.y, scene.width, scene.height, 18);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      label(ctx, "Décroissance radioactive", scene.x + 16, scene.y + 30, c.text, 14);
      centerLabel(ctx, `T½ = ${frNumber(halfLife, 1)} s`, scene.x + scene.width * 0.25, scene.y + 58, c.primary, 12);
      centerLabel(ctx, `t = ${frNumber(t, 1)} s`, scene.x + scene.width * 0.5, scene.y + 58, c.warning, 12);
      centerLabel(ctx, `${frNumber(fraction * 100, 0)} % restants`, scene.x + scene.width * 0.78, scene.y + 58, c.danger, 12);

      const progressX = scene.x + 22;
      const progressY = scene.y + 76;
      const progressW = scene.width - 44;
      ctx.fillStyle = "rgba(148, 163, 184, 0.15)";
      ctx.beginPath();
      ctx.roundRect(progressX, progressY, progressW, 12, 6);
      ctx.fill();
      ctx.fillStyle = c.danger;
      ctx.beginPath();
      ctx.roundRect(progressX, progressY, progressW * fraction, 12, 6);
      ctx.fill();
      if (isPaused && !reducedMotion) {
        centerLabel(ctx, "Clique Lancer pour voir N diminuer", scene.x + scene.width / 2, scene.y + 106, c.primary, 11);
      } else {
        centerLabel(ctx, "à chaque demi-vie : quantité divisée par 2", scene.x + scene.width / 2, scene.y + 106, c.muted, 11);
      }

      function subPanel(box, title) {
        ctx.save();
        ctx.fillStyle = "rgba(248, 250, 252, 0.82)";
        ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.roundRect(box.x, box.y, box.width, box.height, 15);
        ctx.fill();
        ctx.stroke();
        label(ctx, title, box.x + 12, box.y + 22, c.text, 12);
        ctx.restore();
      }

      function drawSmallCurve(box) {
        subPanel(box, "Courbe N(t)");
        const pad = { l: 34, r: 14, t: 38, b: 28 };
        const gx = box.x + pad.l;
        const gy = box.y + pad.t;
        const gw = box.width - pad.l - pad.r;
        const gh = box.height - pad.t - pad.b;
        ctx.strokeStyle = "rgba(148, 163, 184, 0.42)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(gx, gy);
        ctx.lineTo(gx, gy + gh);
        ctx.lineTo(gx + gw, gy + gh);
        ctx.stroke();
        ctx.save();
        ctx.setLineDash([3, 5]);
        ctx.strokeStyle = "rgba(148, 163, 184, 0.35)";
        for (let k = 1; k <= 5; k += 1) {
          const x = gx + (k / 5) * gw;
          ctx.beginPath();
          ctx.moveTo(x, gy);
          ctx.lineTo(x, gy + gh);
          ctx.stroke();
        }
        ctx.restore();
        ctx.strokeStyle = c.danger;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i <= 120; i += 1) {
          const graphT = (i / 120) * duration;
          const n = Math.pow(0.5, graphT / halfLife);
          const x = gx + (graphT / duration) * gw;
          const yGraph = gy + gh - n * gh;
          if (i === 0) ctx.moveTo(x, yGraph);
          else ctx.lineTo(x, yGraph);
        }
        ctx.stroke();
        const markerX = gx + (t / duration) * gw;
        const markerY = gy + gh - fraction * gh;
        ctx.fillStyle = c.warning;
        ctx.beginPath();
        ctx.arc(markerX, markerY, 5, 0, Math.PI * 2);
        ctx.fill();
        centerLabel(ctx, "5 demi-vies", gx + gw / 2, box.y + box.height - 8, c.muted, 9);
      }

      function drawNucleiBox(box) {
        subPanel(box, "Noyaux restants");
        const cols = Math.ceil(Math.sqrt(initial));
        const rows = Math.ceil(initial / cols);
        const cell = Math.min(17, Math.max(8, Math.min((box.width - 34) / cols, (box.height - 58) / rows)));
        const gridW = cols * cell;
        const startX = box.x + box.width / 2 - gridW / 2;
        const startY = box.y + 40;
        for (let i = 0; i < initial; i += 1) {
          const pseudo = ((i * 9301 + 49297) % 233280) / 233280;
          const alive = pseudo < fraction;
          const x = startX + (i % cols) * cell + cell / 2;
          const yDot = startY + Math.floor(i / cols) * cell + cell / 2;
          ctx.fillStyle = alive ? c.danger : "rgba(148, 163, 184, 0.30)";
          ctx.beginPath();
          ctx.arc(x, yDot, Math.max(2.5, cell * 0.34), 0, Math.PI * 2);
          ctx.fill();
          if (!isPaused && alive && Math.sin(clock * 6 + i) > 0.95) {
            ctx.strokeStyle = "rgba(239, 68, 68, 0.28)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(x, yDot, Math.max(4, cell * 0.5), 0, Math.PI * 2);
            ctx.stroke();
          }
        }
        centerLabel(ctx, `${frNumber(remaining, 0)} noyaux sur ${frNumber(initial, 0)}`, box.x + box.width / 2, box.y + box.height - 10, c.text, 11);
      }

      if (showCurve && showNuclei) {
        drawSmallCurve({ x: scene.x + 16, y: scene.y + 122, width: scene.width - 32, height: 126 });
        drawNucleiBox({ x: scene.x + 16, y: scene.y + 258, width: scene.width - 32, height: scene.height - 272 });
      } else if (showCurve) {
        drawSmallCurve({ x: scene.x + 16, y: scene.y + 128, width: scene.width - 32, height: scene.height - 148 });
      } else {
        drawNucleiBox({ x: scene.x + 16, y: scene.y + 126, width: scene.width - 32, height: scene.height - 146 });
      }

      setContextMetrics([
        `${frNumber(remaining, 0)} / ${frNumber(initial, 0)}`,
        `${frNumber(t, 1)} s`,
        `${frNumber(fraction * 100, 0)} %`,
      ]);
      setReadout(`Modèle statistique : après ${frNumber(t / halfLife, 1)} demi-vie, il reste environ ${frNumber(fraction * 100, 0)} % des noyaux.`);
      return;
    }

    if (!showCurve) {
      const panelX = 28;
      const panelY = 24;
      const panelW = w - 56;
      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 0.86)";
      ctx.strokeStyle = "rgba(148, 163, 184, 0.24)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(panelX, panelY, panelW, 72, 16);
      ctx.fill();
      ctx.stroke();
      label(ctx, "Décroissance radioactive", panelX + 16, panelY + 26, c.text, 15);
      centerLabel(ctx, `T½ = ${frNumber(halfLife, 1)} s`, panelX + panelW * 0.38, panelY + 28, c.primary, 13);
      centerLabel(ctx, `t = ${frNumber(t, 1)} s`, panelX + panelW * 0.58, panelY + 28, c.warning, 13);
      centerLabel(ctx, `${frNumber(fraction * 100, 0)} % restants`, panelX + panelW * 0.8, panelY + 28, c.danger, 13);
      ctx.fillStyle = "rgba(148, 163, 184, 0.15)";
      ctx.beginPath();
      ctx.roundRect(panelX + 16, panelY + 46, panelW - 32, 12, 6);
      ctx.fill();
      ctx.fillStyle = c.danger;
      ctx.beginPath();
      ctx.roundRect(panelX + 16, panelY + 46, (panelW - 32) * fraction, 12, 6);
      ctx.fill();
      ctx.restore();
    }

    if (showCurve) {
      const { pad, gw, gh } = axes(ctx, w, h, "temps", "N");
      ctx.save();
      ctx.setLineDash([5, 6]);
      ctx.strokeStyle = "rgba(148, 163, 184, 0.6)";
      for (let k = 1; k <= 5; k += 1) {
        const x = pad.l + (k / 5) * gw;
        const y = pad.t + gh - Math.pow(0.5, k) * gh;
        ctx.beginPath();
        ctx.moveTo(x, pad.t);
        ctx.lineTo(x, pad.t + gh);
        ctx.moveTo(pad.l, y);
        ctx.lineTo(pad.l + gw, y);
        ctx.stroke();
        centerLabel(ctx, `${k} T½`, x, pad.t + gh + 22, c.muted, 10);
      }
      ctx.restore();

      ctx.strokeStyle = c.danger;
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i <= 220; i += 1) {
        const graphT = (i / 220) * duration;
        const n = initial * Math.pow(0.5, graphT / halfLife);
        const x = pad.l + (graphT / duration) * gw;
        const y = pad.t + gh - (n / initial) * gh;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      const markerX = pad.l + (t / duration) * gw;
      const markerY = pad.t + gh - (remaining / initial) * gh;
      ctx.save();
      ctx.setLineDash([4, 5]);
      ctx.strokeStyle = c.warning;
      ctx.beginPath();
      ctx.moveTo(markerX, pad.t);
      ctx.lineTo(markerX, pad.t + gh);
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = c.warning;
      ctx.beginPath();
      ctx.arc(markerX, markerY, 7, 0, Math.PI * 2);
      ctx.fill();
      label(ctx, `N(t) ≈ ${frNumber(remaining, 0)}`, Math.min(markerX + 12, w - 120), Math.max(markerY - 12, 28), c.text, 13);
    }

    if (showNuclei) {
      const cols = Math.ceil(Math.sqrt(initial));
      const cell = showCurve ? 8 : Math.min(16, Math.max(9, Math.min(w * 0.68, h * 0.58) / cols));
      const rows = Math.ceil(initial / cols);
      const gridW = cols * cell;
      const gridH = rows * cell;
      const startX = showCurve ? w - gridW - 28 : w / 2 - gridW / 2;
      const startY = showCurve ? 54 : h / 2 - gridH / 2 + 12;
      if (showCurve) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.76)";
        ctx.beginPath();
        ctx.roundRect(startX - 12, startY - 28, gridW + 24, gridH + 46, 12);
        ctx.fill();
        centerLabel(ctx, "noyaux", startX + gridW / 2, startY - 10, c.text, 12);
      }
      for (let i = 0; i < initial; i += 1) {
        const pseudo = ((i * 9301 + 49297) % 233280) / 233280;
        const alive = pseudo < fraction;
        const x = startX + (i % cols) * cell + cell / 2;
        const y = startY + Math.floor(i / cols) * cell + cell / 2;
        ctx.fillStyle = alive ? c.danger : "rgba(148, 163, 184, 0.38)";
        ctx.beginPath();
        ctx.arc(x, y, Math.max(2.5, cell * 0.33), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    setContextMetrics([
      `${frNumber(remaining, 0)} / ${frNumber(initial, 0)}`,
      `${frNumber(t, 1)} s`,
      `${frNumber(fraction * 100, 0)} %`,
    ]);
    setReadout(`Modèle statistique : après ${frNumber(t / halfLife, 1)} demi-vie, il reste environ ${frNumber(fraction * 100, 0)} % des noyaux.`);
  }

  function drawRefraction(ctx, w, h, p) {
    const c = colors();
    const cx = w / 2;
    const cy = h / 2;
    const n1 = p.mode === "Air" ? 1 : p.mode === "Eau" ? 1.33 : 1.5;
    const n2 = p.b / 100;
    const iDeg = p.a;
    const i = (iDeg * Math.PI) / 180;
    const sinR = (n1 / n2) * Math.sin(i);
    const totalReflection = sinR > 1;
    const r = totalReflection ? null : Math.asin(sinR);
    const critical = n1 > n2 ? Math.asin(n2 / n1) : null;
    const rayLength = Math.min(w, h) * 0.42;
    const compact = w < 720;
    const status = totalReflection
      ? "réflexion totale"
      : n2 > n1
        ? "vers la normale"
        : Math.abs(n2 - n1) < 0.02
          ? "peu dévié"
          : "loin de la normale";

    ctx.fillStyle = "rgba(255, 255, 255, 0.58)";
    ctx.fillRect(0, 0, w, cy);
    ctx.fillStyle = n2 >= 1.45 ? "rgba(125, 211, 252, 0.24)" : "rgba(56, 189, 248, 0.16)";
    ctx.fillRect(0, cy, w, h / 2);

    ctx.strokeStyle = c.muted;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(w, cy);
    ctx.stroke();

    ctx.save();
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = "rgba(30, 41, 59, 0.42)";
    ctx.beginPath();
    ctx.moveTo(cx, 32);
    ctx.lineTo(cx, h - 32);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.78)";
    ctx.strokeStyle = "rgba(148, 163, 184, 0.22)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(18, 18, compact ? w - 36 : 250, 64, 14);
    ctx.fill();
    ctx.stroke();
    label(ctx, `milieu 1 : ${p.mode}`, 32, 43, c.text, compact ? 13 : 14);
    label(ctx, `n₁ = ${frNumber(n1, 2)}`, 32, 66, c.primary, 12);
    ctx.beginPath();
    ctx.roundRect(compact ? w - 146 : w - 190, 22, compact ? 126 : 160, 34, 12);
    ctx.fillStyle = totalReflection ? "rgba(239, 68, 68, 0.12)" : "rgba(16, 185, 129, 0.12)";
    ctx.strokeStyle = totalReflection ? "rgba(239, 68, 68, 0.45)" : "rgba(16, 185, 129, 0.38)";
    ctx.fill();
    ctx.stroke();
    centerLabel(ctx, status, compact ? w - 83 : w - 110, 44, totalReflection ? c.danger : c.success, compact ? 11 : 12);
    ctx.restore();

    label(ctx, `milieu 2  n₂ = ${frNumber(n2, 2)}`, 20, cy + 30, c.text, 13);
    centerLabel(ctx, "normale", cx + 44, compact ? 98 : 100, c.muted, 11);

    const incidentStart = {
      x: cx - Math.sin(i) * rayLength,
      y: cy - Math.cos(i) * rayLength,
    };
    arrow(ctx, incidentStart.x, incidentStart.y, cx, cy, c.warning, 4);

    const drawPhoton = (x1, y1, x2, y2, offset, color) => {
      const t = ((clock * 0.75 + offset) % 1 + 1) % 1;
      const x = x1 + (x2 - x1) * t;
      const y = y1 + (y2 - y1) * t;
      ctx.save();
      ctx.fillStyle = `${color}cc`;
      ctx.beginPath();
      ctx.arc(x, y, compact ? 3 : 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };
    [0, 0.33, 0.66].forEach((offset) => drawPhoton(incidentStart.x, incidentStart.y, cx, cy, offset, "#f59e0b"));

    if (totalReflection) {
      const reflectedEnd = {
        x: cx + Math.sin(i) * rayLength,
        y: cy - Math.cos(i) * rayLength,
      };
      arrow(ctx, cx, cy, reflectedEnd.x, reflectedEnd.y, c.danger, 4);
      [0.12, 0.45, 0.78].forEach((offset) => drawPhoton(cx, cy, reflectedEnd.x, reflectedEnd.y, offset, "#ef4444"));
    } else {
      const refractedEnd = {
        x: cx + Math.sin(r) * rayLength,
        y: cy + Math.cos(r) * rayLength,
      };
      arrow(ctx, cx, cy, refractedEnd.x, refractedEnd.y, c.success, 4);
      [0.12, 0.45, 0.78].forEach((offset) => drawPhoton(cx, cy, refractedEnd.x, refractedEnd.y, offset, "#10b981"));
    }

    ctx.strokeStyle = c.warning;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 48, -Math.PI / 2 - i, -Math.PI / 2);
    ctx.stroke();
    label(ctx, `i = ${frNumber(iDeg, 0)}°`, cx - 88, cy - 56, c.warning, 13);

    if (totalReflection) {
      label(ctx, "réflexion totale", cx + 50, cy - 62, c.danger, 15);
      setContextMetrics([
        frNumber(n1, 2),
        frNumber(n2, 2),
        `iᶜ = ${frNumber((critical * 180) / Math.PI, 0)}°`,
      ]);
      setReadout(`n₁ > n₂ et i dépasse l'angle critique : aucun rayon réfracté ne traverse le second milieu.`);
    } else {
      const rDeg = (r * 180) / Math.PI;
      ctx.strokeStyle = c.success;
      ctx.beginPath();
      ctx.arc(cx, cy, 66, Math.PI / 2 - r, Math.PI / 2);
      ctx.stroke();
      label(ctx, `r ≈ ${frNumber(rDeg, 0)}°`, cx + 52, cy + 70, c.success, 13);
      setContextMetrics([
        frNumber(n1, 2),
        frNumber(n2, 2),
        `${frNumber(rDeg, 1)}°`,
      ]);
      const relation = Math.abs(n1 - n2) < 0.02
        ? "les indices sont presque égaux : le rayon est peu dévié"
        : n2 > n1
          ? "le rayon se rapproche de la normale"
          : "le rayon s'éloigne de la normale";
      setReadout(`Loi de Snell-Descartes : n₁ sin(i) = n₂ sin(r). Ici, ${relation}.`);
    }
  }

  function drawLens(ctx, w, h, p) {
    const c = colors();
    const compact = w < 720;
    const cx = w / 2;
    const axisY = h / 2;
    const f = p.b;
    const d = p.a;
    const objectHeight = Math.min(88, h * 0.25);
    const scale = Math.min(4, Math.max(2, (cx - 70) / Math.max(d, f)));
    const objX = cx - d * scale;
    const atFocus = Math.abs(d - f) < 0.8;
    const imageD = atFocus ? Infinity : (d * f) / (d - f);
    const gamma = atFocus ? null : -imageD / d;
    const displayImageD = atFocus ? 0 : Math.sign(imageD) * Math.min(Math.abs(imageD), 78);
    const displayGamma = atFocus ? 0 : Math.max(-1.75, Math.min(1.75, gamma));
    const imageHeight = displayGamma * objectHeight;
    const imgX = atFocus ? w - 58 : Math.max(48, Math.min(w - 58, cx + displayImageD * scale));
    const imgY = axisY - imageHeight;
    const objectTopY = axisY - objectHeight;
    const imageTopY = imgY;
    const imageNature = atFocus ? "image à l'infini" : imageD > 0 ? "image réelle" : "image virtuelle";

    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.78)";
    ctx.strokeStyle = "rgba(148, 163, 184, 0.22)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(18, 18, compact ? w - 36 : 270, 66, 14);
    ctx.fill();
    ctx.stroke();
    label(ctx, "Lentille convergente", 32, 43, c.text, compact ? 13 : 15);
    label(ctx, `OA = ${frNumber(d, 0)} cm · f' = ${frNumber(f, 0)} cm`, 32, 67, c.muted, compact ? 11 : 12);
    ctx.beginPath();
    ctx.roundRect(compact ? w - 152 : w - 198, 24, compact ? 134 : 176, 34, 12);
    ctx.fillStyle = atFocus ? "rgba(245, 158, 11, 0.12)" : imageD > 0 ? "rgba(16, 185, 129, 0.12)" : "rgba(79, 70, 229, 0.12)";
    ctx.strokeStyle = atFocus ? "rgba(245, 158, 11, 0.45)" : imageD > 0 ? "rgba(16, 185, 129, 0.4)" : "rgba(79, 70, 229, 0.4)";
    ctx.fill();
    ctx.stroke();
    centerLabel(ctx, imageNature, compact ? w - 85 : w - 110, 46, atFocus ? c.warning : imageD > 0 ? c.success : c.primary, compact ? 11 : 12);
    ctx.restore();

    function drawArrowObject(x, topY, height, color, labelText) {
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(x, axisY);
      ctx.lineTo(x, topY);
      ctx.stroke();
      const direction = height >= 0 ? -1 : 1;
      ctx.beginPath();
      ctx.moveTo(x, topY);
      ctx.lineTo(x - 9, topY - direction * 15);
      ctx.lineTo(x + 9, topY - direction * 15);
      ctx.closePath();
      ctx.fill();
      centerLabel(ctx, labelText, x, topY + (height >= 0 ? -20 : 28), color, 12);
    }

    function drawCandle(x) {
      ctx.fillStyle = "rgba(239, 68, 68, 0.22)";
      ctx.strokeStyle = c.danger;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x - 13, axisY - objectHeight * 0.72, 26, objectHeight * 0.72, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = c.warning;
      ctx.beginPath();
      ctx.moveTo(x, axisY - objectHeight - 2);
      ctx.quadraticCurveTo(x - 12, axisY - objectHeight * 0.8, x, axisY - objectHeight * 0.72);
      ctx.quadraticCurveTo(x + 12, axisY - objectHeight * 0.8, x, axisY - objectHeight - 2);
      ctx.fill();
      centerLabel(ctx, "Objet", x, axisY - objectHeight - 20, c.danger, 12);
    }

    ctx.strokeStyle = c.muted;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(30, axisY);
    ctx.lineTo(w - 30, axisY);
    ctx.stroke();
    ctx.strokeStyle = c.primary;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(cx, axisY, 18, h * 0.34, 0, 0, Math.PI * 2);
    ctx.stroke();

    [cx - f * scale, cx + f * scale].forEach((x, index) => {
      if (x < 32 || x > w - 32) return;
      ctx.strokeStyle = c.muted;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, axisY - 9);
      ctx.lineTo(x, axisY + 9);
      ctx.stroke();
      centerLabel(ctx, index === 0 ? "F" : "F'", x, axisY + 26, c.muted, 12);
    });

    [cx - 2 * f * scale, cx + 2 * f * scale].forEach((x, index) => {
      if (x < 32 || x > w - 32) return;
      ctx.strokeStyle = "rgba(148, 163, 184, 0.42)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, axisY - 7);
      ctx.lineTo(x, axisY + 7);
      ctx.stroke();
      centerLabel(ctx, index === 0 ? "2F" : "2F'", x, axisY + 43, c.muted, 10);
    });

    if (p.mode === "Bougie") drawCandle(objX);
    else drawArrowObject(objX, objectTopY, objectHeight, c.danger, "Objet");

    ctx.strokeStyle = c.warning;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(objX, objectTopY);
    ctx.lineTo(cx, objectTopY);

    if (atFocus) {
      ctx.lineTo(w - 45, objectTopY);
      ctx.moveTo(objX, objectTopY);
      ctx.lineTo(cx, axisY);
      ctx.lineTo(w - 45, axisY + objectHeight * 0.55);
      ctx.stroke();
      label(ctx, "Image rejetée très loin", w * 0.55, axisY + 74, c.success, 15);
      setContextMetrics(["∞", "non défini", "au foyer"]);
      setReadout("L'objet est proche du foyer : les rayons émergents sont presque parallèles, l'image est rejetée très loin.");
      return;
    }

    if (imageD > 0) {
      ctx.lineTo(imgX, imageTopY);
      ctx.moveTo(objX, objectTopY);
      ctx.lineTo(cx, axisY);
      ctx.lineTo(imgX, imageTopY);
      ctx.stroke();
      const t = ((clock * 0.55) % 1 + 1) % 1;
      const rayX = t < 0.5 ? objX + (cx - objX) * (t * 2) : cx + (imgX - cx) * ((t - 0.5) * 2);
      const rayY = t < 0.5 ? objectTopY : objectTopY + (imageTopY - objectTopY) * ((t - 0.5) * 2);
      ctx.fillStyle = "rgba(245, 158, 11, 0.78)";
      ctx.beginPath();
      ctx.arc(rayX, rayY, compact ? 3 : 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const exitX = w - 45;
      const exitY = objectTopY + (exitX - cx) * ((objectTopY - imageTopY) / (cx - imgX));
      ctx.lineTo(exitX, exitY);
      ctx.moveTo(objX, objectTopY);
      ctx.lineTo(cx, axisY);
      ctx.lineTo(exitX, axisY + (axisY - imageTopY) * 0.35);
      ctx.stroke();
      const t = ((clock * 0.55) % 1 + 1) % 1;
      const rayX = t < 0.5 ? objX + (cx - objX) * (t * 2) : cx + (exitX - cx) * ((t - 0.5) * 2);
      const rayY = t < 0.5 ? objectTopY : objectTopY + (exitY - objectTopY) * ((t - 0.5) * 2);
      ctx.fillStyle = "rgba(245, 158, 11, 0.78)";
      ctx.beginPath();
      ctx.arc(rayX, rayY, compact ? 3 : 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = c.success;
      ctx.beginPath();
      ctx.moveTo(cx, objectTopY);
      ctx.lineTo(imgX, imageTopY);
      ctx.moveTo(cx, axisY);
      ctx.lineTo(imgX, imageTopY);
      ctx.stroke();
      ctx.restore();
    }

    if (p.mode === "Écran") {
      const screenX = imageD > 0 ? Math.min(w - 38, imgX + 14) : w - 44;
      ctx.strokeStyle = imageD > 0 ? c.success : c.danger;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(screenX, axisY - 92);
      ctx.lineTo(screenX, axisY + 92);
      ctx.stroke();
      centerLabel(ctx, imageD > 0 ? "écran" : "pas sur écran", screenX - 6, axisY + 112, imageD > 0 ? c.success : c.danger, 12);
    }

    drawArrowObject(imgX, imageTopY, imageHeight, c.success, imageD > 0 ? "Image réelle" : "Image virtuelle");

    if (Math.abs(imageD) > 78) {
      label(ctx, "échelle horizontale compressée", 24, h - 18, c.muted, 12);
    }
    setContextMetrics([
      imageD > 0 ? `${frNumber(imageD, 1)} cm` : `${frNumber(Math.abs(imageD), 1)} cm côté objet`,
      `γ = ${frNumber(gamma, 2)}`,
      imageD > 0 ? "réelle" : "virtuelle",
    ]);
    setReadout(
      imageD > 0
        ? `L'objet est au-delà du foyer : l'image est réelle, renversée et peut être reçue sur un écran.`
        : `L'objet est entre la lentille et le foyer : l'image est virtuelle, droite et ne se forme pas sur un écran.`
    );
  }

  function drawScale(ctx, w, h, p) {
    const c = colors();
    const start = w * 0.12;
    const end = w * 0.88;
    const y = h * 0.48;
    const dilution = p.b / 100;
    const effectivePh = 7 + (p.a - 7) * Math.pow(1 - dilution, 0.65);
    const nature = effectivePh < 6.8 ? "acide" : effectivePh > 7.2 ? "basique" : "neutre";
    const relativeH = Math.pow(10, 7 - effectivePh);
    const formatRelative = (value) => {
      if (value >= 1000 || value <= 0.01) return `×${value.toExponential(1).replace(".", ",")}`;
      return `×${frNumber(value, value < 10 ? 1 : 0)}`;
    };
    const grad = ctx.createLinearGradient(start, 0, end, 0);
    grad.addColorStop(0, "#ef4444");
    grad.addColorStop(0.5, "#10b981");
    grad.addColorStop(1, "#3b82f6");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(start, y, end - start, 34, 17);
    ctx.fill();

    for (const mark of [0, 7, 14]) {
      const xTick = start + (mark / 14) * (end - start);
      ctx.strokeStyle = "rgba(255,255,255,0.88)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(xTick, y - 8);
      ctx.lineTo(xTick, y + 42);
      ctx.stroke();
      centerLabel(ctx, String(mark), xTick, y + 62, c.text, 12);
    }

    const initialX = start + (p.a / 14) * (end - start);
    const effectiveX = start + (effectivePh / 14) * (end - start);
    ctx.strokeStyle = c.text;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(initialX, y + 17, 14, 0, Math.PI * 2);
    ctx.stroke();
    centerLabel(ctx, "départ", initialX, y - 18, c.muted, 11);

    ctx.fillStyle = nature === "acide" ? c.danger : nature === "basique" ? c.primary : c.success;
    ctx.beginPath();
    ctx.arc(effectiveX, y + 17, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
    centerLabel(ctx, `pH ${frNumber(effectivePh, 1)}`, effectiveX, y - 40, c.text, 18);

    ctx.fillStyle = nature === "acide" ? "rgba(239, 68, 68, 0.12)" : nature === "basique" ? "rgba(79, 70, 229, 0.12)" : "rgba(16, 185, 129, 0.12)";
    ctx.strokeStyle = nature === "acide" ? c.danger : nature === "basique" ? c.primary : c.success;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(w * 0.36, h * 0.18, w * 0.28, h * 0.16, 14);
    ctx.fill();
    ctx.stroke();
    const sampleLabel = p.mode === "Personnalisée" ? "Solution réglée" : p.mode;
    centerLabel(ctx, sampleLabel, w / 2, h * 0.255, c.text, 15);
    centerLabel(ctx, `dilution ${frNumber(p.b, 0)} %`, w / 2, h * 0.315, c.muted, 12);

    label(ctx, "Acide", start, y + 70, c.danger);
    label(ctx, "Neutre", w * 0.47, y + 70, c.success);
    label(ctx, "Basique", end - 58, y + 70, c.primary);
    setContextMetrics([
      frNumber(effectivePh, 1),
      formatRelative(relativeH),
      nature,
    ]);
    setReadout(`La dilution rapproche le pH de 7. Ici, le pH observé vaut ${frNumber(effectivePh, 1)} : la solution est ${nature}.`);
  }

  function drawOscilloscope(ctx, w, h, p) {
    const c = colors();
    const pad = { l: 52, r: 28, t: 36, b: 46 };
    const gw = w - pad.l - pad.r;
    const gh = h - pad.t - pad.b;
    const midY = pad.t + gh / 2;
    const amplitude = p.b;
    const frequency = p.a;
    const period = 1 / frequency;
    const cycles = Math.max(1, frequency / 1.6);

    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.roundRect(pad.l - 12, pad.t - 14, gw + 24, gh + 28, 16);
    ctx.fill();

    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = "900 13px Inter, system-ui, sans-serif";
    ctx.fillText(`Signal ${p.mode.toLowerCase()}`, pad.l + 8, pad.t + 12);
    ctx.fillStyle = "rgba(226, 232, 240, 0.78)";
    ctx.font = "800 10px Inter, system-ui, sans-serif";
    ctx.fillText("axe médian : 0 V", pad.l + 8, pad.t + 30);
    ctx.restore();

    ctx.strokeStyle = "rgba(148, 163, 184, 0.22)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 8; i += 1) {
      const x = pad.l + (i / 8) * gw;
      ctx.moveTo(x, pad.t);
      ctx.lineTo(x, pad.t + gh);
    }
    for (let i = 0; i <= 6; i += 1) {
      const y = pad.t + (i / 6) * gh;
      ctx.moveTo(pad.l, y);
      ctx.lineTo(pad.l + gw, y);
    }
    ctx.stroke();

    ctx.strokeStyle = "rgba(255,255,255,0.62)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pad.l, midY);
    ctx.lineTo(pad.l + gw, midY);
    ctx.stroke();

    const ampPx = (amplitude / 8) * gh * 0.42;
    ctx.strokeStyle = c.primary;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let step = 0; step <= 420; step += 1) {
      const x = pad.l + (step / 420) * gw;
      const phase = (step / 420) * Math.PI * 2 * cycles + clock;
      let v = Math.sin(phase);
      if (p.mode === "Carré") v = Math.sin(phase) >= 0 ? 1 : -1;
      if (p.mode === "Triangulaire") v = (2 / Math.PI) * Math.asin(Math.sin(phase));
      const y = midY - v * ampPx;
      if (step === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    arrow(ctx, pad.l + 18, midY, pad.l + 18, midY - ampPx, c.warning, 2);
    arrow(ctx, pad.l + 18, midY, pad.l + 18, midY + ampPx, c.warning, 2);
    label(ctx, `A = ${frNumber(amplitude, 0)} V`, pad.l + 30, midY - ampPx - 8, c.warning, 12);

    const periodPx = gw / cycles;
    if (periodPx > 36) {
      const x0 = pad.l + gw * 0.58;
      const x1 = Math.min(pad.l + gw - 8, x0 + periodPx);
      ctx.strokeStyle = c.success;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x0, pad.t + gh + 18);
      ctx.lineTo(x1, pad.t + gh + 18);
      ctx.stroke();
      centerLabel(ctx, `T = ${frNumber(period, 3)} s`, (x0 + x1) / 2, pad.t + gh + 38, c.success, 12);
    }

    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
    ctx.font = "800 10px Inter, system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`${frNumber(frequency, 0)} Hz`, pad.l + gw - 10, pad.t + 12);
    ctx.fillText(`${frNumber(period, 3)} s / motif`, pad.l + gw - 10, pad.t + 30);
    ctx.restore();
    setContextMetrics([
      `${frNumber(amplitude, 0)} V`,
      `${frNumber(period, 3)} s`,
      `${frNumber(frequency, 0)} Hz`,
    ]);
    setReadout(`Un motif complet dure T = 1 / f = ${frNumber(period, 3)} s. L'amplitude se lit depuis l'axe médian jusqu'au sommet.`);
  }

  function drawPattern(ctx, w, h, p) {
    const c = colors();
    const isDiffraction = p.mode === "Diffraction";
    const isInterference = p.mode === "Interférences";
    const lambdaNm = p.a;
    const lambdaUm = lambdaNm / 1000;
    const gapOrSpacingUm = p.b;
    const thetaMrad = (lambdaUm / gapOrSpacingUm) * 1000;
    const wavelengthRatio = (p.a - 400) / 300;
    const apertureRatio = (gapOrSpacingUm - 20) / 120;
    const hue = Math.round(270 - wavelengthRatio * 255);
    const beamColor = `hsl(${hue}, 88%, 58%)`;
    const beamSoft = `hsla(${hue}, 88%, 58%, 0.16)`;
    const scene = {
      x: w * 0.06,
      y: h * 0.08,
      width: w * 0.88,
      height: h * 0.58,
    };
    const centerY = scene.y + scene.height * 0.52;
    const sourceX = scene.x + scene.width * 0.08;
    const slitX = scene.x + scene.width * 0.38;
    const screenX = scene.x + scene.width * 0.76;
    const screenW = Math.max(58, scene.width * 0.14);
    const screenH = scene.height * 0.78;
    const screenTop = centerY - screenH / 2;
    const graph = {
      x: w * 0.1,
      y: h * 0.72,
      width: w * 0.8,
      height: h * 0.22,
    };
    const centralHalfNorm = Math.min(0.76, Math.max(0.18, 0.18 + wavelengthRatio * 0.18 + (1 - apertureRatio) * 0.36));
    const fringeStepNorm = Math.min(0.42, Math.max(0.16, (lambdaUm / gapOrSpacingUm) * 42));
    const slitGapPx = Math.max(13, Math.min(48, 13 + apertureRatio * 35));
    const slitSpacingPx = Math.max(22, Math.min(66, 22 + apertureRatio * 44));

    const sinc = (x) => Math.abs(x) < 0.001 ? 1 : Math.sin(x) / x;
    const intensityAt = (norm) => {
      const envelope = Math.pow(sinc((norm / centralHalfNorm) * Math.PI), 2);
      const fringes = Math.pow(0.5 + 0.5 * Math.cos((norm / fringeStepNorm) * Math.PI * 2), 1.35);
      if (isDiffraction) return Math.max(0.025, envelope);
      if (isInterference) return 0.1 + 0.9 * fringes;
      return Math.max(0.025, envelope * fringes);
    };

    ctx.fillStyle = "rgba(255, 255, 255, 0.84)";
    ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(scene.x, scene.y, scene.width, scene.height, 18);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(15, 23, 42, 0.06)";
    ctx.beginPath();
    ctx.roundRect(scene.x + scene.width * 0.03, scene.y + 12, scene.width * 0.28, 58, 12);
    ctx.fill();
    label(ctx, "À observer", scene.x + scene.width * 0.05, scene.y + 34, c.text, 13);
    label(
      ctx,
      isDiffraction ? "tache centrale" : isInterference ? "écart entre franges" : "franges + enveloppe",
      scene.x + scene.width * 0.05,
      scene.y + 56,
      c.primary,
      13
    );

    ctx.fillStyle = "rgba(245, 158, 11, 0.13)";
    ctx.strokeStyle = c.warning;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(sourceX - 26, centerY - 18, 52, 36, 10);
    ctx.fill();
    ctx.stroke();
    centerLabel(ctx, "Laser", sourceX, centerY + 4, c.text, 12);
    centerLabel(ctx, `λ = ${frNumber(lambdaNm, 0)} nm`, sourceX, centerY + 38, c.muted, 12);

    ctx.strokeStyle = beamColor;
    ctx.lineWidth = 3.5;
    const slitCenters = isDiffraction ? [centerY] : [centerY - slitSpacingPx / 2, centerY + slitSpacingPx / 2];
    slitCenters.forEach((slitCenter) => {
      ctx.beginPath();
      ctx.moveTo(sourceX + 28, slitCenter);
      ctx.lineTo(slitX - 11, slitCenter);
      ctx.stroke();
    });

    const spread = Math.min(screenH * 0.47, screenH * (0.2 + wavelengthRatio * 0.1 + (1 - apertureRatio) * 0.24));
    ctx.fillStyle = beamSoft;
    ctx.beginPath();
    ctx.moveTo(slitX + 8, centerY);
    ctx.lineTo(screenX, centerY - spread);
    ctx.lineTo(screenX, centerY + spread);
    ctx.closePath();
    ctx.fill();
    slitCenters.forEach((slitCenter) => {
      ctx.strokeStyle = beamColor;
      ctx.lineWidth = 2;
      arrow(ctx, slitX + 10, slitCenter, screenX - 8, centerY, beamColor, 2);
    });

    const plateTop = scene.y + scene.height * 0.18;
    const plateH = scene.height * 0.72;
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.roundRect(slitX - 8, plateTop, 16, plateH, 8);
    ctx.fill();
    ctx.fillStyle = "#f8fafc";
    if (isDiffraction) {
      ctx.fillRect(slitX - 9, centerY - slitGapPx / 2, 18, slitGapPx);
    } else {
      ctx.fillRect(slitX - 9, centerY - slitSpacingPx / 2 - 6, 18, 12);
      ctx.fillRect(slitX - 9, centerY + slitSpacingPx / 2 - 6, 18, 12);
    }
    centerLabel(ctx, isDiffraction ? "Fente unique" : "Deux fentes", slitX, plateTop - 12, c.text, 12);
    centerLabel(ctx, isDiffraction ? `a = ${frNumber(gapOrSpacingUm, 0)} µm` : `d = ${frNumber(gapOrSpacingUm, 0)} µm`, slitX, plateTop + plateH + 24, c.muted, 12);

    ctx.fillStyle = "rgba(15, 23, 42, 0.94)";
    ctx.strokeStyle = "rgba(15, 23, 42, 0.38)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(screenX, screenTop, screenW, screenH, 12);
    ctx.fill();
    ctx.stroke();
    centerLabel(ctx, "Écran", screenX + screenW / 2, screenTop - 12, c.text, 12);
    for (let step = 0; step < screenH; step += 1) {
      const y = screenTop + step;
      const norm = (y - centerY) / (screenH / 2);
      const intensity = Math.min(1, intensityAt(norm));
      const lightness = 40 + intensity * 36;
      const alpha = 0.14 + intensity * 0.82;
      ctx.fillStyle = `hsla(${hue}, 90%, ${lightness}%, ${alpha})`;
      ctx.fillRect(screenX + 8, y, screenW - 16, 1.25);
    }
    ctx.strokeStyle = "rgba(255,255,255,0.72)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(screenX + 8, centerY);
    ctx.lineTo(screenX + screenW - 8, centerY);
    ctx.stroke();

    const markerX = Math.min(w - 42, screenX + screenW + 16);
    const markerSpan = isDiffraction
      ? centralHalfNorm * (screenH / 2)
      : Math.max(16, fringeStepNorm * (screenH / 2));
    ctx.strokeStyle = c.success;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(markerX, centerY - markerSpan);
    ctx.lineTo(markerX, centerY + markerSpan);
    ctx.moveTo(markerX - 6, centerY - markerSpan);
    ctx.lineTo(markerX + 6, centerY - markerSpan);
    ctx.moveTo(markerX - 6, centerY + markerSpan);
    ctx.lineTo(markerX + 6, centerY + markerSpan);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.86)";
    ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(graph.x, graph.y, graph.width, graph.height, 12);
    ctx.fill();
    ctx.stroke();
    label(ctx, "Profil d'intensité sur l'écran", graph.x + 12, graph.y + 20, c.text, 12);
    ctx.strokeStyle = c.grid;
    ctx.beginPath();
    const profileBase = graph.y + graph.height - 16;
    const profileAmp = graph.height - 44;
    ctx.moveTo(graph.x + 24, profileBase);
    ctx.lineTo(graph.x + graph.width - 16, profileBase);
    ctx.moveTo(graph.x + graph.width / 2, graph.y + 30);
    ctx.lineTo(graph.x + graph.width / 2, profileBase);
    ctx.stroke();
    const profilePoints = [];
    for (let step = 0; step <= 180; step += 1) {
      const norm = ((step / 180) * 2 - 1) * 1.18;
      const x = graph.x + 24 + (step / 180) * (graph.width - 40);
      const y = profileBase - intensityAt(norm) * profileAmp;
      profilePoints.push([x, y]);
    }
    ctx.fillStyle = `hsla(${hue}, 90%, 58%, 0.14)`;
    ctx.beginPath();
    ctx.moveTo(profilePoints[0][0], profileBase);
    profilePoints.forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.lineTo(profilePoints[profilePoints.length - 1][0], profileBase);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = beamColor;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    profilePoints.forEach(([x, y], index) => {
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    const contrast = isDiffraction ? (centralHalfNorm > 0.46 ? "tache large" : "tache étroite") : isInterference ? "franges nettes" : "modulé";
    setContextMetrics([
      isDiffraction ? `2θ ≈ ${frNumber(2 * thetaMrad, 1)} mrad` : `Δθ ≈ ${frNumber(thetaMrad, 1)} mrad`,
      isDiffraction ? "—" : `${frNumber(thetaMrad, 1)} mrad`,
      contrast,
    ]);
    setReadout(
      isDiffraction
        ? `Diffraction : observe la tache centrale sur l'écran. Elle s'élargit quand λ augmente ou quand la largeur a diminue.`
        : isInterference
          ? `Interférences : observe l'écart entre deux franges claires. Il augmente quand λ augmente ou quand d diminue.`
          : `Superposition : les franges d'interférences restent visibles, mais leur intensité est limitée par l'enveloppe de diffraction.`
    );
  }

  function drawTelescope(ctx, w, h, p) {
    const c = colors();
    const compact = w < 720;
    const fObj = Math.max(1, p.a);
    const fOcc = Math.max(1, p.b);
    const distance = fObj + fOcc;
    const grossissement = fObj / fOcc;
    const axisY = compact ? h * 0.58 : h * 0.56;
    const leftMargin = compact ? 36 : 76;
    const rightMargin = compact ? 30 : 86;
    const sideSpace = compact ? 28 : 96;
    const available = w - leftMargin - rightMargin - sideSpace * 2;
    const scale = Math.max(compact ? 1.45 : 2.25, Math.min(available / distance, compact ? 2.75 : 4.8));
    const x1 = leftMargin + sideSpace;
    const x2 = x1 + distance * scale;
    const xCommon = x1 + fObj * scale;
    const xF1 = x1 - fObj * scale;
    const xF2Prime = x2 + fOcc * scale;
    const thetaDeg = 1.0;
    const thetaRad = (thetaDeg * Math.PI) / 180;
    const renderTheta = thetaRad * 2.15;
    const imageHeight = Math.min(h * 0.17, Math.max(14, fObj * scale * Math.tan(renderTheta) * 1.25));
    const yImage = axisY + imageHeight;
    const objectiveHeight = Math.min(h * 0.62, compact ? 230 : 320);
    const ocularHeight = Math.min(h * 0.46, compact ? 170 : 235);
    const rawMode = p.mode || "4. Synthèse afocale";
    const mode = rawMode === "Afocal" || rawMode === "Construction complète"
      ? "4. Synthèse afocale"
      : rawMode === "Objectif seul"
        ? "1. Objectif"
        : rawMode === "Oculaire seul"
          ? "3. Oculaire"
          : rawMode;
    const stepIndex = mode.startsWith("1.")
      ? 1
      : mode.startsWith("2.")
        ? 2
        : mode.startsWith("3.")
          ? 3
          : 4;
    const stepObjective = stepIndex === 1;
    const stepImage = stepIndex === 2;
    const stepOcular = stepIndex === 3;
    const showFull = stepIndex === 4;
    const showObjective = stepObjective || stepImage || showFull;
    const showOcular = stepOcular || showFull;
    const showImage = stepImage || stepOcular || showFull;
    const showCommonPlane = stepImage || stepOcular || showFull;
    const showIncomingStar = stepObjective || stepImage || showFull;
    const showEye = stepOcular || showFull;
    const rayColor = "#0ea5e9";
    const afterObjectiveColor = "#f97316";
    const focalColor = "#10b981";

    const background = ctx.createLinearGradient(0, 0, w, h);
    background.addColorStop(0, "#f8fbff");
    background.addColorStop(1, "#eef2ff");
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
    ctx.strokeStyle = "rgba(148, 163, 184, 0.18)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(compact ? 10 : 18, compact ? 12 : 16, w - (compact ? 20 : 36), h - (compact ? 24 : 32), 22);
    ctx.fill();
    ctx.stroke();
    drawStepHeader();

    function drawDashedLine(xA, yA, xB, yB, color, dash = [6, 6], width = 1.4) {
      ctx.save();
      ctx.setLineDash(dash);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(xA, yA);
      ctx.lineTo(xB, yB);
      ctx.stroke();
      ctx.restore();
    }

    function drawPointMark(x, y, text, color, above = false) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = "850 11px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(text, x, y + (above ? -10 : 20));
      ctx.textAlign = "left";
    }

    function drawLens(x, height, color, title, faded = false) {
      ctx.save();
      ctx.globalAlpha = faded ? 0.34 : 1;
      const top = axisY - height / 2;
      const bottom = axisY + height / 2;
      const glass = ctx.createLinearGradient(x - 12, 0, x + 12, 0);
      glass.addColorStop(0, "rgba(255, 255, 255, 0.08)");
      glass.addColorStop(0.5, color);
      glass.addColorStop(1, "rgba(255, 255, 255, 0.08)");
      ctx.strokeStyle = glass;
      ctx.lineWidth = faded ? 5 : 7;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.bezierCurveTo(x + 12, top + height * 0.25, x + 12, bottom - height * 0.25, x, bottom);
      ctx.bezierCurveTo(x - 12, bottom - height * 0.25, x - 12, top + height * 0.25, x, top);
      ctx.stroke();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 9, top + 14);
      ctx.lineTo(x, top);
      ctx.lineTo(x + 9, top + 14);
      ctx.moveTo(x - 9, bottom - 14);
      ctx.lineTo(x, bottom);
      ctx.lineTo(x + 9, bottom - 14);
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.font = "900 12px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(title, x, top - 12);
      ctx.restore();
      ctx.textAlign = "left";
    }

    function drawBracket(xA, xB, y, text, color) {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(xA, y);
      ctx.lineTo(xB, y);
      ctx.moveTo(xA, y - 6);
      ctx.lineTo(xA, y + 6);
      ctx.moveTo(xB, y - 6);
      ctx.lineTo(xB, y + 6);
      ctx.stroke();
      ctx.font = "850 11px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(text, (xA + xB) / 2, y - 8);
      ctx.restore();
    }

    function drawArrowHead(x, y, slope, color) {
      const angle = Math.atan(slope);
      ctx.save();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - Math.cos(angle - 0.42) * 12, y - Math.sin(angle - 0.42) * 12);
      ctx.lineTo(x - Math.cos(angle + 0.42) * 12, y - Math.sin(angle + 0.42) * 12);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function drawPillText(text, x, y, options = {}) {
      const font = options.font || "850 11px Inter, system-ui, sans-serif";
      const paddingX = options.paddingX || 9;
      const height = options.height || 23;
      ctx.save();
      ctx.font = font;
      const width = Math.ceil(ctx.measureText(text).width) + paddingX * 2;
      const left = options.align === "left" ? x : x - width / 2;
      const top = y - height / 2;
      ctx.fillStyle = options.bg || "rgba(255, 255, 255, 0.86)";
      ctx.strokeStyle = options.border || "rgba(148, 163, 184, 0.22)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(left, top, width, height, 9);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = options.color || c.text;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, left + width / 2, y + 0.5);
      ctx.restore();
    }

    function drawStepHeader() {
      const steps = [
        { title: "Objectif", detail: "Rayons parallèles -> foyer image F'₁." },
        { title: "Image intermédiaire", detail: "A₁B₁ est réelle et renversée au plan focal." },
        { title: "Oculaire", detail: "L'oculaire renvoie des rayons parallèles." },
        { title: "Synthèse afocale", detail: "F'₁ = F₂ : image finale à l'infini." },
      ];
      const current = steps[stepIndex - 1];
      const box = compact
        ? { x: 22, y: 22, width: w - 44, height: 74 }
        : { x: 32, y: 26, width: Math.min(560, w - 64), height: 76 };
      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.strokeStyle = "rgba(79, 70, 229, 0.16)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(box.x, box.y, box.width, box.height, 18);
      ctx.fill();
      ctx.stroke();

      const dotY = box.y + 23;
      const dotX = box.x + 20;
      for (let index = 0; index < 4; index += 1) {
        const x = dotX + index * 22;
        ctx.fillStyle = index + 1 <= stepIndex ? "#4f46e5" : "rgba(148, 163, 184, 0.28)";
        ctx.beginPath();
        ctx.arc(x, dotY, index + 1 === stepIndex ? 6 : 4, 0, Math.PI * 2);
        ctx.fill();
        if (index < 3) {
          ctx.strokeStyle = index + 1 < stepIndex ? "rgba(79, 70, 229, 0.55)" : "rgba(148, 163, 184, 0.22)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x + 8, dotY);
          ctx.lineTo(x + 16, dotY);
          ctx.stroke();
        }
      }

      const compactTitles = ["Étape 1 : Objectif", "Étape 2 : A₁B₁", "Étape 3 : Oculaire", "Étape 4 : Synthèse"];
      const headerTitle = compact ? compactTitles[stepIndex - 1] : `Étape ${stepIndex} : ${current.title}`;
      ctx.fillStyle = c.text;
      ctx.font = compact ? "900 13px Inter, system-ui, sans-serif" : "900 16px Inter, system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(headerTitle, box.x + 118, box.y + 29);
      ctx.fillStyle = c.muted;
      ctx.font = compact ? "760 10.5px Inter, system-ui, sans-serif" : "760 12px Inter, system-ui, sans-serif";
      const detail = current.detail;
      ctx.fillText(detail, box.x + (compact ? 16 : 118), box.y + (compact ? 56 : 55));
      ctx.restore();
    }

    function drawAngleArc(cx, cy, radius, startAngle, endAngle, text, color, labelOffsetY = 0) {
      const start = Math.min(startAngle, endAngle);
      const end = Math.max(startAngle, endAngle);
      const mid = (start + end) / 2;
      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, start, end);
      ctx.stroke();
      const labelX = cx + Math.cos(mid) * (radius + 17);
      const labelY = cy + Math.sin(mid) * (radius + 17) + labelOffsetY;
      ctx.font = "900 12px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, labelX, labelY);
      ctx.restore();
    }

    function drawSlopeAngle(cx, cy, slope, text, color) {
      const angle = Math.atan(slope);
      const size = compact ? 38 : 52;
      drawDashedLine(cx, cy, cx + size, cy, "rgba(100, 116, 139, 0.34)", [4, 4], 1.2);
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + size, cy + slope * size);
      ctx.stroke();
      ctx.restore();
      drawAngleArc(cx, cy, compact ? 17 : 21, 0, angle, text, color, slope < 0 ? -6 : 8);
    }

    function drawParallelCue(xA, xB, yA, slope, color) {
      const cueX = xA + (xB - xA) * (compact ? 0.46 : 0.44);
      const cueY = yA + slope * (cueX - xA);
      const tickLength = compact ? 24 : 34;
      const tickGap = compact ? 17 : 22;
      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      [-1, 0, 1].forEach((row) => {
        const baseY = cueY + row * tickGap;
        ctx.beginPath();
        ctx.moveTo(cueX - tickLength / 2, baseY - slope * tickLength / 2);
        ctx.lineTo(cueX + tickLength / 2, baseY + slope * tickLength / 2);
        ctx.stroke();
      });
      ctx.restore();
      if (!compact) {
        drawPillText("sortie parallèle", cueX + 10, cueY - 46, {
          color,
          bg: "rgba(255, 247, 237, 0.92)",
          border: "rgba(249, 115, 22, 0.28)",
          font: "900 11px Inter, system-ui, sans-serif",
        });
      }
    }

    drawDashedLine(compact ? 16 : 32, axisY, w - (compact ? 16 : 32), axisY, "rgba(15, 23, 42, 0.42)", [10, 7], 1.6);
    if (!compact) {
      drawPillText("axe optique", x1 + Math.min(230, (xCommon - x1) * 0.45), axisY + 30, {
        color: c.muted,
        bg: "rgba(255, 255, 255, 0.72)",
        border: "rgba(148, 163, 184, 0.18)",
      });
    }

    if ((stepObjective || stepImage || showFull) && xF1 > 20) {
      drawPointMark(xF1, axisY, "F₁", "rgba(100, 116, 139, 0.72)", false);
    }
    if (showObjective) drawPointMark(x1, axisY, "O₁", "#2563eb", false);
    if (showCommonPlane) {
      drawPointMark(xCommon, axisY, compact ? "F'₁/F₂" : "F'₁ = F₂", focalColor, true);
      drawDashedLine(xCommon, axisY - h * 0.3, xCommon, axisY + h * 0.25, "rgba(16, 185, 129, 0.42)", [5, 6], 1.5);
      const focalLabelX = compact ? xCommon : Math.min(Math.max(xCommon, 112), w - 150);
      drawPillText(compact ? "plan focal" : "plan focal commun", focalLabelX, Math.max(108, axisY - h * 0.29), {
        color: focalColor,
        bg: "rgba(236, 253, 245, 0.92)",
        border: "rgba(16, 185, 129, 0.25)",
        font: compact ? "850 10px Inter, system-ui, sans-serif" : "900 11px Inter, system-ui, sans-serif",
      });
    }
    if (showOcular) drawPointMark(x2, axisY, "O₂", "#7c3aed", false);
    if ((stepOcular || showFull) && xF2Prime < w - 20) {
      drawPointMark(xF2Prime, axisY, "F'₂", "rgba(100, 116, 139, 0.72)", false);
    }

    if (showFull) {
      drawBracket(x1, x2, compact ? h - 34 : h - 42, `O₁O₂ = f'₁ + f'₂ = ${frNumber(distance, 0)} cm`, c.text);
      if (!compact) {
        drawBracket(x1, xCommon, h - 76, `f'₁ = ${frNumber(fObj, 0)} cm`, "#2563eb");
        drawBracket(xCommon, x2, h - 104, `f'₂ = ${frNumber(fOcc, 0)} cm`, "#7c3aed");
      }
    }

    if (showObjective) drawLens(x1, objectiveHeight, "#2563eb", "objectif L₁");
    if (showOcular) drawLens(x2, ocularHeight, "#7c3aed", "oculaire L₂");

    const offsets = compact ? [-32, 0, 32] : [-46, 0, 46];
    const xStart = compact ? 16 : 30;
    const xEnd = w - (compact ? 18 : 38);
    const slopeIn = Math.tan(renderTheta);
    const slopeOut = Math.max(-0.72, Math.min(0.72, -Math.tan(renderTheta) * grossissement));
    const angleIn = Math.atan(slopeIn);
    const centralYStart = axisY - slopeIn * (x1 - xStart);
    const centralSlopeMiddle = (yImage - axisY) / (xCommon - x1);
    const centralYL2 = yImage + centralSlopeMiddle * (x2 - xCommon);

    if (showObjective) {
      offsets.forEach((offset, index) => {
        const yL1 = axisY + offset;
        const yStart = yL1 - slopeIn * (x1 - xStart);
        const isCentral = Math.abs(offset) < 1;
        ctx.strokeStyle = isCentral ? rayColor : "rgba(14, 165, 233, 0.38)";
        ctx.lineWidth = isCentral ? 2.8 : 1.7;
        ctx.beginPath();
        ctx.moveTo(xStart, yStart);
        ctx.lineTo(x1, yL1);
        ctx.lineTo(xCommon, yImage);
        if (showFull) {
          const slopeMiddle = (yImage - yL1) / (xCommon - x1);
          const yL2 = yImage + slopeMiddle * (x2 - xCommon);
          ctx.lineTo(x2, yL2);
          ctx.stroke();
          ctx.strokeStyle = isCentral ? afterObjectiveColor : "rgba(249, 115, 22, 0.4)";
          ctx.beginPath();
          ctx.moveTo(x2, yL2);
          ctx.lineTo(xEnd, yL2 + slopeOut * (xEnd - x2));
          ctx.stroke();
          if (isCentral) {
            drawArrowHead(xStart + (x1 - xStart) * 0.55, yStart + slopeIn * (xStart + (x1 - xStart) * 0.55 - xStart), slopeIn, rayColor);
            drawArrowHead(x2 + (xEnd - x2) * 0.42, yL2 + slopeOut * (xEnd - x2) * 0.42, slopeOut, afterObjectiveColor);
          }
        } else {
          ctx.stroke();
          if (isCentral) drawArrowHead(x1 + (xCommon - x1) * 0.52, yL1 + (yImage - yL1) * 0.52, (yImage - yL1) / (xCommon - x1), rayColor);
        }
        if (!isCentral && index % 2 === 0) {
          ctx.fillStyle = "rgba(14, 165, 233, 0.5)";
          ctx.beginPath();
          ctx.arc(x1, yL1, 2.6, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    if (showObjective) {
      drawAngleArc(x1, axisY, compact ? 25 : 34, Math.PI, Math.PI + angleIn, "θ", rayColor, -2);
      if (!compact) {
        drawPillText("rayons incidents parallèles", x1 - 12, centralYStart - 18, {
          color: rayColor,
          bg: "rgba(240, 249, 255, 0.9)",
          border: "rgba(14, 165, 233, 0.24)",
          font: "900 11px Inter, system-ui, sans-serif",
        });
      }
    }

    if (stepOcular) {
      const sourceOffsets = compact ? [-24, 0, 24] : [-38, 0, 38];
      sourceOffsets.forEach((offset, index) => {
        const yObject = yImage + offset * 0.16;
        const yL2 = axisY + offset;
        const isCentral = index === 1;
        ctx.strokeStyle = isCentral ? afterObjectiveColor : "rgba(249, 115, 22, 0.42)";
        ctx.lineWidth = isCentral ? 2.8 : 1.7;
        ctx.beginPath();
        ctx.moveTo(xCommon, yObject);
        ctx.lineTo(x2, yL2);
        ctx.lineTo(xEnd, yL2 + slopeOut * (xEnd - x2));
        ctx.stroke();
        if (isCentral) drawArrowHead(x2 + (xEnd - x2) * 0.45, yL2 + slopeOut * (xEnd - x2) * 0.45, slopeOut, afterObjectiveColor);
      });
    }

    if (showOcular) {
      drawParallelCue(x2, xEnd, centralYL2, slopeOut, afterObjectiveColor);
      if (!compact) {
        const angleAnchorX = Math.min(w - 182, x2 + Math.max(54, (xEnd - x2) * 0.22));
        const angleAnchorY = axisY + Math.min(h * 0.22, 96);
        drawSlopeAngle(angleAnchorX, angleAnchorY, slopeOut, "θ'", afterObjectiveColor);
        drawPillText(`|θ'| = ${frNumber(grossissement, 1)} × |θ|`, angleAnchorX + 86, angleAnchorY + 30, {
          color: afterObjectiveColor,
          bg: "rgba(255, 247, 237, 0.9)",
          border: "rgba(249, 115, 22, 0.26)",
          font: "900 11px Inter, system-ui, sans-serif",
        });
      }
    }

    if (showImage) {
      ctx.save();
      ctx.strokeStyle = "#dc2626";
      ctx.fillStyle = "#dc2626";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(xCommon, axisY);
      ctx.lineTo(xCommon, yImage);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(xCommon, yImage);
      ctx.lineTo(xCommon - 7, yImage - 13);
      ctx.lineTo(xCommon + 7, yImage - 13);
      ctx.closePath();
      ctx.fill();
      ctx.font = "900 12px Inter, system-ui, sans-serif";
      const imageLabel = compact ? "A₁B₁" : "image intermédiaire A₁B₁";
      const imageLabelWidth = compact ? 54 : 178;
      const imageLabelX = compact ? xCommon - imageLabelWidth / 2 : xCommon - imageLabelWidth * 0.45;
      const imageLabelY = yImage + (compact ? 12 : 10);
      ctx.fillStyle = "rgba(255, 255, 255, 0.86)";
      ctx.strokeStyle = "rgba(220, 38, 38, 0.16)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(imageLabelX, imageLabelY, imageLabelWidth, 24, 10);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#dc2626";
      ctx.textAlign = "center";
      ctx.fillText(imageLabel, imageLabelX + imageLabelWidth / 2, imageLabelY + 16);
      ctx.restore();
    } else if (showObjective) {
      drawPillText("convergence en F'₁", xCommon, yImage + 20, {
        color: "#dc2626",
        bg: "rgba(254, 242, 242, 0.9)",
        border: "rgba(220, 38, 38, 0.18)",
        font: compact ? "850 10px Inter, system-ui, sans-serif" : "900 11px Inter, system-ui, sans-serif",
      });
    }

    ctx.save();
    if (showIncomingStar) {
      const starX = compact ? 30 : 54;
      const starY = compact ? 122 : 112;
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.arc(starX, starY, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(250, 204, 21, 0.32)";
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.arc(starX, starY, 17 + Math.sin(clock * 2) * 1.5, 0, Math.PI * 2);
      ctx.stroke();
      if (!compact) {
        ctx.fillStyle = c.muted;
        ctx.font = "850 11px Inter, system-ui, sans-serif";
        ctx.fillText("astre lointain", starX + 24, starY + 4);
      }
    }
    if (showEye) {
      ctx.fillStyle = "rgba(15, 23, 42, 0.72)";
      ctx.beginPath();
      ctx.ellipse(w - (compact ? 22 : 32), axisY + slopeOut * (xEnd - x2), 9, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      if (!compact) {
        ctx.fillStyle = c.muted;
        ctx.fillText("œil", w - 65, axisY + slopeOut * (xEnd - x2) + 30);
      }
    }
    ctx.restore();

    setContextMetrics([
      `${frNumber(distance, 0)} cm`,
      `G = -${frNumber(grossissement, 1)}`,
      showCommonPlane ? "F'₁ = F₂" : "F'₁ seul",
      showOcular ? "à l'infini" : "A₁B₁ réelle",
    ]);

    if (stepObjective) {
      setReadout(`Étape 1 : l'objectif reçoit des rayons presque parallèles venus d'un astre lointain. Ils convergent dans son plan focal image F'₁.`);
    } else if (stepImage) {
      setReadout(`Étape 2 : l'objectif forme l'image intermédiaire A₁B₁. Elle est réelle, renversée et placée dans le plan focal commun F'₁ = F₂.`);
    } else if (stepOcular) {
      setReadout(`Étape 3 : A₁B₁ est dans le foyer objet F₂ de l'oculaire. Les rayons ressortent parallèles : l'image finale est à l'infini.`);
    } else {
      setReadout(`Étape 4 : lunette afocale complète. O₁O₂ = f'₁ + f'₂ = ${frNumber(distance, 0)} cm, F'₁ et F₂ coïncident, et G = -f'₁/f'₂ = -${frNumber(grossissement, 1)}.`);
    }
  }

  function drawWeight(ctx, w, h, p) {
    const c = colors();
    const compact = w < 720;
    const mass = Math.max(0, p.a);
    const gravity = Math.max(0, p.b);
    const weight = mass * gravity;
    const presets = [
      { name: "Lune", g: 1.6, color: "#64748b" },
      { name: "Terre", g: 9.8, color: "#2563eb" },
      { name: "Jupiter", g: 24.8, color: "#f97316" },
    ];
    const selectedPreset = presets.find((item) => item.name === p.mode);
    const maxMass = Number(inputA.max) || 100;
    const maxVisualForce = Math.max(1, maxMass * 24.8);
    const stretchNorm = Math.sqrt(Math.min(1, weight / maxVisualForce));
    const motionActive = !reducedMotion && !isPaused;
    const intro = reducedMotion || isPaused ? 1 : Math.min(1, clock * 1.18);
    const ease = 1 - Math.pow(1 - intro, 3);
    const settle = motionActive ? Math.sin(clock * 15) * Math.exp(-clock * 0.9) : 0;
    const breath = motionActive ? Math.sin(clock * 2.7) : 0;
    const animatedNorm = Math.max(0, Math.min(1, stretchNorm * ease + settle * 0.035));
    const forceProgress = reducedMotion || isPaused ? 1 : Math.max(0.1, ease);
    const barProgress = reducedMotion || isPaused ? 1 : Math.max(0.14, ease);

    const scene = compact
      ? { x: 16, y: 16, width: w - 32, height: h * 0.5 }
      : { x: 28, y: 28, width: w * 0.58, height: h - 56 };
    const side = compact
      ? { x: 16, y: scene.y + scene.height + 12, width: w - 32, height: h - scene.y - scene.height - 28 }
      : { x: scene.x + scene.width + 22, y: 28, width: w - scene.x - scene.width - 50, height: h - 56 };

    function panel(box, title, subtitle) {
      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 0.86)";
      ctx.strokeStyle = "rgba(148, 163, 184, 0.24)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(box.x, box.y, box.width, box.height, 18);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = c.text;
      ctx.font = "900 13px Inter, system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(title, box.x + 16, box.y + 26);
      if (subtitle && !compact) {
        ctx.fillStyle = c.muted;
        ctx.font = "800 11px Inter, system-ui, sans-serif";
        ctx.fillText(subtitle, box.x + 16, box.y + 45);
      }
      ctx.restore();
    }

    function pill(text, x, y, color, bg = "rgba(255,255,255,0.9)", size = 12) {
      ctx.save();
      ctx.font = `900 ${size}px Inter, system-ui, sans-serif`;
      const width = ctx.measureText(text).width + 20;
      const safeX = Math.max(scene.x + width / 2 + 8, Math.min(scene.x + scene.width - width / 2 - 8, x));
      ctx.fillStyle = bg;
      ctx.strokeStyle = `${color}44`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(safeX - width / 2, y - 13, width, 26, 10);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, safeX, y + 1);
      ctx.restore();
    }

    function spring(x, y1, y2, amplitude, turns) {
      ctx.beginPath();
      ctx.moveTo(x, y1);
      for (let i = 1; i <= turns * 2; i += 1) {
        const t = i / (turns * 2);
        ctx.lineTo(x + (i % 2 === 0 ? -amplitude : amplitude), y1 + (y2 - y1) * t);
      }
      ctx.lineTo(x, y2);
      ctx.stroke();
    }

    panel(scene, "Dynamomètre en action");
    panel(side, "Comparer les astres");

    const rigX = scene.x + scene.width * (compact ? 0.45 : 0.43);
    const objectW = compact ? 88 : 116;
    const objectH = compact ? 54 : 70;
    const topY = scene.y + (compact ? 98 : 132);
    const springBase = compact ? 50 : 68;
    const springExtra = compact ? 58 : 118;
    const springLength = springBase + animatedNorm * springExtra;
    const bob = settle * (compact ? 13 : 20) + breath * (compact ? 2.2 : 3.2);
    const hookY = topY + springLength + bob;
    const maxObjectY = scene.y + scene.height - objectH - (compact ? 56 : 92);
    const objectY = Math.min(maxObjectY, Math.max(topY + 44, hookY + 9));
    const measuredY = objectY - 5;
    const forceX = rigX - objectW / 2 - (compact ? 28 : 34);
    const forceStartY = objectY + 8;
    const finalForceLength = (compact ? 30 : 42) + stretchNorm * (compact ? 102 : 156);
    const forceEndY = Math.min(scene.y + scene.height - (compact ? 24 : 40), forceStartY + finalForceLength * forceProgress);
    const scaleX = scene.x + scene.width * (compact ? 0.77 : 0.75);
    const scaleTop = topY - (compact ? 28 : 38);
    const scaleBottom = scene.y + scene.height - (compact ? 38 : 62);
    const pointerY = Math.min(scaleBottom, Math.max(scaleTop + 24, measuredY));

    ctx.save();
    const bodyGradient = ctx.createLinearGradient(scaleX - 28, scaleTop, scaleX + 28, scaleBottom);
    bodyGradient.addColorStop(0, "rgba(248, 250, 252, 0.95)");
    bodyGradient.addColorStop(1, "rgba(226, 232, 240, 0.95)");
    ctx.fillStyle = bodyGradient;
    ctx.strokeStyle = "rgba(100, 116, 139, 0.36)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(scaleX - (compact ? 20 : 25), scaleTop, compact ? 40 : 50, scaleBottom - scaleTop, 14);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = c.muted;
    ctx.font = `850 ${compact ? 9 : 10}px Inter, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("N", scaleX, scaleTop + 18);
    for (let i = 0; i <= 5; i += 1) {
      const y = scaleTop + 34 + ((scaleBottom - scaleTop - 54) * i) / 5;
      ctx.strokeStyle = i % 2 === 0 ? "rgba(100, 116, 139, 0.5)" : "rgba(148, 163, 184, 0.38)";
      ctx.lineWidth = i % 2 === 0 ? 1.3 : 1;
      ctx.beginPath();
      ctx.moveTo(scaleX - (compact ? 13 : 17), y);
      ctx.lineTo(scaleX + (compact ? 13 : 17), y);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(15, 23, 42, 0.58)";
    ctx.lineWidth = compact ? 8 : 10;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(rigX - (compact ? 54 : 80), topY - 30);
    ctx.lineTo(rigX + (compact ? 54 : 80), topY - 30);
    ctx.stroke();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = "rgba(15, 23, 42, 0.5)";
    ctx.beginPath();
    ctx.moveTo(rigX, topY - 30);
    ctx.lineTo(rigX, topY - 2);
    ctx.stroke();
    if (!compact) centerLabel(ctx, "dynamomètre", rigX, topY - 47, c.muted, 11);

    ctx.strokeStyle = "rgba(71, 85, 105, 0.74)";
    ctx.lineWidth = compact ? 2.4 : 3;
    ctx.lineCap = "round";
    spring(rigX, topY, objectY - 12, compact ? 9 : 12, compact ? 6 : 8);
    ctx.beginPath();
    ctx.moveTo(rigX, objectY - 12);
    ctx.quadraticCurveTo(rigX + 10, objectY - 4, rigX, objectY + 4);
    ctx.stroke();

    ctx.strokeStyle = c.danger;
    ctx.lineWidth = compact ? 2 : 2.6;
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.moveTo(rigX + objectW / 2 + 8, pointerY);
    ctx.lineTo(scaleX - (compact ? 23 : 29), pointerY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = c.danger;
    ctx.beginPath();
    ctx.moveTo(scaleX - (compact ? 23 : 29), pointerY);
    ctx.lineTo(scaleX - (compact ? 31 : 39), pointerY - 5);
    ctx.lineTo(scaleX - (compact ? 31 : 39), pointerY + 5);
    ctx.closePath();
    ctx.fill();

    const massGradient = ctx.createLinearGradient(rigX - objectW / 2, objectY, rigX + objectW / 2, objectY + objectH);
    massGradient.addColorStop(0, "#fef3c7");
    massGradient.addColorStop(1, "#f59e0b");
    ctx.shadowColor = "rgba(245, 158, 11, 0.28)";
    ctx.shadowBlur = compact ? 8 : 14;
    ctx.fillStyle = massGradient;
    ctx.strokeStyle = "rgba(146, 64, 14, 0.34)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(rigX - objectW / 2, objectY, objectW, objectH, 14);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.stroke();
    centerLabel(ctx, `${frNumber(mass, 0)} kg`, rigX, objectY + objectH * 0.45, "#78350f", compact ? 18 : 23);
    centerLabel(ctx, "masse inchangée", rigX, objectY + objectH * 0.73, "#92400e", compact ? 9 : 11);

    arrow(ctx, forceX, forceStartY, forceX, forceEndY, c.danger, compact ? 4 : 5);
    pill(`P = ${frNumber(weight, 0)} N`, rigX + (compact ? 70 : 100), forceStartY + (forceEndY - forceStartY) * 0.56, c.danger, "rgba(254, 242, 242, 0.94)", compact ? 11 : 12);
    if (motionActive) {
      const pulseT = (clock * 1.9) % 1;
      const markerY = forceStartY + (forceEndY - forceStartY) * pulseT;
      ctx.fillStyle = "rgba(239, 68, 68, 0.22)";
      ctx.beginPath();
      ctx.arc(forceX, markerY, compact ? 6 : 8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = "rgba(148, 163, 184, 0.26)";
    ctx.lineWidth = 1.4;
    ctx.setLineDash([5, 6]);
    ctx.beginPath();
    ctx.moveTo(scene.x + 24, scaleBottom);
    ctx.lineTo(scene.x + scene.width - 24, scaleBottom);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    pill(`g = ${frNumber(gravity, 1)} N/kg`, scene.x + scene.width * (compact ? 0.24 : 0.22), scene.y + (compact ? 54 : 56), c.primary, "rgba(239, 246, 255, 0.95)");
    pill(selectedPreset ? selectedPreset.name : "g réglé", scene.x + scene.width * (compact ? 0.76 : 0.68), scene.y + (compact ? 54 : 56), selectedPreset?.color || c.success, "rgba(240, 253, 250, 0.94)");

    const formulaY = side.y + (compact ? 42 : 62);
    centerLabel(ctx, "P = m × g", side.x + side.width / 2, formulaY, c.text, compact ? 18 : 24);
    centerLabel(ctx, `${frNumber(mass, 0)} kg restent ${frNumber(mass, 0)} kg`, side.x + side.width / 2, formulaY + (compact ? 20 : 27), c.muted, compact ? 10 : 12);

    const barsTop = formulaY + (compact ? 42 : 62);
    const barX = side.x + (compact ? 74 : 86);
    const valueX = side.x + side.width - (compact ? 14 : 20);
    const barMaxWidth = Math.max(78, valueX - barX - (compact ? 48 : 62));
    const maxForce = Math.max(1, mass * 24.8);
    presets.forEach((item, index) => {
      const rowY = barsTop + index * (compact ? 29 : 46);
      const force = mass * item.g;
      const active = p.mode === item.name || (!selectedPreset && Math.abs(item.g - gravity) < 0.25);
      const targetWidth = Math.max(8, (force / maxForce) * barMaxWidth);
      const fillWidth = Math.max(8, targetWidth * (active ? barProgress : 0.88));
      ctx.save();
      ctx.fillStyle = active ? item.color : c.muted;
      ctx.font = `900 ${compact ? 10 : 12}px Inter, system-ui, sans-serif`;
      ctx.textAlign = "right";
      ctx.fillText(item.name, barX - 12, rowY + 7);
      ctx.fillStyle = "rgba(148, 163, 184, 0.16)";
      ctx.beginPath();
      ctx.roundRect(barX, rowY - 7, barMaxWidth, 14, 7);
      ctx.fill();
      ctx.fillStyle = active ? item.color : "rgba(100, 116, 139, 0.45)";
      ctx.beginPath();
      ctx.roundRect(barX, rowY - 7, fillWidth, 14, 7);
      ctx.fill();
      if (active) {
        ctx.strokeStyle = `${item.color}66`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(barX - 4, rowY - 11, barMaxWidth + 8, 22, 11);
        ctx.stroke();
      }
      if (active && motionActive) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
        ctx.beginPath();
        ctx.arc(barX + fillWidth, rowY, 4 + 1.8 * ((Math.sin(clock * 5.5) + 1) / 2), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = active ? c.text : c.muted;
      ctx.textAlign = "right";
      ctx.fillText(`${frNumber(force, 0)} N`, valueX, rowY + 7);
      ctx.restore();
    });

    const bottomNote = selectedPreset
      ? selectedPreset.name === "Jupiter"
        ? "Même masse, ressort beaucoup plus étiré"
        : "Même masse, poids différent"
      : `Réglage actuel : ${frNumber(weight, 0)} N`;
    centerLabel(ctx, bottomNote, side.x + side.width / 2, side.y + side.height - (compact ? 24 : 34), selectedPreset ? c.muted : c.success, compact ? 10 : 12);

    setContextMetrics([
      `${frNumber(mass, 0)} kg`,
      `${frNumber(gravity, 1)} N/kg`,
      `${frNumber(weight, 0)} N`,
      "m fixe, P varie",
    ]);
    setReadout(`Poids vs masse : la masse reste ${frNumber(mass, 0)} kg. Le dynamomètre mesure P = m × g = ${frNumber(weight, 0)} N ; plus g augmente, plus le ressort et le vecteur P s'allongent.`);
  }

  function drawOhm(ctx, w, h, p) {
    const c = colors();
    const compact = w < 720;
    const resistance = Math.max(1, p.a);
    const intensity = p.b / 1000;
    const voltage = p.a * intensity;
    const mode = p.mode || "Point de mesure";
    const isCircuit = mode === "Circuit";
    const graphBox = compact
      ? { x: 18, y: isCircuit ? h * 0.54 : 24, width: w - 36, height: isCircuit ? h * 0.4 : h - 48 }
      : { x: isCircuit ? w * 0.52 : 30, y: 30, width: isCircuit ? w * 0.44 : w - 60, height: h - 60 };
    const circuitBox = compact
      ? { x: 18, y: 22, width: w - 36, height: h * 0.47 }
      : { x: 30, y: 30, width: w * 0.46, height: h - 60 };

    function panel(box, title) {
      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 0.84)";
      ctx.strokeStyle = "rgba(148, 163, 184, 0.22)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(box.x, box.y, box.width, box.height, 18);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = c.text;
      ctx.font = "900 13px Inter, system-ui, sans-serif";
      ctx.fillText(title, box.x + 16, box.y + 25);
      ctx.restore();
    }

    function pill(text, x, y, color, bg = "rgba(255,255,255,0.9)") {
      ctx.save();
      ctx.font = "900 12px Inter, system-ui, sans-serif";
      const width = ctx.measureText(text).width + 18;
      ctx.fillStyle = bg;
      ctx.strokeStyle = `${color}44`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x - width / 2, y - 13, width, 26, 9);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, x, y + 1);
      ctx.restore();
    }

    function drawGraph(box, detailed = true) {
      panel(box, "Caractéristique U = f(I)");
      const pad = {
        l: compact ? 42 : 58,
        r: compact ? 18 : 26,
        t: compact ? 48 : 56,
        b: compact ? 42 : 54,
      };
      const gx = box.x + pad.l;
      const gy = box.y + pad.t;
      const gw = box.width - pad.l - pad.r;
      const gh = box.height - pad.t - pad.b;
      const maxI = 200;
      const maxU = 100;

      ctx.save();
      ctx.strokeStyle = "rgba(148, 163, 184, 0.22)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i <= 5; i += 1) {
        const y = gy + (gh * i) / 5;
        ctx.moveTo(gx, y);
        ctx.lineTo(gx + gw, y);
      }
      for (let i = 0; i <= 4; i += 1) {
        const x = gx + (gw * i) / 4;
        ctx.moveTo(x, gy);
        ctx.lineTo(x, gy + gh);
      }
      ctx.stroke();

      ctx.strokeStyle = c.text;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx, gy + gh);
      ctx.lineTo(gx + gw, gy + gh);
      ctx.stroke();
      ctx.fillStyle = c.muted;
      ctx.font = "800 11px Inter, system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("U (V)", gx + 8, gy + 14);
      ctx.fillText("I (mA)", gx + gw - 38, gy + gh + 32);
      ctx.textAlign = "right";
      ctx.fillText("0", gx - 8, gy + gh + 16);
      ctx.fillText("100", gx - 8, gy + 4);
      ctx.textAlign = "center";
      ctx.fillText("200", gx + gw, gy + gh + 16);

      const maxLineI = Math.min(maxI, (maxU / resistance) * 1000);
      const lineX = gx + (maxLineI / maxI) * gw;
      const lineY = gy + gh - ((resistance * (maxLineI / 1000)) / maxU) * gh;
      ctx.strokeStyle = c.primary;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(gx, gy + gh);
      ctx.lineTo(lineX, lineY);
      ctx.stroke();

      const pointX = gx + (p.b / maxI) * gw;
      const pointY = gy + gh - Math.min(1, voltage / maxU) * gh;
      if (detailed) {
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = "rgba(239, 68, 68, 0.5)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(pointX, pointY);
        ctx.lineTo(pointX, gy + gh);
        ctx.moveTo(pointX, pointY);
        ctx.lineTo(gx, pointY);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.fillStyle = c.danger;
      ctx.beginPath();
      ctx.arc(pointX, pointY, compact ? 6 : 7, 0, Math.PI * 2);
      ctx.fill();
      const pulseRadius = (compact ? 10 : 12) + 4 * ((Math.sin(clock * 4) + 1) / 2);
      ctx.strokeStyle = "rgba(239, 68, 68, 0.24)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pointX, pointY, pulseRadius, 0, Math.PI * 2);
      ctx.stroke();
      if (!compact || !isCircuit) {
        pill(`${frNumber(voltage, 1)} V`, Math.min(gx + gw - 42, pointX + 58), Math.max(gy + 18, pointY - 18), c.danger, "rgba(254, 242, 242, 0.92)");
        pill(`${frNumber(p.b, 0)} mA`, pointX, gy + gh + (compact ? 22 : 28), c.primary, "rgba(239, 246, 255, 0.94)");
      }
      ctx.restore();
    }

    function drawCircuit(box) {
      panel(box, "Circuit de mesure");
      const left = box.x + box.width * 0.18;
      const right = box.x + box.width * 0.82;
      const top = box.y + box.height * (compact ? 0.34 : 0.3);
      const bottom = box.y + box.height * (compact ? 0.72 : 0.74);
      const midX = (left + right) / 2;

      ctx.save();
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = compact ? 3 : 4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(left, top);
      ctx.lineTo(left, bottom);
      ctx.lineTo(midX - 42, bottom);
      ctx.moveTo(midX + 42, bottom);
      ctx.lineTo(right, bottom);
      ctx.lineTo(right, top);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(left, top);
      ctx.lineTo(midX - 58, top);
      ctx.moveTo(midX + 58, top);
      ctx.lineTo(right, top);
      ctx.stroke();

      ctx.strokeStyle = c.warning;
      ctx.lineWidth = 3;
      ctx.beginPath();
      const resistorY = top;
      const startX = midX - 58;
      const step = 116 / 8;
      ctx.moveTo(startX, resistorY);
      for (let i = 1; i <= 8; i += 1) {
        ctx.lineTo(startX + step * i, resistorY + (i % 2 === 0 ? 0 : (compact ? -12 : -16)));
      }
      ctx.stroke();
      pill(`R = ${frNumber(resistance, 0)} Ω`, midX, top - (compact ? 28 : 36), c.warning, "rgba(255, 251, 235, 0.94)");

      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(left - 16, (top + bottom) / 2 - 28);
      ctx.lineTo(left + 16, (top + bottom) / 2 - 28);
      ctx.moveTo(left - 9, (top + bottom) / 2 + 20);
      ctx.lineTo(left + 9, (top + bottom) / 2 + 20);
      ctx.stroke();
      centerLabel(ctx, "G", left, (top + bottom) / 2 + 50, c.text, 12);

      ctx.fillStyle = "rgba(14, 165, 233, 0.1)";
      ctx.strokeStyle = c.primary;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(midX, bottom, compact ? 27 : 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      centerLabel(ctx, "A", midX, bottom + 5, c.primary, compact ? 18 : 22);
      pill(`I = ${frNumber(p.b, 0)} mA`, midX, bottom + (compact ? 42 : 54), c.primary, "rgba(239, 246, 255, 0.94)");

      const voltY = top + (compact ? 46 : 62);
      ctx.strokeStyle = "rgba(100, 116, 139, 0.7)";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(midX - 58, top);
      ctx.lineTo(midX - 58, voltY);
      ctx.lineTo(midX - 32, voltY);
      ctx.moveTo(midX + 58, top);
      ctx.lineTo(midX + 58, voltY);
      ctx.lineTo(midX + 32, voltY);
      ctx.stroke();
      ctx.fillStyle = "rgba(239, 68, 68, 0.08)";
      ctx.strokeStyle = c.danger;
      ctx.beginPath();
      ctx.arc(midX, voltY, compact ? 24 : 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      centerLabel(ctx, "V", midX, voltY + 5, c.danger, compact ? 17 : 21);
      pill(`U = ${frNumber(voltage, 1)} V`, midX, voltY + (compact ? 36 : 44), c.danger, "rgba(254, 242, 242, 0.94)");

      arrow(ctx, left + 22, bottom, left + 72, bottom, c.success, 2.5);
      arrow(ctx, right, bottom - 20, right, bottom - 70, c.success, 2.5);
      const particleCount = compact ? 5 : 7;
      const path = [
        [left, bottom],
        [midX - 42, bottom],
        [midX + 42, bottom],
        [right, bottom],
        [right, top],
        [midX + 58, top],
        [midX - 58, top],
        [left, top],
        [left, bottom],
      ];
      const segments = path.slice(1).map((point, index) => {
        const start = path[index];
        return { start, end: point, length: Math.hypot(point[0] - start[0], point[1] - start[1]) };
      });
      const totalLength = segments.reduce((sum, segment) => sum + segment.length, 0);
      for (let i = 0; i < particleCount; i += 1) {
        let distance = ((clock * (38 + p.b * 0.28) + (i / particleCount) * totalLength) % totalLength + totalLength) % totalLength;
        const segment = segments.find((item) => {
          if (distance <= item.length) return true;
          distance -= item.length;
          return false;
        }) || segments[0];
        const ratio = segment.length ? distance / segment.length : 0;
        const x = segment.start[0] + (segment.end[0] - segment.start[0]) * ratio;
        const y = segment.start[1] + (segment.end[1] - segment.start[1]) * ratio;
        ctx.fillStyle = "rgba(16, 185, 129, 0.82)";
        ctx.beginPath();
        ctx.arc(x, y, compact ? 3 : 4, 0, Math.PI * 2);
        ctx.fill();
      }
      centerLabel(ctx, "sens conventionnel du courant", midX, box.y + box.height - 18, c.success, compact ? 10 : 11);
      ctx.restore();
    }

    if (isCircuit) {
      drawCircuit(circuitBox);
      drawGraph(graphBox, false);
    } else {
      drawGraph(graphBox, true);
      if (!compact && mode !== "Droite U=f(I)") {
        const badgeX = graphBox.x + graphBox.width - 180;
        const badgeY = graphBox.y + 74;
        pill(`U = ${frNumber(resistance, 0)} × I`, badgeX, badgeY, c.text);
        centerLabel(ctx, "la pente de la droite vaut R", badgeX, badgeY + 32, c.muted, 12);
      }
    }

    setContextMetrics([
      `${frNumber(resistance, 0)} Ω`,
      `${frNumber(p.b, 0)} mA`,
      `${frNumber(voltage, 1)} V`,
      "U = R × I",
    ]);
    setReadout(`Loi d'Ohm : I = ${frNumber(p.b, 0)} mA = ${frNumber(intensity, 3)} A, donc U = R × I = ${frNumber(resistance, 0)} Ω × ${frNumber(intensity, 3)} A = ${frNumber(voltage, 1)} V.`);
  }

  function drawPower(ctx, w, h, p) {
    const c = colors();
    const compact = w < 720;
    const power = Math.max(0, p.a);
    const minutes = Math.max(0, p.b);
    const energyWh = (power * minutes) / 60;
    const energyKWh = energyWh / 1000;
    const maxEnergyWh = 4000;
    const fill = Math.min(1, energyWh / maxEnergyWh);
    const powerFill = Math.min(1, power / 2000);
    const appliance = p.mode || "Lampe";
    const scene = compact
      ? { x: 18, y: 18, width: w - 36, height: h * 0.46 }
      : { x: 28, y: 28, width: w * 0.48, height: h - 56 };
    const side = compact
      ? { x: 18, y: scene.y + scene.height + 12, width: w - 36, height: h - scene.y - scene.height - 30 }
      : { x: scene.x + scene.width + 22, y: 28, width: w - scene.x - scene.width - 50, height: h - 56 };

    function panel(box, title) {
      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 0.84)";
      ctx.strokeStyle = "rgba(148, 163, 184, 0.24)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(box.x, box.y, box.width, box.height, 18);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = c.text;
      ctx.font = "900 13px Inter, system-ui, sans-serif";
      ctx.fillText(title, box.x + 16, box.y + 26);
      ctx.restore();
    }

    function pill(text, x, y, color, bg = "rgba(255,255,255,0.9)") {
      ctx.save();
      ctx.font = "900 12px Inter, system-ui, sans-serif";
      const width = ctx.measureText(text).width + 18;
      ctx.fillStyle = bg;
      ctx.strokeStyle = `${color}44`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x - width / 2, y - 13, width, 26, 9);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, x, y + 1);
      ctx.restore();
    }

    function drawAppliance(cx, cy) {
      ctx.save();
      ctx.strokeStyle = c.text;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (appliance === "Bouilloire") {
        ctx.fillStyle = "rgba(14, 165, 233, 0.12)";
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = compact ? 3 : 4;
        ctx.beginPath();
        ctx.roundRect(cx - 46, cy - 28, 76, 72, 14);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + 30, cy + 6, 28, -1.15, 1.1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 40, cy - 28);
        ctx.lineTo(cx - 62, cy - 44);
        ctx.lineTo(cx + 4, cy - 44);
        ctx.stroke();
      } else if (appliance === "Radiateur") {
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = compact ? 5 : 7;
        for (let i = -2; i <= 2; i += 1) {
          ctx.beginPath();
          ctx.moveTo(cx + i * 22, cy - 44);
          ctx.lineTo(cx + i * 22, cy + 46);
          ctx.stroke();
        }
        ctx.strokeStyle = c.danger;
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i += 1) {
          const x = cx - 42 + i * 42;
          ctx.beginPath();
          ctx.moveTo(x, cy - 60);
          ctx.bezierCurveTo(x + 12, cy - 70, x - 8, cy - 78, x + 6, cy - 88);
          ctx.stroke();
        }
      } else {
        const glowPulse = 0.75 + 0.25 * ((Math.sin(clock * (2.4 + powerFill * 2)) + 1) / 2);
        const glow = ctx.createRadialGradient(cx, cy - 10, 8, cx, cy - 10, 70);
        glow.addColorStop(0, `rgba(250, 204, 21, ${(0.18 + powerFill * 0.35) * glowPulse})`);
        glow.addColorStop(1, "rgba(250, 204, 21, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy - 10, 70, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = compact ? 3 : 4;
        ctx.beginPath();
        ctx.arc(cx, cy - 18, 30, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, cy + 12);
        ctx.lineTo(cx, cy + 54);
        ctx.moveTo(cx - 32, cy + 54);
        ctx.lineTo(cx + 32, cy + 54);
        ctx.stroke();
      }
      ctx.restore();
    }

    panel(scene, "Appareil en fonctionnement");
    panel(side, "Énergie transférée");
    drawAppliance(scene.x + scene.width * 0.5, scene.y + scene.height * 0.47);
    pill(`${frNumber(power, 0)} W`, scene.x + scene.width * 0.32, scene.y + 58, c.primary, "rgba(239, 246, 255, 0.94)");
    pill(`${frNumber(minutes, 0)} min`, scene.x + scene.width * 0.68, scene.y + 58, c.success, "rgba(240, 253, 250, 0.94)");

    const wireY = scene.y + scene.height - 46;
    ctx.save();
    ctx.strokeStyle = "rgba(79, 70, 229, 0.28)";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(scene.x + 42, wireY);
    ctx.lineTo(scene.x + scene.width - 42, wireY);
    ctx.stroke();
    for (let i = 0; i < 7; i += 1) {
      const t = ((clock * (0.4 + powerFill * 1.4) + i / 7) % 1 + 1) % 1;
      const x = scene.x + 42 + t * (scene.width - 84);
      const pulse = Math.sin(t * Math.PI);
      ctx.fillStyle = `rgba(79, 70, 229, ${0.32 + pulse * 0.55})`;
      ctx.beginPath();
      ctx.arc(x, wireY, 3 + pulse * 3 + powerFill * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    centerLabel(ctx, "plus P est grande, plus le transfert est rapide", scene.x + scene.width / 2, wireY + 26, c.muted, compact ? 10 : 12);

    const tankX = side.x + side.width * 0.18;
    const tankY = side.y + (compact ? 78 : 96);
    const tankW = side.width * 0.64;
    const tankH = compact ? 72 : 150;
    ctx.save();
    ctx.fillStyle = "rgba(148, 163, 184, 0.12)";
    ctx.strokeStyle = "rgba(100, 116, 139, 0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(tankX, tankY, tankW, tankH, 16);
    ctx.fill();
    ctx.stroke();
    const fillHeight = Math.max(4, tankH * fill);
    const grad = ctx.createLinearGradient(tankX, tankY + tankH, tankX + tankW, tankY);
    grad.addColorStop(0, "#10b981");
    grad.addColorStop(1, "#4f46e5");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(tankX + 6, tankY + tankH - fillHeight + 6, tankW - 12, Math.max(4, fillHeight - 12), 12);
    ctx.fill();
    centerLabel(ctx, `${frNumber(energyWh, 0)} Wh`, tankX + tankW / 2, tankY + tankH / 2 - (compact ? 2 : 4), c.text, compact ? 16 : 24);
    centerLabel(ctx, `${frNumber(energyKWh, 2)} kWh`, tankX + tankW / 2, tankY + tankH / 2 + (compact ? 17 : 26), c.muted, compact ? 10 : 13);
    ctx.restore();

    const formulaY = compact ? side.y + 54 : side.y + side.height - 72;
    centerLabel(ctx, "E = P × t", side.x + side.width / 2, formulaY, c.text, compact ? 20 : 28);
    const helperY = compact ? tankY + tankH + 18 : formulaY + 30;
    centerLabel(ctx, "temps en heures pour obtenir des Wh", side.x + side.width / 2, helperY, c.muted, compact ? 9 : 12);

    setContextMetrics([
      `${frNumber(power, 0)} W`,
      `${frNumber(minutes, 0)} min`,
      `${frNumber(energyWh, 0)} Wh`,
      appliance,
    ]);
    setReadout(`Puissance et énergie : ${frNumber(power, 0)} W pendant ${frNumber(minutes, 0)} min transfèrent ${frNumber(energyWh, 0)} Wh. La puissance règle le débit, la durée règle l'accumulation.`);
  }

  function drawThermal(ctx, w, h, p) {
    const c = colors();
    const hot = p.a;
    const cold = p.b;
    const compact = w < 720;
    const mode = p.mode || "Deux corps";
    const delta = Math.abs(hot - cold);
    const leftIsHot = hot >= cold;
    const transferStrength = mode === "Isolation" ? 0.22 : Math.min(1, delta / 80);
    const equilibrium = (hot + cold) / 2;
    const scene = { x: 18, y: 18, width: w - 36, height: h - 36 };
    const top = compact
      ? { x: scene.x + 18, y: scene.y + 58, width: scene.width - 36, height: scene.height * 0.34 }
      : { x: scene.x + 26, y: scene.y + 78, width: scene.width * 0.36, height: scene.height * 0.55 };
    const bottom = compact
      ? { x: scene.x + 18, y: top.y + top.height + 82, width: scene.width - 36, height: scene.height * 0.34 }
      : { x: scene.x + scene.width * 0.6, y: top.y, width: scene.width * 0.36, height: top.height };

    function panel(box, title) {
      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 0.84)";
      ctx.strokeStyle = "rgba(148, 163, 184, 0.24)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(box.x, box.y, box.width, box.height, 18);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = c.text;
      ctx.font = "900 13px Inter, system-ui, sans-serif";
      ctx.fillText(title, box.x + 16, box.y + 26);
      ctx.restore();
    }

    function tempColor(temp) {
      const t = Math.max(0, Math.min(1, (temp - 0) / 100));
      return `rgba(${Math.round(59 + t * 180)}, ${Math.round(130 - t * 62)}, ${Math.round(246 - t * 190)}, 0.22)`;
    }

    function drawBody(box, title, temp, hotSide) {
      panel(box, title);
      ctx.save();
      ctx.fillStyle = tempColor(temp);
      ctx.strokeStyle = hotSide ? "rgba(239, 68, 68, 0.5)" : "rgba(59, 130, 246, 0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(box.x + box.width * 0.17, box.y + box.height * 0.28, box.width * 0.66, box.height * 0.42, 16);
      ctx.fill();
      ctx.stroke();
      centerLabel(ctx, `${frNumber(temp, 0)} °C`, box.x + box.width / 2, box.y + box.height * 0.5, hotSide ? c.danger : c.primary, compact ? 22 : 28);
      centerLabel(ctx, hotSide ? "corps chaud" : "corps froid", box.x + box.width / 2, box.y + box.height * 0.7 + 18, c.muted, compact ? 11 : 13);
      const thermoX = box.x + box.width * 0.1;
      const thermoY = box.y + box.height * 0.28;
      const thermoH = box.height * 0.44;
      ctx.strokeStyle = "rgba(100, 116, 139, 0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(thermoX, thermoY, 12, thermoH, 6);
      ctx.stroke();
      ctx.fillStyle = hotSide ? c.danger : c.primary;
      ctx.fillRect(thermoX + 3, thermoY + thermoH * (1 - Math.min(1, temp / 100)), 6, thermoH * Math.min(1, temp / 100));
      ctx.restore();
    }

    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.66)";
    ctx.strokeStyle = "rgba(148, 163, 184, 0.22)";
    ctx.beginPath();
    ctx.roundRect(scene.x, scene.y, scene.width, scene.height, 22);
    ctx.fill();
    ctx.stroke();
    centerLabel(ctx, mode === "Isolation" ? "Isolation : transfert fortement limité" : "Contact thermique", scene.x + scene.width / 2, scene.y + 34, c.text, compact ? 16 : 20);
    ctx.restore();

    drawBody(top, leftIsHot ? "Source chaude" : "Corps froid", hot, leftIsHot);
    drawBody(bottom, leftIsHot ? "Corps froid" : "Source chaude", cold, !leftIsHot);

    const startX = compact ? top.x + top.width / 2 : (leftIsHot ? top.x + top.width : bottom.x);
    const startY = compact ? top.y + top.height + 16 : top.y + top.height / 2;
    const endX = compact ? bottom.x + bottom.width / 2 : (leftIsHot ? bottom.x : top.x + top.width);
    const endY = compact ? bottom.y - 16 : bottom.y + bottom.height / 2;
    ctx.save();
    ctx.strokeStyle = mode === "Isolation" ? "rgba(100, 116, 139, 0.45)" : c.warning;
    ctx.lineWidth = 4 + 8 * transferStrength;
    ctx.lineCap = "round";
    arrow(ctx, startX, startY, endX, endY, ctx.strokeStyle, ctx.lineWidth);
    const pulses = compact ? 4 : 6;
    for (let i = 0; i < pulses; i += 1) {
      const t = ((clock * (0.35 + transferStrength) + i / pulses) % 1 + 1) % 1;
      const x = startX + (endX - startX) * t;
      const y = startY + (endY - startY) * t;
      ctx.fillStyle = mode === "Isolation" ? "rgba(100, 116, 139, 0.35)" : "rgba(249, 115, 22, 0.76)";
      ctx.beginPath();
      ctx.arc(x, y, 4 + 4 * transferStrength, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    if (mode === "Isolation") {
      const wallX = compact ? scene.x + scene.width / 2 : scene.x + scene.width / 2;
      const wallY = compact ? top.y + top.height + 30 : top.y - 8;
      const wallH = compact ? 48 : top.height + 16;
      ctx.save();
      ctx.strokeStyle = "rgba(100, 116, 139, 0.55)";
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(wallX, wallY);
      ctx.lineTo(wallX, wallY + wallH);
      ctx.stroke();
      ctx.setLineDash([]);
      centerLabel(ctx, "isolant", wallX, wallY + wallH + 18, c.muted, 12);
      ctx.restore();
    }

    const eqText = mode === "Eau + métal"
      ? "équilibre entre les deux températures"
      : mode === "Isolation"
        ? "équilibre très lent"
        : `équilibre ≈ ${frNumber(equilibrium, 0)} °C`;
    centerLabel(ctx, eqText, scene.x + scene.width / 2, scene.y + scene.height - 28, c.text, compact ? 13 : 16);
    const direction = delta < 1 ? "pas de transfert net" : leftIsHot ? "chaud → froid" : "froid initial plus chaud";
    setContextMetrics([
      `${frNumber(delta, 0)} °C`,
      direction,
      mode === "Deux corps" ? `${frNumber(equilibrium, 0)} °C` : "qualitatif",
      mode,
    ]);
    setReadout(`Bilan thermique : le transfert va du plus chaud vers le plus froid. ${mode === "Isolation" ? "Avec une isolation, il est fortement ralenti." : "Au contact, les températures tendent vers un équilibre."}`);
  }

  function drawTitration(ctx, w, h, p, conductimetric = false) {
    const c = colors();
    const compact = w < 720;
    const volume = Math.max(0, p.a);
    const equivalence = Math.max(0.1, p.b);
    const mode = p.mode || (conductimetric ? "Intersection" : "Acide fort/base forte");
    const maxVolume = Number(inputA.max) || 30;
    const volumeRatio = Math.max(0, Math.min(1, volume / maxVolume));
    const titrationRunning = !reducedMotion && !isPaused;
    const scene = compact
      ? { x: 18, y: 16, width: w - 36, height: h * 0.39 }
      : { x: 26, y: 24, width: w * 0.42, height: h - 48 };
    const graph = compact
      ? { x: 18, y: scene.y + scene.height + 12, width: w - 36, height: h - scene.y - scene.height - 30 }
      : { x: scene.x + scene.width + 22, y: 24, width: w - scene.x - scene.width - 48, height: h - 48 };

    function panel(box, title) {
      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 0.84)";
      ctx.strokeStyle = "rgba(148, 163, 184, 0.24)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(box.x, box.y, box.width, box.height, 18);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = c.text;
      ctx.font = "900 13px Inter, system-ui, sans-serif";
      ctx.fillText(title, box.x + 16, box.y + 26);
      ctx.restore();
    }

    function pill(text, x, y, color, bg = "rgba(255,255,255,0.92)") {
      ctx.save();
      ctx.font = "900 12px Inter, system-ui, sans-serif";
      const width = ctx.measureText(text).width + 18;
      ctx.fillStyle = bg;
      ctx.strokeStyle = `${color}44`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x - width / 2, y - 13, width, 26, 9);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, x, y + 1);
      ctx.restore();
    }

    function pHAt(v) {
      const sharpness = mode === "Acide faible/base forte" ? 0.62 : 0.98;
      const low = mode === "Acide faible/base forte" ? 3.2 : 1.8;
      const amplitude = mode === "Acide faible/base forte" ? 8.2 : 11.2;
      const drift = mode === "Acide faible/base forte" ? Math.min(1.1, v * 0.035) : 0;
      return Math.max(0, Math.min(14, low + amplitude / (1 + Math.exp(-(v - equivalence) * sharpness)) + drift));
    }

    function sigmaAt(v) {
      if (v <= equivalence) return 0.78 - (v / equivalence) * 0.34;
      return 0.44 + ((v - equivalence) / Math.max(0.5, 30 - equivalence)) * 0.42;
    }

    const reading = conductimetric ? sigmaAt(volume) : pHAt(volume);
    const nearEq = Math.abs(volume - equivalence) <= 0.6;
    const stateText = nearEq ? "équivalence" : volume < equivalence ? "avant équiv." : "après équiv.";

    function drawExperiment() {
      panel(scene, conductimetric ? "Montage conductimétrique" : "Montage pH-métrique");
      const cx = scene.x + scene.width * 0.5;
      const beakerY = scene.y + scene.height * (compact ? 0.46 : 0.5);
      const beakerW = scene.width * (compact ? 0.52 : 0.58);
      const beakerH = scene.height * (compact ? 0.34 : 0.32);
      const buretteX = scene.x + scene.width * 0.28;
      const topY = scene.y + 44;
      const solutionColor = conductimetric
        ? "rgba(14, 165, 233, 0.24)"
        : reading < 6
          ? "rgba(248, 113, 113, 0.22)"
          : reading < 8
            ? "rgba(250, 204, 21, 0.20)"
            : "rgba(96, 165, 250, 0.22)";

      ctx.save();
      ctx.strokeStyle = "rgba(30, 41, 59, 0.7)";
      ctx.lineWidth = compact ? 2 : 3;
      ctx.beginPath();
      ctx.roundRect(buretteX - 7, topY, 14, scene.height * 0.48, 7);
      ctx.stroke();
      for (let i = 1; i <= 4; i += 1) {
        const tickY = topY + 8 + (scene.height * 0.48 - 16) * (i / 5);
        ctx.strokeStyle = "rgba(100, 116, 139, 0.42)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(buretteX + 7, tickY);
        ctx.lineTo(buretteX + 14, tickY);
        ctx.stroke();
      }
      const buretteInnerH = scene.height * 0.48 - 16;
      const reagentH = Math.max(2, buretteInnerH * (1 - volumeRatio));
      ctx.fillStyle = "rgba(59, 130, 246, 0.22)";
      ctx.fillRect(buretteX - 5, topY + 8 + buretteInnerH - reagentH, 10, reagentH);
      ctx.strokeStyle = c.primary;
      ctx.beginPath();
      ctx.moveTo(buretteX - 13, topY + scene.height * 0.48);
      ctx.lineTo(buretteX + 13, topY + scene.height * 0.48);
      ctx.stroke();
      centerLabel(ctx, "burette", buretteX, topY - 8, c.muted, compact ? 9 : 10);
      if (titrationRunning && volume < maxVolume) {
        const dropY = topY + scene.height * 0.52 + ((clock * 90) % Math.max(18, beakerY - topY - scene.height * 0.52));
        ctx.fillStyle = c.primary;
        ctx.beginPath();
        ctx.arc(buretteX, dropY, compact ? 3 : 4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = solutionColor;
      ctx.strokeStyle = "rgba(30, 41, 59, 0.35)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(cx - beakerW / 2, beakerY, beakerW, beakerH, 14);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "rgba(30, 41, 59, 0.35)";
      ctx.beginPath();
      ctx.moveTo(cx - beakerW / 2 + 8, beakerY + beakerH * 0.28);
      ctx.lineTo(cx + beakerW / 2 - 8, beakerY + beakerH * 0.28);
      ctx.stroke();
      if (titrationRunning) {
        ctx.strokeStyle = "rgba(79, 70, 229, 0.42)";
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i += 1) {
          const radius = 10 + ((clock * 20 + i * 16) % Math.max(16, beakerW * 0.32));
          ctx.beginPath();
          ctx.ellipse(cx, beakerY + beakerH * 0.55, radius, radius * 0.26, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      if (conductimetric) {
        const probeX = cx + beakerW * 0.28;
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(probeX - 8, beakerY - 28);
        ctx.lineTo(probeX - 8, beakerY + beakerH * 0.62);
        ctx.moveTo(probeX + 8, beakerY - 28);
        ctx.lineTo(probeX + 8, beakerY + beakerH * 0.62);
        ctx.stroke();
        pill(`σ = ${frNumber(reading, 2)}`, scene.x + scene.width * 0.68, scene.y + 58, c.success, "rgba(240, 253, 250, 0.94)");
      } else {
        const probeX = cx + beakerW * 0.28;
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(probeX, beakerY - 36);
        ctx.lineTo(probeX, beakerY + beakerH * 0.68);
        ctx.stroke();
        pill(`pH = ${frNumber(reading, 1)}`, scene.x + scene.width * 0.68, scene.y + 58, c.primary, "rgba(239, 246, 255, 0.94)");
      }

      pill(`V = ${frNumber(volume, 1)} mL`, scene.x + scene.width * 0.31, scene.y + scene.height - 28, c.primary, "rgba(239, 246, 255, 0.94)");
      pill(`Veq = ${frNumber(equivalence, 1)} mL`, scene.x + scene.width * 0.7, scene.y + scene.height - 28, c.warning, "rgba(255, 251, 235, 0.95)");
      ctx.restore();
    }

    function drawGraph() {
      panel(graph, conductimetric ? "Lecture : rupture de pente" : "Lecture : saut de pH");
      const pad = {
        l: compact ? 40 : 52,
        r: compact ? 18 : 24,
        t: compact ? 48 : 58,
        b: compact ? 38 : 48,
      };
      const gx = graph.x + pad.l;
      const gy = graph.y + pad.t;
      const gw = graph.width - pad.l - pad.r;
      const gh = graph.height - pad.t - pad.b;
      const mapX = (v) => gx + (v / 30) * gw;
      const mapY = (value) => conductimetric
        ? gy + gh - Math.max(0, Math.min(1, value)) * gh
        : gy + gh - (Math.max(0, Math.min(14, value)) / 14) * gh;

      ctx.save();
      ctx.strokeStyle = "rgba(148, 163, 184, 0.22)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i <= 5; i += 1) {
        const y = gy + (i / 5) * gh;
        ctx.moveTo(gx, y);
        ctx.lineTo(gx + gw, y);
      }
      for (let i = 0; i <= 6; i += 1) {
        const x = gx + (i / 6) * gw;
        ctx.moveTo(x, gy);
        ctx.lineTo(x, gy + gh);
      }
      ctx.stroke();
      ctx.strokeStyle = c.text;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx, gy + gh);
      ctx.lineTo(gx + gw, gy + gh);
      ctx.stroke();
      ctx.fillStyle = c.muted;
      ctx.font = "800 11px Inter, system-ui, sans-serif";
      ctx.fillText(conductimetric ? "σ relative" : "pH", gx + 8, gy + 14);
      ctx.textAlign = "right";
      ctx.fillText("V (mL)", gx + gw, gy + gh + 30);
      ctx.textAlign = "left";

      const eqX = mapX(equivalence);
      ctx.fillStyle = "rgba(245, 158, 11, 0.08)";
      ctx.fillRect(eqX - 9, gy, 18, gh);
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = c.warning;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(eqX, gy);
      ctx.lineTo(eqX, gy + gh);
      ctx.stroke();
      ctx.setLineDash([]);

      if (conductimetric) {
        const beforeEnd = Math.min(equivalence, 30);
        ctx.strokeStyle = "rgba(100, 116, 139, 0.28)";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(mapX(0), mapY(sigmaAt(0)));
        ctx.lineTo(mapX(beforeEnd), mapY(sigmaAt(beforeEnd)));
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mapX(equivalence), mapY(sigmaAt(equivalence)));
        ctx.lineTo(mapX(30), mapY(sigmaAt(30)));
        ctx.stroke();
        if (volume > 0) {
          const vBefore = Math.min(volume, equivalence);
          ctx.strokeStyle = mode === "Après équivalence" ? "rgba(100, 116, 139, 0.46)" : c.primary;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(mapX(0), mapY(sigmaAt(0)));
          ctx.lineTo(mapX(vBefore), mapY(sigmaAt(vBefore)));
          ctx.stroke();
        }
        if (volume > equivalence) {
          const vAfter = Math.min(volume, 30);
          ctx.strokeStyle = mode === "Avant équivalence" ? "rgba(100, 116, 139, 0.46)" : c.success;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(mapX(equivalence), mapY(sigmaAt(equivalence)));
          ctx.lineTo(mapX(vAfter), mapY(sigmaAt(vAfter)));
          ctx.stroke();
        }
      } else {
        ctx.strokeStyle = "rgba(100, 116, 139, 0.22)";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        for (let i = 0; i <= 220; i += 1) {
          const v = (i / 220) * 30;
          const x = mapX(v);
          const y = mapY(pHAt(v));
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        if (volume > 0) {
          const steps = Math.max(2, Math.ceil(220 * Math.min(1, volume / 30)));
          ctx.strokeStyle = c.primary;
          ctx.lineWidth = 4;
          ctx.beginPath();
          for (let i = 0; i <= steps; i += 1) {
            const v = (i / steps) * Math.min(volume, 30);
            const x = mapX(v);
            const y = mapY(pHAt(v));
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        if (mode === "Lecture graphique") {
          ctx.strokeStyle = "rgba(239, 68, 68, 0.5)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(eqX - gw * 0.12, mapY(pHAt(equivalence - 1.2)));
          ctx.lineTo(eqX + gw * 0.12, mapY(pHAt(equivalence + 1.2)));
          ctx.stroke();
        }
      }

      const pointX = mapX(volume);
      const pointY = mapY(reading);
      ctx.setLineDash([4, 5]);
      ctx.strokeStyle = "rgba(239, 68, 68, 0.45)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(pointX, pointY);
      ctx.lineTo(pointX, gy + gh);
      ctx.moveTo(pointX, pointY);
      ctx.lineTo(gx, pointY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = c.danger;
      ctx.beginPath();
      ctx.arc(pointX, pointY, compact ? 5 : 7, 0, Math.PI * 2);
      ctx.fill();
      pill(nearEq ? "équivalence" : stateText, Math.min(gx + gw - 52, pointX + 58), Math.max(gy + 18, pointY - 20), nearEq ? c.warning : c.danger);
      ctx.restore();
    }

    drawExperiment();
    drawGraph();
    setContextMetrics([
      `${frNumber(volume, 1)} mL`,
      `${frNumber(equivalence, 1)} mL`,
      conductimetric ? `${frNumber(reading, 2)}` : `${frNumber(reading, 1)}`,
      stateText,
    ]);
    const actionText = titrationRunning
      ? "Le titrage avance : observe le point qui se déplace."
      : volume >= maxVolume
        ? "Titrage terminé : réinitialise pour recommencer."
        : volume > 0
          ? "Titrage en pause : clique sur Titrer pour continuer."
          : "Clique sur Titrer pour faire avancer le volume.";
    setReadout(conductimetric
      ? `${actionText} L'équivalence se lit à la rupture de pente, autour de ${frNumber(equivalence, 1)} mL.`
      : `${actionText} L'équivalence se lit au milieu du saut de pH, autour de ${frNumber(equivalence, 1)} mL.`);
  }

  function drawIons(ctx, w, h, p) {
    const c = colors();
    const compact = w < 720;
    const ion = p.mode || "Cu²⁺";
    const tests = {
      "Cu²⁺": { reagent: "soude", formula: "NaOH", observation: "précipité bleu", precip: "#3b82f6", solution: "rgba(59, 130, 246, 0.22)", conclusion: "ion cuivre II" },
      "Fe²⁺": { reagent: "soude", formula: "NaOH", observation: "précipité vert", precip: "#16a34a", solution: "rgba(34, 197, 94, 0.18)", conclusion: "ion fer II" },
      "Cl⁻": { reagent: "nitrate d'argent", formula: "AgNO₃", observation: "précipité blanc", precip: "#f8fafc", solution: "rgba(226, 232, 240, 0.24)", conclusion: "ion chlorure" },
    };
    const test = tests[ion] || tests["Cu²⁺"];
    const strength = Math.min(1, (Math.max(0, p.a) / 100) * (Math.max(0, p.b) / 6));
    const scene = compact
      ? { x: 18, y: 16, width: w - 36, height: h * 0.5 }
      : { x: 26, y: 24, width: w * 0.5, height: h - 48 };
    const side = compact
      ? { x: 18, y: scene.y + scene.height + 12, width: w - 36, height: h - scene.y - scene.height - 30 }
      : { x: scene.x + scene.width + 22, y: 24, width: w - scene.x - scene.width - 48, height: h - 48 };

    function panel(box, title) {
      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 0.84)";
      ctx.strokeStyle = "rgba(148, 163, 184, 0.24)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(box.x, box.y, box.width, box.height, 18);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = c.text;
      ctx.font = "900 13px Inter, system-ui, sans-serif";
      ctx.fillText(title, box.x + 16, box.y + 26);
      ctx.restore();
    }

    function pill(text, x, y, color, bg = "rgba(255,255,255,0.92)") {
      ctx.save();
      ctx.font = "900 12px Inter, system-ui, sans-serif";
      const width = ctx.measureText(text).width + 18;
      ctx.fillStyle = bg;
      ctx.strokeStyle = `${color}44`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x - width / 2, y - 13, width, 26, 9);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, x, y + 1);
      ctx.restore();
    }

    panel(scene, "Test caractéristique");
    const cx = scene.x + scene.width * 0.5;
    const tubeW = scene.width * (compact ? 0.28 : 0.22);
    const tubeH = scene.height * 0.58;
    const tubeX = cx - tubeW / 2;
    const tubeY = scene.y + scene.height * 0.25;
    const liquidH = tubeH * 0.52;
    const liquidY = tubeY + tubeH - liquidH - 8;
    const pipetteX = scene.x + scene.width * 0.28;

    ctx.save();
    ctx.strokeStyle = "rgba(30, 41, 59, 0.52)";
    ctx.lineWidth = compact ? 3 : 4;
    ctx.beginPath();
    ctx.roundRect(tubeX, tubeY, tubeW, tubeH, 18);
    ctx.stroke();
    ctx.fillStyle = test.solution;
    ctx.beginPath();
    ctx.roundRect(tubeX + 6, liquidY, tubeW - 12, liquidH, 12);
    ctx.fill();
    ctx.strokeStyle = "rgba(30, 41, 59, 0.24)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(tubeX + 9, liquidY + 8);
    ctx.lineTo(tubeX + tubeW - 9, liquidY + 8);
    ctx.stroke();

    ctx.strokeStyle = c.primary;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(pipetteX, scene.y + 54);
    ctx.lineTo(pipetteX, tubeY + 18);
    ctx.stroke();
    ctx.fillStyle = "rgba(59, 130, 246, 0.18)";
    ctx.beginPath();
    ctx.roundRect(pipetteX - 12, scene.y + 44, 24, 52, 12);
    ctx.fill();
    for (let i = 0; i < 3; i += 1) {
      const dropY = tubeY + 8 + ((clock * 70 + i * 35) % Math.max(20, liquidY - tubeY));
      ctx.fillStyle = "rgba(59, 130, 246, 0.72)";
      ctx.beginPath();
      ctx.arc(pipetteX, dropY, 3.4, 0, Math.PI * 2);
      ctx.fill();
    }

    const particles = 12 + Math.round(strength * 26);
    for (let i = 0; i < particles; i += 1) {
      const x = tubeX + 14 + ((i * 23) % Math.max(16, tubeW - 28));
      const yBase = liquidY + liquidH * (0.38 + ((i * 17) % 52) / 100);
      const y = yBase + Math.sin(clock * 3 + i) * (2 + strength * 3);
      ctx.fillStyle = ion === "Cl⁻" ? "rgba(255, 255, 255, 0.92)" : test.precip;
      ctx.globalAlpha = 0.28 + strength * 0.62;
      ctx.beginPath();
      ctx.arc(x, y, 2.5 + strength * 2.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    pill(`${p.b} gouttes`, scene.x + scene.width * 0.27, scene.y + scene.height - 30, c.primary, "rgba(239, 246, 255, 0.94)");
    pill(`${frNumber(p.a, 0)} %`, scene.x + scene.width * 0.72, scene.y + scene.height - 30, c.success, "rgba(240, 253, 250, 0.94)");
    ctx.restore();

    panel(side, "Conclusion du test");
    const startY = side.y + (compact ? 54 : 78);
    const rows = [
      ["Ion recherché", ion, c.primary],
      ["Réactif", `${test.reagent} (${test.formula})`, c.text],
      ["Observation", test.observation, ion === "Cl⁻" ? c.muted : test.precip],
      ["Conclusion", test.conclusion, c.success],
    ];
    rows.forEach(([name, value, color], index) => {
      const rowGap = compact ? 28 : 54;
      const rowHeight = compact ? 24 : 42;
      const y = startY + index * rowGap;
      ctx.save();
      ctx.fillStyle = "rgba(248, 250, 252, 0.9)";
      ctx.strokeStyle = "rgba(148, 163, 184, 0.18)";
      ctx.beginPath();
      ctx.roundRect(side.x + 18, y - rowHeight / 2, side.width - 36, rowHeight, 11);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = c.muted;
      ctx.font = `800 ${compact ? 9 : 11}px Inter, system-ui, sans-serif`;
      ctx.fillText(name, side.x + 30, y - (compact ? 1 : 4));
      ctx.fillStyle = color;
      ctx.font = `900 ${compact ? 11 : 15}px Inter, system-ui, sans-serif`;
      ctx.textAlign = "right";
      ctx.fillText(value, side.x + side.width - 30, y + (compact ? 1 : 6));
      ctx.restore();
    });
    if (!compact) {
      centerLabel(ctx, "un test positif donne un précipité caractéristique", side.x + side.width / 2, side.y + side.height - 24, c.muted, 12);
    }

    setContextMetrics([ion, test.formula, test.observation, test.conclusion]);
    setReadout(`Test des ions : avec ${test.reagent}, l'ion ${ion} donne un ${test.observation}. Plus la solution est concentrée et plus on ajoute de réactif, plus le précipité est visible.`);
  }

  function drawMole(ctx, w, h, p) {
    const c = colors();
    const compact = w < 720;
    const mass = Math.max(0.1, p.a);
    const molarMass = Math.max(0.1, p.b);
    const amount = mass / molarMass;
    const species = p.mode || "Eau";
    const speciesInfo = {
      Eau: { formula: "H₂O", color: "#0ea5e9", sample: "liquide", entity: "molécules" },
      "Dioxyde de carbone": { formula: "CO₂", color: "#64748b", sample: "gaz", entity: "molécules" },
      "Chlorure de sodium": { formula: "NaCl", color: "#f59e0b", sample: "cristal", entity: "ions Na⁺ / Cl⁻" },
    }[species] || { formula: species, color: c.primary, sample: "échantillon", entity: "entités" };
    const scene = compact
      ? { x: 18, y: 14, width: w - 36, height: h * 0.38 }
      : { x: 26, y: 24, width: w * 0.46, height: h - 48 };
    const side = compact
      ? { x: 18, y: scene.y + scene.height + 10, width: w - 36, height: h - scene.y - scene.height - 22 }
      : { x: scene.x + scene.width + 22, y: 24, width: w - scene.x - scene.width - 48, height: h - 48 };

    function panel(box, title) {
      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 0.84)";
      ctx.strokeStyle = "rgba(148, 163, 184, 0.24)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(box.x, box.y, box.width, box.height, 18);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = c.text;
      ctx.font = "900 13px Inter, system-ui, sans-serif";
      ctx.fillText(title, box.x + 16, box.y + 26);
      ctx.restore();
    }

    function pill(text, x, y, color, bg = "rgba(255,255,255,0.92)") {
      ctx.save();
      ctx.font = "900 12px Inter, system-ui, sans-serif";
      const width = ctx.measureText(text).width + 18;
      ctx.fillStyle = bg;
      ctx.strokeStyle = `${color}44`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x - width / 2, y - 13, width, 26, 9);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, x, y + 1);
      ctx.restore();
    }

    panel(scene, "Pesée de l'échantillon");
    const balanceX = scene.x + scene.width * 0.5;
    const panY = scene.y + scene.height * (compact ? 0.66 : 0.58);
    ctx.save();
    ctx.strokeStyle = "rgba(30, 41, 59, 0.72)";
    ctx.lineWidth = compact ? 3 : 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(balanceX - scene.width * 0.26, panY);
    ctx.lineTo(balanceX + scene.width * 0.26, panY);
    ctx.moveTo(balanceX, panY);
    ctx.lineTo(balanceX, panY + scene.height * 0.18);
    ctx.moveTo(balanceX - scene.width * 0.17, panY + scene.height * 0.18);
    ctx.lineTo(balanceX + scene.width * 0.17, panY + scene.height * 0.18);
    ctx.stroke();
    const heapWidth = scene.width * (compact ? 0.24 : 0.26);
    const heapHeight = scene.height * (0.1 + Math.min(1, mass / 100) * 0.18);
    const grad = ctx.createLinearGradient(balanceX - heapWidth / 2, panY - heapHeight, balanceX + heapWidth / 2, panY);
    grad.addColorStop(0, `${speciesInfo.color}88`);
    grad.addColorStop(1, `${speciesInfo.color}dd`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(balanceX, panY - heapHeight * 0.35, heapWidth / 2, heapHeight * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 12; i += 1) {
      const x = balanceX - heapWidth * 0.38 + ((i * 19) % Math.max(10, heapWidth * 0.76));
      const y = panY - heapHeight * (0.24 + ((i * 7) % 42) / 100) + Math.sin(clock * 2 + i) * 1.5;
      ctx.fillStyle = speciesInfo.color;
      ctx.beginPath();
      ctx.arc(x, y, compact ? 2.5 : 3.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    pill(`${frNumber(mass, 1)} g`, scene.x + scene.width * 0.32, scene.y + (compact ? 44 : 58), c.primary, "rgba(239, 246, 255, 0.94)");
    pill(`${speciesInfo.formula}`, scene.x + scene.width * 0.7, scene.y + (compact ? 44 : 58), speciesInfo.color, "rgba(255, 255, 255, 0.94)");
    centerLabel(ctx, speciesInfo.sample, balanceX, panY + (compact ? 28 : 50), c.muted, compact ? 10 : 13);

    panel(side, "Calcul de la quantité de matière");
    const formulaY = side.y + (compact ? 42 : 72);
    centerLabel(ctx, "n = m / M", side.x + side.width / 2, formulaY, c.text, compact ? 22 : 30);
    const fracY = formulaY + (compact ? 34 : 58);
    const fracX = side.x + side.width / 2;
    pill(`m = ${frNumber(mass, 1)} g`, fracX - side.width * 0.22, fracY, c.primary, "rgba(239, 246, 255, 0.94)");
    pill(`M = ${frNumber(molarMass, 1)} g/mol`, fracX + side.width * 0.22, fracY, c.warning, "rgba(255, 251, 235, 0.95)");
    centerLabel(ctx, `n = ${frNumber(amount, 2)} mol`, fracX, fracY + (compact ? 30 : 54), c.success, compact ? 22 : 28);

    const boxX = side.x + side.width * 0.14;
    const boxY = fracY + (compact ? 54 : 104);
    const boxW = side.width * 0.72;
    const boxH = compact ? 44 : 110;
    ctx.save();
    ctx.fillStyle = "rgba(248, 250, 252, 0.86)";
    ctx.strokeStyle = "rgba(148, 163, 184, 0.28)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 16);
    ctx.fill();
    ctx.stroke();
    const dotCount = Math.min(compact ? 22 : 42, Math.max(4, Math.round(amount * 12)));
    for (let i = 0; i < dotCount; i += 1) {
      const cols = compact ? 7 : 10;
      const x = boxX + 18 + (i % cols) * ((boxW - 36) / (cols - 1));
      const y = boxY + 14 + Math.floor(i / cols) * (compact ? 12 : 19) + Math.sin(clock * 2.5 + i) * 1.2;
      ctx.fillStyle = speciesInfo.color;
      ctx.globalAlpha = 0.28 + Math.min(0.65, amount / 3);
      ctx.beginPath();
      ctx.arc(x, y, compact ? 3 : 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
    centerLabel(ctx, speciesInfo.entity, side.x + side.width / 2, boxY + boxH + (compact ? 12 : 24), c.muted, compact ? 10 : 12);

    setContextMetrics([
      `${frNumber(mass, 1)} g`,
      `${frNumber(molarMass, 1)} g/mol`,
      `${frNumber(amount, 2)} mol`,
      speciesInfo.formula,
    ]);
    setReadout(`Mole et pesée : n = m / M = ${frNumber(mass, 1)} g / ${frNumber(molarMass, 1)} g/mol = ${frNumber(amount, 2)} mol. À masse égale, une masse molaire plus grande donne moins de moles.`);
  }

  function drawSeasons(ctx, w, h, p) {
    const c = colors();
    const compact = w < 720;
    const day = Math.max(1, Math.min(365, p.a));
    const tiltDeg = Math.max(0, p.b);
    const tilt = (tiltDeg * Math.PI) / 180;
    const hemisphere = p.mode || "Nord";
    const scene = compact
      ? { x: 18, y: 16, width: w - 36, height: h * 0.52 }
      : { x: 26, y: 24, width: w * 0.56, height: h - 48 };
    const side = compact
      ? { x: 18, y: scene.y + scene.height + 10, width: w - 36, height: h - scene.y - scene.height - 22 }
      : { x: scene.x + scene.width + 22, y: 24, width: w - scene.x - scene.width - 48, height: h - 48 };
    const juneSolstice = 172;
    const seasonalRaw = Math.cos(((day - juneSolstice) / 365) * Math.PI * 2) * (Math.sin(tilt) / Math.sin((23.5 * Math.PI) / 180));
    const hemisphereFactor = hemisphere === "Sud" ? -1 : hemisphere === "Équateur" ? 0 : 1;
    const signal = Math.max(-1, Math.min(1, seasonalRaw * hemisphereFactor));
    const dayLength = hemisphere === "Équateur" ? 12 : 12 + signal * 4.2;
    const season = hemisphere === "Équateur"
      ? "variation faible"
      : signal > 0.32
        ? "été"
        : signal < -0.32
          ? "hiver"
          : day < 172
            ? (hemisphere === "Nord" ? "printemps" : "automne")
            : (hemisphere === "Nord" ? "automne" : "printemps");

    function panel(box, title) {
      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 0.84)";
      ctx.strokeStyle = "rgba(148, 163, 184, 0.24)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(box.x, box.y, box.width, box.height, 18);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = c.text;
      ctx.font = "900 13px Inter, system-ui, sans-serif";
      ctx.fillText(title, box.x + 16, box.y + 26);
      ctx.restore();
    }

    function dateLabel(dayNumber) {
      const monthLengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      const names = ["jan.", "fév.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
      let remaining = Math.round(dayNumber);
      for (let i = 0; i < monthLengths.length; i += 1) {
        if (remaining <= monthLengths[i]) return `${remaining} ${names[i]}`;
        remaining -= monthLengths[i];
      }
      return "31 déc.";
    }

    panel(scene, "Terre autour du Soleil");
    const cx = scene.x + scene.width * 0.5;
    const cy = scene.y + scene.height * 0.52;
    const rx = scene.width * 0.34;
    const ry = scene.height * 0.25;
    const orbitAngle = ((day - 80) / 365) * Math.PI * 2;
    const sunX = cx;
    const sunY = cy;
    const earthX = cx + Math.cos(orbitAngle) * rx;
    const earthY = cy + Math.sin(orbitAngle) * ry;
    ctx.save();
    ctx.strokeStyle = "rgba(79, 70, 229, 0.24)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 8, sunX, sunY, 56);
    sunGlow.addColorStop(0, "rgba(250, 204, 21, 0.62)");
    sunGlow.addColorStop(1, "rgba(250, 204, 21, 0)");
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 56, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.arc(sunX, sunY, compact ? 18 : 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(250, 204, 21, 0.65)";
    ctx.lineWidth = 1.6;
    for (let i = -2; i <= 2; i += 1) {
      const offset = i * (compact ? 8 : 12);
      ctx.beginPath();
      ctx.moveTo(sunX + offset, sunY);
      ctx.lineTo(earthX - (earthX - sunX) * 0.18 + offset * 0.2, earthY - (earthY - sunY) * 0.18);
      ctx.stroke();
    }
    for (let i = 0; i < 5; i += 1) {
      const t = ((clock * 0.16 + i / 5) % 1 + 1) % 1;
      const x = sunX + (earthX - sunX) * t;
      const y = sunY + (earthY - sunY) * t;
      ctx.fillStyle = "rgba(250, 204, 21, 0.62)";
      ctx.beginPath();
      ctx.arc(x, y, compact ? 2.4 : 3, 0, Math.PI * 2);
      ctx.fill();
    }
    const earthGradient = ctx.createRadialGradient(earthX - 5, earthY - 6, 4, earthX, earthY, compact ? 18 : 24);
    earthGradient.addColorStop(0, "#bbf7d0");
    earthGradient.addColorStop(0.55, "#38bdf8");
    earthGradient.addColorStop(1, "#2563eb");
    ctx.fillStyle = earthGradient;
    ctx.beginPath();
    ctx.arc(earthX, earthY, compact ? 17 : 22, 0, Math.PI * 2);
    ctx.fill();
    const axisX = Math.sin(tilt);
    const axisY = -Math.cos(tilt);
    ctx.strokeStyle = c.danger;
    ctx.lineWidth = compact ? 2.5 : 3.5;
    ctx.beginPath();
    ctx.moveTo(earthX - axisX * 42, earthY - axisY * 42);
    ctx.lineTo(earthX + axisX * 42, earthY + axisY * 42);
    ctx.stroke();
    centerLabel(ctx, "N", earthX + axisX * 48, earthY + axisY * 48, hemisphere === "Nord" ? c.danger : c.text, 12);
    centerLabel(ctx, "S", earthX - axisX * 48, earthY - axisY * 48, hemisphere === "Sud" ? c.danger : c.text, 12);
    centerLabel(ctx, dateLabel(day), scene.x + scene.width / 2, scene.y + scene.height - (compact ? 18 : 24), c.text, compact ? 13 : 15);
    ctx.restore();

    panel(side, "Conséquence observée");
    const meterX = side.x + 30;
    const meterY = side.y + (compact ? 58 : 92);
    const meterW = side.width - 60;
    ctx.save();
    if (compact) {
      ctx.fillStyle = c.primary;
      ctx.font = "900 17px Inter, system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(hemisphere, side.x + side.width - 30, side.y + 34);
    } else {
      centerLabel(ctx, hemisphere, side.x + side.width / 2, side.y + 52, c.primary, 24);
    }
    ctx.fillStyle = "rgba(148, 163, 184, 0.14)";
    ctx.beginPath();
    ctx.roundRect(meterX, meterY, meterW, 16, 8);
    ctx.fill();
    ctx.fillStyle = signal >= 0 ? "#f59e0b" : "#3b82f6";
    ctx.beginPath();
    ctx.roundRect(meterX, meterY, meterW * Math.max(0.08, dayLength / 16.5), 16, 8);
    ctx.fill();
    centerLabel(ctx, `durée du jour ≈ ${frNumber(dayLength, 1)} h`, side.x + side.width / 2, meterY + (compact ? 36 : 42), c.text, compact ? 13 : 16);
    const seasonY = meterY + (compact ? 62 : 96);
    const seasonColor = season === "été" ? c.warning : season === "hiver" ? c.primary : c.success;
    centerLabel(ctx, season, side.x + side.width / 2, seasonY, seasonColor, compact ? 20 : 30);
    centerLabel(ctx, `inclinaison : ${frNumber(tiltDeg, 0)}°`, side.x + side.width / 2, seasonY + (compact ? 24 : 38), c.muted, compact ? 11 : 13);
    ctx.restore();

    setContextMetrics([
      dateLabel(day),
      `${frNumber(tiltDeg, 0)}°`,
      `${frNumber(dayLength, 1)} h`,
      season,
    ]);
    setReadout(`Saisons : l'axe reste orienté dans la même direction. Dans l'hémisphère ${hemisphere.toLowerCase()}, on observe : ${season}, avec environ ${frNumber(dayLength, 1)} h de jour.`);
  }

  function drawEscape(ctx, w, h, p) {
    const c = colors();
    const compact = w < 720;
    const mission = p.mode || "Allumer";
    const clues = Math.max(0, Math.min(5, Math.round(p.a)));
    const useful = Math.max(0, Math.min(100, p.b));
    const lost = 100 - useful;
    const map = {
      Allumer: { source: "pile", converter: "lampe", useful: "lumière", loss: "chaleur", color: "#f59e0b" },
      Déplacer: { source: "batterie", converter: "moteur", useful: "mouvement", loss: "chaleur + son", color: "#3b82f6" },
      Chauffer: { source: "secteur", converter: "résistance", useful: "chaleur", loss: "dissipation", color: "#ef4444" },
    };
    const item = map[mission] || map.Allumer;
    const scene = compact
      ? { x: 18, y: 16, width: w - 36, height: h - 32 }
      : { x: 26, y: 24, width: w - 52, height: h - 48 };

    function panel(box, title) {
      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 0.84)";
      ctx.strokeStyle = "rgba(148, 163, 184, 0.24)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(box.x, box.y, box.width, box.height, 18);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = c.text;
      ctx.font = "900 13px Inter, system-ui, sans-serif";
      ctx.fillText(title, box.x + 16, box.y + 26);
      ctx.restore();
    }

    function card(box, title, value, color, locked = false) {
      ctx.save();
      ctx.globalAlpha = locked ? 0.45 : 1;
      ctx.fillStyle = locked ? "rgba(226, 232, 240, 0.86)" : "rgba(248, 250, 252, 0.92)";
      ctx.strokeStyle = locked ? "rgba(100, 116, 139, 0.22)" : `${color}55`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.roundRect(box.x, box.y, box.width, box.height, 14);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = c.muted;
      ctx.font = `800 ${compact ? 9 : 11}px Inter, system-ui, sans-serif`;
      ctx.fillText(title, box.x + 12, box.y + 20);
      ctx.fillStyle = locked ? c.muted : color;
      ctx.font = `900 ${compact ? 13 : 18}px Inter, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(locked ? "?" : value, box.x + box.width / 2, box.y + box.height * 0.64);
      ctx.restore();
    }

    panel(scene, `Mission : ${mission.toLowerCase()}`);
    const headerY = scene.y + (compact ? 48 : 58);
    centerLabel(ctx, `${clues}/5 indices trouvés`, scene.x + scene.width * 0.28, headerY, c.primary, compact ? 14 : 18);
    centerLabel(ctx, `${frNumber(useful, 0)} % utile`, scene.x + scene.width * 0.72, headerY, c.success, compact ? 14 : 18);

    const clueX = scene.x + 28;
    const clueY = headerY + (compact ? 22 : 34);
    const clueW = scene.width - 56;
    for (let i = 0; i < 5; i += 1) {
      const x = clueX + i * (clueW / 5);
      ctx.fillStyle = i < clues ? item.color : "rgba(148, 163, 184, 0.22)";
      ctx.beginPath();
      ctx.roundRect(x + 4, clueY, clueW / 5 - 8, compact ? 8 : 12, 6);
      ctx.fill();
    }

    const cardsY = clueY + (compact ? 30 : 58);
    const cardH = compact ? 42 : 84;
    const gap = compact ? 8 : 18;
    const cardW = compact ? scene.width - 48 : (scene.width - 72 - gap * 3) / 4;
    const boxes = compact
      ? [
          { x: scene.x + 24, y: cardsY, width: cardW, height: cardH },
          { x: scene.x + 24, y: cardsY + (cardH + gap), width: cardW, height: cardH },
          { x: scene.x + 24, y: cardsY + 2 * (cardH + gap), width: cardW, height: cardH },
          { x: scene.x + 24, y: cardsY + 3 * (cardH + gap), width: cardW, height: cardH },
        ]
      : Array.from({ length: 4 }, (_, index) => ({
          x: scene.x + 36 + index * (cardW + gap),
          y: cardsY,
          width: cardW,
          height: cardH,
        }));

    const labels = [
      ["source", item.source, c.primary],
      ["convertisseur", item.converter, item.color],
      ["énergie utile", item.useful, c.success],
      ["pertes", item.loss, c.danger],
    ];
    labels.forEach(([title, value, color], index) => {
      card(boxes[index], title, value, color, clues < index + 1);
      if (index < boxes.length - 1 && (!compact || index < 3)) {
        const start = boxes[index];
        const end = boxes[index + 1];
        if (compact) arrow(ctx, start.x + start.width / 2, start.y + start.height + 3, end.x + end.width / 2, end.y - 3, "rgba(79, 70, 229, 0.45)", 2.4);
        else arrow(ctx, start.x + start.width + 4, start.y + start.height / 2, end.x - 4, end.y + end.height / 2, "rgba(79, 70, 229, 0.45)", 2.4);
      }
    });

    const barY = scene.y + scene.height - (compact ? 56 : 54);
    const barX = scene.x + 32;
    const barW = scene.width - 64;
    ctx.save();
    ctx.fillStyle = "rgba(148, 163, 184, 0.16)";
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, 16, 8);
    ctx.fill();
    ctx.fillStyle = c.success;
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW * (useful / 100), 16, 8);
    ctx.fill();
    ctx.fillStyle = c.danger;
    ctx.beginPath();
    ctx.roundRect(barX + barW * (useful / 100), barY, barW * (lost / 100), 16, 8);
    ctx.fill();
    centerLabel(ctx, `utile ${frNumber(useful, 0)} % • pertes ${frNumber(lost, 0)} %`, scene.x + scene.width / 2, barY + (compact ? 34 : 36), c.text, compact ? 11 : 13);
    ctx.restore();

    const packetCount = compact ? 4 : 7;
    for (let i = 0; i < packetCount; i += 1) {
      const t = ((clock * 0.7 + i / packetCount) % 1 + 1) % 1;
      const start = boxes[0];
      const end = boxes[2];
      const x = compact ? start.x + start.width * 0.78 : start.x + start.width + t * ((end.x + end.width / 2) - (start.x + start.width));
      const y = compact ? start.y + start.height + t * ((end.y + end.height / 2) - (start.y + start.height)) : start.y + start.height / 2 + Math.sin(t * Math.PI) * 6;
      ctx.fillStyle = `${item.color}aa`;
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    setContextMetrics([
      mission,
      `${clues}/5`,
      `${frNumber(useful, 0)} %`,
      `${item.source} → ${item.useful}`,
    ]);
    setReadout(`Escape énergie : mission ${mission.toLowerCase()}. Chaîne attendue : ${item.source} → ${item.converter} → ${item.useful}, avec ${frNumber(lost, 0)} % de pertes.`);
  }

  function draw() {
    updateLabels();
    clear();
    const { ctx, width: w, height: h } = state;
    const p = params();
    switch (kind) {
      case "orbit": drawOrbit(ctx, w, h, p); break;
      case "mixture": drawMixture(ctx, w, h, p); break;
      case "chronophoto": drawChrono(ctx, w, h, p); break;
      case "energy-chain": drawChain(ctx, w, h, p); break;
      case "decay": drawDecay(ctx, w, h, p); break;
      case "refraction": drawRefraction(ctx, w, h, p); break;
      case "lens": drawLens(ctx, w, h, p); break;
      case "ph-scale": drawScale(ctx, w, h, p); break;
      case "oscilloscope": drawOscilloscope(ctx, w, h, p); break;
      case "interference": drawPattern(ctx, w, h, p); break;
      case "telescope": drawTelescope(ctx, w, h, p); break;
      case "weight": drawWeight(ctx, w, h, p); break;
      case "ohm": drawOhm(ctx, w, h, p); break;
      case "power": drawPower(ctx, w, h, p); break;
      case "thermal": drawThermal(ctx, w, h, p); break;
      case "titration-ph": drawTitration(ctx, w, h, p, false); break;
      case "titration-cond": drawTitration(ctx, w, h, p, true); break;
      case "ions": drawIons(ctx, w, h, p); break;
      case "mole": drawMole(ctx, w, h, p); break;
      case "seasons": drawSeasons(ctx, w, h, p); break;
      case "escape": drawEscape(ctx, w, h, p); break;
      default: drawChain(ctx, w, h, p); break;
    }
  }

  function resetSimulation() {
    inputA.value = initialValues.a;
    inputB.value = initialValues.b;
    modeInput.value = initialValues.mode;
    clock = 0;
    if (playControlledKinds.has(kind)) setPaused(kind === "weight" ? reducedMotion : true);
    draw();
  }

  function handleCanvasClick(event) {
    if (kind === "mixture") {
      setPaused(!isPaused);
      draw();
      return;
    }
    if (kind !== "orbit" || solarHitTargets.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const target = solarHitTargets
      .map((item) => ({ ...item, distance: Math.hypot(x - item.x, y - item.y) }))
      .filter((item) => item.distance <= item.r)
      .sort((left, right) => left.distance - right.distance)[0];
    if (!target) return;
    modeInput.value = target.name;
    setPaused(false);
    draw();
  }

  [inputA, inputB].forEach((input) => runtime.on(input, "input", handleControlInput));
  runtime.on(modeInput, "input", handleModeInput);
  runtime.on(modeInput, "change", handleModeInput);
  runtime.on(canvas, "click", handleCanvasClick);
  runtime.on(playToggle, "click", () => {
    if (kind === "weight") {
      if (isPaused) {
        clock = 0;
        setPaused(false);
      } else {
        setPaused(true);
      }
      draw();
      return;
    }
    if (isTitration) {
      if (isPaused) {
        const maxVolume = Number(inputA.max) || 30;
        if (Number(inputA.value) >= maxVolume) inputA.value = inputA.min || "0";
        clock = 0;
        setPaused(false);
      } else {
        setPaused(true);
      }
      draw();
      return;
    }
    setPaused(!isPaused);
  });
  runtime.on(resetButton, "click", resetSimulation);

  setPaused((playControlledKinds.has(kind) && kind !== "weight") || reducedMotion);
  draw();
  if (!reducedMotion) {
    runtime.frame(() => {
      if (!playControlledKinds.has(kind) || !isPaused) clock += 0.018;
      draw();
    });
  }
});
