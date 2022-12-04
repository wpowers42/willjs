/*

*/

import Game from "../Game";
import StateMachine from "../StateMachine";
import BaseState from "./BaseState.js";

export default class ScoreState extends BaseState {
    stateMachine: StateMachine;
    game: Game;
    score: number;

    constructor(game: Game) {
        super();
        this.game = game;
    }

    enter(enterParams: { string: any }) {
        this.score = enterParams['score'];
    }

    exit() { }

    update(dt: number) {
        if (this.game.input.isKeyPressed('Enter')) {
            this.game.stateMachine.change('countdown');
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.textAlign = 'center';

        ctx.font = this.game.fonts.large;
        ctx.fillText('Oof! You lost!', this.game.width * 0.50, 64);

        ctx.font = this.game.fonts.medium;
        ctx.fillText(`Score: ${this.score}`, this.game.width * 0.50, 100);

        ctx.fillText('Press Enter to Play Again!', this.game.width * 0.50, 160);
    }
}

