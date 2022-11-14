"use strict";

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let lastTime = 0;

const points = [];

const rectWidth = 400;
const rectHeight = 400;


const radius = canvas.width / 2 * 0.90;

function animate(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let deltatime = timestamp - lastTime;
    lastTime = timestamp;

    // ctx.strokeStyle = 'white';
    // ctx.globalAlpha = 0.25;
    // ctx.strokeRect(canvas.width / 2 - 200, canvas.height / 2 - 200, 400, 400);

    ctx.globalAlpha = 1;
    let segments = 128;
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'white';

    let angularSpeed = Math.PI * 0.50 / 4000; // We want to cover 1/4 of a circle in 4s

    let angle = -(timestamp * angularSpeed) % (Math.PI * 2.0);
    angle += Math.PI * 0.75;


    for (let i = 0; i < segments; i++) {
        ctx.beginPath();
        // negative to move counter clockwise
        let start = -i / segments * Math.PI * 2 - angle;
        let stop = -(i + 1) / segments * Math.PI * 2 - angle;
        ctx.globalAlpha = Math.max(1 - i / segments * 8, 0.10);
        // ctx.strokeStyle = (s % 2) == 0 ? 'white' : 'red';
        ctx.arc(canvas.width / 2, canvas.height / 2, radius, start, stop, true);
        ctx.stroke();
    }

    let seconds = (timestamp / 1000) % 16.0;

    ctx.globalAlpha = 1;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';

    

    // ctx.font = `${Math.floor(seconds % 4 * 4 + 24)}px Courier`;
    ctx.font = '36px Courier';
    // ctx.fillText(Math.floor(seconds) % 4 + 1, canvas.width / 2, canvas.height / 2 );

    let alphasNums = [
        Math.floor(seconds) % 4 + 1 == 1 ? 0.90 : 0.10,
        Math.floor(seconds) % 4 + 1 == 2 ? 0.90 : 0.10,
        Math.floor(seconds) % 4 + 1 == 3 ? 0.90 : 0.10,
        Math.floor(seconds) % 4 + 1 == 4 ? 0.90 : 0.10
    ]

    let gap = 48;
    ctx.globalAlpha = alphasNums[0];
    ctx.fillText(1, canvas.width / 2 - gap - gap / 2, canvas.height / 2);
    ctx.globalAlpha = alphasNums[1];
    ctx.fillText(2, canvas.width / 2 - gap / 2, canvas.height / 2);
    ctx.globalAlpha = alphasNums[2];
    ctx.fillText(3, canvas.width / 2 + gap / 2, canvas.height / 2);
    ctx.globalAlpha = alphasNums[3];
    ctx.fillText(4, canvas.width / 2 + gap + gap / 2, canvas.height / 2);

    let alphas = [
        seconds > 0 && seconds <= 4 ? 1.0 : 0.25,
        seconds > 4 && seconds <= 8 ? 1.0 : 0.25,
        seconds > 8 && seconds <= 12 ? 1.0 : 0.25,
        seconds > 12 && seconds <= 16 ? 1.0 : 0.25
    ]


    for (let i = 0; i < 4; i++) {
        ctx.save();
        ctx.globalAlpha = alphas[i];
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(Math.PI * 2 * i / 4 + 0.75 * Math.PI);
        ctx.translate(0, radius);
        ctx.fillRect(0, -10, 1, 20);
        ctx.restore();
    }

    ctx.font = '24px Courier';
    ctx.globalAlpha = alphas[0];
    ctx.textBaseline = 'top';
    ctx.fillText('Breathe In', canvas.width / 2, canvas.height / 2 - radius + 40);
    ctx.globalAlpha = alphas[2];
    ctx.textBaseline = 'bottom';
    ctx.fillText('Breathe Out', canvas.width / 2, canvas.height / 2 + radius - 40);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = alphas[1];
    ctx.fillText('Hold', canvas.width / 2 + radius - 40, canvas.height / 2);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = alphas[3];
    ctx.fillText('Hold', canvas.width / 2 - radius + 40, canvas.height / 2);


    requestAnimationFrame(animate);
}

animate(lastTime);