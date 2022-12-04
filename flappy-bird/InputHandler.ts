export default class InputHandler {
    private keyPressed: { [key: string]: boolean };

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

    isKeyPressed(key: string): boolean {
        return this.keyPressed[key];
    }

    reset(): void {
        this.keyPressed = {};
    }

}
