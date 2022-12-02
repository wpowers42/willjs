import Bird from "./Bird.js";
import Graphics from "./Graphics.js";
import Pipe from "./Pipe.js";

export default class Game {
    ctx: CanvasRenderingContext2D;
    input: InputHandler;
    graphics: Graphics;
    fps: number;
    dt: number;
    width: number;
    height: number;
    bird: Bird;
    pipes: Array<Pipe>;

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.width = this.ctx.canvas.width;
        this.height = this.ctx.canvas.height;
        this.input = new InputHandler();
        this.graphics = new Graphics(this);
        this.bird = new Bird(this);
        this.pipes = [new Pipe(this)];
        this.fps = 60;
        this.dt = 1000 / this.fps;
    }

    update() {
        this.graphics.update(this.dt);
        this.bird.update(this.dt);
        this.pipes.forEach(pipe => pipe.update(this.dt));
        this.input.reset();
    }

    draw() {
        this.graphics.draw(this.ctx);
        this.pipes.forEach(pipe => pipe.draw(this.ctx));
        this.bird.draw(this.ctx);
    }
}

class InputHandler {
    private keyPressed: { [key: string]: boolean };

    constructor() {
        this.keyPressed = {};

        document.addEventListener('keypress', e => {
            if (e.repeat) {
                // ignore repeat key presses
                return;
            }

            this.keyPressed[e.key] = true;
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
