// Sound: https://opengameart.org/content/magic-sfx-sample

class Explosion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.spriteWidth = 200;
        this.spriteHeight = 179;
        this.width = this.spriteWidth * 0.5;
        this.height = this.spriteHeight * 0.5;
        this.image = new Image();
        this.image.src = 'images/boom.png';
        this.frame = 0;
        this.frameCount = 5;
        this.frameDelay = 5;
        this.angle = Math.random() * Math.PI * 2;
        this.sound = new Audio();
        this.sound.src = 'audio/boom.wav';
    }

    update() {
        if (this.frame === 0) {
            this.sound.play();
        }
        this.frame++;
    }

    draw() {
        let sx = Math.floor(this.frame / this.frameDelay) % this.frameCount * this.spriteWidth;
        let sy = 0;
        let sw = this.spriteWidth;
        let sh = this.spriteHeight;
        let dx = 0 - this.width * 0.5; // we set dx in translate
        let dy = 0 - this.height * 0.5; // we set dy in translate
        let dw = this.width;
        let dh = this.height;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.drawImage(this.image, sx, sy, sw, sh, dx, dy, dw, dh);
        ctx.restore();
    }   
}