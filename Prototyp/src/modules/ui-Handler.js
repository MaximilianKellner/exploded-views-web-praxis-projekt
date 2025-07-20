import { Pane } from 'tweakpane';

export function initTweakpane(config, lights, scene, camera, controls) {
    const pane = new Pane({
        title: 'Scene Controls',
    });

    // --- Animation Einstellungen ---
    const animationFolder = pane.addFolder({ title: 'Animation', expanded: true });
    // Definiere die Variable im config-Objekt, damit sie global ausgelesen werden kann
    if (!config.animationConfig) config.animationConfig = {};
    if (typeof config.animationConfig.expFactor !== 'number') config.animationConfig.expFactor = 0;

    animationFolder.addBinding(
        config.animationConfig,
        'expFactor',
        { label: 'Progress', min: 0, max: 1, step: 0.01 }
    );

    // --- Szene ---
    const sceneFolder = pane.addFolder({ title: 'Scene'});
    sceneFolder.addBinding(config.sceneConfig, 'backgroundColor', { label: 'Background' })
        .on('change', (ev) => {
            scene.background.set(ev.value);
        });

    sceneFolder.addBinding(config.sceneConfig, 'showCoordinatesystem', { label: 'Koordinatensystem' })
        .on('change', (ev) => {
            //scene.getObjectByName('Coordinatesystem')?.visible = ev.value;
            console.log('Coordinatesystem visibility changed:', ev.value);

            scene.getObjectByName('Coordinatesystem')
                ? scene.getObjectByName('Coordinatesystem').visible = ev.value
                : console.warn('Coordinatesystem not found in the scene.');
        });

    // --- Kamera ---
    const cameraFolder = sceneFolder.addFolder({ title: 'Camera', expanded: true });
    cameraFolder.addBinding(camera, 'position', { label: 'Camera Position', x: {min: -20, max: 20}, y: {min: -20, max: 20}, z: {min: -20, max: 20} })
        .on('change', () => {
            controls.update();
    });
    cameraFolder.addBinding(controls, 'minDistance', { label: 'Min Distance', min: 0.1, max: 100, step: 0.1 })
        .on('change', () => {
            controls.update();
        });
    cameraFolder.addBinding(controls, 'maxDistance', { label: 'Max Distance', min: 0.1, max: 100, step: 0.1 })
        .on('change', () => {
            controls.update();
        });

    // --- Lichter ---
    const lightsFolder = pane.addFolder({ title: 'Lights', expanded: false });

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

    return pane;
}