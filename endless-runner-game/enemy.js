import Game from "./game.js";

export class Enemy {
    /** @param {Game} game */
    constructor(game) {
        this.game = game;
        this.frameX = 0;
        this.frameY = 0;
        this.fps = 20;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;
        this.markedForDeletion = false;
        this.backgroundSpeedModifier = 0.50;
    }

    /** @param {number} dt */
    update(dt) {
        this.frameTimer += dt;
        if (this.frameTimer >= this.frameInterval) {
            this.frameX++;
            if (this.frameX == this.frames) {
                this.frameX = 0;
            }
            this.frameTimer -= this.frameInterval;
        }

        this.x += this.dx * dt - this.game.backgroundSpeed * this.backgroundSpeedModifier * dt;
        this.y += this.dy * dt;

        if (this.x < -this.width) {
            this.markedForDeletion = true;
        }

    }

    /** @param {CanvasRenderingContext2D} ctx */
    draw(ctx) {
        let sx = this.frameX * this.width;
        let sy = this.frameY * this.height;
        ctx.drawImage(this.image, sx, sy, this.width, this.height, this.x, this.y, this.width, this.height);
        if (this.game.debug) {
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }

}

export class FlyingEnemy extends Enemy {
    /** @param {Game} game */
    constructor(game) {
        super(game);
        this.game = game;
        this.width = 60;
        this.height = 44;
        this.image = document.getElementById('enemyFly');
        this.frames = 6;
        this.x = this.game.width;
        this.y = Math.random() * this.game.height / 3 + this.height;
        this.dx = Math.random() * 0.05 - 0.10;
        this.dy = 0;
    }

    update() {
        this.dy = Math.sin(this.x / 60) / 20;
        super.update(this.game.dt);
        this.y = Math.max(0, this.y);
    }

    draw() {
        super.draw(this.game.ctx);
    }
}

export class GroundEnemy extends Enemy {
    /** @param {Game} game */
    constructor(game) {
        super(game);
        this.game = game;
        this.width = 60;
        this.height = 87;
        this.image = document.getElementById('enemyPlant');
        this.frames = 2;
        this.x = this.game.width;
        this.y = this.game.height - this.height - this.game.groundMargin;
        this.dx = 0;
        this.dy = 0;
    }

    update() {
        super.update(this.game.dt);
    }

    draw() {
        super.draw(this.game.ctx);
    }
}

export class ClimbingEnemy extends Enemy {
    /** @param {Game} game */
    constructor(game) {
        super(game);
        this.game = game;
        this.width = 120;
        this.height = 144;
        this.image = document.getElementById('enemySpiderBig');
        this.frames = 6;
        this.x = this.game.width;
        this.y = 0 - this.height;
        this.maxY = Math.random() * (this.game.height - this.game.groundMargin - this.height);
        this.dx = 0;
        this.dy = 0;
        this.maxDY = 0.05;
        this.descending = true;
    }

    update() {
        super.update(this.game.dt);

        if (this.y < -this.height && !this.descending) {
            this.markedForDeletion = true;
        }

        if (this.y > this.maxY) {
            this.descending = false;
        }
        this.dy = this.descending ? this.maxDY : -this.maxDY;
    }

    /** @param {CanvasRenderingContext2D} ctx */
    draw(ctx = this.game.ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(this.x + this.width * 0.5, 0);
        ctx.strokeStyle = 'black';
        ctx.lineTo(this.x + this.width * 0.5, this.y + this.height * 0.5);
        ctx.stroke();
        ctx.restore();
        super.draw(ctx);
    }
}
