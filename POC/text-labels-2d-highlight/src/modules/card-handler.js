
/**
 * Verwaltet die Logik für die Cards des 3D-Modells.
 * Liest eine Konfigurationsdatei, identifiziert geklickte Teile im Modell
 * und generiert entsprechende Karten.
 */

export class CardHandler {
    constructor(scene) {
        this.scene = scene;
        this.cardData = null;
    }

    // --- Initialisiert den CardHandler mit dem geladenen Modell und der Konfiguration ---
    async initialize(model, cardDataUrl) {
        this.model = model;
        await this._loadCardData(cardDataUrl);
    }

    // --- Lädt die Daten für die Karten ---
    async _loadCardData(cardDataUrl) {
        try {
            const response = await fetch(cardDataUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.cardData = await response.json();
            console.log('Card-Daten erfolgreich geladen:', this.cardData);
        } catch (error) {
            console.error('Fehler beim Laden der Card-Daten:', error);
        }
    }

    openCard(model) {
        if (!model || !this.cardData){
            console.error('Modell oder Card Data nicht bereit.');
            return;
        }
    }
}