export default class InputHandler {
    constructor() {
        // Set up a Set to store the currently pressed keys
        this.pressedKeys = new Set();
        // Add event listeners for keydown and keyup events
        document.addEventListener('keydown', event => this.onKeyDown(event));
        document.addEventListener('keyup', event => this.onKeyUp(event));
    }
    // Method to handle keydown events
    onKeyDown(event) {
        // Check if this is a repeat event
        if (!event.repeat) {
            // Add the key to the set of pressed keys
            this.pressedKeys.add(event.key);
        }
    }
    // Method to handle keyup events
    onKeyUp(event) {
        // Remove the key from the set of pressed keys
        this.pressedKeys.delete(event.key);
    }
    // Method to remove a key from the set of pressed keys
    removeKey(key) {
        this.pressedKeys.delete(key);
    }
    // Method to check if a given key is currently pressed
    isKeyPressed(key) {
        return this.pressedKeys.has(key);
    }
}
//# sourceMappingURL=InputHandler.js.map