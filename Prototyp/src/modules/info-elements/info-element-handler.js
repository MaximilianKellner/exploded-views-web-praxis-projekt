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
        throw new Error('close muss implementiert werden');
    }

    destroy() {
        throw new Error('destroy muss implementiert werden');
    }
}