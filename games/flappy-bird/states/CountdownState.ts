/*
The TitleScreenState is the starting screen of the game, shown on startup. It should
    display "Press Enter" and also our highest score.
*/

import Game from "../Game.js";
import BaseState from "./BaseState.js";

export default class CountdownState extends BaseState {
    static COUNTDOWN_TIME = 750;

    game: Game;
    count: number;
    timer: number;

    constructor(game: Game) {
        super();
        this.game = game;
        this.count = 3;
        this.timer = 0;
    }

    enter(enterParams: object) { }

    exit() { }

    update(dt: number) {
        this.timer += dt;
        if (this.timer > CountdownState.COUNTDOWN_TIME) {
            this.count -= 1;
            this.timer -= CountdownState.COUNTDOWN_TIME;

            if (this.count === 0) {
                this.game.stateMachine.change('play', {});
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.textAlign = 'center';

        ctx.font = this.game.fonts.large;
        ctx.fillText(`${this.count}`, this.game.width * 0.50, 120);

    }
}

