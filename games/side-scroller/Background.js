class Background {
    constructor(gameWidth, gameHeight) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.image = document.getElementById('backgroundImage');
        this.x = 0;
        this.y = 0;
        this.width = 2400;
        this.height = 720;
        this.speed = 0.3;
    }

    restart() {
        this.x = 0;
    }

    update(deltaTime) {
        this.x -= this.speed * deltaTime;
        if (this.x < 0 - this.width) {
            this.x += this.width;
        }
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx, deltaTime) {
        // TODO: fix random vertical bar (note: not because of a gap);
        // @ts-ignore
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        // @ts-ignore
        ctx.drawImage(this.image, this.x + this.width - this.speed * deltaTime, this.y);
        // ctx.save();
        // ctx.fillStyle = 'red';
        // ctx.globalAlpha = 0.05;
        // ctx.fillRect(this.x + this.width - this.speed * deltaTime + 10, 0, this.width, this.height);
        // ctx.restore();
    }
}
