// =======================================================
// MOTEUR CANVAS & PHYSIQUE : LA MOLE (n, m, N)
// =======================================================

window.switchTab = function(tabId) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');
};

(function() {
    let canvas, ctx, dpr;

    // Constantes physiques
    const N_A = 6.022; // * 10^23 

    // État du système
    let n_mol = 1.0;          
    let M_gmol = 18.0;        
    let materialName = "Eau";
    let materialColor = "#3b82f6";
    let m_masse = 18.0;       
    
    // Moteur de particules
    let particles = [];
    let targetParticlesCount = 0;
    
    // Géométrie
    const cx = 200; 
    const cy = 250; 
    const beakerW = 120;
    const beakerH = 140;

    // =======================================================
    // 1. INITIALISATION ROBUSTE
    // =======================================================
    function initLab() {
        canvas = document.getElementById('moleCanvas');
        if (!canvas) return;

        ctx = canvas.getContext('2d');
        dpr = window.devicePixelRatio || 1;
        canvas.width = 400 * dpr;
        canvas.height = 350 * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = "400px";
        canvas.style.height = "350px";

        // Événements
        document.getElementById('slider-n').addEventListener('input', (e) => {
            n_mol = parseFloat(e.target.value);
            document.getElementById('val-n').innerText = n_mol.toFixed(1) + " mol";
            updatePhysics();
        });

        document.querySelectorAll('.btn-material').forEach(btn => {
            btn.addEventListener('click', (event) => {
                document.querySelectorAll('.btn-material').forEach(b => b.classList.remove('active'));
                const target = event.target.closest('.btn-material');
                target.classList.add('active');
                
                M_gmol = parseFloat(target.dataset.m);
                materialColor = target.dataset.color;
                materialName = target.dataset.name;
                
                particles = []; // On vide le bécher
                updatePhysics();
            });
        });

        document.getElementById('btn-tare').addEventListener('click', () => {
            n_mol = 0;
            document.getElementById('slider-n').value = 0;
            document.getElementById('val-n').innerText = "0.0 mol";
            updatePhysics();
        });

        updatePhysics();
        requestAnimationFrame(draw);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLab);
    } else {
        initLab();
    }

    // =======================================================
    // 2. MOTEUR PHYSIQUE & MATHÉMATIQUES (ANALOGIES)
    // =======================================================
    function updatePhysics() {
        m_masse = n_mol * M_gmol;
        let N_particles = n_mol * N_A; 

        document.getElementById('res-m').innerText = m_masse.toFixed(1) + " g";
        
        if (n_mol === 0) {
            document.getElementById('res-N').innerText = "0 entité";
            document.getElementById('calc-result-N').innerText = "0";
            document.getElementById('ana-N').innerHTML = "0";
            document.getElementById('ana-riz').innerText = "0";
            document.getElementById('ana-papier').innerText = "0";
            document.getElementById('ana-temps').innerText = "0";
        } else {
            let n_format = N_particles.toFixed(2) + " &times; 10<sup>23</sup>";
            document.getElementById('res-N').innerHTML = n_format;
            document.getElementById('calc-result-N').innerHTML = n_format;
            document.getElementById('ana-N').innerHTML = n_format;

            // --- CALCUL DES ANALOGIES MACROSCOPIQUES ---
            // 1. RIZ : 1 mole = ~3.2 fois la Mer Méditerranée
            let riz = (n_mol * 3.24).toFixed(1);
            document.getElementById('ana-riz').innerText = riz;

            // 2. PAPIER : 1 mole de feuilles empilées = ~400 millions de fois Terre-Soleil
            let papier = (n_mol * 401).toFixed(0);
            document.getElementById('ana-papier').innerText = papier;

            // 3. TEMPS : 1 mole de secondes = ~1.38 millions de fois l'âge de l'Univers
            let temps = (n_mol * 1.38).toFixed(2);
            document.getElementById('ana-temps').innerText = temps;
        }

        // MAJ encarts calculs
        document.getElementById('calc-n').innerText = n_mol.toFixed(1);
        document.getElementById('calc-molar').innerText = M_gmol.toFixed(1);
        document.getElementById('calc-result-m').innerText = m_masse.toFixed(1);
        document.getElementById('calc-n2').innerText = n_mol.toFixed(1);

        targetParticlesCount = Math.floor(n_mol * 30);
    }

    // =======================================================
    // 3. MOTEUR DE DESSIN CANVAS
    // =======================================================
    function drawRoundedRect(context, x, y, width, height, radius) {
        context.beginPath();
        context.moveTo(x + radius, y);
        context.lineTo(x + width - radius, y);
        context.quadraticCurveTo(x + width, y, x + width, y + radius);
        context.lineTo(x + width, y + height - radius);
        context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        context.lineTo(x + radius, y + height);
        context.quadraticCurveTo(x, y + height, x, y + height - radius);
        context.lineTo(x, y + radius);
        context.quadraticCurveTo(x, y, x + radius, y);
        context.closePath();
    }

    function draw() {
        ctx.clearRect(0, 0, 400, 350);

        if (particles.length < targetParticlesCount) {
            particles.push({
                x: cx + (Math.random() - 0.5) * (beakerW - 20),
                y: cy - beakerH - 20, 
                vx: (Math.random() - 0.5) * 1,
                vy: Math.random() * 2 + 2,
                color: materialColor
            });
        } else if (particles.length > targetParticlesCount) {
            particles.pop();
        }

        ctx.lineWidth = 1;
        for (let i = 0; i < particles.length; i++) {
            let p = particles[i];
            
            p.vy += 0.4; 
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < cx - beakerW/2 + 5) { p.x = cx - beakerW/2 + 5; p.vx *= -0.5; }
            if (p.x > cx + beakerW/2 - 5) { p.x = cx + beakerW/2 - 5; p.vx *= -0.5; }
            
            let floorY = cy - 5 - (Math.random() * 2); 
            if (p.y > floorY) {
                p.y = floorY;
                p.vy *= -0.3; 
                p.vx *= 0.8;  
            }

            if (M_gmol === 18.0 && p.y > floorY - 5 && Math.abs(p.vy) < 1) {
                p.y = cy - 5 - (i / beakerW) * 3; 
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
            ctx.strokeStyle = "rgba(0,0,0,0.2)";
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.moveTo(cx - beakerW/2, cy - beakerH);
        ctx.lineTo(cx - beakerW/2, cy);
        ctx.lineTo(cx + beakerW/2, cy);
        ctx.lineTo(cx + beakerW/2, cy - beakerH);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        ctx.fill();

        ctx.fillStyle = "#94a3b8";
        drawRoundedRect(ctx, cx - 80, cy, 160, 10, 4);
        ctx.fill();
        
        ctx.fillStyle = "#e2e8f0";
        drawRoundedRect(ctx, cx - 110, cy + 10, 220, 60, 8);
        ctx.fill();
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#1e293b";
        drawRoundedRect(ctx, cx - 60, cy + 25, 120, 30, 4);
        ctx.fill();

        ctx.fillStyle = "#10b981"; 
        ctx.font = "bold 18px 'Courier New', monospace";
        ctx.textAlign = "right";
        ctx.fillText(m_masse.toFixed(1) + " g", cx + 50, cy + 47);

        requestAnimationFrame(draw);
    }
})();