import Game from "./game.js";
import { StandingState, SittingState, RunningState, JumpingState, FallingState } from "./playerStates.js"

export default class Player {
    /** 
     * @param {Game} game
     **/
    constructor(game) {
        this.game = game;
        this.image = document.getElementById('player');
        this.width = 100;
        this.height = 91.3;
        this.x = 0;
        this.y = this.game.height - this.height - this.game.groundMargin;
        this.dx = 0;
        this.dy = 0;
        this.maxDX = 0.50;
        this.maxDY = 1.00;
        this.gravity = this.maxDY * 0.00151;
        this.frameX = 0;
        this.frameY = 0;
        this.frames = 7;
        this.fps = 20;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;
        this.states = [
            new StandingState(this), new SittingState(this),
            new RunningState(this), new JumpingState(this),
            new FallingState(this)
        ];
        this.currentState = this.states[0];
    }

    /** 
     * @param {number} dt
     * @param {Array<string>} keys */
    update(dt = this.game.dt, keys = this.game.input.keys) {
        this.frameTimer += dt;
        if (this.frameTimer >= this.frameInterval) {
            this.frameX++;
            if (this.frameX == this.frames) {
                this.frameX = 0;
            }
            this.frameTimer -= this.frameInterval;
        }


        // update background speed
        if (['SITTING','STANDING'].includes(this.currentState.state)) {
            this.game.backgroundSpeed = 0;
        } else {
            this.game.backgroundSpeed = Math.max(this.dx, 0.2) * this.game.maxBackgroundSpeed; // + this.game.minBackgroundSpeed;
        }
        this.x += this.dx * dt - this.game.backgroundSpeed * dt * 0.25;
        this.y += this.dy * dt;

        if (!this.onGround()) {
            this.dy += this.gravity * dt;
        } else {
            this.dy = 0;
        }

        this.currentState.handleInput(keys);

        // clamp player to screen
        this.x = Math.min(Math.max(this.x, 0), this.game.width - this.width);
        this.y = Math.min(Math.max(this.y, 0), this.game.height - this.height - this.game.groundMargin);

    }

    /** @param {CanvasRenderingContext2D} ctx */
    draw(ctx = this.game.ctx) {
        ctx.drawImage(this.image, this.frameX * this.width, this.frameY * this.height,
            this.width, this.height, this.x, this.y, this.width, this.height)
    }

    onGround() {
        return this.y >= this.game.height - this.height - this.game.groundMargin;
    }

    setState(state) {
        this.currentState = this.states[state];
        this.currentState.enter();
    }

}
