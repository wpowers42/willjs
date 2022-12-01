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
    }
    draw() {
        this.graphics.draw(this.ctx);
        this.bird.draw(this.ctx);
    }
}
class InputHandler {
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
        });
    }
}
//# sourceMappingURL=Game.js.map