import Game from "./game.js";

export default class InputHandler {
    /** @param {Game} game */
    constructor(game) {
        this.game = game;
        this.keys = [];

        window.addEventListener('keydown', e => {

            if (e.key == 'd') {
                this.game.debug = !this.game.debug;
                return;
            }

            if (!this.keys.includes(e.key)) {
                this.keys.push(e.key);
            }

        });
        window.addEventListener('keyup', e => {

            if (this.keys.includes(e.key)) {
                this.keys.splice(this.keys.indexOf(e.key), 1);
            }
        });
    }
}
