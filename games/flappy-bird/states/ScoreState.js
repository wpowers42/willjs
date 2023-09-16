import * as Mathf from "../../math/Mathf.js";
import BaseState from "./BaseState.js";
export default class ScoreState extends BaseState {
    constructor(game) {
        super();
        this.game = game;
        this.medalImage = document.getElementById('birdImage');
        this.medalSpriteWidth = 93.5;
        this.medalSpriteHeight = 64;
        this.medalWidth = this.medalSpriteWidth * 0.50;
        this.medalHeight = this.medalSpriteHeight * 0.50;
        this.medalGap = 20;
        this.score = 0;
    }
    enter(enterParams) {
        this.score = enterParams['score'];
    }
    exit() { }
    update(dt) {
        if (this.game.input.isKeyPressed('Enter')) {
            this.game.stateMachine.change('countdown', {});
        }
    }
    draw(ctx) {
        ctx.textAlign = 'center';
        ctx.font = this.game.fonts.large;
        ctx.fillText('Oof! You lost!', this.game.width * 0.50, 64);
        ctx.font = this.game.fonts.medium;
        ctx.fillText(`Score: ${this.score}`, this.game.width * 0.50, 100);
        ctx.fillText('Press Enter to Play Again!', this.game.width * 0.50, 160);
        const medals = Mathf.Clamp(Math.floor(this.score / 3), 1, 4);
        const medalsWidth = medals * this.medalWidth + (medals - 1) * this.medalGap;
        for (let i = 0; i < medals; i++) {
            let x = this.game.width * 0.5 - medalsWidth * 0.5 + i * (this.medalWidth + this.medalGap);
            let sx = 2 * this.medalSpriteWidth;
            let sy = 0;
            let sw = this.medalSpriteWidth;
            let sh = this.medalSpriteHeight;
            let dx = x;
            let dy = 200;
            let dw = this.medalWidth;
            let dh = this.medalHeight;
            ctx.drawImage(this.medalImage, sx, sy, sw, sh, dx, dy, dw, dh);
        }
    }
}
//# sourceMappingURL=ScoreState.js.map