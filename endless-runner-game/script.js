"use strict";

import Game from "./game.js";

/** @param {{ctx: ctx}} game*/
function animate(game) {

    /** @type {HTMLCanvasElement} */
    const ctx = game.ctx;

    if (!game.paused) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update();
        game.draw();
    }
    requestAnimationFrame(() => animate(game));
}

window.onload = () => {

    const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('canvas'));
    const ctx = canvas.getContext('2d');

    canvas.width = 800;
    canvas.height = 500;

    const game = new Game(ctx);

    // enter main loop
    animate(game);
}
