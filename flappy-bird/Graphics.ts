import Game from "./Game";

export default class Graphics {
    game: Game;
    background: HTMLImageElement;
    ground: HTMLImageElement;

    constructor(game: Game) {
        this.game = game;
        this.background = <HTMLImageElement>document.getElementById('backgroundImage');
        this.ground = <HTMLImageElement>document.getElementById('groundImage');
    }

    update() {

    }

    draw(ctx = this.game.ctx) {
        ctx.drawImage(this.background, 0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.drawImage(this.ground, 0, ctx.canvas.height - this.ground.height);
    }
}
