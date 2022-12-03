import Bird from "./Bird.js";
import Graphics from "./Graphics.js";
import Pipe from "./Pipe.js";

export default class Game {
    ctx: CanvasRenderingContext2D;
    input: InputHandler;
    graphics: Graphics;
    fps: number;
    t: number;
    dt: number;
    accumulator: number;
    width: number;
    height: number;
    bird: Bird;
    pipes: Array<Pipe>;
    lastTime: number;
    pipeSpawnInterval: number;
    pipeSpawnTimer: number;

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.width = this.ctx.canvas.width;
        this.height = this.ctx.canvas.height;
        this.input = new InputHandler();
        this.graphics = new Graphics(this);
        this.bird = new Bird(this);
        this.pipes = [new Pipe(this)];
        this.fps = 60;
        this.t = 0;
        this.dt = 1000 / this.fps;
        this.accumulator = 0;
        this.lastTime = performance.now();
        this.pipeSpawnInterval = 2500;
        this.pipeSpawnTimer = 0;
    }

    step(dt: number) {
        this.graphics.update(dt);
        this.bird.update(dt);
        this.pipes.forEach(pipe => pipe.update(dt));
        this.input.reset();

        this.pipeSpawnTimer += dt;
        if (this.pipeSpawnTimer > this.pipeSpawnInterval) {
            this.pipes.push(new Pipe(this));
            this.pipes = this.pipes.filter(pipe => !pipe.markedForDeletion);
            this.pipeSpawnTimer -= this.pipeSpawnInterval;
            console.log(this.pipes.length);
        }
    }


    update() {
        let newTime = performance.now();
        let frameTime = newTime - this.lastTime;
        this.lastTime = newTime;
        this.accumulator += frameTime;

        while (this.dt < this.accumulator) {
            this.step(this.dt);
            this.t += this.dt;
            this.accumulator -= this.dt;
        }
    }

    draw() {
        this.graphics.drawBackground(this.ctx);
        this.pipes.forEach(pipe => pipe.draw(this.ctx));
        this.graphics.drawGround(this.ctx);
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
