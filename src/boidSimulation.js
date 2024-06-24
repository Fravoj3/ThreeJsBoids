import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import "./style.scss";
import model from "./models/bird.gltf";
import terrain from "./models/mountains.gltf";
import { cameraPosition } from 'three/examples/jsm/nodes/Nodes.js';

export default class BoidSimulation {
    scene
    camera
    renderer
    controls
    gridHelper
    boid
    clock
    detectionPlane
    raycaster
    ball
    pointerLandscape
    boids
    boidsLoaded
    secondPoint

    boidContainerSize = {x: 150, y: 50, z: 70};
    boidCount = 180;

    mouseRadius = 8;
    mouseForce = 8;
    center = new THREE.Vector3(0, 0, 0);
    camPosition

    constructor(domClassName){
        this.init(domClassName);
    }

init(domClassName){
this.scene = new THREE.Scene();
this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
this.renderer = new THREE.WebGLRenderer({ antialias: true });
this.clock = new THREE.Clock();
this.renderer.setSize( window.innerWidth, window.innerHeight );
this.renderer.setPixelRatio( window.devicePixelRatio );
this.renderer.setClearColor( 0x80FFE8, 0 ); // the default
document.getElementsByClassName(domClassName)[0].appendChild( this.renderer.domElement );
this.scene.fog = new THREE.FogExp2( 0xffffff, 0.008 );

this.raycaster = new THREE.Raycaster();
this.pointerLandscape = new THREE.Vector2();
this.boids = [];
this.boidsLoaded = false;
this.secondPoint = null;

window.addEventListener( 'resize', ()=>{
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( window.innerWidth, window.innerHeight );
}, false );

//controls = new OrbitControls( camera, renderer.domElement );
this.camera.position.set( 0, 0, 70 );
//controls.update();
//controls.autoRotateSpeed = 2;
//controls.rotateSpeed = 0.5;

this.gridHelper = new THREE.GridHelper( this.boidContainerSize.x, 10 );
//scene.add( gridHelper );

const loader = new GLTFLoader();
loader.load( model, ( gltf )=>{
    gltf.scene.scale.set(50, 50, 50);
    gltf.scene.children[0].material = new THREE.MeshStandardMaterial({color: 0x00ff00, side: THREE.DoubleSide});
    
    this.boid = gltf;
    this.addBoids();

}, undefined, function ( error ) {
    console.error( error );
} );

this.detectionPlane = new THREE.Mesh(new THREE.PlaneGeometry(3*this.boidContainerSize.x, 3*this.boidContainerSize.y), new THREE.MeshBasicMaterial({visible: false}));
this.detectionPlane.position.set(0, this.boidContainerSize.y/2, -this.boidContainerSize.z/2);
this.detectionPlane.name = "detectionPlane";
this.scene.add(this.detectionPlane);


/*ball = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), new THREE.MeshBasicMaterial({color: 0xff0000}));
scene.add(ball);*/

window.addEventListener( 'pointermove', ()=>{
    this.pointerLandscape.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this.pointerLandscape.y = - ( (event.clientY + window.scrollY) / window.innerHeight ) * 2 + 1;
    this.pointerLandscape.y = Math.max(Math.min(this.pointerLandscape.y, 1), -1)
} );
this.camPosition = this.camera.position.clone();

// Landscape

loader.load( terrain, ( gltf )=>{
    gltf.scene.scale.set(10, 10, 10);
    gltf.scene.children[0].material = new THREE.MeshStandardMaterial({color: 0x000000, flatShading: true, roughness: 1, metalness: 1});
    gltf.scene.position.set(-10, -25, -10);
    this.scene.add(gltf.scene)

    const wireframe = new THREE.WireframeGeometry( gltf.scene.children[0].children[0].geometry.clone() );
	let line = new THREE.LineSegments( wireframe );
	line.material.depthTest = true;
	line.material.opacity = 0.2;
	line.material.transparent = true;
    line.scale.set(10, 10, 10);
    line.position.set(-10.5, -31.3, -13.5);

    this.scene.add( line );
}, undefined, function ( error ) {
    console.error( error );
} );

const light = new THREE.DirectionalLight( 0xffffff, 0.1 );
light.position.set( 0, 50, 50 );
this.scene.add( light );

}
animate() {
	requestAnimationFrame( this.animate.bind(this) );

	// required if controls.enableDamping or controls.autoRotate are set to true
	//controls.update();  
    const delta = this.clock.getDelta();

    if(this.boidsLoaded)
        this.simulateBoids();
  
    this.boids.forEach(boid => {
        boid.mixer.update(delta);
    });

    this.raycaster.setFromCamera( this.pointerLandscape, this.camera );
	// calculate objects intersecting the picking ray
	const intersects = this.raycaster.intersectObjects( this.scene.children );
    let found = false;
	for ( let i = intersects.length-1; i >= 0; i -- ) {
        if(intersects[ i ].object.name === "detectionPlane"){
            //ball.position.copy(intersects[ i ].point);
            this.secondPoint = intersects[ i ].point;
            found = true;
            break
        }
	}
    if(!found){
        //ball.position.set(0, 0, 0);
        this.secondPoint = null;
    }
    // Move camera
    let camVector = this.camPosition.clone().sub(this.center);
    const len = camVector.length();
    const rightVector = new THREE.Vector3(10, 0, 0)
    const upVector = new THREE.Vector3(0, 10, 0)
    camVector.add(rightVector.multiplyScalar(this.pointerLandscape.x));
    camVector.add(upVector.multiplyScalar(this.pointerLandscape.y));
    camVector.multiplyScalar(len/camVector.length())
    this.camera.position.lerp(camVector.add(this.center), 0.1)
    this.camera.lookAt(this.center);


	this.renderer.render( this.scene, this.camera );

}
addBoids(){
    const {x, y, z} = this.boidContainerSize;
    const geometry = new THREE.BoxGeometry(x, y, z)
    geometry.translate(0, 25, 0);
    const wireframe = new THREE.WireframeGeometry( geometry );

    const line = new THREE.LineSegments( wireframe );
    line.material.depthTest = false;
    line.material.opacity = 0.25;
    line.material.color.setHex( 0x144696 );
    line.material.transparent = true;
    //scene.add( line );

    for(let i = 0; i < this.boidCount; i++){
        const clone = this.boid.scene.clone();
        clone.position.set(Math.random() * x - x/2, Math.random() * y, Math.random() * z - z/2);
        this.scene.add(clone);
        const mixer = new THREE.AnimationMixer( clone );
        this.boid.animations.forEach( ( clip ) => {   
            mixer.clipAction( clip ).play();
            mixer.timeScale = 5;
        } );
        this.boids.push({object: clone, mixer: mixer, vector: clone.position.clone(), deltaVector: new THREE.Vector3(Math.random()*2-1, Math.random()*2-1, Math.random()*2-1) ,time: this.getTime()});
    }
    this.boidsLoaded = true;
}
simulateBoids(){
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

    this.boids.forEach(boid => {
        let repellVector = new THREE.Vector3();
        let massCenterVector = new THREE.Vector3();
        let visibleCohesonBoids = 0;
        let avrgSpeed = 0
        let cohesonVector = new THREE.Vector3();
        let alignmentVector = new THREE.Vector3();
        let finalVector = new THREE.Vector3();

        this.boids.forEach(otherBoid => {
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
        const delta = this.getDelta(boid.time);
        finalVector = repellVector.multiplyScalar(repellCoef)
        if(visibleCohesonBoids > 0){
            cohesonVector = massCenterVector.divideScalar(visibleCohesonBoids).sub(boid.vector);
            alignmentVector.divideScalar(visibleCohesonBoids);
            avrgSpeed /= visibleCohesonBoids;
            finalVector.add(alignmentVector.multiplyScalar(alignCoef))
            finalVector.add(cohesonVector.multiplyScalar(cohesonCoef))
        }

        // Boundaries
        if(boid.vector.x > this.boidContainerSize.x/2){
            finalVector.x -= boundingBoxRepell;
        }
        if(boid.vector.x < -this.boidContainerSize.x/2){
            finalVector.x += boundingBoxRepell;
        }
        if(boid.vector.y > this.boidContainerSize.y){
            finalVector.y -= boundingBoxRepell;
        }
        if(boid.vector.y < 0){
            finalVector.y += boundingBoxRepell;
        }
        if(boid.vector.z > this.boidContainerSize.z/2){
            finalVector.z -= boundingBoxRepell;
        }
        if(boid.vector.z < -this.boidContainerSize.z/2){
            finalVector.z += boundingBoxRepell;
        }

        // Mouse
        const mouseVector = this.isNearMouse(boid.object.position.clone());
        if(mouseVector !== false){
            finalVector.add(mouseVector.multiplyScalar(-this.mouseForce));
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
        boid.time = this.getTime();
    });
}
getTime(){
    return new Date().getTime()/1000; // in seconds
}
getDelta(time){
    return this.getTime() - time;
}
isNearMouse(vector){
    if(this.secondPoint === null)
        return false;

    let dirVector = this.secondPoint.clone().sub(this.camera.position);
    let a = dirVector.x*(vector.x - this.camera.position.x) + dirVector.y*(vector.y - this.camera.position.y) + dirVector.z*(vector.z - this.camera.position.z);
    a = a/(dirVector.x**2 + dirVector.y**2 + dirVector.z**2);
    let point = this.camera.position.clone().add(dirVector.multiplyScalar(a));

    if(point.distanceTo(vector) > this.mouseRadius)
        return false;

    return point.sub(vector).normalize()
}
}
