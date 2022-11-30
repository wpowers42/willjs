import Game from "./Game";

function animate(game: Game) {

    const ctx = game.ctx;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    game.update();
    game.draw();

    requestAnimationFrame(() => animate(game));
}

window.onload = () => {

    const canvas = <HTMLCanvasElement>document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 1280;
    canvas.height = 720;

    const game = new Game(ctx);

    // enter main loop
    animate(game);
}
