import ExplodedViewer from '@exploded-view/ExplodedViewer.js';

export async function startEditor(appContainer, modelUrl, configUrl) {
    // Init ExpViewer
    const options = {
        modelPath: modelUrl,
        sceneConfigPath: null, // use defaults
        explosionConfigPath: configUrl, // Optional, might be null
        
        editMode: true,
        showDebugUI: false,
        showStats: false,
        
        sceneConfig: {
            backgroundColor: "#1e1e1e",
            shadowsEnabled: false,
            camera: {
                position: [5, 5, 5],
            }
        },
        
        animationConfig: {
            layerDistance: 1,
            globalExpDirection: [0, 1, 0]
        }
    };

    const viewer = new ExplodedViewer(appContainer, options);
    await viewer.init();
}
