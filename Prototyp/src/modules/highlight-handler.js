import * as THREE from 'three';

/**
 * Verwaltet die Logik für die Hervorhebung von Komponenten.
 */


export class HighlightHandler {
    constructor(scene, highlightOptions) {
        this.scene = scene;
        this.modelChildren = [];
        this.highlightOptions = highlightOptions;

        this.currentHighlightedObject = null;
        this.lastHighlightedObject = null;
        this.originalMaterials = new Map();
        this.wireframeMaterial = null;
        this.ghostMaterial = null;
    }

    initialize() {
        this._infoElementClosedListener = () => {
            this.resetHighlighting();
            this.lastHighlightedObject = null;
        };
        window.addEventListener('infoElementClosed', this._infoElementClosedListener);

        this.wireframeMaterial = new THREE.MeshBasicMaterial({
            wireframe: true,
            transparent: true,
            opacity: 0.3,
            color: new THREE.Color(this.highlightOptions.wireframeColor)
        });

        this.ghostMaterial = new THREE.MeshStandardMaterial({
            transparent: true,
            opacity: 0.9,
            color: new THREE.Color(this.highlightOptions.ghostColor),
            metalness: 0.1,
            roughness: 0.7
        });
    }

    highlightClickedComponent(clickedComponent) {
        if (!this.highlightOptions.highlightComponent) {
            return;
        }

        this.resetHighlighting();

        // Beim 2. Klick auf ein Objekt wird der zustand wieder zurückgesetzt
        if(this.lastHighlightedObject && this.lastHighlightedObject === clickedComponent){
            this.lastHighlightedObject = null;
            return;
        }

        this.currentHighlightedObject = clickedComponent;
        this.lastHighlightedObject = this.currentHighlightedObject;

        this.modelChildren.forEach(child => {
            //console.log('----------------------------------------------------------');
            //console.log ('child.uuid', child.uuid);
            //console.log('----------------------------------------------------------');

            if (child.uuid !== clickedComponent.uuid) {
                this._applyHighlightToObject(child);
            }
        });
    }

    _applyHighlightToObject(object) {
        const materialToApply = this.highlightOptions.mode === 'ghost' ? this.ghostMaterial : this.wireframeMaterial;

        object.traverse((child) => {
            if (child.material && !this.originalMaterials.has(child.uuid)) {
                // Original-Material im Cache speichern
                this.originalMaterials.set(child.uuid, child.material);

                // Highlight-Material zuweisen
                child.material = materialToApply;
            }
        });
    }

    resetHighlighting() {
        if (!this.currentHighlightedObject && this.originalMaterials.size === 0) return;

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
        if (this.wireframeMaterial) {
            this.wireframeMaterial.dispose();
            this.wireframeMaterial = null;
        }

        if (this.ghostMaterial) {
            this.ghostMaterial.dispose();
            this.ghostMaterial = null;
        }

        this.modelChildren = [];
        this.originalMaterials = null;
        this.currentHighlightedObject = null;
        this.lastHighlightedObject = null;
        this.scene = null;
    }
}