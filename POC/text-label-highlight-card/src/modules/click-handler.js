import * as THREE from 'three';

export class ClickHandler {
    constructor(camera, scene, cardHandler) {
        this.camera = camera;
        this.scene = scene;
        this.cardHandler = cardHandler;
        this.modelChildren = [];

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.currentHighlightedObject = null;
        this.lastHighlightedObject = null;
        this.originalMaterials = new Map();
        this.wireframeMaterial = null;


        // 'this'-Kontext wird an den ClickHandler gebunden. (bei click wird nicht auf window.<> verwiesen sondern auf Clickhandler.camera, .raycaster usw.)
        this._onObjectClick = this._onObjectClick.bind(this);
    }

    initialize() {
        window.addEventListener('click', this._onObjectClick);
        window.addEventListener('cardClosed', () => this.resetHighlighting());

        this.wireframeMaterial = new THREE.MeshBasicMaterial({
            wireframe: true,
            transparent: true,
            opacity: 0.3,
            color: new THREE.Color(.4,.4,.4)

        });
    }

    // --- Verarbeitung vom click Event ---
    _onObjectClick(event) {
        // 1. Mausposition normalisieren (-1 bis +1) --> Raycaster verwendet -1 bis +1 pro achse, Mittelpunkt ist (0,0)
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

        // 2. Raycaster mit Kamera und Mausposition aktualisieren
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // 3. Schnittpunkte mit den Objekten in der Szene berechnen
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);

        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            console.log('Objekt geklickt:', clickedObject.name);

            let topLevelObject = clickedObject;

            while (topLevelObject.parent && topLevelObject.parent.parent.type !== "Scene") {
                topLevelObject = topLevelObject.parent;
                console.log('topLevelObject:', topLevelObject.name);

            }

            // 4. Den CardHandler mit dem geklickten Objekt aufrufen
            if (this.cardHandler) {
                this.cardHandler.openCard(topLevelObject);
                //console.log('topLevelObject: ',topLevelObject)
                this.highlightClickedComponent(topLevelObject);
            }
        }
    }

    highlightClickedComponent(clickedComponent) {
        this.resetHighlighting();

        // Beim 2. Klick auf ein Objekt wird der zustand wieder zurückgesetzt
        if(this.lastHighlightedObject && this.lastHighlightedObject === clickedComponent){
            this.resetHighlighting();
            this.lastHighlightedObject = null;

            // Custom event für den Highlight reset
            const event = new CustomEvent('resetOnSecondKlick');
            window.dispatchEvent(event);
            return;
        }

        this.currentHighlightedObject = clickedComponent;
        this.lastHighlightedObject = this.currentHighlightedObject;

        this.modelChildren.forEach(child => {
            //console.log('----------------------------------------------------------');
            //console.log ('child.uuid', child.uuid);
            //console.log('----------------------------------------------------------');

            if(child.uuid !== clickedComponent.uuid) {
                this._applyWireframeToObject(child);
            }
        });
    }

    _applyWireframeToObject(object){
        object.traverse((child) => {
        if(child.material && !this.originalMaterials.has(child.uuid)) {
            // Original-Material im Cache speichern
            this.originalMaterials.set(child.uuid, child.material);
                
            // Wireframe-Material zuweisen
            child.material = this.wireframeMaterial;
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

}