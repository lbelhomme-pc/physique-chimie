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

window.onload = () => {
    initChart();
    updateSystem();
    document.getElementById("alert-msg").innerText = "⚠️ Attention : Le pH-mètre n'est pas étalonné !";
};

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
    if(currentPH < 0) currentPH = 0.0;
    if(currentPH > 14) currentPH = 14.0;

    // Précision "pH =" ajoutée ici
    phMeterEl.innerText = "pH = " + currentPH.toFixed(2);
    document.getElementById('vol-display').innerText = currentV.toFixed(2);
    
    const pctV = (currentV / 25) * 100;
    document.getElementById('burette-liquid').style.height = `${100 - pctV}%`;
    document.getElementById('beaker-liquid').style.height = `${40 + (pctV * 0.4)}%`;
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
    
    if(dataPoints.length === 0 || dataPoints[dataPoints.length - 1].v !== point.v) {
        dataPoints.push(point);
        updateTableAndChart();
    }
    
    if (currentV >= 25 && !linesDrawn && isCalibrated && isAgitating) {
        drawFinalLines();
    }
}

// =========================================================
// TRACÉ FINAL : ÉQUIVALENCE, PKA ET MÉTHODE DES TANGENTES
// =========================================================
function drawFinalLines() {
    linesDrawn = true;
    const ve = scenario.Ve;
    const vHalf = ve / 2;
    const pka = scenario.pKa;

    let Ceq = (scenario.Ca * scenario.Va) / (scenario.Va + ve);
    let phEq = 7 + 0.5 * pka + 0.5 * Math.log10(Ceq);

    // 1. Ligne de l'Équivalence (Vert)
    phChart.data.datasets.push({
        label: 'Équivalence (VE, pHE)',
        data: [ { x: ve, y: 0 }, { x: ve, y: phEq }, { x: 0, y: phEq } ],
        borderColor: '#10b981', borderWidth: 2, borderDash: [5, 5], fill: false,
        pointRadius: [0, 6, 0], pointBackgroundColor: '#10b981', type: 'line', yAxisID: 'y'
    });

    // 2. Ligne du pKa (Orange)
    phChart.data.datasets.push({
        label: 'Demi-équivalence (pKa)',
        data: [ { x: vHalf, y: 0 }, { x: vHalf, y: pka }, { x: 0, y: pka } ],
        borderColor: '#f59e0b', borderWidth: 2, borderDash: [5, 5], fill: false,
        pointRadius: [0, 6, 0], pointBackgroundColor: '#f59e0b', type: 'line', yAxisID: 'y'
    });

    // 3. LA MÉTHODE DES TANGENTES (Violet)
    // On prend les points de courbure (coude) un peu avant et après l'équivalence
    let vKnee1 = Math.max(0.5, ve - 2.0);
    let vKnee2 = Math.min(24.5, ve + 2.0);

    let phKnee1 = calculateExactPH(vKnee1);
    let phKnee2 = calculateExactPH(vKnee2);

    // Calcul de la pente locale m au premier coude
    let m = (calculateExactPH(vKnee1 + 0.1) - calculateExactPH(vKnee1 - 0.1)) / 0.2;

    // Équations des 3 droites : y = mx + b
    let b1 = phKnee1 - m * vKnee1;
    let b2 = phKnee2 - m * vKnee2;
    let b3 = (b1 + b2) / 2; // Tangente du milieu

    // Fonction pour dessiner les tangentes UNIQUEMENT autour du saut (pas sur tout l'écran)
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

    // 4. Remplissage de la boîte des résultats et calculs
    document.getElementById('final-results-box').style.display = 'block';
    document.getElementById('res-ve').innerText = ve.toFixed(2);
    document.getElementById('res-phe').innerText = phEq.toFixed(2);
    document.getElementById('res-vhalf').innerText = vHalf.toFixed(2);
    document.getElementById('res-pka').innerText = pka.toFixed(2);
    
    // Remplissage du détail mathématique
    document.getElementById('res-ca').innerText = scenario.Ca.toFixed(4);
    document.getElementById('calc-cb').innerText = scenario.Cb.toFixed(3);
    document.getElementById('calc-ve').innerText = ve.toFixed(2);
    document.getElementById('calc-va').innerText = scenario.Va.toFixed(1);
}

function toggleStirrer() {
    isAgitating = !isAgitating;
    const btn = document.getElementById('btn-stir');
    const bar = document.getElementById('stir-bar');
    const liquid = document.getElementById('beaker-liquid'); // On cible le liquide
    
    if (isAgitating) {
        btn.classList.add('active'); btn.innerText = "🛑 Arrêter l'agitation";
        bar.classList.add('stirring');
        liquid.classList.add('vortex'); // On creuse le liquide
        document.getElementById("alert-msg").innerText = isCalibrated ? "✅ Conditions optimales." : "⚠️ Pense à étalonner ton pH-mètre !";
    } else {
        btn.classList.remove('active'); btn.innerText = "🌪️ Activer l'agitation";
        bar.classList.remove('stirring');
        liquid.classList.remove('vortex'); // On aplatit le liquide
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
    
    document.getElementById('btn-calib').style.display = 'inline-block';
    document.getElementById('btn-stir').classList.remove('active');
    document.getElementById('btn-stir').innerText = "🌪️ Activer l'agitation";
    document.getElementById('stir-bar').classList.remove('stirring');
    document.getElementById('beaker-liquid').classList.remove('vortex'); // On aplatit le liquide au reset
    document.getElementById("alert-msg").innerText = "⚠️ Attention : Le pH-mètre n'est pas étalonné !";
    document.getElementById('final-results-box').style.display = 'none';
    
    while(phChart.data.datasets.length > 2) {
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
    
    let drop = document.getElementById('drop');
    drop.classList.remove('falling');
    void drop.offsetWidth; 
    drop.classList.add('falling');

    currentV += amount;
    updateSystem();
    recordDataPoint();
}

function toggleAutoTitrate() {
    const btn = document.getElementById('btn-auto');
    if (autoTitrateInterval) {
        clearInterval(autoTitrateInterval);
        autoTitrateInterval = null;
        btn.classList.remove('danger'); btn.innerText = "🤖 Démarrer Auto-Titrage";
        return;
    }
    btn.classList.add('danger'); btn.innerText = "⏸️ Stopper le titrage";
    
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
                { label: 'pH = f(V)', data: [], borderColor: '#3b82f6', backgroundColor: '#3b82f6', yAxisID: 'y', tension: 0.2, pointRadius: 3 },
                { label: 'dpH/dV (Dérivée)', data: [], borderColor: '#f43f5e', backgroundColor: 'rgba(244, 63, 94, 0.2)', fill: true, yAxisID: 'y1', type: 'line', tension: 0.3, pointRadius: 0, borderDash: [5, 5] }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                x: { type: 'linear', title: { display: true, text: 'Volume ajouté (mL)' }, min: 0, max: 25 },
                y: { title: { display: true, text: 'pH' }, min: 0, max: 14, position: 'left' },
                y1: { title: { display: true, text: 'Dérivée dpH/dV' }, position: 'right', grid: { drawOnChartArea: false }, min: 0 }
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
    dataPoints.forEach(p => { if (p.dpH > maxDeriv) { maxDeriv = p.dpH; equivV = p.v; }});

    for (let i = dataPoints.length - 1; i >= 0; i--) {
        let p = dataPoints[i];
        let row = document.createElement('tr');
        if (p.v === equivV && maxDeriv > 2) row.classList.add('row-equiv'); 
        row.innerHTML = `<td>${p.v.toFixed(2)}</td><td>${p.ph.toFixed(2)}</td><td>${p.dpH.toFixed(2)}</td>`;
        tbody.appendChild(row);
    }
}