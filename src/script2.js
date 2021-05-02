import "./style.css";
import * as THREE from 'three';
import gsap from 'gsap';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import * as dat from 'dat.gui';
import { BoxBufferGeometry, MeshBasicMaterial, MeshStandardMaterial } from "three";

const textureLoader = new THREE.TextureLoader();
const particleTexture = textureLoader.load('/textures/particles/3.png')

const fonLoader = new THREE.FontLoader();
fonLoader.load(
    '/fonts/helvetiker_regular.typeface.json',
    (font) => {
        const textGeometry = new THREE.TextBufferGeometry(
            'Etherum', {
                font,
                size: 0.5,
                height: 0.2,
                curveSegments: 5,
                bevelEnabled: true,
                bevelThickness: 0,
                bevelSize: 0,
                bevelOffset: 0,
                bevelSegments: 5,
            }
        )
        textGeometry.center();
        const textMaterial = new THREE.MeshNormalMaterial({
        });
        const text = new THREE.Mesh(textGeometry, textMaterial);
        
        scene.add(text);
    }
)


const gui = new dat.GUI();

const canvas = document.querySelector('.webgl');
// Scene
const scene = new THREE.Scene();


const sizes = {
    width: 1440,
    height: 900
}




const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.01, 100);
camera.position.z = 5;
camera.position.y = 0;
camera.position.x = 0;
const control = new OrbitControls(camera, canvas)
control.enableDamping = true;
scene.add(camera);
gsap.fromTo(camera.position, 6,{x: 3, z: 5, y:100}, {x: 0, z: 4, y: 0})

const particlesGeometry = new THREE.BufferGeometry();
const count = 50000;

const position = new Float32Array(count * 3);
const colors = new Float32Array(count * 3)

for (let i = 0; i<count * 3; i++) {
    position[(i)] = (Math.random() - 0.5) * 10;
    colors[i] = Math.random()
}
particlesGeometry.setAttribute(
    'position', new THREE.BufferAttribute(position, 3)
)
particlesGeometry.setAttribute(
    'color', new THREE.BufferAttribute(colors, 3)
)
// Materail
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.05,
    sizeAttenuation: true,
    transparent: true,
    color: '#9090c0',
    alphaMap: particleTexture,
    alphaTest: 0.0002,
    //depthTest: false
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true
});

// Gemotry
const particales = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particales);

// lights 

const amientLight = new THREE.AmbientLight('#ffffff', 0.4);
scene.add(amientLight);

const renderer = new THREE.WebGLRenderer({ canvas});
renderer.setSize(sizes.width, sizes.height)


const clock = new THREE.Clock();


const tick = () => {
    control.update();
    // Clock
    const elapsedTime = clock.getElapsedTime()
    if (elapsedTime < 25) {
        for(let i = 0; i < count; i++) {
            const i3 = i*3
            const x = particlesGeometry.attributes.position.array[i3]
            const y = particlesGeometry.attributes.position.array[i3+1]
            particlesGeometry.attributes.position.array[i3+2] = Math.abs(Math.sin(x)*Math.sin(x)*Math.cos(y) *elapsedTime/2) * Math.sin(elapsedTime)  ;
        }
        particlesGeometry.attributes.position.needsUpdate = true;
    }


    // Render 
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
}
tick()