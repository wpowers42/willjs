// Sound: https://opengameart.org/content/magic-sfx-sample

class Explosion {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.sizeModifier = 1;
        this.spriteWidth = 200;
        this.spriteHeight = 179;
        this.width = this.spriteWidth * size * this.sizeModifier;
        this.height = this.spriteHeight * size * this.sizeModifier;
        this.image = new Image();
        this.image.src = 'images/boom.png';
        this.frame = 0;
        this.frameCount = 5;
        this.angle = Math.random() * Math.PI * 2;
        this.sound = new Audio();
        this.sound.src = 'audio/boom.wav';
        this.markedForDeletion = false;
        this.timeSinceLastFrame = 0;
        this.frameInterval = 60;
    }

    update(deltatime) {
        this.timeSinceLastFrame += deltatime;
        
        if (this.frame === 0) {
            this.sound.play();
        }

        if (this.timeSinceLastFrame >= this.frameInterval) {
            this.frame++;
            this.timeSinceLastFrame = 0;
        }
        
        if (this.frame == this.frameCount) {
            this.markedForDeletion = true;
        }

    }

    draw() {
        let sx = this.frame * this.spriteWidth;
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
