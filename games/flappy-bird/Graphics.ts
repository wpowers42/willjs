import Game from "./Game.js";

export default class Graphics {
    game: Game;
    background: Background;
    ground: Ground;

    constructor(game: Game) {
        this.game = game;
        this.background = new Background();
        this.ground = new Ground(this.game.height);
    }

    update(dt: number) {
        this.background.update(dt);
        this.ground.update(dt);
    }

    drawBackground(ctx: CanvasRenderingContext2D) {
        this.background.draw(ctx);
    }

    // using separate draw calls so we can layer the ground in front of the pipes
    drawGround(ctx: CanvasRenderingContext2D) {
        this.ground.draw(ctx);
    }
}

class Scene {
    image: HTMLImageElement;
    width: number;
    height: number;
    x: number;
    y: number;
    dx: number;

    constructor(image: HTMLImageElement, width: number, height: number, dx: number) {
        this.x = 0;
        this.y = 0;
        this.dx = dx;
        this.image = image;
        this.width = width;
        this.height = height;
    }

    update(dt: number) {
        this.x -= this.dx * dt;
        if (this.x + this.width < 0) {
            this.x += this.width;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        let sx = 0;
        let sy = 0;
        let sw = this.width;
        let sh = this.height;
        let dx = this.x;
        let dy = this.y;
        let dw = this.width;;
        let dh = this.height;
        ctx.drawImage(this.image, sx, sy, sw, sh, dx, dy, dw, dh);
        ctx.drawImage(this.image, sx, sy, sw, sh, dx + sw - 1, dy, dw, dh);
    }
}

class Background extends Scene {
    constructor() {
        const image = <HTMLImageElement>document.getElementById('backgroundImage');
        const width = image.width;
        const height = image.height;
        const dx = 0.04;
        super(image, width, height, dx);
    }
}

class Ground extends Scene {
    constructor(gameHeight: number) {
        const image = <HTMLImageElement>document.getElementById('groundImage');
        const width = image.width;
        const height = image.height;
        const dx = 0.05;
        super(image, width, height, dx);
        this.y = gameHeight - this.height;
    }
}
