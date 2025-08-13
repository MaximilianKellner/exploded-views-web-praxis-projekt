import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { animate } from 'animejs';

export class CameraHandler {
    constructor(config) {
        this.config = config;
        this.camera = null;
        this.controls = null;
    }
    
    initialize(renderer) {
        //Kamera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.fromArray(this.config.sceneConfig.camera.position);

        this.camera.position.z = 80

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
        if (this.camera && this.renderer) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
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

    animateCameraOnLoad() {
        // Zielposition aus der Konfiguration
        const targetPosition = this.config.sceneConfig.camera.position;

        const originalMaxDistance = this.controls.maxDistance
        this.controls.maxDistance = 9999;

        animate( this.camera.position,
            {
                z: targetPosition[2],
                ease: 'inOut(8)',
                duration: 600,
                onUpdate: () => {
                    console.log("CAMERA ANIMATION IN PROGRESS")
                },
                onComplete: () => {
                    console.log(" --- FINISHED CAMERA ANIMATION ---")
                    this.controls.maxDistance = originalMaxDistance;
                }
            }
        )

    }


    update() {
        if (this.controls) {
            this.controls.update();
        }
    }
}