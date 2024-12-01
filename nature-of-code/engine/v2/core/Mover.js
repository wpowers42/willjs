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
     * @param {number} dt
     * @returns {void}
     */
    update(dt) {
        const velocity = Vector.copy(this.velocity);
        velocity.mult(dt);

        const acceleration = Vector.copy(this.acceleration);
        acceleration.mult(dt);

        this.position.add(velocity);
        this.velocity.add(acceleration);

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
     * @param {number} elasticity
     * @returns {void}
     */
    checkEdges(width, height, elasticity = 1) {
        if (this.position.x + this.radius > width) {
            this.position.x = width - this.radius;
            this.velocity.x *= -elasticity;
        }

        if (this.position.x - this.radius < 0) {
            this.position.x = this.radius;
            this.velocity.x *= -elasticity;
        }

        if (this.position.y + this.radius > height) {
            this.position.y = height - this.radius;
            this.velocity.y *= -elasticity;
        }

        if (this.position.y - this.radius < 0) {
            this.position.y = this.radius;
            // don't bounce off the ceiling
            this.velocity.y *= -1;
        }
    }

    /**
     * @param {number} height
     * @returns {boolean}
     * 
     * @description
     * 1px tolerance so we don't have to make friction a huge number
     */
    isTouchingBottom(height) {
        return this.position.y + this.radius >= height - 1;
    }
}
