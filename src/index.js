import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import "./style.scss";
import model from "./models/bird.gltf";

let scene, camera, renderer, controls, gridHelper, boid, clock, detectionPlane, raycaster, ball, pointer, boids, boidsLoaded, secondPoint;

const boidContainerSize = {x: 100, y: 50, z: 100};
const boidCount = 120;

const mouseRadius = 8;
const mouseForce = 10;

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
raycaster = new THREE.Raycaster();
pointer = new THREE.Vector2();
boids = [];
boidsLoaded = false;
secondPoint = null;

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

detectionPlane = new THREE.Mesh(new THREE.PlaneGeometry(3*boidContainerSize.x, 3*boidContainerSize.y), new THREE.MeshBasicMaterial({visible: false}));
detectionPlane.position.set(0, boidContainerSize.y/2, -boidContainerSize.z/2);
detectionPlane.name = "detectionPlane";
scene.add(detectionPlane);

ball = new THREE.Mesh(new THREE.SphereGeometry(2, 32, 32), new THREE.MeshBasicMaterial({color: 0xff0000}));
scene.add(ball);

window.addEventListener( 'pointermove', ()=>{
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
} );

}
function animate() {
	requestAnimationFrame( animate );

	// required if controls.enableDamping or controls.autoRotate are set to true
	controls.update();  
    const delta = clock.getDelta();

    if(boidsLoaded)
        simulateBoids();
  
    boids.forEach(boid => {
        boid.mixer.update(delta);
    });

    raycaster.setFromCamera( pointer, camera );
	// calculate objects intersecting the picking ray
	const intersects = raycaster.intersectObjects( scene.children );
    let found = false;
	for ( let i = intersects.length-1; i >= 0; i -- ) {
        if(intersects[ i ].object.name === "detectionPlane"){
            ball.position.copy(intersects[ i ].point);
            secondPoint = intersects[ i ].point;
            found = true;
            break
        }
	}
    if(!found){
        ball.position.set(0, 0, 0);
        secondPoint = null;
    }

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
            mixer.timeScale = 5;
        } );
            boids.push({object: clone, mixer: mixer, vector: clone.position.clone(), deltaVector: new THREE.Vector3(Math.random()*2-1, Math.random()*2-1, Math.random()*2-1) ,time: getTime()});
    }
    boidsLoaded = true;
}
function simulateBoids(){
    const maxSpeed = 0.1
    const minSpeed = 0.08
    const maxForce = 0.8;
    const repellDistance = 6;
    const cohesonDistance = 10;
    const alignCoef = 0.6;
    const cohesonCoef = 0.15;
    const repellCoef = 0.3;
    const boundingBoxRepell = 0.3;
    const speedCoef = 0.2;

    boids.forEach(boid => {
        let repellVector = new THREE.Vector3();
        let massCenterVector = new THREE.Vector3();
        let visibleCohesonBoids = 0;
        let avrgSpeed = 0
        let cohesonVector = new THREE.Vector3();
        let alignmentVector = new THREE.Vector3();
        let finalVector = new THREE.Vector3();

        boids.forEach(otherBoid => {
            if(boid !== otherBoid){
                const distance = boid.vector.distanceTo(otherBoid.vector);
                if(distance < repellDistance){
                    repellVector.add(boid.vector.clone().sub(otherBoid.vector).divideScalar(distance));
                }
                if(distance < cohesonDistance){
                    massCenterVector.add(otherBoid.vector);
                    visibleCohesonBoids++
                    alignmentVector.add(otherBoid.deltaVector);
                    avrgSpeed += otherBoid.deltaVector.length();
                }

            }
        });
        const delta = getDelta(boid.time);
        finalVector = repellVector.multiplyScalar(repellCoef)
        if(visibleCohesonBoids > 0){
            cohesonVector = massCenterVector.divideScalar(visibleCohesonBoids).sub(boid.vector);
            alignmentVector.divideScalar(visibleCohesonBoids);
            avrgSpeed /= visibleCohesonBoids;
            finalVector.add(alignmentVector.multiplyScalar(alignCoef))
            finalVector.add(cohesonVector.multiplyScalar(cohesonCoef))
        }

        // Boundaries
        if(boid.vector.x > boidContainerSize.x/2){
            finalVector.x -= boundingBoxRepell;
        }
        if(boid.vector.x < -boidContainerSize.x/2){
            finalVector.x += boundingBoxRepell;
        }
        if(boid.vector.y > boidContainerSize.y){
            finalVector.y -= boundingBoxRepell;
        }
        if(boid.vector.y < 0){
            finalVector.y += boundingBoxRepell;
        }
        if(boid.vector.z > boidContainerSize.z/2){
            finalVector.z -= boundingBoxRepell;
        }
        if(boid.vector.z < -boidContainerSize.z/2){
            finalVector.z += boundingBoxRepell;
        }

        // Mouse
        const mouseVector = isNearMouse(boid.object.position.clone());
        if(mouseVector !== false){
            finalVector.add(mouseVector.multiplyScalar(-mouseForce));
        }

        let shiftVector = boid.deltaVector.clone().add(finalVector)
        if(visibleCohesonBoids > 0)
            shiftVector.multiplyScalar(shiftVector.length() + speedCoef*(avrgSpeed/shiftVector.length()-shiftVector.length()))
        shiftVector.multiplyScalar(delta)

        if(shiftVector.clone().sub(boid.deltaVector).length() > maxForce*delta){
            shiftVector = boid.deltaVector.clone().add(shiftVector.clone().sub(boid.deltaVector).normalize().multiplyScalar(maxForce*delta))
        }

        if(shiftVector.length() > maxSpeed){
            shiftVector.normalize().multiplyScalar(maxSpeed)
        }
        if(shiftVector.length() < minSpeed){
            shiftVector.normalize().multiplyScalar(minSpeed)
        }
        finalVector = boid.vector.clone().add(shiftVector)

        boid.object.position.copy(finalVector);
        boid.object.lookAt(finalVector.clone().sub(shiftVector));
        boid.vector = finalVector;
        boid.deltaVector = shiftVector;
        boid.time = getTime();
    });
}
function getTime(){
    return new Date().getTime()/1000; // in seconds
}
function getDelta(time){
    return getTime() - time;
}
function isNearMouse(vector){
    if(secondPoint === null)
        return false;

    let dirVector = secondPoint.clone().sub(camera.position);
    let a = dirVector.x*(vector.x - camera.position.x) + dirVector.y*(vector.y - camera.position.y) + dirVector.z*(vector.z - camera.position.z);
    a = a/(dirVector.x**2 + dirVector.y**2 + dirVector.z**2);
    let point = camera.position.clone().add(dirVector.multiplyScalar(a));

    if(point.distanceTo(vector) > mouseRadius)
        return false;

    return point.sub(vector).normalize()
}