const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const collisionCanvas = document.getElementById('collisionCanvas');
const collisionCtx = collisionCanvas.getContext('2d');
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;
let background = new Image();
background.src = "mountain.jpg";
let timeToNextBee = 0;
let beeInterval = 500;
let lastTime = 0;
let score = 1;
let difficulty = 1.01;

let bees = [];
let splatter = [];

class Splatter {
    constructor(x, y){
        this.x = x + (Math.random()-0.5) * 150;
        this.y = y + (Math.random()-0.5) * 150;
        this.size = Math.random() * 10 + 5;
        this.markedForDeletion = false;
    }
    update(deltatime){
        this.size -= 0.3;
        if (this.size <= 0.3){
            this.markedForDeletion = true;
        }
    }
    draw(deltatime){
        ctx.fillStyle = 'rgba(255,215,0,0.8)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Bee {
    constructor(){
        this.spriteWidth = 200;
        this.spriteHeight = 200;
        this.sizeModifier = Math.random() * 0.3 + 0.5;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;
        this.x = canvas.width;
        this.speedy = false;
        this.y = Math.random() * (canvas.height - this.height);
        if (Math.random() < 0.05){
            this.directionX = Math.random() * 5 + 17.5;
            this.speedy = true;
        } else {
            this.directionX = (Math.random() * 5 + 5) * difficulty;
        }
        this.directionY = Math.random() * 6 - 2.5;
        this.markedForDeletion = false;
        this.img = [];
        for(let i = 0; i < 13; i++){
            this.img[i] = new Image();
            if(i < 10){
                this.img[i].src = 'bee_0' + i + '.png';
            }else{
                this.img[i].src = 'bee_' + i + '.png'; 
            }   
        }
        this.frame = 0;
        this.maxFrame = 12;
        this.timeSinceFlap = 0;
        this.flapInterval = 5;
        // this.randomColors = [Math.floor(Math.random() * 255),Math.floor(Math.random() * 255),Math.floor(Math.random() * 255)];
        // this.color = 'rgb(' + this.randomColors[0] + ',' + this.randomColors[1] + ',' + this.randomColors[2] + ')';
    }
    update(deltatime){
        if (this.y < 0 || this.y > canvas.height - this.height) {
            this.directionY = this.directionY * - 1;
        }
        this.x -= this.directionX;
        this.y += this.directionY;

        if (this.x < 0 - this.width) {
            score--;
            this.markedForDeletion = true;
        }
        this.timeSinceFlap += deltatime;
        if (this.timeSinceFlap > this.flapInterval){
            if (this.frame >= this.maxFrame){
                this.frame = 0;
            }else{
                this.frame++;
                this.timeSinceFlap = 0;
            } 
        }
    }
    draw(){
        drawScore();
        // collisionCtx.fillStyle = this.color;
        // collisionCtx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.img[this.frame], this.x, this.y, this.width, this.height);
    }
}

class Sawblade {
    constructor(){
        this.spriteWidth = 100;
        this.spriteHeight = 100;
        blades[0] ? this.x = blades[0].x : this.x = 0;
        blades[0] ? this.y = blades[0].y : this.y = 0;
        this.img = new Image();
        this.img.src = "sawblade.png";
        this.angle = 90;
        this.spininterval = 100;
        this.timesincespin = 0;
        this.directionX = Math.random() * 10 + 3;
        this.directionY = Math.random() * 10 - 2.5;
        this.markedForDeletion = false;
    }
    update(deltatime){
        if (this !== blades[0]){
            this.x += this.directionX;
            this.y += this.directionY;
            if(this.x > canvas.width || this.x < 0 - this.spriteWidth || this.y > canvas.height || this.y < 0 - this.spriteHeight){
                this.markedForDeletion = true;
            }
        }
        
        this.angle += 65;
        bees.forEach(object => {
            let distanceX = Math.abs(this.x - object.x);
            let distanceY = Math.abs(this.y - object.y);
            let distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            if ((distance < (this.spriteWidth/2.25 + object.width/2)) && (object.speedy == true)){
                for(let i = 0; i < Math.random() * 10 + 50; i++){
                    splatter.push(new Splatter(this.x, this.y));
                    object.markedForDeletion = true; 
                    beeInterval *= 0.999;
                }
            } else if (distance < (this.spriteWidth/2.25 + object.width/2)) {
                if(this !== blades[0]){
                    score--;
                } else {
                    score++;
                }
                console.log("collision");
                object.markedForDeletion = true; 
                beeInterval *= 0.999;
                for(let i = 0; i < Math.random() * 10 + 10; i++){
                    splatter.push(new Splatter(this.x, this.y));
                }
                difficulty *= 1.001;
            }         
        })
        if (score < 0) score = 0;
    }

    draw(deltatime){
        ctx.save();
        ctx.translate(this.x + this.spriteWidth,this.y + this.spriteHeight);
        ctx.rotate(this.angle*Math.PI/180); 
        ctx.drawImage(this.img, -this.spriteWidth, -this.spriteHeight);
        ctx.restore();
        // ctx.drawImage(this.img, this.x, this.y, this.spriteWidth/2, this.spriteHeight/2);
    } 
        
}

let blades = [];
blades.push(new Sawblade());

function drawScore() {
    ctx.save();
    ctx.font = "30px Verdana";
    ctx.fillStyle = 'black';
    ctx.fillText('Health: ' + score, 50, 75);
    ctx.fillStyle = 'white';
    ctx.fillText('Health: ' + score, 52, 77);
    ctx.restore();
    
}

window.addEventListener('mousemove', function(e){
    // const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1);
    // console.log(detectPixelColor);
    blades[0].x = e.x - (blades[0].spriteWidth);
    blades[0].y = e.y - (blades[0].spriteHeight);
    // const pc = detectPixelColor.data;
})

window.addEventListener('keydown', function(e){
    if(e.keyCode == 32){
        // console.log("spacebar pressed");
        for(let i = 0; i < 15; i++ ){
            blades.push(new Sawblade());
            
        }

    }
})

function animate(timestamp){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // collisionCtx.clearRect(0, 0, collisionCanvas.width, collisionCanvas.height);
    let deltatime = timestamp - lastTime;
    lastTime = timestamp;
    timeToNextBee += deltatime;
    if (timeToNextBee > beeInterval){
        bees.push(new Bee());
        timeToNextBee = 0;
        bees.sort(function(a, b){
            return a.width - b.width;
        });
    };
    ctx.drawImage(background, 0, -100, canvas.width, canvas.height + 250);
    [...blades, ...bees, ...splatter].forEach(object => object.update(deltatime));
    [...blades, ...bees, ...splatter].forEach(object => object.draw(deltatime));
    bees = bees.filter(object => !object.markedForDeletion);
    blades = blades.filter(object => !object.markedForDeletion);
    splatter = splatter.filter(object => !object.markedForDeletion);
    requestAnimationFrame(animate);
}
animate(0);