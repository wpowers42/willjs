class Enemy {
    constructor(gameWidth, gameHeight) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.spriteWidth = 160;
        this.spriteHeight = 119;
        this.width = this.spriteWidth;
        this.height = this.spriteHeight;
        this.image = document.getElementById('enemyImage');
        this.x = this.gameWidth;
        this.y = this.gameHeight - this.height;
        this.frames = 6;
        this.frameX = 0;
        this.fps = 20;
        this.frameInterval = 1000 / this.fps;
        this.timeSinceLastFrame = 0;
        this.dx = 0.20;
        this.markedForDeletion = false;
        this.collisionXOffset = this.width * 0.35;
        this.collisionYOffset = this.height * 0.52;
        this.collisionRadius = this.width * 0.50 * 0.75;
        this.debug = false;
    }

    update(deltaTime) {
        this.timeSinceLastFrame += deltaTime;
        if (this.timeSinceLastFrame >= this.frameInterval) {
            this.frameX++;
            this.timeSinceLastFrame -= this.frameInterval;
            if (this.frameX == this.frames) {
                this.frameX = 0;
            }
        }

        this.x -= this.dx * deltaTime;
        if (this.x < 0 - this.width && !this.markedForDeletion) {
            this.markedForDeletion = true;
            score++;
        }
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        let sx = this.frameX * this.spriteWidth;
        let sy = 0;
        let sw = this.spriteWidth;
        let sh = this.spriteHeight;
        let dx = this.x;
        let dy = this.y;
        let dw = this.width;
        let dh = this.height;
        ctx.drawImage(this.image, sx, sy, sw, sh, dx, dy, dw, dh);
        if (this.debug) {
            ctx.save();
            ctx.strokeStyle = 'white'
            ctx.beginPath();
            ctx.arc(this.x + this.collisionXOffset, this.y + this.collisionYOffset, this.collisionRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }
}
