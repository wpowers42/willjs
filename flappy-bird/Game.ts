import Bird from "./Bird.js";
import Graphics from "./Graphics.js";

export default class Game {
    ctx: CanvasRenderingContext2D;
    input: InputHandler;
    graphics: Graphics;
    fps: number;
    dt: number;
    width: number;
    height: number;
    bird: Bird;

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.width = this.ctx.canvas.width;
        this.height = this.ctx.canvas.height;
        this.input = new InputHandler();
        this.graphics = new Graphics(this);
        this.bird = new Bird(this);
        this.fps = 60;
        this.dt = 1000 / this.fps;
    }

    update() {
        this.graphics.update(this.dt);
        this.bird.update(this.dt);
    }

    draw() {
        this.graphics.draw(this.ctx);
        this.bird.draw(this.ctx);
    }
}

class InputHandler {
    SPACE: string;
    ENTER: string;
    keys: {};

    constructor() {
        this.SPACE = ' ';
        this.ENTER = 'Enter';

        this.keys = {};
        this.keys[this.SPACE] = 0;
        this.keys[this.ENTER] = 0;

        document.addEventListener('keydown', e => {
            if (e.key === this.SPACE || e.key === this.ENTER) {
                this.keys[e.key] = 1;
            }
        })
    }
}
