export default class UI {
    constructor(game) {
        this.game = game;
        this.fontSize = 30;
        this.fontFamily = 'Courier';
        this.fontColor = 'black';
    }

    /** @param {CanvasRenderingContext2D} ctx */
    draw(ctx = this.game.ctx) {
        ctx.save();
        ctx.font = `${this.fontSize}px ${this.fontFamily}`;
        ctx.textAlign = 'left';
        ctx.fillStyle = this.fontColor;

        // score
        ctx.fillText(`Score: ${this.game.score}`, 20, 50);
        ctx.fillText(`Keys: ${this.game.input.keys}`, 20, 100);

        ctx.restore();
    }

}
