import { Pane } from 'tweakpane';
import { animate } from 'animejs';
import { toggleDarkMode } from './theme-handler.js';

export class UIHandler{
    constructor() {
        this.pane = null;
        this.config = null;
        this.lights = null;
        this.scene = null;
        this.camera = null;
        this.controls = null;
        this.animationFolder = null;
        this.sceneFolder = null;
        this.cameraFolder = null;
        this.lightsFolder = null;
        this.cardFolder = null;
        this.isReversed = false;
    }

    initialize(config, lights, scene, camera, controls) {
        this.config = config;
        this.lights = lights;
        this.scene = scene;
        this.camera = camera;
        this.controls = controls;

        // Init Tweakpane
        this.pane = new Pane({
            title: 'Scene Controls',
        });

        this.initAnimationFolder();
        this.initSceneFolder();
        this.initCardFolder();

        return this.pane;
    }

    // --- Animation Einstellungen ---
    initAnimationFolder() {
        this.animationFolder = this.pane.addFolder({ title: 'Animation', expanded: true });

        if (typeof this.config.animationConfig.expFactor !== 'number') {
            this.config.animationConfig.expFactor = 0;
        }

        this.animationFolder.addBinding(
            this.config.animationConfig,
            'expFactor',
            { label: 'Progress', min: 0, max: 1, step: 0.0001 }
        );

        const triggerAnimationButton = this.animationFolder.addButton(
        {
            title: 'Start Animation',
            label: 'Animate'
        });

        this.animationFolder.addBinding(
            this.config.animationConfig,
            'animationDuration',
            { label: 'Duration (ms)',min: 100, max: 5000, step: 100}
        )

        triggerAnimationButton.on('click', () => {
            // Setze den Faktor auf 0 zurück, falls er schon 1 ist, um die Animation erneut zu starten
            if (this.config.animationConfig.expFactor === 1) {
                this.config.animationConfig.expFactor = 0;
            }
            
            // Animiere den expFactor von seinem aktuellen Wert auf 1
            const animation = animate(this.config.animationConfig,{
                expFactor: 1,
                duration: this.config.animationConfig.animationDuration || 1000, // Dauer in ms
                reversed: this.isReversed,
                ease: 'inOut(8)',
                onUpdate: () => {
                    // Aktualisiere den Slider in der UI
                    this.animationFolder.refresh();
                },
                onComplete: () => {
                    // Setze den Faktor auf 1, wenn die Animation abgeschlossen ist
                    triggerAnimationButton.title = this.isReversed ? 'Reverse Animation' : 'Start Animation';
                    this.animationFolder.refresh();
                },
                onBegin: () => {
                    this.isReversed = !this.isReversed;
                    triggerAnimationButton.title = 'animating...'
                    this.animationFolder.refresh();
                }
            });
        });
        
        // Scroll animation
        this.animationFolder.addBinding(this.config.animationConfig, 'allowScrollAnimation', {
            label: 'Scroll Animation'
        })
        .on('change', (ev) => {
            this.config.animationConfig.allowScrollAnimation = ev.value
            this.controls.enableZoom = !ev.value
        });
        
    }

    // --- Szene ---
    initSceneFolder() {
        this.sceneFolder = this.pane.addFolder({ title: 'Scene'});
        this.sceneFolder.addBinding(this.config.sceneConfig, 'backgroundColor', { label: 'Background' })
        .on('change', (ev) => {
            this.scene.background.set(ev.value);
        });

        this.sceneFolder.addBinding(this.config.sceneConfig, 'showCoordinatesystem', { label: 'Coordinate system ' })
        .on('change', (ev) => {
            const coordinateSystem = this.scene.getObjectByName('Coordinatesystem')
            
            coordinateSystem ? coordinateSystem.visible = ev.value 
                : console.warn('Coordinatesystem not found in the scene.');

            console.log('Coordinatesystem visibility changed:', ev.value);
        });
        
        this.initCameraFolder();
        this.initLightsFolder();
    }
    
    // --- Kamera ---
    initCameraFolder() {
        this.cameraFolder = this.sceneFolder.addFolder({ title: 'Camera', expanded: false });

        const cameraPosition = {
            position: {
                x: this.config.sceneConfig.camera.position[0],
                y: this.config.sceneConfig.camera.position[1],
                z: this.config.sceneConfig.camera.position[2]
            }
        };  

        const maxDist = this.config.sceneConfig.camera.maxDistance;
        const minDist = -1 * maxDist;

        this.cameraFolder.addBinding(cameraPosition, 'position', { 
            label: 'Position', 
            x: {min: minDist, max: maxDist, step: 0.1}, 
            y: {min: minDist, max: maxDist, step: 0.1}, 
            z: {min: minDist, max: maxDist, step: 0.1} 
        })
        .on('change', (ev) => {
            // Kamera-Position aktualisieren
            this.camera.position.set(ev.value.x, ev.value.y, ev.value.z);
            this.controls.update();
        });  

        this.cameraFolder.addBinding(this.controls, 'minDistance', { label: 'Min Zoom', min: 0.1, max: 100, step: 0.1 })
            .on('change', () => {
                this.controls.update();
                this.cameraFolder.refresh();
            });
        this.cameraFolder.addBinding(this.controls, 'maxDistance', { label: 'Max Zoom', min: 0.1, max: 100, step: 0.1 })
            .on('change', () => {
                this.controls.update();
                this.cameraFolder.refresh();
            });
    }

    // --- Lichter ---
    initLightsFolder() {
        this.lightsFolder = this.sceneFolder.addFolder({ title: 'Lights', expanded: false });

        // Iteriere über die Lichter in der Konfiguration und erstelle die Steuerelemente
        for (const lightName in this.config.sceneConfig.lights) {
            const lightConfig = this.config.sceneConfig.lights[lightName];
            const lightObject = this.lights[lightName]; // Das korrespondierende THREE.Light Objekt

            if (!lightObject) continue;

            const folder = this.lightsFolder.addFolder({ title: lightName });

            folder.addBinding(lightConfig, 'enabled', { label: 'Enabled' })
                .on('change', (ev) => {
                    lightObject.visible = ev.value;
                });

            folder.addBinding(lightConfig, 'intensity', { label: 'Intensity', min: 0, max: 5, step: 0.1 })
                .on('change', (ev) => {
                    lightObject.intensity = ev.value;
                });

            folder.addBinding(lightConfig, 'color', { label: 'Color' })
                .on('change', (ev) => {
                    lightObject.color.set(ev.value);
                });

            // Füge Positions-Steuerelemente nur für gerichtete Lichter hinzu
            if (lightObject.isDirectionalLight) {
                folder.addBinding(lightConfig, 'position', { label: 'Position', x: {min: -20, max: 20}, y: {min: -20, max: 20}, z: {min: -20, max: 20} })
                    .on('change', (ev) => {
                        lightObject.position.set(ev.value.x, ev.value.y, ev.value.z);
                    });
            }
        }
    }
    
    // --- Card ---
    initCardFolder() {
        this.cardFolder = this.pane.addFolder({ title: 'Card', expanded: true });
        this.cardFolder.addBinding(
            this.config.cardConfig,
            'animationDuration',
            { label: 'Duration (ms)',min: 100, max: 5000, step: 100}
        )

        this.cardFolder.addBinding(
            this.config.cardConfig,
            'isDarkmode',
            { label: 'Darkmode' }).on('change', (ev) => {
                toggleDarkMode(ev.value);
            });

            toggleDarkMode(this.config.cardConfig.isDarkmode);
    }


    // --- Refresh - Methoden ---
    refreshAnimationFolder() {
        if (this.animationFolder) {
            this.animationFolder.refresh();
        }
    }

    refreshSceneFolder() {
        if (this.sceneFolder) {
            this.sceneFolder.refresh();
        }
    }

    refreshCameraFolder() {
        if (this.cameraFolder) {
            this.cameraFolder.refresh();
        }
    }

    refreshLightsFolder() {
        if (this.lightsFolder) {
            this.lightsFolder.refresh();
        }
    }

    refreshCardFolder() {
        if (this.cardFolder) {
            this.cardFolder.refresh();
        }
    }

    refreshPane() {
        this.refreshAnimationFolder();
        this.refreshSceneFolder();
        this.refreshCameraFolder();
        this.refreshLightsFolder();
        this.refreshCardFolder();
    }

    // Getter für den Zugriff auf das Pane-Objekt
    getPane() {
        return this.pane;
    }
}