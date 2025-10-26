/**
 * Verwaltet die Logik für die Cards des 3D-Modells.
 * Liest eine Konfigurationsdatei und generiert entsprechende Karten, welche absolut platziert sind.
 */

import { InfoElementHandler } from './info-element-handler.js';
// Asset-URL wird von Vite beim Build aufgelöst --> für npm package benötigt
const closeIconUrl = new URL('../../assets/close.svg', import.meta.url).href;
import { animate } from 'animejs';

export class CardHandler extends InfoElementHandler {
    constructor() {
        super();
        this.cardData = null;
        this.config = null;

        this.cardElement = null;
        this.cardTitle = null;
        this.cardBody = null;
        this.cardPillRow = null;
        this.cardList = null;
        this.closeCardButton = null;
        this.cardState = null;
    }

    // --- Initialisiert den CardHandler mit dem geladenen Modell und der Konfiguration ---
    async initialize(dataPath, config) {
        this.addCardToDOM();
        this.config = config;
        await this._loadCardData(dataPath);
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

    // --- Erstellt falls nötig das CardElement im Dom ---
    addCardToDOM() {
        if (!this.cardElement) {
            // Card-HTML erzeugen
            const cardHTML = `
            <div class="infoCard bottomCard" style="display:none;">
                <div class="row">
                    <h2 class="cardTitle"></h2>
                    <button id="closeCard">
                        <img src="${closeIconUrl}" alt="close">
                    </button>
                </div>
                <p class="cardText"></p>
                <ul class="cardList"></ul>
                <div class="row">
                    <ul class="ulRow"></ul>
                </div>
            </div>
            `;
            
            // In den Container einfügen
            const container = document.getElementById('exp-container') || document.body;
            container.insertAdjacentHTML('beforeend', cardHTML);

            // Referenzen aktualisieren
            this.cardElement = container.querySelector('.infoCard');
            this.cardTitle = this.cardElement.querySelector('.cardTitle');
            this.cardBody = this.cardElement.querySelector('.cardText');
            this.cardPillRow = this.cardElement.querySelector('.ulRow');
            this.cardList = this.cardElement.querySelector('.cardList');
            this.closeCardButton = this.cardElement.querySelector('#closeCard');

            if (this.closeCardButton) {
                this._closeListener = (event) => {
                    event.stopPropagation();
                    this.close();
                };
                this.closeCardButton.addEventListener('click', this._closeListener);
            }
        }
    }

    open(clickedObject) {
        if (!clickedObject || !this.cardData){
            this.close();
            console.error('clickedObject oder Card Data nicht bereit.');
            return;
        }
        const objectName = clickedObject.name
        const cardData = this.cardData[objectName]

        // Für Elemente ohne Card
        if (!cardData) {
            //console.log(`Keine Daten für Objekt "${objectName}" gefunden.`);

            if (this.cardState !== 'closed') {
                this.close();
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

    close() {
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
        super.close();
    }

    destroy() {
        // Event-Listener entfernen
        if (this.closeCardButton && this._closeListener) {
            this.closeCardButton.removeEventListener('click', this._closeListener);
            this._closeListener = null;
        }
        // Card aus dem DOM entfernen
        if (this.cardElement && this.cardElement.parentNode) {
            this.cardElement.parentNode.removeChild(this.cardElement);
        }
        
        // Speicher freigeben
        this.cardElement = null;
        this.cardTitle = null;
        this.cardBody = null;
        this.cardPillRow = null;
        this.cardList = null;
        this.closeCardButton = null;
        this.cardData = null;
        this.config = null;
        this.cardState = null;
    }
}