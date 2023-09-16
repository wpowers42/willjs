/*
The TitleScreenState is the starting screen of the game, shown on startup. It should
    display "Press Enter" and also our highest score.
*/
import BaseState from "./BaseState.js";
export default class TitleScreenState extends BaseState {
    constructor(game) {
        super();
        this.game = game;
    }
    enter(enterParams) { }
    exit() { }
    update(dt) {
        if (this.game.input.isKeyPressed('Enter')) {
            this.game.stateMachine.change('countdown', {});
        }
    }
    draw(ctx) {
        ctx.textAlign = 'center';
        ctx.font = this.game.fonts.large;
        ctx.fillText('Flappy Bird', this.game.width * 0.50, 64);
        ctx.font = this.game.fonts.medium;
        ctx.fillText('Press Enter', this.game.width * 0.50, 100);
    }
}
//# sourceMappingURL=TitleScreenState.js.map