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
        this.maxSequence = null;

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

        // maxSequence Bestimmen --> Anzahl der Animationsschritte / Zeitfenster
        this.maxSequence = 0;
        for (const key in configObjects) {
            const objectConfig = configObjects[key];
            if (objectConfig.sequence && isFinite(objectConfig.sequence)) {
                if (objectConfig.sequence > this.maxSequence) {
                    this.maxSequence = objectConfig.sequence;
                }
            }
        }

        // console.log("Maximale Sequenz aus Konfiguration:", this.maxSequence)

        model.traverse((child) => {
            if (configObjects[child.name]) {
                const objectConfig = configObjects[child.name];

                // expDirection lesen, fallback auf globalExpDirection
                let expDirection = objectConfig.expDirection;
                if (!objectConfig.expDirection) {
                    expDirection = this.animationConfig.globalExpDirection;
                }

                // Explodierbares Objekt mit relevanten Informationen speichern
                this.explodableObjects.push({
                    object: child,
                    originalPosition: child.position.clone(),
                    targetLevel: objectConfig.level !== undefined ? objectConfig.level : 0,
                    sequence: objectConfig.sequence !== undefined ? objectConfig.sequence : 3,
                    speedMultiplier: objectConfig.speedMultiplier || 1.0,
                    expDirection: new THREE.Vector3().fromArray(expDirection).normalize()
                });
            }
        });

        // Sortiere die Objekte nach ihrer Sequenznummer für den sequenziellen Modus
        this.explodableObjects.sort((a, b) => a.sequence - b.sequence);

        // Objekte ohne Sequenz bekommen die Maximale Sequenz +1 und werden am Ende abgespielt --> maxSequenz neu berechnen
        this.maxSequence += 1;
        
        console.log('Explodierbare Objekte gefunden und vorbereitet:', this.explodableObjects);
        console.log('Finale maximale Sequenz für Animation:', this.maxSequence);
    }

    // --- Anwenden der Explosion auf die explodierbaren Objekte ---
    updateExplosion() {
        const { expFactor, layerDistance, useSequenceAnim } = this.animationConfig;

        if (useSequenceAnim) {
            // -- Sequenzielle Animation ---  --> Objekte werden in Gruppen animiert
            if (this.maxSequence === 0) return;

            this.explodableObjects.forEach(item => {
                // Objekte ohne Animation überspringen
                if (!isFinite(item.sequence) || item.sequence === 0 || item.targetLevel === 0) {
                    item.object.position.copy(item.originalPosition);
                    return;
                }

                // "Zeitfenster" für die aktuelle Sequenz berechnen
                // Bsp.: max Sequence = 2 
                // item.sequence = 1 bewegt sich zwischen expFactor 0.0 und 0.5
                // item.sequence = 2 bewegt sich zwischen expFactor 0.5 und 1.0
                const progressStart = (item.sequence - 1) / this.maxSequence; // Start des Zeitfensters
                const progressEnd = item.sequence / this.maxSequence; // Ende des zeitfensters

                // Berechnen des lokalen Fortschritts.
                // Local Progress mapped einen Wert zwischen progressStart und progressEnd auf Basis von expFactor auf eine Lineare Funktion mit Steigung 1
                let localProgress = THREE.MathUtils.mapLinear(expFactor, progressStart, progressEnd, 0, 1);
                // Begrenzen auf Werte zwischen 0 und 1 um nur im lokalen Zeitfenster zu agieren
                localProgress = THREE.MathUtils.clamp(localProgress, 0, 1);

                // TODO: Weitere Easingsarten einfügen.
                //easing für die sequenzielle Animation
                const easedProgress = 1 - Math.pow(1 - localProgress, 3); // easeOutCubic

                // Distanz zum main Objekt basiert auf 'targetLevel', wird aber mit dem lokalen Fortschritt und Multiplikator skaliert
                const distance = item.targetLevel * layerDistance * easedProgress * item.speedMultiplier;

                // Neue Position festlegen
                const newPosition = new THREE.Vector3()
                    .copy(item.originalPosition)
                    .addScaledVector(item.expDirection, distance);

                item.object.position.copy(newPosition);
            });

        } else {
            // --- Gleichzeitige Animation --> Alle Objekte werden gleichzeitig animiert ---
            this.explodableObjects.forEach(item => {
                if (item.targetLevel > 0) {
                    const distance = item.targetLevel * layerDistance * expFactor * item.speedMultiplier;
                    const newPosition = new THREE.Vector3()
                        .copy(item.originalPosition)
                        .addScaledVector(item.expDirection, distance);
                    item.object.position.copy(newPosition);
                }
            });
        }
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