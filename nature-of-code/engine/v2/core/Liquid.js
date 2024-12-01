import { Vector } from './Vector.js';

export class Liquid {
    /**
     * @param {Vector} position
     * @param {Vector} size
     */
    constructor(position, size) {
        this.position = position;
        this.size = size;
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        const { x, y } = this.position;
        const width = this.size.x;
        const height = this.size.y;
        ctx.fillStyle = "rgba(0, 0, 255, 0.25)";
        ctx.fillRect(x, y, width, height);
    }
}
