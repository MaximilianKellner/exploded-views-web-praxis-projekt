import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { setupLights } from './scene/lights.js';
import { AnimationHandler } from './modules/animation-handler.js';
import { HighlightHandler } from './modules/highlight-handler.js';
import { ClickHandler } from './modules/click-handler.js';
import { CameraHandler } from './modules/camera-handler.js';
import { UIHandler } from './modules/ui-Handler.js';
import { StatsHandler } from './modules/ui-stats-handler.js';
import { defaultOptions } from './config/default-options.js';
import { deepMerge } from './utils/deep-merge.js';

import { CardHandler } from './modules/info-elements/card-handler.js';
import { PointerHandler } from './modules/info-elements/pointer-handler.js';
import { AttachedCardHandler } from './modules/info-elements/attached-card-handler.js';

import './css/main.css';
// Assets so referenzieren, dass der Bundler sie mitnimmt
const coordinateSystemUrl = new URL('./assets/coordinatesystem.glb', import.meta.url).href;

class ExplodedViewer {
    constructor(container, options) {
        this.container = container;
        this.userOptions = options;

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
        this.highlightHandler = null;
        this.cardHandler = null;
        this.statsHandler = null;
    }
    
    async init() {
        try {
            await this._loadAndMergeConfigs();
            this._setupScene();
            this._setupRenderer();
            this._setupCamera();
            this._setupLights();
            this._setupHandlers();
            await this._loadModel();
            this._loadCoordinateSystem();
            this._setupResizeListener();

            this.cameraHandler.animateCameraOnLoad();
            this.animationHandler.initScrollListener();
            
            this._animate();
            
            console.log('ExplodedViewer erfolgreich initialisiert.');

        } catch (error) {
            console.error('Fehler beim initialisieren des ExplodedViewers:', error)
        }
    }

    async _loadAndMergeConfigs() {
        // 1. Standardwerte laden
        let mergedConfig = JSON.parse(JSON.stringify(defaultOptions));

        // 2. JSON-Datei des nutzers laden, falls sie angegeben ist
        const configPath = this.userOptions.sceneConfigPath || mergedConfig.sceneConfigPath;
        if (configPath) {
            try {
                const response = await fetch(configPath);
                const fileConfig = await response.json();
                // Konfigurationsdatei mit den Defaults mergen
                mergedConfig = deepMerge(mergedConfig, fileConfig);
            } catch (error) {
                console.error(`Fehler beim Laden der Konfigurationsdatei: ${configPath}`, error);
            }
        }

        // 3. userOptions aus dem Konstruktor mit der merged Config kombinieren (höchste Priorität)
        // Prio:
        // Default --> Json --> userOptions
        this.config = deepMerge(mergedConfig, this.userOptions);
    }

    _setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.config.sceneConfig.backgroundColor);
    }

    _setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);
        this.renderer.domElement.style.touchAction = 'none';
    }

    _setupCamera() {
        this.cameraHandler = new CameraHandler(this.config, this.container);
        this.cameraHandler.initialize(this.renderer);
        this.camera = this.cameraHandler.getCamera();
        this.controls = this.cameraHandler.getControls();
    }

    _setupLights() {
        setupLights(this.config.sceneConfig.lights, this.scene, this.lights);
    }

    _setupResizeListener() {
        this._resizeListener = () => {
            const width = this.container.clientWidth;
            const height = this.container.clientHeight;

            // Kamera-Aspektverhältnis aktualisieren
            this.cameraHandler.resize(width, height)

            // Renderer-Größe aktualisieren
            this.renderer.setSize(width, height);
        };
        window.addEventListener('resize', this._resizeListener);
    }

    _setupHandlers() {
        this.animationHandler = new AnimationHandler(this.scene, this.config, this.renderer);
        
        // Handler je nach Infoelement Typ auswählen
        let handlerType = this.config.infoElementType || 'card';
        switch (handlerType) {
            case 'pointer':
                this.infoElementHandler = new PointerHandler(this.camera, this.config.pointerConfig);
                console.log('pointer');
                break;
            case 'card':
                this.infoElementHandler = new CardHandler();
                console.log('card');
                break;
            case 'attached-card':
                this.infoElementHandler = new AttachedCardHandler();
                console.log('attached-card');
                break;
            default:
                this.infoElementHandler = new CardHandler();
        }

        this.infoElementHandler.initialize(this.config.cardDataPath, this.config);

        this.highlightHandler = new HighlightHandler(this.scene, this.config.highlightOptions);
        this.highlightHandler.initialize();

        this.clickHandler = new ClickHandler(this.camera, this.scene, this.infoElementHandler, this.renderer, this.highlightHandler);
        this.clickHandler.initialize();

        if (this.config.showDebugUI) {
            this.uiHandler = new UIHandler();
            this.uiHandler.initialize(this.config, this.lights, this.scene, this.camera, this.controls);
            this.uiHandler.setAnimationHandler(this.animationHandler);
        }

        if (this.config.showStats) {
            this.statsHandler = new StatsHandler();
        }
    }

    async _loadModel() {
        try {
            const loader = new GLTFLoader();
            const gltf = await loader.loadAsync(this.config.modelPath);
            this.model = gltf.scene;
            this.highlightHandler.modelChildren = this.model.children;
            this.scene.add(this.model);
            
            await this.animationHandler.initialize(this.model, this.config.explosionConfigPath);
        } catch (error) {
            console.error("Fahler beim Laden des Modells oder initialisieren der Animation:", error)
        }
    }

    async _loadCoordinateSystem() {
        try {
            const loader = new GLTFLoader();
            const gltf = await loader.loadAsync(coordinateSystemUrl);

            const coordinateSystem = gltf.scene;
            coordinateSystem.name = 'Coordinatesystem';
            coordinateSystem.visible = this.config.sceneConfig.showCoordinatesystem;
            this.scene.add(coordinateSystem);
        } catch (error) {
            console.error('Fehler beim Laden des Koordinatensystems:', error);
        }
    }

    _animate() {
        this._animationFrameId = requestAnimationFrame(() => this._animate());
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

        if (this.infoElementHandler?.labelRenderer) {
        this.infoElementHandler.labelRenderer.render(this.scene, this.camera);
        }
    }

    destroy() {

        if (this._animationFrameId) {
            cancelAnimationFrame(this._animationFrameId);
            this._animationFrameId = null;
        }
        
        if (this._resizeListener) {
            window.removeEventListener('resize', this._resizeListener);
        }
            
        // Handler zerstören
        if (this.animationHandler) this.animationHandler.destroy();
        if (this.clickHandler) this.clickHandler.destroy();
        if (this.highlightHandler) this.highlightHandler.destroy();
        if (this.cardHandler) this.cardHandler.destroy();
        if (this.uiHandler) this.uiHandler.destroy();
        if (this.statsHandler) this.statsHandler.destroy();
        if (this.cameraHandler) this.cameraHandler.destroy();

        // Szene bereinigen
        if (this.scene) {
            this.scene.traverse(object => {
                if (object.isMesh) {
                    if (object.geometry) {
                        object.geometry.dispose();
                    }
                    if (object.material) {
                        if (Array.isArray(object.material)) {
                            object.material.forEach(material => material.dispose());
                        } else {
                            object.material.dispose();
                        }
                    }
                }
            });
        }

        // Renderer und controlls entfernen
        if (this.controls) this.controls.dispose();
        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement && this.container.contains(this.renderer.domElement)) {
                this.container.removeChild(this.renderer.domElement);
            }
        }

        // Szene und Kamera entfernen
        this.scene = null;
        this.camera = null;
        this.model = null;
        this.renderer = null;
        this.controls = null;
        this.cameraHandler = null;
        this.animationHandler = null;
        this.uiHandler = null;
        this.clickHandler = null;
        this.cardHandler = null;
        this.statsHandler = null;
        this.config = null;
        this.lights = null;
        this.options = null;
        this.container = null;
    }
}

export default ExplodedViewer;