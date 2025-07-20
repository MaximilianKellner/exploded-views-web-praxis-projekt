import * as THREE from 'three';

/**
 * Verwaltet die Logik für die Explosionsansicht eines 3D-Modells.
 * Liest eine Konfigurationsdatei, identifiziert bewegliche Teile im Modell
 * und aktualisiert deren Positionen in der Animationsschleife.
 */

export class AnimationHandler {
    constructor(scene, animationConfig) {
        this.scene = scene;
        this.animationConfig = animationConfig;
        this.explodableObjects = [];
        this.explosionConfig = null;
    }

    // --- Initialisiert den AnimationHandler mit dem geladenen Modell und der Konfigurationn ---
    async initialize(model, expConfigUrl) {
        await this._loadExplosionConfig(expConfigUrl);
        this._parseModel(model);
    }

    // --- Lädt die Explosions-Konfiguration von der angegebenen URL ---
    async _loadExplosionConfig(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.explosionConfig = await response.json();
            console.log('Explosions-Konfiguration geladen:', this.explosionConfig);
        } catch (error) {
            console.error('Fehler beim Laden der Explosions-Konfiguration:', error);
        }
    }

    // --- Parst das Modell und bereitet die explodierbaren Objekte vor ---
    _parseModel(model) {
        if (!model || !this.explosionConfig) {
            console.error('Modell oder Explosions-Konfiguration nicht bereit.');
            return;
        }

        // Explodierbare Objekte aus der Konfiguration
        const configObjects = this.explosionConfig.objects;

        model.traverse((child) => {
            // TODO isMesh Bug checken   if (child.isMesh && configObjects[child.name]) {
            if (configObjects[child.name]) {
                const objectConfig = configObjects[child.name];

                // expDirection lesen, fallback auf globalExpDirection
                let expDirection = objectConfig.expDirection
                if (!objectConfig.expDirection) {
                    expDirection = this.animationConfig.globalExpDirection
                }   

                // Explodierbares Objekt mit relecanten Informationen speichern
                this.explodableObjects.push({
                    object: child,
                    originalPosition: child.position.clone(),
                    level: objectConfig.level > 0 ? objectConfig.level : 0,
                    expDirection: new THREE.Vector3().fromArray(expDirection).normalize()
                });
            }
        });
        console.log('Explodierbare Objekte gefunden:', this.explodableObjects);
    }

    // --- Anwenden der Explosion auf die explodierbaren Objekte ---
    updateExplosion() {
        const { expFactor, layerDistance, globalExpDirection } = this.animationConfig;

        this.explodableObjects.forEach(item => {
            const distance = item.level * layerDistance * expFactor;
            const newPosition = new THREE.Vector3()
                .copy(item.originalPosition)
                .addScaledVector(item.expDirection, distance);
            
            item.object.position.copy(newPosition);
        });
    }
}