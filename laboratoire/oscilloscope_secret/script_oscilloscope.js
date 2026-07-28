// Configuration de l'Oscilloscope
const canvas = document.getElementById('osc-canvas');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
let audioCtx = null, oscillator = null, gainNode = null, isSoundOn = false;

function toggleSound() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        oscillator = audioCtx.createOscillator(); gainNode = audioCtx.createGain();
        oscillator.type = 'sine'; oscillator.connect(gainNode); gainNode.connect(audioCtx.destination); oscillator.start();
    }
    isSoundOn = !isSoundOn;
    const btn = document.getElementById('btn-sound');
    if (isSoundOn) { audioCtx.resume(); btn.innerText = "🔊 Son Activé"; btn.style.background = "#10b981"; } 
    else { audioCtx.suspend(); btn.innerText = "🔇 Activer le Son"; btn.style.background = "#f59e0b"; }
}

let prevAmp = 95, prevFreq = 5.5, arrowTimeout = null;

function trackSliders() {
    const userAmp = parseFloat(document.getElementById('slider-amp').value);
    const userFreq = parseFloat(document.getElementById('slider-freq').value);
    
    let arrUmax = "➖", clsUmax = "arrow-flat"; if (userAmp > prevAmp) { arrUmax = "⬆️"; clsUmax = "arrow-up"; } else if (userAmp < prevAmp) { arrUmax = "⬇️"; clsUmax = "arrow-down"; }
    let arrF = "➖", clsF = "arrow-flat"; if (userFreq > prevFreq) { arrF = "⬆️"; clsF = "arrow-up"; } else if (userFreq < prevFreq) { arrF = "⬇️"; clsF = "arrow-down"; }
    let arrT = "➖", clsT = "arrow-flat"; if (userFreq > prevFreq) { arrT = "⬇️"; clsT = "arrow-down"; } else if (userFreq < prevFreq) { arrT = "⬆️"; clsT = "arrow-up"; }

    document.getElementById('arr-umax').innerText = arrUmax; document.getElementById('arr-umax').className = clsUmax;
    document.getElementById('arr-f').innerText = arrF; document.getElementById('arr-f').className = clsF;
    document.getElementById('arr-t').innerText = arrT; document.getElementById('arr-t').className = clsT;

    document.getElementById('val-umax').innerText = (userAmp / 10).toFixed(1);
    document.getElementById('val-f').innerText = Math.round(userFreq * 80);
    document.getElementById('val-t').innerText = (1000 / Math.round(userFreq * 80)).toFixed(1);

    prevAmp = userAmp; prevFreq = userFreq;
    clearTimeout(arrowTimeout);
    arrowTimeout = setTimeout(() => { document.querySelectorAll('.formula-value span:nth-child(2)').forEach(el => { el.innerText = "➖"; el.className = "arrow-flat"; }); }, 1000);
}

function updateAudio() {
    if (!isSoundOn || !gainNode) return;
    const userFreq = parseFloat(document.getElementById('slider-freq').value);
    oscillator.frequency.setTargetAtTime(userFreq * 80, audioCtx.currentTime, 0.1);
    const userAmp = parseFloat(document.getElementById('slider-amp').value);
    gainNode.gain.setTargetAtTime((userAmp / 180) * 0.3, audioCtx.currentTime, 0.1);
}

const levels = [ { amp: 150, freq: 2.5, desc: "Grave et Fort" }, { amp: 50, freq: 8.5, desc: "Aigu et Faible" }, { amp: 100, freq: 5.5, desc: "Moyen et Medium" }, { amp: 30, freq: 1.5, desc: "Très Grave et Très Faible" } ];
let currentLevel = 0, phase = 0; 

function loadLevel() {
    document.getElementById('level-indicator').innerText = `Niveau ${currentLevel + 1} / ${levels.length}`;
    document.getElementById('level-desc').innerText = levels[currentLevel].desc;
    document.getElementById('btn-next').style.display = "none";
    document.getElementById('game-info-container').classList.remove('success');
    document.getElementById('game-message').innerHTML = `🎯 Objectif : Trouve le son <strong style="color:inherit;">${levels[currentLevel].desc}</strong>`;
}

function nextLevel() {
    currentLevel++;
    if (currentLevel >= levels.length) { alert("🎉 Incroyable ! Tu as maîtrisé les ondes sonores !"); currentLevel = 0; }
    document.getElementById('slider-amp').value = 95; document.getElementById('slider-freq').value = 5.5;
    trackSliders(); loadLevel();
}

function drawGrid() {
    ctx.strokeStyle = "rgba(16, 185, 129, 0.2)"; ctx.lineWidth = 1; ctx.beginPath();
    for (let x = 0; x < W; x += 40) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for (let y = 0; y < H; y += 40) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke(); ctx.strokeStyle = "rgba(16, 185, 129, 0.5)"; ctx.beginPath();
    ctx.moveTo(0, H/2); ctx.lineTo(W, H/2); ctx.moveTo(W/2, 0); ctx.lineTo(W/2, H); ctx.stroke();
}

function drawWave(amp, freq, color, isDashed, isTarget) {
    ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = isTarget ? 4 : 5;
    if (isDashed) ctx.setLineDash([15, 15]); else ctx.setLineDash([]);
    if (!isTarget) { ctx.shadowBlur = 15; ctx.shadowColor = color; } else ctx.shadowBlur = 0;
    for (let x = 0; x < W; x++) {
        let y = H / 2 - amp * Math.sin((x * freq * 0.01) + phase);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke(); ctx.shadowBlur = 0; 
}

function animate() {
    ctx.clearRect(0, 0, W, H); drawGrid(); phase += 0.05;
    const userAmp = parseFloat(document.getElementById('slider-amp').value), userFreq = parseFloat(document.getElementById('slider-freq').value);
    const targetAmp = levels[currentLevel].amp, targetFreq = levels[currentLevel].freq;

    drawWave(targetAmp, targetFreq, "rgba(255, 255, 255, 0.4)", true, true);
    drawWave(userAmp, userFreq, "#10b981", false, false);
    updateAudio();

    document.getElementById('lbl-amp').innerText = userAmp > 120 ? "Fort" : (userAmp < 60 ? "Faible" : "Moyen");
    document.getElementById('lbl-freq').innerText = userFreq > 7 ? "Aigu" : (userFreq < 3.5 ? "Grave" : "Medium");

    if (Math.abs(userAmp - targetAmp) < 8 && Math.abs(userFreq - targetFreq) < 0.2) {
        document.getElementById('btn-next').style.display = "inline-block";
        document.getElementById('game-message').innerHTML = "✅ <strong>Superposition parfaite !</strong> Niveau débloqué.";
        document.getElementById('game-info-container').classList.add('success');
    } else {
        document.getElementById('btn-next').style.display = "none";
        document.getElementById('game-info-container').classList.remove('success');
        document.getElementById('game-message').innerHTML = `🎯 Objectif : Trouve le son <strong style="color:inherit;">${levels[currentLevel].desc}</strong>`;
    }
    requestAnimationFrame(animate);
}

// Lancement
window.addEventListener('load', () => {
    trackSliders(); 
    loadLevel(); 
    animate();
});