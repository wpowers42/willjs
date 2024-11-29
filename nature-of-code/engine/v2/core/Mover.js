// Mover.js

import { Vector } from "./Vector.js";

export class Mover {
    constructor(position, velocity, acceleration, maxSpeed) {
        this.position = position;
        this.velocity = velocity || Vector.zero();
        this.acceleration = acceleration || Vector.zero();
        this.maxSpeed = maxSpeed || 0;
    }

    update() {
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        if (this.maxSpeed > 0) {
            this.velocity.limit(this.maxSpeed);
        }
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
