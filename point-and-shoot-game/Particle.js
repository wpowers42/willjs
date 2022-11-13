class Particle {
    constructor(x, y, size, color) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.radius = Math.random() * this.size * 20;
        this.maxRadius = Math.random() * 20 + 25;
        this.color = color;
        this.markedForDeletion = false;
        this.speedX = Math.random() * 1 + 0.5;
    }

    update() {
        this.x += this.speedX;
        this.radius += Math.min(0.5, this.maxRadius - this.radius);
        if (this.radius >= this.maxRadius) {
            this.markedForDeletion = true;
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = 1 - this.radius / this.maxRadius;
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
