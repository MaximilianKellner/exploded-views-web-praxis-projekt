/*
 * Interface für Info-Element-Handler.
 * Alle Info-Element-Handler müssen diese Methoden implementieren.
 */

export class InfoElementHandler {
    
    async initialize(dataPath, config) {
        throw new Error('initialize muss implementiert werden');
    }

    open(element) {
        throw new Error('open muss implementiert werden');
    }

    close() {
        // Custom event für den Highlight reset
        const event = new CustomEvent('infoElementClosed');
        window.dispatchEvent(event);
    }

    setVisible(visible) {
        throw new Error('setVisible muss implementiert werden');
    }

    destroy() {
        throw new Error('destroy muss implementiert werden');
    }
}