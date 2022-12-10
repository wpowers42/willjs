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

            if (e.key == 'Enter' && this.game.gameOver) {
                this.game.reset();
            }

            if (!this.keys.includes(e.key)) {
                this.keys.push(e.key);
            }

        });
        window.addEventListener('keyup', e => {
            this.keys = this.keys.filter(key => key !== e.key);
        });
    }
}
