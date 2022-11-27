export default class UI {
    constructor(game) {
        this.game = game;
    }

    update() {

    }

    /** @param {CanvasRenderingContext2D} ctx */
    draw(ctx) {
        // title
        let titleSize = 18;
        let titleY = 10 + titleSize * 0.50;
        ctx.font = `${titleSize}px VT323-Regular`;
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('Hello Pong!', this.game.width / 2, titleY);

        // score
        let scoreSize = 48;
        let scoreY = titleY + 10 + scoreSize * 0.50;
        ctx.font = `${scoreSize}px VT323-Regular`;
        ctx.fillText(this.game.player1.score, this.game.width / 2 - 28, scoreY);
        ctx.fillText(this.game.player1.score, this.game.width / 2 + 28, scoreY);
    }
}
