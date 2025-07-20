import * as THREE from 'three';

export class AnimationHandler {
    constructor(scene, animationConfig) {
        this.scene = scene;
        this.animationConfig = animationConfig;
        this.explodableObjects = [];
        this.explosionConfig = null;
    }

    async initialize(model, expConfigUrl) {
        await this._loadExplosionConfig(expConfigUrl);
        this._parseModel(model);
    }

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

    _parseModel(model) {
        if (!model || !this.explosionConfig) {
            console.error('Modell oder Explosions-Konfiguration nicht bereit.');
            return;
        }

        const configObjects = this.explosionConfig.objects;

        model.traverse((child) => {
            // TODO isMesh Bug checken   if (child.isMesh && configObjects[child.name]) {
            if (configObjects[child.name]) {
                const objectConfig = configObjects[child.name];

                this.explodableObjects.push({
                    object: child,
                    originalPosition: child.position.clone(),
                    level: objectConfig.level > 0 ? objectConfig.level : 0,
                    expDirection: objectConfig.expDirection ? new THREE.Vector3().fromArray(objectConfig.expDirection).normalize() : new THREE.Vector3().fromArray(this.animationConfig.globalExpDirection)
                });
            }
        });
        console.log('Explodierbare Objekte gefunden:', this.explodableObjects);
    }

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