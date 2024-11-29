// InputManager.js
import { MouseListener } from './MouseListener.js';
import { KeyboardListener } from './KeyboardListener.js';
import { TouchListener } from './TouchListener.js';

export class InputManager {
    constructor() {
        this.mouse = new MouseListener();
        this.keyboard = new KeyboardListener();
        this.touch = new TouchListener();
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
}
