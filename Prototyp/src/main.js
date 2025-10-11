import { ExplodedViewer } from './ExplodedViewer.js';

// Sportwagen
const sportwagen = {
    sceneConfigPath: '/scene-config.json', // Pfad zum explodierbaren .glb Modell
    modelPath: '/911.glb', // Pfad zur Explosions-Konfiguration
    explosionConfigPath: '/911-exp-config.json', // Pfad zur Explosions config
    cardDataPath: '/911-cards.json', // Pfad zu den Card Inhalten
    highlightOptions: {
        mode: 'ghost' // 'wireframe' oder 'ghost'
    },
    showDebugUI: true,
    showStats: true,
    infoElementType: 'card', // 'pointer', 'attached-card' oder 'card'
    pointerOptions: {
        defaultSide: 'auto', // 'left', 'right' oder 'auto'
        rotationY: '0',   // 'auto' für Ausrichtung zur Kamera, oder eine Zahl (z.B. 45)
        maxWidth: 1800
    }
}

// Kopfhoerer
const kopfhoerer = {
    sceneConfigPath: '/kopfhoerer/scene-config.json', // Pfad zum explodierbaren .glb Modell
    modelPath: '/kopfhoerer/nothing-in-ear.glb', // Pfad zur Explosions-Konfiguration
    explosionConfigPath: '/kopfhoerer/exp-config.json', // Pfad zur Explosions config
    cardDataPath: '/911-cards.json', // Pfad zu den Card Inhalten
    showDebugUI: true,
    showStats: true,
    infoElementType: 'pointer', // 'pointer', 'attached-card' oder 'card'
        pointerOptions: {
        defaultSide: 'auto', // 'left', 'right' oder 'auto'
        rotationY: '0',   // 'auto' für Ausrichtung zur Kamera, oder eine Zahl (z.B. 45)
        maxWidth: 1800
    }
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