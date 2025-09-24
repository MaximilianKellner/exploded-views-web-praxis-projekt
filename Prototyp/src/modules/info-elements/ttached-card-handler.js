/**
 * Verwaltet die Logik für die Attached Cards des 3D-Modells.
 * Liest eine Konfigurationsdatei, identifiziert geklickte Teile im Modell
 * und generiert entsprechende Karten, welche am 3D Objekt befestigt sind und ich mitbewegen.
 */

import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { InfoElementHandler } from './info-element-handler.js';

export class AttachedCardHandler extends InfoElementHandler {
    constructor() {
        super();
        this.cardData = null;
        this.config = null;
        
        // DOM / CSS2D
        this.cardElement = null;
        this.cardLabelObject = null; // CSS2DObject
        this.labelRenderer = null; // CSS2DRenderer

        this.attachedTo = null; // aktuelles Object3D, an dem die Card hängt
        this.cardState = 'closed';
    }
    
    async initialize(dataPath, config) {
        this.config = config;
        
        if (!this.labelRenderer) {
        this.labelRenderer = new CSS2DRenderer();
        this.labelRenderer.domElement.style.pointerEvents = 'none';
        //TODO fix resite issue container != window
        this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
        this.labelRenderer.domElement.style.position = 'absolute';
        this.labelRenderer.domElement.style.top = '0px';
        
        //TODO Container
        document.body.appendChild(this.labelRenderer.domElement);
        }
        
        this.addCardToDOM();
        
        if (dataPath) {
            try {
                const res = await fetch(dataPath);
                if (res.ok) this.cardData = await res.json();
            } catch (err) {
                console.error('AttachedCardHandler: Fehler beim Laden der cardData', err);
            }
        }
    }
    

    addCardToDOM() {
        if (this.cardElement) return this.cardElement;
        
        const div = document.createElement('div');
        div.classList.add('attachedCard');
        div.classList.add('infoCard');
        
        console.log(div.classList)
        div.style.display = 'none'; // Nur sichtbar, wenn open() aufgerufen wird
        div.style.pointerEvents = 'auto';
        div.innerHTML = `
        <div class="row">
            <h2 class="cardTitle"></h2>
            <button id="closeCard">
            <img src="/img/close.svg" alt="close">
            </button>
        </div>
        <p class="cardText"></p>
        <ul class="cardList"></ul>
        <div class="row">
            <ul class="ulRow"></ul>
        </div>`;
        
        this.cardElement = div;
        this.cardTitle = div.querySelector('.cardTitle');
        this.cardBody  = div.querySelector('.cardText');
        this.cardList  = div.querySelector('.cardList');
        this.cardPillRow = div.querySelector('.ulRow');
        this.closeCardButton = div.querySelector('#closeCard');
        
        if (this.closeCardButton) {
            this._closeListener = (event) => {
                event.stopPropagation();
                this.close();
            };
            this.closeCardButton.addEventListener('click', this._closeListener);
        }
        
        return this.cardElement;
    }
    
    open(clickedObject) {
        if (!clickedObject || !this.cardData) {
            this.close();
            return;
        }
        
        const name = clickedObject.name;
        const data = this.cardData?.[name];
        if (!data) { this.close(); return; }
        
        // CSS2DObject erzeugen falls es nicht erstellt ist
        if (!this.cardLabelObject) {
            this.cardLabelObject = new CSS2DObject(this.cardElement);
        }
        
        // Inhalte setzen
        this.cardTitle.textContent = data.title || '';
        this.cardBody.textContent = data.body  || '';
        this.cardList.innerHTML = '';
        if (data.list) {
            data.list.forEach(listElem => { this.cardList.innerHTML += `<li>${listElem}</li>`; });
        }
        
        this.cardPillRow.innerHTML = ''
        if (data.pills && data.pills.length > 0) {
            data.pills.forEach(pill => {
                this.cardPillRow.innerHTML += `<li class="pill">${pill}</li>`
            });
        }
        
        // an Objekt anhängen (vorher von altem entfernen)
        if (this.attachedTo) this.attachedTo.remove(this.cardLabelObject);
        clickedObject.add(this.cardLabelObject);
        this.attachedTo = clickedObject;
        
        this.cardElement.style.display = 'block';
        this.cardState = 'open';
    }
    
    close() {
        if (this.attachedTo && this.cardLabelObject) {
        this.attachedTo.remove(this.cardLabelObject);
        this.attachedTo = null;
        }
        if (this.cardElement) this.cardElement.style.display = 'none';
        this.cardState = 'closed';

        // Custom event für den Highlight reset
        const event = new CustomEvent('cardClosed');
        window.dispatchEvent(event);
    }
    
    destroy() {
        this.close();
        // renderer DOM entfernen
        if (this.labelRenderer?.domElement?.parentNode) {
        this.labelRenderer.domElement.parentNode.removeChild(this.labelRenderer.domElement);
        }
        // Referenzen freigeben
        this.labelRenderer = null;
        this.cardElement = null;
        this.cardLabelObject = null;
        this.cardData = null;
    }
}
