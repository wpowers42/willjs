import BaseState from "./BaseState.js";
import { Constants } from '../constants.js';
import Paddle from "../Paddle.js";
import LevelMaker from "../LevelMaker.js";
export default class StartState extends BaseState {
    constructor() {
        super();
        this.highlighted = 0;
        this.color = 'rgb(255,255,255)';
        this.highlightColor = 'rgb(103,255,255)';
    }
    update(dt, inputHandler, stateMachine) {
        if (inputHandler.isKeyPressed('ArrowUp') ||
            inputHandler.isKeyPressed('ArrowDown')) {
            Constants.sounds.select.play();
            this.highlighted ^= 1; // bitwise or toggles value between 0 and 1
            inputHandler.removeKey('ArrowUp');
            inputHandler.removeKey('ArrowDown');
        }
        if (inputHandler.isKeyPressed('Enter')) {
            inputHandler.removeKey('Enter');
            Constants.sounds.confirm.play();
            if (this.highlighted === 0) {
                stateMachine.change('serve', {
                    paddle: new Paddle(),
                    bricks: LevelMaker.createMap(0),
                    health: 3,
                    score: 0,
                    level: 1
                });
            }
            else {
                stateMachine.change('highScores');
            }
        }
    }
    draw(ctx) {
        // shared settings
        ctx.textAlign = 'center';
        // title
        ctx.font = Constants.fonts.large;
        ctx.fillText('BREAKOUT', Constants.virtualWidth * 0.5, Constants.virtualHeight * 0.33);
        // instructions
        ctx.font = Constants.fonts.medium;
        // start
        ctx.fillStyle = !this.highlighted ? this.highlightColor : this.color;
        ctx.fillText('START', Constants.virtualWidth * 0.50, Constants.virtualHeight * 0.50 + 70);
        // high scores
        ctx.fillStyle = this.highlighted ? this.highlightColor : this.color;
        ctx.fillText('HIGH SCORES', Constants.virtualWidth * 0.50, Constants.virtualHeight * 0.50 + 90);
    }
}
//# sourceMappingURL=StartState.js.map