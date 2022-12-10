export class PaddleState {
    static IDLE = 0;
    static MOVING_UP = 1;
    static MOVING_DOWN = 2;

    constructor(state) {
        this.state = state;
    }

}

export class IdlePaddleState extends PaddleState {
    /** @param {Paddle} paddle */
    constructor(paddle) {
        super(PaddleState.IDLE);
        this.paddle = paddle;
    }

    enter() {
        this.paddle.dy = 0;
    }

}

export class MovingUpPaddleState extends PaddleState {
    /** @param {Paddle} paddle */
    constructor(paddle) {
        super(PaddleState.MOVING_UP);
        this.paddle = paddle;
    }

    enter() {
        this.paddle.dy = -this.paddle.speed;
    }

}

export class MovingDownPaddleState extends PaddleState {
    /** @param {Paddle} paddle */
    constructor(paddle) {
        super(PaddleState.MOVING_DOWN);
        this.paddle = paddle;
    }

    enter() {
        this.paddle.dy = this.paddle.speed;
    }

}