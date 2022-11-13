/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = canvas.width = 800;
const CANVAS_HEIGHT = canvas.height = 800;

const GRAVITY = 10;


const ball = new Ball(400, 300, 10);

const balls = [];
const ballCount = 80;

for (let i = 0; i < ballCount; i++) {
    balls.push(new Ball(i * CANVAS_WIDTH / ballCount, i * CANVAS_HEIGHT / ballCount , 10));
}

let t = 0.0;
const dt = 1.0 / 128.0;
let currentTime = Date.now();
let accumulator = 0;

// 227 px per inch
// 0.0254 inches per meter
// 8937 px per meter
// const pixelsPerMeter = 8937;
const pixelsPerMeter = 100;

let velocity = 0;
let maxVelocity = 0;
let minPE = Infinity;
let maxKE = 0;

function formatNumber(number, digits) {
    number = Math.round(number);
    return String(number).padStart(digits, ' ');
}

function animate() {

    const newTime = Date.now();
    const frameTime = newTime - currentTime;
    currentTime = newTime;
    accumulator += frameTime;

    while (accumulator >= dt) {
        for (const ball of balls) {
            ball.update(dt);
        }

        accumulator -= dt;
        t += dt;

        // velocity = Math.abs(ball.dy / pixelsPerMeter);
        // maxVelocity = Math.max(velocity, maxVelocity);

        // minPE = Math.min(ball.potentialEnergy, minPE);
        // maxKE = Math.max(ball.kineticEnergy, maxKE);
    }


    // if (ball.bounced) {
    //     ball.bounced = false;
    // }

    ctx.clearRect(0, 0, CANVAS_HEIGHT, CANVAS_HEIGHT);

    for (const ball of balls) {
        ball.draw();
    }
    // ctx.font = '20px Courier';
    // ctx.fillText(`PE: ${formatNumber(ball.potentialEnergy, 4)}`, 10, 20);
    // ctx.fillText(`Min PE: ${formatNumber(minPE, 4)} J`, 140, 20);

    // ctx.fillText(`KE: ${formatNumber(ball.kineticEnergy, 4)}`, 10, 40);
    // ctx.fillText(`Max KE: ${formatNumber(maxKE, 4)} J`, 140, 40);

    // ctx.fillText(`PE+KE: ${formatNumber(ball.kineticEnergy + ball.potentialEnergy, 4)} J`, 320, 40);

    // ctx.fillText(`Velocity: ${formatNumber(velocity, 3)} m/s`, 10, 60);
    // ctx.fillText(`Max Velocity: ${formatNumber(maxVelocity, 3)} m/s`, 10, 80);

    // ctx.fillText(`Height: ${formatNumber((CANVAS_HEIGHT - ball.y - ball.radius) / pixelsPerMeter, 3)} meters`, 320, 80);

    // let timeSinceBounce;

    // if (ball.bounceTime) {
    //     timeSinceBounce = ( Date.now() - ball.bounceTime ) / 1000;
    //     ctx.fillText(`Seconds since bouce: ${formatNumber(timeSinceBounce, 3)} s`, 10, 100);
    // }


    // ctx.beginPath();
    // ctx.arc(400, 300, 10, 0, Math.PI * 2);
    // ctx.fillStyle = 'rgb(255, 0, 0)';
    // ctx.fill();

    // ball.draw();
    requestAnimationFrame(animate);
}

animate();