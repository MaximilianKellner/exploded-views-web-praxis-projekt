import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { animate } from 'animejs';

export class CameraHandler {
    constructor(config, container) {
        this.config = config;
        this.container = container;
        this.camera = null;
        this.controls = null;
        this.renderer = null;
    }
    
    initialize(renderer) {

        this.renderer = renderer
        //Kamera
        this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.camera.position.fromArray(this.config.sceneConfig.camera.position);

        this.camera.position.z = 80

        // Steuerung
        this.controls = new OrbitControls(this.camera, renderer.domElement);
        this.controls.target.fromArray(this.config.sceneConfig.camera.lookAt);
        this.controls.enableDamping = true;
        this.controls.minDistance = this.config.sceneConfig.camera.minDistance;
        this.controls.maxDistance = this.config.sceneConfig.camera.maxDistance;
        this.controls.enableZoom  = !this.config.animationConfig.allowScrollAnimation;

        this.controls.zoomSpeed = 1.5; // Standardwert: 1.0
        this.controls.rotateSpeed = 1.1; // Standardwert: 1.0
        this.controls.dampingFactor = 0.075; // Höherer Wert = weniger Nachschwingen

        this.updateLocks();
    }

    updateLocks() {
        // Vertikale Sperre
        if (this.config.sceneConfig.camera.lockVertical) {
            const currentPolarAngle = this.controls.getPolarAngle();
            this.controls.minPolarAngle = currentPolarAngle;
            this.controls.maxPolarAngle = currentPolarAngle;
        } else {
            this.controls.minPolarAngle = 0;
            this.controls.maxPolarAngle = Math.PI;
        }

        // Horizontale Sperre
        if (this.config.sceneConfig.camera.lockHorizontal) {
            const currentAzimuthAngle = this.controls.getAzimuthalAngle();
            this.controls.minAzimuthAngle = currentAzimuthAngle;
            this.controls.maxAzimuthAngle = currentAzimuthAngle;
        } else {
            this.controls.minAzimuthAngle = -Infinity;
            this.controls.maxAzimuthAngle = Infinity;
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

    resize(width, height) {
        if (this.camera) {
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        }
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
                //onUpdate: () => {
                //    console.log("CAMERA ANIMATION IN PROGRESS")
                //},
                onComplete: () => {
                    //console.log(" --- FINISHED CAMERA ANIMATION ---")
                    if (this.controls) {
                        this.controls.maxDistance = originalMaxDistance;
                    }                }
            }
        )

    }

    update() {
        if (this.controls) {
            this.controls.update();
        }
    }

    destroy() {
        if (this.controls) {
            this.controls.dispose();
        }
        this.config = null;
        this.container = null;
        this.camera = null;
        this.controls = null;
        this.renderer = null;
    }
}