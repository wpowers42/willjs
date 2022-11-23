export default class InputHandler {
    constructor() {
        this.keys = [];
        this.allowedKeys = [
            'ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight',
            'Enter'
        ];
        window.addEventListener('keydown', e => {
            if (!this.allowedKeys.includes(e.key)) {
                // key not allowed, ignore
                return;
            }

            if (this.keys.includes(e.key)) {
                // key already pressed, do nothing
                return;
            }

            // key is allowed and not pressed, add to keys
            this.keys.push(e.key);

        });
        window.addEventListener('keyup', e => {
            if (!this.allowedKeys.includes(e.key)) {
                // key not allowed, ignore
                return;
            }

            if (!this.keys.includes(e.key)) {
                // key not pressed, do nothing
                return;
            }

            // key is allowed and pressed, remove from keys
            this.keys.splice(this.keys.indexOf(e.key), 1);

        });
    }
}
