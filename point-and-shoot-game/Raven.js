class Raven {
    constructor() {
        this.spriteWidth = 271;
        this.spriteHeight = 194;
        this.sizeModifier = Math.random() * 0.40 + 0.40;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;
        this.x = canvas.width;
        this.y = Math.floor(Math.random() * (canvas.height - this.height));
        this.directionX = Math.random() * 5 + 3;
        this.directionY = Math.random() * 5 - 2.5;
        this.image = new Image();
        this.image.src = 'images/raven.png';
        this.frame = 0;
        this.frameCount = 6;
        this.markedForDeletion = false;
        this.timeSinceFlapped = 0;
        this.flapInterval = 100 - (this.directionX * 8);
        this.randomColors = [Math.floor(Math.random() * 255),Math.floor(Math.random() * 255),Math.floor(Math.random() * 255),255];
        this.color = `rgba(${this.randomColors[0]},${this.randomColors[1]},${this.randomColors[2]},${this.randomColors[3]})`;
    }

    update(deltatime) {
        this.x -= this.directionX;
        this.y += this.directionY;
        if (this.x + this.width < 0) {
            this.markedForDeletion = true;
        }

        if (this.y < 0 || this.y + this.height > canvas.height) {
            this.directionY = -this.directionY;
        }

        this.timeSinceFlapped += deltatime;
        if (this.timeSinceFlapped >= this.flapInterval) {
            this.frame++;
            if (this.frame == this.frameCount) {
                this.frame = 0;
            }
            this.timeSinceFlapped = 0;
        }
    }

    draw() {
        let sx = this.frame * this.spriteWidth;
        let sy = 0;
        let sw = this.spriteWidth;
        let sh = this.spriteHeight;
        let dx = this.x;
        let dy = this.y;
        let dw = this.width;
        let dh = this.height;

        collisionCTX.fillStyle = this.color;
        collisionCTX.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.drawImage(this.image, sx, sy, sw, sh, dx, dy, dw, dh);
    }
}
