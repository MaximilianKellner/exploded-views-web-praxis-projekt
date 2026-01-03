import ExplodedViewer from '@exploded-view/ExplodedViewer.js';

const uploadOverlay = document.getElementById('onboarding-screen');
const appContainer = document.getElementById('app-container');

let modelUrl = null;
let configUrl = null;

// Handle file inputs
document.querySelectorAll('.file-input-glb').forEach(input => {
    input.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
});

document.querySelectorAll('.file-input-json').forEach(input => {
    input.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
});

// Drag & Drop - apply to all upload boxes
document.querySelectorAll('.upload-box').forEach(box => {
    box.addEventListener('dragover', (e) => {
        e.preventDefault();
        box.classList.add('dragover');
    });

    box.addEventListener('dragleave', () => {
        box.classList.remove('dragover');
    });

    box.addEventListener('drop', (e) => {
        e.preventDefault();
        box.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
});

function handleFiles(files) {
    let glbFile = null;
    let jsonFile = null;

    for (const file of files) {
        if (file.name.toLowerCase().endsWith('.glb')) {
            glbFile = file;
        } else if (file.name.toLowerCase().endsWith('.json')) {
            jsonFile = file;
        }
    }

    if (glbFile) {
        modelUrl = URL.createObjectURL(glbFile);
        if (jsonFile) {
            configUrl = URL.createObjectURL(jsonFile);
        }
        startEditor();
    } else if (jsonFile) {
        configUrl = URL.createObjectURL(jsonFile);
        // Optional: Visual feedback that JSON is loaded
        console.log('Config loaded, waiting for GLB...');
    }
        if (jsonFile) {
            configUrl = URL.createObjectURL(jsonFile);
                startEditor();
        }
     else {
        alert('Please upload at least a .glb file.');
    }
}

async function startEditor() {
    // Hide overlay
    uploadOverlay.classList.add('hidden');
    setTimeout(() => {
        uploadOverlay.style.display = 'none';
    }, 500);

    // Initialize Viewer
    const options = {
        modelPath: modelUrl,
        sceneConfigPath: null, // We don't have a scene config file yet, use defaults
        explosionConfigPath: configUrl, // Optional, might be null
        
        editMode: true,
        showDebugUI: true,
        showStats: true,
        
        sceneConfig: {
            backgroundColor: "#333333",
            shadowsEnabled: true,
            camera: {
                position: [5, 5, 5],
            }
        },
        
        animationConfig: {
            // Default animation settings if no config is provided
            layerDistance: 1,
            globalExpDirection: [0, 1, 0]
        }
    };

    const viewer = new ExplodedViewer(appContainer, options);
    await viewer.init();
}
