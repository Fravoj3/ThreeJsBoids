import "./style.scss";
import BoidSimulation from "./boidSimulation";
import HeadingFlowField from "./headingFlowField";
import videojs from '!video.js';


window.onload = () => {
    // Boids init
    const BoidSim = new BoidSimulation("view3d");
    BoidSim.animate()
    const mainHeadingBox = document.getElementsByClassName("headingBox")[0]
    const headingFlowField = new HeadingFlowField("Fravoj", "mainHeading");
    window.addEventListener("resize", () => {
        headingFlowField.resize();
    });

    window.addEventListener("scroll", (e)=>{
        let shift = window.scrollY*-0.4
        mainHeadingBox.style.marginTop = shift + "px";

        if(headingFlowField.animating && window.scrollY > window.innerHeight/2){
            headingFlowField.stop();
        }
        if(!headingFlowField.animating && window.scrollY < window.innerHeight/2){
            headingFlowField.start();
        }
    })

    const video = videojs("my-video", {
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
        video.paused() ? video.play() : video.pause();
    });

};
