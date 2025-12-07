import { InfoElementHandler } from './info-element-handler.js';
import * as THREE from 'three';

/**
 * Verwaltet die Logik für die Pointer Elements für das 3D-Modell.
 * Liest eine Konfigurationsdatei, generiert die Pointer elemente und formatiert die Inhalte.
 * Die Pointer werden im 3D-Raum positioniert.
 */

export class PointerHandler extends InfoElementHandler {
    constructor(camera) {
        super();
        this.camera = camera;
        this.labelData = {};
        this.labels = [];
        this.config = null;
    }

    async initialize(dataPath, config) {
        await this._loadLabelData(dataPath);
        this.config = config;
    }

    async _loadLabelData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            this.labelData = await response.json();
        } catch (error) {
            console.error('Fehler beim Laden der Label-Daten:', error);
        }
    }

    open(clickedObject) {
        // Alle alten Labels entfernen
        this.close();

        // Label-Info aus geladenen Daten holen
        const labelInfo = this.labelData[clickedObject.name];
        if (!labelInfo) return;

        // Label erstellen (falls noch nicht vorhanden)
        let label = clickedObject.userData.pointerLabel;
        if (!label) {
            label = this._create3DLabelForObject(clickedObject, labelInfo);
            clickedObject.userData.pointerLabel = label;
            this.labels.push(label);
        }
        label.visible = true;
    }

    close() {
        // Alle Labels entfernen und Ressourcen freigeben
        this.labels.forEach(label => {
            if (label.parent) {
                // Referenz im Objekt entfernen
                if (label.parent.userData && label.parent.userData.pointerLabel === label) {
                    delete label.parent.userData.pointerLabel;
                }
                label.parent.remove(label);
            }
            if (label.material.map) {
                label.material.map.dispose();
            }
            label.material.dispose();
            label.geometry.dispose();
        });
        this.labels = [];

        // Custom event für den Highlight reset
        super.close();
    }

    setVisible(visible) {
        this.labels.forEach(label => {
            label.visible = visible;
        });
    }

    destroy() {
        this.close();
        this.labelData = {};
    }

    // Textformatierung/ Umbrüche im Terxt für die Textur schaffen
    _wrapTextAndMeasureHeight(ctx, text, x, y, maxWidth, lineHeight, draw = false) {
        if (!text) return { height: 0, lines: [] };

        const words = text.split(' ');
        let line = '';
        let currentY = y;
        let totalHeight = 0;
        const lines = [];

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                if (draw) ctx.fillText(line, x, currentY);
                lines.push(line);
                line = words[n] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        if (draw) ctx.fillText(line, x, currentY);
        lines.push(line);
        
        totalHeight = (lines.length * lineHeight);
        return { height: totalHeight, lines: lines };
    }

    _create3DLabelForObject(object3D, labelInfo) {
        // Konfiguration
        const pointerCanvasWidth = 512;
        const padding = 40;
        const fontTitle = 'bold 80px Arial';
        const lineHeightTitle = 90;
        const fontBody = '65px Arial';
        const lineHeightBody = 75;
        const fontList = '65px Arial';
        const lineHeightList = 75;
        const spaceBetweenTitleAndBody = 50;
        const spaceBetweenBodyAndList = 50;

        // Text und Canvas Größe berechnen
        const measureCanvas = document.createElement('canvas');
        const measureCtx = measureCanvas.getContext('2d');
        
        const textBlockCanvasWidth = this.config.pointerConfig.maxWidth;

        // Titel Höhe berechnen
        measureCtx.font = fontTitle;
        const titleMetrics = this._wrapTextAndMeasureHeight(measureCtx, labelInfo.title, 0, 0, textBlockCanvasWidth - (2 * padding), lineHeightTitle, false);
        const titleHeight = titleMetrics.height;

        // Body Höhe berechnen
        measureCtx.font = fontBody;
        const bodyMetrics = this._wrapTextAndMeasureHeight(measureCtx, labelInfo.body || '', 0, 0, textBlockCanvasWidth - (2 * padding), lineHeightBody, false);
        const bodyHeight = bodyMetrics.height;

        // Listenhöhe berechnen (falls vorhanden)
        let listHeight = 0;
        if (labelInfo.list && labelInfo.list.length > 0) {
            measureCtx.font = fontList;
            labelInfo.list.forEach(item => {
                const itemMetrics = this._wrapTextAndMeasureHeight(measureCtx, `• ${item}`, 0, 0, textBlockCanvasWidth - (2 * padding), lineHeightList, false);
                listHeight += itemMetrics.height;
            });
            // Platz zwischen Body und Liste hinzufügen, wenn beides vorhanden ist
            if (bodyHeight > 0) {
                listHeight += spaceBetweenBodyAndList;
            }
        }

        // Gesamthöhe berechnen
        const canvasHeight = titleHeight + spaceBetweenTitleAndBody + bodyHeight + listHeight + 2 * padding;
        const totalCanvasWidth = textBlockCanvasWidth + pointerCanvasWidth;

        // Canvas erstellen und zeichnen
        const canvas = document.createElement('canvas');
        canvas.width = totalCanvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Pointer-Seite und Text-Position bestimmen
        let pointerSide;
        if (this.config.pointerConfig.defaultSide === 'left' || this.config.pointerConfig.defaultSide === 'right') {
            pointerSide = this.config.pointerConfig.defaultSide;
        } else {
            // 'auto' label positionierung links/rechts basierend auf der Kamera position

            // Position der Kamera im 3D-Raum ermitteln
            const cameraPosition = new THREE.Vector3();
            this.camera.getWorldPosition(cameraPosition);
    
            // Position des angeklickten Objekts im 3D-Raum ermitteln
            const objectPosition = new THREE.Vector3();
            object3D.getWorldPosition(objectPosition);

            // Richtungsvektor von der Kamera zum Objekt berechnen
            const cameraToObject = objectPosition.clone().sub(cameraPosition);

            // Die lokale X-Achse des Objekts in Weltkoordinaten umwandeln
            const localXAxis = new THREE.Vector3(1, 0, 0);
            localXAxis.applyQuaternion(object3D.getWorldQuaternion(new THREE.Quaternion()));

            // Skalarprodukt berechnen (Dot Product), um die relative Ausrichtung zu bestimmen.
            const dot = cameraToObject.dot(localXAxis);

            // Aus dem Ergebnis die Seite für das Label ableiten

            // - Wenn dot > 0: Die Kamera schaut eher auf die "rechte" Seite des Objekts
            //   Das Zeigeelement kommt also auf die linke Seite

            // - Wenn dot < 0: Die Kamera schaut eher auf die "linke" Seite des Objekts
            //   Das Zeigelement wird also auf der rechten Seite platziert

            pointerSide = dot > 0 ? 'right' : 'left';
        }

        // X start Koordinate des textBlocks
        const textBlockX = (pointerSide === 'left') ? pointerCanvasWidth : 0;

        // Y-Positionen für das Zeichnen
        const titleY = padding;
        const lineY = titleY + titleHeight + (spaceBetweenTitleAndBody / 2);
        const bodyY = lineY + (spaceBetweenTitleAndBody / 2);
        let listY = bodyY + bodyHeight;
        if (bodyHeight > 0 && listHeight > 0) {
            listY += spaceBetweenBodyAndList;
        }

        // Farben aus der Config
        const colors = this.config.pointerConfig;

        // Titel zeichnen
        ctx.font = fontTitle;
        ctx.fillStyle = colors.titleColor;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        this._wrapTextAndMeasureHeight(ctx, labelInfo.title, textBlockX + padding, titleY, textBlockCanvasWidth - (2 * padding), lineHeightTitle, true);

        // Durchgehende Linie (Pointer + Divider)
        ctx.strokeStyle = colors.lineColor;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(0, lineY);
        ctx.lineTo(totalCanvasWidth, lineY);
        ctx.stroke();

        // Body zeichnen
        ctx.font = fontBody;
        ctx.fillStyle = colors.bodyColor;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        this._wrapTextAndMeasureHeight(ctx, labelInfo.body || '', textBlockX + padding, bodyY, textBlockCanvasWidth - (2 * padding), lineHeightBody, true);

        // Liste zeichnen (falls vorhanden)
        if (labelInfo.list && labelInfo.list.length > 0) {
            ctx.font = fontList;
            ctx.fillStyle = colors.bodyColor; // Gleiche Farbe wie Body
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            let currentListY = listY;
            labelInfo.list.forEach(item => {
                const wrappedItem = this._wrapTextAndMeasureHeight(ctx, `• ${item}`, textBlockX + padding, currentListY, textBlockCanvasWidth - (2 * padding), lineHeightList, true);
                currentListY += wrappedItem.height;
            });
        }

        // --- Three.js Mesh erstellen ---
        const texture = new THREE.CanvasTexture(canvas);
        const planeBaseWidth = 4;
        const aspectRatio = totalCanvasWidth / canvasHeight;
        const planeHeight = planeBaseWidth / aspectRatio;

        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide,
            depthTest: false
        });
        const geometry = new THREE.PlaneGeometry(planeBaseWidth, planeHeight);
        const textMesh = new THREE.Mesh(geometry, material);
        textMesh.renderOrder = 100000; // Ein Wert > 0 sorgt dafür, dass es nach den Standardobjekten gerendert wird

         // Pivotpunkt der Geometrie an die Spitze des Zeigers verschieben
        const pointerXOnCanvas = (pointerSide === 'left') ? 0 : totalCanvasWidth;
        const pointerXOnPlane = (pointerXOnCanvas / totalCanvasWidth - 0.5) * planeBaseWidth;
        const pointerYOnPlane = (0.5 - lineY / canvasHeight) * planeHeight;
        geometry.translate(-pointerXOnPlane, -pointerYOnPlane, 0);

        // Rotation anwenden
        if (this.config.pointerConfig.rotationY === 'auto') {
            // Kopieren der Ausrichtung der Kamera, damit das Label immer zum Benutzer zeigt.
            textMesh.quaternion.copy(this.camera.quaternion);
        } else if (this.config.pointerConfig.rotationY !== 0) {
            // Feste Rotation anwenden
            textMesh.rotation.y = THREE.MathUtils.degToRad(this.config.pointerConfig.rotationY);
        }

        // --- Position des Labels im 3D-Raum berechnen ---

        // Bounding Box des Objekts ermitteln
        const boundingBox = new THREE.Box3().setFromObject(object3D);

        // Die Größe des Objekts der Bounding Box extrahieren
        const objectSize = new THREE.Vector3();
        boundingBox.getSize(objectSize);
        //console.log(objectSize);

        // Berechnung der Ankerposition in Weltkoordinaten
        const worldPosition = new THREE.Vector3();
        const objectWorldPosition = new THREE.Vector3();
        object3D.getWorldPosition(objectWorldPosition);
        
        const adjustedPointerSide = pointerSide === 'left' ? 'right' : 'left';
        
        // Berechnung der Position am clicked Object, basierend auf der Bounding Box im Weltkoordinatensystem, mit umgekehrter Seitenlogik
        if (adjustedPointerSide === 'left') {
            // Ankerpunkt an der linken Kante des Objekts platzieren.
            worldPosition.x = boundingBox.min.x;
        } else {
            worldPosition.x = boundingBox.max.x;
        }
        
        // Für Y und Z die Mitte des Objekts nehmen
        worldPosition.y = (boundingBox.min.y + boundingBox.max.y) / 2;
        worldPosition.z = (boundingBox.min.z + boundingBox.max.z) / 2;
        
        // Weltposition in lokale Position umwandeln
        const position = worldPosition.clone();
        object3D.worldToLocal(position);
        
        textMesh.position.copy(position);
        textMesh.visible = false;
        object3D.add(textMesh);

        return textMesh;
    }
}