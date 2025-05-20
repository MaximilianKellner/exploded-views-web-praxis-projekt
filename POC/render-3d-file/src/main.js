import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// 1. Szene erstellen
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x707070);
const axesHelper = new THREE.AxesHelper(15); // Zahl --> Achslänge
scene.add(axesHelper);

// 2. Kamera erstellen
const FallbackCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
FallbackCamera.position.set(5, 2, 8);
FallbackCamera.rotation.set(0, 0.8, 0);

let camera = FallbackCamera;

// 3. Renderer erstellen und an den DOM anhängen
const renderer = new THREE.WebGLRenderer({ antialias: true });
const canvasContainer = document.getElementById('canvas-container');

if (canvasContainer) {
    canvasContainer.appendChild(renderer.domElement);
} else {
    document.body.appendChild(renderer.domElement);
    console.warn('Canvas-Container nicht gefunden. Renderer wurde dem Body hinzugefügt.');
}

// Kamera und Renderer init
updateCameraAndRenderer(camera, renderer, canvasContainer);


// 4. Licht hinzufügen
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// 5. GLTF-Loader zum Laden des Modells
const loader = new GLTFLoader();
let model;

loader.load(
    '/model.glb',
    (gltf) => {
        model = gltf.scene;
        scene.add(model);
        console.log('Modell geladen:', model);

        if (gltf.cameras && gltf.cameras.length > 0) {
            const blenderCam = gltf.cameras[0];
            // Blender-Kamera anpassen
            updateCameraAndRenderer(blenderCam, renderer, canvasContainer);
            camera = blenderCam; // Blender-Kamera als aktive Kamera setzen
            console.log('Blender-Kamera geladen und als aktive Kamera gesetzt:', camera);
        } else {
            console.log('Keine Kamera in der GLTF-Datei gefunden. Verwende Standardkamera (FallbackCamera).');
        }
        renderScene();
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% geladen');
    },
    (error) => {
        console.error('Fehler beim Laden des Modells:', error);
    }
);

// 6. Render-Funktion
function renderScene() {
    renderer.render(scene, camera); // rendern der Szene mit der aktiven Kamera
}

// 7. Auf Fenstergrößenänderung reagieren
window.addEventListener('resize', () => {
    updateCameraAndRenderer(camera, renderer, canvasContainer);
    if (model) {
        renderScene();
    }
});

// Hilfsfunktion zum Anpassen von Kamera und Renderer
function updateCameraAndRenderer(cameraToUpdate, rendererInstance, container) {
    let width, height;
    if (container && container.clientWidth && container.clientHeight) {
        width = container.clientWidth;
        height = container.clientHeight;
    } else {
        width = window.innerWidth;
        height = window.innerHeight;
    }

    cameraToUpdate.aspect = width / height;
    cameraToUpdate.updateProjectionMatrix();
    rendererInstance.setSize(width, height);
}