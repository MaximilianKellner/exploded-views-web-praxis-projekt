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

    const mesh = createTextLabelMesh({
        title: labelInfo.title,
        body: labelInfo.body || ''
    });

    // Bounding Box des Objekts berechnen, um die Größe zu ermitteln
    const boundingBox = new THREE.Box3().setFromObject(object3D);
    const objectSize = new THREE.Vector3();
    boundingBox.getSize(objectSize);

    // Label-Dimensionen und gewünschter Abstand
    const labelWidth = mesh.geometry.parameters.width;
    const labelHeight = mesh.geometry.parameters.height;
    const offset = 1.0; // Zusätzlicher Abstand vom Objekt

    const position = new THREE.Vector3();

    // Position basierend auf der Explosionsrichtung ausrichten
    if (labelInfo.direction) {
        switch (labelInfo.direction) {
            case 'YPOS':
                position.y = objectSize.y / 2 + labelHeight / 2 + offset;
                break;
            case 'YNEG':
                position.y = -objectSize.y / 2 - labelHeight / 2 - offset;
                break;
            case 'XPOS':
                position.x = objectSize.x / 2 + labelWidth / 2 + offset;
                break;
            case 'XNEG':
                position.x = -objectSize.x / 2 - labelWidth / 2 - offset;
                break;
            case 'ZPOS':
                position.z = objectSize.z / 2 + labelWidth / 2 + offset;
                break;
            case 'ZNEG':
                position.z = -objectSize.z / 2 - labelWidth / 2 - offset;
                break;
            default:
                // Fallback, falls eine unbekannte Richtung angegeben ist
                position.z = objectSize.z / 2 + offset;
        }
    } else {
        // Fallback für Objekte ohne explizite Richtung --> Richtung für das Basis Label oder andere Objekte ohne Explosionsrichtung
        position.z = objectSize.z / 2 + offset;
    }

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
        const optionalName = nameParts.length > 3 ? nameParts.slice(3).join('-') : objectName;


        // Extrahiere die Richtung aus dem Namen
        const directionMatch = objectName.match(/-dir([XYZ])(POS|NEG)/);
        if (directionMatch) {
            const direction = directionMatch[1]+ directionMatch[2];
            console.log('Richtung extrahiert:', direction);
            
            // labeldata wird um die Richtung erweitert
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
    width = 1024,
    height = 256
} = {}) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'hsla(360 0% 0% / 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Titel Text
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(title, 25, 25);

    // Divider Linie
    const dividerLineY = canvas.height / 2 - 32;
    const dividerLineWidthPadding = 25;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0 + dividerLineWidthPadding, dividerLineY);
    ctx.lineTo(canvas.width - dividerLineWidthPadding, dividerLineY);
    ctx.stroke();

    // Body Text
    ctx.font = '32px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(body, 25, canvas.height / 2 + 10);

    // Canvas in Textur umwandeln und auf Plane anwenden
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide
    });
    const geometry = new THREE.PlaneGeometry(4, 1);
    const textMesh = new THREE.Mesh(geometry, material);
    textMesh.position.set(0, 0, 0);

    return textMesh;
}

export { loadLabelData, create3DLabelForObject, assign3DLabelsToObjects };