import * as THREE from 'three';

export class ClickHandler {
    constructor(camera, scene, infoElementHandler, renderer, highlightOptions) {
        this.camera = camera;
        this.scene = scene;
        this.infoElementHandler = infoElementHandler;
        this.modelChildren = [];
        this.renderer = renderer;
        this.highlightOptions = highlightOptions || { mode: 'wireframe' };

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.currentHighlightedObject = null;
        this.lastHighlightedObject = null;
        this.originalMaterials = new Map();
        this.wireframeMaterial = null;
        this.ghostMaterial = null;

        // 'this'-Kontext wird an den ClickHandler gebunden. (bei click wird nicht auf window.<> verwiesen sondern auf Clickhandler.camera, .raycaster usw.)
        this._onObjectClick = this._onObjectClick.bind(this);
    }

    initialize() {
        window.addEventListener('click', this._onObjectClick);
            
        this._cardClosedListener = () => {
            this.resetHighlighting();
            this.lastHighlightedObject = null;
        };
        window.addEventListener('cardClosed', this._cardClosedListener);


        this.wireframeMaterial = new THREE.MeshBasicMaterial({
            wireframe: true,
            transparent: true,
            opacity: 0.3,
            color: new THREE.Color(.4,.4,.4)
        });

        this.ghostMaterial = new THREE.MeshStandardMaterial({
            transparent: true,
            opacity: 0.9,
            color: new THREE.Color(0.7, 0.7, 0.7),
            metalness: 0.1,
            roughness: 0.7
        });
    }

    // --- Verarbeitung vom click Event ---
    _onObjectClick(event) {
        // Die Bounding Box des Canvas-Elements abrufen
        const rect = this.renderer.domElement.getBoundingClientRect();

        // 1. Mausposition normalisieren (-1 bis +1) --> Raycaster verwendet -1 bis +1 pro achse, Mittelpunkt ist (0,0) basierend auf dem canvas
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // 2. Raycaster mit Kamera und Mausposition aktualisieren
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // 3. Schnittpunkte mit den Objekten in der Szene berechnen
        let intersects = this.raycaster.intersectObjects(this.scene.children, true);

        // 4. Filtern von helper Elementen
        const filteredIntersects = this._filterHelperElements(intersects);

        intersects = filteredIntersects;

        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            console.log('Objekt geklickt:', clickedObject.name);

            let topLevelObject = this._findTopLevelObject(clickedObject);

            // 5. Den infoElementHandler mit dem geklickten Objekt aufrufen
            if (this.infoElementHandler) {
                this.infoElementHandler.open(topLevelObject);
                //console.log('topLevelObject: ',topLevelObject)
                this.highlightClickedComponent(topLevelObject);
            }
        }
    }

    // --- Helperelemente sollen nicht clickable sein ---
    _filterHelperElements(elements){
        return elements.filter(element => {
            return !(element.object instanceof THREE.AxesHelper || 
                element.object instanceof THREE.GridHelper ||(element.object.parent && element.object.parent.name === 'Coordinatesystem'));
        });
    }

    _findTopLevelObject(clickedObject){
        while (clickedObject.parent && clickedObject.parent.parent.type !== "Scene") {
            clickedObject = clickedObject.parent;
            console.log('topLevelObject:', clickedObject.name);
        }

        const topLevelObject = clickedObject
        return topLevelObject
    }

    highlightClickedComponent(clickedComponent) {
        this.resetHighlighting();

        // Beim 2. Klick auf ein Objekt wird der zustand wieder zurückgesetzt
        if(this.lastHighlightedObject && this.lastHighlightedObject === clickedComponent){
            this.lastHighlightedObject = null;

            if (this.infoElementHandler) {
                this.infoElementHandler.close();
            }
        return;
        }

        this.currentHighlightedObject = clickedComponent;
        this.lastHighlightedObject = this.currentHighlightedObject;

        this.modelChildren.forEach(child => {
            //console.log('----------------------------------------------------------');
            //console.log ('child.uuid', child.uuid);
            //console.log('----------------------------------------------------------');

            if(child.uuid !== clickedComponent.uuid) {
                this._applyHighlightToObject(child);
            }
        });
    }

    _applyHighlightToObject(object){
        const materialToApply = this.highlightOptions.mode === 'ghost' ? this.ghostMaterial : this.wireframeMaterial;

        object.traverse((child) => {
        if(child.material && !this.originalMaterials.has(child.uuid)) {
            // Original-Material im Cache speichern
            this.originalMaterials.set(child.uuid, child.material);
                
            // Highlight-Material zuweisen
            child.material = materialToApply;
            }
        });
    }

    resetHighlighting() {
        if (!this.currentHighlightedObject) return;
        
        // Alle gespeicherten Materialien wiederherstellen
        this.originalMaterials.forEach((material, uuid) => {
            this.scene.traverse((child) => {
                if (child.uuid === uuid) {
                    child.material = material;
                }
            });
        });
        // Cache leeren
        this.originalMaterials.clear();
        this.currentHighlightedObject = null;
    }

    destroy() {
        // Event-Listener entfernen
        window.removeEventListener('click', this._onObjectClick);
        if (this._cardClosedListener) {
            window.removeEventListener('cardClosed', this._cardClosedListener);
            this._cardClosedListener = null;
        }

        if (this.wireframeMaterial) {
            this.wireframeMaterial.dispose();
            this.wireframeMaterial = null;
        }

        if (this.ghostMaterial) {
            this.ghostMaterial.dispose();
            this.ghostMaterial = null;
        }

        // Speicher freigeben
        this.infoElementHandler = null;
        this.renderer = null;
        this.modelChildren = [];
        this.raycaster = null;
        this.mouse = null;
        this.originalMaterials = null;
        this.currentHighlightedObject = null;
        this.lastHighlightedObject = null;
        this.scene = null;
        this.camera = null;
    }
}