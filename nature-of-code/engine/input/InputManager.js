// InputManager.js
import { MouseListener } from './MouseListener.js';
import { KeyboardListener } from './KeyboardListener.js';

export class InputManager {
    constructor() {
        this.mouse = new MouseListener();
        this.keyboard = new KeyboardListener();
    }

    initialize() {
        this.mouse.attachListeners();
        this.keyboard.attachListeners();
    }

    // Methods to retrieve input states
    isKeyPressed(keyCode) {
        return this.keyboard.isKeyPressed(keyCode);
    }

    getMousePosition() {
        return this.mouse.getPosition();
    }
}