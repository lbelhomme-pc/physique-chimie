const car = document.getElementById('main-car');
const tracesContainer = document.getElementById('traces-container');
const camInd = document.getElementById('cam-ind');
const analysisText = document.getElementById('analysis-text');

let animationId;
let isMoving = false;

// Moteur Physique Précis (Basé sur le temps)
let startTime = 0;
let v0 = 0; // Vitesse initiale (% par s)
let a = 0;  // Accélération (% par s²)
let x0 = 5; // Position initiale (5% pour laisser de la marge)

let flashCount = 0;
const TIME_INTERVAL = 0.5; // Photo toutes les 0.5 secondes

const analyses = {
    'uniform': "L'intervalle de temps entre deux photos est toujours de 0.5s. On voit grâce à la grille que la distance parcourue est <span class='highlight'>identique</span> à chaque fois. Le mouvement est <strong>uniforme</strong>.",
    'accelerated': "L'intervalle de temps est identique (0.5s), mais la distance entre les traces est de plus en plus <span class='highlight'>grande</span>. Le mouvement est <strong>accéléré</strong>.",
    'decelerated': "L'intervalle de temps est identique (0.5s), mais la distance entre les traces est de plus en plus <span class='highlight'>petite</span>. Le mouvement est <strong>ralenti (décéléré)</strong>."
};

function resetLab() {
    cancelAnimationFrame(animationId);
    tracesContainer.innerHTML = '';
    car.style.left = '5%';
    document.querySelectorAll('.btn-drive').forEach(btn => btn.disabled = false);
}

function takePhoto(xPos, timeSec) {
    // Création de la trace (fantôme)
    const trace = document.createElement('div');
    trace.className = 'car-trace';
    trace.innerText = '🏎️';
    trace.style.left = xPos + '%';
    tracesContainer.appendChild(trace);

    // Création de l'étiquette de temps
    const label = document.createElement('div');
    label.className = 'time-label';
    label.innerText = timeSec.toFixed(1) + ' s';
    label.style.left = xPos + '%';
    tracesContainer.appendChild(label);

    // Clignotement du voyant rouge
    camInd.classList.add('camera-active');
    setTimeout(() => camInd.classList.remove('camera-active'), 150);
}

function startMotion(type) {
    if (isMoving) return;
    resetLab();
    isMoving = true;
    flashCount = 0;

    document.querySelectorAll('.btn-drive').forEach(btn => btn.disabled = true);
    analysisText.innerHTML = analyses[type];

    // Paramètres physiques selon le mouvement
    if (type === 'uniform') {
        v0 = 20; a = 0;
    } else if (type === 'accelerated') {
        v0 = 5; a = 12;
    } else if (type === 'decelerated') {
        v0 = 45; a = -12;
    }

    startTime = performance.now();
    animationId = requestAnimationFrame(updatePhysics);
}

function updatePhysics(timestamp) {
    // Temps écoulé en secondes
    let t = (timestamp - startTime) / 1000;
    
    // Calcul de la vitesse courante (v = v0 + at)
    let currentV = v0 + a * t;
    
    // Si la voiture freine et s'arrête (vitesse négative impossible)
    if (currentV < 0) {
        t = -v0 / a; // On bloque le temps à l'instant précis de l'arrêt
        currentV = 0;
    }

    // Équation horaire du mouvement : x(t) = x0 + v0*t + 1/2*a*t²
    let currentX = x0 + (v0 * t) + (0.5 * a * t * t);
    car.style.left = currentX + '%';

    // Gestion des Flashs photographiques
    let expectedFlashes = Math.floor(t / TIME_INTERVAL) + 1;
    
    while (flashCount < expectedFlashes) {
        let flashTime = flashCount * TIME_INTERVAL;
        let flashX = x0 + (v0 * flashTime) + (0.5 * a * flashTime * flashTime);
        
        // On prend la photo seulement si la voiture n'est pas sortie de l'écran
        if (flashX <= 90) {
            takePhoto(flashX, flashTime);
        }
        flashCount++;
    }

    // Conditions de fin d'animation (Sortie d'écran ou arrêt complet)
    if (currentX >= 90 || (currentV === 0 && a < 0)) {
        isMoving = false;
        document.querySelectorAll('.btn-drive').forEach(btn => btn.disabled = false);
        return;
    }

    animationId = requestAnimationFrame(updatePhysics);
}