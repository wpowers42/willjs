import Graphics from "./Graphics.js";
export default class Game {
    constructor(ctx) {
        this.ctx = ctx;
        this.width = this.ctx.canvas.width;
        this.height = this.ctx.canvas.height;
        this.input = new InputHandler();
        this.graphics = new Graphics(this);
        this.fps = 60;
        this.dt = 1000 / this.fps;
    }
    update() {
        this.graphics.update(this.dt);
    }
    draw() {
        this.graphics.draw(this.ctx);
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