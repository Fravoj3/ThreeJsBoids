import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import "./style.scss";
import model from "./models/bird.gltf";

let scene, camera, renderer, controls, gridHelper, boid, clock;
const mixer = []
const boidContainerSize = {x: 100, y: 50, z: 100};
const boidCount = 100;
const boids = [];

init();
animate();

function init(){
scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
renderer = new THREE.WebGLRenderer();
clock = new THREE.Clock();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setClearColor( 0x000000, 0 ); // the default
document.getElementsByClassName("view3d")[0].appendChild( renderer.domElement );

window.addEventListener( 'resize', ()=>{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}, false );

controls = new OrbitControls( camera, renderer.domElement );
camera.position.set( 0, 20, 100 );
controls.update();

gridHelper = new THREE.GridHelper( boidContainerSize.x, 10 );
scene.add( gridHelper );

const loader = new GLTFLoader();
loader.load( model, ( gltf )=>{
    gltf.scene.scale.set(50, 50, 50);
    gltf.scene.children[0].material = new THREE.MeshStandardMaterial({color: 0x00ff00, side: THREE.DoubleSide});
    
    boid = gltf;
    addBoids();

}, undefined, function ( error ) {
    console.error( error );
} );


}

function animate() {
	requestAnimationFrame( animate );

	// required if controls.enableDamping or controls.autoRotate are set to true
	controls.update();  
    const delta = clock.getDelta();
  
    boids.forEach(boid => {
        boid.mixer.update(delta);
    });

	renderer.render( scene, camera );

}
function addBoids(){
    const {x, y, z} = boidContainerSize;
    const geometry = new THREE.BoxGeometry(x, y, z)
    geometry.translate(0, 25, 0);
    const wireframe = new THREE.WireframeGeometry( geometry );

    const line = new THREE.LineSegments( wireframe );
    line.material.depthTest = false;
    line.material.opacity = 0.25;
    line.material.color.setHex( 0x144696 );
    line.material.transparent = true;
    scene.add( line );

    for(let i = 0; i < boidCount; i++){
        const clone = boid.scene.clone();
        clone.position.set(Math.random() * x - x/2, Math.random() * y, Math.random() * z - z/2);
        scene.add(clone);
        const mixer = new THREE.AnimationMixer( clone );
        boid.animations.forEach( ( clip ) => {   
            mixer.clipAction( clip ).play();
        } );
        boids.push({object: clone, mixer: mixer});
    }
}