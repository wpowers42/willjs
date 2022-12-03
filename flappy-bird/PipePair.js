import Pipe from "./Pipe.js";
export default class PipePair {
    constructor(game, y) {
        this.game = game;
        this.x = this.game.width;
        this.dx = 0.05;
        this.y = y; // center of gap
        this.width = 70;
        this.gapHeight = 90;
        this.pipes = [
            new Pipe(this.y - this.gapHeight * 0.50, 'top'),
            new Pipe(this.y + this.gapHeight * 0.50, 'bottom')
        ];
        this.markedForDeletion = false;
    }
    update(dt) {
        this.x -= this.dx * dt;
        this.pipes.forEach(pipe => pipe.x = this.x);
        this.markedForDeletion = this.x + this.width < 0;
    }
    draw(ctx) {
        this.pipes.forEach(pipe => pipe.draw(ctx));
    }
}
//# sourceMappingURL=PipePair.js.map