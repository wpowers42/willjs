import { Vector } from './Vector.js';
import { Mover } from './Mover.js';
export class Liquid {
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     * @param {number} dragCoefficient
     */
    constructor(x, y, width, height, dragCoefficient) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.dragCoefficient = dragCoefficient;
        this.density = 0.005;;
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        ctx.fillStyle = "rgba(0, 0, 255, 0.25)";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    /**
     * @param {Mover} mover
     * @returns {boolean}
     * 
     * This uses the simple axis-aligned bounding box test for now
     */
    contains(mover) {
        const pos = mover.position;
        return pos.x >= this.x && pos.x <= this.x + this.width &&
            pos.y >= this.y && pos.y <= this.y + this.height;
    }

    /**
     * @param {Mover} mover
     */
    drag(mover) {
        const velocity = mover.velocity.mag();
        const velocitySquared = velocity * velocity;
        const surfaceArea = Math.PI * Math.pow(mover.radius, 2);
        const dragForce = -0.5 * this.density * velocitySquared * surfaceArea * this.dragCoefficient;
        // limit the drag force to -100 to prevent extreme values
        const dragForceClamped = Math.max(dragForce, -100);

        let dragForceVector = Vector.copy(mover.velocity);
        dragForceVector.normalize();
        dragForceVector.mult(dragForceClamped);
        return dragForceVector;
    }
}
