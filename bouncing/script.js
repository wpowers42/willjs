/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = canvas.width = 800;
const CANVAS_HEIGHT = canvas.height = 800;

const GRAVITY = 2;

class Ball {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.fillColor = 'rgb(0, 0, 0)';
        this.dy = 0;
        this.draw();
    }

    update(dt) {

        // X m/s/s * Y s => Z m/s
        let acceleration = GRAVITY * dt;

        this.dy += 0.5 * acceleration;
        // X m/s * Y s => Z m
        this.y += this.dy * ( dt / 1000 ); // dt is in ms
        this.dy += 0.5 * acceleration;

        // https://math.stackexchange.com/questions/781193/velocity-of-a-ball-when-it-hits-the-ground

        // Potential Energy = mass * gravity * height
        this.potentialEnergy = 1 * GRAVITY * (CANVAS_HEIGHT - this.y);
        
        // Kinetic Energy = 0.5 * mass * velocity * velocity
        this.kineticEnergy = 0.5 * 1 * (this.dy ** 2);

        // Initial PE = 4000 J


        // KE at ground should be = PE at top => 4000
        // sqrt(8000) => 89.4427191 m/s

        if (this.y + this.radius > CANVAS_HEIGHT) {
            // hits the floor
            this.y = CANVAS_HEIGHT - this.radius;
            this.dy = -this.dy;
        }

    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.fillColor;
        ctx.fill();
    }
}

const ball = new Ball(400, 300, 10);

let t = 0.0;
const dt = 1.0 / 60.0;
let currentTime = Date.now();
let accumulator = 0;

function animate() {

    const newTime = Date.now();
    const frameTime = newTime - currentTime;
    currentTime = newTime;
    accumulator += frameTime;

    while (accumulator >= dt) {
        ball.update(dt);

        accumulator -= dt;
        t += dt;
    }

    ctx.clearRect(0, 0, CANVAS_HEIGHT, CANVAS_HEIGHT);

    ctx.font = '48px serif';
    ctx.fillText(`PE: ${Math.round(ball.potentialEnergy)}`, 10, 50);
    ctx.fillText(`KE: ${Math.round(ball.kineticEnergy)}`, 10, 100);
    ctx.fillText(`V: ${Math.round(ball.dy / 1000)}`, 10, 150);

    ctx.beginPath();
    ctx.arc(400, 300, 10, 0, Math.PI * 2);
    ctx.fillStyle = 'rgb(255, 0, 0)';
    ctx.fill();

    ball.draw();
    requestAnimationFrame(animate);
}

animate();