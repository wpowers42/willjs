// Mover.js

import { Vector } from "./Vector.js";

export class Mover {
    constructor(position, velocity, mass) {
        this.position = position;
        this.velocity = velocity || Vector.zero();
        this.acceleration = Vector.zero();
        this.maxSpeed = 0;
        this.mass = mass || 1;
        this.radius = mass * 5;
    }

    setMaxSpeed(maxSpeed) {
        this.maxSpeed = maxSpeed;
    }

    applyForce(force) {
        const forceVector = Vector.copy(force);
        forceVector.div(this.mass);
        this.acceleration.add(forceVector);
    }

    update() {
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        if (this.maxSpeed > 0) {
            this.velocity.limit(this.maxSpeed);
        }
        this.acceleration.mult(0);
    }

    draw(ctx) {
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    checkEdges(width, height) {
        if (this.position.x + this.radius > width) {
            this.position.x = width - this.radius;
            this.velocity.x *= -1;
        }

        if (this.position.x - this.radius < 0) {
            this.position.x = this.radius;
            this.velocity.x *= -1;
        }

        if (this.position.y + this.radius > height) {
            this.position.y = height - this.radius;
            this.velocity.y *= -1;
        }

        if (this.position.y - this.radius < 0) {
            this.position.y = this.radius;
            this.velocity.y *= -1;
        }
    }
}
