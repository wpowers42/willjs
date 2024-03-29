import BaseState from "./BaseState.js";

import InputHandler from "../InputHandler.js";
import StateMachine from "../StateMachine.js";
import Constants from "../Constants.js";
import HighScores from "../HighScores.js";

import type { enterParams } from "../StateMachine";

export default class EnterHighScoreState extends BaseState {
    highScores: HighScores;
    score: number;
    chars: number[];
    highlightedChar: number;

    constructor() {
        super();
        this.score = 0;
        this.highScores = new HighScores();
        this.chars = [65, 65, 65]; // AAA
        this.highlightedChar = 0;
    }

    enter(params: enterParams) {
        if (params) {
            this.score = params.score;
        }
    }

    update(dt: number, inputHandler: InputHandler, stateMachine: StateMachine) {

        if (inputHandler.isKeyPressed('Enter')) {
            inputHandler.removeKey('Enter');
            const name = this.chars.map(char => String.fromCharCode(char)).join('');
            this.highScores.submitScore(name, this.score);

            stateMachine.change('highScores', {});
        }

        // scroll through character slots
        if (inputHandler.isKeyPressed('ArrowLeft') && this.highlightedChar > 0) {
            Constants.sounds.select.play();
            this.highlightedChar -= 1;
            inputHandler.removeKey('ArrowLeft');
        } else if (inputHandler.isKeyPressed('ArrowRight') && this.highlightedChar < 2) {
            Constants.sounds.select.play();
            inputHandler.removeKey('ArrowRight');
            this.highlightedChar += 1;
        }

        // scroll through characters
        if (inputHandler.isKeyPressed('ArrowUp')) {
            this.chars[this.highlightedChar] += 1;
            if (this.chars[this.highlightedChar] > 90) {
                this.chars[this.highlightedChar] = 65;
            }
            inputHandler.removeKey('ArrowUp');
        } else if (inputHandler.isKeyPressed('ArrowDown')) {
            this.chars[this.highlightedChar] -= 1;
            if (this.chars[this.highlightedChar] < 65) {
                this.chars[this.highlightedChar] = 90;
            }
            inputHandler.removeKey('ArrowDown');
        }

    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.font = Constants.fonts.medium;
        ctx.textAlign = 'center';
        ctx.fillText(`Your score: ${this.score}`, Constants.virtualWidth * 0.50, 30);


        ctx.font = Constants.fonts.large;
        this.chars.forEach((char, index) => {
            let charString = String.fromCharCode(char);
            ctx.fillStyle = index === this.highlightedChar ? 'rgb(103,255,255)' : 'rgb(255,255,255)';
            ctx.fillText(`${charString}`, Constants.virtualWidth * 0.50 + (index - 1) * 24, Constants.virtualHeight * 0.50);
        });

        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.font = Constants.fonts.small;
        ctx.fillText('Press Enter to confirm!', Constants.virtualWidth * 0.50, Constants.virtualHeight - 18);
    }
}
