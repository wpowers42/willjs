export default class InputHandler {

    constructor() {
        this.keyPressed = {};

        document.addEventListener('keypress', e => {
            if (!e.repeat) {
                this.keyPressed[e.key] = true;
            }
        });

        document.addEventListener('keyup', e => {
            this.keyPressed[e.key] = false;
        });
    }

    isKeyPressed(key) {
        return this.keyPressed[key];
    }

    reset() {
        this.keyPressed = {};
    }

}