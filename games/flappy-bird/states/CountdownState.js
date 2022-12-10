/*
The TitleScreenState is the starting screen of the game, shown on startup. It should
    display "Press Enter" and also our highest score.
*/
import BaseState from "./BaseState.js";
export default class CountdownState extends BaseState {
    constructor(game) {
        super();
        this.game = game;
        this.count = 3;
        this.timer = 0;
    }
    enter(enterParams) { }
    exit() { }
    update(dt) {
        this.timer += dt;
        if (this.timer > CountdownState.COUNTDOWN_TIME) {
            this.count -= 1;
            this.timer -= CountdownState.COUNTDOWN_TIME;
            if (this.count === 0) {
                this.game.stateMachine.change('play');
            }
        }
    }
    draw(ctx) {
        ctx.textAlign = 'center';
        ctx.font = this.game.fonts.large;
        ctx.fillText(`${this.count}`, this.game.width * 0.50, 120);
    }
}
CountdownState.COUNTDOWN_TIME = 750;
//# sourceMappingURL=CountdownState.js.map