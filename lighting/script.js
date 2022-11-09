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


const map = new Map(CANVAS_WIDTH, CANVAS_HEIGHT, 2);
const light = new Light(400, 100);

canvas.addEventListener('mousedown', e => {
    let rect = canvas.getBoundingClientRect();
    let clientX = e.clientX;
    let clientY = e.clientY;
    let mouseX = clientX - rect.left;
    let mouseY = clientY - rect.top;

    if (light.pointInArc(mouseX, mouseY)) {
        // mouse on top of light
        light.isMoving = true;
    }

    for (let box of map.boxes) {
        if (box.pointInBox(mouseX, mouseY)) {
            // mouse on top of box
            box.isMoving = true;
            box.mouseOffsetX = mouseX - box.x;
            box.mouseOffsetY = mouseY - box.y;
            break;
        }
    }

    if (light.pointInArc(mouseX, mouseY)) {
        // mouse on top of light
        light.isMoving = true;
    }
});

canvas.addEventListener('mousemove', e => {
    let rect = canvas.getBoundingClientRect();
    let clientX = e.clientX;
    let clientY = e.clientY;
    let mouseX = Math.floor(clientX - rect.left);
    let mouseY = Math.floor(clientY - rect.top);

    if (light.isMoving) {
        light.x = 0 > mouseX ? 0 : CANVAS_WIDTH < mouseX ? CANVAS_WIDTH : mouseX;
        light.y = 0 > mouseY ? 0 : CANVAS_HEIGHT < mouseY ? CANVAS_HEIGHT : mouseY;
        light.update();
    } else {
        for (let box of map.boxes) {
            if (box.isMoving) {
                box.x = (0 > mouseX ? 0 : CANVAS_WIDTH < mouseX ? CANVAS_WIDTH : mouseX) - box.mouseOffsetX;
                box.y = (0 > mouseY ? 0 : CANVAS_HEIGHT < mouseY ? CANVAS_HEIGHT : mouseY) - box.mouseOffsetY;
                map.setUpCoords();
                light.update();
                break;
            }
        };
    }
});

document.addEventListener('mouseup', e => light.isMoving = false);
document.addEventListener('mouseup', e => map.boxes.forEach(box => box.isMoving = false));


let now = Date.now()
let milliseconds;

function animate() {
    ctx.clearRect(0, 0, CANVAS_HEIGHT, CANVAS_HEIGHT);
    map.draw();
    light.draw();

    milliseconds = Date.now() - now;
    fpsSpan.textContent = Math.floor(1000 / milliseconds);
    now += milliseconds;

    requestAnimationFrame(animate);
}

animate();