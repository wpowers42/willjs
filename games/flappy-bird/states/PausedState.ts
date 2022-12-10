import Game from "../Game";
import BaseState from "./BaseState.js";

export default class PausedState extends BaseState {
    game: Game;
    priorState: any;

    constructor(game: Game) {
        super();
        this.game = game;
    }

    enter(enterParams: object) {
        this.priorState = enterParams['state'];
     }

    exit() { }

    update(dt: number) {
        if (this.game.input.isKeyPressed('Enter')) {
            this.game.stateMachine.change('play', {
                state: this.priorState
            });
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.textAlign = 'center';

        ctx.font = this.game.fonts.large;
        ctx.fillText('Paused', this.game.width * 0.50, 64);

        ctx.font = this.game.fonts.medium;
        ctx.fillText('Press Enter to resume', this.game.width * 0.50, 100);
    }
}
