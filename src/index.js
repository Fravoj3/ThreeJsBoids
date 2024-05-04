import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import "./style.scss";
import model from "./models/bird.gltf";

let scene, camera, renderer, controls, gridHelper, mixer, clock;

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

gridHelper = new THREE.GridHelper( 10, 10 );
scene.add( gridHelper );

const loader = new GLTFLoader();
loader.load( model, function ( gltf ) {
    console.log(gltf.scene);
    gltf.scene.scale.set(20, 20, 20);
    gltf.scene.children[0].material = new THREE.MeshStandardMaterial({color: 0x00ff00, side: THREE.DoubleSide});
    scene.add( gltf.scene );

    mixer = new THREE.AnimationMixer( gltf.scene );
    gltf.animations.forEach( ( clip ) => {   
            mixer.clipAction( clip ).play();
          
        } );
}, undefined, function ( error ) {
    console.error( error );
} );


}

function animate() {

	requestAnimationFrame( animate );

	// required if controls.enableDamping or controls.autoRotate are set to true
	controls.update();  
    const delta = clock.getDelta();
  
    if ( mixer ) mixer.update( delta );

	renderer.render( scene, camera );

}