"use strict";

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let radius = Math.min(canvas.width, canvas.height) / 2 * 0.90;

const breathingCircle = new BreathingCircle(canvas.width / 2, canvas.height / 2, radius);
const textSeconds = new TextSeconds();
const textInstructions = new TextInstructions(radius);
let objects = [breathingCircle, textSeconds, textInstructions];

window.addEventListener('resize', _ => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    radius = Math.min(canvas.width, canvas.height) / 2 * 0.90;
    let centerX = canvas.width / 2;
    let centerY = canvas.height / 2;
    objects.forEach(object => object.resize(centerX, centerY, radius));
});


function animate(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    objects.forEach(object => object.update(timestamp));
    objects.forEach(object => object.draw());
    requestAnimationFrame(animate);
}

animate(0);
