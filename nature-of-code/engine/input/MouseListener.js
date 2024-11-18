// MouseListener.js
export class MouseListener {
    constructor() {
        this.position = { x: 0, y: 0 };
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
}