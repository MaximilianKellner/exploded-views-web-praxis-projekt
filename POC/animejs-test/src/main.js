import { initTweakpane } from './modules/ui-Handler.js';
import { animate } from 'animejs';

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
    animate('.square', {
        translateX: 250,
        backgroundColor: '#fdc505',
        duration: 2000,
        easing: 'easeInOutQuad',
        rotate: '2turn', 
        loop: true,
        autostart: true,
        alternate: true,
    });
}

/*
function expSimulatorAnimation() {
    const expSimulator = document.querySelector('.exp-simulator');
    animate(expSimulator, {
        width: '100%',
        duration: 5000,
        easing: 'easeInOutQuad',
        loop: true,
        alternate: true,
    });
}
*/

init();
animateSquares();

//expSimulatorAnimation();