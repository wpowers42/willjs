import Bird from "./Bird.js";
import Pipe from "./Pipe.js";
import StateMachine from "./StateMachine.js";
import PlayState from "./states/PlayState.js";

export default class PipePair {

    constructor(playState, y) {
        this.playState = playState;
        this.x = this.playState.game.width;
        this.dx = 0.05;
        this.y = y; // center of gap
        this.pipeWidth = 70;
        this.pipeHeight = 288;
        this.gapHeight = Math.random() * 50 + 70;
        this.pipes = [
            new Pipe(this.x, this.y - this.gapHeight * 0.50 - this.pipeHeight, 'top'),
            new Pipe(this.x, this.y + this.gapHeight * 0.50, 'bottom')
        ]
        this.markedForDeletion = false;
        this.scored = false;
    }

    update(dt, bird, stateMachine) {
        this.x -= this.dx * dt;
        this.pipes.forEach(pipe => pipe.x = this.x);
        this.markedForDeletion = this.x + this.pipeWidth < 0;
    }

    draw(ctx, debug) {
        this.pipes.forEach(pipe => pipe.draw(ctx, debug));
    }
}