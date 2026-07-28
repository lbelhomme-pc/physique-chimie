const canvas = document.getElementById('phCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
let targetPH = 7.0;
let currentPH = 7.0;

// Configurations
const MAX_PARTICLES = 120;
const RADIUS = 14;

// Objets du DOM
const phValueText = document.getElementById('ph-value');
const phCursor = document.getElementById('ph-cursor');
const statusBox = document.getElementById('status-box');
const canvasContainer = document.getElementById('canvas-container');

// Redimensionnement du canvas (Net et HD)
function resizeCanvas() {
    const rect = canvasContainer.getBoundingClientRect();
    width = rect.width || 500; // Sécurité
    height = rect.height || 375;
    canvas.width = width * 2; // Rendu Retina
    canvas.height = height * 2;
    ctx.scale(2, 2);
}
window.addEventListener('resize', resizeCanvas);
// Premier appel immédiat
resizeCanvas();

// Classe Particule (Ion)
class Particle {
    constructor(type) {
        this.type = type; // 'H' ou 'OH'
        this.radius = RADIUS;
        
        // Apparition aléatoire sécurisée dans le bécher
        this.x = Math.random() * (width - this.radius * 2) + this.radius;
        this.y = Math.random() * (height - this.radius * 2) + this.radius;
        
        // Vitesse aléatoire pour l'agitation thermique
        const speed = 1.5;
        this.vx = (Math.random() - 0.5) * speed * 2;
        this.vy = (Math.random() - 0.5) * speed * 2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Rebond sur les murs du bécher (avec sécurité anti-blocage)
        if (this.x - this.radius < 0) { this.x = this.radius; this.vx *= -1; }
        if (this.x + this.radius > width) { this.x = width - this.radius; this.vx *= -1; }
        if (this.y - this.radius < 0) { this.y = this.radius; this.vy *= -1; }
        if (this.y + this.radius > height) { this.y = height - this.radius; this.vy *= -1; }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.type === 'H' ? '#ef4444' : '#3b82f6';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Texte au centre de l'ion
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.type === 'H' ? 'H⁺' : 'OH⁻', this.x, this.y + 1);
    }
}

// Fonction de collision (Neutralisation H+ + OH- -> H2O)
function handleCollisions() {
    for (let i = particles.length - 1; i >= 0; i--) {
        for (let j = i - 1; j >= 0; j--) {
            let p1 = particles[i];
            let p2 = particles[j];

            // Si ce sont des ions opposés
            if (p1 && p2 && p1.type !== p2.type) {
                let dx = p2.x - p1.x;
                let dy = p2.y - p1.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                // Si collision, ils réagissent et disparaissent
                if (distance < p1.radius + p2.radius) {
                    particles.splice(i, 1);
                    particles.splice(j, 1);
                    updatePH();
                    break;
                }
            }
        }
    }
}

// Recalcul du pH
function updatePH() {
    let countH = particles.filter(p => p.type === 'H').length;
    let countOH = particles.filter(p => p.type === 'OH').length;
    let net = countH - countOH;

    if (net === 0) {
        targetPH = 7.0;
    } else if (net > 0) {
        // Acide
        let ratio = Math.min(net / (MAX_PARTICLES / 2), 1);
        targetPH = 7.0 - (ratio * 6.5); 
    } else {
        // Basique
        let ratio = Math.min(Math.abs(net) / (MAX_PARTICLES / 2), 1);
        targetPH = 7.0 + (ratio * 7.0); 
    }
}

// Boucle d'animation principale (60 FPS)
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Lissage visuel du pH
    currentPH += (targetPH - currentPH) * 0.05;
    
    // Mise à jour interface
    phValueText.innerText = currentPH.toFixed(1);
    let percent = (currentPH / 14) * 100;
    phCursor.style.left = `${percent}%`;

    // Mise à jour couleur du fond via les CSS classes (Mode Sombre OK)
    if (currentPH < 6.5) {
        canvasContainer.className = 'canvas-container acid';
        phValueText.style.color = '#ef4444';
        statusBox.className = 'status-box acid';
        statusBox.innerHTML = `<h3>Solution Acide (pH < 7)</h3><p>Les ions Hydrogène (H⁺) sont majoritaires. La solution devient acide.</p>`;
    } else if (currentPH > 7.5) {
        canvasContainer.className = 'canvas-container base';
        phValueText.style.color = '#3b82f6';
        statusBox.className = 'status-box base';
        statusBox.innerHTML = `<h3>Solution Basique (pH > 7)</h3><p>Les ions Hydroxyde (OH⁻) sont majoritaires. La solution devient basique.</p>`;
    } else {
        canvasContainer.className = 'canvas-container neutral';
        phValueText.style.color = '#10b981';
        statusBox.className = 'status-box neutral';
        statusBox.innerHTML = `<h3>Solution Neutre (pH ≈ 7)</h3><p>Il y a un équilibre parfait entre les ions H⁺ et OH⁻. Ils s'annulent pour former de l'eau.</p>`;
    }

    // Gestion physique
    handleCollisions();
    particles.forEach(p => {
        p.update();
        p.draw();
    });

    requestAnimationFrame(animate);
}

// Écouteurs de boutons
document.getElementById('btn-acid').addEventListener('click', () => {
    if (particles.length < MAX_PARTICLES) {
        for(let i=0; i<15; i++) particles.push(new Particle('H'));
        updatePH();
    }
});

document.getElementById('btn-base').addEventListener('click', () => {
    if (particles.length < MAX_PARTICLES) {
        for(let i=0; i<15; i++) particles.push(new Particle('OH'));
        updatePH();
    }
});

document.getElementById('btn-water').addEventListener('click', () => {
    let removeCount = Math.floor(particles.length * 0.4);
    for(let i=0; i<removeCount; i++) {
        particles.pop(); 
    }
    updatePH();
});

document.getElementById('btn-reset').addEventListener('click', () => {
    particles = [];
    updatePH();
});

// Lancement automatique
setTimeout(() => {
    resizeCanvas();
    for(let i=0; i<5; i++) particles.push(new Particle('H'));
    for(let i=0; i<5; i++) particles.push(new Particle('OH'));
    updatePH();
    animate();
}, 200);