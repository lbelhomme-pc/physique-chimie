// Configuration Poids vs Masse
const planets = {
    'pluton':  { g: 0.6, sky: 'linear-gradient(to bottom, #020617, #0f172a)', ground: '#38bdf8' },
    'lune':    { g: 1.6, sky: 'linear-gradient(to bottom, #0f172a, #1e293b)', ground: '#94a3b8' },
    'mars':    { g: 3.7, sky: 'linear-gradient(to bottom, #fca5a5, #fef08a)', ground: '#ef4444' },
    'venus':   { g: 8.9, sky: 'linear-gradient(to bottom, #fcd34d, #fef3c7)', ground: '#d97706' },
    'terre':   { g: 9.8, sky: 'linear-gradient(to bottom, #bae6fd, #e0f2fe)', ground: '#4ade80' },
    'saturne': { g: 10.4, sky: 'linear-gradient(to bottom, #fef08a, #fef9c3)', ground: '#ca8a04' },
    'jupiter': { g: 24.8, sky: 'linear-gradient(to bottom, #fdba74, #ffedd5)', ground: '#9a3412' }
};

let currentPlanet = 'terre';
let jumpTimeout1, jumpTimeout2;

function changePlanet(planetId) {
    currentPlanet = planetId;
    
    // Gérer l'apparence des boutons natifs
    document.querySelectorAll('.planet-btn').forEach(btn => {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');
    });
    const activeBtn = document.getElementById('btn-' + planetId);
    activeBtn.classList.remove('btn-secondary');
    activeBtn.classList.add('btn-primary');
    
    // Modification directe du style en JS
    document.getElementById('scene').style.background = planets[planetId].sky;
    document.getElementById('ground').style.background = planets[planetId].ground;
    
    updatePhysics(); 
    forceJump();
}

function updatePhysics() {
    const slider = document.getElementById('slider-m');
    if (!slider) return;
    
    const m = parseFloat(slider.value);
    const g = planets[currentPlanet].g;
    const P = m * g;
    
    document.getElementById('val-m').innerText = m;
    document.getElementById('val-p').innerText = Math.round(P);
    
    const maxP = 200 * 24.8; 
    let stretchPercent = (P / maxP) * 100;
    if(stretchPercent < 5) stretchPercent = 5; 
    document.getElementById('spring').style.height = stretchPercent + "%";
    
    const scale = 0.5 + (m / 200) * 0.8;
    document.getElementById('astronaut').style.fontSize = (5 * scale) + "rem";
}

function forceJump() {
    const g = planets[currentPlanet].g;
    const astro = document.getElementById('astronaut');
    
    const jumpHeight = Math.min(260, 400 / g); 
    const jumpTime = Math.min(1200, 800 / Math.sqrt(g)); 
    
    // 1. On annule les animations en cours si l'élève clique frénétiquement
    astro.getAnimations().forEach(anim => anim.cancel());

    // 2. Web Animations API (GPU accéléré, immunisé contre le CSS global du Mode Dys)
    astro.animate([
        { 
            transform: 'translateY(0)', 
            easing: 'cubic-bezier(0.25, 1, 0.5, 1)' // Accélération vers le haut
        },
        { 
            transform: `translateY(-${jumpHeight}px)`, 
            easing: 'cubic-bezier(0.5, 0, 0.75, 0)' // Décélération vers le bas
        },
        { 
            transform: 'translateY(0)' // Retour au sol
        }
    ], {
        duration: jumpTime * 2, // Temps total (montée + descente)
        iterations: 1,
        fill: 'forwards'
    });
}

window.addEventListener('DOMContentLoaded', () => {
    updatePhysics();
    document.getElementById('scene').style.background = planets['terre'].sky;
    document.getElementById('ground').style.background = planets['terre'].ground;
});