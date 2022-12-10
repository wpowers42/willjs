import Game from "./Game.js";
function animate(game) {
    const ctx = game.ctx;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    game.update();
    game.draw();
    requestAnimationFrame(() => animate(game));
}
window.onload = () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 288;
    const game = new Game(ctx);
    // enter main loop
    animate(game);
};
//# sourceMappingURL=script.js.map