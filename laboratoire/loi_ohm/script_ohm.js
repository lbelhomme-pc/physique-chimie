// =======================================================
// MOTEUR CANVAS & PHYSIQUE : LA LOI D'OHM (U = R*I)
// =======================================================

(function() {
    let canvas, ctx, dpr;
    let ohmChart = null;

    // Constantes physiques et états
    let R = 100;       // Résistance en Ohms
    let U_gen = 0;     // Tension générateur en Volts
    let I_circuit = 0; // Intensité en Ampères
    let dataPoints = [];
    let electrons = [];
    const numElectrons = 40;

    // Constantes de dessin (Le parcours rectangulaire du fil)
    const rectX = 70, rectY = 80, rectW = 210, rectH = 180;
    const perimeter = rectW * 2 + rectH * 2;

    // =======================================================
    // 1. INITIALISATION ROBUSTE
    // =======================================================
    function initLab() {
        canvas = document.getElementById('circuitCanvas');
        if (!canvas) return;

        ctx = canvas.getContext('2d');
        dpr = window.devicePixelRatio || 1;
        canvas.width = 350 * dpr;
        canvas.height = 350 * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = "350px";
        canvas.style.height = "350px";

        // Initialiser les électrons avec un espacement régulier
        for (let i = 0; i < numElectrons; i++) {
            electrons.push({
                dist: (i / numElectrons) * perimeter, // Position sur le périmètre
                wobble: Math.random() * Math.PI * 2   // Pour l'effet de vibration
            });
        }

        // Connexion Interface
        const slider = document.getElementById('slider-tension');
        const valTension = document.getElementById('val-tension');
        
        slider.addEventListener('input', (e) => {
            U_gen = parseInt(e.target.value);
            valTension.innerText = U_gen + " V";
            updatePhysics();
        });

        document.querySelectorAll('.btn-resistor').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.btn-resistor').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                R = parseInt(e.target.dataset.r);
                updatePhysics();
            });
        });

        document.getElementById('btn-record').addEventListener('click', recordDataPoint);
        document.getElementById('btn-reset').addEventListener('click', resetLab);

        // Connexion Onglets
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
    // 2. MOTEUR PHYSIQUE
    // =======================================================
    function updatePhysics() {
        // U = R * I => I = U / R
        let true_I = U_gen / R; 
        
        // Ajout d'un minuscule bruit réaliste pour faire "vrai multimètre" (+/- 0.05 mA)
        let noise = U_gen > 0 ? (Math.random() - 0.5) * 0.0001 : 0; 
        I_circuit = Math.max(0, true_I + noise);
    }

    function recordDataPoint() {
        if (U_gen === 0 && dataPoints.length > 0) return; // Évite les 0 multiples
        
        let I_mA = parseFloat((I_circuit * 1000).toFixed(1));
        let I_A = parseFloat(I_circuit.toFixed(4));
        
        // Vérifie si le point existe déjà (pour ne pas spammer le même point)
        if (dataPoints.some(p => p.u === U_gen)) {
            let msg = document.getElementById('status-msg');
            msg.innerText = `La mesure à ${U_gen} V est déjà enregistrée ! Change la tension.`;
            msg.style.borderColor = "#f59e0b";
            return;
        }

        dataPoints.push({ u: U_gen, i: I_mA, ia: I_A });
        
        // Trie par ordre croissant de tension pour tracer une belle droite
        dataPoints.sort((a, b) => a.u - b.u);
        
        updateTableAndChart();

        let msg = document.getElementById('status-msg');
        msg.innerText = `Point enregistré : U = ${U_gen} V, I = ${I_mA} mA.`;
        msg.style.borderColor = "#10b981";
    }

    function resetLab() {
        U_gen = 0;
        document.getElementById('slider-tension').value = 0;
        document.getElementById('val-tension').innerText = "0 V";
        dataPoints = [];
        updatePhysics();
        updateTableAndChart();
        document.getElementById('status-msg').innerText = "Allume le générateur et relève les mesures !";
        document.getElementById('chart-info').style.display = "none";
    }

    // =======================================================
    // 3. MOTEUR DE DESSIN CANVAS (Le Circuit)
    // =======================================================
    function draw() {
        ctx.clearRect(0, 0, 350, 350);

        // 1. Les fils (Rectangle gris clair)
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 4;
        ctx.strokeRect(rectX, rectY, rectW, rectH);

        // 2. Les Électrons en mouvement
        drawElectrons();

        // 3. Les Composants (Qui cachent les fils derrière eux)
        drawGenerator(rectX, rectY + rectH/2);         // Générateur (Gauche)
        drawResistor(rectX + rectW, rectY + rectH/2);  // Résistance (Droite)
        drawAmmeter(rectX + rectW/2, rectY);           // Ampèremètre (Haut)
        drawVoltmeter();                               // Voltmètre (Dérivation)

        requestAnimationFrame(draw);
    }

    function drawElectrons() {
        // La vitesse est proportionnelle au courant I !
        // Coefficient pour que l'animation soit agréable visuellement
        let baseSpeed = I_circuit * 100; 

        ctx.fillStyle = "#38bdf8";

        electrons.forEach(e => {
            // Si pas de courant, ils vibrent sur place. Sinon ils avancent.
            if (baseSpeed > 0) {
                e.dist = (e.dist + baseSpeed) % perimeter;
            }
            e.wobble += 0.1;
            
            // Calcul des coordonnées X,Y en fonction de la distance "déroulée" sur le rectangle
            let d = e.dist;
            let ex, ey;

            if (d < rectW) { // Fil du Haut (vers la droite)
                ex = rectX + d;
                ey = rectY;
            } else if (d < rectW + rectH) { // Fil de Droite (vers le bas)
                ex = rectX + rectW;
                ey = rectY + (d - rectW);
            } else if (d < rectW * 2 + rectH) { // Fil du Bas (vers la gauche)
                ex = rectX + rectW - (d - rectW - rectH);
                ey = rectY + rectH;
            } else { // Fil de Gauche (vers le haut)
                ex = rectX;
                ey = rectY + rectH - (d - rectW*2 - rectH);
            }

            // Vibration légère orthogonale au fil
            let offset = Math.sin(e.wobble) * 2;
            if (ey === rectY || ey === rectY + rectH) ey += offset;
            else ex += offset;

            ctx.beginPath();
            ctx.arc(ex, ey, 3, 0, Math.PI * 2);
            ctx.fill();
            // Effet brillant
            ctx.shadowBlur = 5;
            ctx.shadowColor = "#38bdf8";
            ctx.fill();
            ctx.shadowBlur = 0;
        });
    }

    function drawComponentBox(x, y, size, color, text, valueText) {
        ctx.fillStyle = "white";
        ctx.fillRect(x - size/2, y - size/2, size, size);
        ctx.beginPath();
        ctx.arc(x, y, size/2, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "#1e293b";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#1e293b";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, x, y);

        if (valueText) {
            ctx.font = "bold 12px Arial";
            ctx.fillStyle = "#dc2626";
            ctx.fillText(valueText, x, y + size/2 + 15);
        }
    }

    function drawGenerator(x, y) {
        // Cercle G
        drawComponentBox(x, y, 40, "#f8fafc", "G", `${U_gen} V`);
    }

    function drawAmmeter(x, y) {
        // Cercle A (Affiche des mA)
        let displayI = (I_circuit * 1000).toFixed(1);
        if (U_gen === 0) displayI = "0.0";
        drawComponentBox(x, y, 40, "#f8fafc", "A", `${displayI} mA`);
    }

    function drawResistor(x, y) {
        // Rectangle de la résistance
        ctx.fillStyle = "white";
        ctx.fillRect(x - 15, y - 30, 30, 60);
        ctx.fillStyle = "#cbd5e1";
        ctx.fillRect(x - 10, y - 25, 20, 50);
        ctx.strokeRect(x - 10, y - 25, 20, 50);
        
        ctx.font = "bold 12px Arial";
        ctx.fillStyle = "#ea580c";
        ctx.textAlign = "center";
        ctx.fillText(`${R} Ω`, x + 35, y);
    }

    function drawVoltmeter() {
        // Dérivation sur la droite
        const vx = rectX + rectW - 60;
        const vy = rectY + rectH/2;
        
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 2;
        
        // Fils de connexion en dérivation
        ctx.beginPath();
        ctx.moveTo(rectX + rectW, vy - 40);
        ctx.lineTo(vx, vy - 40);
        ctx.lineTo(vx, vy + 40);
        ctx.lineTo(rectX + rectW, vy + 40);
        ctx.stroke();

        // Points de connexion
        ctx.fillStyle = "#1e293b";
        ctx.beginPath(); ctx.arc(rectX + rectW, vy - 40, 4, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(rectX + rectW, vy + 40, 4, 0, Math.PI*2); ctx.fill();

        // Le Voltmetre
        drawComponentBox(vx, vy, 35, "#f8fafc", "V", `${U_gen.toFixed(1)} V`);
    }

    // =======================================================
    // 4. CHART.JS & TABLEAU DE DONNÉES
    // =======================================================
    function initChart() {
        const ctxChart = document.getElementById('ohmChart').getContext('2d');
        ohmChart = new Chart(ctxChart, {
            type: 'line',
            data: {
                datasets: [{ 
                    label: 'Caractéristique U = f(I)', 
                    data: [], 
                    borderColor: '#f59e0b', 
                    backgroundColor: '#f59e0b', 
                    tension: 0, // Droite parfaite, pas de courbure !
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: {
                    x: { type: 'linear', title: { display: true, text: 'Intensité I (mA)' }, min: 0 },
                    y: { title: { display: true, text: 'Tension U (V)' }, min: 0, max: 13 }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) { return `I = ${context.parsed.x} mA, U = ${context.parsed.y} V`; }
                        }
                    }
                }
            }
        });
    }

    function updateTableAndChart() {
        // MAJ Graphique
        ohmChart.data.datasets[0].data = dataPoints.map(p => ({ x: p.i, y: p.u }));
        ohmChart.update();

        // MAJ Tableau
        const tbody = document.getElementById('table-body');
        tbody.innerHTML = '';
        
        dataPoints.forEach(p => {
            let row = document.createElement('tr');
            row.innerHTML = `<td>${p.i}</td><td style="color:#64748b;">${p.ia}</td><td><strong>${p.u}</strong></td>`;
            tbody.appendChild(row);
        });

        // Affiche l'encart d'analyse s'il y a assez de points pour voir la droite
        if (dataPoints.length >= 3) {
            document.getElementById('chart-info').style.display = "block";
        }
    }
})();