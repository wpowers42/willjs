/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = canvas.width = 600;
const CANVAS_HEIGHT = canvas.height = 600;

const map = new Map(CANVAS_WIDTH, CANVAS_HEIGHT);
const boxA = new Box(100, 50, 100, 200);
const boxB = new Box(300, 0, 50, 400);
const light = new Light(400, 100);



function animate() {
    ctx.clearRect(0, 0, CANVAS_HEIGHT, CANVAS_HEIGHT);
    light.update();
    map.draw();
    boxA.draw();
    boxB.draw();
    light.draw();

    requestAnimationFrame(animate);
}

animate();