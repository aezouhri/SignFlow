import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a group for the model and lights
const group = new THREE.Group();
scene.add(group);

// Load the GLB model
const loader = new GLTFLoader();
loader.load('hand_animated_v6.glb', function (gltf) {
    const model = gltf.scene;
    model.scale.set(0.5, 0.5, 0.5);
    group.add(model);

    // Add lighting to the model
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // color, intensity
    model.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // color, intensity
    directionalLight.position.set(1, 1, 1); // set the position of the light
    model.add(directionalLight);
});

// Add animation or other logic here

// Render the scene
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();