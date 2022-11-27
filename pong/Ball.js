export default class Ball {
    constructor(x, y, game) {
        this.game = game;
        this.width = 4;
        this.height = 4;
        this.startX = x - this.width * 0.50;
        this.startY = y - this.height * 0.50;
        this.x = this.startX;
        this.y = this.startY;
        this.speedX = 0.10;
        this.speedY = 0.10;
        this.dx = (Math.random() < 0.50 ? -1 : 1) * this.speedX;
        this.dy = (Math.random() - 0.50) * this.speedY;
    }

    collides(player) {
        if (this.x > player.x + player.width ||
            this.x + this.width < player.x ||
            this.y > player.y + player.height ||
            this.y + this.height < player.y) {
            return false;
        } else {
            return true;
        }
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.dx = (Math.random() < 0.50 ? -1 : 1) * this.speedX;
        this.dy = (Math.random() - 0.50) * this.speedY;
    }

    update(dt) {
        this.x += this.dx * dt;
        this.y += this.dy * dt;

        if (this.collides(this.game.player1) || this.collides(this.game.player2)) {
            this.dx *= -1;
            let left = this.game.player1.x + this.game.player1.width;
            let right = this.game.player2.x - this.width;
            this.x = Math.max(left, Math.min(this.x, right));
        }

        if (this.y <= 0 || this.y >= this.game.height - this.height) {
            this.dy *= -1;
            this.y = Math.max(0, Math.min(this.y, this.game.height - this.height));
        }

    }

    /** @param {CanvasRenderingContext2D} ctx */
    draw(ctx) {
        ctx.save();
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }
}
