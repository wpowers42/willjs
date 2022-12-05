import Ball from "../Ball.js";
import { Constants } from "../constants.js";
import InputHandler from "../InputHandler.js";
import Paddle from "../Paddle.js";
import StateMachine from "../StateMachine";
import BaseState from "./BaseState.js";

export default class PlayState extends BaseState {
    paddle: Paddle;
    paused: boolean;
    ball: Ball;

    constructor() {
        super();
        this.paddle = new Paddle();
        this.ball = new Ball();
        this.paused = false;
    }

    update(dt: number, inputHandler: InputHandler, stateMachine: StateMachine) {
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
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.paddle.draw(ctx);
        this.ball.draw(ctx);

        if (this.paused) {
            ctx.font = Constants.fonts.large;
            ctx.textAlign = 'center';
            ctx.fillText('PAUSED', Constants.virtualWidth * 0.50, Constants.virtualHeight * 0.50 - 16);
        }
    }
}
