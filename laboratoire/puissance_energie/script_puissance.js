// =======================================================
// MOTEUR CANVAS & PHYSIQUE : PUISSANCE & ÉNERGIE (E = P x t)
// =======================================================

(function() {
    let canvas, ctx, dpr;
    let energyChart = null;

    // Constantes et variables physiques
    let P = 10;        // Puissance en Watts (10W par défaut)
    const U = 230;     // Tension du secteur
    let E = 0;         // Énergie en Joules
    let timeElapsed = 0; // Temps en secondes
    
    let isRunning = false;
    let dataPoints = [];
    
    // Variables pour l'animation
    let discAngle = 0;     
    let electrons = [];
    const numElectrons = 15;

    // Fonction de compatibilité universelle pour les rectangles arrondis (Remplace roundRect)
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

    // =======================================================
    // 1. INITIALISATION
    // =======================================================
    function initLab() {
        canvas = document.getElementById('energyCanvas');
        if (!canvas) return;

        ctx = canvas.getContext('2d');
        dpr = window.devicePixelRatio || 1;
        canvas.width = 350 * dpr;
        canvas.height = 250 * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = "350px";
        canvas.style.height = "250px";

        // Génération des électrons dans le fil
        for (let i = 0; i < numElectrons; i++) {
            electrons.push({ x: (i / numElectrons) * 350, wobble: Math.random() * Math.PI * 2 });
        }

        // Événements boutons appareils
        document.querySelectorAll('.btn-device').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if(isRunning) return; // On empêche de changer d'appareil si ça tourne
                document.querySelectorAll('.btn-device').forEach(b => b.classList.remove('active'));
                const target = e.target.closest('.btn-device');
                target.classList.add('active');
                
                P = parseInt(target.dataset.power);
                let name = target.dataset.name;
                document.getElementById('status-msg').innerText = `Appareil branché : ${name} (${P} W). Prêt à démarrer.`;
            });
        });

        // Bouton Play/Pause
        document.getElementById('btn-play').addEventListener('click', toggleTimer);
        document.getElementById('btn-reset').addEventListener('click', resetLab);

        // Onglets
        window.switchTab = function(tabId) {
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            event.target.classList.add('active');
        };

        initChart();
        requestAnimationFrame(draw);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLab);
    } else {
        initLab();
    }

    // =======================================================
    // 2. MOTEUR PHYSIQUE (Chronomètre)
    // =======================================================
    let lastTime = 0;

    function toggleTimer() {
        isRunning = !isRunning;
        const btn = document.getElementById('btn-play');
        const msg = document.getElementById('status-msg');

        if (isRunning) {
            btn.innerHTML = "⏸ Mettre en pause";
            btn.style.background = "#f59e0b";
            btn.style.borderColor = "#d97706";
            msg.innerText = `L'appareil consomme ${P} Joules chaque seconde !`;
            document.querySelectorAll('.btn-device').forEach(b => b.style.opacity = "0.5"); 
        } else {
            btn.innerHTML = "▶ Reprendre le chronomètre";
            btn.style.background = "#10b981";
            btn.style.borderColor = "#059669";
            msg.innerText = "Chronomètre en pause.";
            document.querySelectorAll('.btn-device').forEach(b => b.style.opacity = "1");
        }
    }

    function resetLab() {
        isRunning = false;
        timeElapsed = 0;
        E = 0;
        dataPoints = [];
        discAngle = 0;
        
        const btn = document.getElementById('btn-play');
        btn.innerHTML = "▶ Lancer le chronomètre";
        btn.style.background = "#10b981";
        btn.style.borderColor = "#059669";
        
        document.getElementById('status-msg').innerText = "Simulation réinitialisée. Choisis un appareil.";
        document.querySelectorAll('.btn-device').forEach(b => b.style.opacity = "1");
        document.getElementById('chart-info').style.display = "none";
        
        updateTableAndChart();
    }

    function tickPhysics(timestamp) {
        if (!lastTime) lastTime = timestamp;
        let deltaTime = (timestamp - lastTime) / 1000; 
        lastTime = timestamp;

        if (isRunning) {
            timeElapsed += deltaTime;
            E = P * timeElapsed; // E = P * t

            // Point dans le graphe toutes les ~2 secondes
            if (Math.floor(timeElapsed) % 2 === 0 && !dataPoints.some(p => p.t === Math.floor(timeElapsed))) {
                dataPoints.push({ t: Math.floor(timeElapsed), e: Math.floor(E) });
                updateTableAndChart();
            }
        }
    }

    // =======================================================
    // 3. DESSIN CANVAS (Le Compteur et le Câble)
    // =======================================================
    function draw(timestamp) {
        tickPhysics(timestamp);

        ctx.clearRect(0, 0, 350, 250);

        drawCable();
        drawMeter();
        drawGauge();

        requestAnimationFrame(draw);
    }

    function drawCable() {
        ctx.fillStyle = "#cbd5e1";
        ctx.fillRect(0, 180, 350, 15);
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 180, 350, 15);

        let speed = isRunning ? (P / U) * 2 + 0.5 : 0; 

        ctx.fillStyle = "#38bdf8";
        electrons.forEach(e => {
            if (isRunning) e.x = (e.x + speed) % 350;
            e.wobble += 0.1;
            
            let y = 187 + Math.sin(e.wobble) * 2;
            
            ctx.beginPath();
            ctx.arc(e.x, y, 3, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.shadowBlur = 5;
            ctx.shadowColor = "#38bdf8";
            ctx.fill();
            ctx.shadowBlur = 0;
        });
    }

    function drawMeter() {
        // Boîtier du compteur
        ctx.fillStyle = "#f8fafc";
        drawRoundedRect(ctx, 80, 20, 190, 130, 10);
        ctx.fill();
        ctx.strokeStyle = "#cbd5e1"; 
        ctx.lineWidth = 3; 
        ctx.stroke();

        // Écran digital
        ctx.fillStyle = "#1e293b";
        drawRoundedRect(ctx, 100, 40, 150, 40, 5);
        ctx.fill();
        
        ctx.fillStyle = "#34d399";
        ctx.font = "bold 20px 'Courier New', monospace";
        ctx.textAlign = "right";
        ctx.fillText(Math.floor(E) + " J", 240, 68);

        // Info puissance
        ctx.fillStyle = "#64748b";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`Appareil : ${P} W`, 175, 100);

        // LE DISQUE TOURNANT
        let rpm = isRunning ? P / 80 : 0; 
        discAngle += rpm;

        ctx.save();
        ctx.translate(175, 125);
        
        // Fente du disque avec reflet métallique
        let grad = ctx.createLinearGradient(-40, 0, 40, 0);
        grad.addColorStop(0, "#94a3b8");
        grad.addColorStop(0.5, "#f8fafc");
        grad.addColorStop(1, "#94a3b8");
        
        ctx.fillStyle = grad;
        ctx.fillRect(-40, -10, 80, 20);
        ctx.strokeStyle = "#64748b";
        ctx.strokeRect(-40, -10, 80, 20);

        // Trait rouge 3D (le modulo 160 permet d'avoir 80px de face visible, et 80px "caché derrière")
        let offset = discAngle % 160; 
        if (offset < 80) {
            ctx.fillStyle = "#ef4444"; 
            ctx.fillRect(-40 + offset, -10, 8, 20);
        }
        
        ctx.restore();
    }

    function drawGauge() {
        ctx.fillStyle = "#e2e8f0";
        drawRoundedRect(ctx, 40, 20, 15, 130, 8);
        ctx.fill();

        let maxE = P * 60; // Objectif 60 sec
        let pct = Math.min(1, E / maxE);
        let fillHeight = pct * 130;

        if (fillHeight > 0) {
            ctx.fillStyle = pct < 0.5 ? "#10b981" : (pct < 0.8 ? "#f59e0b" : "#ef4444");
            drawRoundedRect(ctx, 40, 20 + (130 - fillHeight), 15, fillHeight, 8);
            ctx.fill();
        }
    }

    // =======================================================
    // 4. CHART.JS & TABLEAU DE DONNÉES
    // =======================================================
    function initChart() {
        const ctxChart = document.getElementById('energyChart').getContext('2d');
        energyChart = new Chart(ctxChart, {
            type: 'line',
            data: {
                datasets: [{ 
                    label: 'Énergie E = f(t)', 
                    data: [], 
                    borderColor: '#ea580c', 
                    backgroundColor: 'rgba(234, 88, 12, 0.2)', 
                    fill: true,
                    tension: 0, 
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: {
                    x: { type: 'linear', title: { display: true, text: 'Temps t (secondes)' }, min: 0 },
                    y: { title: { display: true, text: 'Énergie E (Joules)' }, min: 0 }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) { return `t = ${context.parsed.x} s, E = ${context.parsed.y} J`; }
                        }
                    }
                }
            }
        });
    }

    function updateTableAndChart() {
        energyChart.data.datasets[0].data = dataPoints.map(p => ({ x: p.t, y: p.e }));
        energyChart.update();

        const tbody = document.getElementById('table-body');
        tbody.innerHTML = '';
        
        for (let i = dataPoints.length - 1; i >= 0; i--) {
            let row = document.createElement('tr');
            row.innerHTML = `<td>${dataPoints[i].t}</td><td><strong>${dataPoints[i].e}</strong></td>`;
            tbody.appendChild(row);
        }

        if (dataPoints.length >= 3) {
            document.getElementById('chart-info').style.display = "block";
        } else {
            document.getElementById('chart-info').style.display = "none";
        }
    }
})();