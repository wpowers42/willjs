import Game from "./Game";

export default class Pipe {
    x: number;
    y: number;
    dx: number;
    image: HTMLImageElement;
    spriteWidth: number;
    spriteHeight: number;
    width: number;
    height: number;
    game: Game;
    pipeGap: number;
    markedForDeletion: boolean;

    constructor(game: Game) {
        this.game = game;
        this.x = this.game.width;
        this.y = Math.random() * this.game.height * 0.20 + this.game.height * 0.50; // top of the bottom section of the pipe
        this.dx = 0.05;
        this.image = <HTMLImageElement>document.getElementById('pipeImage');
        this.spriteWidth = this.image.width;
        this.spriteHeight = this.image.height;
        this.width = this.spriteWidth * 0.50;
        this.height = this.spriteWidth * 0.50;
        this.pipeGap = 75;
        this.markedForDeletion = false;
    }

    update(dt: number) {
        this.x -= this.dx * dt;
        this.markedForDeletion = this.x + this.width < 0;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.drawImage(this.image, this.x, this.y);

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(1, -1);
        ctx.drawImage(this.image, 0, this.pipeGap);
        ctx.restore();
    }
}
