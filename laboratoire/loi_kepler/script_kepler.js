document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById("c");
    const scene = document.getElementById("scene");
    const ctx = canvas.getContext("2d");

    // Sécurisation de la récupération des éléments HTML
    const aSlider = document.getElementById("aSlider");
    const eSlider = document.getElementById("eSlider");
    const speedSlider = document.getElementById("timeSpeed");
    
    const aValText = document.getElementById("aVal");
    const eValText = document.getElementById("eVal");
    
    const rNow = document.getElementById("rNow");
    const vNow = document.getElementById("vNow");
    
    const k3a = document.getElementById("k3-a");
    const k3a3 = document.getElementById("k3-a3");
    const k3t = document.getElementById("k3-t");
    const k3t2 = document.getElementById("k3-t2");
    const valKepler3 = document.getElementById("valKepler3");

    const dtSlider = document.getElementById("dtSlider");
    const dtValText = document.getElementById("dtVal");
    const btnMeasure = document.getElementById("btnMeasure");
    const btnClearAreas = document.getElementById("btnClearAreas");
    
    const valA1 = document.getElementById("valA1");
    const valV1 = document.getElementById("valV1");
    const valA2 = document.getElementById("valA2");
    const valV2 = document.getElementById("valV2");
    const recordingOverlay = document.getElementById("recordingOverlay");

    // Paramètres Physiques Réalistes
    const MU = 4 * Math.PI * Math.PI; 
    
    // State
    let W=0, H=0, DPR=1;
    let t = 0;                     
    const TAU = Math.PI * 2;

    // Gestion des Aires
    let isRecordingArea = false;
    let recordingTimer = 0;
    let currentAreaRecord = null;
    let recordedAreas = []; 

    function resize(){
        const r = scene.getBoundingClientRect();
        DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
        W = Math.floor(r.width * DPR);
        H = Math.floor(r.height * DPR);
        // Important pour éviter les bugs de redimensionnement :
        canvas.style.width = r.width + "px";
        canvas.style.height = r.height + "px";
        canvas.width = W;
        canvas.height = H;
    }
    window.addEventListener("resize", resize);
    resize(); // Appel initial immédiat

    // --- MATHÉMATIQUES ORBITALES ---
    function solveE(M, e){
        let m = ((M + Math.PI) % TAU) - Math.PI;
        let E = (e < 0.8) ? m : Math.PI;
        for(let i=0; i<10; i++){
            const f = E - e * Math.sin(E) - m;
            const fp = 1 - e * Math.cos(E);
            E -= f/fp;
        }
        return E;
    }

    function orbitPos(a, e, M){
        const E = solveE(M,e);
        const b = a * Math.sqrt(1 - e*e);
        let x = a * (Math.cos(E) - e); 
        let y = b * Math.sin(E);
        const r = Math.hypot(x, y);
        return { x, y, r };
    }

    function buildOrbitPath(a, e, steps=200){
        const pts=[];
        for(let i=0; i<=steps; i++){
            const M = (i/steps)*TAU;
            pts.push(orbitPos(a, e, M));
        }
        return pts;
    }

    function drawArrow(x1, y1, x2, y2, color){
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5 * DPR;
        ctx.beginPath();
        ctx.moveTo(x1,y1);
        ctx.lineTo(x2,y2);
        ctx.stroke();

        const dx = x2-x1, dy = y2-y1;
        const ang = Math.atan2(dy, dx);
        const h = 12 * DPR;
        const a1 = ang + Math.PI*0.85;
        const a2 = ang - Math.PI*0.85;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x2,y2);
        ctx.lineTo(x2 + Math.cos(a1)*h, y2 + Math.sin(a1)*h);
        ctx.lineTo(x2 + Math.cos(a2)*h, y2 + Math.sin(a2)*h);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    function drawRecordedSector(record, a, e, cx, cy, scale) {
        ctx.save();
        ctx.fillStyle = record.colorFill;
        ctx.beginPath();
        ctx.moveTo(cx, cy); 
        
        let steps = 30;
        let dM = (record.M_end - record.M_start) / steps;
        for(let i=0; i<=steps; i++){
            let p = orbitPos(a, e, record.M_start + i*dM);
            ctx.lineTo(cx + p.x * scale, cy - p.y * scale);
        }
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = record.colorStroke;
        ctx.lineWidth = 2 * DPR;
        ctx.beginPath();
        for(let i=0; i<=steps; i++){
            let p = orbitPos(a, e, record.M_start + i*dM);
            if(i===0) ctx.moveTo(cx + p.x * scale, cy - p.y * scale);
            else ctx.lineTo(cx + p.x * scale, cy - p.y * scale);
        }
        ctx.stroke();

        let p1 = orbitPos(a, e, record.M_start);
        ctx.fillStyle = record.colorStroke;
        ctx.beginPath(); ctx.arc(cx + p1.x*scale, cy - p1.y*scale, 6*DPR, 0, TAU); ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${Math.round(16*DPR)}px Arial`;
        ctx.fillText(record.labelStart, cx + p1.x*scale + 12*DPR, cy - p1.y*scale - 12*DPR);

        if (record.M_start !== record.M_end) {
            let p2 = orbitPos(a, e, record.M_end);
            ctx.fillStyle = record.colorStroke;
            ctx.beginPath(); ctx.arc(cx + p2.x*scale, cy - p2.y*scale, 6*DPR, 0, TAU); ctx.fill();
            if (record.labelEnd) {
                ctx.fillStyle = "#ffffff";
                ctx.fillText(record.labelEnd, cx + p2.x*scale + 12*DPR, cy - p2.y*scale - 12*DPR);
            }
        }
        ctx.restore();
    }

    // --- INTERACTIONS & MISES À JOUR ---
    function updatePhysicsValues() {
        if (!aSlider || !eSlider) return;

        let a = Number(aSlider.value);
        let e = Number(eSlider.value) / 100;
        
        if(aValText) aValText.innerText = a.toFixed(1);
        if(eValText) eValText.innerText = e.toFixed(2);
        
        let a3 = Math.pow(a, 3);
        let T = Math.sqrt(a3); 
        let T2 = Math.pow(T, 2);
        let ratio = T2 / a3;

        if(k3a) k3a.innerText = a.toFixed(2);
        if(k3a3) k3a3.innerText = a3.toFixed(2);
        if(k3t) k3t.innerText = T.toFixed(2);
        if(k3t2) k3t2.innerText = T2.toFixed(2);
        if(valKepler3) valKepler3.innerText = ratio.toFixed(3);
    }

    if (aSlider) aSlider.addEventListener('input', () => { updatePhysicsValues(); clearAreas(); });
    if (eSlider) eSlider.addEventListener('input', () => { updatePhysicsValues(); clearAreas(); });

    if (dtSlider) dtSlider.addEventListener('input', () => {
        if(dtValText) dtValText.innerText = Number(dtSlider.value).toFixed(1);
        clearAreas(); 
    });

    if (btnMeasure) btnMeasure.addEventListener('click', () => {
        if(recordedAreas.length >= 2 || isRecordingArea) return; 
        
        isRecordingArea = true;
        recordingTimer = 0;
        if(recordingOverlay) recordingOverlay.classList.remove('hidden');
        btnMeasure.disabled = true;
        
        const dtValue = Number(dtSlider.value);
        const a = Number(aSlider.value);
        const e = Number(eSlider.value) / 100;
        const n = Math.sqrt(MU / Math.pow(a, 3));
        const M = n * t;
        
        let lStart = recordedAreas.length === 0 ? "A" : "C";
        let lEnd = recordedAreas.length === 0 ? "B" : "D";
        let cFill = recordedAreas.length === 0 ? "rgba(245, 158, 11, 0.3)" : "rgba(236, 72, 153, 0.3)";
        let cStroke = recordedAreas.length === 0 ? "#f59e0b" : "#ec4899";

        currentAreaRecord = { 
            M_start: M,
            M_end: M,
            dtTarget: dtValue,
            labelStart: lStart,
            labelEnd: lEnd,
            colorFill: cFill,
            colorStroke: cStroke,
            arcLength: 0,
            lastPos: orbitPos(a, e, M)
        };
    });

    function clearAreas() {
        recordedAreas = [];
        if(valA1) valA1.innerText = "—"; 
        if(valV1) valV1.innerText = "—";
        if(valA2) valA2.innerText = "—"; 
        if(valV2) valV2.innerText = "—";
        if(btnMeasure) {
            btnMeasure.disabled = false;
            btnMeasure.innerText = "🎯 Lancer la mesure (Poser A, on s'occupe de B)";
        }
    }
    if(btnClearAreas) btnClearAreas.addEventListener('click', clearAreas);

    // Initialisation
    updatePhysicsValues();

    // --- BOUCLE D'ANIMATION ---
    let last = performance.now();
    
    function frame(now){
        const dtReal = Math.min(0.05, (now - last)/1000);
        last = now;

        const a = Number(aSlider.value);
        const e = Number(eSlider.value) / 100;
        const speedFactor = Number(speedSlider.value) / 100; 
        
        const n = Math.sqrt(MU / Math.pow(a, 3));
        const dtSim = dtReal * speedFactor * 0.5; 
        t += dtSim;

        // --- GESTION DE L'ENREGISTREMENT ---
        if (isRecordingArea && currentAreaRecord) {
            recordingTimer += dtSim; 
            if(recordingOverlay) {
                recordingOverlay.innerText = `🔴 Mesure en cours... (${(recordingTimer).toFixed(1)} / ${currentAreaRecord.dtTarget} ans)`;
            }
            
            currentAreaRecord.M_end = currentAreaRecord.M_start + n * recordingTimer;
            
            // Calcul de la distance curviligne
            let currentP = orbitPos(a, e, currentAreaRecord.M_end);
            let distStep = Math.hypot(currentP.x - currentAreaRecord.lastPos.x, currentP.y - currentAreaRecord.lastPos.y);
            currentAreaRecord.arcLength += distStep;
            currentAreaRecord.lastPos = currentP;

            if (recordingTimer >= currentAreaRecord.dtTarget) {
                currentAreaRecord.M_end = currentAreaRecord.M_start + n * currentAreaRecord.dtTarget;
                
                const h = Math.sqrt(MU * a * (1 - e*e)); 
                const areaVal = 0.5 * h * currentAreaRecord.dtTarget;

                const vMoy = currentAreaRecord.arcLength / currentAreaRecord.dtTarget;
                
                if (recordedAreas.length === 0) {
                    recordedAreas.push(currentAreaRecord);
                    if(valA1) valA1.innerText = areaVal.toFixed(2);
                    if(valV1) valV1.innerText = vMoy.toFixed(2) + " UA/an";
                } else {
                    recordedAreas.push(currentAreaRecord);
                    if(valA2) valA2.innerText = areaVal.toFixed(2);
                    if(valV2) valV2.innerText = vMoy.toFixed(2) + " UA/an";
                    if(btnMeasure) btnMeasure.innerText = "Maximum (2) atteint";
                }

                isRecordingArea = false;
                currentAreaRecord = null;
                if(recordingOverlay) recordingOverlay.classList.add('hidden');
                if (recordedAreas.length < 2 && btnMeasure) {
                    btnMeasure.disabled = false;
                    btnMeasure.innerText = "🎯 Lancer la mesure (Poser C, on s'occupe de D)";
                }
            }
        }

        const M = n * t;
        const p = orbitPos(a, e, M);
        const vInst = Math.sqrt(MU * (2/p.r - 1/a));

        // --- DESSIN ---
        if(W > 0 && H > 0) {
            ctx.clearRect(0,0,W,H);
            
            const cx = W/2, cy = H/2;
            const scale = Math.min(W,H) * 0.42 / (a * (1+e)); // Auto-zoom

            // 1. Orbite
            const pts = buildOrbitPath(a, e);
            ctx.save();
            ctx.strokeStyle = "rgba(255,255,255,0.15)";
            ctx.lineWidth = 2 * DPR;
            ctx.beginPath();
            pts.forEach((pt, i) => {
                const sx = cx + pt.x * scale;
                const sy = cy - pt.y * scale; 
                if(i===0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
            });
            ctx.stroke();
            
            ctx.setLineDash([5*DPR, 5*DPR]);
            ctx.strokeStyle = "rgba(255,255,255,0.08)";
            ctx.beginPath();
            ctx.moveTo(cx - a*(1+e)*scale, cy);
            ctx.lineTo(cx + a*(1+e)*scale, cy);
            ctx.stroke();
            ctx.restore();

            // 2. Secteurs
            recordedAreas.forEach(sec => {
                drawRecordedSector(sec, a, e, cx, cy, scale);
            });

            if (isRecordingArea && currentAreaRecord) {
                let tempRecord = { ...currentAreaRecord, labelEnd: "" };
                drawRecordedSector(tempRecord, a, e, cx, cy, scale);
            }

            // 3. Soleil
            const sunR = 12 * DPR;
            const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, sunR*4);
            glow.addColorStop(0,"rgba(255,220,120,0.8)");
            glow.addColorStop(1,"rgba(255,120,30,0.0)");
            ctx.fillStyle = glow;
            ctx.beginPath(); ctx.arc(cx, cy, sunR*4, 0, TAU); ctx.fill();
            
            ctx.fillStyle = "#fde047";
            ctx.beginPath(); ctx.arc(cx, cy, sunR, 0, TAU); ctx.fill();

            // 4. Planète
            const px = cx + p.x * scale;
            const py = cy - p.y * scale;
            ctx.fillStyle = "#38bdf8";
            ctx.beginPath(); ctx.arc(px, py, 8 * DPR, 0, TAU); ctx.fill();

            // 5. Flèche Vitesse
            const pNext = orbitPos(a, e, M + 0.05);
            const nx = cx + pNext.x * scale;
            const ny = cy - pNext.y * scale;
            const dx = nx - px; const dy = ny - py;
            const dist = Math.hypot(dx, dy);
            const ux = dx / dist; const uy = dy / dist;

            const arrowLength = (40 + vInst * 8) * DPR; 
            drawArrow(px, py, px + ux * arrowLength, py + uy * arrowLength, "#22d3ee");
        }

        // HUD Updates
        if (rNow) rNow.innerText = (p.r).toFixed(2);
        if (vNow) vNow.innerText = (vInst).toFixed(1);

        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
});