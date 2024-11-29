// Mover.js

import { Vector } from "./Vector.js";

export class Mover {
    /**
     * @param {Vector} position
     * @param {Vector} velocity
     * @param {number} mass
     */
    constructor(position, velocity, mass) {
        this.position = position;
        this.velocity = velocity || Vector.zero();
        this.acceleration = Vector.zero();
        this.maxSpeed = 0;
        this.mass = mass || 1;
        this.radius = mass * 5;
    }

    /**
     * @param {number} maxSpeed
     */
    setMaxSpeed(maxSpeed) {
        this.maxSpeed = maxSpeed;
    }

    /**
     * @param {Vector} force
     */
    applyForce(force) {
        const forceVector = Vector.copy(force);
        forceVector.div(this.mass);
        this.acceleration.add(forceVector);
    }

    /**
     * @returns {void}
     */
    update() {
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        if (this.maxSpeed > 0) {
            this.velocity.limit(this.maxSpeed);
        }
        this.acceleration.mult(0);
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @returns {void}
     */
    draw(ctx) {
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
    }

    /**
     * @param {number} width
     * @param {number} height
     * @returns {void}
     */
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
