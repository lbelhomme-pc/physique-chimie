// =======================================================
// MOTEUR CANVAS & PHYSIQUE : DIFFRACTION ET INTERFÉRENCES
// =======================================================

(function() {
    let canvas, ctx, dpr;
    let intensityChart = null;

    // --- Variables d'état ---
    let mode = 'diffraction'; // 'diffraction' ou 'interference'
    let lambda_nm = 632;      // Longueur d'onde (nm)
    let a_um = 100;           // Largeur de fente (µm)
    let b_um = 300;           // Écartement fentes (µm)
    let D_m = 2.0;            // Distance écran (m)
    
    // Variables d'animation
    let time = 0;
    const cw = 500;
    const ch = 300;

    // Données du graphique (x en mm, y en Intensité relative de 0 à 1)
    let chartData = [];

    // =======================================================
    // 1. INITIALISATION
    // =======================================================
    function initLab() {
        canvas = document.getElementById('waveCanvas');
        if (!canvas) return;

        ctx = canvas.getContext('2d');
        dpr = window.devicePixelRatio || 1;
        canvas.width = cw * dpr;
        canvas.height = ch * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = cw + "px";
        canvas.style.height = ch + "px";

        // Écouteurs de la vue (Radio boutons)
        document.querySelectorAll('input[name="mode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                mode = e.target.value;
                const groupB = document.getElementById('group-b');
                const sliderB = document.getElementById('slider-b');
                const boxI = document.getElementById('box-i');
                
                if (mode === 'interference') {
                    groupB.style.display = 'flex';
                    setTimeout(() => groupB.style.opacity = '1', 10);
                    sliderB.disabled = false;
                    boxI.style.display = 'flex';
                } else {
                    groupB.style.opacity = '0.5';
                    setTimeout(() => groupB.style.display = 'none', 300);
                    sliderB.disabled = true;
                    boxI.style.display = 'none';
                }
                updatePhysics();
            });
        });

        // Écouteurs Sliders
        document.getElementById('slider-lambda').addEventListener('input', (e) => {
            lambda_nm = parseInt(e.target.value);
            let color = wavelengthToRGB(lambda_nm);
            let badge = document.getElementById('val-lambda');
            badge.innerText = lambda_nm + " nm";
            badge.style.background = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
            document.getElementById('slider-lambda').style.setProperty('--thumb-color', `rgb(${color[0]}, ${color[1]}, ${color[2]})`);
            updatePhysics();
        });

        document.getElementById('slider-a').addEventListener('input', (e) => {
            a_um = parseInt(e.target.value);
            document.getElementById('val-a').innerText = a_um + " µm";
            updatePhysics();
        });

        document.getElementById('slider-b').addEventListener('input', (e) => {
            b_um = parseInt(e.target.value);
            document.getElementById('val-b').innerText = b_um + " µm";
            updatePhysics();
        });

        document.getElementById('slider-D').addEventListener('input', (e) => {
            D_m = parseFloat(e.target.value);
            document.getElementById('val-D').innerText = D_m.toFixed(1) + " m";
            updatePhysics();
        });

        window.switchTab = function(tabId) {
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            event.target.classList.add('active');
        };

        initChart();
        updatePhysics();
        requestAnimationFrame(draw);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLab);
    } else {
        initLab();
    }

    // =======================================================
    // 2. CONVERTISSEUR LONGUEUR D'ONDE -> RGB (Algorithme de Dan Bruton)
    // =======================================================
    function wavelengthToRGB(Wavelength) {
        let R, G, B, alpha;
        if(Wavelength >= 380 && Wavelength < 440) { R = -(Wavelength - 440) / (440 - 380); G = 0.0; B = 1.0; }
        else if(Wavelength >= 440 && Wavelength < 490) { R = 0.0; G = (Wavelength - 440) / (490 - 440); B = 1.0; }
        else if(Wavelength >= 490 && Wavelength < 510) { R = 0.0; G = 1.0; B = -(Wavelength - 510) / (510 - 490); }
        else if(Wavelength >= 510 && Wavelength < 580) { R = (Wavelength - 510) / (580 - 510); G = 1.0; B = 0.0; }
        else if(Wavelength >= 580 && Wavelength < 645) { R = 1.0; G = -(Wavelength - 645) / (645 - 580); B = 0.0; }
        else if(Wavelength >= 645 && Wavelength <= 780) { R = 1.0; G = 0.0; B = 0.0; }
        else { R = 0.0; G = 0.0; B = 0.0; }

        // Atténuation aux bords du spectre
        if(Wavelength >= 380 && Wavelength < 420) alpha = 0.3 + 0.7*(Wavelength - 380) / (420 - 380);
        else if(Wavelength >= 420 && Wavelength < 701) alpha = 1.0;
        else if(Wavelength >= 701 && Wavelength <= 780) alpha = 0.3 + 0.7*(780 - Wavelength) / (780 - 700);
        else alpha = 0.0;

        return [Math.round(R * alpha * 255), Math.round(G * alpha * 255), Math.round(B * alpha * 255)];
    }

    // =======================================================
    // 3. MATHÉMATIQUES & PHYSIQUE
    // =======================================================
    function sinc(x) {
        if (x === 0) return 1;
        return Math.sin(x) / x;
    }

    function updatePhysics() {
        let lambda_m = lambda_nm * 1e-9;
        let a_m = a_um * 1e-6;
        let b_m = b_um * 1e-6;

// Écart angulaire theta
        let theta = lambda_m / a_m;
        
        // --- CORRECTION : Écriture scientifique propre ---
        let theta_mrad = theta * 1000;
        document.getElementById('res-theta').innerText = theta_mrad.toFixed(2) + " × 10⁻³ rad";
        // -------------------------------------------------

        // Largeur tache centrale L
        let L_m = (2 * lambda_m * D_m) / a_m;
        let L_mm = L_m * 1000;

        // Interfrange i
        let i_m = (lambda_m * D_m) / b_m;
        let i_mm = i_m * 1000;

        // Affichage valeurs
        document.getElementById('res-theta').innerText = theta.toExponential(2) + " rad";
        document.getElementById('res-L').innerText = L_mm.toFixed(1) + " mm";
        if (mode === 'interference') {
            document.getElementById('res-i').innerText = i_mm.toFixed(2) + " mm";
        }

        // --- Calcul de la courbe d'intensité I(x) ---
        chartData = [];
        // On calcule sur l'écran virtuel de -50 mm à +50 mm
        const max_x_mm = 50; 
        const points = 300; // Résolution de la courbe

        for (let j = 0; j <= points; j++) {
            let x_mm = -max_x_mm + (j / points) * (2 * max_x_mm);
            let x_m = x_mm / 1000;

            // Formule diffraction pure (Enveloppe) : I = I0 * sinc^2( pi * a * x / (lambda * D) )
            let u = (Math.PI * a_m * x_m) / (lambda_m * D_m);
            let I_diff = Math.pow(sinc(u), 2);

            let I_total = I_diff;

            // Si interférences (Fentes d'Young)
            if (mode === 'interference') {
                // I = 2 * I_diff * (1 + cos( 2*pi*b*x / (lambda*D) ))
                // Version normalisée à 1 : I = I_diff * cos^2( pi*b*x / (lambda*D) )
                let v = (Math.PI * b_m * x_m) / (lambda_m * D_m);
                I_total = I_diff * Math.pow(Math.cos(v), 2);
            }

            chartData.push({ x: parseFloat(x_mm.toFixed(2)), y: parseFloat(I_total.toFixed(4)) });
        }

        updateChartAndScreen();
    }

    // =======================================================
    // 4. MOTEUR DE DESSIN CANVAS
    // =======================================================
    function draw() {
        time += 1; // Avance l'onde
        ctx.clearRect(0, 0, cw, ch);

        let rgb = wavelengthToRGB(lambda_nm);
        let colorSolid = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
        let colorGlow = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.3)`;

        const slitX = 150; // Position de l'obstacle
        const screenX = cw - 30; // Position de l'écran droit

        // 1. Le faisceau incident (Avant la fente)
        let gradient = ctx.createLinearGradient(0, 0, slitX, 0);
        gradient.addColorStop(0, colorGlow);
        gradient.addColorStop(1, colorSolid);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, ch/2 - 20, slitX, 40);

        // 2. L'obstacle (Les fentes)
        ctx.fillStyle = "#334155";
        ctx.fillRect(slitX, 0, 10, ch);
        
        ctx.fillStyle = "#020617"; // "Vide" pour faire le trou
        if (mode === 'diffraction') {
            ctx.fillRect(slitX, ch/2 - 5, 10, 10);
        } else {
            ctx.fillRect(slitX, ch/2 - 15, 10, 8);
            ctx.fillRect(slitX, ch/2 + 7, 10, 8);
        }

        // 3. Les fronts d'onde (Cercles concentriques)
        ctx.save();
        // On crée un masque pour ne dessiner les ondes que vers la droite
        ctx.beginPath();
        ctx.rect(slitX + 10, 0, screenX - slitX - 10, ch);
        ctx.clip();

        ctx.strokeStyle = colorSolid;
        ctx.lineWidth = 1.5;

        // Vitesse d'animation et espacement dépendent de lambda visuellement
        let spacing = lambda_nm / 20; 
        let speed = 1.5;

        function drawWaves(originY) {
            for (let r = (time * speed) % spacing; r < screenX * 1.5; r += spacing) {
                ctx.beginPath();
                ctx.arc(slitX + 10, originY, r, -Math.PI/2, Math.PI/2);
                ctx.globalAlpha = Math.max(0, 1 - (r / (screenX - slitX))); // L'onde s'atténue
                ctx.stroke();
            }
        }

        if (mode === 'diffraction') {
            drawWaves(ch/2);
        } else {
            drawWaves(ch/2 - 11);
            drawWaves(ch/2 + 11);
        }
        ctx.restore();

        // 4. L'Écran (Projection)
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(screenX, 0, 30, ch);

        // On projette le profil d'intensité sur le canevas (en hauteur)
        // La hauteur de l'écran est de 300px, on mappe x de -50mm à +50mm sur 0 à 300px
        for (let i = 0; i < chartData.length; i++) {
            let point = chartData[i];
            let y_canvas = (point.x + 50) / 100 * ch; // x de chartData est entre -50 et +50
            
            ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${point.y})`;
            ctx.fillRect(screenX - 2, y_canvas, 10, 2); // Halo lumineux sur l'écran
        }

        requestAnimationFrame(draw);
    }

    // =======================================================
    // 5. CHART.JS & VISUALISATION HTML
    // =======================================================
    function initChart() {
        const ctxChart = document.getElementById('intensityChart').getContext('2d');
        intensityChart = new Chart(ctxChart, {
            type: 'line',
            data: {
                datasets: [{ 
                    label: 'Intensité Relative I/I₀', 
                    data: [], 
                    borderColor: '#14b8a6', 
                    backgroundColor: 'rgba(20, 184, 166, 0.1)', 
                    fill: true,
                    tension: 0.1, 
                    pointRadius: 0,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: {
                    x: { type: 'linear', title: { display: true, text: 'Position x sur l\'écran (mm)' }, min: -50, max: 50 },
                    y: { title: { display: true, text: 'I(x)' }, min: 0, max: 1.1 }
                },
                animation: false, // Indispensable pour la fluidité avec les sliders !
                plugins: { legend: { display: false } }
            }
        });
    }

    function updateChartAndScreen() {
        let rgb = wavelengthToRGB(lambda_nm);
        let colorHex = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;

        // Mise à jour du Graphique
        intensityChart.data.datasets[0].data = chartData;
        intensityChart.data.datasets[0].borderColor = colorHex;
        intensityChart.data.datasets[0].backgroundColor = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.2)`;
        intensityChart.update();

        // Mise à jour de la barre visuelle HTML (Screen-projection)
        // On crée un dégradé linéaire CSS basé sur l'intensité !
        let gradientStr = `linear-gradient(to right, `;
        let stepCount = 50; // Simplification pour le CSS
        for(let i=0; i<=stepCount; i++) {
            let index = Math.floor((i / stepCount) * (chartData.length - 1));
            let intensity = chartData[index].y;
            gradientStr += `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${intensity}) ${i * (100/stepCount)}%`;
            if (i < stepCount) gradientStr += `, `;
        }
        gradientStr += `)`;
        document.getElementById('screen-projection').style.background = gradientStr;
    }
})();