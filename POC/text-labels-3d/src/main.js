import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { loadLabelData, assign3DLabelsToObjects, updateLabelPointerSide, labels } from './text-label-3d.js';
import { initUI } from './ui-handler.js';

// HTML-Elemente
const explosionSlider = document.getElementById('explosionSlider');
const explosionValueDisplay = document.getElementById('explosionValue');

// --- Globale Variablen ---
let scene, camera, renderer, controls;
let model; // Das geladene Hauptmodell
const explodableObjects = []; // Array für alle 'exp-' Objekte
const taggableObjects = []; // Array für alle Objekte, die ein Label haben können
let globalExplosionDirection = new THREE.Vector3(0, 1, 0); // Fallback
const baseDistancePerLevel = 0.5; // Anpassen, wie weit sich Ebenen voneinander entfernen
let explosionFactor = 0;
let lastClickedObject = null; // Für Klick-Interaktion
explosionSlider.value = 0.0 // reset Slider auf 0

// --- Interaktionsvariablen für Klick-Erkennung ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// --- Initialisierung ---
async function init() {
    // Szene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x343434);
    //scene.background = new THREE.Color(0xffffff);

    // Kamera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(2, 2, 5); // Position anpassen

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // Licht
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Steuerung
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 1;
    controls.maxDistance = 25;

    // Label-Daten laden (aus text-label.js)
    await loadLabelData('labels-911.json');

    // Modell laden
    loadModel();

    // Event Listener für Slider
    explosionSlider.addEventListener('input', (event) => {
        explosionFactor = parseFloat(event.target.value);
        explosionValueDisplay.textContent = explosionFactor.toFixed(2);
        applyExplosion();
    });

    // Event Listener für Klicks zum Anzeigen der Labels
    renderer.domElement.addEventListener('mousedown', onObjectClick, false);

    // Fenster-Resize-Handler
    window.addEventListener('resize', onWindowResize, false);

    // Animationsloop starten
    animate();
}

// --- Modell laden und verarbeiten ---
function loadModel() {
    const loader = new GLTFLoader();
    loader.load(
        '/layer-test-911.glb', // Pfad zum .glb Modell 
        function (gltf) {
            model = gltf.scene;
            scene.add(model);
            parseModelForExplosion();
            assign3DLabelsToObjects(taggableObjects); // 3D-Labels zuordnen
            initUI(labels); // UI initialisieren und Labels übergeben
            applyExplosion(); // Initiale Position (unexplodiert)
        },
        // onProgress callback
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

    model.traverse(function (child) {

        // Alle Objekte sammeln
        if (child.name.startsWith('tag-') || child.name.startsWith('exp-')) {
            taggableObjects.push({
                object: child,
            });
        }

        if (child.name.startsWith('exp-')) {
            const nameParts = child.name.split('-');
            let level = 0;
            let objectSpecificDirection = null; // Wird aus dem Namen gelesen

            for (const part of nameParts) {
                if (part.startsWith('L') && !isNaN(parseInt(part.substring(1)))) {
                    level = parseInt(part.substring(1));
                } else if (part.startsWith('dir')) { // Richtung aus dem Namen lesen
                    if (part === 'dirXPOS') objectSpecificDirection = new THREE.Vector3(1, 0, 0);
                    else if (part === 'dirXNEG') objectSpecificDirection = new THREE.Vector3(-1, 0, 0);
                    else if (part === 'dirYPOS') objectSpecificDirection = new THREE.Vector3(0, 1, 0);
                    else if (part === 'dirYNEG') objectSpecificDirection = new THREE.Vector3(0, -1, 0);
                    else if (part === 'dirZPOS') objectSpecificDirection = new THREE.Vector3(0, 0, 1);
                    else if (part === 'dirZNEG') objectSpecificDirection = new THREE.Vector3(0, 0, -1);
                }
            }

            if (level > 0) {
                explodableObjects.push({
                    object: child,
                    originalPosition: child.position.clone(),
                    level: level,
                    directionCode: objectSpecificDirection
                });
            }
        }
    });
    console.log('Explodable objects:', explodableObjects);
    console.log('All taggable objects:', taggableObjects);
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
        // - 'item.level': Die Ebene des Objekts (z.B. L1, L2). Höhere Ebenen bewegen sich weiter von der Origin weg.
        // - 'baseDistancePerLevel': Ein festgelegter Grundabstand pro Ebene.
        // - 'explosionFactor': Der aktuelle Wert des Sliders (zwischen 0 und 1).

        // Berechnung der neuen Position und Anwendung
        const newPosition = new THREE.Vector3()
            .copy(item.originalPosition)
            .addScaledVector(explosionDirection, distance);
        item.object.position.copy(newPosition);
    });
}

function hideAllLabels() {
    labels.forEach(label => {
        label.visible = false;
    });
    lastClickedObject = null;
}

function findTaggableParent(object) {
    let current = object;
    while (current) {
        if (taggableObjects.some(item => item.object === current)) {
            return current;
        }
        current = current.parent;
    }
    return null;
}

function onObjectClick(event) {
    event.preventDefault();

    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(taggableObjects.map(item => item.object), true);

    // Wenn kein Objekt getroffen wird, passiert nichts. Das Label bleibt offen.
    if (intersects.length === 0) {
        return;
    }

    const clickedObject = findTaggableParent(intersects[0].object);
    // Wenn kein zugehöriges, markierbares Objekt gefunden wird, passiert ebenfalls nichts.
    if (!clickedObject) {
        return;
    }

    const label = labels.find(l => l.parent === clickedObject);

    // Wenn dasselbe Objekt erneut geklickt wird, schalte das Label aus.
    if (lastClickedObject === clickedObject) {
        hideAllLabels();
    } else {
        // Andernfalls blende alle Labels aus und zeige nur das neue an.
        hideAllLabels();
        if (label) {
            label.visible = true;
        }
        lastClickedObject = clickedObject;
    }
}

// --- Animationsloop ---
function animate() {
    requestAnimationFrame(animate);
    controls.update();
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