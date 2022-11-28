export default class UI {
    constructor(game) {
        this.game = game;
    }

    update() {

    }

    /** @param {CanvasRenderingContext2D} ctx */
    draw(ctx) {
        // title
        let titleSize = 54;
        let titleY = 10 + titleSize * 0.50;
        ctx.font = `${titleSize}px VT323-Regular`;
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(`Hello ${this.game.currentState.name} State!`, this.game.width / 2, titleY);

        // score
        let scoreSize = 144;
        let scoreY = titleY + 30 + scoreSize * 0.50;
        ctx.font = `${scoreSize}px VT323-Regular`;
        ctx.fillText(this.game.player1.score, this.game.width / 2 - 64, scoreY);
        ctx.fillText(this.game.player1.score, this.game.width / 2 + 64, scoreY);

        // fps
        let fpsSize = 42;
        let fps = parseInt(1000 / (this.game.frameTimes / this.game.frames));
        ctx.font = `${fpsSize}px VT323-Regular`;
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgb(0,255,0,1)';
        ctx.fillText(`FPS: ${fps}`, 10, 10 + fpsSize * 0.50);

        // elapsed time
        let tSize = 42;
        let t = parseInt(this.game.t * 0.001);
        ctx.font = `${tSize}px VT323-Regular`;
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgb(0,255,0,1)';
        ctx.fillText(`T: ${t}`, 10, 50 + fpsSize * 0.50);
    }
}
