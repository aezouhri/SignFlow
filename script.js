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
renderer.setClearColor(0xffffff); // Set background color to white
document.body.appendChild(renderer.domElement);

// Create a group for the model and lights
const group = new THREE.Group();
scene.add(group);

// Load the GLB model
const loader = new GLTFLoader();
loader.load('hand/hand_animated_v6.glb', function (gltf) {
    const model = gltf.scene;
    model.scale.set(0.5, 0.5, 0.5);
    group.add(model);

    // Check if the GLTF file contains animations
    if (gltf.animations && gltf.animations.length > 0) {
        // Create an AnimationMixer
        const mixer = new THREE.AnimationMixer(model);

        // Load the 7th animation from the GLTF file
        const animationIndex = 5; // Index of the 7th animation
        const clip = gltf.animations[animationIndex];
        console.log(clip)
        const action = mixer.clipAction(clip);
        action.play(); // Play the animation

        // Update the mixer in the animation loop
        function updateAnimation() {
            mixer.update(0.01); // Update the animation
            requestAnimationFrame(updateAnimation);
        }
        updateAnimation();
    }
});

// Add ambient light to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // color, intensity
scene.add(ambientLight);

// Add directional light to the scene
const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // color, intensity
directionalLight.position.set(1, 1, 1); // set the position of the light
scene.add(directionalLight);

// Render the scene
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();