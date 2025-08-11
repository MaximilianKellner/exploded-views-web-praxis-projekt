import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class CameraHandler {
    constructor(config) {
        this.config = config;
        this.camera = null;
        this.controls = null;
    }
    
    initialize(renderer) {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.fromArray(this.config.sceneConfig.camera.position);

        // Steuerung
        this.controls = new OrbitControls(this.camera, renderer.domElement);
        this.controls.target.fromArray(this.config.sceneConfig.camera.lookAt);
        this.controls.enableDamping = true;
        this.controls.minDistance = this.config.sceneConfig.camera.minDistance;
        this.controls.maxDistance = this.config.sceneConfig.camera.maxDistance;

        // Resize Handler
        window.addEventListener('resize', this.handleResize.bind(this));

    }

    // Fenster-Resize-Handler
    handleResize() {
        if (this.camera) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        }
    }

    // Getter für Zugriff auf die Kamera
    getCamera() {
        return this.camera;
    }
    
    // Getter für Zugriff auf Controls
    getControls() {
        return this.controls;
    }

    update() {
        if (this.controls) {
            this.controls.update();
        }
    }
}