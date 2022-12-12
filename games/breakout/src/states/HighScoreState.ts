import BaseState from "./BaseState.js";

import InputHandler from "../InputHandler";
import StateMachine from "../StateMachine";
import Paddle from "../Paddle";
import Brick from "../Brick";
import Ball from "../Ball.js";
import { Constants } from "../constants.js";
import HighScores from "../HighScores.js";

export default class HighScoreState extends BaseState {
    highScores: HighScores;

    constructor() {
        super();
        this.highScores = new HighScores();
    }

    enter(params?: Object) { }

    update(dt: number, inputHandler: InputHandler, stateMachine: StateMachine) {

        if (inputHandler.isKeyPressed('Escape')) {
            stateMachine.change('start');
        }

    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.font = Constants.fonts.large;
        ctx.textAlign = 'center';
        ctx.fillText('High Scores', Constants.virtualWidth * 0.50, 25);
        
        ctx.font = Constants.fonts.medium;
        this.highScores.scores.forEach((highScore, index) => {
            let [name, score] = highScore;
            ctx.textAlign = 'left';
            ctx.fillText(`${index + 1}.`, Constants.virtualWidth * 0.25, 60 + index * 13 );
            
            ctx.textAlign = 'right';
            ctx.fillText(`${name}`, Constants.virtualWidth * 0.45, 60 + index * 13 );
            ctx.fillText(`${score}`, Constants.virtualWidth * 0.75, 60 + index * 13 );

        })

        ctx.textAlign = 'center';
        ctx.font = Constants.fonts.small;
        ctx.fillText('Press Escape to return to the main menu!', Constants.virtualWidth * 0.50, Constants.virtualHeight - 18);
    }
}
