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
            this.game.stateMachine.change('play');
        }
    }
    draw(ctx) {
        ctx.textAlign = 'center';
        ctx.font = '32px flappy';
        ctx.fillText('Flappy Bird', this.game.width * 0.50, 64);
        ctx.font = '18px flappy';
        ctx.fillText('Press Enter', this.game.width * 0.50, 100);
    }
}
//# sourceMappingURL=TitleScreenState.js.map