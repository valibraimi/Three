import "./style.css";
import * as THREE from 'three';
import gsap from 'gsap';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import * as dat from 'dat.gui';
import * as CANNON from 'cannon-es';
import { CubeTextureLoader } from "three";
import testVertexShader from './shaders/test/vertex.glsl';
import testFregmentShader from './shaders/test/fragment.glsl';
const canvas = document.querySelector('.webgl');


const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
// Debug
const gui = new dat.GUI();
const debugObj = {};





// Scene
const scene = new THREE.Scene();

// textures
const textureLoader = new THREE.TextureLoader();

const flag = textureLoader.load('/textures/albania-flag.png')
// Sounds



// Physics 
// World





// Elems

const geometry = new THREE.PlaneBufferGeometry(1,1,100,100);

const count = geometry.attributes.position.count;

const randoms = new Float32Array(count);

for (let i=0; i < count; i++) {
    randoms[i] = Math.random();
}
geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));

const material = new THREE.RawShaderMaterial({
    vertexShader: testVertexShader,
    fragmentShader: testFregmentShader,
    wireframe: true,
    uniforms: 
    {
       uFrequency: { value: new THREE.Vector2(10,5) },
       uTime: {value: 0},
       uColor: {value: new THREE.Color('orange')},
       uTexture: {value: flag}
    }
})

gui.add(material.uniforms.uFrequency.value, 'x').min(0).max(20)
gui.add(material.uniforms.uFrequency.value, 'y').min(0).max(20)

const mesh = new THREE.Mesh(geometry,material);
mesh.scale.y = 2 / 2;
scene.add(mesh);


// lights 
const amientLight = new THREE.AmbientLight('#ffffff', 0.4);
scene.add(amientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff,0.2);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024,1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5,5,5);
scene.add(directionalLight);


// Raycaster




// GUI

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;    
    sizes.height = window.innerHeight;


    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})
const mouse = new THREE.Vector2();
window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX / sizes.width * 2 - 1;
    mouse.y = - (e.clientY / sizes.height * 2 - 1);
})

//camera 
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.0001, 10);
camera.position.z = 1.5;
camera.position.y = 0.2;
camera.position.x = 0.5;
const control = new OrbitControls(camera, canvas)
control.enableDamping = true;
scene.add(camera);




//render
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

//utils 


const clock = new THREE.Clock();

const tick = () => {
    control.update();
    // Clock
    const elapsedTime = clock.getElapsedTime()

    material.uniforms.uTime.value = elapsedTime;


    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
}
tick()