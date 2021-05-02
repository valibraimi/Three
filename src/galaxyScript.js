import "./style.css";
import * as THREE from 'three';
import gsap from 'gsap';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import * as dat from 'dat.gui';

const canvas = document.querySelector('.webgl');

const sizes = {
    width: 1400 * 1.4,
    height: 800 * 1.33
}
// Debug
const gui = new dat.GUI();

// Scene
const scene = new THREE.Scene();

// textures
const textureLoader = new THREE.TextureLoader();

// lights 
const amientLight = new THREE.AmbientLight('#ffffff', 0.4);
scene.add(amientLight)

//Galaxy 
const parameters = {}
parameters.count = 100000;
parameters.size = 0.01;
parameters.radius = 5;
parameters.branches = 3;
parameters.spin = 1;
parameters.randomness = 2;
parameters.randomnessPower = 1;
parameters.insideColor = "#ff6030";
parameters.outsideColor = "#1b3984";


let geometry = null;
let material = null;
let points = null; 

const generateGalaxy = () => {
    if(points !==null) {
        geometry.dispose()
        material.dispose()
        scene.remove(points);
    }
    const insideColor = new THREE.Color(parameters.insideColor);
    const outsideColor = new THREE.Color(parameters.outsideColor);



    geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);
    for (let i =0; i< parameters.count; i++) {
        
        const i3 = i*3;

        const radius = Math.random() * parameters.radius;
        const single = radius * parameters.spin;
        const branchAngle = i % parameters.radius / parameters.branches * Math.PI * 2;

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness;
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness;
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness;


        positions[i3] = Math.cos(branchAngle + single) * radius + randomX;
        positions[i3+1] = randomY;
        positions[i3+2] = Math.sin(branchAngle + single) * radius + randomZ;


        const mixedColor = insideColor.clone();
        mixedColor.lerp(outsideColor, radius/ parameters.radius);

        colors[i3+0] = mixedColor.r;
        colors[i3+1] = mixedColor.g;
        colors[i3+2] = mixedColor.b;

    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions,3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors,3));

    // Material 

    material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    });

    // Points

    points = new THREE.Points(geometry, material);

    scene.add(points);


}


generateGalaxy();
// GUI

gui.add(parameters, 'count').min(100).max(100000).step(100).onFinishChange(generateGalaxy);
gui.add(parameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy);
gui.add(parameters, 'radius').min(0.5).max(20).step(0.1).onFinishChange(generateGalaxy);
gui.add(parameters, 'branches').min(1).max(20).step(1).onFinishChange(generateGalaxy);
gui.add(parameters, 'spin').max(5).min(-5).step(0.001).onFinishChange(generateGalaxy);
gui.add(parameters, 'randomness').max(2).min(0).step(0.1).onFinishChange(generateGalaxy);
gui.add(parameters, 'randomnessPower').max(10).min(1).step(0.001).onFinishChange(generateGalaxy);
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy);
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy);

//camera 
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.01, 100);
camera.position.z = 0;
camera.position.y = 12;
camera.position.x = 2;
const control = new OrbitControls(camera, canvas)
control.enableDamping = true;
scene.add(camera);

//render
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true});
renderer.setSize(sizes.width, sizes.height)


const clock = new THREE.Clock();

const tick = () => {
    control.update();
    // Clock
    const elapsedTime = clock.getElapsedTime()
    
    // Render 
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
}
tick()