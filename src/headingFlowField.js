class Point{
    constructor(position){
        this.position = position;
        
    }

}
class Vector2D{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
    add(vector){
        this.x += vector.x;
        this.y += vector.y;
    }
    sub(vector){
        this.x -= vector.x;
        this.y -= vector.y;
    }
    mult(scalar){
        this.x *= scalar;
        this.y *= scalar;
    }
    div(scalar){
        this.x /= scalar;
        this.y /= scalar;
    }
}


export default class textFlowField{
    constructor(text, canvasId){
        this.canvasId = canvasId;
        this.text = text;
        this.init();
    }

    init(){
        this.ctx = document.getElementById(this.canvasId).getContext('2d');
        this.resizeCanvas();

        this.ctx.font = "12vw raleway";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(this.text, this.width/2, this.height/2);
        this.pixels = this.ctx.getImageData(0, 0, this.width, this.height).data;
    }
    resizeCanvas(){
        this.width = document.getElementById(this.canvasId).parentElement.getBoundingClientRect().width;
        this.height = document.getElementById(this.canvasId).parentElement.getBoundingClientRect().height;
        this.ctx.canvas.width = this.width;
        this.ctx.canvas.height = this.height;
    }
    resize(){
        this.init();
    }
    animate(){

    }
}