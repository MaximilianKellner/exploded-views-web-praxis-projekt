import * as THREE from 'three';

function setupLights(lightsConfig, scene, lightsObject) {
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
            lightsObject[lightName] = light; // Licht im globalen Objekt speichern
            scene.add(light);
        }
    }
}

export { setupLights };