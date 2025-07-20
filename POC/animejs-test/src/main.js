import { animate } from 'animejs';
import { initTweakpane } from './modules/ui-Handler.js';

let config;

async function init() {
    // Konfiguration laden
    const response = await fetch('/scene-config.json');
    config = await response.json();

    // Tweakpane UI initialisieren
    initTweakpane(config);
}

// animate .square elements
function animateSquares() {
    animate('div', {
        translateX: 250,
        backgroundColor: '#FF0000',
        duration: 2000,
        easing: 'easeInOutQuad',
        rotate: '2turn', 
    });
}

init();
animateSquares();

