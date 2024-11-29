// KeyboardListener.js
export class KeyboardListener {
    constructor() {
        this.keys = new Set();
    }

    attachListeners() {
        window.addEventListener('keydown', this.onKeyDown.bind(this));
        window.addEventListener('keyup', this.onKeyUp.bind(this));
    }

    /**
     * @param {KeyboardEvent} event
     */
    onKeyDown(event) {
        this.keys.add(event.code);
    }

    /**
     * @param {KeyboardEvent} event
     */
    onKeyUp(event) {
        this.keys.delete(event.code);
    }

    /**
     * @param {string} keyCode
     * @returns {boolean}
     */
    isKeyPressed(keyCode) {
        return this.keys.has(keyCode);
    }
}