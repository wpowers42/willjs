import type { Paddle } from "./Paddle";

export class PaddleState {
    static IDLE = 0;
    static MOVING_UP = 1;
    static MOVING_DOWN = 2;

    state: number
    paddle: Paddle;

    constructor(paddle: Paddle, state: number) {
        this.paddle = paddle;
        this.state = state;
    }

    enter() { }

}

export class IdlePaddleState extends PaddleState {

    constructor(paddle: Paddle) {
        super(paddle, PaddleState.IDLE);
    }

    enter() {
        this.paddle.dy = 0;
    }

}

export class MovingUpPaddleState extends PaddleState {
    constructor(paddle: Paddle) {
        super(paddle, PaddleState.MOVING_UP);
    }

    enter() {
        this.paddle.dy = -this.paddle.speed;
    }

}

export class MovingDownPaddleState extends PaddleState {

    constructor(paddle: Paddle) {
        super(paddle, PaddleState.MOVING_DOWN);
        this.paddle = paddle;
    }

    enter() {
        this.paddle.dy = this.paddle.speed;
    }

}