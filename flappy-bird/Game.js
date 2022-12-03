import Bird from "./Bird.js";
import Graphics from "./Graphics.js";
import PipePair from "./PipePair.js";
import Mathf from "../math/Mathf.js";
export default class Game {
    constructor(ctx) {
        this.ctx = ctx;
        this.width = this.ctx.canvas.width;
        this.height = this.ctx.canvas.height;
        this.input = new InputHandler();
        this.graphics = new Graphics(this);
        this.bird = new Bird(this);
        this.fps = 60;
        this.t = 0;
        this.dt = 1000 / this.fps;
        this.accumulator = 0;
        this.lastTime = performance.now();
        this.paused = false;
        this.debug = true;
        this.pipePairs = [];
        this.pipePairY = this.height * 0.5;
        this.pipePairSpawnInterval = 2500;
        this.pipePairSpawnTimer = 0;
    }
    step(dt) {
        this.pipePairSpawnTimer += dt;
        if (this.pipePairSpawnTimer > this.pipePairSpawnInterval) {
            this.pipePairY = Mathf.Clamp(this.pipePairY + Math.random() * 40 - 20, this.height * 0.25, this.height * 0.75);
            this.pipePairs.push(new PipePair(this, this.pipePairY));
            this.pipePairs = this.pipePairs.filter(pipePair => !pipePair.markedForDeletion);
            this.pipePairSpawnTimer -= this.pipePairSpawnInterval;
        }
        this.graphics.update(dt);
        this.bird.update(dt);
        this.pipePairs.forEach(pipePair => pipePair.update(dt));
        this.input.reset();
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
        this.pipePairs.forEach(pipePair => pipePair.draw(this.ctx, this.debug));
        this.graphics.drawGround(this.ctx);
        this.bird.draw(this.ctx, this.debug);
    }
}
class InputHandler {
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
    isKeyPressed(key) {
        return this.keyPressed[key];
    }
    reset() {
        this.keyPressed = {};
    }
}
//# sourceMappingURL=Game.js.map