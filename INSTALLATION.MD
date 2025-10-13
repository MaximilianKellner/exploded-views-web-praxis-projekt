# Installationsanleitung

## 1. Installation
Laden sie die relevanten Inhalte herunter
```
npm install github:MaximilianKellner/exploded-views-web-praxis-projekt#subdirectory=Prototyp
```

## 2. Setup

fügen sie ein Container-Element in ihre HTML-Struktur ein.
```
<div id="exp-container" style="width: 100vw; height: 100vh;"></div>
```

bearbeiten sie ihre `main.js`
```
import { ExplodedViewer } from 'exploded-views';

// Ein Container-Element in Ihrer HTML (z.B. <div id="viewer"></div>)
const viewerContainer = document.getElementById('viewer');

// Optionen für die Szene
const options = {
    modelPath: '/path/to/model.glb',
    sceneConfigPath: '/path/to/scene-config.json',
    explosionConfigPath: '/path/to/exp-config.json',
    cardDataPath: 'path/to/card-content.json',
    showDebugUI: true,
    showStats: true,
};

// Viewer erstellen und initialisieren
const expViewer = new ExplodedViewer(viewerContainer, options);
expViewer.init();
```

## 3. Konfiguration
Falls sie die Standardeinstellungen  überschreiben wollen, geben sie eine `scene-config.json` an oder fügen sie optionen in die options in ihrer `main.js` ein. die Standardeinstellungen sind unter `src/config/default-options.js` zu finden.

### Beispiel für eine `scene-config.json`

```
{
    "infoElementType": "card",
    "highlightOptions": {
        "highlightComponent": false,
        "mode": "ghost"
    },
    "pointerConfig": {
        "defaultSide": "auto"
    },
    "sceneConfig": {
        "camera": {
        "position": [3.5, 2, 5],
        "lookAt": [0, 0, 0],
        "minDistance": 3.5,
        "maxDistance": 10
        }
    }
}
```

### Beispiel für die `main.js` 

```
const sportwagen = {

    // Pfad zur Szenenkonfiguration
    sceneConfigPath: '/scene-config.json', 

    // Pfad zum explodierbaren .glb Modell
    modelPath: '/911.glb', 
    
    // Pfad zur Explosions-Konfiguration
    explosionConfigPath: '/911-exp-config.json',

    // Pfad zu den Card-Inhalten
    cardDataPath: '/911-cards.json',

    showDebugUI: true,
    showStats: true,
    
    // --------------- OPTIONEN ---------------
    highlightOptions: {
        highlightComponent: true,
        mode: "ghost"
    },
}
```