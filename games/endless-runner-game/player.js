import Game from "./game.js";
import {
    StandingState, SittingState, RunningState, JumpingState,
    FallingState, RollingState, DivingState, HitState
} from "./playerStates.js";

import CollisionAnimation from "./collisionAnimation.js";
import FloatingMessage from "./floatingMessage.js";

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
            new FallingState(this), new RollingState(this),
            new DivingState(this), new HitState(this),
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
        if (['SITTING', 'STANDING', 'HIT'].includes(this.currentState.state)) {
            this.game.backgroundSpeed = 0;
        } else {
            this.game.backgroundSpeed = Math.max(this.dx, 0.2) * this.game.maxBackgroundSpeed; // + this.game.minBackgroundSpeed;
        }
        this.x += this.dx * dt - this.game.backgroundSpeed * dt * 0.25;
        this.y += this.dy * dt;

        this.#checkCollision();

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
        let sx = this.frameX * this.width;
        let sy = this.frameY * this.height;
        ctx.drawImage(this.image, sx, sy, this.width, this.height, this.x, this.y, this.width, this.height);
        if (this.game.debug) {
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }

    onGround() {
        return this.y >= this.game.height - this.height - this.game.groundMargin;
    }

    setState(state) {
        let oldState = this.currentState.state;
        this.currentState.exit();
        this.currentState = this.states[state];
        if (this.game.debug) {
            console.log(`${oldState} => ${this.currentState.state}`);
        }
        this.currentState.enter();
    }

    #checkCollision() {
        this.game.enemies.forEach(enemy => {
            let [ax, ay, aw, ah] = [this.x, this.y, this.width, this.height];
            let [bx, by, bw, bh] = [enemy.x, enemy.y, enemy.width, enemy.height];

            if (ax + aw < bx || ax > bx + bw || ay + ah < by || ay > by + bh) {
                // no collision
            } else if (!enemy.markedForDeletion) {
                // collision
                enemy.markedForDeletion = true;
                this.game.collisions.push(new CollisionAnimation(this.game, bx + bw * 0.5, by + bh * 0.5));
                if (['ROLLING', 'DIVING'].includes(this.currentState.state)) {
                    this.game.score++;
                    this.game.floatingMessages.push(new FloatingMessage('+1', enemy.x, enemy.y, 100, 50));
                } else {
                    this.setState(7);
                    this.game.lives--;
                    if (this.game.lives == 0) {
                        this.game.gameOver = true;
                    }
                }
            }
        })
    }

}
