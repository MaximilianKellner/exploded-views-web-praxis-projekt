export class EditorController {
    constructor({ scene, camera, renderer, clickHandler, animationHandler }) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.clickHandler = clickHandler;
        this.animationHandler = animationHandler;

        this.enabled = false;
        this.transformHandler = null;
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
    }
}
