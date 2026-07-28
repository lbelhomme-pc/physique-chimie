// =========================================
// MOTEUR DU LABORATOIRE : TITRAGE PH-MÉTRIQUE
// =========================================

const scenario = {
    Ca: 0.0744,
    Va: 25.0,
    Cb: 0.100,
    pKa: 4.76,
    Ve: 18.6
};

let currentV = 0.0;
let currentPH = 0.0;
let dataPoints = [];
let isAgitating = false;
let isCalibrated = false;
let calibOffset = 0.4;
let autoTitrateInterval = null;
let linesDrawn = false;

let phChart = null;
let bubbleInterval = null;

window.onload = () => {
    initSceneDecor();
    initChart();
    updateSystem();
    document.getElementById("alert-msg").innerText = "⚠️ Attention : Le pH-mètre n'est pas étalonné !";
};

function initSceneDecor() {
    const setup = document.querySelector('.lab-setup');
    const beaker = document.querySelector('.beaker');
    if (!setup || !beaker) return;

    if (!setup.querySelector('.drop-trail')) {
        const trail = document.createElement('div');
        trail.className = 'drop-trail';
        setup.prepend(trail);
    }
    if (!setup.querySelector('.beaker-splashes')) {
        const splashes = document.createElement('div');
        splashes.className = 'beaker-splashes';
        setup.prepend(splashes);
    }
    if (!beaker.querySelector('.beaker-effects')) {
        const fx = document.createElement('div');
        fx.className = 'beaker-effects';
        beaker.appendChild(fx);
    }
    if (!beaker.querySelector('.fizz-layer')) {
        const fizz = document.createElement('div');
        fizz.className = 'fizz-layer';
        beaker.appendChild(fizz);
    }

    syncVisualGeometry();
    window.addEventListener('resize', syncVisualGeometry);
}

function getSceneMetrics() {
    const setup = document.querySelector('.lab-setup');
    const beaker = document.querySelector('.beaker');
    const liquid = document.getElementById('beaker-liquid');
    const drop = document.getElementById('drop');
    const stopcock = document.querySelector('.stopcock');
    if (!setup || !beaker || !liquid || !drop || !stopcock) return null;

    const setupRect = setup.getBoundingClientRect();
    const beakerRect = beaker.getBoundingClientRect();
    const liquidRect = liquid.getBoundingClientRect();
    const stopcockRect = stopcock.getBoundingClientRect();

    const surfaceY = liquidRect.top - setupRect.top - 4;
    const impactX = beakerRect.left - setupRect.left + beakerRect.width / 2;
    const nozzleX = stopcockRect.left - setupRect.left + stopcockRect.width / 2;
    const nozzleY = stopcockRect.top - setupRect.top + stopcockRect.height + 14;
    const dropStartY = nozzleY;

    return {
        setup,
        beaker,
        liquid,
        surfaceY,
        beakerSurfaceLocal: surfaceY - (beakerRect.top - setupRect.top),
        impactX,
        nozzleX,
        nozzleY,
        dropStartY,
        travel: Math.max(22, surfaceY - dropStartY + 1)
    };
}

function syncVisualGeometry() {
    const m = getSceneMetrics();
    if (!m) return;
    m.setup.style.setProperty('--surface-y', `${m.surfaceY}px`);
    m.setup.style.setProperty('--drop-travel', `${m.travel}px`);
    m.beaker.style.setProperty('--beaker-surface-local', `${m.beakerSurfaceLocal}px`);
}


function applySettings() {
    let nCa = parseFloat(document.getElementById('input-ca').value);
    let nVa = parseFloat(document.getElementById('input-va').value);
    let nCb = parseFloat(document.getElementById('input-cb').value);
    let npKa = parseFloat(document.getElementById('input-pka').value);

    let testVe = (nCa * nVa) / nCb;
    if (testVe > 24.5) {
        alert("⚠️ Impossible ! Avec ces valeurs, le volume à l'équivalence dépasse la capacité de la burette (25 mL). Augmente la concentration CB ou diminue CA / VA.");
        return;
    }

    scenario.Ca = nCa;
    scenario.Va = nVa;
    scenario.Cb = nCb;
    scenario.pKa = npKa;
    scenario.Ve = testVe;

    document.getElementById('cond-va').innerText = nVa.toFixed(1);
    document.getElementById('cond-cb').innerText = nCb.toFixed(3);

    resetLab();
}

function calculateExactPH(V) {
    const { Ca, Va, Cb, pKa, Ve } = scenario;
    if (V === 0) return 0.5 * (pKa - Math.log10(Ca));
    if (V < Ve - 0.05) {
        let ratio = V / (Ve - V);
        let phHH = pKa + Math.log10(ratio);
        if (V < 1) {
            let ph0 = 0.5 * (pKa - Math.log10(Ca));
            return ph0 + (phHH - ph0) * (V / 1);
        }
        return phHH;
    }
    if (V > Ve + 0.05) {
        let OH = (Cb * (V - Ve)) / (Va + V);
        return 14 + Math.log10(OH);
    }
    let Ceq = (Ca * Va) / (Va + Ve);
    let phEq = 7 + 0.5 * pKa + 0.5 * Math.log10(Ceq);
    if (V === Ve) return phEq;
    if (V < Ve) {
        let ph1 = pKa + Math.log10((Ve - 0.05) / 0.05);
        let t = (V - (Ve - 0.05)) / 0.05;
        return ph1 + t * (phEq - ph1);
    } else {
        let OH2 = (Cb * 0.05) / (Va + Ve + 0.05);
        let ph2 = 14 + Math.log10(OH2);
        let t = (V - Ve) / 0.05;
        return phEq + t * (ph2 - phEq);
    }
}

function updateSystem() {
    let theoreticalPH = calculateExactPH(currentV);
    let noise = 0;
    const phMeterEl = document.getElementById('ph-display');

    if (!isAgitating && currentV > 0) {
        noise = (Math.random() - 0.5) * 1.5;
        phMeterEl.classList.add('unstable');
    } else {
        phMeterEl.classList.remove('unstable');
        noise = (Math.random() - 0.5) * 0.04;
    }

    currentPH = theoreticalPH + noise + calibOffset;
    if (currentPH < 0) currentPH = 0.0;
    if (currentPH > 14) currentPH = 14.0;

    phMeterEl.innerText = "pH = " + currentPH.toFixed(2);
    document.getElementById('vol-display').innerText = currentV.toFixed(2);

    const pctV = (currentV / 25) * 100;
    document.getElementById('burette-liquid').style.height = `${100 - pctV}%`;
    document.getElementById('beaker-liquid').style.height = `${40 + (pctV * 0.4)}%`;
    requestAnimationFrame(syncVisualGeometry);
}

function recordDataPoint() {
    let deriv = 0;
    if (dataPoints.length > 0) {
        let lastObj = dataPoints[dataPoints.length - 1];
        let dV = currentV - lastObj.v;
        let dpH = currentPH - lastObj.ph;
        if (dV > 0) deriv = dpH / dV;
    }
    let point = { v: parseFloat(currentV.toFixed(2)), ph: parseFloat(currentPH.toFixed(2)), dpH: parseFloat(deriv.toFixed(2)) };

    if (dataPoints.length === 0 || dataPoints[dataPoints.length - 1].v !== point.v) {
        dataPoints.push(point);
        updateTableAndChart();
    }

    if (currentV >= 25 && !linesDrawn && isCalibrated && isAgitating) {
        drawFinalLines();
    }
}

function drawFinalLines() {
    linesDrawn = true;
    const ve = scenario.Ve;
    const vHalf = ve / 2;
    const pka = scenario.pKa;

    let Ceq = (scenario.Ca * scenario.Va) / (scenario.Va + ve);
    let phEq = 7 + 0.5 * pka + 0.5 * Math.log10(Ceq);

    phChart.data.datasets.push({
        label: 'Équivalence (VE, pHE)',
        data: [{ x: ve, y: 0 }, { x: ve, y: phEq }, { x: 0, y: phEq }],
        borderColor: '#10b981', borderWidth: 2, borderDash: [5, 5], fill: false,
        pointRadius: [0, 6, 0], pointBackgroundColor: '#10b981', type: 'line', yAxisID: 'y'
    });

    phChart.data.datasets.push({
        label: 'Demi-équivalence (pKa)',
        data: [{ x: vHalf, y: 0 }, { x: vHalf, y: pka }, { x: 0, y: pka }],
        borderColor: '#f59e0b', borderWidth: 2, borderDash: [5, 5], fill: false,
        pointRadius: [0, 6, 0], pointBackgroundColor: '#f59e0b', type: 'line', yAxisID: 'y'
    });

    let vKnee1 = Math.max(0.5, ve - 2.0);
    let vKnee2 = Math.min(24.5, ve + 2.0);

    let phKnee1 = calculateExactPH(vKnee1);
    let phKnee2 = calculateExactPH(vKnee2);

    let m = (calculateExactPH(vKnee1 + 0.1) - calculateExactPH(vKnee1 - 0.1)) / 0.2;

    let b1 = phKnee1 - m * vKnee1;
    let b2 = phKnee2 - m * vKnee2;
    let b3 = (b1 + b2) / 2;

    const getTangentSegment = (b) => [
        { x: ve - 4, y: m * (ve - 4) + b },
        { x: ve + 4, y: m * (ve + 4) + b }
    ];

    phChart.data.datasets.push({
        label: 'Tangentes',
        data: getTangentSegment(b1),
        borderColor: 'rgba(139, 92, 246, 0.6)', borderWidth: 1, fill: false, pointRadius: 0, type: 'line', yAxisID: 'y'
    });
    phChart.data.datasets.push({
        label: '',
        data: getTangentSegment(b2),
        borderColor: 'rgba(139, 92, 246, 0.6)', borderWidth: 1, fill: false, pointRadius: 0, type: 'line', yAxisID: 'y'
    });
    phChart.data.datasets.push({
        label: 'Tangente équidistante',
        data: getTangentSegment(b3),
        borderColor: 'rgba(139, 92, 246, 1)', borderWidth: 2, borderDash: [4, 4], fill: false, pointRadius: 0, type: 'line', yAxisID: 'y'
    });

    phChart.update();

    document.getElementById('final-results-box').style.display = 'block';
    document.getElementById('res-ve').innerText = ve.toFixed(2);
    document.getElementById('res-phe').innerText = phEq.toFixed(2);
    document.getElementById('res-vhalf').innerText = vHalf.toFixed(2);
    document.getElementById('res-pka').innerText = pka.toFixed(2);
    document.getElementById('res-ca').innerText = scenario.Ca.toFixed(4);
    document.getElementById('calc-cb').innerText = scenario.Cb.toFixed(3);
    document.getElementById('calc-ve').innerText = ve.toFixed(2);
    document.getElementById('calc-va').innerText = scenario.Va.toFixed(1);
}

function toggleStirrer() {
    isAgitating = !isAgitating;
    const btn = document.getElementById('btn-stir');
    const bar = document.getElementById('stir-bar');
    const liquid = document.getElementById('beaker-liquid');

    if (isAgitating) {
        btn.classList.add('active');
        btn.innerText = "🛑 Arrêter l'agitation";
        bar.classList.add('stirring');
        liquid.classList.add('vortex');
        startFizz();
        document.getElementById("alert-msg").innerText = isCalibrated ? "✅ Conditions optimales." : "⚠️ Pense à étalonner ton pH-mètre !";
    } else {
        btn.classList.remove('active');
        btn.innerText = "🌪️ Activer l'agitation";
        bar.classList.remove('stirring');
        liquid.classList.remove('vortex');
        stopFizz();
    }
    updateSystem();
}

function resetLab() {
    if (autoTitrateInterval) toggleAutoTitrate();

    currentV = 0.0;
    currentPH = 0.0;
    dataPoints = [];
    isAgitating = false;
    isCalibrated = false;
    calibOffset = 0.4;
    linesDrawn = false;
    stopFizz();
    clearVisualResidues();

    document.getElementById('btn-calib').style.display = 'inline-block';
    document.getElementById('btn-stir').classList.remove('active');
    document.getElementById('btn-stir').innerText = "🌪️ Activer l'agitation";
    document.getElementById('stir-bar').classList.remove('stirring');
    document.getElementById('beaker-liquid').classList.remove('vortex');
    document.getElementById("alert-msg").innerText = "⚠️ Attention : Le pH-mètre n'est pas étalonné !";
    document.getElementById('final-results-box').style.display = 'none';

    while (phChart.data.datasets.length > 2) {
        phChart.data.datasets.pop();
    }

    updateSystem();
    updateTableAndChart();
}

function calibrate() {
    isCalibrated = true;
    calibOffset = 0;
    document.getElementById("alert-msg").innerText = isAgitating ? "✅ pH-mètre étalonné avec succès." : "⚠️ pH-mètre étalonné, mais il faut agiter la solution.";
    document.getElementById('btn-calib').style.display = 'none';
    updateSystem();
}

function addVolume(amount) {
    if (currentV >= 25) return;
    if (currentV + amount > 25) amount = 25 - currentV;

    animateDropSequence(amount);

    currentV += amount;
    updateSystem();
    recordDataPoint();
}

function animateDropSequence(amount) {
    const drop = document.getElementById('drop');
    const m = getSceneMetrics();
    if (m) {
        drop.style.left = `${m.nozzleX - 4}px`;
        drop.style.top = `${m.nozzleY}px`;
        drop.style.setProperty('--drop-travel', `${m.travel}px`);
        m.setup.style.setProperty('--drop-travel', `${m.travel}px`);
    }

    drop.classList.remove('falling');
    void drop.offsetWidth;
    drop.classList.add('falling');

    const fragments = amount <= 0.05 ? 3 : amount < 0.5 ? 5 : 8;
    createDropTrail(fragments, m);
    window.setTimeout(() => createSplash(Math.max(1, Math.round(amount * 6))), 280);
}

function createDropTrail(count = 3, metrics = null) {
    const layer = document.querySelector('.drop-trail');
    if (!layer) return;

    const m = metrics || getSceneMetrics();
    const variants = ['falling-1', 'falling-2', 'falling-3'];
    for (let i = 0; i < count; i++) {
        const d = document.createElement('span');
        d.className = `trail-drop ${variants[i % variants.length]}`;
        d.style.animationDelay = `${i * 0.03}s`;
        if (m) {
            d.style.left = `${m.nozzleX + (Math.random() - 0.5) * 4}px`;
            d.style.top = `${m.nozzleY + 2}px`;
            d.style.setProperty('--drop-travel', `${Math.max(14, m.travel - 3 - i)}px`);
        }
        layer.appendChild(d);
        setTimeout(() => d.remove(), 700);
    }
}

function createSplash(intensity = 1) {
    const layer = document.querySelector('.beaker-splashes');
    const beakerFx = document.querySelector('.beaker-effects');
    const m = getSceneMetrics();
    if (!layer || !beakerFx || !m) return;

    const impactX = m.impactX;
    const impactY = m.surfaceY;

    const ring = document.createElement('span');
    ring.className = 'splash-ring animate';
    ring.style.left = `${impactX}px`;
    ring.style.top = `${impactY}px`;
    layer.appendChild(ring);
    setTimeout(() => ring.remove(), 700);

    const droplets = Math.min(2 + intensity, 5);
    for (let i = 0; i < droplets; i++) {
        const dot = document.createElement('span');
        dot.className = `splash-dot dot-${(i % 3) + 1}`;
        dot.style.left = `${impactX + (i - (droplets - 1) / 2) * 4}px`;
        dot.style.top = `${impactY - 1}px`;
        layer.appendChild(dot);
        setTimeout(() => dot.remove(), 650);
    }

    const inner = document.createElement('span');
    inner.className = 'liquid-impact';
    inner.style.top = `${m.beakerSurfaceLocal - 1}px`;
    beakerFx.appendChild(inner);
    setTimeout(() => inner.remove(), 720);
}

function startFizz() {
    stopFizz();
    bubbleInterval = setInterval(() => {
        const count = currentV < 1 ? 1 : currentV < scenario.Ve ? 2 : 3;
        for (let i = 0; i < count; i++) createBubble();
    }, 260);
}

function stopFizz() {
    if (bubbleInterval) {
        clearInterval(bubbleInterval);
        bubbleInterval = null;
    }
}

function createBubble() {
    const layer = document.querySelector('.fizz-layer');
    if (!layer) return;

    const bubble = document.createElement('span');
    bubble.className = 'fizz-bubble rise';
    const size = 3 + Math.random() * 5;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${18 + Math.random() * 64}%`;
    bubble.style.bottom = `${8 + Math.random() * 10}px`;
    bubble.style.setProperty('--bubble-rise', `${-26 - Math.random() * 42}px`);
    bubble.style.setProperty('--bubble-shift', `${-10 + Math.random() * 20}px`);
    bubble.style.setProperty('--bubble-dur', `${1.4 + Math.random() * 1.2}s`);
    layer.appendChild(bubble);
    setTimeout(() => bubble.remove(), 2600);
}

function clearVisualResidues() {
    ['.drop-trail', '.beaker-splashes', '.beaker-effects', '.fizz-layer'].forEach(selector => {
        document.querySelectorAll(selector).forEach(node => {
            if (node.classList.contains('drop-trail') || node.classList.contains('beaker-splashes') || node.classList.contains('beaker-effects') || node.classList.contains('fizz-layer')) {
                node.innerHTML = '';
            }
        });
    });
}

function toggleAutoTitrate() {
    const btn = document.getElementById('btn-auto');
    if (autoTitrateInterval) {
        clearInterval(autoTitrateInterval);
        autoTitrateInterval = null;
        btn.classList.remove('danger');
        btn.innerText = "🤖 Démarrer Auto-Titrage";
        return;
    }
    btn.classList.add('danger');
    btn.innerText = "⏸️ Stopper le titrage";

    autoTitrateInterval = setInterval(() => {
        if (currentV >= 25) {
            toggleAutoTitrate();
            return;
        }
        let step = 0.5;
        if (dataPoints.length > 1) {
            let slope = Math.abs(dataPoints[dataPoints.length - 1].ph - dataPoints[dataPoints.length - 2].ph);
            if (slope > 0.4) step = 0.05;
            else if (slope > 0.15) step = 0.2;
        }
        addVolume(step);
    }, 200);
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');
}

function initChart() {
    const ctx = document.getElementById('titrationChart').getContext('2d');
    phChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'pH = f(V)',
                    data: [],
                    borderColor: '#3b82f6',
                    backgroundColor: '#3b82f6',
                    yAxisID: 'y',
                    tension: 0.24,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    borderWidth: 3
                },
                {
                    label: 'dpH/dV (Dérivée)',
                    data: [],
                    borderColor: '#f43f5e',
                    backgroundColor: 'rgba(244, 63, 94, 0.18)',
                    fill: true,
                    yAxisID: 'y1',
                    type: 'line',
                    tension: 0.3,
                    pointRadius: 0,
                    borderDash: [5, 5],
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'nearest', intersect: false },
            plugins: {
                legend: {
                    labels: { usePointStyle: true, boxWidth: 10, font: { weight: 'bold' } }
                },
                tooltip: {
                    backgroundColor: 'rgba(15,23,42,0.92)',
                    padding: 12,
                    cornerRadius: 10,
                    displayColors: true
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    title: { display: true, text: 'Volume ajouté (mL)', font: { weight: 'bold' } },
                    min: 0,
                    max: 25,
                    grid: { color: 'rgba(148,163,184,0.14)' }
                },
                y: {
                    title: { display: true, text: 'pH', font: { weight: 'bold' } },
                    min: 0,
                    max: 14,
                    position: 'left',
                    grid: { color: 'rgba(148,163,184,0.16)' }
                },
                y1: {
                    title: { display: true, text: 'Dérivée dpH/dV', font: { weight: 'bold' } },
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    min: 0
                }
            }
        }
    });
}

function updateTableAndChart() {
    phChart.data.datasets[0].data = dataPoints.map(p => ({ x: p.v, y: p.ph }));
    phChart.data.datasets[1].data = dataPoints.map(p => ({ x: p.v, y: p.dpH }));
    phChart.update();

    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';

    let maxDeriv = 0;
    let equivV = 0;
    dataPoints.forEach(p => { if (p.dpH > maxDeriv) { maxDeriv = p.dpH; equivV = p.v; } });

    for (let i = dataPoints.length - 1; i >= 0; i--) {
        let p = dataPoints[i];
        let row = document.createElement('tr');
        if (p.v === equivV && maxDeriv > 2) row.classList.add('row-equiv');
        row.innerHTML = `<td>${p.v.toFixed(2)}</td><td>${p.ph.toFixed(2)}</td><td>${p.dpH.toFixed(2)}</td>`;
        tbody.appendChild(row);
    }
}
