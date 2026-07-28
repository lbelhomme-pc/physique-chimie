const canvas = document.getElementById('optics-canvas');
const ctx = canvas.getContext('2d');

// --- HAUTE DÉFINITION (Retina Support) ---
const W = 2000;
const H = 1000;
canvas.width = W;
canvas.height = H;
const cx = W / 2;
const cy = H / 2;
const scale = 16; // Fixe : 1 cm = 16 pixels

let lensType = 'conv'; 

let state = {
    xA: -25,
    f: 10,
    xAp: 0,
    yB: 5, // Taille de l'objet (5 cm)
    yBp: 0,
    isInfinity: false,
    isVirtual: false,
    gamma: 0
};

const sliderOA = document.getElementById('slider-oa');
const sliderF = document.getElementById('slider-f');
const tipBox = document.getElementById('tip-box');

function setLens(type) {
    lensType = type;
    document.getElementById('tab-conv').classList.toggle('active', type === 'conv');
    document.getElementById('tab-div').classList.toggle('active', type === 'div');
    
    const color = type === 'conv' ? '#8b5cf6' : '#06b6d4';
    sliderF.style.accentColor = color;
    document.getElementById('lbl-f').className = type === 'conv' ? 'val-purple' : 'val-blue';
    document.getElementById('math-f-sym').className = type === 'conv' ? 'math-var val-purple' : 'math-var val-blue';
    
    updateOptics();
}

function updateOptics() {
    let xA = parseFloat(sliderOA.value);
    const abs_f = parseFloat(sliderF.value);
    const f = lensType === 'conv' ? abs_f : -abs_f; // f' négatif pour la divergente

    // --- LE SECRET : MAGNÉTISME ET LIMITES ---
    // 1. On "aimante" l'objet s'il est très proche du foyer pour faciliter la découverte de l'infini
    if (Math.abs(xA + f) <= 0.5) {
        xA = -f;
        sliderOA.value = xA;
    } 
    // 2. Si on est en lentille convergente, on empêche l'image de sortir du cadre
    else if (lensType === 'conv') {
        const MAX_X = 58; // cm max autorisé avant de sortir de l'écran (largeur)
        const MAX_Y = 28; // cm max autorisé (hauteur)
        const maxGamma = MAX_Y / state.yB; 

        // Calcul exact des limites via la formule de Descartes
        let limitReal = Math.min((MAX_X * f) / (f - MAX_X), -f - (f / maxGamma));
        let limitVirt = Math.max((-MAX_X * f) / (MAX_X + f), -f + (f / maxGamma));

        // Si l'utilisateur tombe dans la zone critique qui ferait exploser l'image hors écran
        if (xA > limitReal && xA < -f) {
            xA = limitReal;
            sliderOA.value = xA;
        } else if (xA < limitVirt && xA > -f) {
            xA = limitVirt;
            sliderOA.value = xA;
        }
    }

    state.xA = xA;
    state.f = f;

    // Mise à jour des Textes
    document.getElementById('lbl-oa').innerText = state.xA.toFixed(1) + " cm";
    document.getElementById('lbl-f').innerText = (state.f > 0 ? "+" : "") + state.f.toFixed(1) + " cm";

    // Formule de Descartes stricte
    if (state.xA === -state.f) {
        state.isInfinity = true;
        state.xAp = 9999;
        state.gamma = 9999;
        state.yBp = state.yB;
        state.isVirtual = false;
    } else {
        state.isInfinity = false;
        state.xAp = (state.xA * state.f) / (state.xA + state.f);
        state.gamma = state.xAp / state.xA;
        state.yBp = state.gamma * state.yB;
        state.isVirtual = state.xAp < 0;
    }

    // Mise à jour de l'UI des résultats
    if (state.isInfinity) {
        document.getElementById('val-oap').innerText = "À l'infini (∞)";
        document.getElementById('val-gamma').innerText = "∞";
        setBadges("badge-real", "Image à l'infini<br><span>(Faisceau parallèle)</span>", "badge-upright", "-<br><span>-</span>");
        
        tipBox.className = "tip-box tip-conv";
        tipBox.innerHTML = "<strong>💡 Fait :</strong> L'objet est pile sur le foyer ! L'image est renvoyée à l'infini. C'est le principe des phares de voiture.";
    } else {
        document.getElementById('val-oap').innerText = (state.xAp > 0 ? "+" : "") + state.xAp.toFixed(1) + " cm";
        document.getElementById('val-gamma').innerText = (state.gamma > 0 ? "+" : "") + state.gamma.toFixed(2);
        
        if (state.xAp > 0) setBadges("badge-real", "Image Réelle<br><span>(Projetable)</span>", state.gamma < 0 ? "badge-inverted" : "badge-upright", state.gamma < 0 ? "Renversée<br><span>(Tête en bas)</span>" : "Droite<br><span>(Même sens)</span>");
        else setBadges("badge-virtual", "Image Virtuelle<br><span>(Non projetable)</span>", state.gamma < 0 ? "badge-inverted" : "badge-upright", state.gamma < 0 ? "Renversée<br><span>(Tête en bas)</span>" : "Droite<br><span>(Même sens)</span>");

        if (lensType === 'conv') {
            tipBox.className = "tip-box tip-conv";
            if (state.xA > -Math.abs(state.f)) tipBox.innerHTML = "<strong>🔍 Effet Loupe :</strong> L'image est virtuelle, droite et agrandie !";
            else tipBox.innerHTML = "<strong>📽️ Effet Vidéoprojecteur :</strong> L'image est réelle et renversée.";
        } else {
            tipBox.className = "tip-box tip-div";
            tipBox.innerHTML = "<strong>🚪 Fait :</strong> Une lentille divergente donne toujours une image virtuelle, droite et rétrécie (ex: judas de porte, lunettes pour myopie).";
        }
    }
}

function setBadges(cls1, txt1, cls2, txt2) {
    document.getElementById('badge-nature').className = `badge ${cls1}`;
    document.getElementById('badge-nature').innerHTML = txt1;
    document.getElementById('badge-sens').className = `badge ${cls2}`;
    document.getElementById('badge-sens').innerHTML = txt2;
}

// --- MOTEUR DE DESSIN ---
function drawArrow(x, yBase, yTop, color, labelBase, labelTop) {
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(x, yBase); ctx.lineTo(x, yTop); ctx.stroke();

    const arrSize = 20;
    const dir = yTop < yBase ? 1 : -1; 
    
    ctx.beginPath();
    ctx.moveTo(x, yTop);
    ctx.lineTo(x - arrSize/1.5, yTop + dir * arrSize);
    ctx.lineTo(x + arrSize/1.5, yTop + dir * arrSize);
    ctx.fill();

    ctx.font = "800 28px 'Inter', sans-serif";
    ctx.fillText(labelBase, x - 35, yBase + (dir === 1 ? 30 : -15));
    ctx.fillText(labelTop, x - 35, yTop + (dir === 1 ? -20 : 35));
}

// Fonction pour tracer les rayons qui sortent de la lentille
function drawEmergeRay(xAp_px, yBp_px, y_lens, color, vTargetX, vTargetY) {
    if (state.isInfinity) {
        // A l'infini, tous les rayons émergent parallèlement au rayon vert (qui passe par O)
        const xA_px = cx + state.xA * scale;
        const yB_px = cy - state.yB * scale;
        let m = (cy - yB_px) / (cx - xA_px); // Pente du rayon qui passe par O
        
        ctx.beginPath(); ctx.strokeStyle = color; ctx.setLineDash([]);
        ctx.moveTo(cx, y_lens); 
        ctx.lineTo(W, y_lens + m * (W - cx)); 
        ctx.stroke();
    } else {
        let m = (yBp_px - y_lens) / (xAp_px - cx);
        
        // Rayon réel (vers la droite)
        ctx.beginPath(); ctx.strokeStyle = color; ctx.setLineDash([]);
        ctx.moveTo(cx, y_lens); 
        ctx.lineTo(W, y_lens + m * (W - cx)); 
        ctx.stroke();

        // Prolongement virtuel (vers la gauche) si l'image est virtuelle
        if (state.isVirtual && vTargetX !== null) {
            ctx.beginPath(); ctx.setLineDash([12, 12]);
            ctx.moveTo(cx, y_lens);
            ctx.lineTo(vTargetX, vTargetY); 
            ctx.stroke(); 
            ctx.setLineDash([]);
        }
    }
}

function loop() {
    const xA_px = cx + state.xA * scale;
    const yB_px = cy - state.yB * scale;
    const xAp_px = cx + state.xAp * scale;
    const yBp_px = cy - state.yBp * scale;
    const abs_f_px = Math.abs(state.f) * scale;

    ctx.clearRect(0, 0, W, H);
    const isDark = document.body.classList.contains('dark-mode');
    
    // Axe Optique
    ctx.strokeStyle = isDark ? "#475569" : "#94a3b8";
    ctx.lineWidth = 4; ctx.setLineDash([20, 10]);
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
    ctx.setLineDash([]);

    // Dessin de la Lentille
    ctx.strokeStyle = lensType === 'conv' ? "#8b5cf6" : "#06b6d4";
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(cx, 40); ctx.lineTo(cx, H - 40); ctx.stroke();
    
    if (lensType === 'conv') {
        ctx.beginPath(); ctx.moveTo(cx, 40); ctx.lineTo(cx - 20, 65); ctx.moveTo(cx, 40); ctx.lineTo(cx + 20, 65); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, H - 40); ctx.lineTo(cx - 20, H - 65); ctx.moveTo(cx, H - 40); ctx.lineTo(cx + 20, H - 65); ctx.stroke();
    } else {
        ctx.beginPath(); ctx.moveTo(cx, 40); ctx.lineTo(cx - 20, 15); ctx.moveTo(cx, 40); ctx.lineTo(cx + 20, 15); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, H - 40); ctx.lineTo(cx - 20, H - 15); ctx.moveTo(cx, H - 40); ctx.lineTo(cx + 20, H - 15); ctx.stroke();
    }

    // Foyers (F et F')
    ctx.fillStyle = ctx.strokeStyle;
    ctx.font = "900 28px 'Inter', sans-serif";
    const F_px = lensType === 'conv' ? cx - abs_f_px : cx + abs_f_px;
    const Fp_px = lensType === 'conv' ? cx + abs_f_px : cx - abs_f_px;

    ctx.beginPath(); ctx.arc(F_px, cy, 8, 0, Math.PI*2); ctx.fill();
    ctx.fillText("F", F_px - 10, cy + 35);
    ctx.beginPath(); ctx.arc(Fp_px, cy, 8, 0, Math.PI*2); ctx.fill();
    ctx.fillText("F'", Fp_px - 10, cy + 35);
    ctx.fillText("O", cx + 15, cy + 35);

    // --- TRACÉ DES RAYONS ---
    ctx.lineWidth = 5;

    // R1 (Rouge) : Rayon parallèle à l'axe
    ctx.strokeStyle = "#ef4444"; 
    ctx.beginPath(); ctx.moveTo(xA_px, yB_px); ctx.lineTo(cx, yB_px); ctx.stroke();
    drawEmergeRay(xAp_px, yBp_px, yB_px, "#ef4444", Fp_px, cy); // Poursuit vers F'

    // R2 (Vert) : Rayon passant par le centre O
    ctx.strokeStyle = "#10b981"; 
    ctx.beginPath(); ctx.moveTo(xA_px, yB_px); ctx.lineTo(cx, cy); ctx.stroke();
    drawEmergeRay(xAp_px, yBp_px, cy, "#10b981", null, null); // N'est pas dévié

    // R3 (Orange) : Rayon passant par le foyer F
    if (!state.isInfinity) {
        ctx.strokeStyle = "#f59e0b"; 
        
        let m = (cy - yB_px) / (F_px - xA_px); // Pente de la droite objet -> foyer
        let impactY = yB_px + m * (cx - xA_px); // Point d'impact exact sur la lentille
        
        ctx.beginPath(); 
        ctx.moveTo(xA_px, yB_px);
        ctx.lineTo(cx, impactY); 
        ctx.stroke();

        // Pour la divergente, le rayon "vise" F à droite, on trace la ligne de visée
        if (lensType === 'div') {
            ctx.beginPath(); ctx.setLineDash([12, 12]);
            ctx.moveTo(cx, impactY); ctx.lineTo(F_px, cy); ctx.stroke(); ctx.setLineDash([]);
        }

        drawEmergeRay(xAp_px, yBp_px, impactY, "#f59e0b", xAp_px, yBp_px); // Émerge parallèlement
    }

    // --- DESSIN DES OBJETS (A,B et A',B') ---
    drawArrow(xA_px, cy, yB_px, "#3b82f6", "A", "B");
    
    if (!state.isInfinity) {
        if (state.isVirtual) ctx.setLineDash([12, 12]); 
        drawArrow(xAp_px, cy, yBp_px, "#d946ef", "A'", "B'");
        ctx.setLineDash([]);
    }

    requestAnimationFrame(loop);
}

sliderOA.addEventListener('input', updateOptics);
sliderF.addEventListener('input', updateOptics);

setLens('conv');
loop();