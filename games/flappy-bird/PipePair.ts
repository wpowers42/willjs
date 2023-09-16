import Bird from "./Bird.js";
import Pipe from "./Pipe.js";
import StateMachine from "./StateMachine.js";
import PlayState from "./states/PlayState.js";

export default class PipePair {
    y: number;
    playState: PlayState;
    x: number;
    gapHeight: number;
    pipes: Pipe[];
    markedForDeletion: boolean;
    dx: number;
    pipeWidth: number;
    pipeHeight: number;
    scored: boolean;

    constructor(playState: PlayState, y: number) {
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

    update(dt: number, bird: Bird, stateMachine: StateMachine) {
        this.x -= this.dx * dt;
        this.pipes.forEach(pipe => pipe.x = this.x);
        this.markedForDeletion = this.x + this.pipeWidth < 0;
    }

    draw(ctx: CanvasRenderingContext2D, debug: boolean) {
        this.pipes.forEach(pipe => pipe.draw(ctx, debug));
    }
}
