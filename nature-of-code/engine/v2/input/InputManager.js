// InputManager.js
import { MouseListener } from './MouseListener.js';
import { KeyboardListener } from './KeyboardListener.js';
import { TouchListener } from './TouchListener.js';

export class InputManager {
    /**
     * @param {HTMLCanvasElement} canvas
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.mouse = new MouseListener(canvas);
        this.keyboard = new KeyboardListener();
        this.touch = new TouchListener(canvas);
    }

    initialize() {
        this.mouse.attachListeners();
        this.keyboard.attachListeners();
        this.touch.attachListeners();
    }

    // Methods to retrieve input states
    /**
     * @param {string} keyCode
     * @returns {boolean}
     */
    isKeyPressed(keyCode) {
        return this.keyboard.isKeyPressed(keyCode);
    }

    /**
     * @returns {boolean}
     */
    isMousePressed() {
        return this.mouse.isMousePressed();
    }

    /**
     * @returns {{x: number, y: number}}
     */
    getMousePosition() {
        if (this.mouse.getMousePositionUpdatedAt() > this.touch.getTouchPositionUpdatedAt()) {
            return this.mouse.getPosition();
        } else {
            return this.touch.getTouchPosition();
        }
    }

    /**
     * @returns {boolean}
     */
    isTouchPressed() {
        return this.touch.isTouchPressed();
    }
}
