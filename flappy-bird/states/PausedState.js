import BaseState from "./BaseState.js";
export default class PausedState extends BaseState {
    constructor(game) {
        super();
        this.game = game;
    }
    enter(enterParams) {
        this.priorState = enterParams['state'];
    }
    exit() { }
    update(dt) {
        if (this.game.input.isKeyPressed('Enter')) {
            this.game.stateMachine.change('play', {
                state: this.priorState
            });
        }
    }
    draw(ctx) {
        ctx.textAlign = 'center';
        ctx.font = this.game.fonts.large;
        ctx.fillText('Paused', this.game.width * 0.50, 64);
        ctx.font = this.game.fonts.medium;
        ctx.fillText('Press Enter to resume', this.game.width * 0.50, 100);
    }
}
//# sourceMappingURL=PausedState.js.map