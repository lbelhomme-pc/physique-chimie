document.addEventListener('DOMContentLoaded', () => {

    // --------- État du labo ----------
    const state = {
        water: 0,
        ethanol: 0,
        syrup: 0,
        oil: 0,
        saltAdded: 0,
        sugarAdded: 0,
        sand: 0,
        isShaking: false,
        dissolvedSalt: 0,
        dissolvedSugar: 0,
        excessSalt: 0,
        excessSugar: 0
    };

    // Constantes de volumes et solubilité
    const MAX_ML = 250;          
    const STEP_WATER = 50;
    const STEP_ETHANOL = 30;
    const STEP_SYRUP = 20;
    const STEP_OIL = 40;
    
    const STEP_SALT = 1;         
    const STEP_SUGAR = 1;
    const STEP_SAND = 5;         

    // Seule l'EAU dissout le sel et le sucre dans notre modèle 6ème !
    const SALT_SOLUBILITY = 5;   // Cuillères max pour 100% d'eau
    const SUGAR_SOLUBILITY = 8;

    // DOM
    const beaker = document.getElementById("beaker");
    const aqueousLayer = document.getElementById("aqueousLayer");
    const aqueousSurface = document.getElementById("aqueousSurface");
    const oilLayer = document.getElementById("oilLayer");
    const oilSurface = document.getElementById("oilSurface");
    const sediment = document.getElementById("sediment");
    
    const obs = document.getElementById("obs");
    const mixType = document.getElementById("mixType");
    const statusBox = document.getElementById("status-box");
    const logEl = document.getElementById("log");

    // Boutons
    const btn = (id) => document.getElementById(id);
    btn("addWater").addEventListener("click", () => { addLiquid('water', STEP_WATER, "d'eau 💧"); });
    btn("addEthanol").addEventListener("click", () => { addLiquid('ethanol', STEP_ETHANOL, "d'éthanol 🧪"); });
    btn("addSyrup").addEventListener("click", () => { addLiquid('syrup', STEP_SYRUP, "de sirop 🍷"); });
    btn("addOil").addEventListener("click", () => { addLiquid('oil', STEP_OIL, "d'huile 🟡"); });
    
    btn("addSalt").addEventListener("click", () => { addSolid('salt', STEP_SALT, "de sel 🧂"); });
    btn("addSugar").addEventListener("click", () => { addSolid('sugar', STEP_SUGAR, "de sucre 🍬"); });
    btn("addSand").addEventListener("click", () => { addSolid('sand', STEP_SAND, "de sable 🏖️"); });

    btn("stir").addEventListener("click", stir);
    btn("settle").addEventListener("click", settle);
    btn("decant").addEventListener("click", decant);
    btn("filter").addEventListener("click", filter);
    btn("reset").addEventListener("click", resetAll);

    // --------- Utilitaires ----------
    function nowTag() {
        const d = new Date();
        return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`;
    }

    function log(msg) {
        const p = document.createElement("p");
        p.innerHTML = `<span class="time">${nowTag()}</span> ${msg}`;
        logEl.prepend(p);
        if (logEl.children.length > 12) logEl.removeChild(logEl.lastChild);
    }

    // --------- Logique d'Ajout ----------
    function addLiquid(type, amount, name) {
        state[type] += amount;
        log(`Ajout de <b>${amount} mL ${name}</b>.`);
        recomputeSolubility();
        updateBeakerVisual();
    }

    function addSolid(type, amount, name) {
        if(type === 'salt') state.saltAdded += amount;
        if(type === 'sugar') state.sugarAdded += amount;
        if(type === 'sand') state.sand += amount;
        log(`Ajout de <b>${amount} dose(s) ${name}</b>.`);
        recomputeSolubility();
        updateBeakerVisual();
    }

    // Calcul mathématique de la solubilité
    function recomputeSolubility() {
        // Le sel et le sucre ne se dissolvent QUE grâce à l'eau !
        const waterFactor = Math.min(state.water / 100, 2); 
        
        const saltCap = Math.round(SALT_SOLUBILITY * waterFactor);
        const sugarCap = Math.round(SUGAR_SOLUBILITY * waterFactor);

        state.dissolvedSalt = Math.min(state.saltAdded, saltCap);
        state.dissolvedSugar = Math.min(state.sugarAdded, sugarCap);

        state.excessSalt = Math.max(0, state.saltAdded - saltCap);
        state.excessSugar = Math.max(0, state.sugarAdded - sugarCap);
    }

    // --------- Moteur Visuel ----------
    function updateBeakerVisual() {
        // La phase aqueuse regroupe Eau, Sirop et Ethanol (qui sont miscibles)
        const totalAq = state.water + state.syrup + state.ethanol;
        
        const pctAq = Math.min((totalAq / MAX_ML) * 100, 100);
        // L'huile se pose TOUJOURS au dessus de la phase aqueuse
        const pctOil = Math.min((state.oil / MAX_ML) * 100, 100 - pctAq);

        aqueousLayer.style.height = pctAq + '%';
        oilLayer.style.bottom = pctAq + '%';
        oilLayer.style.height = pctOil + '%';

        // Mélange des couleurs pour la phase aqueuse
        if (totalAq > 0) {
            // [Rouge, Vert, Bleu, Opacité]
            const wC = [59, 130, 246, 0.3];  // Eau (Bleue)
            const sC = [220, 38, 38, 0.7];   // Sirop (Rouge)
            const eC = [255, 255, 255, 0.1]; // Ethanol (Transparent)

            const r = Math.round((wC[0]*state.water + sC[0]*state.syrup + eC[0]*state.ethanol) / totalAq);
            const g = Math.round((wC[1]*state.water + sC[1]*state.syrup + eC[1]*state.ethanol) / totalAq);
            const b = Math.round((wC[2]*state.water + sC[2]*state.syrup + eC[2]*state.ethanol) / totalAq);
            const a = ((wC[3]*state.water + sC[3]*state.syrup + eC[3]*state.ethanol) / totalAq).toFixed(2);

            aqueousLayer.style.background = `rgba(${r}, ${g}, ${b}, ${a})`;
            aqueousSurface.style.background = `rgba(${r}, ${g}, ${b}, ${parseFloat(a) + 0.1})`;
        }

        // Sédiments au fond (Sable + Sel/Sucre qui n'a pas pu se dissoudre)
        const totalSediment = state.sand + (state.excessSalt * 3) + (state.excessSugar * 3);
        const sedH = Math.min((totalSediment / 100) * 20, 25); // Max 25% de hauteur
        sediment.style.height = sedH + '%';

        redrawSandGrains();
        updateUI();
    }

    function redrawSandGrains() {
        beaker.querySelectorAll(".grain").forEach(g => g.remove());
        const totalSolids = state.sand + state.excessSalt + state.excessSugar;
        if(totalSolids <= 0) return;

        const n = Math.min(totalSolids * 3, 100);
        for(let i=0; i<n; i++){
            const g = document.createElement("div");
            g.className = "grain";
            g.style.left = (15 + Math.random() * 70) + "%";
            g.style.bottom = (Math.random() * 15) + "px";
            
            // Si c'est du sel/sucre en excès, le grain est blanc/gris clair
            if (i > state.sand * 3) {
                g.style.background = "rgba(255,255,255,0.8)";
            }
            beaker.appendChild(g);
        }
    }

    function updateUI() {
        // Mise à jour de l'inventaire
        document.getElementById('chipWater').innerText = `💧 Eau: ${state.water} mL`;
        document.getElementById('chipEthanol').innerText = `🧪 Éthanol: ${state.ethanol} mL`;
        document.getElementById('chipSyrup').innerText = `🍷 Sirop: ${state.syrup} mL`;
        document.getElementById('chipOil').innerText = `🟡 Huile: ${state.oil} mL`;
        
        let dissolved = [];
        if(state.dissolvedSalt > 0) dissolved.push(`sel (${state.dissolvedSalt})`);
        if(state.dissolvedSugar > 0) dissolved.push(`sucre (${state.dissolvedSugar})`);
        document.getElementById('chipDissolved').innerText = `🧂 Dissous: ${dissolved.length ? dissolved.join(" + ") : "rien"}`;
        
        const solids = state.sand + state.excessSalt + state.excessSugar;
        document.getElementById('chipSolid').innerText = `🪨 Solides: ${solids}`;

        // Conclusions (Homogène / Hétérogène)
        const totalAq = state.water + state.syrup + state.ethanol;
        let typeStr = "—";
        let obsStr = "Ajoute une substance 👇";
        let statusClass = "neutral";

        if (totalAq === 0 && state.oil === 0 && solids === 0) {
            typeStr = "Bécher vide";
            obsStr = "Rien dans le bécher pour le moment.";
        } else {
            const hasOilAndWater = (state.oil > 0 && totalAq > 0);
            const hasSolids = (solids > 0);
            
            const isHetero = hasOilAndWater || hasSolids;
            typeStr = isHetero ? "Mélange Hétérogène" : "Mélange Homogène";
            statusClass = isHetero ? "heterogene" : "homogene";

            let reasons = [];
            if (hasOilAndWater) reasons.push("l'huile n'est pas miscible avec la phase aqueuse (2 couches)");
            if (state.sand > 0) reasons.push("le sable est insoluble (dépôt)");
            if ((state.excessSalt > 0 || state.excessSugar > 0) && state.water === 0) reasons.push("il n'y a pas d'eau pour dissoudre la poudre (dépôt)");
            else if (state.excessSalt > 0 || state.excessSugar > 0) reasons.push("l'eau est saturée, elle ne peut plus dissoudre de poudre (dépôt)");
            
            if (!isHetero) {
                if (totalAq > 0) reasons.push("les liquides sont miscibles et les poudres totalement dissoutes (aspect uniforme)");
                else reasons.push("le liquide est pur (aspect uniforme)");
            }

            obsStr = reasons.join(" ; ");
            obsStr = obsStr.charAt(0).toUpperCase() + obsStr.slice(1) + ".";
        }

        mixType.textContent = "Type : " + typeStr;
        obs.textContent = obsStr;
        statusBox.className = `status-box ${statusClass}`;
    }

    // --------- Actions ----------
    function stir() {
        if(state.isShaking) return;
        state.isShaking = true;
        log("Agitation vigoureuse 🌀");

        // Web Animations API : fluide et protégé contre le CSS global
        const sloshAnim = [
            { transform: 'translateX(-3px) rotate(-1deg)' },
            { transform: 'translateX(3px) rotate(1deg)' },
            { transform: 'translateX(-3px) rotate(-1deg)' }
        ];
        const sloshTiming = { duration: 300, iterations: 5, easing: 'ease-in-out' };

        aqueousSurface.animate(sloshAnim, sloshTiming);
        oilSurface.animate(sloshAnim, sloshTiming);

        // Bulles aléatoires
        const bubbles = [];
        for(let i=0; i<12; i++){
            const b = document.createElement("div");
            b.className = "bubble";
            b.style.left = (15 + Math.random() * 70) + "%";
            b.style.bottom = (10 + Math.random() * 30) + "px";
            b.style.animationDelay = (Math.random() * 0.4) + "s";
            beaker.appendChild(b);
            bubbles.push(b);
        }

        setTimeout(() => {
            bubbles.forEach(b => b.remove());
            state.isShaking = false;
            log("Fin de l'agitation.");
        }, 1500);
    }

    function settle() {
        log("Repos 🕒 : Les liquides non miscibles se séparent bien nettement.");
        updateBeakerVisual();
    }

    function decant() {
        if(state.oil <= 0){
            log("Décantation inutile : il n'y a pas de couche d'huile au-dessus.");
            return;
        }
        log(`Décantation 🫗 : on verse doucement <b>${state.oil} mL d'huile</b> dans un autre récipient.`);
        state.oil = 0;
        updateBeakerVisual();
    }

    function filter() {
        const totalSolids = state.sand + state.excessSalt + state.excessSugar;
        if(totalSolids <= 0){
            log("Filtration inutile : il n'y a aucun sédiment solide au fond.");
            return;
        }
        log("Filtration 🧻 : Le filtre en papier retient tous les solides au fond.");
        state.sand = 0;
        state.saltAdded = state.dissolvedSalt; 
        state.sugarAdded = state.dissolvedSugar;
        recomputeSolubility();
        updateBeakerVisual();
    }

    function resetAll() {
        Object.assign(state, {
            water: 0, ethanol: 0, syrup: 0, oil: 0, 
            saltAdded: 0, sugarAdded: 0, sand: 0,
            dissolvedSalt: 0, dissolvedSugar: 0, excessSalt: 0, excessSugar: 0
        });
        log("Bécher vidé et nettoyé 🧽");
        updateBeakerVisual();
    }

    // Init
    updateBeakerVisual();
});