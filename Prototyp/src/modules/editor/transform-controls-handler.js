import { TransformControls } from 'three/addons/controls/TransformControls.js';

export class TransformControlsHandler {
  constructor(camera, renderer, scene) {
    this.controls = new TransformControls(camera, renderer.domElement);
    this.scene = scene;
    this.cameraHandler = null;

    // Helper der TransformControls markieren, damit er nicht selektiert wird
    this.helper = this.controls.getHelper();
    this.helper.traverse(node => {
      node.userData = node.userData || {};
      node.userData.nonSelectable = true;
    });
    this.scene.add(this.helper);

    // Bind event handlers
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);

    // TransformControls Events abfangen
    this.controls.addEventListener('mouseDown', this._onMouseDown);
    this.controls.addEventListener('mouseUp', this._onMouseUp);
  }

  setCameraHandler(cameraHandler) {
    this.cameraHandler = cameraHandler;
  }

  _onMouseDown() {
    // OrbitControls deaktivieren während Gizmo verwendet wird
    if (this.cameraHandler) {
      this.cameraHandler.setControlsEnabled(false);
    }
  }

  _onMouseUp() {
    // OrbitControls wieder aktivieren
    if (this.cameraHandler) {
      this.cameraHandler.setControlsEnabled(true);
    }
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
    this.controls.removeEventListener('mouseDown', this._onMouseDown);
    this.controls.removeEventListener('mouseUp', this._onMouseUp);
    this.scene.remove(this.helper);
    this.controls.dispose();
  }
}
