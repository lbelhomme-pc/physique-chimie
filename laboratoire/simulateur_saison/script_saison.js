// =========================================================
// 1. INITIALISATION DE LA SCÈNE 3D
// =========================================================
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

let width = container.clientWidth;
let height = container.clientHeight;

const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
camera.position.set(0, 45, 90); 

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(width, height);
renderer.shadowMap.enabled = true; 
container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

window.addEventListener('resize', () => {
    width = container.clientWidth;
    height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});

// =========================================================
// 2. DÉCORS ET LUMIÈRES
// =========================================================
const starsGeometry = new THREE.BufferGeometry();
const starsCount = 1500;
const posArray = new Float32Array(starsCount * 3);
for(let i = 0; i < starsCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 400; 
}
starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const starsMaterial = new THREE.PointsMaterial({ size: 0.5, color: 0xffffff, transparent: true, opacity: 0.8 });
const starMesh = new THREE.Points(starsGeometry, starsMaterial);
scene.add(starMesh);

scene.add(new THREE.AmbientLight(0xffffff, 0.05));

// Le Soleil est placé à (0,0,0)
const sunLight = new THREE.PointLight(0xffeedd, 2, 500);
sunLight.position.set(0, 0, 0);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 1024;
sunLight.shadow.mapSize.height = 1024;
scene.add(sunLight);

const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xfacc15 }); 
const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sunMesh);

const glowMaterial = new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.3 });
const glowMesh = new THREE.Mesh(new THREE.SphereGeometry(6.5, 32, 32), glowMaterial);
scene.add(glowMesh);

// =========================================================
// 3. LA TERRE, L'ELLIPSE ET L'INCLINAISON EXAGÉRÉE
// =========================================================
// EXAGÉRATION : On utilise 35 degrés au lieu de 23.5 pour que l'effet visuel soit massif.
// L'inclinaison est négative pour orienter correctement les saisons par rapport au Soleil.
const baseTilt = -35 * (Math.PI / 180); 
let actualTilt = baseTilt; 
let targetTilt = baseTilt; 

const earthPivot = new THREE.Group();
scene.add(earthPivot);

const earthGeometry = new THREE.SphereGeometry(3, 64, 64);
const earthMaterial = new THREE.MeshPhongMaterial({ color: 0x2563eb, shininess: 25 });
const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
earthMesh.castShadow = true;
earthMesh.receiveShadow = true;
earthPivot.add(earthMesh);

const wireframeGeo = new THREE.WireframeGeometry(new THREE.SphereGeometry(3.02, 16, 16));
const wireframeMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 });
const wireframe = new THREE.LineSegments(wireframeGeo, wireframeMat);
earthPivot.add(wireframe);

// Axe Rouge
const axisMaterial = new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 3 });
const axisPoints = [ new THREE.Vector3(0, -7, 0), new THREE.Vector3(0, 7, 0) ];
const axisLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(axisPoints), axisMaterial);
earthPivot.add(axisLine);

// Équateur Blanc
const equatorMesh = new THREE.Mesh(
    new THREE.RingGeometry(3.05, 3.2, 64), 
    new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
);
equatorMesh.rotation.x = Math.PI / 2;
earthPivot.add(equatorMesh);

// CRÉATION DE L'ORBITE ELLIPTIQUE EXAGÉRÉE
// Le centre de l'ellipse est décalé (-10) pour que le Soleil (0,0) soit sur un foyer
const ellipseCurve = new THREE.EllipseCurve(-10, 0, 50, 40, 0, 2 * Math.PI, false, 0);
const ellipsePoints = ellipseCurve.getPoints(128);
const orbitGeo = new THREE.BufferGeometry().setFromPoints(ellipsePoints);
const orbitMat = new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.6 });
const orbitMesh = new THREE.Line(orbitGeo, orbitMat);
orbitMesh.rotation.x = Math.PI / 2;
scene.add(orbitMesh);

// =========================================================
// 4. INTERFACE HTML (CONTROLES ET PÉDAGOGIE)
// =========================================================
const slider = document.getElementById('month-slider');
const monthDisplay = document.getElementById('month-display');
const btnTilt = document.getElementById('tilt-toggle');
const btnText = document.getElementById('btn-text');

const dataDist = document.getElementById('data-distance');
const dataNorth = document.getElementById('data-north');
const dataSouth = document.getElementById('data-south');
const pedagoNote = document.getElementById('pedagogical-note');

const monthsInfo = [
    { name: "Janvier (Périhélie)", n: "❄️ Hiver", s: "☀️ Été", msg: "La Terre est <strong>TRÈS PROCHE</strong> du Soleil. Pourtant, c'est l'hiver au Nord car l'axe penche en arrière !" },
    { name: "Février", n: "❄️ Hiver", s: "☀️ Été", msg: "La distance commence à augmenter, mais le Nord reste penché en arrière." },
    { name: "Mars (Équinoxe)", n: "🌱 Printemps", s: "🍂 Automne", msg: "Les deux hémisphères reçoivent la lumière de façon égale !" },
    { name: "Avril", n: "🌱 Printemps", s: "🍂 Automne", msg: "Le pôle Nord commence à basculer doucement vers la lumière." },
    { name: "Mai", n: "🌱 Printemps", s: "🍂 Automne", msg: "Le pôle Nord continue de basculer vers la lumière." },
    { name: "Juin", n: "☀️ Été", s: "❄️ Hiver", msg: "L'hémisphère Nord penche fortement vers le Soleil : les jours s'allongent !" },
    { name: "Juillet (Aphélie)", n: "☀️ Été", s: "❄️ Hiver", msg: "La Terre est au point le plus <strong>ÉLOIGNÉ</strong> du Soleil. Pourtant, c'est l'été au Nord grâce à l'inclinaison !" },
    { name: "Août", n: "☀️ Été", s: "❄️ Hiver", msg: "La Terre commence à se rapprocher doucement." },
    { name: "Septembre (Équinoxe)", n: "🍂 Automne", s: "🌱 Printemps", msg: "Les deux hémisphères reçoivent la lumière de façon égale !" },
    { name: "Octobre", n: "🍂 Automne", s: "🌱 Printemps", msg: "Le pôle Nord commence à fuir la lumière du Soleil." },
    { name: "Novembre", n: "🍂 Automne", s: "🌱 Printemps", msg: "Le pôle Nord continue de fuir la lumière." },
    { name: "Décembre", n: "❄️ Hiver", s: "☀️ Été", msg: "L'hémisphère Nord est de nouveau dans l'ombre : nuits longues et froides." }
];

function getSeasonClass(seasonText) {
    if (seasonText.includes("Été")) return "season-summer";
    if (seasonText.includes("Hiver")) return "season-winter";
    return "season-spring";
}

function updateDashboard(monthIndex, distance) {
    const isTilted = Math.abs(targetTilt) > 0;
    
    // Gérer l'affichage de la distance
    if(distance < 45) {
        dataDist.innerHTML = "<span class='dist-close'>Très Proche (Périhélie)</span>";
    } else if(distance > 55) {
        dataDist.innerHTML = "<span class='dist-far'>Très Éloignée (Aphélie)</span>";
    } else {
        dataDist.innerHTML = "<span class='dist-mid'>Distance Moyenne</span>";
    }

    if (isTilted) {
        dataNorth.innerHTML = monthsInfo[monthIndex].n;
        dataSouth.innerHTML = monthsInfo[monthIndex].s;
        dataNorth.className = getSeasonClass(monthsInfo[monthIndex].n);
        dataSouth.className = getSeasonClass(monthsInfo[monthIndex].s);
        pedagoNote.innerHTML = `<strong>Analyse : </strong> ${monthsInfo[monthIndex].msg}`;
    } else {
        dataNorth.innerHTML = "Aucune saison";
        dataSouth.innerHTML = "Aucune saison";
        dataNorth.className = "season-none";
        dataSouth.className = "season-none";
        pedagoNote.innerHTML = "<span style='color:#ef4444'><strong>Expérience :</strong> Sans inclinaison, les saisons n'existent plus. Le fait d'être proche ou éloigné modifie très peu la température globale !</span>";
    }
}

function updateOrbitPosition() {
    const val = parseFloat(slider.value);
    
    // L'angle va de 0 (Janvier) à 2*PI (Retour à Janvier)
    const angle = (val / 12) * Math.PI * 2; 
    
    // Équation paramétrique de l'ellipse (Centre en -10 pour décentrer le Soleil)
    const earthX = -10 + Math.cos(angle) * 50;
    const earthZ = Math.sin(angle) * 40;
    
    earthPivot.position.x = earthX;
    earthPivot.position.z = earthZ;

    // Calcul de la distance Terre-Soleil (Pythagore par rapport à 0,0)
    const distance = Math.sqrt(earthX*earthX + earthZ*earthZ);

    const monthIndex = Math.floor(val);
    monthDisplay.innerText = monthsInfo[monthIndex].name;
    updateDashboard(monthIndex, distance);
}

slider.addEventListener('input', updateOrbitPosition);

btnTilt.addEventListener('click', () => {
    if (Math.abs(targetTilt) > 0) {
        targetTilt = 0; // Redresser
        btnTilt.classList.remove('btn-alert');
        btnTilt.classList.add('btn-success');
        btnText.innerText = "Réactiver l'inclinaison (35°)";
    } else {
        targetTilt = baseTilt; // Pencher
        btnTilt.classList.remove('btn-success');
        btnTilt.classList.add('btn-alert');
        btnText.innerText = "Désactiver l'inclinaison (35°)";
    }
    updateOrbitPosition(); 
});

// =========================================================
// 5. MOTEUR D'ANIMATION
// =========================================================
updateOrbitPosition(); 

function animate() {
    requestAnimationFrame(animate);
    
    earthMesh.rotation.y += 0.015;
    wireframe.rotation.y += 0.015;

    actualTilt += (targetTilt - actualTilt) * 0.05; 
    earthPivot.rotation.z = actualTilt;

    controls.update();
    renderer.render(scene, camera);
}

animate();