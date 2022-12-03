import Game from "./Game.js";

function animate(game: Game) {

    const ctx = game.ctx;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (!game.paused) {
        game.update();
    }
    game.draw();

    requestAnimationFrame(() => animate(game));
}

window.onload = () => {

    const canvas = <HTMLCanvasElement>document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 512;
    canvas.height = 288;

    const game = new Game(ctx);

    // enter main loop
    animate(game);
}
