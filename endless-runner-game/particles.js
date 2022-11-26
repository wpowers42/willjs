class Particle {
    constructor(game, x, y, dx, dy, size) {
        this.game = game;
        this.markedForDeletion = false;
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.lifeTimeMS = 1000;
        this.size = size;
        this.initialSize = this.size;
        this.sizeSteps = 16;
        this.sizeStepsRemaining = this.sizeSteps;
        this.sizeInterval = this.lifeTimeMS / this.sizeSteps;
        this.sizeTimer = 0;
        this.sizeRatio = 0.90;
    }

    /** @param {number} dt */
    update(dt = this.game.dt) {
        this.x += this.dx * dt;
        this.y += this.dy * dt;

        this.sizeTimer += dt;
        if (this.sizeTimer >= this.sizeInterval) {
            this.size *= this.sizeRatio;
            this.sizeTimer -= this.sizeInterval;
            this.sizeStepsRemaining -= 1;
            if (this.sizeStepsRemaining === 0) {
                this.markedForDeletion = true;
            }
        }
    }
}

export class Dust extends Particle {
    constructor(game, x, y) {
        let size = Math.random() * 8 + 8;
        let speed = 0.10;
        let dx = Math.random() * speed - speed * 0.75;
        let dy = Math.random() * speed - speed * 0.75;
        super(game, x, y, dx, dy, size);
        this.color = 'rgba(40,40,40,0.40)';
    }

    /** @param {CanvasRenderingContext2D} ctx */
    draw(ctx = this.game.ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.size / this.initialSize;
        ctx.fill();
        ctx.restore();
    }
}

export class Fire extends Particle {
    constructor(game, x, y) {
        let size = Math.random() * 100 + 75;
        let speed = 0.04;
        let dx = 0;
        let dy = -speed;
        super(game, x, y, dx, dy, size);
        this.image = document.getElementById('playerFire');
        this.angle = 0;
    }

    update() {
        super.update();
        this.width = this.size;
        this.height = this.width * 0.90;
        this.angle += this.game.dt;
        this.dx = Math.sin(this.angle / 64) / 64;
        // this.dy = Math.sin(this.angle / 100);
    }

    /** @param {CanvasRenderingContext2D} ctx */
    draw(ctx = this.game.ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.globalAlpha = this.size / this.initialSize;
        ctx.drawImage(this.image, 0 - this.width * 0.50, 0 - this.height * 0.50, this.width, this.height);
        ctx.restore();
    }
}

export class Splash extends Particle {
    constructor(game, x, y) {
        let size = Math.random() * 75 + 50;
        let dx = Math.random() * 0.4 - 0.2;
        let dy = -(Math.random() * 0.50);
        super(game, x, y, dx, dy, size);
        this.image = document.getElementById('playerFire');
        this.gravity = this.game.player.gravity * 0.50;
    }

    update() {
        this.dy += this.gravity * this.game.dt;
        super.update();
        this.width = this.size;
        this.height = this.width * 0.90;
        this.y = Math.min(this.y, this.game.height - this.game.groundMargin - this.height / 2);
    }

    /** @param {CanvasRenderingContext2D} ctx */
    draw(ctx = this.game.ctx) {
        ctx.drawImage(this.image, this.x - this.width * 0.50, this.y - this.height * 0.50, this.width, this.height);
    }
}
