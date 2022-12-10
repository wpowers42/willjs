import InputHandler from "./input.js";
import Player from "./player.js";

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {InputHandler} input
 * @param {Player} player
 * */
export const drawStatusText = (ctx, input, player) => {
    ctx.save();
    ctx.font = '28px Helvetica';
    ctx.fillText(`Last Input: ${input.lastKey}`, 20, 50);
    ctx.fillText(`Active State: ${player.currentState.state}`, 20, 90);
}
