import {
    State, StandingLeft, StandingRight, SittingLeft, SittingRight,
    RunningLeft, RunningRight, JumpingLeft, JumpingRight,
    FallingLeft, FallingRight
} from './state.js';

export default class Player {
    constructor(gameWidth, gameHeight) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.image = document.getElementById('dogImage');
        this.width = 200;
        this.height = 181.83;
        this.x = gameWidth / 2 - this.width / 2;
        this.y = gameHeight - this.height;
        this.dx = 0;
        this.maxDX = 0.5;
        this.dy = 0;
        this.maxDY = 0.75;
        this.gravity = 0.001;
        this.states = [
            new StandingLeft(this), new StandingRight(this),
            new SittingLeft(this), new SittingRight(this),
            new RunningLeft(this), new RunningRight(this),
            new JumpingLeft(this), new JumpingRight(this),
            new FallingLeft(this), new FallingRight(this)
        ];
        /** @type {State} */
        this.currentState = this.states[1];
        this.currentState.enter();
        this.frameX = 0;
        this.frameY = this.currentState.frameY;
        this.frames = this.currentState.frames;
        this.fps = 30;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;
    }

    /** @param {CanvasRenderingContext2D} ctx */
    draw(ctx) {
        let sx = this.frameX * this.width;
        let sy = this.frameY * this.height;
        ctx.drawImage(this.image, sx, sy, this.width, this.height, this.x, this.y, this.width, this.height);
    }

    /** @param {string} input */
    update(input, dt) {
        this.frameTimer += dt;
        if (this.frameTimer >= this.frameInterval) {
            this.frameX++;
            if (this.frameX === this.frames) {
                this.frameX = 0;
            }
            this.frameTimer -= this.frameInterval;
        }

        if (!this.onGround()) {
            this.dy += this.gravity * dt;
        }

        this.x += this.dx * dt;
        this.y += this.dy * dt;
        if (this.x < 0) {
            this.x = 0;
        } else if (this.x > this.gameWidth - this.width) {
            this.x = this.gameWidth - this.width;
        }
        if (this.y < 0) {
            this.y = 0;
        } else if (this.onGround()) {
            this.y = this.gameHeight - this.height;
        }

        this.currentState.handleInput(input);
    }

    setState(state) {
        this.frameX = 0;
        this.currentState = this.states[state];
        this.currentState.enter();
    }

    onGround() {
        return this.y >= this.gameHeight - this.height;
    }
}
