document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById("c");
    const scene = document.getElementById("scene");
    const ctx = canvas.getContext("2d");

    // UI Elements
    const speedSlider = document.getElementById("speed");
    const scaleSlider = document.getElementById("scale");
    const speedVal = document.getElementById("speedVal");
    const scaleVal = document.getElementById("scaleVal");
    const timeDisplay = document.getElementById("timeDisplay");
    
    const btnOrbits = document.getElementById("toggleOrbits");
    const btnPause = document.getElementById("pause");
    const btnRecentre = document.getElementById("recentre");
    const infoPanel = document.getElementById("infoPanel");

    // State
    let W=0, H=0, DPR=1;
    let t = 0;                     
    let paused = false;
    let showOrbits = true;
    let viewMode = 'easy'; // 'easy', '3d'
    
    // Caméra (Pan & Rotate)
    let camX = 0, camY = 0;
    let camPitch = 0, camYaw = 0; 
    let isDragging = false;
    let dragButton = 0; // 0 = Gauche (Rotation), 2 = Droit (Pan X/Y)
    let lastMouseX = 0, lastMouseY = 0;

    // Constantes d'échelle pour l'affichage visuel
    const TAU = Math.PI * 2;
    const AU_EASY = 75; // Espacement de base augmenté

    // Base de données (tailles augmentées pour être plus massives et impressionnantes)
    const celestialBodies = [
        { 
            id: "soleil", name: "Le Soleil", icon: "🌞", type: "Étoile naine jaune",
            colorA: "rgba(255,240,170,1)", colorB: "rgba(255,160,60,1)", 
            a: 0, e: 0, size: 28, period: 1, 
            mass: "1,989 × 10³⁰ kg", dia: "1 392 700 km", temp: "5 500 °C (Surface)", rev: "—"
        },
        { 
            id: "mercure", name: "Mercure", icon: "🪨", type: "Planète rocheuse",
            colorA: "#d1d5db", colorB: "#4b5563", 
            a: 0.8, e: 0.205, size: 3.5, period: 0.24, 
            mass: "3,30 × 10²³ kg", dia: "4 879 km", temp: "-173°C à 427°C", rev: "88 jours"
        },
        { 
            id: "venus", name: "Vénus", icon: "🌫️", type: "Planète rocheuse",
            colorA: "#fde047", colorB: "#b45309", 
            a: 1.4, e: 0.006, size: 6.5, period: 0.615,
            mass: "4,86 × 10²⁴ kg", dia: "12 104 km", temp: "Moy. 462 °C", rev: "225 jours"
        },
        { 
            id: "terre", name: "La Terre", icon: "🌍", type: "Planète rocheuse",
            colorA: "#bae6fd", colorB: "#1e40af", 
            a: 2.1, e: 0.016, size: 7, period: 1.0,
            mass: "5,97 × 10²⁴ kg", dia: "12 742 km", temp: "Min -89°C | Max 58°C", rev: "365,25 jours",
            moons: [ { a: 0.3, period: 0.07, size: 2, colorA: "#f8fafc", colorB: "#64748b" } ]
        },
        { 
            id: "mars", name: "Mars", icon: "🔴", type: "Planète rocheuse",
            colorA: "#fca5a5", colorB: "#991b1b", 
            a: 2.8, e: 0.093, size: 4.5, period: 1.88,
            mass: "6,41 × 10²³ kg", dia: "6 779 km", temp: "Min -153°C | Max 20°C", rev: "687 jours"
        },
        { 
            id: "jupiter", name: "Jupiter", icon: "🌪️", type: "Géante gazeuse",
            colorA: "#fed7aa", colorB: "#9a3412", 
            a: 4.6, e: 0.048, size: 18, period: 11.86,
            mass: "1,89 × 10²⁷ kg", dia: "139 820 km", temp: "Moy. -110 °C", rev: "11,8 ans",
            moons: [ 
                { a: 0.45, period: 0.1, size: 1.5, colorA: "#fde047", colorB: "#ca8a04" },
                { a: 0.70, period: 0.2, size: 2.0, colorA: "#d6d3d1", colorB: "#57534e" }
            ]
        },
        { 
            id: "saturne", name: "Saturne", icon: "🪐", type: "Géante gazeuse",
            colorA: "#fef08a", colorB: "#ca8a04", 
            a: 6.8, e: 0.056, size: 15, period: 29.4, hasRings: true,
            mass: "5,68 × 10²⁶ kg", dia: "116 460 km", temp: "Moy. -140 °C", rev: "29,4 ans",
            moons: [ { a: 0.6, period: 0.5, size: 2, colorA: "#fef3c7", colorB: "#b45309" } ]
        },
        { 
            id: "uranus", name: "Uranus", icon: "🧊", type: "Géante de glaces",
            colorA: "#7dd3fc", colorB: "#0369a1", 
            a: 8.8, e: 0.046, size: 10, period: 84,
            mass: "8,68 × 10²⁵ kg", dia: "50 724 km", temp: "Moy. -195 °C", rev: "84 ans",
        },
        { 
            id: "neptune", name: "Neptune", icon: "🌊", type: "Géante de glaces",
            colorA: "#3b82f6", colorB: "#1e3a8a", 
            a: 10.5, e: 0.009, size: 9, period: 164.8,
            mass: "1,02 × 10²⁶ kg", dia: "49 244 km", temp: "Moy. -200 °C", rev: "165 ans",
        }
    ];

    let currentPositions = [];

    // --- GESTION DES MODES DE VUE ---
    window.setMode = function(mode) {
        viewMode = mode;
        document.querySelectorAll('.btn-mode').forEach(btn => btn.classList.remove('active'));
        
        if (mode === 'easy') {
            document.getElementById('btnModeEasy').classList.add('active');
            camPitch = 0; camYaw = 0; camX = 0; camY = 0;
            scaleSlider.value = 120;
        } else if (mode === '3d') {
            document.getElementById('btnMode3D').classList.add('active');
            camPitch = Math.PI / 3.5; 
            camYaw = 0; camX = 0; camY = 0;
            scaleSlider.value = 150; // On zoome un peu plus par défaut en 3D
        }
        syncUI();
    };

    function resize(){
        const r = scene.getBoundingClientRect();
        DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
        W = Math.floor(r.width * DPR);
        H = Math.floor(r.height * DPR);
        canvas.width = W;
        canvas.height = H;
    }
    window.addEventListener("resize", resize);
    resize();

    // --- MOTEUR DE PROJECTION 3D ---
    function project3D(x, y, z = 0) {
        let x1 = x * Math.cos(camYaw) - y * Math.sin(camYaw);
        let y1 = x * Math.sin(camYaw) + y * Math.cos(camYaw);
        let px = x1;
        let py = y1 * Math.cos(camPitch) - z * Math.sin(camPitch);
        let pz = y1 * Math.sin(camPitch) + z * Math.cos(camPitch);
        return { x: px, y: py, z: pz };
    }

    // --- DESSIN GRAPHIQUE ---
    function drawOrbit3D(cx, cy, a, e, zoom) {
        ctx.beginPath();
        const b = a * Math.sqrt(1 - e*e);
        const centerOffset = -a * e;

        for (let i = 0; i <= 60; i++) {
            let ang = (i / 60) * TAU;
            let rawX = (centerOffset + a * Math.cos(ang)) * zoom;
            let rawY = (b * Math.sin(ang)) * zoom;
            
            let proj = project3D(rawX, rawY);
            if (i === 0) ctx.moveTo(cx + proj.x + camX, cy + proj.y + camY);
            else ctx.lineTo(cx + proj.x + camX, cy + proj.y + camY);
        }
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1.5 * DPR;
        ctx.setLineDash([4*DPR, 6*DPR]);
        ctx.stroke();
    }

    function drawPlanet3D(x, y, r, colorA, colorB, isSun = false, cx, cy) {
        let fx = x, fy = y;
        
        if (!isSun) {
            let dx = cx - x;
            let dy = cy - y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            if (dist > 0) {
                fx = x + (dx/dist) * r * 0.6; 
                fy = y + (dy/dist) * r * 0.6;
            }
        }

        const g = ctx.createRadialGradient(fx, fy, r*0.05, x, y, r);
        g.addColorStop(0, colorA); 
        g.addColorStop(0.5, colorB); 
        
        if (!isSun) {
            g.addColorStop(0.9, "#02040a");
        }
        g.addColorStop(1, isSun ? colorB : "#000000");

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(r, 0.5), 0, TAU);
        ctx.fill();
        
        if (isSun) {
            const glow = ctx.createRadialGradient(x,y,r, x,y,r*4);
            glow.addColorStop(0, "rgba(255, 200, 50, 0.4)");
            glow.addColorStop(1, "rgba(255, 100, 0, 0)");
            ctx.fillStyle = glow;
            ctx.beginPath(); ctx.arc(x,y,r*4,0,TAU); ctx.fill();
        }
    }

    function drawRings3D(x, y, r) {
        ctx.save();
        ctx.translate(x, y);
        const tiltMultiplier = Math.abs(Math.cos(camPitch));
        
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 2.2, Math.max(r * 2.2 * tiltMultiplier, r * 0.2), -camYaw - Math.PI/6, 0, TAU);
        ctx.strokeStyle = "rgba(210, 190, 160, 0.6)";
        ctx.lineWidth = Math.max(r * 0.3, 1);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 1.8, Math.max(r * 1.8 * tiltMultiplier, r * 0.1), -camYaw - Math.PI/6, 0, TAU);
        ctx.strokeStyle = "rgba(10, 15, 30, 0.8)"; 
        ctx.lineWidth = Math.max(r * 0.1, 1);
        ctx.stroke();
        ctx.restore();
    }

    // --- INTERACTIONS SOURIS ---
    scene.addEventListener('mousedown', e => { 
        isDragging = true; 
        dragButton = e.button; // 0 = Gauche, 2 = Droit
        lastMouseX = e.clientX; 
        lastMouseY = e.clientY; 
        scene.style.cursor = 'grabbing';
    });
    
    window.addEventListener('mouseup', () => { 
        isDragging = false; 
        scene.style.cursor = 'grab';
    });
    
    window.addEventListener('mousemove', e => {
        if(isDragging) { 
            let dx = (e.clientX - lastMouseX);
            let dy = (e.clientY - lastMouseY);
            
            if (viewMode === '3d') {
                if (dragButton === 0) { // Clic Gauche -> Rotation
                    camYaw -= dx * 0.005;
                    camPitch -= dy * 0.005;
                    camPitch = Math.max(0, Math.min(Math.PI / 2.1, camPitch));
                } else if (dragButton === 2 || dragButton === 1) { // Clic Droit ou Milieu -> PanX/Y
                    camX += dx * DPR; 
                    camY += dy * DPR; 
                }
            } else {
                // En 2D, tout clic déplace la caméra
                camX += dx * DPR; 
                camY += dy * DPR; 
            }
            lastMouseX = e.clientX; lastMouseY = e.clientY; 
        }
    });

    // Zoom dynamique à la molette (Plus fluide)
    scene.addEventListener('wheel', e => {
        e.preventDefault();
        let currentZoom = parseInt(scaleSlider.value);
        // Le pas de zoom s'accélère si on est déjà très zoomé (pour aller plus vite)
        let step = currentZoom < 200 ? 15 : (currentZoom < 1000 ? 50 : 150);
        let zoomDelta = e.deltaY > 0 ? -step : step;
        
        let newScale = Math.max(10, Math.min(3000, currentZoom + zoomDelta));
        scaleSlider.value = newScale;
        syncUI();
    });

    scene.addEventListener('click', e => {
        if (isDragging && Math.abs(e.clientX - lastMouseX) > 2) return;
        const rect = scene.getBoundingClientRect();
        const clickX = (e.clientX - rect.left) * DPR;
        const clickY = (e.clientY - rect.top) * DPR;

        let clickedBody = null;
        for (let i = currentPositions.length - 1; i >= 0; i--) {
            const p = currentPositions[i];
            const dist = Math.sqrt(Math.pow(clickX - p.x, 2) + Math.pow(clickY - p.y, 2));
            if (dist < Math.max(p.r, 20 * DPR)) { // Hitbox généreuse pour le doigt/souris
                clickedBody = celestialBodies.find(b => b.id === p.id);
                break;
            }
        }

        if (clickedBody) {
            document.getElementById("infoIcon").innerText = clickedBody.icon;
            document.getElementById("infoName").innerText = clickedBody.name;
            document.getElementById("infoType").innerText = clickedBody.type;
            document.getElementById("infoDia").innerText = clickedBody.dia;
            document.getElementById("infoMass").innerText = clickedBody.mass;
            document.getElementById("infoTemp").innerText = clickedBody.temp;
            document.getElementById("infoRev").innerText = clickedBody.rev;
            infoPanel.classList.remove('hidden');
        } else {
            infoPanel.classList.add('hidden');
        }
    });

    window.closeInfoPanel = function() { infoPanel.classList.add('hidden'); }

    function syncUI(){
        speedVal.textContent = `Vitesse : ${speedSlider.value}%`;
        scaleVal.textContent = `Échelle : ${scaleSlider.value}%`;

        btnOrbits.textContent = showOrbits ? "🧭 Orbites : ON" : "🧭 Orbites : OFF";
        btnPause.textContent = paused ? "▶️ Reprendre" : "⏸️ Pause";
        
        if(paused) {
            btnPause.classList.remove('btn-primary');
            btnPause.classList.add('btn-secondary');
        } else {
            btnPause.classList.remove('btn-secondary');
            btnPause.classList.add('btn-primary');
        }
    }

    btnOrbits.addEventListener("click", ()=>{ showOrbits=!showOrbits; syncUI(); });
    btnPause.addEventListener("click", ()=>{ paused=!paused; syncUI(); });
    btnRecentre.addEventListener("click", ()=>{
        camX = 0; camY = 0; 
        if(viewMode === '3d') { camPitch = Math.PI / 3.5; camYaw = 0; }
        scaleSlider.value = 120;
        syncUI();
    });

    [speedSlider, scaleSlider].forEach(el => el.addEventListener("input", syncUI));
    setMode('easy'); 

    // --- BOUCLE D'ANIMATION ---
    let last = performance.now();
    
    function frame(now){
        const dt = Math.min(0.05, (now - last)/1000);
        last = now;

        const speedFactor = Number(speedSlider.value) / 100;
        // Le multiplicateur global a été revu pour exploiter le nouveau grand curseur
        const zoom = (Number(scaleSlider.value) / 100) * DPR;

        if(!paused){
            t += dt * speedFactor * 2; 
        }

        const earthPeriod = 10; 
        const totalDays = (t / earthPeriod) * 365.25;
        const years = Math.floor(totalDays / 365.25);
        const days = Math.floor(totalDays % 365.25);
        timeDisplay.innerText = `${years} An${years>1?'s':''}, ${days} Jour${days>1?'s':''}`;

        ctx.clearRect(0,0,W,H);
        const cx = W/2, cy = H/2;
        currentPositions = []; 

        if(showOrbits) {
            celestialBodies.forEach(p => {
                if (p.id !== "soleil") {
                    drawOrbit3D(cx, cy, p.a * AU_EASY, p.e, zoom);
                }
            });
        }

        let renderList = [];

        celestialBodies.forEach(p => {
            let rawX = 0, rawY = 0;
            // Le multiplicateur de taille "1.0" applique directement la taille en px dictée par l'array
            let rPx = p.size * zoom;

            if (p.id !== "soleil") {
                const a = p.a * AU_EASY * zoom;
                const b = a * Math.sqrt(1 - p.e * p.e);
                const theta = (t / (p.period * earthPeriod)) * TAU;
                rawX = a * Math.cos(theta) - (a * p.e);
                rawY = b * Math.sin(theta);
            }

            const proj = project3D(rawX, rawY);
            const finalX = cx + proj.x + camX;
            const finalY = cy + proj.y + camY;

            renderList.push({
                ...p,
                finalX: finalX, finalY: finalY, z: proj.z,
                drawRadius: rPx, isSun: (p.id === "soleil")
            });

            if (p.moons) {
                p.moons.forEach((m, index) => {
                    const mTheta = (t / (m.period * earthPeriod)) * TAU + (index * Math.PI);
                    const mOrbitR = m.a * AU_EASY * zoom;
                    const mRawX = rawX + Math.cos(mTheta) * mOrbitR;
                    const mRawY = rawY + Math.sin(mTheta) * mOrbitR;
                    
                    const mProj = project3D(mRawX, mRawY);
                    
                    if (showOrbits) {
                        ctx.beginPath(); ctx.arc(finalX, finalY, mOrbitR, 0, TAU);
                        ctx.strokeStyle = "rgba(255,255,255,0.05)"; ctx.stroke();
                    }

                    renderList.push({
                        id: p.id + "_moon", colorA: m.colorA, colorB: m.colorB,
                        finalX: cx + mProj.x + camX, finalY: cy + mProj.y + camY, z: mProj.z,
                        drawRadius: m.size * zoom, isSun: false
                    });
                });
            }
        });

        renderList.sort((A, B) => A.z - B.z);

        const sunPos = project3D(0,0);
        const centerSunX = cx + sunPos.x + camX;
        const centerSunY = cy + sunPos.y + camY;

        renderList.forEach(item => {
            if(item.hasRings) drawRings3D(item.finalX, item.finalY, item.drawRadius);
            
            drawPlanet3D(item.finalX, item.finalY, item.drawRadius, item.colorA, item.colorB, item.isSun, centerSunX, centerSunY);
            
            if (item.id && !item.id.includes("_moon")) {
                currentPositions.push({ id: item.id, x: item.finalX, y: item.finalY, r: item.drawRadius });
            }
        });

        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
});