import Bird from "./Bird.js";
import Graphics from "./Graphics.js";
export default class Game {
    constructor(ctx) {
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
        this.input.reset();
    }
    draw() {
        this.graphics.draw(this.ctx);
        this.bird.draw(this.ctx);
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