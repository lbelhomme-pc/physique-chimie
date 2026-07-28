document.addEventListener('DOMContentLoaded', () => {
    // --- ÉLÉMENTS DOM ---
    const sliderE = document.getElementById("slider-e");
    const sliderR = document.getElementById("slider-r");
    const sliderC = document.getElementById("slider-c");
    
    const valE = document.getElementById("val-e");
    const valR = document.getElementById("val-r");
    const valC = document.getElementById("val-c");
    const valTau = document.getElementById("val-tau");
    
    const btnCharge = document.getElementById("btn-charge");
    const btnDischarge = document.getElementById("btn-discharge");
    const switchBlade = document.getElementById("switch-blade");
    
    const mathCharge = document.getElementById("math-charge");
    const mathDischarge = document.getElementById("math-discharge");
    
    const plateTop = document.getElementById("plate-top");
    const plateBottom = document.getElementById("plate-bottom");
    
    const timeDisplay = document.getElementById("time-display");
    const regimeTransitoire = document.querySelector(".regime-transitoire");
    
    const canvas = document.getElementById("graphCanvas");
    const ctx = canvas.getContext("2d");

    // --- VARIABLES PHYSIQUES ---
    let E = 5;       // Volts
    let R = 10000;   // Ohms (10 kΩ)
    let C = 0.0001;  // Farads (100 μF)
    let tau = R * C; // Secondes
    
    let mode = 'charge'; // 'charge' ou 'discharge'
    let time = 0;        // Temps écoulé depuis la commutation
    let uc = 0;          // Tension actuelle
    let ucInitial = 0;   // Mémoire de la tension au moment du clic
    
    // --- VARIABLES GRAPHIQUES ---
    let W = 0, H = 0, DPR = 1;
    let MAX_TIME = 8; // On affiche toujours jusqu'à 8 secondes sur l'axe X pour comparer

    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
        W = rect.width;
        // On soustrait le header du graphe (env 55px)
        H = 300; 
        canvas.width = W * DPR;
        canvas.height = H * DPR;
        ctx.scale(DPR, DPR);
        updateRegimeBackground();
    }
    window.addEventListener("resize", resize);
    
    // --- LOGIQUE DE L'INTERFACE ---
    function updateValues() {
        E = parseFloat(sliderE.value);
        R = parseFloat(sliderR.value) * 1000; // kΩ -> Ω
        C = parseFloat(sliderC.value) * 0.000001; // μF -> F
        
        tau = R * C;
        
        valE.innerText = E;
        valR.innerText = sliderR.value;
        valC.innerText = sliderC.value;
        valTau.innerText = tau.toFixed(2) + " s";

        // Mettre à l'échelle l'axe X dynamiquement (On affiche toujours jusqu'à 8 * tau pour voir la fin)
        MAX_TIME = 8 * tau;
        updateRegimeBackground();
    }

    function updateRegimeBackground() {
        if(W === 0) return;
        // Le régime transitoire s'arrête à t = 5 * tau
        let percentTransitoire = ((5 * tau) / MAX_TIME) * 100;
        regimeTransitoire.style.width = Math.min(percentTransitoire, 100) + "%";
    }

    function setMode(newMode) {
        if(mode === newMode) return;
        mode = newMode;
        
        // Mémorise la tension actuelle comme point de départ
        ucInitial = uc;
        time = 0; // Reset le chrono
        
        if (mode === 'charge') {
            btnCharge.classList.add('btn-primary');
            btnCharge.classList.remove('btn-secondary');
            btnDischarge.classList.add('btn-secondary');
            btnDischarge.classList.remove('btn-primary');
            
            // Animation du commutateur SVG
            switchBlade.style.transform = "rotate(0deg)";
            
            // Équations MathJax
            mathCharge.style.display = "block";
            mathDischarge.style.display = "none";
            
        } else {
            btnDischarge.classList.add('btn-primary');
            btnDischarge.classList.remove('btn-secondary');
            btnCharge.classList.add('btn-secondary');
            btnCharge.classList.remove('btn-primary');
            
            // Animation du commutateur SVG (Basculer vers position 2)
            switchBlade.style.transform = "rotate(180deg)";
            
            // Équations MathJax
            mathCharge.style.display = "none";
            mathDischarge.style.display = "block";
        }
    }

    sliderE.addEventListener("input", updateValues);
    sliderR.addEventListener("input", updateValues);
    sliderC.addEventListener("input", updateValues);
    
    btnCharge.addEventListener("click", () => setMode('charge'));
    btnDischarge.addEventListener("click", () => setMode('discharge'));

    // --- VISUALISATION DU CONDENSATEUR (LES + ET LES -) ---
    function updateCapacitorCharges() {
        // Le nombre de charges dépend du ratio uc / Emax (12V) pour ne pas saturer la boîte
        let ratio = uc / 12; 
        let nbCharges = Math.round(ratio * 15); // Max 15 petits '+' et '-'
        
        plateTop.innerHTML = "";
        plateBottom.innerHTML = "";
        
        for(let i=0; i<nbCharges; i++) {
            plateTop.innerHTML += `<span class="charge-plus">+</span>`;
            plateBottom.innerHTML += `<span class="charge-minus">-</span>`;
        }
    }

    // --- DESSIN DU GRAPHIQUE ---
    function drawGraph() {
        ctx.clearRect(0, 0, W, H);
        
        const paddingLeft = 40;
        const paddingBottom = 30;
        const graphW = W - paddingLeft - 20;
        const graphH = H - paddingBottom - 20;
        
        // 1. Grille et Axes
        ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Lignes horizontales (Tensions)
        for(let v=0; v<=12; v+=2) {
            let y = H - paddingBottom - (v/12) * graphH;
            ctx.moveTo(paddingLeft, y);
            ctx.lineTo(W - 20, y);
        }
        ctx.stroke();

        // Axes principaux
        ctx.strokeStyle = "var(--text-main)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(paddingLeft, 10);
        ctx.lineTo(paddingLeft, H - paddingBottom); // Axe Y (Tension)
        ctx.lineTo(W - 10, H - paddingBottom); // Axe X (Temps)
        ctx.stroke();

        // Textes des axes
        ctx.fillStyle = "var(--text-muted)";
        ctx.font = "12px sans-serif";
        ctx.fillText("uC (V)", 5, 20);
        ctx.fillText("t (s)", W - 30, H - 5);

        // Repères X (0, tau, 5tau)
        let xTau = paddingLeft + (tau / MAX_TIME) * graphW;
        let x5Tau = paddingLeft + ((5*tau) / MAX_TIME) * graphW;
        
        ctx.fillText("τ", xTau - 4, H - 12);
        ctx.fillText("5τ", x5Tau - 8, H - 12);

        // 2. Tracer la courbe (Historique complet)
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = mode === 'charge' ? "#ec4899" : "#8b5cf6";
        
        // On trace du temps 0 jusqu'au temps actuel
        for(let tx = 0; tx <= time; tx += (MAX_TIME/200)) {
            let current_uc = 0;
            if(mode === 'charge') {
                current_uc = ucInitial + (E - ucInitial) * (1 - Math.exp(-tx/tau));
            } else {
                current_uc = ucInitial * Math.exp(-tx/tau);
            }
            
            let plotX = paddingLeft + (tx / MAX_TIME) * graphW;
            let plotY = H - paddingBottom - (current_uc / 12) * graphH;
            
            if(tx === 0) ctx.moveTo(plotX, plotY);
            else ctx.lineTo(plotX, plotY);
        }
        ctx.stroke();

        // 3. Point actuel et Lignes en pointillés
        let currentX = paddingLeft + (time / MAX_TIME) * graphW;
        let currentY = H - paddingBottom - (uc / 12) * graphH;
        
        if (time <= MAX_TIME) {
            // Ligne verticale
            ctx.beginPath();
            ctx.setLineDash([4, 4]);
            ctx.moveTo(currentX, H - paddingBottom);
            ctx.lineTo(currentX, currentY);
            // Ligne horizontale
            ctx.moveTo(paddingLeft, currentY);
            ctx.lineTo(currentX, currentY);
            ctx.strokeStyle = "var(--text-muted)";
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.setLineDash([]); // Reset
            
            // Valeur Y sur l'axe
            ctx.fillStyle = mode === 'charge' ? "#ec4899" : "#8b5cf6";
            ctx.font = "bold 12px sans-serif";
            ctx.fillText(uc.toFixed(1) + "V", 5, currentY + 4);

            // Point
            ctx.beginPath();
            ctx.arc(currentX, currentY, 6, 0, 2 * Math.PI);
            ctx.fillStyle = mode === 'charge' ? "#ec4899" : "#8b5cf6";
            ctx.fill();
        }
    }

    // --- BOUCLE D'ANIMATION ---
    let lastTime = performance.now();

    function animate(now) {
        let dt = (now - lastTime) / 1000; // En secondes
        lastTime = now;

        // Vitesse de l'animation ajustée selon tau pour que ce soit toujours visible
        // L'animation met environ 5 secondes réelles pour parcourir 5*tau
        let simSpeed = (MAX_TIME / 8); 
        time += dt * simSpeed;

        // Si on dépasse le bord du graphe, on bloque le temps pour admirer le régime stationnaire
        if(time > MAX_TIME) time = MAX_TIME;

        // Équations différentielles (Solution analytique exacte)
        if(mode === 'charge') {
            uc = ucInitial + (E - ucInitial) * (1 - Math.exp(-time/tau));
        } else {
            uc = ucInitial * Math.exp(-time/tau);
        }

        // Mises à jour UI
        timeDisplay.innerText = time.toFixed(2);
        updateCapacitorCharges();
        drawGraph();

        requestAnimationFrame(animate);
    }

    // Initialisation
    setTimeout(() => {
        resize();
        updateValues();
        lastTime = performance.now();
        animate(performance.now());
    }, 200);

});