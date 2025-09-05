
/**
 * Verwaltet die Logik für die Cards des 3D-Modells.
 * Liest eine Konfigurationsdatei, identifiziert geklickte Teile im Modell
 * und generiert entsprechende Karten.
 */
import { animate } from 'animejs';

export class CardHandler {
    constructor() {
        this.cardData = null;

        // Referenzen auf die HTML-Elemente der Karte
        this.cardElement = document.querySelector('.infoCard');
        this.cardTitle = document.querySelector('.cardTitle');
        this.cardBody = document.querySelector('.cardText');
        this.cardPillRow = document.querySelector('.ulRow');
        this.cardList = document.querySelector('.cardList');
        this.closeCardButton = document.getElementById('closeCard');
        this.cardState = 'closed';
        this.config = null

        if (this.closeCardButton) {
            this.closeCardButton.addEventListener('click', (event) => {
                // Event-Ausbreitung stoppen
                event.stopPropagation();
                this.closeCard()
            });
        }
    }

    // --- Initialisiert den CardHandler mit dem geladenen Modell und der Konfiguration ---
    async initialize(cardDataUrl, config) {
        this.config = config;
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
            console.log('Card-Daten erfolgreich geladen');
            //console.log(this.cardData);
        } catch (error) {
            console.error('Fehler beim Laden der Card-Daten:', error);
        }
    }

    openCard(clickedObject) {

        if (!clickedObject || !this.cardData){
            this.closeCard();
            console.error('clickedObject oder Card Data nicht bereit.');
            return;
        }
        const objectName = clickedObject.name
        const cardData = this.cardData[objectName]

        // Für Elemente ohne Card
        if (!cardData) {
            //console.log(`Keine Daten für Objekt "${objectName}" gefunden.`);

            if (this.cardState !== 'closed') {
                this.closeCard();
            }
            return;
        }

        animate('.infoCard', {
            translateY: ['100%', '0%'],  // Von unten nach oben
            easing: 'easeInCubic',
            duration: this.config.cardConfig.animationDuration,
            onComplete: () => {
                this.cardState = 'open';
            },
        });

        if (cardData) {
            this.cardState = 'animating';

            //console.log('cardData', cardData)

            this.cardTitle.textContent = cardData.title || 'Information';
            this.cardBody.textContent = cardData.body || '';

            this.cardPillRow.innerHTML = ''
            if (cardData.pills && cardData.pills.length > 0) {
                cardData.pills.forEach(pill => {
                    this.cardPillRow.innerHTML += `<li class="pill">${pill}</li>`
                });
            }

            this.cardList.innerHTML = ''
            if (cardData.list) {
                cardData.list.forEach(listElem => {
                    this.cardList.innerHTML += `<li>${listElem}</li>`
                })
            }
        
            this.cardElement.style.display = 'block';
        }
    }

    closeCard(){
    if (this.cardElement && this.cardState !== 'closed') {
            this.cardState = 'animating';

            animate('.infoCard', { 
                translateY: ['0%', '100%'],  // Von oben nach unten
                ease: 'inOut(8)',
                duration: this.config.cardConfig.animationDuration,
                onComplete: () => {
                    this.cardState = 'closed';
                },
            });
            //this.cardElement.style.display = 'none';
        }

        // Custom event für den Highlight reset
        const event = new CustomEvent('cardClosed');
        window.dispatchEvent(event);
    }
}