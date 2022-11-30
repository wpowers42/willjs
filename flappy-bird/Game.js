import Graphics from "./Graphics.js";
export default class Game {
    constructor(ctx) {
        this.ctx = ctx;
        this.input = new InputHandler();
        this.graphics = new Graphics(this);
    }
    update() {
    }
    draw() {
        this.graphics.draw();
    }
}
class InputHandler {
    constructor() {
        this.keys = {
            SPACE_KEY_CODE: 0,
            ENTER_KEY_CODE: 0
        };
        document.addEventListener('keydown', e => {
            if (e.key === InputHandler.SPACE || e.key === InputHandler.ENTER) {
                this.keys[e.key] = 1;
            }
        });
    }
}
InputHandler.SPACE = ' ';
InputHandler.ENTER = 'Enter';
//# sourceMappingURL=Game.js.map