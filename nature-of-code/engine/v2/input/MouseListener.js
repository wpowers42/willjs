// MouseListener.js
import { Vector } from "../core/Vector.js";

export class MouseListener {
    constructor() {
        this.position = new Vector(0, 0);
        this.positionUpdatedAt = 0;
        this.buttons = new Set();
    }

    attachListeners() {
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('mousedown', this.onMouseDown.bind(this));
        window.addEventListener('mouseup', this.onMouseUp.bind(this));
    }

    onMouseMove(event) {
        this.position.x = event.clientX;
        this.position.y = event.clientY;
        this.positionUpdatedAt = performance.now();
    }

    onMouseDown(event) {
        this.buttons.add(event.button);
    }

    onMouseUp(event) {
        this.buttons.delete(event.button);
    }

    getPosition() {
        return this.position;
    }

    isButtonPressed(buttonCode) {
        return this.buttons.has(buttonCode);
    }

    isMousePressed() {
        return this.isButtonPressed(0);
    }

    getMousePositionUpdatedAt() {
        return this.positionUpdatedAt;
    }
}
