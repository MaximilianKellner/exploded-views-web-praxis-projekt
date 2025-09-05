import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { setupLights } from './scene/lights.js';
import { AnimationHandler } from './modules/animation-handler.js';
import { ClickHandler } from './modules/click-handler.js';
import { CardHandler } from './modules/card-handler.js';
import { CameraHandler } from './modules/camera-handler.js';
import { UIHandler } from './modules/ui-Handler.js';
import { StatsHandler } from './modules/ui-stats-handler.js';

export class ExplodedViewer {
    constructor(container, options) {
        this.container = container;
        this.options = options;

        this.lights = {};
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.model = null;
        this.config = null;

        this.cameraHandler = null;
        this.animationHandler = null;
        this.uiHandler = null;
        this.clickHandler = null;
        this.cardHandler = null;
        this.statsHandler = null;
    }

    async init() {
        try {
            await this._loadConfig();
            this._setupScene();
            this._setupRenderer();
            this._setupCamera();
            this._setupLights();
            this._setupHandlers();
            await this._loadModel();
            this._loadCoordinateSystem();

            this.cameraHandler.animateCameraOnLoad();
            this.animationHandler.initScrollListener();
            
            this._animate();
            
            console.log('ExplodedViewer erfolgreich initialisiert.');
        } catch (err) {
            console.error('Fehler beim initialisieren des ExplodedViewers')
        }
    }

    async _loadConfig() {
        try {
            const response = await fetch(this.options.sceneConfigPath);
            this.config = await response.json();
        } catch (err) {
            console.error('Fehler beim laden der scene-config: ', err)
        }
    }

    _setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.config.sceneConfig.backgroundColor);
    }

    _setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);
        this.renderer.domElement.style.touchAction = 'none';
    }

    _setupCamera() {
        this.cameraHandler = new CameraHandler(this.config);
        this.cameraHandler.initialize(this.renderer);
        this.camera = this.cameraHandler.getCamera();
        this.controls = this.cameraHandler.getControls();
    }

    _setupLights() {
        setupLights(this.config.sceneConfig.lights, this.scene, this.lights);
    }

    _setupHandlers() {
        this.animationHandler = new AnimationHandler(this.scene, this.config, this.renderer);
        
        // TODO: anpassen falls alternativen zu Cards aus den POCs wieder integriert werden.
        if (this.options.cardDataPath) {
            this.cardHandler = new CardHandler();
            this.cardHandler.initialize(this.options.cardDataPath, this.config);
            this.clickHandler = new ClickHandler(this.camera, this.scene, this.cardHandler);
            this.clickHandler.initialize();
        }

        if (this.options.showDebugUI) {
            this.uiHandler = new UIHandler();
            this.uiHandler.initialize(this.config, this.lights, this.scene, this.camera, this.controls);
            this.uiHandler.setAnimationHandler(this.animationHandler);
        }

        if (this.options.showStats) {
            this.statsHandler = new StatsHandler();
        }
    }

    async _loadModel() {
        try {
            const loader = new GLTFLoader();
            const gltf = await loader.loadAsync(this.options.modelPath);
            this.model = gltf.scene;
            this.clickHandler.modelChildren = this.model.children;
            this.scene.add(this.model);
            
            await this.animationHandler.initialize(this.model, this.options.explosionConfigPath);
        } catch (err) {
            console.error("Fahler beim Laden des Modells oder initialisieren der Animation:", err)
        }
    }

    async _loadCoordinateSystem() {
        if (!this.options.coordinateSystemPath) return;
        try {
            const loader = new GLTFLoader();
            const coordinateSystem = gltf.scene;
            coordinateSystem.name = 'Coordinatesystem';
            coordinateSystem.visible = this.config.sceneConfig.showCoordinatesystem;
            this.scene.add(coordinateSystem);
        } catch (error) {
            console.error('Fehler beim Laden des Koordinatensystems:', error);
        }
    }

    _animate() {
        requestAnimationFrame(() => this._animate());
        this.controls.update();

        // Animation aktualisieren, falls der Handler existiert
        if (this.animationHandler) {
            this.animationHandler.updateExplosion();
        }
    
        // Ui aktualisieren, falls der Handler existiert
        if (this.uiHandler) {
            this.uiHandler.refreshPane()
        }

        // Stats aktualisieren, falls der Handler existiert
        if (this.statsHandler) {
            this.statsHandler.update();
        } 

        this.renderer.render(this.scene, this.camera);
    }
}