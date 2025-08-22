import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { setupLights } from './scene/lights.js';
import { AnimationHandler } from './modules/animation-handler.js';
import { ClickHandler } from './modules/click-handler.js';
import { CardHandler } from './modules/card-handler.js';
import { CameraHandler } from './modules/camera-handler.js';
import { UIHandler } from './modules/ui-Handler.js';
import { StatsHandler } from './modules/ui-stats-handler.js';

// --- Globale Variablen ---
const sceneConfigPath = '/scene-config.json'
const modelPath = '/layer-test-911.glb'; // Pfad zum .glb Modell
const explosionConfigPath = '/911-exp-config.json'; // Pfad zur Explosions-Konfiguration
const cardDataPath = '/911-cards.json'// Pfad zu den Card Daten

const lights = {}; // Objekt zum Speichern der erstellten Lichter
let scene,camera, renderer, controls;
let model;
let config;
let cameraHandler;
let animationHandler;
let uiHandler;
let clickHandler;
let cardHandler;
let statsHandler;

let modelChildren = [];

async function init() {
    // Konfiguration laden
    const response = await fetch(sceneConfigPath);
    config = await response.json();

    // Szene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(config.sceneConfig.backgroundColor);
    // Kamera
    cameraHandler = new CameraHandler(config);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.fromArray(config.sceneConfig.camera.position);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);
    
    // Initialisiere den CameraHandler
    cameraHandler.initialize(renderer);
    camera = cameraHandler.getCamera();
    controls = cameraHandler.getControls();

    // Canvas-Stil anpassen, um Drag-Probleme zu vermeiden
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.outline = 'none';

    // Lichter basierend auf der Konfiguration erstellen
    setupLights(config.sceneConfig.lights, scene, lights);

    // Browser-Standardverhalten für Drag-Events verhindern
    renderer.domElement.addEventListener('pointerdown', (event) => {
        event.preventDefault();
    });
    
    // Verhindern, dass die gesamte Seite sich bewegt, wenn über dem Canvas gezogen wird
    renderer.domElement.style.touchAction = 'none';

    // AnimationHandler initialisieren
    animationHandler = new AnimationHandler(scene, config.animationConfig);

    // Handler für Tweakpane UI komponente
    uiHandler = new UIHandler();
    uiHandler.initialize(config, lights, scene, camera, controls);

    // CardHandler initialisieren
    cardHandler = new CardHandler()
    cardHandler.initialize(cardDataPath, config);

    // Clickhandler initialisieren
    clickHandler = new ClickHandler(camera, scene, cardHandler);
    clickHandler.initialize();
        
    // StatsHandler initialisieren
    statsHandler = new StatsHandler();

    // Modell laden
    loadModel();

    // Koordinatensystem hinzufügen
    loadCooridinatesystem();

    // Ladeanimation der Camera
    cameraHandler.animateCameraOnLoad();

    // Scroll-Listener initialisieren
    initScrollListener();

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

            //TODO: Designentscheidung --> Sollte man model.children statt model traverse und dann alle ergebnisse nutzen?
            console.log('model.children: ', model.children);
            modelChildren = model.children;
            clickHandler.modelChildren = modelChildren;

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
    
    /*
    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);

    // Einfachen Achsenhelfer hinzufügen
    //The X axis is red. The Y axis is green. The Z axis is blue. 
    const axesHelper = new THREE.AxesHelper(5); // Größe in Einheiten
    scene.add(axesHelper);
    */
   
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

// --- Initialisieren der Scrollanimation ---
function initScrollListener() {
    let explosionFactor = 0;
    
    // Event-Listener für scrollen auf der Seite
    renderer.domElement.addEventListener('wheel', (event) => {
        event.preventDefault();
        
        if(config.animationConfig.allowScrollAnimation === false){
            return;
        }

        explosionFactor = config.animationConfig.expFactor;

        // Explosionsfaktor anpassen
        explosionFactor += event.deltaY * 0.001; // Empfindlichkeit
        
        // Begrenzen des Faktors auf 0 bis 1 --> Auf und abrunden auf 0 bzw. 1
        explosionFactor = Math.min(Math.max(explosionFactor, 0), 1);
        
        //console.log('Scroll-Event:', event.deltaY, 'Explosion Factor:', explosionFactor);
        config.animationConfig.expFactor = explosionFactor;

        uiHandler.refreshAnimationFolder();
        
    }, { passive: false }); // passive: false --> wichtig für preventDefault()
}

// --- Animationsloop ---
function animate() {
    requestAnimationFrame(animate);
    controls.update();

    // Animation aktualisieren, falls der Handler existiert
    if (animationHandler) {
        animationHandler.updateExplosion();
    }

    // Stats aktualisieren, falls der Handler existiert
    if (statsHandler) {
        statsHandler.update();
    }
    
    renderer.render(scene, camera);
}

init();