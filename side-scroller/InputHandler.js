// @ts-check

class InputHandler {
    constructor() {
        this.keys = [];
        window.addEventListener('keydown', e => {
            // arrow functions inherit 'this' from their parent
            if (['ArrowDown','ArrowUp','ArrowLeft','ArrowRight'].indexOf(e.key) >= 0 &&
                this.keys.indexOf(e.key) === -1) {
                this.keys.push(e.key);
            }
        });
        window.addEventListener('keyup', e => {
            // arrow functions inherit 'this' from their parent
            if (['ArrowDown','ArrowUp','ArrowLeft','ArrowRight'].indexOf(e.key) >= 0 &&
                this.keys.indexOf(e.key) >= 0) {
                this.keys.splice(this.keys.indexOf(e.key), 1);
            }
        });
    }
}
