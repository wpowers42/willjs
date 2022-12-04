import BaseState from "./BaseState.js";
import { Constants } from '../constants.js';
export default class StartState extends BaseState {
    constructor() {
        super();
        this.highlighted = 0;
    }
    update(dt, inputHandler) {
        if (inputHandler.isKeyPressed('ArrowUp') ||
            inputHandler.isKeyPressed('ArrowDown')) {
            this.highlighted ^= 1; // bitwise or toggles value between 0 and 1
        }
        if (inputHandler.isKeyPressed('Escape')) {
            // handle future quit state
        }
    }
    draw(ctx) {
        // title
        ctx.font = Constants.fonts.large;
        ctx.textAlign = 'center';
        ctx.fillText('BREAKOUT', ctx.canvas.width * 0.5, ctx.canvas.height * 0.33);
        // instructions
    }
}
//# sourceMappingURL=StartState.js.map