const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('canvas1'));
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = canvas.width = 600;
const CANVAS_HEIGHT = canvas.height = 600;

const playerImage = new Image();
playerImage.src = 'shadow_dog.png';

const spriteWidth = 575;
const spriteHeight = 523;

let i = 0;

let frameX = 0;
let frameY = 0;
let gameFrame = 0;

function animate() {
    // need to specify which area of the canvas to clear
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    // ctx.fillRect(50, 50, 100, 100);
    // ctx.drawImage(playerImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); // JS will stretch based on arguments 4 and 5
    let sx = (frameX % 7) * spriteWidth;
    let sy = frameY;
    let sw = dw = spriteWidth;
    let sh = dh = spriteHeight;
    let dx = dy = 0;
    ctx.drawImage(playerImage, sx, sy, sw, sh, dx, dy, dw, dh);

    if (gameFrame % 2 == 0) {
        frameX++;
    }
    gameFrame++;
    requestAnimationFrame(animate);
}

animate();
