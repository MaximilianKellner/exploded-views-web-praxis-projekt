import * as THREE from 'three';
let labelData = {}; // Label-Definitionen aus der JSON-Datei
const labels = [];

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

// --- Erstellen eines 3D-Labels (Plane) für ein 3D-Objekt ---
function create3DLabelForObject(object3D, labelInfo) {
    if (!object3D || !labelInfo || !labelInfo.title) return null;

    // Lese die aktuelle Ausrichtung direkt aus dem Drop DOwn Menü
    const labelDirectionSelect = document.getElementById('label-direction');
    const selectedDirection = labelDirectionSelect ? labelDirectionSelect.value : 'links/rechts';

    let pointerSide = 'left';
    // Weise die pointerSide nur im Standardfall automatisch zu
    if (selectedDirection === 'links/rechts') {
        pointerSide = labelInfo.direction === 'XNEG' ? 'right' : 'left';
    }

    const mesh = createTextLabelMesh({
        title: labelInfo.title,
        body: labelInfo.body || '',
        pointerSide: pointerSide
    });

    // Bounding Box des Objekts berechnen, um die Größe zu ermitteln
    const boundingBox = new THREE.Box3().setFromObject(object3D);
    const objectSize = new THREE.Vector3();
    boundingBox.getSize(objectSize);

    // Label-Dimensionen.
    const labelWidth = mesh.geometry.parameters.width; // Gesamtbreite des Labels in 3D-Einheiten
    
    const position = new THREE.Vector3();

    // Position basierend auf der Seite des Pointers ausrichten.
    if (pointerSide === 'left') {
        // Label ist rechts vom Objekt, Pointer zeigt nach links.
        position.x = objectSize.x / 2 + labelWidth / 2;
    } else { // pointerSide === 'right'
        // Label ist links vom Objekt, Pointer zeigt nach rechts.
        position.x = -objectSize.x / 2 - labelWidth / 2;
    }

    // initial Position des Labels speichern, damit die UI-Logik darauf zugreifen kann
    mesh.userData.originalPosition = position.clone();

    // Label-Informationen in userData speichern
    mesh.userData.title = labelInfo.title;
    mesh.userData.body = labelInfo.body || '';
    mesh.userData.pointerSide = pointerSide;
    mesh.userData.direction = labelInfo.direction;
    // Speichern der Dimensionen für spätere Berechnungen
    mesh.userData.objectSize = objectSize;
    mesh.userData.labelWidth = labelWidth;

    mesh.position.copy(position);
    mesh.visible = false;
    object3D.add(mesh);
    labels.push(mesh);
    return mesh;
}

// --- Zuordnen und Erstellen von 3D-Labels basierend auf Objektnamen und geladenen Daten ---
function assign3DLabelsToObjects(taggableObjects) {
    if (!labelData || Object.keys(labelData).length === 0) {
        console.warn('Keine Label-Daten zum Zuordnen vorhanden.');
        return;
    }

    taggableObjects.forEach(item => {
        const objectName = item.object.name;
        const nameParts = objectName.split('-');
        
        // TODO: Umstellung auf json
        // Robustere Extraktion des optionalen Namens
        let optionalName = objectName;
        if (objectName.startsWith('exp-')) {
            optionalName = nameParts.length > 3 ? nameParts.slice(3).join('-') : objectName;
        } else if (objectName.startsWith('tag-')) {
            optionalName = nameParts.slice(1).join('-');
        }

        // Extrahiere die Richtung aus dem Namen
        const directionMatch = objectName.match(/-dir([XYZ])(POS|NEG)/);
        if (directionMatch) {
            const direction = directionMatch[1]+ directionMatch[2];
            //console.log('Richtung extrahiert:', direction);
            
            // labeldata wird um die Richtung erweitert --> TODO: daten direkt in der JSON speichern?
            if (labelData[objectName]) {
                labelData[objectName].direction = direction;
                //console.log(`Richtung für ${objectName} gesetzt:`, labelData[objectName].direction);
            } else if (labelData[optionalName]) {
                labelData[optionalName].direction = direction;
                //console.log(`Richtung für ${optionalName} gesetzt:`, labelData[optionalName].direction);
                //console.log(labelData[optionalName]);
            } else {
                console.warn(`Kein Label für ${objectName} oder ${optionalName} gefunden.`);
            }
        }
        
        // Außerhalb um auch nicht exp Objekte ohne Richtung zu labeln
        if (labelData[objectName]) {
            create3DLabelForObject(item.object, labelData[objectName]);
        } else if (labelData[optionalName]) {
            create3DLabelForObject(item.object, labelData[optionalName]);
        }
    });
}

// --- Canvas-Textlabel als Plane-Mesh ---
function createTextLabelMesh({
    title = '',
    body = '',
    pointerSide = 'left' // 'left' or 'right'
} = {}) {
    const textBlockCanvasWidth = 1200; // Breite des Text-Blocks in Canvas-Pixeln
    const pointerCanvasWidth = 512;   // Breite des Pointer-Blocks in Canvas-Pixeln
    const canvasHeight = 300;         // Höhe des Canvas in Pixeln

    // --- Abgeleitete Dimensionen (nicht ändern) ---
    const padding = 25;
    const planeBaseWidth = 4;
    const totalCanvasWidth = textBlockCanvasWidth + pointerCanvasWidth;
    const aspectRatio = totalCanvasWidth / canvasHeight;
    const planeHeight = planeBaseWidth / aspectRatio;

    const canvas = document.createElement('canvas');
    canvas.width = totalCanvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Positionen basierend auf der Pointer-Seite bestimmen
    const textBlockX = (pointerSide === 'left') ? pointerCanvasWidth : 0;
    const pointerStartX = (pointerSide === 'left') ? 0 : textBlockCanvasWidth;
    const pointerEndX = (pointerSide === 'left') ? pointerCanvasWidth : totalCanvasWidth;

    // Text-Block Hintergrund
    // ctx.fillStyle = 'hsl(0, 0.00%, 4.70%)';
    // ctx.fillRect(textBlockX, 0, textBlockCanvasWidth, canvasHeight);

    // Titel Text
    ctx.font = 'bold 80px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(title, textBlockX + padding, padding);

    // Divider Linie & Pointer Linie
    const dividerLineY = canvas.height / 2 - 32;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 6;
    ctx.beginPath();
    // Pointer-Teil
    ctx.moveTo(pointerStartX, dividerLineY);
    ctx.lineTo(pointerEndX, dividerLineY);
    // Divider-Teil im Text-Block
    if (pointerSide === 'left') {
        ctx.lineTo(totalCanvasWidth - padding, dividerLineY);
    } else { // pointerSide === 'right'
        // Neu ansetzen, um von der Kante des Textblocks zu starten
        ctx.moveTo(textBlockX + padding, dividerLineY);
        ctx.lineTo(textBlockCanvasWidth, dividerLineY);
    }
    ctx.stroke();

    // Body Text
    ctx.font = '65px Arial';
    ctx.fillStyle = '#9b9b9b';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(body, textBlockX + padding, canvas.height / 2 + 20);

    // Canvas in Textur umwandeln und auf Plane anwenden
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide
    });

    // Die Geometrie wird basierend auf dem Seitenverhältnis des Canvas erstellt, um Verzerrungen zu vermeiden.
    const geometry = new THREE.PlaneGeometry(planeBaseWidth, planeHeight);
    const textMesh = new THREE.Mesh(geometry, material);
    textMesh.position.set(0, 0, 0);

    return textMesh;
}

function updateLabelPointerSide(label, newPointerSide) {
    // Nur aktualisieren, wenn sich die Seite ändert
    if (!label.userData || label.userData.pointerSide === newPointerSide) {
        return;
    }

    // Erstelle ein neues temporäre Mesh, um die neue Textur zu bekommen
    const tempMesh = createTextLabelMesh({
        title: label.userData.title,
        body: label.userData.body,
        pointerSide: newPointerSide
    });

    // Aktualisiere die Textur des originalen Labels
    if (label.material.map) {
        label.material.map.dispose(); // Alte Textur entfernen
    }
    label.material.map = tempMesh.material.map;
    label.material.map.needsUpdate = true;

    label.userData.pointerSide = newPointerSide;
}

export { loadLabelData, create3DLabelForObject, assign3DLabelsToObjects, labels, updateLabelPointerSide };