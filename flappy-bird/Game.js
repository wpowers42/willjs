import Graphics from "./Graphics.js";
import StateMachine from "./StateMachine.js";
import TitleScreenState from "./states/TitleScreenState.js";
import PlayState from "./states/PlayState.js";
import ScoreState from "./states/ScoreState.js";
import CountdownState from "./states/CountdownState.js";
import Audio from "./Audio.js";
import InputHandler from "./InputHandler.js";
import PausedState from "./states/PausedState.js";
export default class Game {
    constructor(ctx) {
        this.ctx = ctx;
        this.width = this.ctx.canvas.width;
        this.height = this.ctx.canvas.height;
        this.input = new InputHandler();
        this.fonts = {
            'small': '16px flappy',
            'medium': '24px flappy',
            'large': '48px flappy',
        };
        this.graphics = new Graphics(this);
        this.audio = new Audio();
        this.stateMachine = new StateMachine({
            'title': () => new TitleScreenState(this),
            'play': () => new PlayState(this),
            'score': () => new ScoreState(this),
            'countdown': () => new CountdownState(this),
            'paused': () => new PausedState(this),
        });
        this.stateMachine.change('title');
        this.debug = false;
        this.fps = 60;
        this.t = 0;
        this.dt = 1000 / this.fps;
        this.accumulator = 0;
        this.lastTime = performance.now();
    }
    step(dt) {
        this.stateMachine.update(dt);
        this.graphics.update(dt);
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
        this.stateMachine.draw(this.ctx);
        this.graphics.drawGround(this.ctx);
    }
}
//# sourceMappingURL=Game.js.map