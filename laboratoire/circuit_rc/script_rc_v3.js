document.addEventListener('DOMContentLoaded', () => {
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
    const modePill = document.getElementById('mode-pill');

    const mathCharge = document.getElementById('math-charge');
    const mathDischarge = document.getElementById('math-discharge');

    const plateTop = document.getElementById('plate-top');
    const plateBottom = document.getElementById('plate-bottom');

    const timeDisplay = document.getElementById('time-display');
    const regimeTransitoire = document.querySelector('.regime-transitoire');

    const canvas = document.getElementById('graphCanvas');
    const ctx = canvas.getContext('2d');

    let E = 5;
    let R = 10000;
    let C = 0.0001;
    let tau = R * C;

    let mode = 'charge';
    let time = 0;
    let uc = 0;
    let ucInitial = 0;

    let W = 0, H = 0, DPR = 1;
    let MAX_TIME = 8;

    function cssVar(name, fallback) {
        const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        return value || fallback;
    }

    function palette() {
        return {
            textMain: cssVar('--text-main', '#e2e8f0'),
            textMuted: cssVar('--text-muted', '#94a3b8'),
            primary: cssVar('--primary', '#60a5fa'),
            cardBorder: cssVar('--card-border', 'rgba(148,163,184,.18)'),
            charge: '#ec4899',
            discharge: '#8b5cf6',
            transitoire: 'rgba(236,72,153,0.10)',
            stationnaire: 'rgba(16,185,129,0.08)',
            grid: 'rgba(148,163,184,0.14)',
            axis: 'rgba(226,232,240,0.85)',
            guide: 'rgba(148,163,184,0.45)',
            fillCharge: 'rgba(236,72,153,0.16)',
            fillDischarge: 'rgba(139,92,246,0.16)',
            tau: '#f59e0b',
            fiveTau: '#34d399'
        };
    }

    function resize() {
        const rect = canvas.getBoundingClientRect();
        DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
        W = rect.width;
        H = rect.height;
        canvas.width = Math.round(W * DPR);
        canvas.height = Math.round(H * DPR);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(DPR, DPR);
        updateRegimeBackground();
    }

    window.addEventListener('resize', resize);

    function updateValues() {
        E = parseFloat(sliderE.value);
        R = parseFloat(sliderR.value) * 1000;
        C = parseFloat(sliderC.value) * 0.000001;
        tau = R * C;

        valE.innerText = E;
        valR.innerText = sliderR.value;
        valC.innerText = sliderC.value;
        valTau.innerText = tau.toFixed(2) + ' s';

        MAX_TIME = 8 * tau;
        updateRegimeBackground();
    }

    function updateRegimeBackground() {
        if (!W) return;
        const percentTransitoire = ((5 * tau) / MAX_TIME) * 100;
        regimeTransitoire.style.width = Math.min(percentTransitoire, 100) + '%';
    }

    function setMode(newMode) {
        if (mode === newMode) return;
        mode = newMode;
        ucInitial = uc;
        time = 0;

        const isCharge = mode === 'charge';

        btnCharge.classList.toggle('btn-primary', isCharge);
        btnCharge.classList.toggle('btn-secondary', !isCharge);
        btnDischarge.classList.toggle('btn-primary', !isCharge);
        btnDischarge.classList.toggle('btn-secondary', isCharge);

        if (isCharge) {
            switchBlade.setAttribute('x2', '150');
            switchBlade.setAttribute('y2', '80');
            switchBlade.style.stroke = '#ef4444';
            mathCharge.style.display = 'block';
            mathDischarge.style.display = 'none';
            modePill.textContent = 'Mode : charge';
            modePill.style.background = 'rgba(236,72,153,0.12)';
            modePill.style.borderColor = 'rgba(236,72,153,0.24)';
        } else {
            switchBlade.setAttribute('x2', '150');
            switchBlade.setAttribute('y2', '160');
            switchBlade.style.stroke = '#8b5cf6';
            mathCharge.style.display = 'none';
            mathDischarge.style.display = 'block';
            modePill.textContent = 'Mode : décharge';
            modePill.style.background = 'rgba(139,92,246,0.12)';
            modePill.style.borderColor = 'rgba(139,92,246,0.24)';
        }
    }

    sliderE.addEventListener('input', updateValues);
    sliderR.addEventListener('input', updateValues);
    sliderC.addEventListener('input', updateValues);

    btnCharge.addEventListener('click', () => setMode('charge'));
    btnDischarge.addEventListener('click', () => setMode('discharge'));

    function updateCapacitorCharges() {
        const ratio = Math.max(0, Math.min(1, uc / 12));
        const nbCharges = Math.round(ratio * 16);

        plateTop.innerHTML = '';
        plateBottom.innerHTML = '';

        for (let i = 0; i < nbCharges; i++) {
            plateTop.innerHTML += '<span class="charge-plus">+</span>';
            plateBottom.innerHTML += '<span class="charge-minus">−</span>';
        }
    }

    function tensionAt(tx) {
        if (mode === 'charge') {
            return ucInitial + (E - ucInitial) * (1 - Math.exp(-tx / tau));
        }
        return ucInitial * Math.exp(-tx / tau);
    }

    function drawGraph() {
        const colors = palette();
        ctx.clearRect(0, 0, W, H);

        const paddingLeft = 66;
        const paddingRight = 22;
        const paddingTop = 54;
        const paddingBottom = 44;
        const graphW = W - paddingLeft - paddingRight;
        const graphH = H - paddingTop - paddingBottom;

        const yMax = Math.max(12, E * 1.15);
        const curveColor = mode === 'charge' ? colors.charge : colors.discharge;
        const fillColor = mode === 'charge' ? colors.fillCharge : colors.fillDischarge;

        const mapX = (tVal) => paddingLeft + (tVal / MAX_TIME) * graphW;
        const mapY = (uVal) => paddingTop + graphH - (uVal / yMax) * graphH;

        // grid
        ctx.strokeStyle = colors.grid;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i <= 6; i++) {
            const y = paddingTop + (graphH / 6) * i;
            ctx.moveTo(paddingLeft, y);
            ctx.lineTo(W - paddingRight, y);
        }
        for (let i = 0; i <= 8; i++) {
            const x = paddingLeft + (graphW / 8) * i;
            ctx.moveTo(x, paddingTop);
            ctx.lineTo(x, H - paddingBottom);
        }
        ctx.stroke();

        // axes
        ctx.strokeStyle = colors.axis;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(paddingLeft, paddingTop);
        ctx.lineTo(paddingLeft, H - paddingBottom);
        ctx.lineTo(W - paddingRight, H - paddingBottom);
        ctx.stroke();

        // labels
        ctx.fillStyle = colors.textMuted;
        ctx.font = '12px Inter, Arial, sans-serif';
        ctx.save();
        ctx.translate(18, paddingTop + graphH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText('u_C (V)', 0, 0);
        ctx.restore();
        ctx.textAlign = 'left';
        ctx.fillText('t (s)', W - 40, H - 12);

        // y ticks
        for (let vTick = 0; vTick <= yMax + 0.001; vTick += yMax / 6) {
            const y = mapY(vTick);
            ctx.fillStyle = colors.textMuted;
            ctx.fillText(vTick.toFixed(vTick === 0 || vTick >= 10 ? 0 : 1), 18, y + 4);
        }

        // tau and 5tau markers
        const xTau = mapX(tau);
        const x5Tau = mapX(5 * tau);

        ctx.save();
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = colors.tau;
        ctx.beginPath();
        ctx.moveTo(xTau, paddingTop);
        ctx.lineTo(xTau, H - paddingBottom);
        ctx.stroke();

        ctx.strokeStyle = colors.fiveTau;
        ctx.beginPath();
        ctx.moveTo(x5Tau, paddingTop);
        ctx.lineTo(x5Tau, H - paddingBottom);
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = colors.tau;
        ctx.font = 'bold 12px Inter, Arial, sans-serif';
        ctx.fillText('τ', xTau - 4, H - 18);
        ctx.fillStyle = colors.fiveTau;
        ctx.fillText('5τ', x5Tau - 8, H - 18);

        // reference E line
        const yE = mapY(E);
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(96,165,250,0.45)';
        ctx.beginPath();
        ctx.moveTo(paddingLeft, yE);
        ctx.lineTo(W - paddingRight, yE);
        ctx.stroke();
        ctx.restore();
        ctx.fillStyle = 'rgba(96,165,250,0.95)';
        ctx.fillText('E', W - paddingRight - 16, yE - 8);

        // curve fill
        ctx.beginPath();
        ctx.moveTo(mapX(0), mapY(tensionAt(0)));
        for (let tx = 0; tx <= time; tx += MAX_TIME / 320) {
            ctx.lineTo(mapX(tx), mapY(tensionAt(tx)));
        }
        ctx.lineTo(mapX(Math.min(time, MAX_TIME)), H - paddingBottom);
        ctx.lineTo(mapX(0), H - paddingBottom);
        ctx.closePath();
        ctx.fillStyle = fillColor;
        ctx.fill();

        // curve
        ctx.beginPath();
        for (let tx = 0; tx <= time; tx += MAX_TIME / 320) {
            const px = mapX(tx);
            const py = mapY(tensionAt(tx));
            if (tx === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = curveColor;
        ctx.lineWidth = 3;
        ctx.stroke();

        const currentX = mapX(time);
        const currentY = mapY(uc);

        if (time <= MAX_TIME) {
            ctx.save();
            ctx.setLineDash([4, 4]);
            ctx.strokeStyle = colors.guide;
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.moveTo(currentX, H - paddingBottom);
            ctx.lineTo(currentX, currentY);
            ctx.moveTo(paddingLeft, currentY);
            ctx.lineTo(currentX, currentY);
            ctx.stroke();
            ctx.restore();

            ctx.fillStyle = curveColor;
            ctx.font = 'bold 12px Inter, Arial, sans-serif';
            const labelY = Math.max(paddingTop + 14, Math.min(H - paddingBottom - 8, currentY - 10));
            ctx.fillText(uc.toFixed(2) + ' V', 18, labelY);

            ctx.beginPath();
            ctx.arc(currentX, currentY, 6, 0, 2 * Math.PI);
            ctx.fillStyle = curveColor;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    let lastFrame = performance.now();

    function animate(now) {
        const dt = (now - lastFrame) / 1000;
        lastFrame = now;

        const simSpeed = MAX_TIME / 8;
        time += dt * simSpeed;
        if (time > MAX_TIME) time = MAX_TIME;

        uc = tensionAt(time);

        timeDisplay.innerText = time.toFixed(2);
        updateCapacitorCharges();
        drawGraph();

        requestAnimationFrame(animate);
    }

    setTimeout(() => {
        resize();
        updateValues();
        lastFrame = performance.now();
        animate(performance.now());
    }, 120);
});
