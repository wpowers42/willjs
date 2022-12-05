import { Constants } from "../constants.js";
import Paddle from "../Paddle.js";
import BaseState from "./BaseState.js";
export default class PlayState extends BaseState {
    constructor() {
        super();
        this.paddle = new Paddle();
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
    }
    draw(ctx) {
        this.paddle.draw(ctx);
        if (this.paused) {
            ctx.font = Constants.fonts.large;
            ctx.textAlign = 'center';
            ctx.fillText('PAUSED', Constants.virtualWidth * 0.50, Constants.virtualHeight * 0.50 - 16);
        }
    }
}
//# sourceMappingURL=PlayState.js.map