import { Mathf } from "../../math/Mathf.js";
import { Constants } from "./constants.js";

export default class Ball {
    width: number;
    height: number;
    dx: number;
    dy: number;
    skin: number;
    x: number;
    y: number;
    minHorizontalSpeed: number;
    maxHorizontalSpeed: number;
    minVerticalSpeed: number;
    maxVerticalSpeed: number;


    constructor() {
        this.width = 8;
        this.height = 8;
        this.x = 0;
        this.y = 0;
        this.dx = 0
        this.dy = 0;
        this.minHorizontalSpeed = Constants.paddleSpeed * 0.25;
        this.maxHorizontalSpeed = Constants.paddleSpeed * 2.00;
        this.minVerticalSpeed = 0.05;
        this.maxVerticalSpeed = 0.10;
        this.skin = Math.floor(Math.random() * 6); // random ball skin
        this.reset();
    }

    collides(target: { x: number; width: number; y: number; height: number; }) {
        return !(this.x + this.width < target.x ||
            this.x > target.x + target.width ||
            this.y + this.height < target.y ||
            this.y > target.y + target.height)
    }

    reset() {
        this.x = Constants.virtualWidth * 0.50 - this.width * 0.50;
        this.y = Constants.virtualHeight * 0.50 - this.height * 0.50;
        this.dx = (Math.random() * 2 - 1) * ((this.maxHorizontalSpeed - this.minHorizontalSpeed) + this.minHorizontalSpeed);
        this.dy = -Math.random() * (this.maxVerticalSpeed - this.minVerticalSpeed) - this.minVerticalSpeed;
    }

    update(dt: number) {
        this.x += this.dx * dt;
        this.y += this.dy * dt;

        this.x = Mathf.Clamp(this.x, 0, Constants.virtualWidth - this.width);
        this.y = Mathf.Clamp(this.y, 0, Constants.virtualHeight);

        if (this.x === 0 || this.x === Constants.virtualWidth - this.width) {
            this.dx = -this.dx;
            Constants.sounds.wallHit.play();
        }

        if (this.y === 0) {
            this.dy = -this.dy;
            Constants.sounds.wallHit.play();
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        let quad = Constants.frames.balls[this.skin];
        let { sx, sy, sw, sh } = quad;
        let dx = this.x;
        let dy = this.y;
        let dw = this.width;
        let dh = this.height;
        ctx.drawImage(Constants.textures.main, sx, sy, sw, sh, dx, dy, dw, dh);
        if (Constants.debug) {
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
}
