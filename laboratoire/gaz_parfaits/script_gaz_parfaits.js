document.addEventListener('DOMContentLoaded', () => {
    // --- ÉLÉMENTS DOM ---
    const sliderTemp = document.getElementById("slider-temp");
    const sliderVol = document.getElementById("slider-vol");
    const sliderMol = document.getElementById("slider-mol");

    const valTempC = document.getElementById("val-temp-c");
    const valTempK = document.getElementById("val-temp-k");
    const valVol = document.getElementById("val-vol");
    const valMol = document.getElementById("val-mol");
    const valPressure = document.getElementById("val-pressure");
    const pressureWarning = document.getElementById("pressure-warning");

    const canvas = document.getElementById("gasCanvas");
    const ctx = canvas.getContext("2d");
    const cylinderWalls = document.getElementById("cylinderWalls");
    const piston = document.getElementById("piston");

    // --- CONSTANTES PHYSIQUES ---
    const R = 8.314; // Constante des gaz parfaits (J/(mol.K))
    let W = 0, H = 0;
    let P = 0; // Pression en Bar
    
    // Variables d'état
    let T_K = 293.15; // Température en Kelvin
    let V_L = 20;     // Volume en Litres
    let n_mol = 2.0;  // Quantité de matière en moles

    // --- MOTEUR DE PARTICULES ---
    const particles = [];
    const PARTICLES_PER_MOL = 50; // Ratio visuel

    class Particle {
        constructor(maxX, maxY, speedMultiplier) {
            this.radius = 3;
            // Apparition aléatoire dans le volume actuel
            this.x = this.radius + Math.random() * (maxX - this.radius * 2);
            this.y = this.radius + Math.random() * (maxY - this.radius * 2);
            
            // Direction aléatoire
            let angle = Math.random() * Math.PI * 2;
            
            // La vitesse dépend de la température (racine carrée de T, théorie cinétique des gaz)
            let speed = Math.sqrt(T_K) * 0.2 * speedMultiplier;
            
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
        }

        updateSpeed(oldTemp, newTemp) {
            // Ajustement dynamique de la vitesse sans changer la direction
            let ratio = Math.sqrt(newTemp) / Math.sqrt(oldTemp);
            this.vx *= ratio;
            this.vy *= ratio;
        }
    }

    // Gérer la quantité de particules
    function syncParticles() {
        const targetCount = Math.floor(n_mol * PARTICLES_PER_MOL);
        const currentCount = particles.length;
        const currentPistonX = (V_L / 50) * W;

        if (targetCount > currentCount) {
            // Ajouter
            for (let i = 0; i < targetCount - currentCount; i++) {
                // Variations légères de vitesse pour ne pas avoir un bloc uniforme
                particles.push(new Particle(currentPistonX, H, 0.8 + Math.random() * 0.4));
            }
        } else if (targetCount < currentCount) {
            // Retirer
            particles.splice(targetCount, currentCount - targetCount);
        }
    }

    // --- MISE À JOUR DE LA PHYSIQUE (P = nRT/V) ---
    function updatePhysics() {
        let oldTemp = T_K;
        
        // 1. Récupération des sliders
        let T_C = parseInt(sliderTemp.value);
        T_K = T_C + 273.15;
        V_L = parseFloat(sliderVol.value);
        n_mol = parseFloat(sliderMol.value);

        // 2. Calcul de la Pression
        // V en m3 = V_L / 1000
        // P(Pa) = (n * R * T) / V(m3)
        let V_m3 = V_L / 1000;
        let P_Pa = (n_mol * R * T_K) / V_m3;
        
        // Conversion en Bar (1 bar = 100 000 Pa)
        P = P_Pa / 100000;

        // 3. Mise à jour de l'UI
        valTempC.innerText = T_C + " °C";
        valTempK.innerText = T_K.toFixed(1) + " K";
        valVol.innerText = V_L;
        valMol.innerText = n_mol.toFixed(1);
        valPressure.innerText = P.toFixed(2) + " bar";

        // 4. Couleur Température (Bleu -> Rouge)
        let tempRatio = (T_C + 50) / 200; // 0 à 1
        let r = Math.round(tempRatio * 255);
        let b = Math.round((1 - tempRatio) * 255);
        let color = `rgb(${r}, 40, ${b})`;
        
        valTempC.style.backgroundColor = `rgba(${r}, 40, ${b}, 0.2)`;
        valTempC.style.borderColor = color;
        valTempC.style.color = color;
        valTempK.style.backgroundColor = `rgba(${r}, 40, ${b}, 0.2)`;
        valTempK.style.borderColor = color;
        valTempK.style.color = color;

        // 5. Gestion de la Surpression (Visuel)
        if (P > 6.0) {
            valPressure.style.color = "#ef4444"; // Rouge
            valPressure.style.boxShadow = "inset 0 4px 10px rgba(0,0,0,0.8), 0 0 20px rgba(239, 68, 68, 0.6)";
            valPressure.style.borderColor = "#ef4444";
            pressureWarning.style.opacity = "1";
        } else if (P > 4.0) {
            valPressure.style.color = "#f59e0b"; // Orange
            valPressure.style.boxShadow = "inset 0 4px 10px rgba(0,0,0,0.8), 0 0 15px rgba(245, 158, 11, 0.4)";
            valPressure.style.borderColor = "#f59e0b";
            pressureWarning.style.opacity = "0";
        } else {
            valPressure.style.color = "#22d3ee"; // Normal (Cyan)
            valPressure.style.boxShadow = "inset 0 4px 10px rgba(0,0,0,0.8), 0 4px 15px rgba(6, 182, 212, 0.2)";
            valPressure.style.borderColor = "#1e293b";
            pressureWarning.style.opacity = "0";
        }

        // 6. Mise à jour de la mécanique (Piston et Particules)
        if (W > 0) {
            const pistonX = (V_L / 50) * W; // Le volume max est 50L, mappé sur la largeur du Canvas
            piston.style.left = pistonX + "px";

            // Repousser les particules si le volume diminue
            particles.forEach(p => {
                if (p.x > pistonX - p.radius) {
                    p.x = pistonX - p.radius;
                    p.vx = -Math.abs(p.vx); // Rebond immédiat vers la gauche
                }
                // Mise à jour de la vitesse selon la nouvelle température
                p.updateSpeed(oldTemp, T_K);
            });
        }
        
        syncParticles();
    }

    // Écouteurs sur les sliders
    sliderTemp.addEventListener("input", updatePhysics);
    sliderVol.addEventListener("input", updatePhysics);
    sliderMol.addEventListener("input", updatePhysics);

    // --- INITIALISATION CANVAS ---
    function initCanvas() {
        const rect = cylinderWalls.getBoundingClientRect();
        W = rect.width;
        H = rect.height;
        // Fix bug : On map le canvas sur 100% de la largeur, le CSS cache ce qui dépasse du piston
        canvas.width = W;
        canvas.height = H;
        
        updatePhysics();
    }

    window.addEventListener("resize", initCanvas);
    setTimeout(initCanvas, 100);

    // --- BOUCLE D'ANIMATION ---
    function animate() {
        ctx.clearRect(0, 0, W, H);
        
        const pistonX = (V_L / 50) * W;

        // Couleur des particules basée sur la température
        let T_C = parseInt(sliderTemp.value);
        let tempRatio = (T_C + 50) / 200;
        let pR = Math.round(tempRatio * 255);
        let pB = Math.round((1 - tempRatio) * 255);
        ctx.fillStyle = `rgb(${pR}, 150, ${pB})`;

        particles.forEach(p => {
            // Déplacement
            p.x += p.vx;
            p.y += p.vy;

            // Rebond sur les murs (Haut / Bas / Gauche)
            if (p.x - p.radius < 0) { p.x = p.radius; p.vx *= -1; }
            if (p.y - p.radius < 0) { p.y = p.radius; p.vy *= -1; }
            if (p.y + p.radius > H) { p.y = H - p.radius; p.vy *= -1; }
            
            // Rebond sur le piston (Droite)
            if (p.x + p.radius > pistonX) { 
                p.x = pistonX - p.radius; 
                p.vx *= -1; 
            }

            // Dessin
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        // Effet de lueur (Glow) global
        ctx.shadowBlur = 5;
        ctx.shadowColor = `rgb(${pR}, 150, ${pB})`;

        requestAnimationFrame(animate);
    }

    animate();
});