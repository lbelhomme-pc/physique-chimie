// =======================================================
// MOTEUR CANVAS : TEST DES IONS (Moteur de Particules 2D)
// =======================================================

let canvas, ctx, dpr;
let currentIon = null;
let particles = [];
let drops = [];
let isPipetteVisible = false;
let pipetteY = -100; 
let isGameWon = false;

// --- GÉOMÉTRIE DU TUBE ---
const tubeX = 110, tubeY = 120, tubeW = 80, tubeH = 220, liquidLevel = 180;

// --- DONNÉES CHIMIQUES ---
// CORRECTION : Les couleurs initiales sont toutes identiques (transparentes)
// Les élèves ne peuvent plus deviner l'ion sans faire le test !
const baseLiquidColor = "rgba(248, 250, 252, 0.15)"; 

const ionsList = [
    { id: 'cu2', name: "Cuivre (II)", initialColor: baseLiquidColor, reactSoude: "rgba(37, 99, 235, 0.9)", reactArgent: null },
    { id: 'fe2', name: "Fer (II)", initialColor: baseLiquidColor, reactSoude: "rgba(22, 163, 74, 0.9)", reactArgent: null },
    { id: 'fe3', name: "Fer (III)", initialColor: baseLiquidColor, reactSoude: "rgba(194, 65, 12, 0.9)", reactArgent: null },
    { id: 'cl', name: "Chlorure", initialColor: baseLiquidColor, reactSoude: null, reactArgent: "rgba(248, 250, 252, 0.9)" }
];

// =======================================================
// 1. INITIALISATION ROBUSTE
// =======================================================
function initLab() {
    canvas = document.getElementById('labCanvas');
    if (!canvas) return; // Sécurité si la page charge mal

    ctx = canvas.getContext('2d');
    
    // Adaptation aux écrans haute résolution (Smartphones / Retina)
    dpr = window.devicePixelRatio || 1;
    canvas.width = 300 * dpr;
    canvas.height = 400 * dpr;
    ctx.scale(dpr, dpr);

    // Connexion des boutons
    document.getElementById('btn-new').addEventListener('click', generateNewUnknown);
    document.getElementById('btn-soude').addEventListener('click', () => addReagent('soude'));
    document.getElementById('btn-argent').addEventListener('click', () => addReagent('argent'));
    
    document.querySelectorAll('.btn-answer').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.target.closest('.btn-answer');
            if (target) checkAnswer(target.dataset.ion);
        });
    });

    generateNewUnknown();
    requestAnimationFrame(draw); 
}

window.addEventListener('load', initLab);

// =======================================================
// 2. BOUCLE D'ANIMATION (60 FPS)
// =======================================================
function draw() {
    ctx.clearRect(0, 0, 300, 400);

    drawPipette();
    drawTubeBack();
    if (currentIon) drawLiquid();
    updateAndDrawParticles();
    drawTubeFront(); 
    updateAndDrawDrops();

    requestAnimationFrame(draw);
}

// =======================================================
// 3. DESSIN DE LA VERRERIE
// =======================================================
function drawTubeBack() {
    ctx.beginPath();
    ctx.moveTo(tubeX, tubeY);
    ctx.lineTo(tubeX, tubeY + tubeH - tubeW/2);
    ctx.arc(tubeX + tubeW/2, tubeY + tubeH - tubeW/2, tubeW/2, Math.PI, 0, true);
    ctx.lineTo(tubeX + tubeW, tubeY);
    
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#94a3b8"; 
    ctx.stroke();
}

function drawLiquid() {
    ctx.beginPath();
    ctx.moveTo(tubeX + 2, liquidLevel);
    ctx.lineTo(tubeX + 2, tubeY + tubeH - tubeW/2);
    ctx.arc(tubeX + tubeW/2, tubeY + tubeH - tubeW/2, tubeW/2 - 2, Math.PI, 0, true);
    ctx.lineTo(tubeX + tubeW - 2, liquidLevel);
    
    ctx.quadraticCurveTo(tubeX + tubeW/2, liquidLevel + 10, tubeX + 2, liquidLevel);
    
    ctx.fillStyle = currentIon.initialColor;
    ctx.fill();

    // Reflet de surface
    ctx.beginPath();
    ctx.ellipse(tubeX + tubeW/2, liquidLevel, tubeW/2 - 2, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fill();
}

function drawTubeFront() {
    ctx.beginPath();
    ctx.moveTo(tubeX + 10, tubeY + 20);
    ctx.lineTo(tubeX + 10, tubeY + tubeH - 40);
    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineCap = "round";
    ctx.stroke();
}

function drawPipette() {
    if (!isPipetteVisible) {
        if (pipetteY > -100) pipetteY -= 6; 
    } else {
        if (pipetteY < 20) pipetteY += 6; 
    }
    if (pipetteY <= -90) return; 

    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 2;
    
    ctx.fillRect(tubeX + tubeW/2 - 10, pipetteY, 20, 60);
    ctx.strokeRect(tubeX + tubeW/2 - 10, pipetteY, 20, 60);
    
    ctx.beginPath();
    ctx.moveTo(tubeX + tubeW/2 - 10, pipetteY + 60);
    ctx.lineTo(tubeX + tubeW/2 - 3, pipetteY + 90);
    ctx.lineTo(tubeX + tubeW/2 + 3, pipetteY + 90);
    ctx.lineTo(tubeX + tubeW/2 + 10, pipetteY + 60);
    ctx.fill();
    ctx.stroke();
}

// =======================================================
// 4. MOTEUR DE PARTICULES (Gravité et frictions)
// =======================================================
function updateAndDrawDrops() {
    for (let i = drops.length - 1; i >= 0; i--) {
        let d = drops[i];
        ctx.beginPath();
        ctx.arc(d.x, d.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fill();

        d.y += d.vy; 
        d.vy += 0.3; // Accélération vers le bas

        if (d.y >= liquidLevel) {
            triggerReaction(d.reagent);
            drops.splice(i, 1);
        }
    }
}

function updateAndDrawParticles() {
    for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        
        p.vy += 0.05; 
        p.vx *= 0.90; 
        p.vy *= 0.95; 
        p.vx += (Math.random() - 0.5) * 0.6; // Mouvement de l'eau

        p.x += p.vx;
        p.y += p.vy;

        // Limites latérales
        if (p.x < tubeX + 8) { p.x = tubeX + 8; p.vx *= -0.5; }
        if (p.x > tubeX + tubeW - 8) { p.x = tubeX + tubeW - 8; p.vx *= -0.5; }
        
        // Empilement parfait au fond du tube (Demi-cercle)
        let distCenter = Math.abs(p.x - (tubeX + tubeW/2));
        let bottomY = (tubeY + tubeH - 40) + Math.sqrt(Math.max(0, 1600 - distCenter * distCenter)) - p.radius - 2; 
        
        if (p.y > bottomY) {
            p.y = bottomY;
            p.vy = 0;
            p.vx *= 0.5; 
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
    }
}

// =======================================================
// 5. LOGIQUE DU JEU D'ENQUÊTE
// =======================================================
function generateNewUnknown() {
    currentIon = ionsList[Math.floor(Math.random() * ionsList.length)];
    particles = [];
    drops = [];
    isPipetteVisible = false;
    pipetteY = -100;
    isGameWon = false;

    const status = document.getElementById("status-msg");
    status.className = "alert-box";
    status.innerHTML = "Tube prêt. Un ion mystère s'y cache, ajoute un réactif pour le démasquer !";
    
    document.querySelectorAll('.btn-answer').forEach(btn => {
        btn.style.opacity = "1";
        btn.style.pointerEvents = "auto";
        btn.style.borderColor = "#e2e8f0";
        btn.style.boxShadow = "none";
    });
}

function addReagent(type) {
    if (isGameWon) return;
    isPipetteVisible = true;

    // Séquence des gouttes (3 gouttes)
    setTimeout(() => createDrop(type), 300);
    setTimeout(() => createDrop(type), 500);
    setTimeout(() => {
        createDrop(type);
        isPipetteVisible = false; // Remonte la pipette
    }, 700);
}

function createDrop(type) {
    drops.push({ x: tubeX + tubeW/2, y: Math.max(pipetteY + 90, 0), vy: 2, reagent: type });
}

function triggerReaction(reagentType) {
    let precipitateColor = null;
    if (reagentType === 'soude' && currentIon.reactSoude) precipitateColor = currentIon.reactSoude;
    if (reagentType === 'argent' && currentIon.reactArgent) precipitateColor = currentIon.reactArgent;

    if (precipitateColor) {
        document.getElementById("status-msg").className = "alert-box success";
        document.getElementById("status-msg").innerHTML = `⚡ Réaction ! Un précipité s'est formé. Quel est l'ion coupable ?`;
        
        // Génération d'une nuée de particules au moment du contact
        for (let i = 0; i < 80; i++) {
            particles.push({
                x: tubeX + tubeW/2 + (Math.random() - 0.5) * 40,
                y: liquidLevel + 5 + Math.random() * 20,
                vx: (Math.random() - 0.5) * 4,
                vy: Math.random() * 3 + 1,
                radius: Math.max(1.5, Math.random() * 3 + 1.5), 
                color: precipitateColor
            });
        }
    } else {
        document.getElementById("status-msg").className = "alert-box";
        document.getElementById("status-msg").innerHTML = `💧 Rien ne se passe... Ce réactif ne détecte pas cet ion.`;
    }
}

function checkAnswer(ionId) {
    if (isGameWon) return;
    const status = document.getElementById("status-msg");

    if (ionId === currentIon.id) {
        status.className = "alert-box success";
        status.innerHTML = `🎉 Exact ! C'est bien l'ion ${currentIon.name}. Clique sur "Nouveau Tube" pour recommencer.`;
        isGameWon = true;

        document.querySelectorAll('.btn-answer').forEach(btn => {
            if (btn.dataset.ion !== currentIon.id) {
                btn.style.opacity = "0.3";
                btn.style.pointerEvents = "none";
            } else {
                btn.style.borderColor = "#10b981";
                btn.style.boxShadow = "0 0 15px rgba(16, 185, 129, 0.4)";
            }
        });
        
        // SUPPRESSION DU CODE DE GAMIFICATION (XP) ICI
        
    } else {
        status.className = "alert-box error";
        status.innerHTML = `❌ Oups, ce n'est pas ça. Regarde la fiche de révision pour t'aider !`;
    }
}