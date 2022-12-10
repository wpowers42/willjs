const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('canvas'));
const ctx = canvas.getContext('2d');

canvas.width = 500;
canvas.height = 800;

const game = new Game(ctx, canvas.width, canvas.height);

let lastTime = 0;

function animate(timestamp) {
    console.log(timestamp);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const deltaTime = timestamp - lastTime;
    if (document.hasFocus()) {
        game.update(deltaTime);
        game.draw();
    }
    lastTime = timestamp;
    requestAnimationFrame(animate);
}

window.onload = () => animate(lastTime);
