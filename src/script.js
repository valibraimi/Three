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

debugObj.createSphere = () => {
    createSphere(Math.random() * 0.5, {x:Math.random() - 0.5,y:4,z:Math.random() * 4});
}
debugObj.createBox = () => {
    const boxSize = Math.random()
    createBox(boxSize, boxSize, boxSize, {x:Math.random() - 0.5,y:4,z:Math.random() * 4});
}


gui.add(debugObj, 'createSphere');
gui.add(debugObj, 'createBox');
// Scene
const scene = new THREE.Scene();

// textures
const textureLoader = new THREE.TextureLoader();

const cubeTextureLoader = new THREE.CubeTextureLoader();

const environmentalMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.png',
    '/textures/environmentMaps/0/nx.png',
    '/textures/environmentMaps/0/py.png',
    '/textures/environmentMaps/0/ny.png',
    '/textures/environmentMaps/0/pz.png',
    '/textures/environmentMaps/0/nz.png',
])

// Sounds


const hitSound = new Audio("/sounds/hit.mp3");
const playHitSound = (collision) => {
    if (collision.contact.getImpactVelocityAlongNormal()> 1.5) {
        hitSound.volume = Math.random();
        hitSound.currentTime = 0;
        hitSound.play();
    }
}



// Physics 
// world
const world = new CANNON.World();
world.allowSleep = true;
world.broadphase = new CANNON.SAPBroadphase(world);
world.gravity.set(0,-9.82, 0);


const defaultMaterial = new CANNON.Material('default');


const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction: 0.1,
        restitution: 0.7
    }
)
world.addContactMaterial(defaultContactMaterial);
world.defaultContactMaterial = defaultContactMaterial;


const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body();
floorBody.material = defaultMaterial;
floorBody.mass = 0;
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1,0,0), Math.PI * 0.5);
floorBody.addShape(floorShape);
world.addBody(floorBody);



// Elems



const floor = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(10,10),
    new THREE.MeshStandardMaterial({
        color: '#777777',
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentalMapTexture
    })
)
floor.receiveShadow = true;
floor.rotation.x = - Math.PI * 0.5;
scene.add(floor);

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

    console.log(mouse);
})



//camera 
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.01, 100);
camera.position.z = 4;
camera.position.y = 5;
camera.position.x = 3;
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
const objectToUpdate = []

const sphereGeometry = new THREE.SphereBufferGeometry(1, 20,20);
const sphereMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentalMapTexture
});



const createSphere = (radius, position) => {
    const mesh = new THREE.Mesh(
        sphereGeometry,
        sphereMaterial
    )
    mesh.scale.set(radius,radius,radius)
    mesh.castShadow = true;
    mesh.position.copy(position)
    scene.add(mesh);

    const shape = new CANNON.Sphere(radius)
    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0,3,0),
        shape: shape,
        material: defaultMaterial
    })
    body.position.copy(position);
    body.addEventListener('collide', playHitSound);
    world.addBody(body);

    objectToUpdate.push({
        mesh,
        body
    })    
}


const boxGeometry = new THREE.BoxBufferGeometry(1,1,1);
const boxMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentalMapTexture
});



const createBox = (width, heigh, depth, position) => {
    const mesh = new THREE.Mesh(
        boxGeometry,
        boxMaterial
    )
    mesh.scale.set(width,heigh,depth)
    mesh.castShadow = true;
    mesh.position.copy(position)
    scene.add(mesh);

    const shape = new CANNON.Box(new CANNON.Vec3(width* 0.5, heigh * 0.5, depth * 0.5))
    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0,3,0),
        shape: shape,
        material: defaultMaterial
    })
    body.position.copy(position);
    body.addEventListener('collide', playHitSound);
    world.addBody(body);

    objectToUpdate.push({
        mesh,
        body
    })    
}







createSphere(0.5, {x: 0, y: 3, z: 0});

const clock = new THREE.Clock();




let oldElapsedTime = 0;

const tick = () => {
    control.update();
    // Clock
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldElapsedTime;
    oldElapsedTime = elapsedTime;

    // Physics
    world.step(1 / 60, deltaTime ,3);

    for(const obj of objectToUpdate) {
        obj.mesh.position.copy(obj.body.position)
        obj.mesh.quaternion.copy(obj.body.quaternion);
    }

    raycaster.setFromCamera(mouse, camera);

    // const rayOrigin = new THREE.Vector3(-3,0,0);
    // const rayDirection = new THREE.Vector3(1,0,0);
    // rayDirection.normalize();
    // raycaster.set(rayOrigin, rayDirection);

    // Render 
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
}
tick()