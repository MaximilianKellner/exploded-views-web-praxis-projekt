import * as THREE from 'three';

export class ClickHandler {
    constructor(camera, scene, cardHandler) {
        this.camera = camera;
        this.scene = scene;
        this.cardHandler = cardHandler;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // 'this'-Kontext wird an den ClickHandler gebunden. (bei click wird nicht auf window.<> verwiesen sondern auf Clickhandler.camera, .raycaster usw.)
        this._onObjectClick = this._onObjectClick.bind(this);
    }

    initialize() {
        window.addEventListener('click', this._onObjectClick);
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

                console.log("szene" + this.scene)

            while (topLevelObject.parent && topLevelObject.parent.parent.type !== "Scene") {
                topLevelObject = topLevelObject.parent;
                console.log('topLevelObject:', topLevelObject.name);

            }

            // 4. Den CardHandler mit dem geklickten Objekt aufrufen
            if (this.cardHandler) {
                this.cardHandler.openCard(topLevelObject);
            }
        }
    }
}