export default class UI {
    constructor(game) {
        this.game = game;
        this.fontSize = 30;
        this.fontFamily = 'Courier';
        this.playerLifeImage = document.getElementById('playerLife');
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

        // player lives
        for (let i = 0; i < this.game.lives; i++) {
            ctx.drawImage(this.playerLifeImage, 25 * i + 20, 95, 25, 25);
        }

        // fps
        ctx.font = `${this.fontSize * 0.80}px ${this.fontFamily}`;
        ctx.textAlign = 'right';

        ctx.save();
        ctx.translate(this.game.width - 20 - 120, 50);
        ctx.beginPath();
        this.game.frameTimes.forEach((ft,ix) => {
            ft = ft;
            ctx.lineTo(ix * 1, ft);
        })
        ctx.stroke();
        ctx.restore();
        const meanFPS = this.game.frameTimes.reduce((a,b) => a + b) / this.game.frameTimes.length;
        ctx.fillText(`FPS: ${parseInt(1000 / meanFPS)}`, this.game.width - 20, 50);

        // game over message
        if (this.game.gameOver) {
            ctx.textAlign = 'center';
            ctx.font = `${this.fontSize * 2}px ${this.fontFamily}`;
            let messsage = this.game.score >= 20 ? 'PASS' : 'FAIL';
            ctx.fillText(messsage, this.game.width * 0.5, this.game.height * 0.5);
            ctx.font = `${this.fontSize * 0.8}px ${this.fontFamily}`;
            ctx.fillText('Press ENTER to play again', this.game.width * 0.5, this.game.height * 0.6);
        }

        ctx.restore();
    }
}

