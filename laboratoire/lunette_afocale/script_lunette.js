// =======================================================
// MOTEUR CANVAS & PHYSIQUE : LUNETTE AFOCALE
// =======================================================

(function() {
    let canvas, ctx, dpr;

    // --- Paramètres de l'optique ---
    let f1 = 400;     // Focale de l'objectif (L1) en mm
    let f2 = 100;     // Focale de l'oculaire (L2) en mm
    let thetaDeg = 2.0; // Angle d'incidence en degrés
    
    // --- Constantes de dessin ---
    const cw = 750;   // Largeur du Canvas
    const ch = 350;   // Hauteur du Canvas
    const y0 = 175;   // Axe optique (milieu de la hauteur)
    const x1 = 50;    // Position de L1 (Objectif) fixé à gauche
    
    // Le faisceau est composé de 5 rayons entrants (hauteurs d'impact sur L1)
    const yHits = [-60, -30, 0, 30, 60]; 

    // =======================================================
    // 1. INITIALISATION
    // =======================================================
    function initLab() {
        canvas = document.getElementById('opticsCanvas');
        if (!canvas) return;

        ctx = canvas.getContext('2d');
        dpr = window.devicePixelRatio || 1;
        canvas.width = cw * dpr;
        canvas.height = ch * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = cw + "px";
        canvas.style.height = ch + "px";

        // Événements Sliders
        document.getElementById('slider-f1').addEventListener('input', (e) => {
            f1 = parseFloat(e.target.value);
            document.getElementById('val-f1').innerText = f1 + " mm";
            updatePhysics();
        });

        document.getElementById('slider-f2').addEventListener('input', (e) => {
            f2 = parseFloat(e.target.value);
            document.getElementById('val-f2').innerText = f2 + " mm";
            updatePhysics();
        });

        document.getElementById('slider-theta').addEventListener('input', (e) => {
            thetaDeg = parseFloat(e.target.value);
            document.getElementById('val-theta').innerText = thetaDeg.toFixed(1) + " °";
            updatePhysics();
        });

        document.getElementById('btn-reset').addEventListener('click', () => {
            document.getElementById('slider-f1').value = 400;
            document.getElementById('slider-f2').value = 100;
            document.getElementById('slider-theta').value = 2;
            f1 = 400; f2 = 100; thetaDeg = 2.0;
            document.getElementById('val-f1').innerText = "400 mm";
            document.getElementById('val-f2').innerText = "100 mm";
            document.getElementById('val-theta').innerText = "2.0 °";
            updatePhysics();
        });

        // Gestion des Onglets
        window.switchTab = function(tabId) {
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            event.target.classList.add('active');
        };

        updatePhysics();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLab);
    } else {
        initLab();
    }

    // =======================================================
    // 2. MOTEUR PHYSIQUE & CALCULS
    // =======================================================
    function updatePhysics() {
        // 1. Calculs théoriques
        let thetaRad = thetaDeg * (Math.PI / 180);
        let G = f1 / f2; // Grossissement
        let thetaPrimeDeg = thetaDeg * G; // Angle émergent
        
        // Taille de l'image intermédiaire (A1B1 = f1 * tan(theta))
        let A1B1 = f1 * Math.tan(thetaRad);

        // 2. Mise à jour de l'interface Data
        document.getElementById('res-g').innerText = G.toFixed(2);
        document.getElementById('res-a1b1').innerText = Math.abs(A1B1).toFixed(1) + " mm";
        document.getElementById('res-theta-prime').innerText = thetaPrimeDeg.toFixed(1) + " °";

        // 3. Dessin
        draw(thetaRad, A1B1, G);
    }

    // =======================================================
    // 3. MOTEUR DE DESSIN CANVAS
    // =======================================================
    function draw(thetaRad, A1B1, G) {
        ctx.clearRect(0, 0, cw, ch);

        // Position de L2 déduite de la condition d'afocalisme
        let x2 = x1 + f1 + f2;
        let xFocus = x1 + f1; // Plan focal (F'1 = F2)

        drawGrid();
        drawOpticalAxis();
        
        // Tracé des rayons lumineux
        drawRayBundle(thetaRad, A1B1, x2, xFocus, G);
        
        // Image Intermédiaire A1B1
        drawArrow(xFocus, y0, xFocus, y0 - A1B1, "#ef4444", "B1");
        drawText("A1", xFocus - 5, y0 + 15, "#ef4444");

        // Dessin des Lentilles (L1 = Objectif, L2 = Oculaire)
        drawLens(x1, 280, "#3b82f6", "L1 (Objectif)");
        drawLens(x2, 160, "#a855f7", "L2 (Oculaire)");

        // Points remarquables
        drawPoint(x1, y0, "O1", "#94a3b8");
        drawPoint(x2, y0, "O2", "#94a3b8");
        drawPoint(xFocus, y0, "F'1 ≡ F2", "#10b981", true);

        // Angles
        drawAngleArc(x1, y0, thetaRad, "θ", "#3b82f6");
        drawAngleArc(x2, y0, thetaRad * G, "θ'", "#a855f7", true);
    }

    // --- Outils de Dessin ---

    function drawOpticalAxis() {
        ctx.beginPath();
        ctx.moveTo(0, y0);
        ctx.lineTo(cw, y0);
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([10, 5]);
        ctx.stroke();
        ctx.setLineDash([]); // Reset
    }

    function drawGrid() {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1;
        for (let i = 0; i < cw; i += 50) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, ch); ctx.stroke();
        }
        for (let i = 0; i < ch; i += 50) {
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(cw, i); ctx.stroke();
        }
    }

    function drawLens(x, height, color, label) {
        ctx.beginPath();
        ctx.moveTo(x, y0 - height/2);
        ctx.lineTo(x, y0 + height/2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Flèches convergentes (Haut)
        ctx.beginPath();
        ctx.moveTo(x - 5, y0 - height/2 + 10);
        ctx.lineTo(x, y0 - height/2);
        ctx.lineTo(x + 5, y0 - height/2 + 10);
        ctx.stroke();

        // Flèches convergentes (Bas)
        ctx.beginPath();
        ctx.moveTo(x - 5, y0 + height/2 - 10);
        ctx.lineTo(x, y0 + height/2);
        ctx.lineTo(x + 5, y0 + height/2 - 10);
        ctx.stroke();

        // Label
        ctx.fillStyle = color;
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "center";
        ctx.fillText(label, x, y0 - height/2 - 10);
    }

    function drawPoint(x, y, label, color, isTop = false) {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.font = "bold 13px Arial";
        ctx.fillText(label, x, isTop ? y - 10 : y + 20);
    }

    function drawArrow(xStart, yStart, xEnd, yEnd, color, label) {
        ctx.beginPath();
        ctx.moveTo(xStart, yStart);
        ctx.lineTo(xEnd, yEnd);
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Tête de la flèche
        let angle = Math.atan2(yEnd - yStart, xEnd - xStart);
        ctx.beginPath();
        ctx.moveTo(xEnd, yEnd);
        ctx.lineTo(xEnd - 8 * Math.cos(angle - Math.PI / 6), yEnd - 8 * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(xEnd - 8 * Math.cos(angle + Math.PI / 6), yEnd - 8 * Math.sin(angle + Math.PI / 6));
        ctx.lineTo(xEnd, yEnd);
        ctx.fillStyle = color;
        ctx.fill();

        if (label) {
            ctx.font = "bold 14px Arial";
            ctx.fillText(label, xEnd + 15, yEnd + 5);
        }
    }

    function drawRayBundle(thetaRad, A1B1, x2, xFocus, G) {
        let m_in = Math.tan(thetaRad); // Pente incidente
        let y_B1_canvas = y0 - A1B1;   // Ordonnée de B1 dans le canvas (Y inversé)
        
        // Pente émergente (G = theta' / theta -> m_out = - m_in * f1/f2)
        // Le signe - vient du fait que l'image est inversée par l'objectif
        let m_out = - m_in * G; 

        yHits.forEach((yImpact, index) => {
            let isCenterRay = (yImpact === 0);
            
            // 1. Rayon Incident (de la gauche vers L1)
            let y_L1 = y0 - yImpact; // Point d'impact sur L1
            // Equation de la droite incidente: y = m_in * (x - x1) + y_L1
            let y_start = m_in * (0 - x1) + y_L1; // D'où il part au bord gauche (x=0)

            ctx.beginPath();
            ctx.moveTo(0, y_start);
            ctx.lineTo(x1, y_L1);

            // 2. Rayon Intermédiaire (de L1 vers B1 puis L2)
            ctx.lineTo(xFocus, y_B1_canvas);
            
            // Equation de la droite intermédiaire : y = pente_inter * (x - xFocus) + y_B1
            let m_inter = (y_B1_canvas - y_L1) / (xFocus - x1);
            let y_L2 = m_inter * (x2 - xFocus) + y_B1_canvas;
            
            ctx.lineTo(x2, y_L2);

            // 3. Rayon Émergent (de L2 vers la droite)
            // Equation émergente : y = m_out * (x - x2) + y_L2
            let y_end = m_out * (cw - x2) + y_L2;
            
            ctx.lineTo(cw, y_end);

            // Style (Le rayon central qui passe par O1 est mis en évidence)
            ctx.strokeStyle = isCenterRay ? "rgba(14, 165, 233, 0.9)" : "rgba(14, 165, 233, 0.3)";
            ctx.lineWidth = isCenterRay ? 2.5 : 1.5;
            ctx.stroke();

            // Petites flèches sur les rayons pour indiquer le sens
            if (isCenterRay) {
                drawRayArrow(x1 / 2, m_in * (x1/2 - x1) + y_L1, m_in);
                drawRayArrow(x2 + 100, m_out * 100 + y_L2, m_out);
            }
        });
    }

    function drawRayArrow(x, y, slope) {
        let angle = Math.atan(slope);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 8 * Math.cos(angle - Math.PI / 6), y - 8 * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(x - 8 * Math.cos(angle + Math.PI / 6), y - 8 * Math.sin(angle + Math.PI / 6));
        ctx.fillStyle = "rgba(14, 165, 233, 0.9)";
        ctx.fill();
    }

    function drawAngleArc(x, y, angleRad, label, color, invert = false) {
        if (Math.abs(angleRad) < 0.01) return; // Ne pas dessiner si l'angle est 0
        
        ctx.beginPath();
        let radius = 40;
        // Direction de l'arc
        let startAngle = 0;
        let endAngle = Math.atan(Math.tan(angleRad)); // Normalise
        
        if (invert) {
            startAngle = Math.PI;
            endAngle = Math.PI + Math.atan(Math.tan(angleRad));
        }

        // On dessine l'arc (attention au sens anti-horaire si angle négatif)
        if (angleRad > 0) {
            ctx.arc(x, y, radius, startAngle, endAngle, false);
        } else {
            ctx.arc(x, y, radius, startAngle, endAngle, true);
        }
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Texte de l'angle
        ctx.fillStyle = color;
        ctx.font = "bold 14px Arial";
        let textX = invert ? x - radius - 15 : x + radius + 10;
        let textY = y + Math.sin(endAngle) * radius + (angleRad > 0 ? 10 : -10);
        ctx.fillText(label, textX, textY);
    }

})();