"use strict";

import Player from "./player.js";
import InputHandler from "./input.js";
import { drawStatusText } from "./utils.js";

/** @param {{ctx: ctx, player: Player, input: InputHandler}} game*/
function animate(game) {
    /** @type {HTMLCanvasElement} */
    const ctx = game.ctx;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let newTime = performance.now();
    let frameTime = newTime - game.currentTime;
    game.currentTime = newTime;
    game.accumulator += frameTime;

    while (game.accumulator >= game.dt) {
        game.player.update(game.input.lastKey, game.dt);
        game.accumulator -= game.dt;
        game.t += game.dt;
    }

    game.player.draw(game.ctx);
    drawStatusText(game.ctx, game.input, game.player);

    requestAnimationFrame(() => animate(game));
}

window.onload = () => {
    // hide the loading screen
    document.getElementById('loading').style.display = 'none';

    const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('canvas'));
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // https://gafferongames.com/post/fix_your_timestep/

    const game = {
        ctx: ctx,
        t: 0,
        dt: 0.01,
        currentTime: performance.now(),
        accumulator: 0,
        player: new Player(canvas.width, canvas.height),
        input: new InputHandler()
    }

    // enter main loop
    animate(game);
}
