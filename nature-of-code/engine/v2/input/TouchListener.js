import { Vector } from "../core/Vector.js";

// TouchListener.js
export class TouchListener {
    constructor(canvas) {
        this.canvas = canvas;
        this.position = new Vector(0, 0);
        this.positionUpdatedAt = 0;
        this.isTouching = false;
    }

    attachListeners() {
        this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this));
        this.canvas.addEventListener('touchend', this.onTouchEnd.bind(this));
        this.canvas.addEventListener('touchmove', this.onTouchMove.bind(this));
    }

    onTouchStart(event) {
        // prevent the default touch action
        // specifically, prevent magnification on double tap plus hold
        event.preventDefault();
        const touch = event.touches[0];
        this.position = new Vector(touch.clientX, touch.clientY);
        this.positionUpdatedAt = performance.now();
        this.isTouching = true;
    }

    onTouchEnd(event) {
        this.isTouching = false;
    }

    onTouchMove(event) {
        const touch = event.touches[0];
        this.position = new Vector(touch.clientX, touch.clientY);
        this.positionUpdatedAt = performance.now();
    }

    getTouchPosition() {
        return this.position;
    }

    getTouchPositionUpdatedAt() {
        return this.positionUpdatedAt;
    }

    isTouchPressed() {
        return this.isTouching;
    }
}
