import Game from "./Game.js";
import { PaddleState, IdlePaddleState, MovingUpPaddleState, MovingDownPaddleState } from "./PaddleState.js";

class Paddle {
    /** @param {Game} game */
    constructor(game) {
        this.game = game;
        this.width = 15;
        this.height = 60;
        this.dx = 0;
        this.dy = 0;
        this.speed = 0.45;
        this.states = [new IdlePaddleState(this), new MovingUpPaddleState(this), new MovingDownPaddleState(this)];
        this.currentState;
        this.setState(PaddleState.IDLE);
        this.score = 0;
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.score = 0;
        this.setState(PaddleState.IDLE);
    }

    /** @param {number} dt */
    update(dt) {
        this.#handleInput(this.game.inputHandler.keyPresses);
        this.y += this.dy * dt;
        this.y = Math.max(0, Math.min(this.y, this.game.height - this.height));
    }

    /** @param {CanvasRenderingContext2D} ctx */
    draw(ctx) {
        ctx.save();
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }

    setState(state) {
        this.currentState = this.states[state];
        this.currentState.enter();
    }

    /** @param {Object} keyPresses */
    #handleInput(keyPresses) {
        switch (this.currentState.state) {
            case PaddleState.IDLE:
                if (keyPresses[this.inputMap.UP] === 1) {
                    this.setState(PaddleState.MOVING_UP)
                } else if (keyPresses[this.inputMap.DOWN]) {
                    this.setState(PaddleState.MOVING_DOWN)
                }
                break;
            case PaddleState.MOVING_UP:
                if (keyPresses[this.inputMap.UP] === 1) {
                    break; // stay in state
                }

                if (keyPresses[this.inputMap.DOWN] === 1) {
                    this.setState(PaddleState.MOVING_DOWN)
                } else {
                    this.setState(PaddleState.IDLE)
                }
                break;
            case PaddleState.MOVING_DOWN:
                if (keyPresses[this.inputMap.DOWN] === 1) {
                    break; // stay in state
                }

                if (keyPresses[this.inputMap.UP] === 1) {
                    this.setState(PaddleState.MOVING_UP)
                } else {
                    this.setState(PaddleState.IDLE)
                }
                break;
        }

    }

}

export class Player1 extends Paddle {
    constructor(game) {
        super(game);
        this.startX = this.width;
        this.startY = this.height;
        this.x = this.startX;
        this.y = this.startY;
        this.inputMap = {
            UP: 'w',
            DOWN: 's'
        }
    }
}

export class Player2 extends Paddle {
    constructor(game) {
        super(game);
        this.startX = this.game.width - this.width * 2;
        this.startY = this.game.height - this.height * 2;
        this.x = this.startX;
        this.y = this.startY;
        this.inputMap = {
            UP: 'ArrowUp',
            DOWN: 'ArrowDown'
        }
    }

}
