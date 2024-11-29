// KeyboardListener.js
export class KeyboardListener {
    constructor() {
        this.keys = new Set();
    }

    attachListeners() {
        window.addEventListener('keydown', this.onKeyDown.bind(this));
        window.addEventListener('keyup', this.onKeyUp.bind(this));
    }

    onKeyDown(event) {
        this.keys.add(event.code);
    }

    onKeyUp(event) {
        this.keys.delete(event.code);
    }

    isKeyPressed(keyCode) {
        return this.keys.has(keyCode);
    }
}