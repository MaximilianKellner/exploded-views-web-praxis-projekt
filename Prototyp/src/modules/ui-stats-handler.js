import Stats from 'stats.js'

export class StatsHandler {
    constructor() {
        this.fpsStats = new Stats();
        this.fpsStats.showPanel(0); // 0: fps, 1: ms
        this.fpsStats.dom.style.cssText = 'position:absolute;top:0px;left:0px;';

        document.body.appendChild(this.fpsStats.dom);
    }

    update() {
        if (this.fpsStats) {
            this.fpsStats.update();
        }
    }
}