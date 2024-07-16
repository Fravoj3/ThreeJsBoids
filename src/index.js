import "./style.scss";
import BoidSimulation from "./boidSimulation";
import HeadingFlowField from "./headingFlowField";
import AssetsGallery from "./assetsGallery";
import FoldingAnimation from "./foldingAnimation";
import videojs from '!video.js';
import { ConstantColorFactor } from "three";

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
    const threeContainer = document.getElementById("threeJsContainer");
    let unityBoxTop = unitySection.getBoundingClientRect().top + window.scrollY + window.innerHeight*0.5;
    let threeBoxTop = threeContainer.getBoundingClientRect().top + window.scrollY + window.innerHeight*0.5;
    let threeSpeed1 = document.getElementsByClassName("three-1");
    let threeSpeed2 = document.getElementsByClassName("three-2");
    window.addEventListener("resize", () => {
        headingFlowField.resize();
        assetsGallery.render()
    });

    let state = 0;
    const jestedDescription = document.getElementById("jestedSection");
    const mushroomsDescription = document.getElementById("mushroomsSection");
    mushroomsDescription.style.display = "none";
    const videoVFX = videojs("my-video", {
        controls: false,
        autoplay: false,
        preload: "auto",
        fluid: false,
        sources: [
            {
                src: "http://fravoj.wz.cz/jested.mp4",
                type: "video/mp4"
            }
        ]
    });
    document.getElementById("my-video").addEventListener("click", () => {
        videoVFX.paused() ? videoVFX.play() : videoVFX.pause();
    });
    videoVFX.on("ended", () => {
        setTimeout(function(){
            if(state == 0){
                state = 1;
                mushroomsDescription.style.display = "block";
                jestedDescription.style.display = "none";
                videoVFX.src("http://fravoj.wz.cz/mushrooms.mp4");
                videoVFX.play();
            }else{
                state = 0;
                mushroomsDescription.style.display = "none";
                jestedDescription.style.display = "block";
                videoVFX.src("http://fravoj.wz.cz/jested.mp4");
                videoVFX.play();
            }
        }, 6000);
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
                src: "http://fravoj.wz.cz/Lrem%20Ipsum%20showcase.mp4",
                type: "video/mp4"
            }
        ]
    });
    const videoExplicatio = videojs("video-explicatio", {
        controls: true,
        autoplay: false,
        preload: "auto",
        fluid: false,
        sources: [
            {
                src: "http://fravoj.wz.cz/explicatio.mp4",
                type: "video/mp4"
            }
        ]
    });
    /*document.getElementById("video-unity").addEventListener("click", () => {
        videoUnity.paused() ? videoUnity.play() : videoUnity.pause();
    });*/

    const foldingAnimation = new FoldingAnimation("animatedModel");

    var viewport = document.querySelector('meta[name="viewport"]');

    if ( viewport ) {
      viewport.content = "initial-scale=0.1";
      viewport.content = "width=600";
    }
    
    window.addEventListener("scroll", (e)=>{
        unityBoxTop = unitySection.getBoundingClientRect().top + window.scrollY + window.innerHeight*0.5;
        let shift = window.scrollY*-0.5
        mainHeadingBox.style.marginTop = shift + "px";
        shift = (unityBoxTop-window.scrollY)*(200/window.innerHeight)
        shift = clamp(shift, -50, 150)
        lremIpsumLogo.style.marginTop = shift + "px";
        shift *= 0.7
        unityParagraph.style.marginTop = shift + "px";
        shift *= 1.5
        unityGallery.style.marginTop = shift + "px";

        threeBoxTop = threeContainer.getBoundingClientRect().top + window.scrollY;
        shift = (threeBoxTop-window.scrollY)*(200/window.innerHeight)
        shift = clamp(shift, -50, 150)
        for(let i = 0; i < threeSpeed1.length; i++){
            threeSpeed1[i].style.marginTop = shift + "px";
        }
        shift *= 0.7
        for(let i = 0; i < threeSpeed2.length; i++){
            threeSpeed2[i].style.marginTop = shift + "px";
        }

        if(headingFlowField.animating && window.scrollY > window.innerHeight/2){
            headingFlowField.stop();
            videoVFX.currentTime(0);
            videoVFX.play();
            //console.log("heading animation stopped")
        }
        if(!headingFlowField.animating && window.scrollY < window.innerHeight/2){
            headingFlowField.start();
        }

        if(BoidSim.animating && window.scrollY > window.innerHeight){
            BoidSim.pauseAnimation()
        }
        if(!BoidSim.animating && window.scrollY < window.innerHeight){
            BoidSim.resumeAnimation()
        }

        

        
    })

    videoVFX.play();
};
