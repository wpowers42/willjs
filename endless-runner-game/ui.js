export default class UI {
    constructor(game) {
        this.game = game;
        this.fontSize = 30;
        this.fontFamily = 'Courier';
    }

    /** @param {CanvasRenderingContext2D} ctx */
    draw(ctx = this.game.ctx) {
        ctx.save();
        ctx.font = `${this.fontSize}px ${this.fontFamily}`;
        ctx.textAlign = 'left';
        ctx.shadowColor = "black";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 4;
        ctx.fillStyle = 'white';

        // score
        ctx.fillText(`Score: ${this.game.score}`, 20, 50);

        // timer
        ctx.font = `${this.fontSize * 0.80}px ${this.fontFamily}`;
        ctx.fillText(`Time: ${parseInt(this.game.t / 1000)}`, 20, 80);

        // game over message
        if (this.game.gameOver) {
            ctx.textAlign = 'center';
            ctx.font = `${this.fontSize * 2}px ${this.fontFamily}`;
            let messsage = this.game.score >= 1 ? 'PASS' : 'FAIL';
            ctx.fillText(messsage, this.game.width * 0.5, this.game.height * 0.5);
        }

        ctx.restore();
    }

}
