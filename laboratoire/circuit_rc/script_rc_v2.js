document.addEventListener('DOMContentLoaded', () => {
    // --- ÉLÉMENTS DOM ---
    const sliderE = document.getElementById('slider-e');
    const sliderR = document.getElementById('slider-r');
    const sliderC = document.getElementById('slider-c');

    const valE = document.getElementById('val-e');
    const valR = document.getElementById('val-r');
    const valC = document.getElementById('val-c');
    const valTau = document.getElementById('val-tau');

    const btnCharge = document.getElementById('btn-charge');
    const btnDischarge = document.getElementById('btn-discharge');
    const switchBlade = document.getElementById('switch-blade');

    const mathCharge = document.getElementById('math-charge');
    const mathDischarge = document.getElementById('math-discharge');

    const plateTop = document.getElementById('plate-top');
    const plateBottom = document.getElementById('plate-bottom');

    const timeDisplay = document.getElementById('time-display');
    const regimeTransitoire = document.querySelector('.regime-transitoire');

    const graphCanvas = document.getElementById('graphCanvas');
    const ctxGraph = graphCanvas.getContext('2d');
    
    const electronsCanvas = document.getElementById('electronsCanvas');
    const ctxElec = electronsCanvas.getContext('2d');
    const circuitSvg = document.getElementById('circuit-svg');

    // --- VARIABLES PHYSIQUES ---
    let E = 10;
    let R = 50000;
    let C = 0.000220;
    let tau = R * C;

    let mode = 'charge';
    let time = 0;
    let uc = 0;
    let ucInitial = 0;

    let W = 0, H = 0, DPR = 1;
    let MAX_TIME = 8; 

    // --- PARTICULES (ÉLECTRONS) ---
    const electrons = [];
    
    // Définition des chemins selon le viewBox SVG (600x300)
    const PATH_CHARGE = [
        {x: 50, y: 180}, {x: 50, y: 260}, {x: 450, y: 260}, {x: 450, y: 170}, // Pôle - vers plaque bas
        {x: 450, y: 130}, {x: 450, y: 40}, {x: 150, y: 40}, {x: 50, y: 40}, {x: 50, y: 120} // Plaque haut vers pôle +
    ];
    
    const PATH_DISCHARGE = [
        {x: 450, y: 170}, {x: 450, y: 260}, {x: 200, y: 260}, {x: 200, y: 40}, // Plaque bas vers interrupteur
        {x: 150, y: 40}, {x: 450, y: 40}, {x: 450, y: 130} // Interrupteur vers Plaque haut
    ];

    function calculateTotalLength(path) {
        let length = 0;
        for(let i=0; i<path.length-1; i++){
            // Sauter l'espace isolant du condensateur dans le calcul de progression
            if((path[i].x===450 && path[i].y===170 && path[i+1].x===450 && path[i+1].y===130) ||
               (path[i].x===50 && path[i].y===120 && path[i+1].x===50 && path[i+1].y===180)){
                continue; 
            }
            length += Math.hypot(path[i+1].x - path[i].x, path[i+1].y - path[i].y);
        }
        return length;
    }

    let lenCharge = calculateTotalLength(PATH_CHARGE);
    let lenDischarge = calculateTotalLength(PATH_DISCHARGE);

    function getPointOnPath(path, progress) {
        let totalLen = path === PATH_CHARGE ? lenCharge : lenDischarge;
        let targetDist = progress * totalLen;
        let currentDist = 0;

        for(let i=0; i<path.length-1; i++) {
            // Sauts (Générateur ou Isolant)
            if((path[i].x===450 && path[i].y===170 && path[i+1].x===450 && path[i+1].y===130) ||
               (path[i].x===50 && path[i].y===120 && path[i+1].x===50 && path[i+1].y===180)){
                continue; 
            }

            let segLen = Math.hypot(path[i+1].x - path[i].x, path[i+1].y - path[i].y);
            if(currentDist + segLen >= targetDist) {
                let ratio = (targetDist - currentDist) / segLen;
                return {
                    x: path[i].x + (path[i+1].x - path[i].x) * ratio,
                    y: path[i].y + (path[i+1].y - path[i].y) * ratio
                };
            }
            currentDist += segLen;
        }
        return path[path.length-1];
    }

    function spawnElectron() {
        electrons.push({
            progress: 0,
            speed: 0.005 + Math.random() * 0.002, // Vitesse de base modifiée par l'intensité
        });
    }

    function resize() {
        // Redimensionnement Graphique
        const rectGraph = graphCanvas.parentElement.getBoundingClientRect();
        DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
        W = rectGraph.width;
        let headerHeight = 76; 
        H = rectGraph.height - headerHeight; 
        if(H < 100) H = 250;
        graphCanvas.width = W * DPR;
        graphCanvas.height = H * DPR;
        ctxGraph.scale(DPR, DPR);

        // Redimensionnement Électrons Canvas pour calquer parfaitement sur le SVG
        const rectSvg = circuitSvg.getBoundingClientRect();
        electronsCanvas.width = rectSvg.width * DPR;
        electronsCanvas.height = rectSvg.height * DPR;
        ctxElec.scale(DPR, DPR);
        
        updateRegimeBackground();
    }
    window.addEventListener("resize", resize);

    // --- LOGIQUE INTERFACE ---
    function updateValues() {
        E = parseFloat(sliderE.value);
        R = parseFloat(sliderR.value) * 1000; 
        C = parseFloat(sliderC.value) * 0.000001; 
        
        tau = R * C;
        
        valE.innerText = E;
        valR.innerText = sliderR.value;
        valC.innerText = sliderC.value;
        valTau.innerText = tau.toFixed(1) + " s";

        MAX_TIME = 8 * tau;
        updateRegimeBackground();
    }

    function updateRegimeBackground() {
        if(W === 0) return;
        let percentTransitoire = ((5 * tau) / MAX_TIME) * 100;
        if(regimeTransitoire) {
            regimeTransitoire.style.width = Math.min(percentTransitoire, 100) + "%";
        }
    }

    function setMode(newMode) {
        if(mode === newMode) return;
        mode = newMode;
        
        ucInitial = uc;
        time = 0; 
        electrons.length = 0; // Nettoyer les électrons en transit
        
        if (mode === 'charge') {
            btnCharge.classList.add('btn-primary'); btnCharge.classList.remove('btn-secondary');
            btnDischarge.classList.add('btn-secondary'); btnDischarge.classList.remove('btn-primary');
            switchBlade.style.transform = "rotate(0deg)";
            mathCharge.style.display = "block"; mathDischarge.style.display = "none";
        } else {
            btnDischarge.classList.add('btn-primary'); btnDischarge.classList.remove('btn-secondary');
            btnCharge.classList.add('btn-secondary'); btnCharge.classList.remove('btn-primary');
            switchBlade.style.transform = "rotate(180deg)";
            mathCharge.style.display = "none"; mathDischarge.style.display = "block";
        }
    }

    sliderE.addEventListener("input", updateValues);
    sliderR.addEventListener("input", updateValues);
    sliderC.addEventListener("input", updateValues);
    
    btnCharge.addEventListener("click", () => setMode('charge'));
    btnDischarge.addEventListener("click", () => setMode('discharge'));

    function tensionAt(t) {
        if(mode === 'charge') return ucInitial + (E - ucInitial) * (1 - Math.exp(-t/tau));
        else return ucInitial * Math.exp(-t/tau);
    }

    // --- VISUALISATION LOUPE (CHARGES) ---
    function updateCapacitorCharges() {
        let ratio = uc / 15; // Max 15V du slider
        let nbCharges = Math.round(ratio * 18); 
        
        plateTop.innerHTML = "";
        plateBottom.innerHTML = "";
        
        for(let i=0; i<nbCharges; i++) {
            plateTop.innerHTML += `<span class="charge-plus">+</span>`;
            plateBottom.innerHTML += `<span class="charge-minus">-</span>`;
        }
    }

    // --- DESSIN DES ÉLECTRONS ---
    function drawElectrons(current_i_ratio) {
        const rectSvg = circuitSvg.getBoundingClientRect();
        // Échelle entre le viewBox SVG (600x300) et la taille réelle à l'écran
        const scaleX = rectSvg.width / 600; 
        const scaleY = rectSvg.height / 300;
        
        ctxElec.clearRect(0, 0, rectSvg.width, rectSvg.height);
        
        // Spawn d'électrons basé sur l'intensité du courant
        if (Math.random() < current_i_ratio * 0.4 && electrons.length < 50) {
            spawnElectron();
        }

        const currentPath = mode === 'charge' ? PATH_CHARGE : PATH_DISCHARGE;

        for (let i = electrons.length - 1; i >= 0; i--) {
            let e = electrons[i];
            // La vitesse de l'électron dépend de l'intensité globale du circuit
            e.progress += e.speed * (0.2 + current_i_ratio * 2.0); 
            
            if (e.progress >= 1) {
                electrons.splice(i, 1);
                continue;
            }

            let pt = getPointOnPath(currentPath, e.progress);
            
            ctxElec.beginPath();
            ctxElec.arc(pt.x * scaleX, pt.y * scaleY, 5, 0, 2 * Math.PI);
            ctxElec.fillStyle = "#3b82f6";
            ctxElec.fill();
            // Le petit moins de l'électron
            ctxElec.fillStyle = "#fff";
            ctxElec.font = "bold 10px sans-serif";
            ctxElec.textAlign = "center";
            ctxElec.textBaseline = "middle";
            ctxElec.fillText("-", pt.x * scaleX, pt.y * scaleY - 1);
        }
    }

    // --- DESSIN GRAPHIQUE ---
    function drawGraph() {
        ctxGraph.clearRect(0, 0, W, H);
        
        const paddingLeft = 40;
        const paddingBottom = 30;
        const graphW = W - paddingLeft - 20;
        const graphH = H - paddingBottom - 20;
        
        ctxGraph.strokeStyle = "rgba(148, 163, 184, 0.2)";
        ctxGraph.lineWidth = 1;
        ctxGraph.beginPath();
        for(let v=0; v<=15; v+=3) {
            let y = H - paddingBottom - (v/15) * graphH;
            ctxGraph.moveTo(paddingLeft, y);
            ctxGraph.lineTo(W - 20, y);
            
            ctxGraph.fillStyle = "rgba(148, 163, 184, 0.6)";
            ctxGraph.font = "10px sans-serif";
            ctxGraph.fillText(v, paddingLeft - 20, y + 4);
        }
        ctxGraph.stroke();

        ctxGraph.strokeStyle = "var(--text-main)";
        ctxGraph.lineWidth = 2;
        ctxGraph.beginPath();
        ctxGraph.moveTo(paddingLeft, 10);
        ctxGraph.lineTo(paddingLeft, H - paddingBottom); 
        ctxGraph.lineTo(W - 10, H - paddingBottom); 
        ctxGraph.stroke();

        ctxGraph.fillStyle = "var(--text-muted)";
        ctxGraph.font = "12px sans-serif";
        ctxGraph.fillText("uC (V)", 5, 15);
        ctxGraph.fillText("t (s)", W - 35, H - 5);

        let xTau = paddingLeft + (tau / MAX_TIME) * graphW;
        let x5Tau = paddingLeft + ((5*tau) / MAX_TIME) * graphW;
        ctxGraph.fillText("τ", xTau - 4, H - 12);
        ctxGraph.fillText("5τ", x5Tau - 8, H - 12);

        // Tracé Courbe
        ctxGraph.beginPath();
        ctxGraph.lineWidth = 3;
        ctxGraph.strokeStyle = mode === 'charge' ? "#ec4899" : "#8b5cf6";
        
        for(let tx = 0; tx <= time; tx += (MAX_TIME/200)) {
            let current_uc = tensionAt(tx);
            let plotX = paddingLeft + (tx / MAX_TIME) * graphW;
            let plotY = H - paddingBottom - (current_uc / 15) * graphH;
            if(tx === 0) ctxGraph.moveTo(plotX, plotY);
            else ctxGraph.lineTo(plotX, plotY);
        }
        ctxGraph.stroke();

        let currentX = paddingLeft + (time / MAX_TIME) * graphW;
        let currentY = H - paddingBottom - (uc / 15) * graphH;
        
        if (time <= MAX_TIME) {
            ctxGraph.beginPath();
            ctxGraph.setLineDash([4, 4]);
            ctxGraph.moveTo(currentX, H - paddingBottom);
            ctxGraph.lineTo(currentX, currentY);
            ctxGraph.moveTo(paddingLeft, currentY);
            ctxGraph.lineTo(currentX, currentY);
            ctxGraph.strokeStyle = "var(--text-muted)";
            ctxGraph.lineWidth = 1;
            ctxGraph.stroke();
            ctxGraph.setLineDash([]); 
            
            ctxGraph.fillStyle = mode === 'charge' ? "#ec4899" : "#8b5cf6";
            ctxGraph.font = "bold 12px sans-serif";
            ctxGraph.fillText(uc.toFixed(1) + "V", paddingLeft + 5, currentY - 5);

            ctxGraph.beginPath();
            ctxGraph.arc(currentX, currentY, 5, 0, 2 * Math.PI);
            ctxGraph.fill();
        }
    }

    let lastTime = performance.now();

    function animate(now) {
        let dt = (now - lastTime) / 1000; 
        lastTime = now;

        let simSpeed = (MAX_TIME / 8); 
        time += dt * simSpeed;
        if(time > MAX_TIME) time = MAX_TIME;

        uc = tensionAt(time);

        // Calcul Intensité normalisée pour l'animation des électrons (Max i = E/R)
        // La dérivée de la charge donne i proportionnel à exp(-t/tau)
        let current_i_ratio = Math.exp(-time/tau);
        
        timeDisplay.innerText = time.toFixed(2);
        
        updateCapacitorCharges();
        drawElectrons(current_i_ratio);
        drawGraph();

        requestAnimationFrame(animate);
    }

    setTimeout(() => {
        resize();
        updateValues();
        lastTime = performance.now();
        animate(performance.now());
    }, 200);
});