export default class UI {
    constructor(game) {
        this.game = game;
        this.fontFamily = 'PressStart2P-Regular';
        this.titleSize = 36;
        this.scoreSize = 96;
        this.fpsSize = 16;
    }

    update() {

    }

    /** @param {CanvasRenderingContext2D} ctx */
    draw(ctx) {
        // score
        ctx.fillStyle = 'white';
        let scoreY = this.game.height * 0.30 + this.scoreSize;
        ctx.font = `${this.scoreSize}px ${this.fontFamily}`;
        ctx.textAlign = 'right';
        ctx.fillText(this.game.player1.score, this.game.width / 2 - this.scoreSize, scoreY);
        ctx.textAlign = 'left';
        ctx.fillText(this.game.player2.score, this.game.width / 2 + this.scoreSize, scoreY);

        // fps
        let fps = parseInt(1000 / (this.game.frameTimes / this.game.frames));
        ctx.font = `${this.fpsSize}px ${this.fontFamily}`;
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgb(0,255,0,1)';
        ctx.fillText(`FPS: ${fps}`, 10, 10 + this.fpsSize);
    }
}
