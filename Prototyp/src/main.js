import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { initTweakpane } from './modules/UiHandler.js';

let scene, camera, renderer, controls;
const lights = {}; // Objekt zum Speichern der erstellten Lichter

async function init() {
    // 1. Konfiguration laden
    const response = await fetch('/scene-config.json');
    const config = await response.json();

    // 2. Szene einrichten
    scene = new THREE.Scene();
    scene.background = new THREE.Color(parseInt(config.sceneConfig.backgroundColor));

    // 3. Renderer einrichten
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // 4. Kamera einrichten
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.fromArray(config.sceneConfig.camera.position);

    // 5. Lichter basierend auf der Konfiguration erstellen
    setupLights(config.sceneConfig.lights);

    // 6. Steuerung
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.fromArray(config.sceneConfig.camera.lookAt);
    controls.enableDamping = true;

    // 7. Tweakpane UI initialisieren
    initTweakpane(config, lights, scene);

    // Resize Handler
    window.addEventListener('resize', onWindowResize);

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