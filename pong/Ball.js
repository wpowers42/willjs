export default class Ball {
    constructor(x, y) {
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

    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.dx = (Math.random() < 0.50 ? -1 : 1) * this.speedX;
        this.dy = (Math.random() - 0.50) * this.speedY;
    }

    update(dt) {
        this.x += this.dx * dt;
        this.y += this.dy * dt;
    }

    /** @param {CanvasRenderingContext2D} ctx */
    draw(ctx) {
        ctx.save();
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }
}
