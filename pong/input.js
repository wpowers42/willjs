import Game from "./Game.js";

export default class InputHandler {

    constructor() {
        this.keys = [];

        window.addEventListener('keydown', e => {

            if (!this.keys.includes(e.key)) {
                this.keys.push(e.key);
            }

        });
        window.addEventListener('keyup', e => {
            if (this.keys.includes(e.key)) {
                this.keys = this.keys.filter(key => key !== e.key);
            }

        });
    }

}
