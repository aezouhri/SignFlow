import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Set the desired width and height for the loader
const width = 400;
const height = 400;

// Create a scene
const scene = new THREE.Scene();

// Create a camera
const aspectRatio = width / height;
const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
camera.position.z = 5;

// Create a renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.setClearColor(0xffffff); // Set background color to white
document.body.appendChild(renderer.domElement);

// Create a group for the model and lights
const group = new THREE.Group();
scene.add(group);

// Load the GLB model
const loader = new GLTFLoader();
loader.load('hand/hand_animated_v6.glb', function (gltf) {
    const model = gltf.scene;

    // Center the model
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);

    // Scale the model
    const scaleFactor = 0.7;
    model.scale.set(scaleFactor, scaleFactor, scaleFactor);

    group.add(model);

    // Check if the GLTF file contains animations
    if (gltf.animations && gltf.animations.length > 0) {
        // Create an AnimationMixer
        const mixer = new THREE.AnimationMixer(model);

        // Find the animation by name
        const animationName = 'a_b_trans'; // Name of the animation you want to find
        const clip = gltf.animations.find((animation) => animation.name === animationName);
        console.log(clip);
        if (clip) {
            const action = mixer.clipAction(clip);
            action.play(); // Play the animation

            // Update the mixer in the animation loop
            function updateAnimation() {
                mixer.update(0.01); // Update the animation
                requestAnimationFrame(updateAnimation);
            }
            updateAnimation();
        } else {
            console.log(`Animation '${animationName}' not found.`);
        }
    }
});

// Add ambient light to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // color, intensity
group.add(ambientLight);

// Add directional light to the scene
const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // color, intensity
directionalLight.position.set(1, 1, 1); // set the position of the light
group.add(directionalLight);

// Render the scene
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();