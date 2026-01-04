import { initUI, hideOverlay } from './onboarding-ui-handler.js';
import { getFilesFromList, validateConfigFile } from './file-logic.js';
import { startEditor } from './editor-logic.js';

const appContainer = document.getElementById('app-container');

let modelUrl = null;
let configUrl = null;

// UI mit callbacks initialisieren
initUI(
    // onFilesReceived
    async (files) => {
        await handleFiles(files);
    },
    // onReset
    () => {
        modelUrl = null;
        configUrl = null;
    },
    // onValidate
    async (file) => {
        if (file.name.toLowerCase().endsWith('.json')) {
            return await validateConfigFile(file);
        }
        return true;
    }
);

async function handleFiles(files) {
    const { glbFile, jsonFile } = getFilesFromList(files);

    if (jsonFile) {
        // überprüfung bereits beim upload
        configUrl = URL.createObjectURL(jsonFile);
    }

    if (glbFile) {
        modelUrl = URL.createObjectURL(glbFile);
        
        // Start editor and update UI
        startEditor(appContainer, modelUrl, configUrl);
        hideOverlay();
        
    } else if (jsonFile) {
        console.log('Config loaded, waiting for GLB...');
    }
}
