import BaseState from "./BaseState.js";

import InputHandler from "../InputHandler";
import StateMachine from "../StateMachine";
import Paddle from "../Paddle";
import Brick from "../Brick";
import Ball from "../Ball.js";
import { Constants } from "../constants.js";

export default class GameOverState extends BaseState {
    paddle: Paddle;
    bricks: Brick[];
    health: number;
    score: number;
    ball: Ball;
    constructor() {
        super();
    }

    enter(params?: Object) {
        this.score = params['score'];
    }

    update(dt: number, inputHandler: InputHandler, stateMachine: StateMachine) {

        if (inputHandler.isKeyPressed('Enter')) {
            stateMachine.change('start');
        }

        if (inputHandler.isKeyPressed('Enter')) {
            // handle quit
        }

    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.font = Constants.fonts.large;
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', Constants.virtualWidth * 0.50, Constants.virtualHeight * 0.33);
        ctx.font = Constants.fonts.medium;
        ctx.fillText(`Final Score: ${this.score}`, Constants.virtualWidth * 0.50, Constants.virtualHeight * 0.50);
        ctx.fillText('Press Enter', Constants.virtualWidth * 0.50, Constants.virtualHeight * 0.75);
    }
}
