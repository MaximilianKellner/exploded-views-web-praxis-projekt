import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, controls, textMesh;

init();
animate();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 5);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);

    // Text als 3D-Objekt (Plane mit Textur)
    const canvas = document.createElement('canvas');
    canvas.width = 512 *2;
    canvas.height = canvas.width / 4;
    // Canvas für den Text erstellen
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Hintergrund transparent
    ctx.fillStyle = 'hsla(360 0% 0% / 0.1)'; // canvas Hintergrundfarbe
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Titel Text
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('Drehbares Textlabel', 25, 25);

    // Divider Linie
    const dividerLineY = canvas.height / 2 - 32; // Y-Position der Divider-Linie
    const dividerLineWidthPadding = 25; // Breite der Divider-Linie
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0 + dividerLineWidthPadding, dividerLineY);
    ctx.lineTo(canvas.width - dividerLineWidthPadding, dividerLineY);
    ctx.stroke();

    //Body Text
    ctx.font = '32px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Dies ist ein Beispieltext für den Body text vom Textlabel.', 25, canvas.height / 2 + 10);

    // Canvas in Textur umwandeln und auf Plane anwenden
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({ 
        map: texture, 
        transparent: true, 
        side: THREE.DoubleSide // Von beiden Seiten sichtbar
    });
    const geometry = new THREE.PlaneGeometry(4, 1);
    textMesh = new THREE.Mesh(geometry, material);
    textMesh.position.set(0, 0, 0);
    scene.add(textMesh);

    window.addEventListener('resize', onWindowResize, false);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}