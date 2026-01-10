/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = canvas.width = 800;
const CANVAS_HEIGHT = canvas.height = 800;

/** @type {HTMLSpanElement} */
const fpsSpan = document.getElementById('fps');

/** @type {HTMLInputElement} */
const numBoxesInput = document.getElementById('numBoxes');

const boxA = new Box(100, 50, 100, 200);
const boxB = new Box(300, 0, 50, 400);
const boxC = new Box(300, 500, 200, 100);
const boxD = new Box(100, 500, 100, 50);


const map = new Map(CANVAS_WIDTH, CANVAS_HEIGHT, numBoxesInput.value);
const light = new Light(400, 100);

numBoxesInput.addEventListener('change', e => {
    map.boxCount = e.target.value;
    map.setUpCoords();
    map.createBoxes();
    light.update();

});

// Convert client coordinates to canvas coordinates (accounts for CSS scaling)
function getCanvasCoords(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    return {
        x: Math.floor((clientX - rect.left) * scaleX),
        y: Math.floor((clientY - rect.top) * scaleY)
    };
}

function handlePointerDown(clientX, clientY) {
    const { x, y } = getCanvasCoords(clientX, clientY);

    if (light.pointInArc(x, y)) {
        light.isMoving = true;
    }

    for (const box of map.boxes) {
        if (box.pointInBox(x, y)) {
            box.isMoving = true;
            box.mouseOffsetX = x - box.x;
            box.mouseOffsetY = y - box.y;
        }
    }
}

function handlePointerMove(clientX, clientY) {
    const { x, y } = getCanvasCoords(clientX, clientY);

    if (light.isMoving) {
        light.x = clamp(x, 0, CANVAS_WIDTH);
        light.y = clamp(y, 0, CANVAS_HEIGHT);
        light.update();
    } else {
        for (let box of map.boxes) {
            if (box.isMoving) {
                let newX = clamp(x - box.mouseOffsetX, 0, CANVAS_WIDTH - box.width);
                let newY = clamp(y - box.mouseOffsetY, 0, CANVAS_HEIGHT - box.height);
                map.moveBox(box, newX, newY);
                light.update();
            }
        }
    }
}

function handlePointerUp() {
    light.isMoving = false;
    map.boxes.forEach(box => box.isMoving = false);
}

// Mouse events
canvas.addEventListener('mousedown', e => handlePointerDown(e.clientX, e.clientY));
canvas.addEventListener('mousemove', e => handlePointerMove(e.clientX, e.clientY));
document.addEventListener('mouseup', handlePointerUp);

// Touch events
canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const touch = e.touches[0];
    handlePointerDown(touch.clientX, touch.clientY);
}, { passive: false });

canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const touch = e.touches[0];
    handlePointerMove(touch.clientX, touch.clientY);
}, { passive: false });

document.addEventListener('touchend', handlePointerUp);
document.addEventListener('touchcancel', handlePointerUp);


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