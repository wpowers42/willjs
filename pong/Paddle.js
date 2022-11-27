import Game from "./Game.js";

class State {
    static IDLE = 0;
    static MOVING_UP = 1;
    static MOVING_DOWN = 2;

    constructor(state) {
        this.state = state;
    }

}

class IdleState extends State {
    /** @param {Paddle} paddle */
    constructor(paddle) {
        super(State.IDLE);
        this.paddle = paddle;
    }

    enter() {
        this.paddle.dy = 0;
    }

}

class MovingUpState extends State {
    /** @param {Paddle} paddle */
    constructor(paddle) {
        super(State.MOVING_UP);
        this.paddle = paddle;
    }

    enter() {
        this.paddle.dy = -this.paddle.speed;
    }

}

class MovingDownState extends State {
    /** @param {Paddle} paddle */
    constructor(paddle) {
        super(State.MOVING_DOWN);
        this.paddle = paddle;
    }

    enter() {
        this.paddle.dy = this.paddle.speed;
    }

}


class Paddle {
    /** @param {Game} game */
    constructor(game) {
        this.game = game;
        this.width = 5;
        this.height = 20;
        this.dx = 0;
        this.dy = 0;
        this.speed = 0.10;
        this.states = [new IdleState(this), new MovingUpState(this), new MovingDownState(this)];
        this.currentState;
        this.setState(State.IDLE);
        this.score = 0;
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.score = 0;
        this.setState(State.IDLE);
    }

    /** @param {number} dt */
    update(dt) {
        this.#handleInput(this.game.inputHandler.keys);
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

    /** @param {Array<number>} keys */
    #handleInput(keys) {
        switch (this.currentState.state) {
            case State.IDLE:
                if (keys.includes(this.inputMap.UP)) {
                    this.setState(State.MOVING_UP)
                } else if (keys.includes(this.inputMap.DOWN)) {
                    this.setState(State.MOVING_DOWN)
                }
                break;
            case State.MOVING_UP:
                if (keys.includes(this.inputMap.UP)) {
                    break; // stay in state
                }

                if (keys.includes(this.inputMap.DOWN)) {
                    this.setState(State.MOVING_DOWN)
                } else {
                    this.setState(State.IDLE)
                }
                break;
            case State.MOVING_DOWN:
                if (keys.includes(this.inputMap.DOWN)) {
                    break; // stay in state
                }

                if (keys.includes(this.inputMap.UP)) {
                    this.setState(State.MOVING_UP)
                } else {
                    this.setState(State.IDLE)
                }
                break;
        }

    }

}

export class Player1 extends Paddle {
    constructor(game) {
        super(game);
        this.startX = 10 + this.width * 0.50;
        this.startY = 20 + this.height * 0.50;
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
        this.startX = this.game.width - 10 - this.width * 0.50;
        this.startY = this.game.height - 20 - this.height * 0.50;
        this.x = this.startX;
        this.y = this.startY;
        this.inputMap = {
            UP: 'ArrowUp',
            DOWN: 'ArrowDown'
        }
    }

}
