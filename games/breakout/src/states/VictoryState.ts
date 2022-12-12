import Ball from "../Ball";
import InputHandler from "../InputHandler";
import Paddle from "../Paddle";
import StateMachine from "../StateMachine";
import BaseState from "./BaseState.js";
import LevelMaker from "../LevelMaker.js";
import { Util } from "../Util.js";
import { Constants } from "../constants.js";

export default class VictoryState extends BaseState {
    level: number;
    score: number;
    paddle: Paddle;
    health: number;
    ball: Ball;
    constructor() {
        super();
    }

    enter(params?: Object): void {
        this.level = params['level'];
        this.score = params['score'];
        this.paddle = params['paddle'];
        this.health = params['health'];
        this.ball = params['ball'];

    }

    update(dt: number, inputHandler: InputHandler, stateMachine: StateMachine) {
        this.paddle.update(dt, inputHandler);
        this.ball.x = this.paddle.x + this.paddle.width * 0.50 - this.ball.width * 0.50;
        this.ball.y = this.paddle.y - this.ball.height;

        if (inputHandler.isKeyPressed('Enter')) {
            inputHandler.removeKey('Enter');
            stateMachine.change('serve', {
                level: this.level + 1,
                bricks: LevelMaker.createMap(this.level + 1),
                paddle: this.paddle,
                health: this.health,
                score: this.score
            })
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.paddle.draw(ctx);
        this.ball.draw(ctx);

        Util.drawHealth(ctx, this.health);
        Util.drawScore(ctx, this.score);

        // level complete text
        ctx.font = Constants.fonts.large;
        ctx.textAlign = 'center';
        ctx.fillText(`Level ${this.level} complete!`, Constants.virtualWidth * 0.50, Constants.virtualHeight * 0.25);

        // level complete text
        ctx.font = Constants.fonts.medium;
        ctx.fillText('Press Enter to serve!', Constants.virtualWidth * 0.50, Constants.virtualHeight * 0.50);
    }

}