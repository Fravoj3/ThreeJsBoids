import jelenImg from './assetsImages/deer.png';
import crystalImg from './assetsImages/crystal.png';
import coffeeMillImg from './assetsImages/coffeeMill.png';
import dragonSolidImg from './assetsImages/dragon solid.png';
import plantImg from './assetsImages/plant.png';
import rabbitImg from './assetsImages/rabbit.png';
import wireframeDeerImg from './assetsImages/wireframeDeer.png';
import wireframeRabbitImg from './assetsImages/wireframeRabbit.png';


const deer = {
    name: "Deer",
    html: '<div class="sketchfab-embed-wrapper"> <iframe title="Deer low poly" frameborder="0" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share src="https://sketchfab.com/models/cabc3af81f9f4fcc89f989184ddf6b30/embed?autostart=1&camera=0&ui_theme=dark"> </iframe> </div>',
    img: jelenImg,
    software: "Maxon Cinema 4D"}
const crystal = {
    name: "Crystal",
    html: '<div class="sketchfab-embed-wrapper"> <iframe title="Crystal" frameborder="0" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share src="https://sketchfab.com/models/1065edd865ce4e92bb209916b74f74b2/embed?autostart=1"> </iframe> </div>',
    img: crystalImg,
    software: "Maxon Cinema 4D<br>Substance Painter"}
const coffeeMill = {
    name: "Coffee Mill",
    html: '<div class="sketchfab-embed-wrapper"> <iframe title="Coffee mill" frameborder="0" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share src="https://sketchfab.com/models/4700ed86fa4d49e3b0be54e003d53678/embed?autostart=1"> </iframe> </div>',
    img: coffeeMillImg,
    software: "Autodesk Maya"}
const dragonSolid = {
    name: "Dragon",
    html: '<div class="sketchfab-embed-wrapper"> <iframe title="Dragon" frameborder="0" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share src="https://sketchfab.com/models/218d0a2740cb4c76a3475014616ae452/embed?autostart=1"> </iframe> </div>',
    img: dragonSolidImg,
    software: "Maxon Cinema 4D"}
const plant = {
    name: "Chrysantemum",
    html: '<div class="sketchfab-embed-wrapper"> <iframe title="Blue Chrizantemos" frameborder="0" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share src="https://sketchfab.com/models/cc47674f99e94503b26880168d449de9/embed?autostart=1"> </iframe> </div>',
    img: plantImg,
    software: "Blender"}
const rabbit = {
    name: "Rabbit",
    html: '<div class="sketchfab-embed-wrapper"> <iframe title="Rabbit low poly" frameborder="0" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share src="https://sketchfab.com/models/9af7b10eaf21440882f0bf8e969388ff/embed?autostart=1"> </iframe> </div>',
    img: rabbitImg,
    software: "Maxon Cinema 4D"}
const wireframeDeer = {
    name: "Wireframe Deer",
    html: '<div class="sketchfab-embed-wrapper"> <iframe title="Wireframe deer" frameborder="0" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share src="https://sketchfab.com/models/f9ce3bb1d31e4519bf768623e3e2714b/embed?autostart=1"> </iframe> </div>',
    img: wireframeDeerImg,
    software: "Maxon Cinema 4D"}
const wireframeRabbit = {
    name: "Wireframe Rabbit",
    html: '<div class="sketchfab-embed-wrapper"> <iframe title="Wireframe Rabbit" frameborder="0" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share src="https://sketchfab.com/models/5e1aba55b9da45f895d8fdeff401331c/embed?autostart=1"> </iframe> </div>',
    img: wireframeRabbitImg,
    software: "Maxon Cinema 4D"}



export default class AssetsGallery{
    constructor(galleryId){
        this.images = []
        this.galleryId = galleryId
        this.init()
    }
    init(){
        this.images.push(deer)
        this.images.push(crystal)
        this.images.push(coffeeMill)
        this.images.push(dragonSolid)
        this.images.push(plant)
        this.images.push(rabbit)
        this.images.push(wireframeDeer)
        this.images.push(wireframeRabbit)
    }
    displayImages(columnCount){
        if(columnCount === undefined){
            columnCount = 3
        }

        const gallery = document.getElementById(this.galleryId)
        const modelContainer = document.getElementById("previewContainer")
        const modelInfo = document.getElementById("modelInfo")
        gallery.innerHTML = ""

        const columns = []
        for(let i = 0; i < columnCount; i++){
            const column = document.createElement("div")
            column.classList.add("column")
            columns.push({html: column, height: 0})
            gallery.appendChild(column)
        }
        const getShortestColumn = () => {
            let shortest = columns[columnCount-1]
            for (let i = columnCount-2; i >= 0; i--){
                const column = columns[i]
                if(column.height <= shortest.height){
                    shortest = column
                }
            }
            return shortest
        }

        let loadedImages = 0
        this.images.forEach((image)=>{
            const container = document.createElement("div")
            const overlay = document.createElement("div")
            overlay.classList.add("overlay")
            container.classList.add("image")
            const img = document.createElement("img")
            container.appendChild(img)
            img.src = image.img
            img.alt = image.name
            const text = document.createElement("p")
            text.innerHTML = image.name
            overlay.appendChild(text)
            container.appendChild(overlay)
            container.onclick = () => {
                const heading = document.createElement("h2")
                const software = document.createElement("p")
                modelContainer.innerHTML = image.html
                software.innerHTML = image.software
                heading.innerHTML = image.name
                modelInfo.innerHTML = ""    
                modelInfo.appendChild(heading)
                modelInfo.appendChild(software)
            }
            img.onload = () => {
                const column = getShortestColumn()
                column.html.appendChild(container)
                column.height += container.clientHeight
                loadedImages++
                if(loadedImages === this.images.length){
                    const randomImageId = Math.floor(Math.random()*this.images.length)
                    const image = this.images[randomImageId]
                    const heading = document.createElement("h2")
                    const software = document.createElement("p")
                    modelContainer.innerHTML = image.html
                    software.innerHTML = image.software
                    heading.innerHTML = image.name
                    modelInfo.innerHTML = ""    
                    modelInfo.appendChild(heading)
                    modelInfo.appendChild(software)
                }
            }
        })

    }
}