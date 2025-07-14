import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { initTweakpane } from './ui-Handler.js';

// --- Globale Variablen ---
const lights = {}; // Objekt zum Speichern der erstellten Lichter
let scene, camera, renderer, controls;
let model; // Das geladene Hauptmodell

async function init() {
    // Konfiguration laden
    const response = await fetch('/scene-config.json');
    const config = await response.json();

    // Szene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(parseInt(config.sceneConfig.backgroundColor));

    // Kamera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.fromArray(config.sceneConfig.camera.position);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // Lichter basierend auf der Konfiguration erstellen
    setupLights(config.sceneConfig.lights);

    // Steuerung
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.fromArray(config.sceneConfig.camera.lookAt);
    controls.enableDamping = true;
    controls.minDistance = 1;
    controls.maxDistance = 25;

    // 7. Tweakpane UI initialisieren
    initTweakpane(config, lights, scene, camera, controls);

    // Resize Handler
    window.addEventListener('resize', onWindowResize);

    // Modell laden
    loadModel();

    // Animationsloop starten
    animate();
}

function setupLights(lightsConfig) {
    for (const lightName in lightsConfig) {
        const config = lightsConfig[lightName];
        if (!config.enabled) continue;

        let light;
        switch (config.type) {
            case 'ambient':
                light = new THREE.AmbientLight(config.color, config.intensity);
                break;
            case 'directional':
                light = new THREE.DirectionalLight(config.color, config.intensity);
                light.position.set(config.position.x, config.position.y, config.position.z);
                break;
            // Hier könnten weitere Lichttypen hinzugefügt werden
        }

        if (light) {
            lights[lightName] = light; // Licht im globalen Objekt speichern
            scene.add(light);
        }
    }
}

// --- Modell laden und verarbeiten ---
function loadModel() {
    const loader = new GLTFLoader();
    loader.load(
        '/layer-test-911.glb', // Pfad zum .glb Modell 
        function (gltf) {
            model = gltf.scene;
            scene.add(model);
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

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

init();