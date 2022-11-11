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
    console.log(map.coords);
    light.update();

});

canvas.addEventListener('mousedown', e => {
    let rect = canvas.getBoundingClientRect();
    let clientX = e.clientX;
    let clientY = e.clientY;
    let mouseX =  Math.floor(clientX - rect.left);
    let mouseY =  Math.floor(clientY - rect.top);

    if (light.pointInArc(mouseX, mouseY)) {
        // mouse on top of light
        light.isMoving = true;
    }


    for (const box of map.boxes) {
        if (box.pointInBox(mouseX, mouseY)) {
            // mouse on top of box
            box.isMoving = true;
            box.mouseOffsetX = mouseX - box.x;
            box.mouseOffsetY = mouseY - box.y;
            // break;
        }
    }

});

canvas.addEventListener('mousemove', e => {
    let rect = canvas.getBoundingClientRect();
    let clientX = e.clientX;
    let clientY = e.clientY;
    let mouseX = Math.floor(clientX - rect.left);
    let mouseY = Math.floor(clientY - rect.top);

    if (light.isMoving) {
        light.x = clamp(mouseX, 0, CANVAS_WIDTH);
        light.y = clamp(mouseY, 0, CANVAS_HEIGHT);
        light.update();
    } else {
        for (let box of map.boxes) {
            if (box.isMoving) {

                let newX = clamp(mouseX - box.mouseOffsetX, 0, CANVAS_WIDTH - box.width);
                let newY = clamp(mouseY - box.mouseOffsetY, 0, CANVAS_HEIGHT - box.height);

                map.moveBox(box, newX, newY);
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