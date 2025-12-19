import { TransformControls } from 'three/addons/controls/TransformControls.js';

export class TransformControlsHandler {
  constructor(camera, renderer, scene) {
    this.controls = new TransformControls(camera, renderer.domElement);
    this.scene = scene;
    this.scene.add(this.controls);
  }

  attach(object) {
    this.controls.attach(object);
  }

  detach() {
    this.controls.detach();
  }

  setMode(mode) {
    this.controls.setMode(mode);
  }

  dispose() {
    this.scene.remove(this.controls);
    this.controls.dispose();
  }
}
