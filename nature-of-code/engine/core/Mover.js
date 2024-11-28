// Mover.js

export class Mover {
    constructor(position, velocity) {
        this.position = position;
        this.velocity = velocity;
    }

    update() {
        this.position.add(this.velocity);
    }

    draw(ctx) {
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 10, 0, Math.PI * 2);
        ctx.fill();
    }

    checkEdges(width, height) {
        if (this.position.x > width) {
            this.position.x = 0;
        }

        if (this.position.x < 0) {
            this.position.x = width;
        }

        if (this.position.y > height) {
            this.position.y = 0;
        }

        if (this.position.y < 0) {
            this.position.y = height;
        }
    }
}
