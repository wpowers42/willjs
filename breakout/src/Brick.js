import { Constants } from "./constants.js";
export default class Brick {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 16;
        this.tier = 0;
        this.color = 0;
        this.inPlay = true;
    }
    hit() {
        Constants.sounds.brickHit2.play();
        this.inPlay = false;
    }
    draw(ctx) {
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
//# sourceMappingURL=Brick.js.map