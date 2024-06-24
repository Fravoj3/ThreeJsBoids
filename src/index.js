import "./style.scss";
import BoidSimulation from "./boidSimulation";
import HeadingFlowField from "./headingFlowField";
import AssetsGallery from "./assetsGallery";
import videojs from '!video.js';


window.onload = () => {
    // Boids init
    const BoidSim = new BoidSimulation("view3d");
    BoidSim.animate()
    const mainHeadingBox = document.getElementsByClassName("headingBox")[0]
    const headingFlowField = new HeadingFlowField("Fravoj", "mainHeading");
    const lremIpsumLogo = document.getElementById("logoLremIpsum");
    const unitySection = document.getElementById("unityContainer");
    let unityBoundingBox = unitySection.getBoundingClientRect();
    window.addEventListener("resize", () => {
        headingFlowField.resize();
        unityBoundingBox = unitySection.getBoundingClientRect();
    });

    window.addEventListener("scroll", (e)=>{
        let shift = window.scrollY*-0.4
        mainHeadingBox.style.marginTop = shift + "px";
        shift = window.scrollY*0.4
        lremIpsumLogo.style.marginTop = (shift+unityBoundingBox.top) + "px";

        if(headingFlowField.animating && window.scrollY > window.innerHeight/2){
            headingFlowField.stop();
        }
        if(!headingFlowField.animating && window.scrollY < window.innerHeight/2){
            headingFlowField.start();
        }

        
    })

    const videoVFX = videojs("my-video", {
        controls: false,
        autoplay: true,
        preload: "auto",
        fluid: false,
        sources: [
            {
                src: "https://vjs.zencdn.net/v/oceans.mp4",
                type: "video/mp4"
            }
        ]
    });
    document.getElementById("my-video").addEventListener("click", () => {
        videoVFX.paused() ? videoVFX.play() : videoVFX.pause();
    });

    const assetsGallery = new AssetsGallery("galleryContainer");
    assetsGallery.displayImages(4);

    const videoUnity = videojs("video-unity", {
        controls: true,
        autoplay: false,
        preload: "auto",
        fluid: false,
        sources: [
            {
                src: "http://fravoj.wz.cz/lrem%20ipsum%20video.mp4",
                type: "video/mp4"
            }
        ]
    });
    /*document.getElementById("video-unity").addEventListener("click", () => {
        videoUnity.paused() ? videoUnity.play() : videoUnity.pause();
    });*/

};
