import ExplodedViewer from './ExplodedViewer.js';

/**
 * Beispielhaftes Setup des Exploded viewers.
 */

// Sportwagen
const sportwagen = {
    sceneConfigPath: '/car/scene-config.json', // Pfad zur Szenenkonfiguration
    modelPath: '/car/911.glb', // Pfad zum explodierbaren .glb Modell
    modelPath: '/car/911-with-ground.glb', // Pfad zum explodierbaren .glb Modell
    explosionConfigPath: '/car/911-exp-config.json', // Pfad zur Explosions-Konfiguration
    cardDataPath: '/car/911-cards.json', // Pfad zu den Card-Inhalten
    showDebugUI: false,
    showStats: true,

    sceneConfig: {
        backgroundColor: "#6480be", //old: 353535 -- blue: 6480be
        camera: {
            position: [5, 3, 9],
            maxDistance: 50,
            lockVertical: false,
        }
    },
    
    highlightOptions: {
        highlightComponent: true,
        mode: "ghost"  // 'wireframe' oder 'ghost'
    },

    infoElementType: 'card', // 'pointer', 'attached-card', 'card'
}

// Kopfhoerer
const kopfhoerer = {
    sceneConfigPath: '/kopfhoerer/scene-config.json', // Pfad zur Szenenkonfiguration
    modelPath: '/kopfhoerer/nothing-in-ear.glb', // Pfad zum explodierbaren .glb Modell
    explosionConfigPath: '/kopfhoerer/exp-config.json', // Pfad zur Explosions-Konfiguration
    cardDataPath: '/911-cards.json', // Pfad zu den Card-Inhalten
    showDebugUI: true,
    showStats: true,
}

async function main() {
    const container = document.getElementById('exp-container');
    if (!container) {
        console.error('Container #exp-container konnte nicht gefunden werden.');
        return;
    }

    const expOptions = sportwagen;
    // sportwagen || kopfhoerer;

    const expViewer = new ExplodedViewer(container, expOptions);
    await expViewer.init();
}

main();