import Game from "./Game";
import Pipe from "./Pipe.js";

export default class PipePair {
    y: number;
    game: any;
    x: any;
    gapHeight: number;
    pipes: Pipe[];
    markedForDeletion: boolean;

    constructor(game: Game, y: number) {
        this.game = game;
        this.x = this.game.width;
        this.y = y; // center of gap
        this.gapHeight = 90;
        this.pipes = [
            new Pipe(this.y - this.gapHeight * 0.50, 'top'),
            new Pipe(this.y + this.gapHeight * 0.50, 'bottom')
        ]
        this.markedForDeletion = false;
    }

    update(dt: number) {
        this.pipes.forEach(pipe => pipe.update(dt));
        this.pipes = this.pipes.filter(pipe => !pipe.markedForDeletion);
        this.markedForDeletion = this.pipes.length === 0;
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.pipes.forEach(pipe => pipe.draw(ctx));
    }
}
