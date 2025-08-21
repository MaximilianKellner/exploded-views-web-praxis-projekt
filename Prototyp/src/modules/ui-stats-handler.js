import Stats from 'stats.js'

export class StatsHandler {
    constructor() {
        this.fpsStats = new Stats();
        this.fpsStats.showPanel(0); // 0: fps, 1: ms
        this.fpsStats.dom.style.cssText = 'position:absolute;top:0px;left:0px;';

        document.body.appendChild(this.fpsStats.dom);

        this.latencyStats = new Stats();
        this.latencyStats.showPanel(1);
        this.latencyStats.dom.style.cssText = 'position:absolute;top:0px;left:80px;'; // Position neben dem FPS-Panel

        document.body.appendChild(this.latencyStats.dom);
    }

    update() {
        if (this.fpsStats) {
            this.fpsStats.update();
        }

        
        if (this.latencyStats) {
            this.latencyStats.update();
        }
    }
}