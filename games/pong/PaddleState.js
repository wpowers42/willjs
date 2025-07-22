export class PaddleState {
    constructor(paddle, state) {
        this.paddle = paddle;
        this.state = state;
    }
    enter() { }
}
PaddleState.IDLE = 0;
PaddleState.MOVING_UP = 1;
PaddleState.MOVING_DOWN = 2;
export class IdlePaddleState extends PaddleState {
    constructor(paddle) {
        super(paddle, PaddleState.IDLE);
    }
    enter() {
        this.paddle.dy = 0;
    }
}
export class MovingUpPaddleState extends PaddleState {
    constructor(paddle) {
        super(paddle, PaddleState.MOVING_UP);
    }
    enter() {
        this.paddle.dy = -this.paddle.speed;
    }
}
export class MovingDownPaddleState extends PaddleState {
    constructor(paddle) {
        super(paddle, PaddleState.MOVING_DOWN);
        this.paddle = paddle;
    }
    enter() {
        this.paddle.dy = this.paddle.speed;
    }
}
