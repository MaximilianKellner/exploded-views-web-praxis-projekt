import { Pane } from 'tweakpane';
import { animate } from 'animejs';
import { toggleDarkMode } from './theme-handler.js';

export function initTweakpane(config, lights, scene, camera, controls) {
    const pane = new Pane({
        title: 'Scene Controls',
    });

    // --- Animation Einstellungen ---
    const animationFolder = pane.addFolder({ title: 'Animation', expanded: true });
    if (typeof config.animationConfig.expFactor !== 'number') config.animationConfig.expFactor = 0;

    animationFolder.addBinding(
        config.animationConfig,
        'expFactor',
        { label: 'Progress', min: 0, max: 1, step: 0.0001 }
    );

    const triggerAnimationButton = animationFolder.addButton(
        {
            title: 'Start Animation',
            label: 'Animate'
        });

    animationFolder.addBinding(
        config.animationConfig,
        'animationDuration',
        { label: 'Duration (ms)',min: 100, max: 5000, step: 100}
    )

    let isReversed = false; 
    triggerAnimationButton.on('click', () => {
        // Setze den Faktor auf 0 zurück, falls er schon 1 ist, um die Animation erneut zu starten
        if (config.animationConfig.expFactor === 1) {
            config.animationConfig.expFactor = 0;
        }
        
        // Animiere den expFactor von seinem aktuellen Wert auf 1
        const animation = animate(config.animationConfig,{
            expFactor: 1,
            duration: config.animationConfig.animationDuration || 1000, // Dauer in ms
            reversed: isReversed,
            ease: 'inOut(8)',
            onUpdate: () => {
                // Aktualisiere den Slider in der UI
                animationFolder.refresh();
            },
            onComplete: () => {
                // Setze den Faktor auf 1, wenn die Animation abgeschlossen ist
                triggerAnimationButton.title = isReversed ? 'Reverse Animation' : 'Start Animation';
                animationFolder.refresh();
            },
            onBegin: () => {
                isReversed = !isReversed;
                triggerAnimationButton.title = 'animating...'
                animationFolder.refresh();
            }
        });
    });

    // Scroll animation
    animationFolder.addBinding(config.animationConfig, 'allowScrollAnimation', {
        label: 'Scroll Animation'
    })
    .on('change', (ev) => {
        config.animationConfig.allowScrollAnimation = ev.value
        controls.enableZoom = !ev.value
    });

    // --- Szene ---
    const sceneFolder = pane.addFolder({ title: 'Scene'});
    sceneFolder.addBinding(config.sceneConfig, 'backgroundColor', { label: 'Background' })
        .on('change', (ev) => {
            scene.background.set(ev.value);
        });

    sceneFolder.addBinding(config.sceneConfig, 'showCoordinatesystem', { label: 'Coordinate system ' })
        .on('change', (ev) => {
            //scene.getObjectByName('Coordinatesystem')?.visible = ev.value;
            console.log('Coordinatesystem visibility changed:', ev.value);

            scene.getObjectByName('Coordinatesystem')
                ? scene.getObjectByName('Coordinatesystem').visible = ev.value
                : console.warn('Coordinatesystem not found in the scene.');
        });

    // --- Kamera ---
    const cameraFolder = sceneFolder.addFolder({ title: 'Camera', expanded: false });

    const cameraPosition = {
        position: {
            x: config.sceneConfig.camera.position[0],
            y: config.sceneConfig.camera.position[1],
            z: config.sceneConfig.camera.position[2]
        }
    };  

    const maxDist = config.sceneConfig.camera.maxDistance;
    const minDist = -1 * maxDist;

    cameraFolder.addBinding(cameraPosition, 'position', { 
        label: 'Position', 
        x: {min: minDist, max: maxDist, step: 0.1}, 
        y: {min: minDist, max: maxDist, step: 0.1}, 
        z: {min: minDist, max: maxDist, step: 0.1} 
    })
    .on('change', (ev) => {
        // Kamera-Position aktualisieren
        camera.position.set(ev.value.x, ev.value.y, ev.value.z);
        controls.update();
    });  

    cameraFolder.addBinding(controls, 'minDistance', { label: 'Min Zoom', min: 0.1, max: 100, step: 0.1 })
        .on('change', () => {
            controls.update();
            cameraFolder.refresh();
        });
    cameraFolder.addBinding(controls, 'maxDistance', { label: 'Max Zoom', min: 0.1, max: 100, step: 0.1 })
        .on('change', () => {
            controls.update();
            cameraFolder.refresh();
        });

    // --- Lichter ---
    const lightsFolder = sceneFolder.addFolder({ title: 'Lights', expanded: false });

    // Iteriere über die Lichter in der Konfiguration und erstelle die Steuerelemente
    for (const lightName in config.sceneConfig.lights) {
        const lightConfig = config.sceneConfig.lights[lightName];
        const lightObject = lights[lightName]; // Das korrespondierende THREE.Light Objekt

        if (!lightObject) continue;

        const folder = lightsFolder.addFolder({ title: lightName });

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

    // --- Card ---
    const cardFolder = pane.addFolder({ title: 'Card', expanded: true });
    cardFolder.addBinding(
        config.cardConfig,
        'animationDuration',
        { label: 'Duration (ms)',min: 100, max: 5000, step: 100}
    )

    cardFolder.addBinding(
        config.cardConfig,
        'isDarkmode',
        { label: 'Darkmode'}).on('change', (ev) => {
        toggleDarkMode(ev.value);
    });

    toggleDarkMode(config.cardConfig.isDarkmode);

    return pane;
}