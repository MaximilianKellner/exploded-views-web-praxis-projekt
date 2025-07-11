import * as THREE from 'three';
import { CSS2DObject, CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

let labelRenderer;
const labels = [];
let labelData = {}; // Label-Definitionen aus der JSON-Datei

// --- Initialisierung des Label-Renderers ---
function initLabelRenderer(container) {
    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.pointerEvents = 'none'; // OrbitControls werden nicht blockiert
    container.appendChild(labelRenderer.domElement);

    // Event Listener für Fenster-Resize
    window.addEventListener('resize', onWindowResizeLabelRenderer, false);
}

// --- Laden der Label-Definitionen ---
async function loadLabelData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        labelData = await response.json();
        console.log('Label-Daten erfolgreich geladen:', labelData);
    } catch (error) {
        console.error('Fehler beim Laden der Label-Daten:', error);
    }
}

// --- Erstellen eines Labels für ein 3D-Objekt ---
function createLabelForObject(object3D, labelInfo) {
    if (!object3D || !labelInfo || !labelInfo.title) return null;

    const labelDiv = document.createElement('div');
    labelDiv.className = 'text-label';

    const titleElenement = document.createElement('p');
    titleElenement.className = 'label-title';
    titleElenement.textContent = labelInfo.title
    labelDiv.appendChild(titleElenement);


    if (labelInfo.body) {

    // divider für den Titel und den Body
    const divider = document.createElement('hr');
    labelDiv.appendChild(divider);
    const bodyTextElement = document.createElement('p');
    bodyTextElement.className = 'label-body';
    bodyTextElement.textContent = labelInfo.body
    labelDiv.appendChild(bodyTextElement);
    }

    const label = new CSS2DObject(labelDiv);
    
    // Position des Labels relativ zum Objekt
    label.position.set(0, 0.2, 0); // Leicht über dem Objektmittelpunkt
    label.visible = false;
    object3D.add(label); // Label an das 3D-Objekt anhängen
    labels.push(label);
    return label;
}

// --- Zuordnen und Erstellen von Labels basierend auf Objektnamen und geladenen Daten ---
function assignLabelsToObjects(taggableObjects) {
    if (!labelData || Object.keys(labelData).length === 0) {
        console.warn('Keine Label-Daten zum Zuordnen vorhanden.');
        return;
    }

    taggableObjects.forEach(item => {
        const objectName = item.object.name; // z.B. exp-L1-dirYPOS-Schraube
        // Extrahiere den optionalen Namen oder verwende den ganzen Namen als Key
        const nameParts = objectName.split('-');
        const optionalName = nameParts.length > 3 ? nameParts.slice(3).join('-') : objectName; // Fallback auf ganzen Namen, falls kein OptionalerName

        if (labelData[objectName]) { // Zuerst exakten Match prüfen
            createLabelForObject(item.object, labelData[objectName]);
        } else if (labelData[optionalName]) { // Dann Match mit OptionalerName
            createLabelForObject(item.object, labelData[optionalName]);
        }
    });
}

// --- Aktualisieren des Label-Renderers (im Animationsloop aufrufen) ---
function updateLabelRenderer(scene, camera) {
    if (labelRenderer) {
        labelRenderer.render(scene, camera);
    }
}

// --- Hilfsfunktion für Fenster-Resize des Label-Renderers ---
function onWindowResizeLabelRenderer() {
    if (labelRenderer) {
        labelRenderer.setSize(window.innerWidth, window.innerHeight);
    }
}

export { initLabelRenderer, loadLabelData, createLabelForObject, assignLabelsToObjects, updateLabelRenderer };