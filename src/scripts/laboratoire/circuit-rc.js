import { createLabRuntime, fitCanvas, frNumber, getThemeColor, onLabReady, prefersReducedMotion } from "./lab-utils.js";

onLabReady('[data-lab-app="circuit-rc"]', (root) => {
  const q = (selector) => root.querySelector(selector);

  const sliderE = q("#slider-e");
  const sliderR = q("#slider-r");
  const sliderC = q("#slider-c");
  const sliderSpeed = q("#slider-speed");
  const sliderTime = q("#slider-time");
  const valE = q("#val-e");
  const valR = q("#val-r");
  const valC = q("#val-c");
  const valSpeed = q("#val-speed");
  const valTau = q("#val-tau");
  const valFiveTau = q("#val-five-tau");
  const valUcTau = q("#val-uc-tau");
  const btnCharge = q("#btn-charge");
  const btnDischarge = q("#btn-discharge");
  const btnToggle = q("#btn-rc-toggle");
  const btnReset = q("#btn-rc-reset");
  const switchBlade = q("#switch-blade");
  const currentArrow = q("#current-arrow");
  const currentPill = q("#current-pill");
  const modePill = q("#mode-pill");
  const mathCharge = q("#math-charge");
  const mathDischarge = q("#math-discharge");
  const platePositiveCharges = q("#plate-positive-charges");
  const plateNegativeCharges = q("#plate-negative-charges");
  const electronLayer = q("#electron-layer");
  const electronHint = q("#electron-hint");
  const chargeStateLabel = q("#charge-state-label");
  const timeDisplay = q("#time-display");
  const timeMaxDisplay = q("#time-max-display");
  const observation = q("#rc-observation");
  const missionText = q("#rc-mission-text");
  const toggleUc = q("#toggle-uc");
  const toggleUr = q("#toggle-ur");
  const toggleTangent = q("#toggle-tangent");
  const valUcNow = q("#val-uc-now");
  const valUrNow = q("#val-ur-now");
  const valINow = q("#val-i-now");
  const valEnergyNow = q("#val-energy-now");
  const valProgressNow = q("#val-progress-now");
  const progressFill = q("#rc-progress-fill");
  const ucLabel = q("#uc-label");
  const urLabel = q("#ur-label");
  const canvas = q("#graphCanvas");

  if (!sliderE || !sliderR || !sliderC || !canvas) return;

  const runtime = createLabRuntime(root);
  const reducedMotion = prefersReducedMotion();
  let canvasState = fitCanvas(canvas);
  let E = 5;
  let R = 10000;
  let C = 0.0001;
  let tau = 1;
  let maxTime = 8;
  let speed = 1;
  let mode = "charge";
  let time = 0;
  let ucInitial = 0;
  let uc = 0;
  let lastFrame = performance.now();
  let isPaused = true;

  runtime.observe(canvas, () => {
    canvasState = fitCanvas(canvas);
    drawGraph();
  });

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const svgNs = "http://www.w3.org/2000/svg";

  function signedNumber(value, digits = 2) {
    if (Math.abs(value) < 10 ** -digits) return frNumber(0, digits);
    return frNumber(value, digits);
  }

  function readValues() {
    E = Number(sliderE.value);
    R = Number(sliderR.value) * 1000;
    C = Number(sliderC.value) * 1e-6;
    speed = Number(sliderSpeed?.value || 1);
    tau = R * C;
    maxTime = Math.max(0.5, 8 * tau);

    valE.textContent = String(E);
    valR.textContent = String(sliderR.value);
    valC.textContent = String(sliderC.value);
    if (valSpeed) valSpeed.textContent = frNumber(speed, 1);
    valTau.textContent = `${frNumber(tau, 2)} s`;
    if (valFiveTau) valFiveTau.textContent = `${frNumber(5 * tau, 2)} s`;
    if (valUcTau) valUcTau.textContent = `${frNumber(targetAtTau(), 2)} V`;
    if (timeMaxDisplay) timeMaxDisplay.textContent = frNumber(maxTime, 2);
  }

  function targetAtTau() {
    return mode === "charge" ? E * (1 - Math.exp(-1)) : E * Math.exp(-1);
  }

  function tensionAt(t) {
    if (mode === "charge") {
      return ucInitial + (E - ucInitial) * (1 - Math.exp(-t / tau));
    }
    return ucInitial * Math.exp(-t / tau);
  }

  function currentAt(t) {
    const u = tensionAt(t);
    if (mode === "charge") return (E - u) / R;
    return -u / R;
  }

  function resistorVoltageAt(t) {
    return currentAt(t) * R;
  }

  function energyAt(u) {
    return 0.5 * C * u * u;
  }

  function resetCurve() {
    time = 0;
    ucInitial = mode === "charge" ? 0 : E;
    uc = tensionAt(time);
    updateAll();
  }

  function toggleLabel() {
    if (!isPaused) return "Pause";
    return time <= 0.001 ? "Lancer" : "Reprendre";
  }

  function setMode(nextMode) {
    mode = nextMode;
    const isCharge = mode === "charge";

    btnCharge.classList.toggle("is-active", isCharge);
    btnDischarge.classList.toggle("is-active", !isCharge);
    btnCharge.setAttribute("aria-pressed", String(isCharge));
    btnDischarge.setAttribute("aria-pressed", String(!isCharge));

    if (switchBlade) {
      switchBlade.setAttribute("x2", "145");
      switchBlade.setAttribute("y2", isCharge ? "80" : "160");
    }

    if (currentArrow) {
      currentArrow.setAttribute("x1", isCharge ? "255" : "350");
      currentArrow.setAttribute("x2", isCharge ? "350" : "255");
    }

    if (modePill) modePill.textContent = `Mode : ${isCharge ? "charge" : "décharge"}`;
    if (currentPill) {
      currentPill.textContent = isCharge ? "i > 0" : "i < 0";
      currentPill.classList.toggle("is-negative", !isCharge);
    }
    if (mathCharge) mathCharge.hidden = !isCharge;
    if (mathDischarge) mathDischarge.hidden = isCharge;

    readValues();
    resetCurve();
  }

  function setPaused(nextPaused) {
    isPaused = nextPaused;
    root.classList.toggle("is-rc-running", !isPaused);
    root.classList.toggle("is-rc-paused", isPaused);
    if (!btnToggle) return;
    btnToggle.textContent = toggleLabel();
    btnToggle.setAttribute("aria-pressed", String(isPaused));
    btnToggle.classList.toggle("is-active", isPaused);
    updateElectrons();
  }

  function updateTimeSlider() {
    if (!sliderTime) return;
    sliderTime.value = String(Math.round((time / maxTime) * 1000));
    sliderTime.setAttribute("aria-valuetext", `${frNumber(time, 2)} s`);
  }

  function updateMeasurements() {
    const ur = resistorVoltageAt(time);
    const current = currentAt(time);
    const energy = energyAt(uc);
    const percent = clamp((uc / Math.max(E, 0.001)) * 100, 0, 100);

    if (timeDisplay) timeDisplay.textContent = frNumber(time, 2);
    if (valUcNow) valUcNow.textContent = `${frNumber(uc, 2)} V`;
    if (valUrNow) valUrNow.textContent = `${signedNumber(ur, 2)} V`;
    if (valINow) valINow.textContent = `${signedNumber(current * 1000, 2)} mA`;
    if (valEnergyNow) valEnergyNow.textContent = `${frNumber(energy * 1000, 2)} mJ`;
    if (valProgressNow) {
      valProgressNow.textContent = mode === "charge"
        ? `${frNumber(percent, 0)} % de E`
        : `${frNumber(percent, 0)} % restant`;
    }
    if (progressFill) progressFill.style.width = `${percent}%`;
    if (ucLabel) ucLabel.textContent = `uC = ${frNumber(uc, 2)} V`;
    if (urLabel) urLabel.textContent = `uR = ${signedNumber(ur, 2)} V`;
    if (currentArrow) currentArrow.style.opacity = Math.abs(current) < 1e-5 ? "0.35" : "1";
  }

  function createSvgElement(name, attributes = {}) {
    const element = document.createElementNS(svgNs, name);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
    return element;
  }

  function addPlateCharge(group, x, y, sign, kind) {
    const charge = createSvgElement("g", { class: `rc-svg-charge rc-svg-charge--${kind}` });
    const label = createSvgElement("text", { x, y: y + 4, "text-anchor": "middle" });
    label.textContent = sign;
    charge.append(
      createSvgElement("circle", { cx: x, cy: y, r: 8 }),
      label,
    );
    group.append(charge);
  }

  function updateCharges() {
    if (!platePositiveCharges || !plateNegativeCharges) return;
    const ratio = clamp(uc / Math.max(E, 0.001), 0, 1);
    const chargeCount = Math.round(ratio * 10);
    const slots = [
      { dx: 12, y: 94 },
      { dx: 12, y: 110 },
      { dx: 12, y: 126 },
      { dx: 12, y: 142 },
      { dx: 27, y: 102 },
      { dx: 27, y: 118 },
      { dx: 27, y: 134 },
      { dx: 42, y: 110 },
      { dx: 42, y: 126 },
      { dx: 42, y: 142 },
    ];

    platePositiveCharges.replaceChildren();
    plateNegativeCharges.replaceChildren();

    if (chargeCount <= 0) {
      if (chargeStateLabel) chargeStateLabel.textContent = "condensateur déchargé";
      return;
    }

    for (let i = 0; i < chargeCount; i += 1) {
      const slot = slots[i];
      addPlateCharge(platePositiveCharges, 410 - slot.dx, slot.y, "+", "positive");
      addPlateCharge(plateNegativeCharges, 440 + slot.dx, slot.y, "−", "negative");
    }

    if (chargeStateLabel) {
      chargeStateLabel.textContent = mode === "charge"
        ? "la plaque gauche devient +, la droite −"
        : "les charges des plaques diminuent";
    }
  }

  function pointOnPath(points, progress) {
    const segments = [];
    let totalLength = 0;

    for (let i = 1; i < points.length; i += 1) {
      const [x1, y1] = points[i - 1];
      const [x2, y2] = points[i];
      const length = Math.hypot(x2 - x1, y2 - y1);
      segments.push({ x1, y1, x2, y2, length });
      totalLength += length;
    }

    let distance = (((progress % 1) + 1) % 1) * totalLength;
    for (const segment of segments) {
      if (distance <= segment.length) {
        const ratio = segment.length === 0 ? 0 : distance / segment.length;
        return {
          x: segment.x1 + (segment.x2 - segment.x1) * ratio,
          y: segment.y1 + (segment.y2 - segment.y1) * ratio,
        };
      }
      distance -= segment.length;
    }

    const [x, y] = points[points.length - 1];
    return { x, y };
  }

  function addElectron(x, y, opacity, scale = 1) {
    if (!electronLayer) return;
    const electron = createSvgElement("g", {
      class: "rc-electron",
      opacity,
      transform: `translate(${frNumber(x, 2).replace(",", ".")} ${frNumber(y, 2).replace(",", ".")}) scale(${frNumber(scale, 2).replace(",", ".")})`,
    });
    const label = createSvgElement("text", { x: 0, y: 3.4, "text-anchor": "middle" });
    label.textContent = "−";
    electron.append(
      createSvgElement("circle", { cx: 0, cy: 0, r: 7 }),
      label,
    );
    electronLayer.append(electron);
  }

  function drawElectronsOnPath(points, count, phase, opacity, scale) {
    for (let i = 0; i < count; i += 1) {
      const point = pointOnPath(points, phase + i / count);
      addElectron(point.x, point.y, opacity, scale);
    }
  }

  function updateElectrons() {
    if (!electronLayer) return;
    electronLayer.replaceChildren();
    electronLayer.classList.toggle("is-idle", isPaused);

    if (isPaused && time <= 0.001) {
      if (electronHint) electronHint.textContent = "Clique sur Lancer : les e− se mettent en mouvement";
      return;
    }

    const current = currentAt(time);
    const initialCurrent = Math.max(E / R, 1e-6);
    const strength = clamp(Math.abs(current) / initialCurrent, 0, 1);
    const opacity = isPaused ? 0.46 : 0.28 + 0.72 * strength;
    const scale = 0.9 + 0.45 * strength;
    const phase = (time / Math.max(tau, 0.2)) * 1.15 * speed;
    const resistorToBattery = [
      [410, 120], [375, 120], [355, 140], [340, 100], [325, 140],
      [310, 100], [295, 140], [280, 100], [265, 140], [250, 100],
      [235, 120], [205, 120], [145, 80], [95, 80],
    ];
    const batteryToNegativePlate = [
      [95, 220], [520, 220], [520, 120], [440, 120],
    ];
    const dischargePath = [
      [440, 120], [520, 120], [520, 220], [95, 220], [145, 160],
      [205, 120], [235, 120], [250, 100], [265, 140], [280, 100],
      [295, 140], [310, 100], [325, 140], [340, 100], [355, 140],
      [375, 120], [410, 120],
    ];

    if (mode === "charge") {
      drawElectronsOnPath(resistorToBattery, 7, phase, opacity, scale);
      drawElectronsOnPath(batteryToNegativePlate, 6, phase + 0.18, opacity, scale);
      if (electronHint) {
        electronHint.textContent = strength < 0.05
          ? "e− presque immobiles : C est chargé"
          : "e− quittent la plaque + et arrivent sur la plaque −";
      }
      return;
    }

    drawElectronsOnPath(dischargePath, 12, phase, opacity, scale);
    if (electronHint) {
      electronHint.textContent = strength < 0.05
        ? "e− presque immobiles : C est déchargé"
        : "e− repartent de la plaque − vers la plaque +";
    }
  }

  function updateObservation() {
    if (!observation) return;
    const ratio = tau > 0 ? time / tau : 0;
    const percent = clamp((uc / Math.max(E, 0.001)) * 100, 0, 100);

    if (ratio >= 5) {
      observation.textContent = mode === "charge"
        ? `Après 5τ, le condensateur est presque chargé : uC ≈ ${frNumber(uc, 2)} V, le courant devient quasi nul.`
        : `Après 5τ, le condensateur est presque déchargé : il ne reste qu'environ ${frNumber(percent, 0)} % de la tension initiale.`;
    } else if (mode === "charge") {
      observation.textContent = `uC augmente pendant que uR et i diminuent. Le condensateur s'oppose d'abord fortement à la variation de tension.`;
    } else {
      observation.textContent = `uC diminue exponentiellement : le condensateur restitue l'énergie stockée dans la résistance.`;
    }

    if (!missionText) return;
    if (ratio < 0.9) {
      missionText.textContent = mode === "charge"
        ? "Laisse avancer jusqu'à τ : uC doit atteindre environ 63 % de E."
        : "Laisse avancer jusqu'à τ : uC doit tomber à environ 37 % de sa valeur initiale.";
    } else if (ratio < 1.15) {
      missionText.textContent = mode === "charge"
        ? `Nous sommes près de τ : uC ≈ ${frNumber(percent, 0)} % de E.`
        : `Nous sommes près de τ : il reste ≈ ${frNumber(percent, 0)} % de la tension initiale.`;
    } else if (ratio < 5) {
      missionText.textContent = "Compare la courbe bleue et la courbe verte : elles évoluent en sens inverse.";
    } else {
      missionText.textContent = "Le régime transitoire est terminé : la courbe devient presque horizontale.";
    }
  }

  function drawGraph() {
    const { ctx, width: w, height: h } = canvasState;
    ctx.clearRect(0, 0, w, h);

    const primary = getThemeColor("--accent-primary", "#4f46e5");
    const success = getThemeColor("--accent-success", "#10b981");
    const warning = getThemeColor("--accent-warning", "#f59e0b");
    const danger = getThemeColor("--accent-danger", "#ef4444");
    const text = getThemeColor("--text-primary", "#1a2332");
    const muted = getThemeColor("--text-muted", "#8896a6");
    const grid = "rgba(148, 163, 184, 0.24)";
    const showUc = toggleUc?.checked !== false;
    const showUr = toggleUr?.checked !== false;
    const showTangent = toggleTangent?.checked !== false;
    const yMin = showUr && mode === "discharge" ? -E * 1.12 : 0;
    const yMax = Math.max(1, E * 1.18, ucInitial * 1.1);
    const pad = { left: 64, right: 26, top: 34, bottom: 48 };
    const gw = Math.max(1, w - pad.left - pad.right);
    const gh = Math.max(1, h - pad.top - pad.bottom);

    const mapX = (t) => pad.left + (t / maxTime) * gw;
    const mapY = (u) => pad.top + gh - ((u - yMin) / (yMax - yMin)) * gh;

    ctx.strokeStyle = grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 6; i += 1) {
      const y = pad.top + (gh / 6) * i;
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
    }
    for (let i = 0; i <= 8; i += 1) {
      const x = pad.left + (gw / 8) * i;
      ctx.moveTo(x, pad.top);
      ctx.lineTo(x, h - pad.bottom);
    }
    ctx.stroke();

    ctx.strokeStyle = text;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, h - pad.bottom);
    ctx.lineTo(w - pad.right, h - pad.bottom);
    ctx.stroke();

    ctx.fillStyle = muted;
    ctx.font = "12px Inter, system-ui, sans-serif";
    ctx.fillText("tensions (V)", 10, pad.top + 12);
    ctx.fillText("t (s)", w - 50, h - 14);

    for (let i = 0; i <= 6; i += 1) {
      const value = yMax - ((yMax - yMin) * i) / 6;
      ctx.fillText(frNumber(value, 1), 18, pad.top + (gh / 6) * i + 4);
    }
    for (let i = 0; i <= 8; i += 2) {
      ctx.fillText(frNumber((maxTime * i) / 8, 1), pad.left + (gw / 8) * i - 10, h - 22);
    }

    const yZero = mapY(0);
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "rgba(30, 41, 59, 0.35)";
    ctx.beginPath();
    ctx.moveTo(pad.left, yZero);
    ctx.lineTo(w - pad.right, yZero);
    ctx.stroke();
    ctx.restore();

    drawGuides(ctx, mapX, mapY, pad, w, h, warning, success, muted);

    if (showUr) drawCurve(ctx, mapX, mapY, resistorVoltageAt, success, "uR");
    if (showUc) drawCurve(ctx, mapX, mapY, tensionAt, primary, "uC");
    if (showTangent) drawTangent(ctx, mapX, mapY, warning);

    drawLegend(ctx, pad.left + 8, pad.top + 14, [
      showUc ? { color: primary, label: "uC" } : null,
      showUr ? { color: success, label: "uR" } : null,
      showTangent ? { color: warning, label: "tangente" } : null,
    ].filter(Boolean));

    if (showUc) drawPoint(ctx, mapX(time), mapY(uc), primary);
    if (showUr) drawPoint(ctx, mapX(time), mapY(resistorVoltageAt(time)), success);
  }

  function drawGuides(ctx, mapX, mapY, pad, w, h, warning, success, muted) {
    ctx.save();
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = warning;
    ctx.beginPath();
    ctx.moveTo(mapX(tau), pad.top);
    ctx.lineTo(mapX(tau), h - pad.bottom);
    ctx.stroke();
    ctx.strokeStyle = success;
    ctx.beginPath();
    ctx.moveTo(mapX(5 * tau), pad.top);
    ctx.lineTo(mapX(5 * tau), h - pad.bottom);
    ctx.stroke();
    ctx.strokeStyle = "rgba(79, 70, 229, 0.35)";
    ctx.beginPath();
    ctx.moveTo(pad.left, mapY(targetAtTau()));
    ctx.lineTo(w - pad.right, mapY(targetAtTau()));
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = warning;
    ctx.font = "bold 12px Inter, system-ui, sans-serif";
    ctx.fillText("τ", mapX(tau) - 3, h - 20);
    ctx.fillStyle = success;
    ctx.fillText("5τ", mapX(5 * tau) - 8, h - 20);
    ctx.fillStyle = muted;
    ctx.fillText(mode === "charge" ? "63 %" : "37 %", pad.left + 8, mapY(targetAtTau()) - 6);
  }

  function drawCurve(ctx, mapX, mapY, valueAt, color) {
    drawCurvePath(ctx, mapX, mapY, valueAt, maxTime, color, 0.25, 2);
    drawCurvePath(ctx, mapX, mapY, valueAt, Math.max(0.001, time), color, 1, 3.5);
  }

  function drawCurvePath(ctx, mapX, mapY, valueAt, endTime, color, alpha, lineWidth) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    for (let i = 0; i <= 260; i += 1) {
      const t = (endTime * i) / 260;
      const x = mapX(t);
      const y = mapY(valueAt(t));
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawTangent(ctx, mapX, mapY, color) {
    ctx.save();
    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    if (mode === "charge") {
      ctx.moveTo(mapX(0), mapY(0));
      ctx.lineTo(mapX(tau), mapY(E));
    } else {
      ctx.moveTo(mapX(0), mapY(E));
      ctx.lineTo(mapX(tau), mapY(0));
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawLegend(ctx, x, y, items) {
    items.forEach((item, index) => {
      const left = x + index * 86;
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(left + 24, y);
      ctx.stroke();
      ctx.fillStyle = getThemeColor("--text-secondary", "#475569");
      ctx.font = "bold 12px Inter, system-ui, sans-serif";
      ctx.fillText(item.label, left + 30, y + 4);
    });
  }

  function drawPoint(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  function updateAll() {
    uc = tensionAt(time);
    updateTimeSlider();
    updateMeasurements();
    updateCharges();
    updateElectrons();
    drawGraph();
    updateObservation();
    if (btnToggle) btnToggle.textContent = toggleLabel();
  }

  function updateFrame(now) {
    const dt = Math.min(0.06, (now - lastFrame) / 1000);
    lastFrame = now;
    time = Math.min(maxTime, time + dt * (maxTime / 6) * speed);
    updateAll();
    if (time >= maxTime) setPaused(true);
  }

  [sliderE, sliderR, sliderC].forEach((slider) => {
    runtime.on(slider, "input", () => {
      readValues();
      setPaused(true);
      resetCurve();
    });
  });

  runtime.on(sliderSpeed, "input", readValues);
  runtime.on(sliderTime, "input", () => {
    setPaused(true);
    time = (Number(sliderTime.value) / 1000) * maxTime;
    updateAll();
  });
  [toggleUc, toggleUr, toggleTangent].forEach((toggle) => runtime.on(toggle, "change", drawGraph));
  runtime.on(btnCharge, "click", () => {
    setPaused(true);
    setMode("charge");
  });
  runtime.on(btnDischarge, "click", () => {
    setPaused(true);
    setMode("discharge");
  });
  runtime.on(btnToggle, "click", () => {
    if (isPaused && time >= maxTime - 0.001) resetCurve();
    setPaused(!isPaused);
  });
  runtime.on(btnReset, "click", () => {
    setPaused(true);
    resetCurve();
  });

  readValues();
  setMode("charge");
  setPaused(true);
  updateAll();

  runtime.frame((now) => {
    if (isPaused) {
      lastFrame = now;
      drawGraph();
      return;
    }
    updateFrame(now);
  });
});
