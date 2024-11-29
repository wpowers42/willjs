// MouseListener.js
import { Vector } from "../core/Vector.js";

export class MouseListener {
    /**
     * @param {HTMLCanvasElement} canvas
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.position = new Vector(0, 0);
        this.positionUpdatedAt = 0;
        this.buttons = new Set();
    }

    attachListeners() {
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('contextmenu', this.onContextMenu.bind(this));
    }

    /**
     * @param {MouseEvent} event
     */
    onMouseMove(event) {
        this.position.x = event.clientX;
        this.position.y = event.clientY;
        this.positionUpdatedAt = performance.now();
    }

    /**
     * @param {MouseEvent} event
     */
    onMouseDown(event) {
        this.buttons.add(event.button);
    }

    /**
     * @param {MouseEvent} event
     */
    onMouseUp(event) {
        this.buttons.delete(event.button);
    }

    /**
     * @param {MouseEvent} event
     */
    onContextMenu(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    /**
     * @returns {Vector}
     */
    getPosition() {
        return this.position;
    }

    /**
     * @param {number} buttonCode
     * @returns {boolean}
     */
    isButtonPressed(buttonCode) {
        return this.buttons.has(buttonCode);
    }

    /**
     * @returns {boolean}
     */
    isMousePressed() {
        return this.isButtonPressed(0);
    }

    /**
     * @returns {number}
     */
    getMousePositionUpdatedAt() {
        return this.positionUpdatedAt;
    }
}
