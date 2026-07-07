import { createLabRuntime, fitCanvas, frNumber, onLabReady, prefersReducedMotion } from "./lab-utils.js";

onLabReady('[data-lab-app="lois-kepler"]', (root) => {
  const q = (selector) => root.querySelector(selector);
  const TAU = Math.PI * 2;
  const MU = 4 * Math.PI * Math.PI;

  const scene = q("#scene");
  const canvas = q("#keplerCanvas");
  const aSlider = q("#aSlider");
  const eSlider = q("#eSlider");
  const speedSlider = q("#timeSpeed");
  const dtSlider = q("#dtSlider");
  const btnMeasure = q("#btnMeasure");
  const btnClearAreas = q("#btnClearAreas");
  const btnToggle = q("#btnKeplerToggle");
  const btnReset = q("#btnKeplerReset");
  const overlay = q("#recordingOverlay");
  const observation = q("#keplerObservation");
  const speedVal = q("#speedVal");
  const periodNow = q("#periodNow");
  const valAreaGap = q("#valAreaGap");

  if (!scene || !canvas || !aSlider || !eSlider || !speedSlider || !dtSlider) return;

  const runtime = createLabRuntime(root);
  const reducedMotion = prefersReducedMotion();
  let canvasState = fitCanvas(canvas);
  let t = 0;
  let recordedAreas = [];
  let isPaused = true;
  let lastFrame = performance.now();

  runtime.observe(canvas, () => {
    canvasState = fitCanvas(canvas);
    draw();
  });

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function normalizeAngle(angle) {
    return ((((angle + Math.PI) % TAU) + TAU) % TAU) - Math.PI;
  }

  function solveE(meanAnomaly, e) {
    const normalizedM = normalizeAngle(meanAnomaly);
    let eccentricAnomaly = normalizedM;
    for (let i = 0; i < 9; i += 1) {
      const f = eccentricAnomaly - e * Math.sin(eccentricAnomaly) - normalizedM;
      const fp = 1 - e * Math.cos(eccentricAnomaly);
      eccentricAnomaly -= f / fp;
    }
    return eccentricAnomaly;
  }

  function orbitPos(a, e, meanAnomaly) {
    const eccentricAnomaly = solveE(meanAnomaly, e);
    const b = semiMinorAxis(a, e);
    const x = a * (Math.cos(eccentricAnomaly) - e);
    const y = b * Math.sin(eccentricAnomaly);
    return { x, y, r: Math.hypot(x, y), eccentricAnomaly };
  }

  function semiMinorAxis(a, e) {
    return a * Math.sqrt(1 - e * e);
  }

  function orbitalSpeed(a, r) {
    return Math.sqrt(MU * (2 / r - 1 / a));
  }

  function getParams() {
    const a = Number(aSlider.value);
    const e = Number(eSlider.value) / 100;
    const period = Math.sqrt(a ** 3);
    return { a, e, period, n: TAU / period };
  }

  function syncMeasureDuration(period) {
    const min = 0.02;
    const max = Math.max(min, Math.min(0.5, period * 0.18));
    dtSlider.min = String(min);
    dtSlider.max = max.toFixed(2);
    dtSlider.step = "0.01";
    if (Number(dtSlider.value) > max) dtSlider.value = max.toFixed(2);
    if (Number(dtSlider.value) < min) dtSlider.value = String(min);
  }

  function areaForDuration(a, e, deltaM) {
    return 0.5 * a * semiMinorAxis(a, e) * deltaM;
  }

  function sectorArcLength(a, e, startM, endM) {
    let length = 0;
    let previous = orbitPos(a, e, startM);
    const steps = 140;
    for (let i = 1; i <= steps; i += 1) {
      const p = orbitPos(a, e, startM + ((endM - startM) * i) / steps);
      length += Math.hypot(p.x - previous.x, p.y - previous.y);
      previous = p;
    }
    return length;
  }

  function makeSectorRecord(index, startM, deltaM, a, e, dt) {
    const endM = startM + deltaM;
    const area = areaForDuration(a, e, deltaM);
    const speed = sectorArcLength(a, e, startM, endM) / dt;
    const nearSun = index === 0;
    return {
      startM,
      endM,
      area,
      speed,
      color: nearSun ? "#f59e0b" : "#ec4899",
      fill: nearSun ? "rgba(245, 158, 11, 0.3)" : "rgba(236, 72, 153, 0.3)",
      labelA: nearSun ? "A" : "C",
      labelB: nearSun ? "B" : "D",
      title: nearSun ? "près du Soleil" : "loin du Soleil",
    };
  }

  function updateAreaReadouts() {
    [1, 2].forEach((index) => {
      const record = recordedAreas[index - 1];
      q(`#valA${index}`).textContent = record ? `${frNumber(record.area, 3)} UA²` : "—";
      q(`#valV${index}`).textContent = record ? `${frNumber(record.speed, 2)} UA/an` : "—";
    });

    if (!valAreaGap) return;
    if (recordedAreas.length < 2) {
      valAreaGap.textContent = "—";
      return;
    }

    const [a1, a2] = recordedAreas.map((record) => record.area);
    const mean = (a1 + a2) / 2;
    const gap = mean === 0 ? 0 : (Math.abs(a1 - a2) / mean) * 100;
    valAreaGap.textContent = `${frNumber(gap, 2)} %`;
  }

  function updateMeasureButton() {
    if (!btnMeasure) return;
    btnMeasure.textContent = recordedAreas.length >= 2 ? "Recalculer les aires" : "Comparer deux aires";
    btnMeasure.classList.toggle("is-active", recordedAreas.length < 2);
  }

  function clearAreas() {
    recordedAreas = [];
    updateAreaReadouts();
    updateMeasureButton();
    updateObservation();
    draw();
  }

  function compareAreas() {
    const { a, e, n } = getParams();
    const dt = Number(dtSlider.value);
    const deltaM = n * dt;

    recordedAreas = [
      makeSectorRecord(0, -deltaM / 2, deltaM, a, e, dt),
      makeSectorRecord(1, Math.PI - deltaM / 2, deltaM, a, e, dt),
    ];

    updateAreaReadouts();
    updateMeasureButton();
    updateObservation();
    draw();

    if (overlay) {
      overlay.classList.remove("hidden");
      overlay.textContent = "Deux secteurs de même durée affichés";
      runtime.later(() => overlay.classList.add("hidden"), 850);
    }
  }

  function setPaused(nextPaused) {
    isPaused = nextPaused;
    root.classList.toggle("is-kepler-running", !isPaused);
    root.classList.toggle("is-kepler-paused", isPaused);
    if (!btnToggle) return;
    btnToggle.textContent = isPaused ? "Lancer" : "Pause";
    btnToggle.setAttribute("aria-pressed", String(!isPaused));
    btnToggle.classList.toggle("is-active", !isPaused);
  }

  function resetSimulation() {
    t = 0;
    setPaused(true);
    clearAreas();
    updateValues();
    draw();
  }

  function updateValues() {
    const { a, e, period } = getParams();
    syncMeasureDuration(period);
    q("#aVal").textContent = frNumber(a, 1);
    q("#eVal").textContent = frNumber(e, 2);
    q("#dtVal").textContent = frNumber(Number(dtSlider.value), 2);
    q("#k3-a").textContent = frNumber(a, 2);
    q("#k3-a3").textContent = frNumber(a ** 3, 2);
    q("#k3-t").textContent = frNumber(period, 2);
    q("#k3-t2").textContent = frNumber(period ** 2, 2);
    q("#valKepler3").textContent = frNumber((period ** 2) / (a ** 3), 3);
    if (speedVal) speedVal.textContent = `${frNumber(Number(speedSlider.value) / 100, 1)}×`;
    if (periodNow) periodNow.textContent = frNumber(period, 2);
    updateObservation();
  }

  function updateObservation() {
    if (!observation) return;
    const { a, e, period } = getParams();
    if (recordedAreas.length >= 2) {
      const nearSpeed = recordedAreas[0].speed;
      const farSpeed = recordedAreas[1].speed;
      observation.textContent = `Même Δt : les aires sont égales, mais la vitesse moyenne est plus grande près du Soleil (${frNumber(nearSpeed, 2)} contre ${frNumber(farSpeed, 2)} UA/an).`;
      return;
    }

    observation.textContent = `a = ${frNumber(a, 1)} UA, e = ${frNumber(e, 2)}, T ≈ ${frNumber(period, 2)} ans. Clique sur « Comparer deux aires ».`;
  }

  function drawArrow(ctx, x1, y1, x2, y2, color) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - Math.cos(angle - 0.5) * 12, y2 - Math.sin(angle - 0.5) * 12);
    ctx.lineTo(x2 - Math.cos(angle + 0.5) * 12, y2 - Math.sin(angle + 0.5) * 12);
    ctx.closePath();
    ctx.fill();
  }

  function drawLabel(ctx, text, x, y, color = "#e5edff") {
    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.76)";
    ctx.strokeStyle = "rgba(255,255,255,0.16)";
    ctx.lineWidth = 1;
    ctx.font = "bold 13px Inter, system-ui, sans-serif";
    const width = ctx.measureText(text).width + 16;
    ctx.beginPath();
    ctx.roundRect(x, y - 18, width, 24, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.fillText(text, x + 8, y);
    ctx.restore();
  }

  function drawSector(ctx, record, a, e, cx, cy, scale) {
    ctx.save();
    ctx.fillStyle = record.fill;
    ctx.strokeStyle = record.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    const steps = 90;
    for (let i = 0; i <= steps; i += 1) {
      const p = orbitPos(a, e, record.startM + ((record.endM - record.startM) * i) / steps);
      ctx.lineTo(cx + p.x * scale, cy - p.y * scale);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    const start = orbitPos(a, e, record.startM);
    const end = orbitPos(a, e, record.endM);
    const sx = cx + start.x * scale;
    const sy = cy - start.y * scale;
    const ex = cx + end.x * scale;
    const ey = cy - end.y * scale;

    ctx.fillStyle = record.color;
    ctx.beginPath();
    ctx.arc(sx, sy, 5, 0, TAU);
    ctx.arc(ex, ey, 5, 0, TAU);
    ctx.fill();
    ctx.font = "bold 15px Inter, system-ui, sans-serif";
    ctx.fillText(record.labelA, sx + 9, sy - 8);
    ctx.fillText(record.labelB, ex + 9, ey - 8);

    const mid = orbitPos(a, e, (record.startM + record.endM) / 2);
    drawLabel(ctx, record.title, cx + mid.x * scale + 8, cy - mid.y * scale - 8, record.color);
    ctx.restore();
  }

  function drawOrbit(ctx, a, e, cx, cy, scale) {
    ctx.strokeStyle = "rgba(226, 232, 240, 0.62)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 360; i += 1) {
      const p = orbitPos(a, e, (TAU * i) / 360);
      const x = cx + p.x * scale;
      const y = cy - p.y * scale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  function drawFocusAndCenter(ctx, a, e, cx, cy, scale) {
    const centerX = cx - a * e * scale;

    ctx.save();
    ctx.strokeStyle = "rgba(226, 232, 240, 0.32)";
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(centerX, cy - 8);
    ctx.lineTo(centerX, cy + 8);
    ctx.moveTo(centerX - 8, cy);
    ctx.lineTo(centerX + 8, cy);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.arc(cx, cy, 13, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "rgba(250, 204, 21, 0.18)";
    ctx.beginPath();
    ctx.arc(cx, cy, 29, 0, TAU);
    ctx.fill();
    drawLabel(ctx, "Soleil : foyer", cx + 16, cy - 18, "#fde68a");
    ctx.restore();
  }

  function draw() {
    const { ctx, width: w, height: h } = canvasState;
    const { a, e, n, period } = getParams();
    const cx = w / 2;
    const cy = h / 2 + 6;
    const scale = Math.min(w, h) * 0.43 / (a * (1 + e));

    ctx.clearRect(0, 0, w, h);

    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, "#101827");
    bg.addColorStop(0.58, "#172036");
    bg.addColorStop(1, "#0f172a");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    recordedAreas.forEach((record) => drawSector(ctx, record, a, e, cx, cy, scale));
    drawOrbit(ctx, a, e, cx, cy, scale);
    drawFocusAndCenter(ctx, a, e, cx, cy, scale);

    const m = n * t;
    const p = orbitPos(a, e, m);
    const next = orbitPos(a, e, m + 0.018);
    const px = cx + p.x * scale;
    const py = cy - p.y * scale;

    ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.stroke();

    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.arc(px, py, 9, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#e0f2fe";
    ctx.lineWidth = 2;
    ctx.stroke();
    drawArrow(ctx, px, py, px + (next.x - p.x) * scale * 7.5, py - (next.y - p.y) * scale * 7.5, "#22d3ee");

    q("#rNow").textContent = frNumber(p.r, 2);
    q("#vNow").textContent = frNumber(orbitalSpeed(a, p.r), 2);
    if (periodNow) periodNow.textContent = frNumber(period, 2);
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - lastFrame) / 1000);
    lastFrame = now;
    if (!isPaused) {
      const speed = Number(speedSlider.value) / 100;
      t += dt * speed * getParams().period * 0.14;
    }
    draw();
  }

  [aSlider, eSlider].forEach((slider) => {
    runtime.on(slider, "input", () => {
      updateValues();
      clearAreas();
    });
  });

  runtime.on(dtSlider, "input", () => {
    updateValues();
    if (recordedAreas.length >= 2) compareAreas();
  });
  runtime.on(speedSlider, "input", () => {
    updateValues();
    updateObservation();
  });
  runtime.on(btnMeasure, "click", compareAreas);
  runtime.on(btnClearAreas, "click", clearAreas);
  runtime.on(btnToggle, "click", () => setPaused(!isPaused));
  runtime.on(btnReset, "click", resetSimulation);

  updateValues();
  setPaused(true);
  clearAreas();
  draw();
  runtime.frame(frame);
});
