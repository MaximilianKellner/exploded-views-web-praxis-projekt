import * as THREE from 'three';
import { CSS2DObject, CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

let labelRenderer;
const labels = [];
let labelData = {}; // Label-Definitionen aus der JSON-Datei gespeichert

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
function createLabelForObject(object3D, text) {
    if (!object3D || !text) return null;

    const div = document.createElement('div');
    div.className = 'text-label'; // CSS-Klasse für Styling
    div.textContent = text;

    const label = new CSS2DObject(div);
    
    // Position des Labels relativ zum Objekt
    label.position.set(0, 0.2, 0); // Leicht über dem Objektmittelpunkt
    object3D.add(label); // Label an das 3D-Objekt anhängen
    labels.push(label);
    return label;
}

// --- Zuordnen und Erstellen von Labels basierend auf Objektnamen und geladenen Daten ---
function assignLabelsToObjects(explodableObjects) {
    if (!labelData || Object.keys(labelData).length === 0) {
        console.warn('Keine Label-Daten zum Zuordnen vorhanden.');
        return;
    }

    explodableObjects.forEach(item => {
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