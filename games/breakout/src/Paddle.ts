import * as Mathf from "../../math/Mathf.js";
import Constants from "./Constants.js";
import InputHandler from "./InputHandler.js";

export default class Paddle {
    width: number;
    height: number;
    x: number;
    y: number;
    dx: number;
    skin: number;
    size: number;

    constructor(skin: number) {
        this.width = 64;
        this.height = 16;
        this.x = Constants.virtualWidth * 0.50 - this.width * 0.50;
        this.y = Constants.virtualHeight - 32;
        this.dx = 0;
        this.skin = skin;
        this.size = 2;
    }

    update(dt: number, inputHandler: InputHandler) {
        if (inputHandler.isKeyPressed('ArrowLeft')) {
            this.dx = -Constants.paddleSpeed;
        } else if (inputHandler.isKeyPressed('ArrowRight')) {
            this.dx = Constants.paddleSpeed;
        } else {
            this.dx = 0;
        }

        this.x += this.dx * dt;
        this.x = Mathf.Clamp(this.x, 0, Constants.virtualWidth - this.width);
    }

    draw(ctx: CanvasRenderingContext2D) {
        let quad = Constants.frames.paddles[this.skin * 4 + this.size];
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
