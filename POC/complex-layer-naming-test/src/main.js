import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'; // Für Kamerasteuerung

// --- Globale Variablen ---
let scene, camera, renderer, controls;
let model; // Das geladene Hauptmodell
const explodableObjects = []; // Array für alle 'exp-' Objekte
let globalExplosionDirection = new THREE.Vector3(0, 1, 0); // Fallback
const baseDistancePerLevel = 0.5; // Anpassen, wie weit sich Ebenen voneinander entfernen
let explosionFactor = 0;

// HTML-Elemente
const explosionSlider = document.getElementById('explosionSlider');
const explosionValueDisplay = document.getElementById('explosionValue');

// --- Initialisierung ---
function init() {
    // Szene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x333333);

    // Kamera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(2, 2, 5); // Position anpassen

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // Licht
    const ambientLight = new THREE.AmbientLight(0xffffff, 3.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 3.8);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Grid
    //const size = 10; // Die Gesamtgröße des Gitters
    //const divisions = 10; // Die Anzahl der Unterteilungen
    //const gridHelper = new THREE.GridHelper(size, divisions);
    //scene.add(gridHelper);

    // Steuerung
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 1;
    controls.maxDistance = 25;
    
    // Modell laden
    loadModel();

    // Event Listener für Slider
    explosionSlider.addEventListener('input', (event) => {
        explosionFactor = parseFloat(event.target.value);
        explosionValueDisplay.textContent = explosionFactor.toFixed(2);
        applyExplosion();
    });

    // Fenster-Resize-Handler
    window.addEventListener('resize', onWindowResize, false);

    // Animationsloop starten
    animate();
}

// --- Modell laden und verarbeiten ---
function loadModel() {
    const loader = new GLTFLoader();
    loader.load(
        '/layer-test.glb', // Pfad zum .glb Modell 
        function (gltf) {
            model = gltf.scene;
            scene.add(model);
            parseModelForExplosion();
            applyExplosion(); // Initiale Position (unexplodiert)
        },
        // onProgress callback (optional)
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        // onError callback
        function (error) {
            console.error('Ein Fehler ist beim Laden des Modells aufgetreten:', error);
        }
    );
}

// --- Modell parsen und Objekte für Explosion vorbereiten ---
function parseModelForExplosion() {
    if (!model) return;

    explodableObjects.length = 0;
    console.log('Starte Modell-Parsing für Explosion...');

    model.traverse(function (child) {
        // Logge jedes durchlaufene Kind, um zu sehen, ob das problematische Objekt überhaupt erreicht wird
        console.log('Traversing child:', child.name, 'Is Mesh:', child.isMesh);

        // child.isMesh abfrage lässt manche Objekte nicht animiert werden. Abhängig vom Material in Blender. --> Is Mesh: undefined
        if (child.name.startsWith('exp-')) {
            console.log('Potenziell explodierbares Objekt gefunden:', child.name);
            const nameParts = child.name.split('-');
            let level = 0;
            let objectSpecificDirection = null; // Wird aus dem Namen gelesen

            for (const part of nameParts) {
                if (part.startsWith('L') && !isNaN(parseInt(part.substring(1)))) {
                    level = parseInt(part.substring(1));
                    console.log(`Gefundenes Level für ${child.name}: ${level}`);
                } else if (part.startsWith('dir')) { // Richtung aus dem Namen lesen
                    if (part === 'dirXPOS') objectSpecificDirection = new THREE.Vector3(1, 0, 0);
                    else if (part === 'dirXNEG') objectSpecificDirection = new THREE.Vector3(-1, 0, 0);
                    else if (part === 'dirYPOS') objectSpecificDirection = new THREE.Vector3(0, 1, 0);
                    else if (part === 'dirYNEG') objectSpecificDirection = new THREE.Vector3(0, -1, 0);
                    else if (part === 'dirZPOS') objectSpecificDirection = new THREE.Vector3(0, 0, 1);
                    else if (part === 'dirZNEG') objectSpecificDirection = new THREE.Vector3(0, 0, -1);
                    console.log(`Gefundene Richtung für ${child.name}: ${part}`);
                }
            }

            if (level > 0) {
                explodableObjects.push({
                    object: child,
                    originalPosition: child.position.clone(),
                    level: level,
                    directionCode: objectSpecificDirection
                });
                console.log(`Objekt ${child.name} zu explodableObjects hinzugefügt.`);
            } else {
                console.warn(`Objekt ${child.name} hat Level 0 oder kleiner und wird nicht hinzugefügt.`);
            }
        }
    });
    console.log('Explodable objects:', explodableObjects);
}

// --- Explosionslogik anwenden ---
function applyExplosion() {
    explodableObjects.forEach(item => {
        let explosionDirection = new THREE.Vector3(); // Wird für dieses Objekt bestimmt

        if (item.directionCode) {
            // Falls eine Richtung im Namen definiert wurde (z.B. dirXPOS) wird diese verwendet
            explosionDirection.copy(item.directionCode);
        } else {
            // Fallback, wenn keine spezifische Vektor-Richtung (dirXPOS, etc.) im Namen des Objekts definiert wurde
            explosionDirection.copy(globalExplosionDirection);
            console.warn(`Objekt ${item.object.name} hat keine spezifische Vektor-Richtung im Namen definiert. Fallback auf globale Richtung:`, globalExplosionDirection);
        }

        const distance = item.level * baseDistancePerLevel * explosionFactor;
        // - 'item.level': Die Ebene des Objekts (z.B. L1, L2). Höhere Ebenen bewegen sich weiter.
        // - 'baseDistancePerLevel': Ein festgelegter Grundabstand pro Ebene.
        // - 'explosionFactor': Der aktuelle Wert des Sliders (zwischen 0 und 1).

        // Berechnung der neuen Position und Anwendung
        const newPosition = new THREE.Vector3()
            .copy(item.originalPosition)
            .addScaledVector(explosionDirection, distance);
        item.object.position.copy(newPosition);
    });
}

// --- Animationsloop ---
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Nur wenn enableDamping = true
    renderer.render(scene, camera);
}

// --- Hilfsfunktionen ---
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// --- Start ---
init();