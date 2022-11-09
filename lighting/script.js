/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = canvas.width = 800;
const CANVAS_HEIGHT = canvas.height = 800;

/** @type {HTMLSpanElement} */
const fpsSpan = document.getElementById('fps');

const boxA = new Box(100, 50, 100, 200);
const boxB = new Box(300, 0, 50, 400);
const boxC = new Box(300, 500, 200, 100);
const boxD = new Box(100, 500, 100, 50);


const map = new Map(CANVAS_WIDTH, CANVAS_HEIGHT, 6);
const light = new Light(400, 100);


let now = Date.now()
let milliseconds;

function animate() {
    ctx.clearRect(0, 0, CANVAS_HEIGHT, CANVAS_HEIGHT);
    light.update();
    map.draw();
    light.draw();

    milliseconds = Date.now() - now;
    fpsSpan.textContent = Math.floor(1000 / milliseconds);
    now += milliseconds;

    requestAnimationFrame(animate);
}

animate();