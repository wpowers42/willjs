class Enemy {
    constructor(game) {
        this.game = game;
        this.width = 100;
        this.height = 100;
        this.x = this.game.width;
        this.y = Math.random() * (game.height - this.height);
        this.markedForDeletion = false;
        this.frameInterval = 100;
        this.frameTimer = 0;
        this.frame = 0;
    }

    update(deltaTime) {
        this.frameTimer += deltaTime;

        if (this.frameTimer >= this.frameInterval) {
            this.frame++;
            if (this.frame == this.spriteFrames) {
                this.frame = 0;
            }
            this.frameTimer -= this.frameInterval;
        }

        this.x -= this.vx * deltaTime;

        if (this.x < 0 - this.width || this.y < (0 - this.height)) {
            this.markedForDeletion = true;
        }
    }

    draw(/** @type {CanvasRenderingContext2D} */ ctx) {
        let sx = this.frame * this.spriteWidth;
        let sy = 0;
        let sw = this.spriteWidth;
        let sh = this.spriteHeight;
        let dx = this.x;
        let dy = this.y;
        let dw = this.width;
        let dh = this.height
        ctx.drawImage(this.image, sx, sy, sw, sh, dx, dy, dw, dh);
    }
}

class Worm extends Enemy {
    constructor(game) {

        super(game); // have to use super before this

        this.spriteWidth = 229;
        this.spriteHeight = 171;
        this.spriteFrames = 6;
        this.width = this.spriteWidth * 0.5;
        this.height = this.spriteHeight * 0.5;
        this.x = this.game.width;
        this.y = game.height - this.height;

        // any html elements with an id are automatically added to the JavaScript
        // environment as a global variable.
        this.image = worm;
        this.vx = Math.random() * 0.1 + 0.05;
    }

}


class Ghost extends Enemy {
    constructor(game) {

        super(game); // have to use super before this

        this.spriteWidth = 261;
        this.spriteHeight = 209;
        this.spriteFrames = 6;
        this.width = this.spriteWidth * 0.5;
        this.height = this.spriteHeight * 0.5;
        this.x = this.game.width;
        this.y = Math.random() * 0.6 * game.height;

        // any html elements with an id are automatically added to the JavaScript
        // environment as a global variable.
        this.image = ghost;
        this.vx = Math.random() * 0.2 + 0.05;
        this.angle = 0;
        this.curve = Math.random() * 3;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.y += Math.sin(this.angle) * this.curve;
        this.angle += Math.PI * 2.0 * 0.02;
    }

    draw(/** @type {CanvasRenderingContext2D} */ ctx) {
        ctx.save();
        ctx.globalAlpha = 0.5;
        super.draw(ctx);
        ctx.restore();
    }

}

class Spider extends Enemy {
    constructor(game) {

        super(game); // have to use super before this

        this.spriteWidth = 310;
        this.spriteHeight = 175;
        this.spriteFrames = 6;
        this.width = this.spriteWidth * 0.5;
        this.height = this.spriteHeight * 0.5;
        this.x = Math.random() * (this.game.width - this.width);
        this.y = 0 - this.height;

        // any html elements with an id are automatically added to the JavaScript
        // environment as a global variable.
        this.image = spider;
        this.vx = 0;
        this.vy = Math.random() * 0.1 + 0.1;
        this.maxLength = Math.random() * (this.game.height - this.height);
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.y += this.vy * deltaTime;
        if (this.y >= this.maxLength) {
            this.vy *= -1;
        }
    }

    draw(/** @type {CanvasRenderingContext2D} */ ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.globalCompositeOperation='destination-over';
        ctx.moveTo(this.x + this.width * 0.5, 0);
        ctx.lineTo(this.x+ this.width * 0.5, this.y + this.height * 0.5);
        ctx.strokeStyle = 'rgb(100,100,100)';
        ctx.stroke();
        ctx.restore();
        super.draw(ctx);
    }

}
