// =======================================================
// MOTEUR CANVAS & PHYSIQUE : BILANS THERMIQUES
// =======================================================

(function() {
    let canvas, ctx, dpr;
    let thermoChart = null;

    // --- Variables Physiques ---
    const m = 5.0; // masse (kg)
    const c = 4180; // capacité thermique de l'eau (J/kg.K)
    const S = 1.0; // Surface de la paroi (m²)

    // NOUVEAU : Variables modifiables par l'utilisateur
    let T_INIT_1 = 80.0; 
    let T_INIT_2 = 20.0; 

    let T1 = T_INIT_1;
    let T2 = T_INIT_2;
    
    // Variables de la Paroi
    let lambda = 0.200; 
    let e_cm = 5; 
    let e_m = e_cm / 100; 
    let Rth = 0; 
    let Flux = 0; 

    let isRunning = false;
    let timeElapsed = 0;
    let dataPointsT1 = [];
    let dataPointsT2 = [];

    // --- Variables d'animation (Canvas) ---
    let particles1 = [];
    let particles2 = [];
    const numParticles = 80;
    const cw = 450; 
    const ch = 250; 

    // =======================================================
    // 1. INITIALISATION ROBUSTE
    // =======================================================
    function initLab() {
        canvas = document.getElementById('thermoCanvas');
        if (!canvas) return;

        ctx = canvas.getContext('2d');
        dpr = window.devicePixelRatio || 1;
        canvas.width = cw * dpr;
        canvas.height = ch * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = cw + "px";
        canvas.style.height = ch + "px";

        initParticles();

        // NOUVEAU : Événements Sliders Températures
        document.getElementById('slider-t1').addEventListener('input', (e) => {
            T_INIT_1 = parseInt(e.target.value);
            document.getElementById('val-init-t1').innerText = T_INIT_1 + " °C";
            resetLab(); // On redémarre l'expérience avec les nouvelles données
        });

        document.getElementById('slider-t2').addEventListener('input', (e) => {
            T_INIT_2 = parseInt(e.target.value);
            document.getElementById('val-init-t2').innerText = T_INIT_2 + " °C";
            resetLab();
        });

        // Événement Épaisseur
        const slider = document.getElementById('slider-thickness');
        const valThickness = document.getElementById('val-thickness');
        slider.addEventListener('input', (e) => {
            e_cm = parseInt(e.target.value);
            e_m = e_cm / 100;
            valThickness.innerText = e_cm + " cm";
            calculateFlux();
        });

        // Événement Matériaux
        document.querySelectorAll('.btn-material').forEach(btn => {
            btn.addEventListener('click', (event) => {
                document.querySelectorAll('.btn-material').forEach(b => b.classList.remove('active'));
                const target = event.target.closest('.btn-material');
                target.classList.add('active');
                
                lambda = parseFloat(target.dataset.lambda);
                let name = target.dataset.name;
                document.getElementById('status-msg').innerText = `Paroi modifiée : ${name} (Conductivité = ${lambda}).`;
                calculateFlux();
            });
        });

        document.getElementById('btn-play').addEventListener('click', toggleTimer);
        document.getElementById('btn-reset').addEventListener('click', resetLab);

        window.switchTab = function(tabId) {
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            event.target.classList.add('active');
        };

        initChart();
        calculateFlux();
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
    function calculateFlux() {
        Rth = e_m / (lambda * S);
        Flux = (T1 - T2) / Rth;
        
        document.getElementById('val-t1').innerText = T1.toFixed(1) + " °C";
        document.getElementById('val-t2').innerText = T2.toFixed(1) + " °C";
        document.getElementById('val-flux').innerText = Math.round(Flux) + " W";
    }

    let lastTime = 0;
    function tickPhysics(timestamp) {
        if (!lastTime) lastTime = timestamp;
        let deltaRealTime = (timestamp - lastTime) / 1000; 
        lastTime = timestamp;

        if (isRunning) {
            let simTimeStep = deltaRealTime * 600; 
            timeElapsed += simTimeStep;

            calculateFlux();

            let Q = Flux * simTimeStep;
            let deltaT = Q / (m * c);

            T1 -= deltaT; 
            T2 += deltaT; 

            if (T1 <= T2) {
                let T_eq = (T_INIT_1 + T_INIT_2) / 2;
                T1 = T_eq;
                T2 = T_eq;
                Flux = 0;
                isRunning = false;
                document.getElementById('btn-play').innerHTML = "✅ Équilibre thermique atteint";
                document.getElementById('btn-play').style.background = "#64748b";
                document.getElementById('btn-play').style.borderColor = "#475569";
            }

            if (Math.floor(timeElapsed / 60) % 2 === 0) {
                let currentMin = Math.floor(timeElapsed / 60);
                if (!dataPointsT1.some(p => p.x === currentMin)) {
                    dataPointsT1.push({ x: currentMin, y: parseFloat(T1.toFixed(1)) });
                    dataPointsT2.push({ x: currentMin, y: parseFloat(T2.toFixed(1)) });
                    updateChart();
                }
            }
        }
    }

    function toggleTimer() {
        if (T1 <= T2) return; 
        isRunning = !isRunning;
        const btn = document.getElementById('btn-play');

        if (isRunning) {
            btn.innerHTML = "⏸ Mettre en pause";
            btn.style.background = "#f59e0b";
            btn.style.borderColor = "#d97706";
        } else {
            btn.innerHTML = "▶ Reprendre la simulation";
            btn.style.background = "#10b981";
            btn.style.borderColor = "#059669";
        }
    }

    function resetLab() {
        isRunning = false;
        T1 = T_INIT_1;
        T2 = T_INIT_2;
        timeElapsed = 0;
        dataPointsT1 = [];
        dataPointsT2 = [];
        
        const btn = document.getElementById('btn-play');
        btn.innerHTML = "▶ Lancer la simulation du temps";
        btn.style.background = "#10b981";
        btn.style.borderColor = "#059669";
        
        document.getElementById('status-msg').innerText = "Système réinitialisé avec les nouvelles températures.";
        
        calculateFlux();
        updateChart();
        initParticles(); 
    }

    // =======================================================
    // 3. MOTEUR DE DESSIN CANVAS (Agitation thermique)
    // =======================================================
    function initParticles() {
        particles1 = [];
        particles2 = [];
        for(let i=0; i<numParticles; i++) {
            particles1.push({ x: Math.random()*200, y: Math.random()*250, angle: Math.random()*Math.PI*2 });
            particles2.push({ x: cw - Math.random()*200, y: Math.random()*250, angle: Math.random()*Math.PI*2 });
        }
    }

    function getTempColor(T) {
        // NOUVEAU : Interpolation robuste de 0°C à 100°C
        let pct = Math.max(0, Math.min(1, T / 100)); // pct entre 0 et 1
        
        // Bleu pur (0°C) vers Rouge pur (100°C)
        let r = Math.round(59 + pct * 180);
        let g = Math.round(130 - pct * 62);
        let b = Math.round(246 - pct * 178);
        return `rgb(${r}, ${g}, ${b})`;
    }

    function draw(timestamp) {
        tickPhysics(timestamp);

        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, cw, ch);

        let color1 = getTempColor(T1);
        let color2 = getTempColor(T2);
        
        ctx.fillStyle = color1.replace('rgb', 'rgba').replace(')', ', 0.2)');
        ctx.fillRect(0, 0, cw/2, ch);
        ctx.fillStyle = color2.replace('rgb', 'rgba').replace(')', ', 0.2)');
        ctx.fillRect(cw/2, 0, cw/2, ch);

        let wallWidth = e_cm * 2; 
        let wallX = cw/2 - wallWidth/2;
        
        if (lambda === 0.200) ctx.fillStyle = "rgba(255, 255, 255, 0.4)"; 
        else if (lambda === 0.150) ctx.fillStyle = "#92400e"; 
        else ctx.fillStyle = "#f8fafc"; 
        
        ctx.fillRect(wallX, 0, wallWidth, ch);
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 2;
        ctx.strokeRect(wallX, 0, wallWidth, ch);

        // Vitesse des particules adaptée de 0 à 100°C
        let speed1 = Math.max(0.1, T1 * 0.05); 
        let speed2 = Math.max(0.1, T2 * 0.05);

        function animateChamber(pts, speed, color, minX, maxX) {
            ctx.fillStyle = color;
            pts.forEach(p => {
                p.x += Math.cos(p.angle) * speed;
                p.y += Math.sin(p.angle) * speed;

                if (p.x < minX || p.x > maxX || p.y < 0 || p.y > ch) {
                    p.angle = Math.random() * Math.PI * 2;
                    p.x = Math.max(minX+5, Math.min(maxX-5, p.x));
                    p.y = Math.max(5, Math.min(ch-5, p.y));
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        animateChamber(particles1, speed1, color1, 0, wallX);
        animateChamber(particles2, speed2, color2, wallX + wallWidth, cw);

        requestAnimationFrame(draw);
    }

    // =======================================================
    // 4. CHART.JS 
    // =======================================================
    function initChart() {
        const ctxChart = document.getElementById('thermoChart').getContext('2d');
        thermoChart = new Chart(ctxChart, {
            type: 'line',
            data: {
                datasets: [
                    { 
                        label: 'T1 Chaude (°C)', 
                        data: dataPointsT1, 
                        borderColor: '#ef4444', 
                        backgroundColor: '#ef4444', 
                        tension: 0.2, 
                        pointRadius: 0,
                        borderWidth: 3
                    },
                    { 
                        label: 'T2 Froide (°C)', 
                        data: dataPointsT2, 
                        borderColor: '#3b82f6', 
                        backgroundColor: '#3b82f6', 
                        tension: 0.2, 
                        pointRadius: 0,
                        borderWidth: 3
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: {
                    x: { type: 'linear', title: { display: true, text: 'Temps (minutes)' }, min: 0 },
                    // L'échelle Y est fixée de 0 à 100°C pour absorber toutes les modifications de curseurs
                    y: { title: { display: true, text: 'Température (°C)' }, min: 0, max: 100 }
                },
                animation: false 
            }
        });
    }

    function updateChart() {
        thermoChart.data.datasets[0].data = dataPointsT1;
        thermoChart.data.datasets[1].data = dataPointsT2;
        thermoChart.update();
    }
})();