import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { initTweakpane } from './modules/ui-Handler.js';
import { setupLights } from './scene/lights.js';
import { AnimationHandler } from './modules/animation-handler.js';
import { ClickHandler } from './modules/click-handler.js';
import { CardHandler } from './modules/card-handler.js';


// --- Globale Variablen ---
const modelPath = '/layer-test-911.glb'; // Pfad zum .glb Modell
const explosionConfigPath = '/911-exp-config.json'; // Pfad zur Explosions-Konfiguration

const lights = {}; // Objekt zum Speichern der erstellten Lichter
let scene, camera, renderer, controls;
let model;
let animationHandler;
let clickHandler;
let cardHandler;
let config;

async function init() {
    // Konfiguration laden
    const response = await fetch('/scene-config.json');
    config = await response.json();

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
    
    // Canvas-Stil anpassen, um Drag-Probleme zu vermeiden
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.outline = 'none';

    // Lichter basierend auf der Konfiguration erstellen
    setupLights(config.sceneConfig.lights, scene, lights);

    // Steuerung
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.fromArray(config.sceneConfig.camera.lookAt);
    controls.enableDamping = true;
    controls.minDistance = config.sceneConfig.camera.minDistance;
    controls.maxDistance = config.sceneConfig.camera.maxDistance;
    
    // Browser-Standardverhalten für Drag-Events verhindern
    renderer.domElement.addEventListener('pointerdown', (event) => {
        event.preventDefault();
    });
    
    // Verhindern, dass die gesamte Seite sich bewegt, wenn über dem Canvas gezogen wird
    renderer.domElement.style.touchAction = 'none';

    // Tweakpane UI initialisieren
    initTweakpane(config, lights, scene, camera, controls);

    // AnimationHandler initialisieren
    animationHandler = new AnimationHandler(scene, config.animationConfig);

    // CardHandler initialisieren
    cardHandler = new CardHandler(scene)

    // Clickhandler initialisieren
    clickHandler = new ClickHandler(camera, scene, cardHandler)

    // Resize Handler
    window.addEventListener('resize', onWindowResize);

    // Modell laden
    loadModel();

    // Koordinatensystem hinzufügen
    loadCooridinatesystem();

    // Animationsloop starten
    animate();
}

// --- Modell laden und verarbeiten ---
async function loadModel() {
    const loader = new GLTFLoader();
    loader.load(
        modelPath, // Pfad zum .glb Modell 
        async function (gltf) {
            model = gltf.scene;
            scene.add(model);
            if (animationHandler) {
                // AnimationHandler mit dem geladenen Modell und der Config-URL initialisieren
                await animationHandler.initialize(model, explosionConfigPath);
            } else {
                console.error('AnimationHandler ist nicht initialisiert.');
            }
        },
        // onProgress callback
        function (xhr) {
            console.log('Model ' + (xhr.loaded / xhr.total * 100) + '% loaded');
        },
        // onError callback
        function (error) {
            console.error('Ein Fehler ist beim Laden des Modells aufgetreten:', error);
        }
    );
}

// --- Koordinatensystem laden ---
function loadCooridinatesystem() {
    const loader = new GLTFLoader();
    loader.load(
        '/coordinatesystem.glb', // Pfad zum Koordinatensystem Modell
        function (gltf) {
            const coordinateSystem = gltf.scene;
            coordinateSystem.name = 'Coordinatesystem';
            scene.add(coordinateSystem);
            coordinateSystem.visible = false; // Standardmäßig unsichtbar
        },
        function (xhr) {
            console.log('coordinatesystem ' + (xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.error('Ein Fehler ist beim Laden des Koordinatensystems aufgetreten:', error);
        }
    );
}

// --- Fenster-Resize-Handler ---
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// --- Animationsloop ---
function animate() {
    requestAnimationFrame(animate);
    controls.update();

    // Animation aktualisieren, falls der Handler existiert
    if (animationHandler) {
        animationHandler.updateExplosion();
    }
    renderer.render(scene, camera);
}

init();