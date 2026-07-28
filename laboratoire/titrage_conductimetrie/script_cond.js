// =========================================
// MOTEUR DU LABORATOIRE : TITRAGE CONDUCTIMÉTRIQUE (Précipitation)
// =========================================

const scenario = {
    Ca: 0.010,    // Concentration Chlorure (Cl-)
    Va: 20.0,     // Volume Chlorure
    Cb: 0.020,    // Concentration Argent (Ag+)
    Veau: 200.0,  // Grand volume d'eau
    // Conductivités molaires ioniques (mS.m²/mol) à 25°C
    lambdas: {
        Cl: 7.63,
        Na: 5.01,
        Ag: 6.19,
        NO3: 7.14
    }
};

let currentV = 0.0;
let currentCond = 0.0;
let dataPoints = [];
let isAgitating = false;
let isCalibrated = false;
let calibOffset = 0.05; // (C'était 0.8 avant, c'est beaucoup trop gros pour des mS/cm !)
let autoTitrateInterval = null;
let linesDrawn = false; 

let condChart = null;

// =========================================
// GESTION DU MICROSCOPE (Les ions)
// =========================================
const baseParticles = 20; // 20 particules représentent la quantité initiale C_A*V_A
let ionsDOM = [];

function initMicroscope() {
    const view = document.getElementById('microscope-view');
    view.innerHTML = '';
    ionsDOM = [];
    
    // On génère 150 divs prêtes à l'emploi (Pool)
    for (let i = 0; i < 150; i++) {
        let dot = document.createElement('div');
        dot.className = 'ion';
        
        // Position aléatoire flottante (pour les ions dissous)
        dot.dataset.rx = Math.random();
        dot.dataset.ry = Math.random();
        dot.style.animationDelay = `${Math.random() * 2}s`;
        
        view.appendChild(dot);
        ionsDOM.push(dot);
    }
}

function updateMicroscopeView(V) {
    let { Ca, Va, Cb } = scenario;
    let Ve = (Ca * Va) / Cb;
    let x = V / Ve; // Avancement relatif
    
    // Nombres de particules (arrondis)
    let nNa = baseParticles;
    let nCl = Math.round(baseParticles * Math.max(0, 1 - x));
    let nAgCl = Math.round(baseParticles * Math.min(1, x)); // Le solide !
    let nNO3 = Math.round(baseParticles * x);
    let nAg = Math.round(baseParticles * Math.max(0, x - 1));

    // Distribution des rôles aux divs
    let currentIndex = 0;

    function assignParticles(count, className, symbol, isSolid = false) {
        for (let i = 0; i < count; i++) {
            if (currentIndex >= ionsDOM.length) break;
            let dot = ionsDOM[currentIndex];
            dot.className = `ion visible ${className}`;
            dot.innerText = symbol;
            
            if (isSolid) {
                // Le solide tombe au fond et s'empile aléatoirement
                dot.style.animation = 'none';
                dot.style.top = 'auto';
                dot.style.bottom = `${10 + Math.random() * 30}px`;
                dot.style.left = `${20 + Math.random() * 160}px`;
            } else {
                // Les ions nagent dans la solution
                dot.style.animation = ''; // Remet l'animation float
                dot.style.top = `${20 + dot.dataset.ry * 140}px`;
                dot.style.left = `${20 + dot.dataset.rx * 140}px`;
                dot.style.bottom = 'auto';
            }
            currentIndex++;
        }
    }

    assignParticles(nNa, 'ion-na', '+');
    assignParticles(nCl, 'ion-cl', '-');
    assignParticles(nNO3, 'ion-no3', '-');
    assignParticles(nAg, 'ion-ag', '+');
    assignParticles(nAgCl, 'ion-agcl', 'AgCl', true); // TRUE = C'est le solide !

    // On cache les divs inutilisées
    for (let i = currentIndex; i < ionsDOM.length; i++) {
        ionsDOM[i].className = 'ion';
    }
}

// =========================================
// MOTEUR PHYSIQUE
// =========================================
window.onload = () => {
    initChart();
    initMicroscope();
    updateSystem();
    document.getElementById("alert-msg").innerText = "⚠️ Attention : La cellule conductimétrique n'est pas étalonnée !";
};

function applySettings() {
    let nCa = parseFloat(document.getElementById('input-ca').value);
    let nVa = parseFloat(document.getElementById('input-va').value);
    let nCb = parseFloat(document.getElementById('input-cb').value);
    let nVeau = parseFloat(document.getElementById('input-veau').value);

    let testVe = (nCa * nVa) / nCb;
    if (testVe > 24.5) {
        alert("⚠️ Impossible ! Avec ces valeurs, le volume à l'équivalence dépasse la capacité de la burette (25 mL). Augmente CB ou diminue CA / VA.");
        return;
    }

    scenario.Ca = nCa;
    scenario.Va = nVa;
    scenario.Cb = nCb;
    scenario.Veau = nVeau;
    scenario.Ve = testVe;

    document.getElementById('cond-va').innerText = nVa.toFixed(1);
    document.getElementById('cond-veau').innerText = nVeau.toFixed(0);
    document.getElementById('cond-cb').innerText = nCb.toFixed(3);

    resetLab();
}

function calculateExactConductivity(V) {
    let { Ca, Va, Cb, Veau, lambdas } = scenario;
    let Ve = (Ca * Va) / Cb;
    let Vtot = Va + Veau + V; 

    // Quantité de matière (mmol)
    let nNa = Ca * Va; // Spectateur titré
    let nNO3 = Cb * V; // Spectateur titrant
    let nCl = 0, nAg = 0;

    if (V < Ve) {
        nCl = Ca * Va - Cb * V; // Consommé
        nAg = 0; // Précipite totalement
    } else {
        nCl = 0; // Totalement précipité
        nAg = Cb * V - Ca * Va; // En excès
    }

    // Concentration (mol/L)
    let cNa = nNa / Vtot;
    let cNO3 = nNO3 / Vtot;
    let cCl = nCl / Vtot;
    let cAg = nAg / Vtot;

    // Loi de Kohlrausch
    let sigma = lambdas.Na * cNa + lambdas.NO3 * cNO3 + lambdas.Cl * cCl + lambdas.Ag * cAg;
    return sigma; 
}

function updateSystem() {
    let theoreticalCond = calculateExactConductivity(currentV);
    let noise = 0;
    const displayEl = document.getElementById('cond-display');
    
    if (!isAgitating && currentV > 0) {
        noise = (Math.random() - 0.5) * 0.005; // Bruit réduit pour la conductimétrie
        displayEl.classList.add('unstable');
    } else {
        displayEl.classList.remove('unstable');
        noise = (Math.random() - 0.5) * 0.0002; // Bruit infime si on agite bien
    }

    currentCond = theoreticalCond + noise + calibOffset;
    if(currentCond < 0) currentCond = 0.0;

    // AFFICHER 3 DÉCIMALES AU LIEU DE 2
    displayEl.innerText = "σ = " + currentCond.toFixed(3) + " mS/cm";
    document.getElementById('vol-display').innerText = currentV.toFixed(2);
    
    const pctV = (currentV / 25) * 100;
    document.getElementById('burette-liquid').style.height = `${100 - pctV}%`;
    document.getElementById('beaker-liquid').style.height = `${70 + (pctV * 0.2)}%`;

    updateMicroscopeView(currentV);
}

function recordDataPoint() {
    // ENREGISTRER AVEC 4 DÉCIMALES pour que la courbe Chart.js soit parfaitement lisse
    let point = { v: parseFloat(currentV.toFixed(2)), c: parseFloat(currentCond.toFixed(4)) };
    
    if(dataPoints.length === 0 || dataPoints[dataPoints.length - 1].v !== point.v) {
        dataPoints.push(point);
        updateTableAndChart();
    }
    
    if (currentV >= 25 && !linesDrawn && isCalibrated && isAgitating) {
        drawFinalLines();
    }
}

// =========================================================
// TRACÉ FINAL : MODÉLISATION DES DEUX DROITES (V-Shape)
// =========================================================
function drawFinalLines() {
    linesDrawn = true;
    let ve = (scenario.Ca * scenario.Va) / scenario.Cb;
    let minCond = calculateExactConductivity(ve);
    let startCond = calculateExactConductivity(0);
    let endCond = calculateExactConductivity(25);

    condChart.data.datasets.push({
        label: 'Modélisation (V < VE)',
        data: [ { x: 0, y: startCond }, { x: ve, y: minCond } ],
        borderColor: '#0ea5e9', borderWidth: 2, fill: false,
        pointRadius: 0, type: 'line', yAxisID: 'y'
    });

    condChart.data.datasets.push({
        label: 'Modélisation (V > VE)',
        data: [ { x: ve, y: minCond }, { x: 25, y: endCond } ],
        borderColor: '#8b5cf6', borderWidth: 2, fill: false,
        pointRadius: 0, type: 'line', yAxisID: 'y'
    });

    condChart.data.datasets.push({
        label: 'Volume Équivalent',
        data: [ { x: ve, y: 0 }, { x: ve, y: minCond } ],
        borderColor: '#10b981', borderWidth: 2, borderDash: [5, 5], fill: false,
        pointRadius: [0, 6], pointBackgroundColor: '#10b981', type: 'line', yAxisID: 'y'
    });

    condChart.update();

    document.getElementById('final-results-box').style.display = 'block';
    document.getElementById('res-ve').innerText = ve.toFixed(2);
    document.getElementById('res-ca').innerText = scenario.Ca.toFixed(4);
    document.getElementById('calc-cb').innerText = scenario.Cb.toFixed(3);
    document.getElementById('calc-ve').innerText = ve.toFixed(2);
    document.getElementById('calc-va').innerText = scenario.Va.toFixed(1);
}

// =========================================
// INTERFACE UTILISATEUR
// =========================================
function toggleStirrer() {
    isAgitating = !isAgitating;
    const btn = document.getElementById('btn-stir');
    const bar = document.getElementById('stir-bar');
    const liquid = document.getElementById('beaker-liquid'); 
    
    if (isAgitating) {
        btn.classList.add('active'); btn.innerText = "🛑 Arrêter l'agitation";
        bar.classList.add('stirring');
        liquid.classList.add('vortex'); 
        document.getElementById("alert-msg").innerText = isCalibrated ? "✅ Cellule propre et étalonnée." : "⚠️ Pense à étalonner ta cellule !";
    } else {
        btn.classList.remove('active'); btn.innerText = "🌪️ Activer l'agitation";
        bar.classList.remove('stirring');
        liquid.classList.remove('vortex'); 
    }
    updateSystem();
}

function calibrate() {
    isCalibrated = true;
    calibOffset = 0; 
    document.getElementById("alert-msg").innerText = isAgitating ? "✅ Cellule étalonnée avec succès." : "⚠️ Cellule étalonnée, mais il faut agiter la solution.";
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
        addVolume(0.5);
    }, 300); 
}

function resetLab() {
    if (autoTitrateInterval) toggleAutoTitrate();
    
    currentV = 0.0;
    currentCond = 0.0;
    dataPoints = [];
    isAgitating = false;
    isCalibrated = false;
    calibOffset = 0.05; // On remet la petite erreur ici aussi !
    linesDrawn = false;
    
    document.getElementById('btn-calib').style.display = 'inline-block';
    document.getElementById('btn-stir').classList.remove('active');
    document.getElementById('btn-stir').innerText = "🌪️ Activer l'agitation";
    document.getElementById('stir-bar').classList.remove('stirring');
    document.getElementById('beaker-liquid').classList.remove('vortex'); 
    document.getElementById("alert-msg").innerText = "⚠️ Attention : La cellule n'est pas étalonnée !";
    document.getElementById('final-results-box').style.display = 'none';
    
    while(condChart.data.datasets.length > 1) {
        condChart.data.datasets.pop();
    }
    
    updateSystem();
    updateTableAndChart();
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');
}

function initChart() {
    const ctx = document.getElementById('titrationChart').getContext('2d');
    condChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                { label: 'σ = f(V)', data: [], borderColor: '#334155', backgroundColor: '#334155', tension: 0, pointRadius: 4 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                x: { type: 'linear', title: { display: true, text: 'Volume ajouté (mL)' }, min: 0, max: 25 },
                y: { title: { display: true, text: 'Conductivité (mS/cm)' }, min: 0 }
            }
        }
    });
}

function updateTableAndChart() {
    condChart.data.datasets[0].data = dataPoints.map(p => ({ x: p.v, y: p.c }));
    condChart.update();

    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';
    
    for (let i = dataPoints.length - 1; i >= 0; i--) {
        let p = dataPoints[i];
        let row = document.createElement('tr');
        // AFFICHER 3 DÉCIMALES DANS LE TABLEAU
        row.innerHTML = `<td>${p.v.toFixed(2)}</td><td>${p.c.toFixed(3)}</td>`;
        tbody.appendChild(row);
    }
}