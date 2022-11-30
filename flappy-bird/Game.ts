import Graphics from "./Graphics.js";

export default class Game {
    ctx: CanvasRenderingContext2D;
    input: InputHandler;
    graphics: Graphics;

    constructor(ctx: CanvasRenderingContext2D) {
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
    static SPACE = ' ';
    static ENTER = 'Enter';
    keys: { SPACE_KEY_CODE: number; ENTER_KEY_CODE: number; };

    constructor() {
        this.keys = {
            SPACE_KEY_CODE: 0,
            ENTER_KEY_CODE: 0
        }

        document.addEventListener('keydown', e => {
            if (e.key === InputHandler.SPACE || e.key === InputHandler.ENTER) {
                this.keys[e.key] = 1;
            }
        })
    }
}
