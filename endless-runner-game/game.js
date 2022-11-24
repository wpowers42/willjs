import InputHandler from "./input.js";
import Player from "./player.js";
import Background from "./background.js";

export default class Game {
    /** 
     * @param {CanvasRenderingContext2D} ctx
     **/
    constructor(ctx) {
        this.ctx = ctx;
        this.width = this.ctx.canvas.width;
        this.height = this.ctx.canvas.height;
        this.t = 0;
        this.dt = 0.01;
        this.currentTime = performance.now();
        this.accumulator = 0;
        this.groundMargin = 50;
        this.backgroundSpeed = 0;
        this.minBackgroundSpeed = 0.75;
        this.maxBackgroundSpeed = 1.5;
        this.player = new Player(this);
        this.input = new InputHandler();
        this.background = new Background(this);
    }

    step() {
        this.player.update();
        this.background.update();
    }

    update() {
        let newTime = performance.now();
        let frameTime = newTime - this.currentTime;
        this.currentTime = newTime;
        this.accumulator += frameTime;

        while (this.accumulator >= this.dt) {
            this.step();
            this.accumulator -= this.dt;
            this.t += this.dt;
        }

        // console.log(this.player.dx, this.player.currentState);
        // console.log(this.player.dx);
        // console.log(this.player.currentState.state);
        // console.log(this.player.x, this.player.y);
        // console.log(this.input.keys);

    }

    draw() {
        this.background.draw();
        this.player.draw();
    }
}
