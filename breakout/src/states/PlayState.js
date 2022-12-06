import Ball from "../Ball.js";
import { Constants } from "../constants.js";
import LevelMaker from "../LevelMaker.js";
import Paddle from "../Paddle.js";
import BaseState from "./BaseState.js";
import { Mathf } from "../../../math/Mathf.js";
export default class PlayState extends BaseState {
    constructor() {
        super();
        this.paddle = new Paddle();
        this.ball = new Ball();
        this.bricks = LevelMaker.createMap(0);
        this.paused = false;
    }
    update(dt, inputHandler, stateMachine) {
        if (inputHandler.isKeyPressed(' ')) {
            // Toggle the paused state of the game
            this.paused = !this.paused;
            // Play the pause sound
            Constants.sounds.pause.play();
            // Remove the space key from the input queue
            inputHandler.removeKey(' ');
        }
        this.paddle.update(dt, inputHandler);
        this.ball.update(dt);
        if (this.ball.collides(this.paddle)) {
            this.ball.dy = -this.ball.dy;
            this.ball.y = this.paddle.y - this.ball.height;
            Constants.sounds.paddleHit.play();
            let ballCenterX = this.ball.x + this.ball.width * 0.50;
            let paddleCenterX = this.paddle.x + this.paddle.width * 0.50;
            let horizontalVelocityRatio = Mathf.Clamp((ballCenterX - paddleCenterX) / (this.paddle.width * 0.50), -1, 1);
            if (this.paddle.dx !== 0) {
                // ball hit paddle on while moving
                this.ball.dx = horizontalVelocityRatio * this.ball.maxHorizontalSpeed;
            }
        }
        this.bricks.forEach(brick => {
            if (brick.inPlay && this.ball.collides(brick)) {
                brick.hit();
            }
            ;
        });
    }
    draw(ctx) {
        this.bricks.forEach(brick => brick.draw(ctx));
        this.paddle.draw(ctx);
        this.ball.draw(ctx);
        if (this.paused) {
            ctx.font = Constants.fonts.large;
            ctx.textAlign = 'center';
            ctx.fillText('PAUSED', Constants.virtualWidth * 0.50, Constants.virtualHeight * 0.50 - 16);
        }
    }
}
//# sourceMappingURL=PlayState.js.map