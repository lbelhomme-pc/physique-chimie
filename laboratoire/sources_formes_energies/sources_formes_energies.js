// --- DONNÉES DES MISSIONS ---
const missions = {
    ampoule: { source: "Secteur", enerIn: "Électrique", converter: "Ampoule LED", enerUtile: "Rayonnement", enerPerte: "Thermique" },
    eolienne: { source: "Vent", enerIn: "Mécanique", converter: "Éolienne", enerUtile: "Électrique", enerPerte: "Thermique" },
    velo: { source: "Batterie", enerIn: "Électrique", converter: "Moteur", enerUtile: "Mécanique", enerPerte: "Thermique" },
    muscle: { source: "Aliments", enerIn: "Chimique", converter: "Muscle", enerUtile: "Mécanique", enerPerte: "Thermique" },
    bouilloire: { source: "Secteur", enerIn: "Électrique", converter: "Bouilloire", enerUtile: "Thermique (Eau)", enerPerte: "Thermique (Air)" }
};

let currentMission = "ampoule";
let selectedTool = null; 

// Stockage des réponses de l'élève
let answers = { source: null, enerIn: null, converter: null, enerUtile: null, enerPerte: null };

// --- GESTION DE L'INVENTAIRE ---
document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('selected'));
        e.target.classList.add('selected');
        selectedTool = { type: e.target.dataset.type, val: e.target.dataset.val };
    });
});

// --- CLIC SUR LES ZONES DU SVG ---
document.querySelectorAll('.slot-group').forEach(group => {
    group.addEventListener('click', function() {
        if (!selectedTool) return;
        
        let slotId = this.dataset.slot;
        
        // Vérifie si l'outil correspond au type de la boîte (ex: on ne met pas une Source dans une Énergie)
        if (this.classList.contains('type-' + selectedTool.type)) {
            answers[slotId] = selectedTool.val;
            
            // Met à jour l'affichage SVG
            this.querySelector('.slot-text').textContent = selectedTool.val;
            this.classList.add('filled');
            
            updateArrows();
            stopAnimation(); // Si on modifie, on arrête l'animation de victoire
        }
    });
});

function updateArrows() {
    const aIn = document.getElementById('arrow-in');
    const aUtile = document.getElementById('arrow-utile');
    const aPerte = document.getElementById('arrow-perte');

    if (answers.enerIn) aIn.classList.add('filled-in'); else aIn.classList.remove('filled-in');
    if (answers.enerUtile) aUtile.classList.add('filled-utile'); else aUtile.classList.remove('filled-utile');
    if (answers.enerPerte) aPerte.classList.add('filled-perte'); else aPerte.classList.remove('filled-perte');
}

// --- VÉRIFICATION DE LA MISSION ---
document.getElementById('btn-check').addEventListener('click', () => {
    const m = missions[currentMission];
    
    if(answers.source === m.source && answers.enerIn === m.enerIn && 
       answers.converter === m.converter && answers.enerUtile === m.enerUtile && 
       answers.enerPerte === m.enerPerte) {
        
        showFeedback("✅ Excellent ! Ta chaîne énergétique est parfaite !", "success");
        
        // Lance la magie animée des flèches en CSS !
        if(answers.enerIn) document.getElementById('arrow-in').classList.add('animated');
        if(answers.enerUtile) document.getElementById('arrow-utile').classList.add('animated');
        if(answers.enerPerte) document.getElementById('arrow-perte').classList.add('animated-reverse');
        
    } else {
        showFeedback("❌ Il y a des erreurs... Vérifie ton cours !", "error");
        stopAnimation();
    }
});

// --- CHANGEMENT DE MISSION ET RESET ---
document.getElementById('mission-select').addEventListener('change', (e) => {
    currentMission = e.target.value;
    resetSlots();
});

document.getElementById('btn-reset').addEventListener('click', resetSlots);

function resetSlots() {
    answers = { source: null, enerIn: null, converter: null, enerUtile: null, enerPerte: null };
    selectedTool = null;
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('selected'));
    
    document.querySelectorAll('.slot-group').forEach(group => {
        group.classList.remove('filled');
        group.querySelector('.slot-text').textContent = group.classList.contains('type-energy') ? "?" : "Clique ici";
    });
    
    updateArrows();
    stopAnimation();
}

function stopAnimation() {
    document.getElementById('arrow-in').classList.remove('animated');
    document.getElementById('arrow-utile').classList.remove('animated');
    document.getElementById('arrow-perte').classList.remove('animated-reverse');
}

function showFeedback(msg, type) {
    const fb = document.getElementById('feedback-msg');
    fb.textContent = msg;
    fb.className = `feedback-msg feedback-${type}`;
    setTimeout(() => { fb.style.opacity = '0'; }, 3500);
}