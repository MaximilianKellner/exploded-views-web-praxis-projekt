import * as THREE from 'three';
import { animate } from 'animejs';

/**
 * Verwaltet die Logik für die Explosionsansicht eines 3D-Modells.
 * Liest eine Konfigurationsdatei, identifiziert bewegliche Teile im Modell
 * und aktualisiert deren Positionen in der Animationsschleife.
 */

export class AnimationHandler {
    constructor(scene, config, renderer) {
        this.scene = scene;
        this.config = config;
        this.renderer = renderer;
        this.animationConfig = config.animationConfig;
        this.explodableObjects = [];
        this.explosionConfig = null;
        this.animation = null;

        this.isAnimating = false;
        this.isReversed = false;
        this.isPaused = false;
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
                    targetLevel: objectConfig.level > 0 ? objectConfig.level : 0,
                    expDirection: new THREE.Vector3().fromArray(expDirection).normalize()
                });
            }
        });
        console.log('Explodierbare Objekte gefunden:', this.explodableObjects);
    }

    // --- Anwenden der Explosion auf die explodierbaren Objekte ---
    updateExplosion() {
        const { expFactor, layerDistance } = this.animationConfig;

        this.explodableObjects.forEach(item => {
            const distance = item.targetLevel * layerDistance * expFactor;
            const newPosition = new THREE.Vector3()
                .copy(item.originalPosition)
                .addScaledVector(item.expDirection, distance);
            
            item.object.position.copy(newPosition);
        });
    }

    // --- Aktuellen Status der Animation abfragen ---
    getAnimationState() {
        return {
            isAnimating: this.isAnimating,
            isReversed: this.isReversed,
            isPaused: this.isPaused,
            currentProgress: this.config.animationConfig.expFactor
        }
    }
    
    // --- Play/ Pause Animation ---
    toggleAnimation() {
        if (this.isAnimating){
            this.pauseAnimation();
        } else {
            this.startAnimation();
        }
    }

    pauseAnimation() {
        this.isAnimating = false;
        this.isPaused = true;
        if (this.animation) {
            this.animation.pause();
        }
    }

    // --- Starten der Animation ---
    startAnimation(){
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.isPaused = false;

        // Zielwert der Animation basierend auf der Richtung bestimmen
        let target = this.isReversed ? 0 : 1;

        // Animiere den expFactor von seinem aktuellen Wert auf 1
        this.animation = animate(this.config.animationConfig,{
            expFactor: target,
            duration: this.config.animationConfig.animationDuration || 1000, // Dauer in ms
            ease: 'inOut(8)',
            onUpdate: () => {
            },
            onComplete: () => {
                this.isAnimating = false;
                // Nur wenn die Animation vollständig abgeschlossen ist,
                // wird die Richtung umgekehrt für die nächste Animation
                if ((target === 1 && this.config.animationConfig.expFactor >= 0.99) || 
                    (target === 0 && this.config.animationConfig.expFactor <= 0.01)) {
                    this.isReversed = !this.isReversed;
                }
            }
        });
    }

    setExplosionFactorAnimated(targetExplosionFactor) {
        // Begrenzen des Faktors auf 0 bis 1 --> Auf und abrunden auf 0 bzw. 1
        targetExplosionFactor = Math.min(Math.max(targetExplosionFactor, 0), 1);
        
        // Animiere zum Zielwert
        animate(this.config.animationConfig, {
            expFactor: targetExplosionFactor,
            duration: 300, // Dauer der Glättung in ms
            easing: 'easeOutQuad', // Sanfte Abflachung am Ende
        });
    }

    // --- Initialisieren der Scrollanimation ---
    initScrollListener() {
        this.scrollSensitivity = this.config.animationConfig.scrollSensitivity || 0.01;
        let targetExplosionFactor = this.config.animationConfig.expFactor;

        // Event-Listener für scrollen auf der Seite
        this.renderer.domElement.addEventListener('wheel', (event) => {
            event.preventDefault();
            
            if(this.config.animationConfig.allowScrollAnimation === false){
                return;
            }

            // Explosionsfaktor anpassen
            targetExplosionFactor += event.deltaY * this.scrollSensitivity;
            
            targetExplosionFactor = Math.min(Math.max(targetExplosionFactor, 0), 1);

            this.setExplosionFactorAnimated(targetExplosionFactor);

        }, { passive: false });
    }
}