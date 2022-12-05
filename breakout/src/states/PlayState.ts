import { Constants } from "../constants.js";
import InputHandler from "../InputHandler.js";
import Paddle from "../Paddle.js";
import StateMachine from "../StateMachine";
import BaseState from "./BaseState.js";

export default class PlayState extends BaseState {
    paddle: Paddle;
    paused: boolean;

    constructor() {
        super();
        this.paddle = new Paddle();
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
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.paddle.draw(ctx);

        if (this.paused) {
            ctx.font = Constants.fonts.large;
            ctx.textAlign = 'center';
            ctx.fillText('PAUSED', Constants.virtualWidth * 0.50, Constants.virtualHeight * 0.50 - 16);
        }
    }
}
