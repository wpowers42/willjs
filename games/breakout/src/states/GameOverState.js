import BaseState from "./BaseState.js";
import Constants from "../Constants.js";
import HighScores from "../HighScores.js";
export default class GameOverState extends BaseState {
    constructor() {
        super();
        this.score = 0;
        this.highScores = new HighScores();
    }
    enter(params) {
        if (params) {
            this.score = params.score;
        }
    }
    update(dt, inputHandler, stateMachine) {
        if (inputHandler.isKeyPressed('Enter')) {
            inputHandler.removeKey('Enter');
            if (this.highScores.isHighScore(this.score)) {
                Constants.sounds.highScore.play();
                stateMachine.change('enterHighScore', {
                    score: this.score
                });
            }
            else {
                stateMachine.change('start', {});
            }
        }
    }
    draw(ctx) {
        ctx.font = Constants.fonts.large;
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', Constants.virtualWidth * 0.50, Constants.virtualHeight * 0.33);
        ctx.font = Constants.fonts.medium;
        ctx.fillText(`Final Score: ${this.score}`, Constants.virtualWidth * 0.50, Constants.virtualHeight * 0.50);
        ctx.fillText('Press Enter', Constants.virtualWidth * 0.50, Constants.virtualHeight * 0.75);
    }
}
//# sourceMappingURL=GameOverState.js.map