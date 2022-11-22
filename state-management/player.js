import { State, StandingLeft, StandingRight, SittingLeft, SittingRight } from './state.js';

export default class Player {
    constructor(gameWidth, gameHeight) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.states = [new StandingLeft(this), new StandingRight(this),
                       new SittingLeft(this), new SittingRight(this)];
        /** @type {State} */
        this.currentState = this.states[1];
        this.currentState.enter();
        this.image = document.getElementById('dogImage');
        this.width = 200;
        this.height = 181.83;
        this.x = gameWidth / 2 - this.width / 2;
        this.y = gameHeight - this.height;
        this.frameX = 0;
        this.frameY = this.currentState.frameY;
        this.frames = this.currentState.frames;
        this.fps = 30;
        this.frameInterval = 1000 / this.fps;
        this.timeSinceFrame = 0;
    }

    /** @param {CanvasRenderingContext2D} ctx */
    draw(ctx) {
        let sx = this.frameX * this.width;
        let sy = this.frameY * this.height;
        ctx.drawImage(this.image, sx, sy, this.width, this.height, this.x, this.y, this.width, this.height);
    }

    /** @param {string} input */
    update(input, dt) {
        this.timeSinceFrame += dt;
        if (this.timeSinceFrame >= this.frameInterval) {
            this.frameX++;
            if (this.frameX === this.frames) {
                this.frameX = 0;
            }
            this.timeSinceFrame -= this.frameInterval;
        }
        this.currentState.handleInput(input);
    }

    setState(state) {
        this.frameX = 0;
        this.currentState = this.states[state];
        this.currentState.enter();
    }
}
