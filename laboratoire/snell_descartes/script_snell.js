const canvas = document.getElementById('optics-canvas');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;
const cx = W / 2;
const cy = H / 2;

// Fonction pour nommer les milieux courants
function getMaterialName(n) {
    if (n === 1.0) return "(Air / Vide)";
    if (n > 1.3 && n < 1.4) return "(Eau)";
    if (n >= 1.4 && n < 1.7) return "(Verre / Plexiglas)";
    if (n >= 2.4) return "(Diamant)";
    return "";
}

function drawScene(i1_deg, n1, n2) {
    ctx.clearRect(0, 0, W, H);
    
    // --- 1. Dessiner les Milieux ---
    // Le fond reste toujours sombre (Banc d'optique)
    ctx.fillStyle = "#0f172a"; 
    ctx.fillRect(0, 0, W, H);
    
    ctx.fillStyle = `rgba(56, 189, 248, ${(n1 - 1) / 2.5})`; 
    ctx.fillRect(0, 0, W, cy);
    
    ctx.fillStyle = `rgba(56, 189, 248, ${(n2 - 1) / 2.5})`; 
    ctx.fillRect(0, cy, W, cy);
    
    // --- 2. Dioptre et Normale ---
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
    
    ctx.setLineDash([8, 8]);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, 20); ctx.lineTo(cx, H - 20); ctx.stroke();
    ctx.setLineDash([]);

    // --- 3. Textes descriptifs sur le canvas ---
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.font = "bold 18px 'Inter', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`Milieu 1 : n₁ = ${n1.toFixed(2)} ${getMaterialName(n1)}`, 20, 30);
    ctx.fillText(`Milieu 2 : n₂ = ${n2.toFixed(2)} ${getMaterialName(n2)}`, 20, cy + 30);

    // --- 4. Mathématiques de la lumière ---
    const L = 350; 
    const i1_rad = i1_deg * Math.PI / 180;
    const arcRadius = 60;
    
    ctx.font = "bold 16px 'Inter', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Rayon Incident (Rouge)
    const startX = cx - L * Math.sin(i1_rad);
    const startY = cy - L * Math.cos(i1_rad);

    ctx.strokeStyle = "#ef4444"; ctx.lineWidth = 4;
    ctx.shadowBlur = 15; ctx.shadowColor = "#ef4444";
    ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(cx, cy); ctx.stroke();
    ctx.shadowBlur = 0;

    // Dessin de l'angle i1
    if (i1_deg > 2) {
        ctx.beginPath();
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 2;
        ctx.arc(cx, cy, arcRadius, -Math.PI/2 - i1_rad, -Math.PI/2);
        ctx.stroke();
        
        ctx.fillStyle = "#ef4444";
        const midI1 = -Math.PI/2 - i1_rad/2;
        ctx.fillText("i₁", cx + (arcRadius + 20) * Math.cos(midI1), cy + (arcRadius + 20) * Math.sin(midI1));
    }

    // Calcul de Snell-Descartes
    const sin_i2 = (n1 / n2) * Math.sin(i1_rad);
    
    if (sin_i2 > 1.0) {
        // RÉFLEXION TOTALE INTERNE
        ctx.strokeStyle = "#f59e0b"; // Orange
        ctx.shadowBlur = 15; ctx.shadowColor = "#f59e0b";
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + L * Math.sin(i1_rad), cy - L * Math.cos(i1_rad));
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Dessin de l'angle de réflexion r
        if (i1_deg > 2) {
            ctx.beginPath();
            ctx.strokeStyle = "#f59e0b";
            ctx.lineWidth = 2;
            ctx.arc(cx, cy, arcRadius, -Math.PI/2, -Math.PI/2 + i1_rad);
            ctx.stroke();
            
            ctx.fillStyle = "#f59e0b";
            const midR = -Math.PI/2 + i1_rad/2;
            ctx.fillText("r", cx + (arcRadius + 20) * Math.cos(midR), cy + (arcRadius + 20) * Math.sin(midR));
        }
        
        return { type: 'TIR' };
    } else {
        // RÉFRACTION NORMALE
        const i2_rad = Math.asin(sin_i2);
        const i2_deg = i2_rad * 180 / Math.PI;
        
        // Rayon Réfracté (Bleu)
        ctx.strokeStyle = "#3b82f6"; ctx.lineWidth = 4;
        ctx.shadowBlur = 15; ctx.shadowColor = "#3b82f6";
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + L * Math.sin(i2_rad), cy + L * Math.cos(i2_rad));
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Dessin de l'angle i2
        if (i2_deg > 2) {
            ctx.beginPath();
            ctx.strokeStyle = "#3b82f6";
            ctx.lineWidth = 2;
            ctx.arc(cx, cy, arcRadius, Math.PI/2 - i2_rad, Math.PI/2);
            ctx.stroke();
            
            ctx.fillStyle = "#3b82f6";
            const midI2 = Math.PI/2 - i2_rad/2;
            ctx.fillText("i₂", cx + (arcRadius + 20) * Math.cos(midI2), cy + (arcRadius + 20) * Math.sin(midI2));
        }

        // Rayon "Fantôme" (Pointillés rouges pour voir la déviation)
        ctx.strokeStyle = "rgba(239, 68, 68, 0.5)";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + L * Math.sin(i1_rad), cy + L * Math.cos(i1_rad));
        ctx.stroke();
        ctx.setLineDash([]);

        return { type: 'REFRACT', i2_deg: i2_deg };
    }
}

function updateOptics() {
    const i1 = parseFloat(document.getElementById('slider-i1').value);
    const n1 = parseFloat(document.getElementById('slider-n1').value);
    const n2 = parseFloat(document.getElementById('slider-n2').value);

    // Mise à jour des labels UI
    document.getElementById('lbl-i1').innerText = i1 + "°";
    document.getElementById('lbl-n1').innerText = n1.toFixed(2) + " " + getMaterialName(n1);
    document.getElementById('lbl-n2').innerText = n2.toFixed(2) + " " + getMaterialName(n2);

    // Dessin sur le Canvas
    const result = drawScene(i1, n1, n2);

    // Mise à jour des résultats mathématiques
    if (result.type === 'TIR') {
        document.getElementById('val-i2').innerText = "--";
        document.getElementById('val-d').innerText = "--";
        document.getElementById('alert-tir').classList.add('show');
    } else {
        const i2 = result.i2_deg;
        const deviation = Math.abs(i1 - i2);
        
        document.getElementById('val-i2').innerText = i2.toFixed(1);
        document.getElementById('val-d').innerText = deviation.toFixed(1);
        document.getElementById('alert-tir').classList.remove('show');
    }
}

// Écouteurs d'événements sur les sliders
document.getElementById('slider-i1').addEventListener('input', updateOptics);
document.getElementById('slider-n1').addEventListener('input', updateOptics);
document.getElementById('slider-n2').addEventListener('input', updateOptics);

// Lancement initial
updateOptics();