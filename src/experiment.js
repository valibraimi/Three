import "./style.css";
import * as THREE from 'three';
import gsap from 'gsap';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import * as dat from 'dat.gui';
import * as CANNON from 'cannon-es';
import { CubeTextureLoader } from "three";


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

const cubeTextureLoader = new THREE.CubeTextureLoader();

const environmentalMapTexture = cubeTextureLoader.load(
    [
        '/textures/environmentMaps/0/px.png',
        '/textures/environmentMaps/0/nx.png',
        '/textures/environmentMaps/0/py.png',
        '/textures/environmentMaps/0/ny.png',
        '/textures/environmentMaps/0/pz.png',
        '/textures/environmentMaps/0/nz.png',
    ]
)

// Sounds



// Physics 
// World





// Elems



const cylinder = new THREE.Mesh(
    new THREE.CylinderBufferGeometry(0,1,1,6,3,false),
    new THREE.MeshStandardMaterial({
        color: '#77ff77',
        metalness: 0.2,
        roughness: 0.1,
        envMap: environmentalMapTexture
    })
)
cylinder.receiveShadow = true;


scene.add(cylinder);



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
const raycaster = new THREE.Raycaster()




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
camera.position.z = 5;
camera.position.y = 5;
camera.position.x = 3;
const control = new OrbitControls(camera, canvas)
control.enableDamping = true;
scene.add(camera);

gsap.to(camera.position, 4, {x: 1, y: 12, z: 0.3 })

gsap.to(cylinder.position, 20, {x: 0, y: 20});

//render
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

//utils 
const objectToUpdate = []

const clock = new THREE.Clock();

const tick = () => {
    control.update();
    // Clock
    const elapsedTime = clock.getElapsedTime()

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
}
tick()