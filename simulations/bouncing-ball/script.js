const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = canvas.width = window.innerWidth;
const CANVAS_HEIGHT = canvas.height = window.innerHeight;

let t = 0.0;
const dt = 1.0 / 128.0;
let currentTime = Date.now();
let accumulator = 0;

let gravity = 0.001;

// create an widget on the canvas to control the gravity
const gravityWidget = document.createElement('input');
gravityWidget.type = 'range';
gravityWidget.min = 0;
gravityWidget.max = 0.01;
gravityWidget.step = 0.0001;
gravityWidget.value = gravity;
gravityWidget.style.position = 'absolute';
gravityWidget.style.top = '10px';
gravityWidget.style.left = '10px';
gravityWidget.style.width = '200px';
gravityWidget.style.height = '20px';
gravityWidget.style.zIndex = 100;
document.body.appendChild(gravityWidget);

gravityWidget.addEventListener('input', (e) => {
    gravity = parseFloat(e.target.value);
}
);



class Ball {
    constructor() {
        this.radius = 10;
        this.x = CANVAS_WIDTH / 2 - this.radius;
        this.y = CANVAS_HEIGHT / 2;
        this.fillColor = 'rgb(0, 0, 0)';
        this.dy = 0;
    }

    update(dt) {

        this.y += this.dy * dt;
        this.dy += gravity * dt;

        if (this.y + this.radius < 0) {
            // hits the ceiling
            this.y = this.radius;
            this.dy = 0;
        }

        if (this.y + this.radius >= CANVAS_HEIGHT) {
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

const ball = new Ball();

const animate = () => {
    const newTime = Date.now();
    const frameTime = newTime - currentTime;
    currentTime = newTime;
    accumulator += frameTime;

    while (accumulator >= dt) {
        ball.update(dt);
        accumulator -= dt;
        t += dt;
    }

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ball.draw();
    requestAnimationFrame(animate);
}

animate();
