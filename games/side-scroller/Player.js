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
        this.x = 100;
        this.y = this.gameHeight - this.height;
        this.speedX = 0.45;
        this.speedY = 1.30;
        this.gravity = 0.05;
        this.dx = 0;
        this.dy = 0;
        this.spriteFrames = [9, 7];
        this.frameX = 0;
        this.frameY = 0;
        this.fps = 20;
        this.frameInterval = 1000 / this.fps;
        this.timeSinceLastFrame = 0;
        this.image = document.getElementById('playerImage');
        this.collisionXOffset = this.width * 0.53;
        this.collisionYOffset = this.height * 0.55;
        this.collisionRadius = this.width * 0.50 * 0.67;
        this.debug = false;
    }

    restart() {
        this.x = 100;
        this.y = this.gameHeight - this.height;
        this.dx = 0;
        this.dy = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.timeSinceLastFrame = 0;
    }

    /**
     * @param {number} deltatime
     */
    update(deltatime, input, enemies) {

        /* Move Player */

        // Move Player based on speed from last update.
        this.x += this.dx * deltatime;
        this.y += this.dy * deltatime;

        // Clamp Player to screen horizontally.
        if (this.x < 0) {
            this.x = 0;
        } else if (this.x > this.gameWidth - this.width) {
            this.x = this.gameWidth - this.width;
        }

        // Clamp Player to screen vertically.
        if (this.y < 0) {
            this.y = 0;
        } else if (this.y > this.gameHeight - this.height) {
            this.y = this.gameHeight - this.height;
        }

        /* Check for enemy collision */
        let cX = this.x + this.collisionXOffset;
        let cY = this.y + this.collisionYOffset;
        let cR = this.collisionRadius;

        const collisions = enemies.filter(enemy => {
            let eX = enemy.x + enemy.collisionXOffset;
            let eY = enemy.y + enemy.collisionYOffset;
            let eR = enemy.collisionRadius;
            let distance = Math.sqrt((eX - cX) ** 2 + (eY - cY) ** 2);
            let collisionDistance = cR + eR;

            // console.log(distance,  collisionDistance);

            return collisionDistance > distance;
        });

        if (collisions.length > 0) {
            gameOver = true;
        }

        /* Animation Frames */
        // speed up animation if moving forward
        this.timeSinceLastFrame += deltatime * (this.dx > 0 ? 1.25 : 1.00);

        if (!this.#onGround()) {
            this.frameY = 1;
        } else {
            this.frameY = 0;
        }

        if (this.timeSinceLastFrame >= this.frameInterval) {
            this.frameX++;
            if (this.frameX == this.spriteFrames[this.frameY]) {
                this.frameX = 0;
            }
            this.timeSinceLastFrame -= this.frameInterval;
        }

        /* Handle Player input. */
        if (input.keys.indexOf('ArrowRight') > -1) {
            this.dx = this.speedX;
        } else if (input.keys.indexOf('ArrowLeft') > -1) {
            this.dx = -this.speedX;
        } else {
            this.dx = 0;
        }

        if ((input.keys.indexOf('ArrowUp') > -1 || input.keys.indexOf('SwipeUp') > -1) &&
            this.#onGround()) {
            // jump
            this.dy = -this.speedY;
            this.frameX = 0;
        } else if (input.keys.indexOf('ArrowDown') > -1) {
            this.dy = this.speedY;
        } else if (!this.#onGround()) {
            this.dy = this.dy + this.gravity;
        } else if (this.#onGround()) {
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

        if (this.debug) {
            ctx.save();
            ctx.strokeStyle = 'white'
            ctx.beginPath();
            ctx.arc(this.x + this.collisionXOffset, this.y + this.collisionYOffset, this.collisionRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }

    #onGround() {
        return this.y >= this.gameHeight - this.height;
    }
}
