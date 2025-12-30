export class EditorController {
    constructor({ scene, camera, renderer, clickHandler, animationHandler }) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.clickHandler = clickHandler;
        this.animationHandler = animationHandler;

        this.enabled = false;
        this.transformHandler = null;
        this.selectedObject = null;
        this.cameraHandler = null;

        // Bind event handlers
        this._onObjectSelected = this._onObjectSelected.bind(this);
        this._onObjectDeselected = this._onObjectDeselected.bind(this);
        this._onTransformChange = this._onTransformChange.bind(this);
    }

    enable() {
        // === EDIT MODE AKTIVIEREN ===
        this.enabled = true;
        
        // InfoElements ausblenden (Cards/Pointer)
        this.infoElementHandler?.setVisible(false);
                    
        // Scroll-Listener deaktivieren
        this.animationHandler?.removeScrollListener();
        
        // UI-Handler (Tweakpane) ausblenden
        this.uiHandler?.hide();
        
        // ClickHandler in Edit-Mode setzen
        this.clickHandler?.setEditMode(true);

        // Object Selection Event Listener aktivieren
        window.addEventListener('ev:objectSelected', this._onObjectSelected);
        window.addEventListener('ev:objectDeselected', this._onObjectDeselected);

        // CameraHandler an TransformHandler übergeben für Gizmo-Interaktion
        if (this.transformHandler) {
            this.transformHandler.setCameraHandler(this.cameraHandler);
            
            // Listener für Transform-Änderungen hinzufügen, um Animationen synchron zu halten
            if (this.transformHandler.controls) {
                this.transformHandler.controls.addEventListener('change', this._onTransformChange);
            }
        }
    }

    disable() {
        // === VIEWER MODE WIEDERHERSTELLEN ===
        this.enabled = false;

        // InfoElements wieder anzeigen
        this.infoElementHandler?.setVisible(true);
        
        // Scroll-Listener wieder aktivieren
        this.animationHandler?.initScrollListener();
        
        // UI-Handler wieder anzeigen
        this.uiHandler?.show();
        
        // ClickHandler zurück in Viewer-Mode
        this.clickHandler?.setEditMode(false);

        // Object Selection Event Listener deaktivieren
        window.removeEventListener('ev:objectSelected', this._onObjectSelected);
        window.removeEventListener('ev:objectDeselected', this._onObjectDeselected);

        // Listener für Transform-Änderungen entfernen
        if (this.transformHandler && this.transformHandler.controls) {
            this.transformHandler.controls.removeEventListener('change', this._onTransformChange);
        }

        // Gizmo von ausgewähltem Objekt entfernen
        if (this.selectedObject) {
            this.transformHandler?.detach();
            this.selectedObject = null;
        }
    }

    // Event Handler für Objektauswahl
    _onObjectSelected(event) {
        const { object, UUID } = event.detail;
        
        // Vorheriges Objekt deselektieren
        if (this.selectedObject !== object) {
            this.transformHandler?.detach();
        }

        // Neues Objekt selektieren und Gizmo anhängen
        this.selectedObject = object;
        this.transformHandler?.attach(object);
        
        console.log('EditorController: Objekt mit Gizmo ausgewählt:', object.name);
    }

    // Event Handler für Objektdeselection
    _onObjectDeselected(event) {
        const { object, UUID } = event.detail;
        
        // Gizmo entfernen wenn es das ausgewählte Objekt ist
        if (this.selectedObject === object) {
            this.transformHandler?.detach();
            this.selectedObject = null;
            console.log('EditorController: Objekt deselektiert:', object.name);
        }
    }

    setInfoElementHandler(handler) {
        this.infoElementHandler = handler;
    }

    setUIHandler(handler) {
        this.uiHandler = handler;
    }

    // Event Handler für Transform-Änderungen (Verschieben/Rotieren/Skalieren)
    // Wird aufgerufen, wenn der Nutzer ein Objekt mit dem Gizmo manipuliert.
    _onTransformChange() {
        if (this.selectedObject && this.animationHandler) {
            // Aktualisiert die Originalposition im AnimationHandler, damit die Animation
            // relativ zur neuen Position korrekt berechnet wird.
            this.animationHandler.updateOriginalPosition(this.selectedObject);
        }
    }
}
