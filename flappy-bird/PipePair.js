import Pipe from "./Pipe.js";
export default class PipePair {
    constructor(game, y) {
        this.game = game;
        this.x = this.game.width;
        this.y = y; // center of gap
        this.gapHeight = 90;
        this.pipes = [
            new Pipe(this.y - this.gapHeight * 0.50, 'top'),
            new Pipe(this.y + this.gapHeight * 0.50, 'bottom')
        ];
        this.markedForDeletion = false;
    }
    update(dt) {
        this.pipes.forEach(pipe => pipe.update(dt));
        this.pipes = this.pipes.filter(pipe => !pipe.markedForDeletion);
        this.markedForDeletion = this.pipes.length === 0;
    }
    draw(ctx) {
        this.pipes.forEach(pipe => pipe.draw(ctx));
    }
}
//# sourceMappingURL=PipePair.js.map