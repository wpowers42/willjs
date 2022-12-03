/*

*/
import BaseState from "./BaseState.js";
export default class ScoreState extends BaseState {
    constructor(game) {
        super();
        this.game = game;
    }
    enter(enterParams) {
        this.score = enterParams['score'];
    }
    exit() { }
    update(dt) {
        if (this.game.input.isKeyPressed('Enter')) {
            this.game.stateMachine.change('play');
        }
    }
    draw(ctx) {
        ctx.textAlign = 'center';
        ctx.font = this.game.fonts.large;
        ctx.fillText('Oof! You lost!', this.game.width * 0.50, 64);
        ctx.font = this.game.fonts.medium;
        ctx.fillText(`Score: ${this.score}`, this.game.width * 0.50, 100);
        ctx.fillText('Press Enter to Play Again!', this.game.width * 0.50, 160);
    }
}
//# sourceMappingURL=ScoreState.js.map