const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('canvas'));
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = canvas.width = 500;
const CANVAS_HEIGHT = canvas.height = 700;

ctx.fillStyle = 'white';

let explosions = [];

function createAnimation(e) {
    let x = Math.floor(e.clientX - canvas.getBoundingClientRect().left);
    let y = Math.floor(e.clientY - canvas.getBoundingClientRect().top);
    explosions.push(new Explosion(x, y))
}

canvas.addEventListener('click', e => {
    createAnimation(e);
})

function animate() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    requestAnimationFrame(animate);

    for (const [index, explosion] of explosions.entries()) {
        explosion.draw();
        explosion.update();

        if (explosion.frame == explosion.frameCount * explosion.frameDelay) {
            explosions.splice(index, 1);
        }
    }
}

animate();
