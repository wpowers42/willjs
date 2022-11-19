// @ts-check

const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('canvas'));
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 720;

const input = new InputHandler();
const player = new Player(canvas.width, canvas.height);

const handleEnemies = () => {

};

const displayStatusText = () => {

};

let lastTime = 0;

function animate(timestamp) {
    if (!ctx) {
        throw new Error(`2d context not supported or canvas already initialized`);
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const deltaTime = timestamp - lastTime;
    if (document.hasFocus()) {
        player.update(deltaTime, input);
    }
    player.draw(ctx);
    lastTime = timestamp;
    requestAnimationFrame(animate);
}

window.onload = () => animate(lastTime);
