// CanvasTransform.js

import { Vector } from "../core/Vector.js";

export class CanvasTransform {
    /**
     * @param {HTMLCanvasElement} canvas
     */
    constructor(canvas) {
        this.canvas = canvas;
    }

    /**
     * Converts window coordinates to canvas coordinates
     * @param {number} windowX - The x coordinate in window space
     * @param {number} windowY - The y coordinate in window space
     * @returns {{x: number, y: number}} The coordinates in canvas space
     */
    windowToCanvas(windowX, windowY) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        return {
            x: (windowX - rect.left) * scaleX,
            y: (windowY - rect.top) * scaleY
        };
    }

    /**
     * Converts a Vector from window coordinates to canvas coordinates
     * @param {Vector} windowVector - The vector in window space
     * @returns {Vector} The vector in canvas space
     */
    vectorWindowToCanvas(windowVector) {
        const coords = this.windowToCanvas(windowVector.x, windowVector.y);
        return new Vector(coords.x, coords.y);
    }
}
