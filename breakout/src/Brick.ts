import { Constants } from "./constants.js";

export default class Brick {
    x: number;
    y: number;
    width: number;
    height: number;
    tier: number;
    color: number;
    inPlay: boolean;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 16;
        this.tier = 0;
        this.color = 0;
        this.inPlay = true;
    }

    hit() {
        Constants.sounds.brickHit2.pause();
        Constants.sounds.brickHit2.currentTime = 0;
        Constants.sounds.brickHit2.play();
        
        if (this.tier > 0) {
            if (this.color === 1) {
                this.tier -= 1;
                this.color = 4;
            } else {
                this.color -= 1;

            }
        } else {
            if (this.color === 0) {
                this.inPlay = false;
                Constants.sounds.brickHit1.pause();
                Constants.sounds.brickHit1.currentTime = 0;
                Constants.sounds.brickHit1.play();
            } else {
                this.color -= 1;
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (this.inPlay) {
            let quad = Constants.frames.bricks[this.color * 4 + this.tier];
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
}
