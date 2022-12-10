const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('canvas'));
const span = /** @type {HTMLSpanElement} */ (document.getElementById('fps'));
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = canvas.width = 500;
const CANVAS_HEIGHT = canvas.height = 1000;

const numberOfEnemies = 2 ** 4;
const enemiesArray = [];



class Enemy {
    constructor(sprite) {
        this.sprite = sprite;
        this.image = new Image();
        this.image.src = sprite.src;
        this.width = sprite.width / 2;
        this.height = sprite.height / 2;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = Math.random() * (canvas.height - this.height);
        this.gameFrame = 0;
        this.spriteFrame = 0;
        this.staggerFrames = 3;
    }

    draw() {
        let sx = this.spriteFrame * this.sprite.width;
        let sy = 0;
        let sw = this.sprite.width;
        let sh = this.sprite.height;
        let dw = this.width;
        let dh = this.height;
        ctx.drawImage(this.image, sx, sy, sw, sh, this.x, this.y, dw, dh);
    }
}


const sprites = {
    bat: {
        src: './enemies/enemy1.png',
        width: 293,
        height: 155,
        frames: 6
    },
    ghost: {
        src: './enemies/enemy2.png',
        width: 266,
        height: 188,
        frames: 6
    },
    three: {
        src: './enemies/enemy3.png',
        width: 218,
        height: 177,
        frames: 6
    },
    teleport: {
        src: './enemies/enemy4.png',
        width: 213,
        height: 213,
        frames: 6
    }
};


class Bat extends Enemy {

    constructor() {
        super(sprites.bat);
        this.speed = Math.random() * 4;
        this.direction = Math.random() > 0.50 ? 1 : -1;
    }

    update() {
        this.x += this.speed * (Math.random() * 2 - 1);
        this.y += this.speed * (Math.random() * 2 - 1);
        this.spriteFrame = Math.floor(this.gameFrame / this.staggerFrames) % this.sprite.frames;
        this.gameFrame++;
    }
}

class Ghost extends Enemy {
    constructor() {
        super(sprites.ghost);
        this.speed = Math.random() * 4 + 1;
        this.angle = 0;
        this.angleSpeed = Math.random() * .2;
        this.curve = Math.random() * 5;
    }

    update() {
        this.x -= this.speed
        this.y += this.curve * Math.sin(this.angle);
        if (this.x + this.width < 0) {
            this.x = CANVAS_WIDTH;
        }
        this.spriteFrame = Math.floor(this.gameFrame / this.staggerFrames) % this.sprite.frames;
        this.gameFrame++;
        this.angle += this.angleSpeed;
    }
}

class Three extends Enemy {
    constructor() {
        super(sprites.three);
        this.angle = 0;
        this.angleSpeed = Math.random() * 2;
        this.curve = Math.random() * 100 + 50;
    }

    update() {
        this.x = canvas.width / 2 * Math.sin(this.angle * Math.PI / 269) + canvas.width / 2 - this.width / 2;
        this.y = canvas.height / 2 * Math.cos(this.angle * Math.PI / 270) + canvas.height / 2 - this.height / 2;
        this.angle += this.angleSpeed;
        this.spriteFrame = Math.floor(this.gameFrame / this.staggerFrames) % this.sprite.frames;
        this.gameFrame++;
    }
}

class Teleport extends Enemy {
    constructor() {
        super(sprites.teleport);
        this.interval = Math.floor(Math.random() * 300 + 100)
        this.newX = this.x;
        this.newY = this.y;
    }

    update() {
        if (this.gameFrame > 0 & this.gameFrame % this.interval == 0) {
            this.newX = Math.random() * (canvas.width - this.width);
            this.newY = Math.random() * (canvas.height - this.height);
        }

        this.x += (this.newX - this.x) / 20
        this.y += (this.newY - this.y) / 20
        this.spriteFrame = Math.floor(this.gameFrame / this.staggerFrames) % this.sprite.frames;
        this.gameFrame++;
    }
}

const spriteClasses = [Bat, Ghost, Three, Teleport];

for (let i = 0; i < numberOfEnemies; i++) {
    enemiesArray.push(new spriteClasses[Math.floor(Math.random() * spriteClasses.length)]);
}

let now = Date.now();

function update() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    enemiesArray.forEach(enemy => {
        enemy.update();
        enemy.draw();
    });

    let milliseconds = Date.now() - now;
    now = now + milliseconds;
    span.textContent = Math.floor(1000 / milliseconds);
    requestAnimationFrame(update);
}

update();