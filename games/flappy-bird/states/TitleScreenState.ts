/*
The TitleScreenState is the starting screen of the game, shown on startup. It should
    display "Press Enter" and also our highest score.
*/

import Game from "../Game.js";
import BaseState from "./BaseState.js";

export default class TitleScreenState extends BaseState {
    game: Game;

    constructor(game: Game) {
        super();
        this.game = game;
    }

    enter(enterParams: object) { }
    exit() { }

    update(dt: number) {
        if (this.game.input.isKeyPressed('Enter')) {
            this.game.stateMachine.change('countdown', {});
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.textAlign = 'center';

        ctx.font = this.game.fonts.large;
        ctx.fillText('Flappy Bird', this.game.width * 0.50, 64);

        ctx.font = this.game.fonts.medium;
        ctx.fillText('Press Enter', this.game.width * 0.50, 100);

    }
}

