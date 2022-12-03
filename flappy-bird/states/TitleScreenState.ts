/*
The TitleScreenState is the starting screen of the game, shown on startup. It should
    display "Press Enter" and also our highest score.
*/

import Game from "../Game";
import StateMachine from "../StateMachine";
import BaseState from "./BaseState.js";

export default class TitleScreenState extends BaseState {
    stateMachine: StateMachine;
    game: Game;

    constructor(game: Game) {
        super();
        this.game = game;
    }

    enter(enterParams: object) { }
    exit() { }

    update(dt: number) {
        if (this.game.input.isKeyPressed('Enter')) {
            this.game.stateMachine.change('play');
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.textAlign = 'center';

        ctx.font = '32px flappy';
        ctx.fillText('Flappy Bird', this.game.width * 0.50, 64);

        ctx.font = '18px flappy';
        ctx.fillText('Press Enter', this.game.width * 0.50, 100);

    }
}

