import { Constants } from "./constants.js";
import ParticleSystem from "./ParticleSystem.js";
export default class Brick {
    constructor(x, y, color, tier) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 16;
        this.color = color;
        this.tier = tier;
        this.particleSystem = new ParticleSystem(64, // maxParticles
        { min: 500, max: 1000 }, // particleLifetime in milliseconds
        { xmin: -0.00002, ymin: -0.00001, xmax: 0.00002, ymax: 0.00004 }, // linearAcceleration
        { dx: 8, dy: 4 });
        this.inPlay = true;
    }
    hit() {
        this.particleSystem.setColors([...ParticleSystem.paletteColors[this.color], 55 * (this.tier + 1) / 255], [...ParticleSystem.paletteColors[this.color], 0]);
        this.particleSystem.emit(64, this.x + this.width * 0.50, this.y + this.height * 0.50);
        Constants.sounds.brickHit2.pause();
        Constants.sounds.brickHit2.currentTime = 0;
        Constants.sounds.brickHit2.play();
        if (this.tier > 1) {
            if (this.color === 1) {
                this.tier -= 1;
                this.color = 5;
            }
            else {
                this.color -= 1;
            }
        }
        else {
            if (this.color === 1) {
                this.inPlay = false;
                Constants.sounds.brickHit1.pause();
                Constants.sounds.brickHit1.currentTime = 0;
                Constants.sounds.brickHit1.play();
            }
            else {
                this.color -= 1;
            }
        }
    }
    update(dt) {
        this.particleSystem.update(dt);
    }
    draw(ctx) {
        if (this.inPlay) {
            let quad = Constants.frames.bricks[this.tier * 4 + (this.color - 1)];
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
        this.particleSystem.draw(ctx);
    }
}
//# sourceMappingURL=Brick.js.map