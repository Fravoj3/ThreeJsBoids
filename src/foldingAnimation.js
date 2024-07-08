import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import model from "./models/folding animation.gltf";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
export default class FoldingAnimation {

    constructor(parentId){
        this.parent = document.getElementById(parentId);
        this.init();

    }

    init(){
        this.scene = new THREE.Scene();
        const parentSize = this.parent.getBoundingClientRect();
        this.camera = new THREE.PerspectiveCamera(75, parentSize.width/parentSize.height, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setSize(parentSize.width, parentSize.height);
        this.parent.appendChild(this.renderer.domElement);
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setClearColor( 0x80FFE8, 0 ); // the default
        this.state = 0
        this.delta = 0
        this.time = Date.now()

        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshStandardMaterial({color: 0xffffff, roughness: 0.3});
        this.cube = new THREE.Mesh(geometry, material);
        //this.scene.add(this.cube);
        

        this.camera.position.z = 5;

        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.25;
        this.controls.enableZoom = false;
        this.controls.enablePan = false;

        const light = new THREE.AmbientLight( 0x404040, 52 ); // soft white light
        this.scene.add( light );


        this.animate();
        window.addEventListener( 'resize', ()=>{
            const parentSize = this.parent.getBoundingClientRect();
            this.camera.aspect = parentSize.width/parentSize.height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(parentSize.width, parentSize.height);
        });
        this.loadModel();
    }
    animate(){
        const currentTime = Date.now();
        if(this.delta === 0) 
            this.delta = 0.01;
        
        this.delta = currentTime - this.time;
            requestAnimationFrame(this.animate.bind(this));
            this.renderer.render(this.scene, this.camera);
            this.controls.update();
            if(this.mixer !== undefined){
                this.mixer.setTime(Math.min(1.38,this.state/2));
                /*if ((this.mixer.time)/5 <= this.state) {
                    console.log("update")
                    
                    this.mixer.update(0.01);
                }*/
               
            }
        this.time = currentTime;
    }
    loadModel(){
        const loader = new GLTFLoader();
        /*loader.load(model, (gltf) => {
            gltf.scene.traverse(c => {
                if ( c.isMesh ) {
                    c.material = new THREE.MeshStandardMaterial({color: 0xFFFFFF,  side: THREE.DoubleSide, roughness: 0.6});
                }
                })
            this.mixer = new THREE.AnimationMixer( gltf.scene );
            gltf.animations.forEach( ( clip ) => {   
                this.mixer.clipAction( clip ).play();
                this.mixer.timeScale = 5;
            } );
            this.scene.add(gltf.scene)
        }); */
        loader.load(model, (gltf) => {
            gltf.scene.traverse(c => {
                if ( c.isMesh ) {
                    c.material = new THREE.MeshStandardMaterial({color: 0x000000, wireframe: true});
                }
                })
            this.mixer = new THREE.AnimationMixer( gltf.scene );
            gltf.animations.forEach( ( clip ) => {   
                this.mixer.clipAction( clip ).play()
                this.mixer.timeScale = 5;
            } );
            this.scene.add(gltf.scene)


            window.addEventListener('scroll', ()=>{
                const parentScrollY = this.parent.getBoundingClientRect().top;
                let state = (parentScrollY-120)/(window.innerHeight-600);
                this.state = Math.min(1, Math.max(0, state));
            })
        });    
    }
}