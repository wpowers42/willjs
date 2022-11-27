"use strict";

import Game from "./Game.js";

/** @param {{ctx: ctx}} game*/
function animate(game) {

    /** @type {HTMLCanvasElement} */
    const ctx = game.ctx;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(40, 45, 52, 1)';
    ctx.fill();
    game.update();
    game.draw();

    requestAnimationFrame(() => animate(game));
}

window.onload = () => {

    /** @type {HTMLCanvasElement} */
    const canvas = (document.getElementById('canvas'));
    const ctx = canvas.getContext('2d');

    canvas.width = 400;
    canvas.height = 225;

    const game = new Game(ctx);

    // enter main loop
    animate(game);
}
