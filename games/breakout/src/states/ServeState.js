import BaseState from "./BaseState.js";
import Ball from "../Ball.js";
import { Util } from "../Util.js";
import { Constants } from "../constants.js";
export default class ServeState extends BaseState {
    constructor() {
        super();
    }
    enter(params) {
        this.paddle = params['paddle'];
        this.bricks = params['bricks'];
        this.health = params['health'];
        this.score = params['score'];
        this.ball = new Ball();
        this.level = params['level'];
        this.recoverPoints = params['recoverPoints'];
    }
    update(dt, inputHandler, stateMachine) {
        this.paddle.update(dt, inputHandler);
        this.ball.x = this.paddle.x + this.paddle.width * 0.50 - this.ball.width * 0.50;
        this.ball.y = this.paddle.y - this.ball.height;
        if (inputHandler.isKeyPressed('Enter')) {
            inputHandler.removeKey('Enter');
            stateMachine.change('play', {
                paddle: this.paddle,
                bricks: this.bricks,
                health: this.health,
                score: this.score,
                ball: this.ball,
                level: this.level,
                recoverPoints: this.recoverPoints,
            });
        }
    }
    draw(ctx) {
        this.paddle.draw(ctx);
        this.ball.draw(ctx);
        this.bricks.forEach(brick => brick.draw(ctx));
        Util.drawScore(ctx, this.score);
        Util.drawHealth(ctx, this.health);
        ctx.textAlign = 'center';
        ctx.font = Constants.fonts.large;
        ctx.fillText(`Level ${this.level}`, Constants.virtualWidth * 0.50, Constants.virtualHeight * 0.40);
        ctx.font = Constants.fonts.medium;
        ctx.fillText('Press Enter to serve!', Constants.virtualWidth * 0.50, Constants.virtualHeight * 0.50);
    }
}
//# sourceMappingURL=ServeState.js.map