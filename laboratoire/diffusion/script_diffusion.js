// script_diffusion.js
document.addEventListener('DOMContentLoaded', () => {
  const TAU = Math.PI * 2;

  const canvas = document.getElementById("c");
  const scene = document.getElementById("scene");
  if (!canvas || !scene) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // UI Elements
  const tempSlider = document.getElementById("temperature");
  const tempValText = document.getElementById("tempValText");
  const thermoLiquid = document.getElementById("thermoLiquid");
  const thermoBulb = document.getElementById("thermoBulb");
  const colorantSelect = document.getElementById("colorantSelect");

  const btnDrop = document.getElementById("drop");
  const btnStirrer = document.getElementById("toggleStirrer");
  const btnReset = document.getElementById("reset");

  const waterLayer = document.getElementById("waterLayer");
  const stirrerBar = document.getElementById("stirrerBar");
  const surface = document.getElementById("surface");

  // Si un élément essentiel manque, on évite de planter la page
  if (!tempSlider || !tempValText || !thermoLiquid || !thermoBulb || !colorantSelect || !btnDrop || !btnStirrer || !btnReset || !waterLayer || !stirrerBar || !surface) {
    console.warn("Diffusion: éléments DOM manquants.");
    return;
  }

  // Propriétés des colorants (Vitesse de diffusion et gravité)
  const colorants = {
    blue:  { r: 59,  g: 130, b: 246, diffRate: 1.8, driftDown: 2 },
    green: { r: 34,  g: 197, b: 94,  diffRate: 1.0, driftDown: 6 },
    red:   { r: 239, g: 68,  b: 68,  diffRate: 0.4, driftDown: 15 } // Rouge lourd et lent
  };

  let currentColorant = colorants.blue;

  // Écouteur Menu Déroulant
  colorantSelect.addEventListener("change", (e) => {
    const key = e.target.value;
    currentColorant = colorants[key] || colorants.blue;
  });

  // Dimensions
  let W = 0, H = 0, DPR = 1;

  function resize(){
    const r = canvas.getBoundingClientRect();
    DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    W = Math.max(1, Math.floor(r.width * DPR));
    H = Math.max(1, Math.floor(r.height * DPR));

    // Important: fixe le buffer réel du canvas
    canvas.width = W;
    canvas.height = H;
  }

  window.addEventListener("resize", resize);

  // Zone d'eau
  function waterRect(){
    // eau = 75% en bas
    const waterTop = H * (1 - 0.75);
    return { x: 0, y: waterTop, w: W, h: H - waterTop };
  }

  // État Physique
  const particles = [];
  let isStirring = false;
  let stirPower = 0; // Pour animer la transition du vortex
  const baseDiffusion = 25;

  function randn(){
    // petite approx gaussienne
    return (Math.random() + Math.random() + Math.random() + Math.random() - 2);
  }

  // --- MISE À JOUR DE LA TEMPÉRATURE (Et Couleurs Thermomètre) ---
  function updateTemperatureUI(){
    const t = parseInt(tempSlider.value, 10);
    tempValText.innerText = t + "°C";

    let color = "#ef4444"; // chaud
    if(t < 30) color = "#3b82f6";      // froid
    else if(t < 60) color = "#f59e0b"; // tiède

    tempValText.style.color = color;
    thermoLiquid.style.height = Math.max(t, 5) + "%"; // min 5% pour visibilité
    thermoLiquid.style.background = color;
    thermoBulb.style.background = color;
  }

  tempSlider.addEventListener("input", updateTemperatureUI);

  // --- AJOUT DE GOUTTES ---
  btnDrop.addEventListener("click", () => {
    resize();
    const wr = waterRect();

    // Point d'injection
    const cx = W * 0.5 + randn() * (W * 0.05);
    const cy = wr.y + wr.h * 0.05;

    // Nuage de particules
    const count = 400;
    for(let i=0; i<count; i++){
      particles.push({
        x: cx + randn() * (W * 0.02),
        y: cy + randn() * (wr.h * 0.02),
        vx: randn() * 2,
        vy: 2 + Math.random() * 4,
        a: 0.4 + Math.random() * 0.4,
        c: currentColorant
      });
    }

    surface.animate(
      [{ transform: 'translateY(3px)' }, { transform: 'translateY(0)' }],
      { duration: 400, easing: 'ease-out' }
    );
  });

  // --- AGITATEUR MAGNÉTIQUE ---
  function setStirrerUI(on){
    isStirring = on;

    if(isStirring) {
      btnStirrer.innerText = "🌪️ Agitateur : ON";
      btnStirrer.classList.remove('btn-secondary');
      btnStirrer.classList.add('btn-primary');
      stirrerBar.classList.add('stirring-anim');
      waterLayer.classList.add('vortex-active');
    } else {
      btnStirrer.innerText = "🌪️ Agitateur : OFF";
      btnStirrer.classList.remove('btn-primary');
      btnStirrer.classList.add('btn-secondary');
      stirrerBar.classList.remove('stirring-anim');
      waterLayer.classList.remove('vortex-active');
    }
  }

  btnStirrer.addEventListener("click", () => setStirrerUI(!isStirring));

  btnReset.addEventListener("click", () => {
    particles.length = 0;
    stirPower = 0;
    setStirrerUI(false);
  });

  // Init propre
  resize();
  updateTemperatureUI();
  setStirrerUI(false);

  // --- MOTEUR PHYSIQUE ET ANIMATION ---
  let last = performance.now();

  function frame(now){
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    const wr = waterRect();
    const centerX = W / 2;
    const currentTemp = parseInt(tempSlider.value, 10);

    if (isStirring) stirPower = Math.min(stirPower + dt * 2, 1);
    else stirPower = Math.max(stirPower - dt * 2, 0);

    const tempMultiplier = 0.2 + (currentTemp / 100) * 3.3;

    for(const p of particles){
      // Mouvement Brownien
      const diffSpeed = baseDiffusion * p.c.diffRate * tempMultiplier;
      p.vx += randn() * diffSpeed * dt;
      p.vy += randn() * diffSpeed * dt;

      // Gravité
      p.vy += p.c.driftDown * (1 - stirPower * 0.8) * dt;

      // Vortex (convection forcée)
      if (stirPower > 0) {
        const distToCenter = p.x - centerX;
        p.vx += -distToCenter * 3 * stirPower * dt;

        const normalizedDist = Math.abs(distToCenter) / (W/2);
        if (normalizedDist < 0.3) {
          p.vy += 180 * stirPower * dt;
        } else {
          p.vy -= 100 * stirPower * dt;
        }

        p.vx += Math.sin(p.y * 0.05 + now * 0.01) * 150 * stirPower * dt;
      }

      // Friction
      const damp = (stirPower > 0) ? 0.96 : 0.92;
      p.vx *= damp;
      p.vy *= damp;

      p.x += p.vx;
      p.y += p.vy;

      // Collisions
      if(p.x < wr.x + 5){ p.x = wr.x + 5; p.vx *= -0.5; }
      if(p.x > wr.x + wr.w - 5){ p.x = wr.x + wr.w - 5; p.vx *= -0.5; }
      if(p.y < wr.y + 2){ p.y = wr.y + 2; p.vy *= -0.5; }
      if(p.y > wr.y + wr.h - 8){ p.y = wr.y + wr.h - 8; p.vy *= -0.2; }
    }

    // --- DESSIN ---
    ctx.clearRect(0,0,W,H);

    // Clip dans l'eau
    ctx.save();
    ctx.beginPath();

    if (stirPower > 0) {
      const vortexDepth = 30 * stirPower;
      ctx.moveTo(wr.x, wr.y + vortexDepth);
      ctx.quadraticCurveTo(centerX, wr.y + vortexDepth * 3, wr.x + wr.w, wr.y + vortexDepth);
      ctx.lineTo(wr.x + wr.w, wr.y + wr.h);
      ctx.lineTo(wr.x, wr.y + wr.h);
    } else {
      ctx.rect(wr.x, wr.y, wr.w, wr.h);
    }

    ctx.closePath();
    ctx.clip();

    for(const p of particles){
      const r = (isStirring ? 2.5 : 3.0) * DPR;
      ctx.fillStyle = `rgba(${p.c.r}, ${p.c.g}, ${p.c.b}, ${p.a})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, TAU);
      ctx.fill();
    }

    ctx.restore();
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
});