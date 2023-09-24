import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Set the desired width and height for the loader
const width = 640;
const height = 465;

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

// Access the video and canvas elements
const videoElement = document.getElementById('videoElement');
const canvasElement = document.getElementById('canvasElement');
const canvasContext = canvasElement.getContext('2d');

// Check if the browser supports getUserMedia
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // Request access to the camera
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function(stream) {
            // Set the video source to the camera stream
            videoElement.srcObject = stream;
        })
        .catch(function(error) {
            console.error('Error accessing the camera:', error);
        });
} else {
    console.error('getUserMedia is not supported by this browser.');
}

// Load the GLB model
const loader = new GLTFLoader();
loader.load('hand/hand_animated_v6.glb', function (gltf) {
    const model = gltf.scene;

    // Center the model
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
    model.position.y -= 2; // Move the model more down

    // Scale the model
    const scaleFactor = 0.9;
    model.scale.set(scaleFactor, scaleFactor, scaleFactor);

    // Add the model to the model section
    const modelSection = document.querySelector('.model-section');
    modelSection.appendChild(renderer.domElement);

    group.add(model);

    // Check if the GLTF file contains animations
    if (gltf.animations && gltf.animations.length > 0) {
        // Create an AnimationMixer
        const mixer = new THREE.AnimationMixer(model);

        // Find the animation by name
        let animationName = ''; // Initialize animationName variable

        // Get the input element
        const animationInput = document.getElementById('animationInput');
        const submitButton = document.getElementById('submitButton');

        // Add event listener to update animationName when input changes
        animationInput.addEventListener('input', function() {
            animationName = animationInput.value;
        });

        // Add event listener to submit button to update animationName
        submitButton.addEventListener('click', function() {
            animationName = animationInput.value;
            playAnimationByName(animationName)
            
        });

        // Add event listener to submit button to update animationName on enter key press
        animationInput.addEventListener('keyup', function(event) {
            if (event.keyCode === 13) {
                animationName = animationInput.value;
                playAnimationByName(animationName)            }
        });
        
        function playAnimationByName(animationName) {
            const animations = [];
            for (let i = 0; i < animationName.length; i++) {
                animations.push(`${animationName[i]}_hand`);
            }
            console.log(animations);
        
            // Stop any currently playing animation
            mixer.stopAllAction();
        
            // Play the animations if found with a delay between each animation
            animations.forEach((anim, index) => {
                const clip = gltf.animations.find((animation) => animation.name === anim);
                if (clip) {
                    const action = mixer.clipAction(clip);
                    action.reset(); // Reset the animation to its initial state
                    action.timeScale = -1; // Set the animation speed to 1 (normal speed)
                    action.play();
                    
                } else {
                    console.log(`Animation '${anim}' not found.`);
                }
            });
        
            // Update the mixer in the animation loop
            function updateAnimation() {
                mixer.update(0.001); // Update the animation
                requestAnimationFrame(updateAnimation);
            }
            setTimeout(updateAnimation() , 500);
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