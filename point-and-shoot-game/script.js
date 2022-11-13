"use strict";

const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('canvas'));
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const collisionCanvas = /** @type {HTMLCanvasElement} */ (document.getElementById('collisionCanvas'));
const collisionCTX = collisionCanvas.getContext('2d');
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;

addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    collisionCanvas.width = window.innerWidth;
    collisionCanvas.height = window.innerHeight;
});

let ravens = [];
let explosions = [];
let timeToNextRaven = 0;
let ravenInterval = 500;
let lastTime = 0;
let score = 0;

ctx.font = '32px Courier';
function drawScore() {
    ctx.fillStyle = 'black';
    ctx.fillText(`Score: ${score}`, 50, 75);
    ctx.fillStyle = 'white';
    ctx.fillText(`Score: ${score}`, 51, 76);
}

canvas.addEventListener('mousedown', e => {
    const pixelColor = collisionCTX.getImageData(e.x, e.y, 1, 1).data;

    if (pixelColor[3] == 0) {
        return;
    }

    const collisions = ravens.filter(r => {
        return (r.randomColors[0] == pixelColor[0] &&
            r.randomColors[1] == pixelColor[1] &&
            r.randomColors[2] == pixelColor[2]);
    });

    [...collisions].forEach(object => {
        object.markedForDeletion = true;
        explosions.push(new Explosion(e.x, e.y, object.sizeModifier));
        score += 1;
    });

})

function animate(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    collisionCTX.clearRect(0, 0, collisionCanvas.width, collisionCanvas.height);
    
    let deltatime = timestamp - lastTime;
    lastTime = timestamp;
    timeToNextRaven += deltatime;

    if (timeToNextRaven >= ravenInterval) {
        ravens.push(new Raven());
        ravens.sort((a, b) => a.sizeModifier - b.sizeModifier);
        timeToNextRaven = 0;
    }

    [...ravens, ...explosions].forEach(object => object.update(deltatime));

    drawScore();
    [...ravens, ...explosions].forEach(object => object.draw());

    ravens = ravens.filter(object => !object.markedForDeletion);
    explosions = explosions.filter(object => !object.markedForDeletion);


    requestAnimationFrame(animate);
}


animate(lastTime);
