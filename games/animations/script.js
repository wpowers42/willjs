const dropdown = /** @type {HTMLSelectElement} */ (document.getElementById('animations'));
let playerState = dropdown.value;

dropdown.addEventListener('change', e => playerState = e.target.value );

const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('canvas'));
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = canvas.width = 600;
const CANVAS_HEIGHT = canvas.height = 600;

const playerImage = new Image();
playerImage.src = 'shadow_dog.png';

const spriteWidth = 575;
const spriteHeight = 523;

let gameFrame = 0;
const staggerFrames = 3;

const spriteAnimations = [];
const animationStates = [
    {
        name: 'idle',
        frames: 7
    },
    {
        name: 'jump',
        frames: 7
    },
    {
        name: 'fall',
        frames: 7
    },
    {
        name: 'run',
        frames: 9
    },
    {
        name: 'dizzy',
        frames: 11
    },
    {
        name: 'sit',
        frames: 5
    },
    {
        name: 'roll',
        frames: 7
    },
    {
        name: 'bite',
        frames: 7
    },
    {
        name: 'ko',
        frames: 12
    },
    {
        name: 'getHit',
        frames: 4
    }
];

animationStates.forEach((state, index) => {
    let frames = {
        loc: []
    }
    for (let j = 0; j < state.frames; j++) {
        let positionX = j * spriteWidth;
        let positionY = index * spriteHeight;
        frames.loc.push({x: positionX, y: positionY});
    }
    spriteAnimations[state.name] = frames;
});

let animation = spriteAnimations[playerState];

function animate() {
    animation = spriteAnimations[playerState];
    // need to specify which area of the canvas to clear
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    let position = Math.floor(gameFrame / staggerFrames) % animation.loc.length;
    let sx = animation.loc[position].x;
    let sy = animation.loc[position].y;
    let sw = dw = spriteWidth;
    let sh = dh = spriteHeight;
    let dx = dy = 0;
    ctx.drawImage(playerImage, sx, sy, sw, sh, dx, dy, dw, dh);

    gameFrame++;
    requestAnimationFrame(animate);
}

animate();
