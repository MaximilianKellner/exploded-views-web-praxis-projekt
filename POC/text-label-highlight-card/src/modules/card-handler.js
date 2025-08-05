
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

        if (this.closeCardButton) {
            this.closeCardButton.addEventListener('click', () => this.closeCard());
            window.addEventListener('resetOnSecondKlick', () => this.closeCard());
        }
    }

    // --- Initialisiert den CardHandler mit dem geladenen Modell und der Konfiguration ---
    async initialize(cardDataUrl) {
        console.log("initializing CardHandler");

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

    openCard(clickedObject) {

        animate('.infoCard', { 
            translateY: ['100%', '0%'],  // Von unten nach oben
            easing: 'easeInCubic',
        });

        if (!clickedObject || !this.cardData){
            this.closeCard();
            console.error('clickedObject oder Card Data nicht bereit.');
            return;
        }
        const objectName = clickedObject.name
        const cardData = this.cardData[objectName]

        if (cardData) {

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
        } else {
            this.closeCard();
        }
    }

    closeCard(){
        if(this.cardElement) {
            animate('.infoCard', { 
                translateY: ['0%', '100%'],  // Von oben nach unten
                ease: 'inOut(8)',
            });
            //this.cardElement.style.display = 'none';
        }

        // Custom event für den Highlight reset
        const event = new CustomEvent('cardClosed');
        window.dispatchEvent(event);
    }
}