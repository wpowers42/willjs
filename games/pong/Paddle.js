var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Paddle_instances, _Paddle_handleInput;
import { PaddleState, IdlePaddleState, MovingUpPaddleState, MovingDownPaddleState } from "./PaddleState.js";
export class Paddle {
    constructor(game) {
        _Paddle_instances.add(this);
        this.startX = 0;
        this.startY = 0;
        this.x = 0;
        this.y = 0;
        this.game = game;
        this.width = 15;
        this.height = 60;
        this.dx = 0;
        this.dy = 0;
        this.speed = 0.45;
        this.states = [new IdlePaddleState(this), new MovingUpPaddleState(this), new MovingDownPaddleState(this)];
        this.currentState = this.states[PaddleState.IDLE];
        this.setState(PaddleState.IDLE);
        this.score = 0;
        this.inputMap = {
            UP: '',
            DOWN: ''
        };
    }
    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.score = 0;
        this.setState(PaddleState.IDLE);
    }
    update(dt) {
        __classPrivateFieldGet(this, _Paddle_instances, "m", _Paddle_handleInput).call(this, this.game.inputHandler.keyPresses);
        this.y += this.dy * dt;
        this.y = Math.max(0, Math.min(this.y, this.game.height - this.height));
    }
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
}
_Paddle_instances = new WeakSet(), _Paddle_handleInput = function _Paddle_handleInput(keyPresses) {
    switch (this.currentState.state) {
        case PaddleState.IDLE:
            if (keyPresses[this.inputMap.UP] === 1) {
                this.setState(PaddleState.MOVING_UP);
            }
            else if (keyPresses[this.inputMap.DOWN]) {
                this.setState(PaddleState.MOVING_DOWN);
            }
            break;
        case PaddleState.MOVING_UP:
            if (keyPresses[this.inputMap.UP] === 1) {
                break; // stay in state
            }
            if (keyPresses[this.inputMap.DOWN] === 1) {
                this.setState(PaddleState.MOVING_DOWN);
            }
            else {
                this.setState(PaddleState.IDLE);
            }
            break;
        case PaddleState.MOVING_DOWN:
            if (keyPresses[this.inputMap.DOWN] === 1) {
                break; // stay in state
            }
            if (keyPresses[this.inputMap.UP] === 1) {
                this.setState(PaddleState.MOVING_UP);
            }
            else {
                this.setState(PaddleState.IDLE);
            }
            break;
    }
};
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
        };
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
        };
    }
}
//# sourceMappingURL=Paddle.js.map