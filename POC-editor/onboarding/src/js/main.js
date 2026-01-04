import { initUI, hideOverlay } from './ui-handler.js';
import { getFilesFromList } from './file-logic.js';
import { startEditor } from './editor-logic.js';

const appContainer = document.getElementById('app-container');

let modelUrl = null;
let configUrl = null;

// Initialize UI with callbacks
initUI(
    // onFilesReceived
    (files) => {
        handleFiles(files);
    },
    // onReset
    () => {
        modelUrl = null;
        configUrl = null;
    }
);

function handleFiles(files) {
    const { glbFile, jsonFile } = getFilesFromList(files);

    if (glbFile) {
        modelUrl = URL.createObjectURL(glbFile);
        if (jsonFile) {
            configUrl = URL.createObjectURL(jsonFile);
        }
        
        // Start editor and update UI
        startEditor(appContainer, modelUrl, configUrl);
        hideOverlay();
        
    } else if (jsonFile) {
        configUrl = URL.createObjectURL(jsonFile);
        console.log('Config loaded, waiting for GLB...');
    }
}
