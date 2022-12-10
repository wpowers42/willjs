import Game from "./Game";

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

    constructor() {
        this.x = 0;
        this.y = 0;
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
        super();
        this.image = <HTMLImageElement>document.getElementById('backgroundImage');
        this.width = this.image.width;
        this.height = this.image.height;
        this.dx = 0.04;
    }
}

class Ground extends Scene {
    constructor(gameHeight: number) {
        super();
        this.image = <HTMLImageElement>document.getElementById('groundImage');
        this.width = this.image.width;
        this.height = this.image.height;
        this.dx = 0.05;
        this.y = gameHeight - this.height;
    }
}
