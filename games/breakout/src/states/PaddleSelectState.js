import BaseState from "./BaseState.js";
import Constants from '../constants.js';
import Paddle from "../Paddle.js";
import LevelMaker from "../LevelMaker.js";
export default class PaddleSelectState extends BaseState {
    constructor() {
        super();
        this.currentPaddle = 0;
    }
    update(dt, inputHandler, stateMachine) {
        if (inputHandler.isKeyPressed('ArrowLeft')) {
            inputHandler.removeKey('ArrowLeft');
            if (this.currentPaddle === 0) {
                Constants.sounds.noSelect.play();
            }
            else {
                Constants.sounds.select.play();
                this.currentPaddle -= 1;
            }
        }
        else if (inputHandler.isKeyPressed('ArrowRight')) {
            inputHandler.removeKey('ArrowRight');
            if (this.currentPaddle === 3) {
                Constants.sounds.noSelect.play();
            }
            else {
                Constants.sounds.select.play();
                this.currentPaddle += 1;
            }
        }
        if (inputHandler.isKeyPressed('Enter')) {
            inputHandler.removeKey('Enter');
            Constants.sounds.confirm.play();
            stateMachine.change('serve', {
                paddle: new Paddle(this.currentPaddle),
                bricks: LevelMaker.createMap(1),
                health: 3,
                score: 0,
                level: 1,
                recoverPoints: 250,
            });
        }
    }
    draw(ctx) {
        // shared settings
        ctx.textAlign = 'center';
        // instructions
        ctx.font = Constants.fonts.medium;
        ctx.fillText('Select your paddle with left and right!', Constants.virtualWidth * 0.50, Constants.virtualHeight * 0.25);
        ctx.font = Constants.fonts.small;
        ctx.fillText('(Press Enter to continue!)', Constants.virtualWidth * 0.50, Constants.virtualHeight * 0.33);
        // left arrow
        let { sx, sy, sw, sh } = Constants.frames.arrows[0];
        ctx.globalAlpha = this.currentPaddle === 0 ? 0.25 : 1.00;
        ctx.drawImage(Constants.textures.arrows, sx, sy, sw, sh, Constants.virtualWidth * 0.25 - sw * 0.50, Constants.virtualHeight * 0.75 - sh * 0.50, sw, sh);
        // paddle
        ({ sx, sy, sw, sh } = Constants.frames.paddles[this.currentPaddle * 4 + 1]);
        ctx.globalAlpha = 1.00;
        ctx.drawImage(Constants.textures.main, sx, sy, sw, sh, Constants.virtualWidth * 0.50 - sw * 0.50, Constants.virtualHeight * 0.75 - sh * 0.50, sw, sh);
        // right arrow
        ({ sx, sy, sw, sh } = Constants.frames.arrows[1]);
        ctx.globalAlpha = this.currentPaddle === 3 ? 0.50 : 1.00;
        ctx.drawImage(Constants.textures.arrows, sx, sy, sw, sh, Constants.virtualWidth * 0.75 - sw * 0.50, Constants.virtualHeight * 0.75 - sh * 0.50, sw, sh);
        ctx.globalAlpha = 1.00;
    }
}
//# sourceMappingURL=PaddleSelectState.js.map