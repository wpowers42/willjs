import Game from "./Game";

export default class Bird {
    game: Game;
    image: HTMLImageElement;
    spriteWidth: number;
    spriteHeight: number;
    width: number;
    height: number;
    x: number;
    y: number;
    dy: number;
    speedY: number;
    gravity: number;
    frames: number;
    frameX: number;
    fps: number;
    frameInterval: number;
    frameTimer: number;


    constructor(game: Game) {
        this.game = game;
        this.image = <HTMLImageElement>document.getElementById('birdImage');
        this.spriteWidth = 93.5;
        this.spriteHeight = 64;
        this.width = this.spriteWidth * 0.50;
        this.height = this.spriteHeight * 0.50;
        this.x = this.game.width * 0.50 - this.width * 0.50;
        this.y = this.game.height * 0.50 - this.height * 0.50;
        this.dy = 0;
        this.speedY = 4.0;
        this.gravity = 0.01;
        this.frames = 4;
        this.frameX = 0;
        this.fps = 4;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;
    }

    update(dt: number) {
        this.frameTimer += dt;
        if (this.frameTimer > this.frameInterval) {
            this.frameX = (this.frameX + 1) % this.frames;
            this.frameTimer -= this.frameInterval;
        }

        this.dy += this.gravity * dt;
        this.y += this.dy;

        if (this.game.input.isKeyPressed(' ')) {
            this.dy = -this.speedY;
        }

    }

    draw(ctx: CanvasRenderingContext2D) {
        let sx = this.frameX * this.spriteWidth;
        let sy = 0;
        let sw = this.spriteWidth;
        let sh = this.spriteHeight;
        let dx = this.x;
        let dy = this.y;
        let dw = this.width;;
        let dh = this.height;
        ctx.drawImage(this.image, sx, sy, sw, sh, dx, dy, dw, dh);
    }
}
