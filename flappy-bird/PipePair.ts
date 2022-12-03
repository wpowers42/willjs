import Game from "./Game";
import Pipe from "./Pipe.js";

export default class PipePair {
    y: number;
    game: any;
    x: any;
    gapHeight: number;
    pipes: Pipe[];
    markedForDeletion: boolean;
    dx: number;
    pipeWidth: number;
    pipeHeight: number;

    constructor(game: Game, y: number) {
        this.game = game;
        this.x = this.game.width;
        this.dx = 0.05;
        this.y = y; // center of gap
        this.pipeWidth = 70;
        this.pipeHeight = 288;
        this.gapHeight = 90;
        this.pipes = [
            new Pipe(this.x, this.y - this.gapHeight * 0.50 - this.pipeHeight, 'top'),
            new Pipe(this.x, this.y + this.gapHeight * 0.50, 'bottom')
        ]
        this.markedForDeletion = false;
    }

    update(dt: number) {
        this.x -= this.dx * dt;
        this.pipes.forEach(pipe => pipe.x = this.x);
        this.markedForDeletion = this.x + this.pipeWidth < 0;

        this.pipes.forEach(pipe => {
            if (this.game.bird.collides(pipe)) {
                this.game.paused = true;
                console.log('COLLIDES!');
            };
        })
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.pipes.forEach(pipe => pipe.draw(ctx));
    }
}
