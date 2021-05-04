import "./style.css";
import * as THREE from 'three';
import gsap from 'gsap';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import * as dat from 'dat.gui';
import testVertexShader from './shaders/galaxy/vertex.glsl';
import testFregmentShader from './shaders/galaxy/fragment.glsl';
const canvas = document.querySelector('.webgl');

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
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
parameters.size = 3;
parameters.radius = 1.6;
parameters.branches = 1;
parameters.spin = 0;
parameters.randomness = 3;
parameters.randomnessPower = 4;
parameters.insideColor = "#110ad1";
parameters.outsideColor = "#000000";


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
    const scales = new Float32Array(parameters.count * 1);
    const randomness = new Float32Array(parameters.count * 3);
    for (let i =0; i< parameters.count; i++) {
        
        const i3 = i*3;

        const radius = Math.random() * parameters.radius;
        const single = radius * parameters.spin;
        const branchAngle = i % parameters.radius / parameters.branches * Math.PI * 2;

 

        positions[i3] = Math.cos(branchAngle + single) * radius + 0 ;
        positions[i3+1] = Math.sin(branchAngle );
        positions[i3+2] = Math.sin(branchAngle + single) * radius + 0;


        randomness[i] = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness;
        randomness[i + 1] = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness;
        randomness[i + 2] = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness;




        const mixedColor = insideColor.clone();
        mixedColor.lerp(outsideColor, radius/ parameters.radius);

        colors[i3+0] = mixedColor.r;
        colors[i3+1] = mixedColor.g;
        colors[i3+2] = mixedColor.b;

        scales[i] = Math.random() * 10;

    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions,3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors,3));
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(scales, 1))

    // Material 

    material = new THREE.ShaderMaterial({
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        vertexShader: testVertexShader,
        fragmentShader: testFregmentShader,
        uniforms: {
            uSize: {value: parameters.size * renderer.getPixelRatio()},
            uTime: {value: 0}
        }
    });

    // Points

    points = new THREE.Points(geometry, material);

    scene.add(points);


}



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
const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.01, 100);
camera.position.z = 0;
camera.position.y = 3;
camera.position.x = 0;
const control = new OrbitControls(camera, canvas)
control.enableDamping = true;
scene.add(camera);

gsap.to(camera.position, 2, {x: -2.3557091951144695, y: 4.397199929223067, z: 27.298382530740952})
//render
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true});
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
generateGalaxy();
const clock = new THREE.Clock();

const tick = () => {
    control.update();
    // Clock
    console.log(camera.position);
    console.log(camera.rotation);
    const elapsedTime = clock.getElapsedTime()
    material.uniforms.uTime.value = elapsedTime % 20;
    // Render 
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
}
tick()