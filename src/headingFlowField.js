class Point{
    constructor(textFlowField, position, maxHistory, moveVector, thickness){
        this.maxAcceleration = 0.25; // per second
        this.maxSpeed = 12; // per second
        this.position = position;
        this.history = [];
        this.historyCount = 1;
        this.maxHistory = maxHistory;
        this.textFlowField = textFlowField;
        this.thickness = thickness;

        //this.fleeingDirection = new Vector2D(0, 0);
        this.isOut = false;
        this.idealDirection = moveVector;
        this.previousMovement = new Vector2D(0, 0);

    }
    addToHistory(position){
        if(this.historyCount % 12 != 0){
            this.historyCount++;
            return
        }
        this.historyCount = 1;
        this.history.push(position);
        if(this.history.length > this.maxHistory){
            this.history.shift();
        }
    }
    updateParticle(deltaTime){
        let idealMovement = this.previousMovement.clone()
        idealMovement.add(this.idealDirection);
        let acceleration = idealMovement.clone()
        acceleration.sub(this.previousMovement);
        if(acceleration.magnitude() > this.maxAcceleration){
            acceleration.div(acceleration.magnitude())
            acceleration.mult(this.maxAcceleration);
        }
        this.previousMovement.add(acceleration);
        if(this.previousMovement.magnitude() > this.maxSpeed){
            this.previousMovement.div(this.previousMovement.magnitude());
            this.previousMovement.mult(this.maxSpeed);
        }
        const realMovement = this.previousMovement.clone();
        realMovement.mult(deltaTime);
        this.position.add(realMovement);
        
        if(!this.textFlowField.isInText(this.position.getFloor())){
            this.idealDirection = this.textFlowField.vectorMap[this.position.getFloor().x][this.position.getFloor().y];
        }else{
            const shift = new Vector2D(Math.random()*2-1, Math.random()*2-1)
            shift.mult(0.3);
            this.idealDirection.add(shift);
        }
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
    clone(){
        return new Vector2D(this.x, this.y);
    }
    equals(vector){
        return this.x === vector.x && this.y === vector.y;
    }
    magnitude(){
        return Math.sqrt(this.x*this.x + this.y*this.y);
    }
    getFloor(){
        return new Vector2D(Math.floor(this.x), Math.floor(this.y))
    }
}


export default class textFlowField{
    constructor(text, canvasId){
        this.canvasId = canvasId;
        this.text = text;
        this.init();
        this.count = 0
    }

    init(){
        this.ctx = document.getElementById(this.canvasId).getContext('2d',  { willReadFrequently: true });
        this.resizeCanvas();
        this.animating = true

        this.ctx.font = "12vw raleway";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(this.text, this.width/2, this.height/2);
        this.pixels = this.ctx.getImageData(0, 0, this.width, this.height).data;

        this.calculateDensity();
        this.generateParticles();
        this.generateVecotrMap();
        this.renderParticles();

        this.animate();
    }
    resizeCanvas(){
        this.width = Math.floor(document.getElementById(this.canvasId).parentElement.getBoundingClientRect().width);
        this.height = Math.floor(document.getElementById(this.canvasId).parentElement.getBoundingClientRect().height);
        this.ctx.canvas.width = this.width;
        this.ctx.canvas.height = this.height;
        this.pixels = []
    }
    resize(){
        this.init();
    }
    calculateDensity(){
        this.count = this.width*0.35
    }
    isInText(position){
        const index = Math.floor((position.y * this.width + position.x) * 4);
        const alpha = this.pixels[index + 3];
        return alpha != 0;
    }
    generateParticles(){
        this.particles = [];

        for(let i = 0; i < this.count; i++){
            for(let j = 0; j < 5; j++){
                const x = Math.floor(Math.random() * this.width);
                const y = Math.floor(Math.random() * this.height);
                const position = new Vector2D(x, y);
                const moveVector = new Vector2D(Math.random()*2, Math.random()*2);
                if(this.isInText(position)){
                    this.particles.push(new Point(this, position, 30, moveVector, Math.random()*2+1));
                    break
                }
            }
        }
    }
    renderParticles(){
        this.ctx.clearRect(0, 0, this.width, this.height);
        for(let i = 0; i < this.particles.length; i++){
            const point = this.particles[i];
            this.ctx.beginPath();
            this.ctx.arc(point.position.x, point.position.y, 2, 0, 2 * Math.PI);
            this.ctx.fillStyle = "black";
            
            this.ctx.fill();

            this.ctx.lineWidth = point.thickness;
            this.ctx.beginPath();
            this.ctx.moveTo(point.position.x, point.position.y);
            for(let j = point.history.length-1; j >= 0; j--){
                this.ctx.lineTo(point.history[j].x, point.history[j].y);
                this.ctx.moveTo(point.history[j].x, point.history[j].y)
                
            }
            this.ctx.strokeStyle = '#000000';
            this.ctx.stroke();
            
        }
    }
    updateParticles(deltaTime){
        for(let i = 0; i < this.particles.length; i++){
            const point = this.particles[i];
            point.addToHistory(point.position.clone());
            point.updateParticle(deltaTime);
        }
    }
    animate(){
        const newTime = Date.now();
        if(this.time === undefined || newTime - this.time > 1000/60){
            if(this.time === undefined){
                this.time = newTime;
            }
            let deltaTime = (newTime - this.time) / 1000;
            if(deltaTime > 0.1){
                deltaTime = 0.1;
            }
            this.time = newTime;
            this.updateParticles(deltaTime);
            this.renderParticles();
        }
        if(this.animating){
            requestAnimationFrame(this.animate.bind(this));
        }
    }
    generateVecotrMap(){
        const vectorMagnitudeIncrease = 0.2;
        this.vectorMap = [];
        const queue = [];
        for(let i = 0; i < this.width; i++){
            this.vectorMap.push([]);
        }

        // detekce vnitřeních a sousedících pixelů
        for(let i = 0; i < this.width; i++){
            for(let j = 0; j < this.height; j++){
                
                if(this.isInText(new Vector2D(i, j))){
                    this.vectorMap[i][j] = new Vector2D(0, 0);
                    continue
                }

                if(i>0 && this.isInText(new Vector2D(i-1, j))){
                    this.vectorMap[i][j] = new Vector2D(1, 0);
                    queue.push({vector: new Vector2D(i, j), distance: 1});
                    continue 
                }
                if(i<this.width-1 && this.isInText(new Vector2D(i+1, j))){
                    this.vectorMap[i][j] = new Vector2D(-1, 0);
                    queue.push({vector: new Vector2D(i, j), distance: 1});
                    continue 
                }
                if(j>0 && this.isInText(new Vector2D(i, j-1))){
                    this.vectorMap[i][j] = new Vector2D(0, 1);
                    queue.push({vector: new Vector2D(i, j), distance: 1});
                    continue 
                }
                if(j<this.height-1 && this.isInText(new Vector2D(i, j+1))){
                    this.vectorMap[i][j] = new Vector2D(0, -1);
                    queue.push({vector: new Vector2D(i, j), distance: 1});
                    continue 
                }
            }
        }

        // dotvoření vektorové mapy
        while(queue.length != 0 ){
            const current = queue.shift();
            const x = current.vector.x;
            const y = current.vector.y;
            const distance = current.distance;
            if(x>0 && this.vectorMap[x-1][y] === undefined){
                this.vectorMap[x-1][y] = new Vector2D(1*vectorMagnitudeIncrease*distance, 0);
                queue.push({vector: new Vector2D(x-1, y), distance: distance+1});
            }
            if(x<this.width-1 && this.vectorMap[x+1][y] === undefined){
                this.vectorMap[x+1][y] = new Vector2D(-1*vectorMagnitudeIncrease*distance, 0);
                queue.push({vector: new Vector2D(x+1, y), distance: distance+1});
            }
            if(y>0 && this.vectorMap[x][y-1] === undefined){
                this.vectorMap[x][y-1] = new Vector2D(0, 1*vectorMagnitudeIncrease*distance);
                queue.push({vector: new Vector2D(x, y-1), distance: distance+1});
            }
            if(y<this.height-1 && this.vectorMap[x][y+1] === undefined){
                this.vectorMap[x][y+1] = new Vector2D(0, -1*vectorMagnitudeIncrease*distance);
                queue.push({vector: new Vector2D(x, y+1), distance: distance+1});
            }
        }
    }
    stop(){
        this.animating = false;
    }
    start(){
        this.time = Date.now();
        this.animating = true;
        this.animate();
    }
}