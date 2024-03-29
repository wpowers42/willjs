import Ball from "../Ball.js";
import InputHandler from "../InputHandler.js";
import Paddle from "../Paddle.js";
import StateMachine from "../StateMachine.js";
import BaseState from "./BaseState.js";
import LevelMaker from "../LevelMaker.js";
import Util from "../Util.js";
import Constants from "../Constants.js";

import type { enterParams } from "../StateMachine.js";

export default class VictoryState extends BaseState {
    level: number | undefined;
    score: number | undefined;
    paddle: Paddle | undefined;
    health: number | undefined;
    ball: Ball | undefined;
    recoverPoints: number | undefined;

    constructor() {
        super();
    }

    enter(params: enterParams): void {
        this.level = params.level;
        this.score = params.score;
        this.paddle = params.paddle;
        this.health = params.health;
        this.ball = params.ball;
        this.recoverPoints = params.recoverPoints;

    }

    update(dt: number, inputHandler: InputHandler, stateMachine: StateMachine) {
        if (this.paddle === undefined || this.ball === undefined) {
            return;
        }

        this.paddle.update(dt, inputHandler);
        this.ball.x = this.paddle.x + this.paddle.width * 0.50 - this.ball.width * 0.50;
        this.ball.y = this.paddle.y - this.ball.height;

        if (inputHandler.isKeyPressed('Enter') && this.level) {
            inputHandler.removeKey('Enter');
            stateMachine.change('serve', {
                level: this.level + 1,
                bricks: LevelMaker.createMap(this.level + 1),
                paddle: this.paddle,
                health: this.health,
                score: this.score,
                recoverPoints: this.recoverPoints,
            })
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (this.paddle === undefined || this.ball === undefined) {
            return;
        }
        this.paddle.draw(ctx);
        this.ball.draw(ctx);

        this.health && Util.drawHealth(ctx, this.health);
        this.score && Util.drawScore(ctx, this.score);

        // level complete text
        ctx.font = Constants.fonts.large;
        ctx.textAlign = 'center';
        ctx.fillText(`Level ${this.level} complete!`, Constants.virtualWidth * 0.50, Constants.virtualHeight * 0.25);

        // level complete text
        ctx.font = Constants.fonts.medium;
        ctx.fillText('Press Enter to serve!', Constants.virtualWidth * 0.50, Constants.virtualHeight * 0.50);
    }

}