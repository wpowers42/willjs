export default class CollisionAnimation {
    constructor(game, x, y) {
        this.game = game;
        this.image = document.getElementById('playerBoom');
        this.spriteWidth = 100;
        this.spriteHeight = 90;
        this.sizeModifier = Math.random() * 0.5 + 0.5;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;
        this.x = x - this.width * 0.5;
        this.y = y - this.height * 0.5;
        this.frameX = 0;
        this.frames = 4;
        this.fps = 15;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;
        this.markedForDeletion = false;
    }

    /** @param {number} dt */
    update(dt = this.game.dt) {
        this.x -= this.game.backgroundSpeed * dt;
        this.frameTimer += dt;
        if (this.frameTimer >= this.frameInterval) {
            this.frameX++;
            this.frameTimer -= this.frameInterval;
            if (this.frameX == this.frames) {
                this.markedForDeletion = true;
            }
        }
    }

    /** @param {CanvasRenderingContext2D} ctx */
    draw(ctx = this.game.ctx) {
        let sx = this.frameX * this.spriteWidth;
        let sy = 0;
        let sw = this.spriteWidth;
        let sh = this.spriteHeight;
        let dx = this.x;
        let dy = this.y;
        let dw = this.width;
        let dh = this.height;
        ctx.drawImage(this.image, sx, sy, sw, sh, dx, dy, dw, dh);
    }
}

