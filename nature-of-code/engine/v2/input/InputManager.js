// InputManager.js
import { MouseListener } from './MouseListener.js';
import { KeyboardListener } from './KeyboardListener.js';
import { TouchListener } from './TouchListener.js';

export class InputManager {
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
    isKeyPressed(keyCode) {
        return this.keyboard.isKeyPressed(keyCode);
    }

    isMousePressed() {
        return this.mouse.isMousePressed();
    }

    getMousePosition() {
        return this.mouse.getPosition();
    }

    getTouchPosition() {
        return this.touch.getTouchPosition();
    }

    getLatestMouseTouchPosition() {
        if (this.mouse.getMousePositionUpdatedAt() > this.touch.getTouchPositionUpdatedAt()) {
            return this.mouse.getPosition();
        } else {
            return this.touch.getTouchPosition();
        }
    }

    isTouchPressed() {
        return this.touch.isTouchPressed();
    }
}
