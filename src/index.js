import "./style.scss";
import BoidSimulation from "./boidSimulation";
import HeadingFlowField from "./headingFlowField";
import AssetsGallery from "./assetsGallery";
import videojs from '!video.js';

const clamp = function(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

window.onload = () => {
    // Boids init
    const BoidSim = new BoidSimulation("view3d");
    BoidSim.animate()
    const assetsGallery = new AssetsGallery("galleryContainer", "extend");
    const mainHeadingBox = document.getElementsByClassName("headingBox")[0]
    const headingFlowField = new HeadingFlowField("Fravoj", "mainHeading");
    const lremIpsumLogo = document.getElementById("logoLremIpsum");
    const unityParagraph = document.getElementById("paragraph");
    const unitySection = document.getElementById("unityContainer");
    const unityGallery = document.getElementById("unity-gallery");
    let unityBoxTop = unitySection.getBoundingClientRect().top + window.scrollY + window.innerHeight*0.5;
    window.addEventListener("resize", () => {
        headingFlowField.resize();
        assetsGallery.render()
    });

    window.addEventListener("scroll", (e)=>{
        unityBoxTop = unitySection.getBoundingClientRect().top + window.scrollY + window.innerHeight*0.5;
        let shift = window.scrollY*-0.5
        mainHeadingBox.style.marginTop = shift + "px";
        shift = (unityBoxTop-window.scrollY)*(200/window.innerHeight)
        shift = clamp(shift, -30, 150)
        lremIpsumLogo.style.marginTop = shift + "px";
        shift *= 0.7
        unityParagraph.style.marginTop = shift + "px";
        shift *= 1.5
        unityGallery.style.marginTop = shift + "px";

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

    assetsGallery.render()
    assetsGallery.viewLess()

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
