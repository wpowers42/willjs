import Game from "./game.js";

class Enemy {
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
        ctx.drawImage(this.image, this.frameX * this.width, this.frameY * this.height,
            this.width, this.height, this.x, this.y, this.width, this.height)
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
        this.x = Math.random() * this.game.width * 0.75 + this.game.width * 0.25;
        this.y = this.game.height - this.height;
        this.maxY = Math.random() * this.game.height * 0.75 + this.game.height * 0.25;
        this.dx = 0;
        this.dy = 0.05;
    }

    update() {
        super.update(this.game.dt);
        // if (this.y > this.game.height) {}
    }

    draw() {
        super.draw(this.game.ctx);
    }
}
