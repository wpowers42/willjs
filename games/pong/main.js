import Game from "./Game.js";

function animate(game, canvas) {
    const ctx = game.ctx;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.update();
    game.draw();
    requestAnimationFrame(() => animate(game, canvas));
}

window.onload = () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 800;
    const game = new Game(ctx);
    
    // enter main loop
    animate(game, canvas);
};