// @ts-check

class Player {
    /**
     * @param {number} gameWidth
     * @param {number} gameHeight
     */
    constructor(gameWidth, gameHeight) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.spriteWidth = 200;
        this.spriteHeight = 200;
        // good practice to match art to game size
        this.width = this.spriteWidth;
        this.height = this.spriteHeight;
        this.x = 10;
        this.y = this.gameHeight - this.height;
        this.speedX = 0.25;
        this.speedY = 0.25;
        this.gravity = 0.10;
        this.dx = 0;
        this.dy = 0;
        this.spriteFrames = [9, 7];
        this.frameX = 0;
        this.frameY = 0;
        this.frameInterval = 100;
        this.timeSinceLastFrame = 0;
        this.image = document.getElementById('playerImage');
    }

    /**
     * @param {number} deltatime
     */
    update(deltatime, input) {
        if (this.dx !== 0) {
            this.timeSinceLastFrame += deltatime;
        }

        if (this.timeSinceLastFrame >= this.frameInterval) {
            this.frameX++;
            if (this.frameX == this.spriteFrames[this.frameY]) {
                this.frameX = 0;
            }
            this.timeSinceLastFrame -= this.frameInterval;
        }

        this.x += this.dx * deltatime;
        this.y += (this.dy + this.gravity) * deltatime;

        if (!this.#onGround()) {
            this.frameY = 1;
        } else {
            this.frameY = 0;
        }

        if (this.x < 0) {
            this.x = 0;
        } else if (this.x > this.gameWidth - this.width) {
            this.x = this.gameWidth - this.width;
        }

        if (this.y < 0) {
            this.y = 0;
        } else if (this.y > this.gameHeight - this.height) {
            this.y = this.gameHeight - this.height;
        }

        if (input.keys.indexOf('ArrowRight') > -1) {
            this.dx = this.speedX;
        } else if (input.keys.indexOf('ArrowLeft') > -1) {
            this.dx = -this.speedX;
        } else {
            this.dx = 0;
        }

        if (input.keys.indexOf('ArrowUp') > -1) {
            this.dy = -this.speedY;
        } else if (input.keys.indexOf('ArrowDown') > -1) {
            this.dy = this.speedY;
        } else {
            this.dy = 0;
        }

    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        let sx = this.frameX * this.spriteWidth;
        let sy = this.frameY * this.spriteHeight;
        let sw = this.spriteWidth;
        let sh = this.spriteHeight;
        let dx = this.x;
        let dy = this.y;
        let dw = this.width;
        let dh = this.height;

        ctx.drawImage(this.image, sx, sy, sw, sh, dx, dy, dw, dh);

        // ctx.fillStyle = 'white';
        // ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    #onGround() {
        return this.y >= this.gameHeight - this.height;
    }
}
