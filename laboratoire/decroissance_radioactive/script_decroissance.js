const grid = document.getElementById('atom-grid');
const canvas = document.getElementById('decay-chart');
const ctx = canvas.getContext('2d');

const W = 1000;
const H = 700;
const PAD = 90; 

let atoms = [];
const N0 = 400;
let N = N0;
let time = 0;
let historyData = [];

// --- VARIABLES DE CONTRÔLE ---
let isPlaying = false;
let isSlowMo = false;
let decayTimer = null;
let tickDuration = 250; // 250ms = normal (rapide), 1000ms = lent

let prevLambda = 0.05;
let arrowTimeout;

// 1. Initialisation
for (let i = 0; i < N0; i++) {
    const atom = document.createElement('div');
    atom.className = 'atom';
    grid.appendChild(atom);
    atoms.push(atom);
}

// 2. Écouteurs (Slider & Boutons)
document.getElementById('slider-lambda').addEventListener('input', updateRadio);
document.getElementById('btn-play').addEventListener('click', playSimulation);
document.getElementById('btn-pause').addEventListener('click', pauseSimulation);
document.getElementById('btn-speed').addEventListener('click', toggleSpeed);
document.getElementById('btn-reset').addEventListener('click', resetSimulation);

const observer = new MutationObserver(() => {
    drawGraph(parseFloat(document.getElementById('slider-lambda').value));
});
observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

// 3. UI Paramètres
function updateRadio() {
    const lambda = parseFloat(document.getElementById('slider-lambda').value);
    const t12 = Math.log(2) / lambda;

    let arrT = "➖", clsT = "arrow-flat";
    if (lambda > prevLambda) { arrT = "⬇️"; clsT = "arrow-down"; }
    else if (lambda < prevLambda) { arrT = "⬆️"; clsT = "arrow-up"; }

    document.getElementById('lbl-lambda').innerText = lambda.toFixed(2) + " /s";
    document.getElementById('val-t12').innerText = t12.toFixed(1);
    
    const arrElem = document.getElementById('arr-t12');
    arrElem.innerText = arrT; 
    arrElem.className = clsT;

    prevLambda = lambda;
    clearTimeout(arrowTimeout);
    arrowTimeout = setTimeout(() => { 
        arrElem.innerText = "➖"; 
        arrElem.className = "arrow-flat"; 
    }, 800);
    
    if (time === 0) drawGraph(lambda);
}

// 4. MOTEUR DE DESSIN GRAPHIQUE HD
function drawGraph(lambda) {
    ctx.clearRect(0, 0, W, H);
    
    const isDark = document.body.classList.contains('dark-mode');
    const colorAxis = isDark ? '#cbd5e1' : '#475569';
    const colorGrid = isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.8)';

    let tMax = Math.max(60, time + 5);
    
    const getX = (t) => PAD + (t / tMax) * (W - PAD * 1.5);
    const getY = (n) => H - PAD - (n / N0) * (H - PAD * 1.5);

    // Grille de fond
    ctx.strokeStyle = colorGrid;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    for(let i=1; i<=4; i++) {
        ctx.moveTo(PAD, getY(i*100)); 
        ctx.lineTo(W - PAD/2, getY(i*100));
    }
    for(let t=10; t<=tMax; t+=10) {
        ctx.moveTo(getX(t), H - PAD);
        ctx.lineTo(getX(t), PAD - 30);
    }
    ctx.stroke();
    ctx.setLineDash([]); 

    // Axes
    ctx.strokeStyle = colorAxis;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(PAD, H - PAD); 
    ctx.lineTo(PAD, PAD - 40); 
    ctx.lineTo(PAD - 8, PAD - 25);
    ctx.moveTo(PAD, PAD - 40);
    ctx.lineTo(PAD + 8, PAD - 25);

    ctx.moveTo(PAD, H - PAD); 
    ctx.lineTo(W - PAD/2 + 20, H - PAD); 
    ctx.lineTo(W - PAD/2 + 5, H - PAD - 8);
    ctx.moveTo(W - PAD/2 + 20, H - PAD);
    ctx.lineTo(W - PAD/2 + 5, H - PAD + 8);
    ctx.stroke();

    // Typographie
    ctx.fillStyle = colorAxis;
    ctx.font = "500 22px 'Inter', sans-serif"; 
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText("400", PAD - 15, getY(400));
    ctx.fillText("200", PAD - 15, getY(200));
    ctx.fillText("0", PAD - 15, getY(0));
    
    ctx.font = "800 24px 'Inter', sans-serif"; 
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Temps (s)", W/2, H - PAD + 30);
    
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillText("Noyaux restants", PAD + 20, PAD - 35);

    // Dégradé Courbe
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(N0));
    for (let t = 0; t <= tMax; t++) {
        let nTheor = N0 * Math.exp(-lambda * t);
        ctx.lineTo(getX(t), getY(nTheor));
    }
    ctx.lineTo(getX(tMax), getY(0));
    ctx.lineTo(getX(0), getY(0));
    ctx.closePath();
    
    let gradient = ctx.createLinearGradient(0, PAD, 0, H - PAD);
    gradient.addColorStop(0, "rgba(34, 197, 94, 0.2)"); 
    gradient.addColorStop(1, "rgba(34, 197, 94, 0.0)");  
    ctx.fillStyle = gradient;
    ctx.fill();

    // Courbe Théorique
    ctx.beginPath();
    ctx.strokeStyle = "#22c55e"; 
    ctx.lineWidth = 6;
    ctx.shadowBlur = 20;
    ctx.shadowColor = "rgba(34, 197, 94, 0.6)"; 
    for (let t = 0; t <= tMax; t++) {
        let nTheor = N0 * Math.exp(-lambda * t);
        if (t === 0) ctx.moveTo(getX(t), getY(nTheor));
        else ctx.lineTo(getX(t), getY(nTheor));
    }
    ctx.stroke();
    ctx.shadowBlur = 0; 

    // Badge Demi-vie
    const t12 = Math.log(2) / lambda;
    if (t12 <= tMax) {
        ctx.beginPath();
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 8]);
        ctx.moveTo(getX(t12), getY(0));
        ctx.lineTo(getX(t12), getY(N0/2));
        ctx.lineTo(getX(0), getY(N0/2));
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.roundRect(getX(t12) - 35, getY(0) + 15, 70, 36, 8);
        ctx.fill();
        
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "800 20px 'Inter', sans-serif";
        ctx.fillText("t₁/₂", getX(t12), getY(0) + 34);
    }

    // Courbe Expérimentale
    if (historyData.length > 0) {
        ctx.beginPath();
        ctx.strokeStyle = "#eab308";
        ctx.lineWidth = 5;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(234, 179, 8, 0.6)";
        historyData.forEach((pt, index) => {
            if (index === 0) ctx.moveTo(getX(pt.t), getY(pt.n));
            else ctx.lineTo(getX(pt.t), getY(pt.n));
        });
        ctx.stroke();
        
        let lastPt = historyData[historyData.length - 1];
        ctx.beginPath();
        ctx.fillStyle = "#fef08a"; 
        ctx.arc(getX(lastPt.t), getY(lastPt.n), 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

// 5. MOTEUR DE CONTRÔLE (PLAY / PAUSE / VITESSE)

function playSimulation() {
    if (isPlaying || N === 0 || time > 150) return;
    isPlaying = true;
    
    // Gérer l'état des boutons
    document.getElementById('btn-play').disabled = true;
    document.getElementById('btn-pause').disabled = false;
    document.getElementById('slider-lambda').disabled = true; // Bloque la modification en cours d'expérience
    
    decayStep();
}

function pauseSimulation() {
    isPlaying = false;
    clearTimeout(decayTimer);
    
    document.getElementById('btn-play').disabled = false;
    document.getElementById('btn-pause').disabled = true;
}

function toggleSpeed() {
    isSlowMo = !isSlowMo;
    tickDuration = isSlowMo ? 1000 : 250; // 1 seconde vs 250ms
    
    const btn = document.getElementById('btn-speed');
    btn.innerHTML = isSlowMo ? "🐢 Ralenti (On)" : "🐇 Ralenti (Off)";
    btn.classList.toggle('slow-active', isSlowMo);
}

function resetSimulation() {
    pauseSimulation();
    
    // Remise à zéro des valeurs
    N = N0;
    time = 0;
    historyData = [{t: 0, n: N0}];
    
    // Réinitialise la grille DOM
    atoms.forEach(a => a.classList.remove('decayed'));
    
    // Réinitialise le texte
    document.getElementById('val-n').innerText = N;
    document.getElementById('val-time').innerText = time;
    
    // Débloque le slider
    document.getElementById('slider-lambda').disabled = false;
    
    // Redessine l'état initial
    updateRadio();
}

function decayStep() {
    if (!isPlaying) return;

    time++;
    const lambda = parseFloat(document.getElementById('slider-lambda').value);
    
    // Tirage aléatoire de désintégration
    atoms.forEach(atom => {
        if (!atom.classList.contains('decayed')) {
            if (Math.random() < lambda) {
                atom.classList.add('decayed');
                N--;
            }
        }
    });

    // Enregistrement
    historyData.push({t: time, n: N});
    document.getElementById('val-n').innerText = N;
    document.getElementById('val-time').innerText = time;
    
    drawGraph(lambda);

    // Boucle conditionnelle
    if (N === 0 || time > 150) {
        pauseSimulation();
        document.getElementById('btn-play').disabled = true; // Fin du jeu
    } else {
        decayTimer = setTimeout(decayStep, tickDuration);
    }
}

// Lancement initial UI
resetSimulation();