import BaseState from "./BaseState.js";

import InputHandler from "../InputHandler.js";
import StateMachine from "../StateMachine.js";
import Constants from "../constants.js";
import HighScores from "../HighScores.js";

import type { enterParams } from "../StateMachine";

export default class GameOverState extends BaseState {
    score: number;
    highScores: HighScores;

    constructor() {
        super();
        this.score = 0;
        this.highScores = new HighScores();
    }

    enter(params?: enterParams) {
        if (params) {
            this.score = params.score;
        }
    }

    update(dt: number, inputHandler: InputHandler, stateMachine: StateMachine) {

        if (inputHandler.isKeyPressed('Enter')) {
            inputHandler.removeKey('Enter');
            if (this.highScores.isHighScore(this.score)) {
                Constants.sounds.highScore.play();
                stateMachine.change('enterHighScore', {
                    score: this.score
                });
            } else {
                stateMachine.change('start', {});
            }

        }

    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.font = Constants.fonts.large;
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', Constants.virtualWidth * 0.50, Constants.virtualHeight * 0.33);
        ctx.font = Constants.fonts.medium;
        ctx.fillText(`Final Score: ${this.score}`, Constants.virtualWidth * 0.50, Constants.virtualHeight * 0.50);
        ctx.fillText('Press Enter', Constants.virtualWidth * 0.50, Constants.virtualHeight * 0.75);
    }
}
