import "./style.css";
import * as THREE from 'three';
import gsap from 'gsap';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import * as dat from 'dat.gui';


// constants
const sizes = {
    width: 1400,
    height: 800
}
// Debug
const gui = new dat.GUI();

// Scene
const scene = new THREE.Scene();
// FOG
const fog = new THREE.Fog('#262837', 1,20);
scene.fog = fog;

// textures
const textureLoader = new THREE.TextureLoader()
const doorColorTexture =  textureLoader.load('/textures/door/color.jpg')
const doorAlpha =  textureLoader.load('/textures/door/alpha.jpg')
const doorAmienteOcclusion =  textureLoader.load('/textures/door/ambientOcclusion.jpg')
const doorHeight =  textureLoader.load('/textures/door/height.jpg')
const doorNormal =  textureLoader.load('/textures/door/normal.jpg')
const doorMetalness =  textureLoader.load('/textures/door/metalness.jpg')
const doorRoughness =  textureLoader.load('/textures/door/roughness.jpg')

const bricksColor = textureLoader.load('/textures/bricks/color.jpg')
const bricksOcl = textureLoader.load('/textures/bricks/ambientOcclusion.jpg')
const bricksNormal = textureLoader.load('/textures/bricks/normal.jpg')
const bricksRoughness = textureLoader.load('/textures/bricks/roughness.jpg')


const grassColor = textureLoader.load('/textures/grass/color.jpg')
const grassOcl = textureLoader.load('/textures/grass/ambientOcclusion.jpg')
const grassNormal = textureLoader.load('/textures/grass/normal.jpg')
const grassRoughness = textureLoader.load('/textures/grass/roughness.jpg')


grassColor.repeat.set(8,8)
grassOcl.repeat.set(8,8)
grassNormal.repeat.set(8,8)
grassRoughness.repeat.set(8,8)

grassColor.wrapS = THREE.RepeatWrapping;
grassOcl.wrapS = THREE.RepeatWrapping;
grassNormal.wrapS = THREE.RepeatWrapping;
grassRoughness.wrapS = THREE.RepeatWrapping;


grassColor.wrapT = THREE.RepeatWrapping;
grassOcl.wrapT = THREE.RepeatWrapping;
grassNormal.wrapT = THREE.RepeatWrapping;
grassRoughness.wrapT = THREE.RepeatWrapping;
// Canvas

const canvas = document.querySelector('canvas.webgl');


//Lights 
const ambinetLight = new THREE.AmbientLight(0xb9d5ff, 0.12);
gui.add(ambinetLight, 'intensity').min(0).max(2).step(0.001);
scene.add(ambinetLight);

const directionalLight = new THREE.DirectionalLight(0xb9d5ff, 0.12);
directionalLight.position.set(2,2,-1);
gui.add(directionalLight, 'intensity').min(0).max(1).step(0.001);
gui.add(directionalLight.position, 'x').min(-5).max(5).step(0.001);
gui.add(directionalLight.position, 'y').min(-5).max(5).step(0.001);
directionalLight.castShadow = true; // default false
scene.add(directionalLight);
directionalLight.shadow.mapSize.width =1024;
directionalLight.shadow.mapSize.height =1024;
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 6;
directionalLight.shadow.camera.top = 2;
directionalLight.shadow.camera.bottom = -2;
directionalLight.shadow.camera.left = -1 ;
directionalLight.shadow.camera.right = 2;
directionalLight.shadow.radius = 10;


const doorLight = new THREE.PointLight("#ff7d46",1,100);
doorLight.position.set(0,1.5,2.7);
scene.add(doorLight);

// Material and models;

const material = new THREE.MeshStandardMaterial( { color: 0x89ee92});
material.roughness = 0.7;

// House
const house = new THREE.Group();
scene.add(house);

const walls = new THREE.Mesh(
    new THREE.BoxBufferGeometry(4,2.5,4),
    new THREE.MeshStandardMaterial({
        map: bricksColor,
        aoMap: bricksOcl,
        normalMap: bricksNormal,
        roughnessMap: bricksRoughness
    })
)
walls.position.y = 2.5/3.5;
walls.geometry.setAttribute(
    'uv2', 
    new THREE.Float32BufferAttribute(walls.geometry.attributes.uv.array, 2)   
 )
house.add(walls);

const roof = new THREE.Mesh(
    new THREE.ConeBufferGeometry(3.5,1,4),
    new THREE.MeshStandardMaterial({color: '#b35f45'})
)
roof.rotation.y = Math.PI * 0.25;
roof.position.y = 2.4;
house.add(roof);

const door = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(2,2, 100,100),
    new THREE.MeshStandardMaterial({
        map: doorColorTexture,
        alphaMap: doorAlpha,
        transparent: true,
        aoMap: doorAmienteOcclusion,
        displacementMap: doorHeight,
        displacementScale: 0.1,
        normalMap: doorNormal,
        metalnessMap: doorMetalness,
        roughnessMap: doorRoughness
    })
)
door.geometry.setAttribute(
    'uv2', 
    new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array, 2)   
 )
house.add(door);

door.position.y = 0.5;
door.position.z = 2 + 0.001;

const bushGeo = new THREE.SphereBufferGeometry(1,16,16)
const bushMat = new THREE.MeshStandardMaterial({color: "#89c854"})

const bush1 = new THREE.Mesh(bushGeo, bushMat)
bush1.position.set(.8,-0.2,2.2);
bush1.scale.set(0.5,0.5,0.5)



const bush2 = new THREE.Mesh(bushGeo, bushMat)
bush2.position.set(1.6,-0.4,2.2);
bush2.scale.set(0.25,0.25,0.25)

scene.add(bush1, bush2);


const graves = new THREE.Group();
scene.add(graves);

const graveGeometry =  new THREE.BoxBufferGeometry(0.3,0.6,0.1);
const graveMat = new THREE.MeshStandardMaterial({color: "#b2b6b1"});

for (let i=0; i<50; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 5 + Math.random() * 6;
    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius;
    
    const grave = new THREE.Mesh(graveGeometry, graveMat)
    grave.position.set(x,-0.3,z);
    grave.castShadow = true;
    grave.rotation.y = (Math.random() - 0.5) * 0.4;
    grave.rotation.z = (Math.random() - 0.5) * 0.4; 

    graves.add(grave);
}

scene.add(graves);

const ghost1 = new THREE.PointLight('#ff00ff', 2,3);
scene.add(ghost1);
const ghost2 = new THREE.PointLight('#00ffff', 2,3);
scene.add(ghost2);
const ghost3 = new THREE.PointLight('#ffff00', 2,3);
scene.add(ghost3);



const plane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(25, 25),
    new THREE.MeshStandardMaterial({
        aoMap: grassOcl,
        map: grassColor,
        normalMap: grassNormal,
        roughnessMap: grassRoughness
    })
)

plane.geometry.setAttribute(
    'uv2', 
    new THREE.Float32BufferAttribute(plane.geometry.attributes.uv.array, 2)   
 )

plane.receiveShadow = true;
plane.rotation.x = -Math.PI * 0.5;
plane.position.y = -0.5;



scene.add(plane);


//camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.01, 100);
camera.position.z = 6;
camera.position.y = 3;
camera.position.x = 3;
scene.add(camera);

const control = new OrbitControls(camera, canvas)

control.enableDamping = true;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setClearColor("#262837")

/// Shadows
///
directionalLight.castShadow = true;
doorLight.castShadow = true;
ghost1.castShadow = true;
ghost2.castShadow = true;
ghost3.castShadow = true;
walls.castShadow = true;
bush1.castShadow = true;
bush2.castShadow = true;



renderer.shadowMap.enabled = true;

const clock = new THREE.Clock();

const tick = () => {
    control.update();

    const elapsedTime = clock.getElapsedTime()
    // Update sphere
    const ghostAngle = elapsedTime * 0.2;
    ghost1.position.x = Math.cos(ghostAngle) * 4
    ghost1.position.z = Math.sin(ghostAngle) * 4
    ghost1.position.y = Math.sin(elapsedTime * 3)

    const ghostAngle2 = - elapsedTime * 0.32;
    ghost2.position.x = Math.cos(ghostAngle2) * 5
    ghost2.position.z = Math.sin(ghostAngle2) * 5
    ghost2.position.y = Math.sin(elapsedTime * 3)


    const ghostAngle3 = - elapsedTime * 0.18;
    ghost3.position.x = Math.cos(ghostAngle3) * (7+ Math.sin(elapsedTime * 0.32))
    ghost3.position.z = Math.sin(ghostAngle3) * (7+ Math.sin(elapsedTime*0.5))
    ghost3.position.y = Math.sin(elapsedTime * 5) * Math.sin(elapsedTime* 2)
    // Render 
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
}
tick()

