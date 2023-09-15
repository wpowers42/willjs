import Game from "./Game.js";

function animate(game: Game, canvas: HTMLCanvasElement) {

    const ctx = game.ctx;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.update();
    game.draw();

    requestAnimationFrame(() => animate(game, canvas));
}

window.onload = () => {

    const canvas: HTMLCanvasElement = (document.getElementById('canvas') as HTMLCanvasElement);

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    canvas.width = 1200;
    canvas.height = 800;

    const game = new Game(ctx);

    // enter main loop
    animate(game, canvas);
}
