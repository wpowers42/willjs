// @ts-check

const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('canvas'));
const ctx = canvas.getContext('2d');

canvas.width = 1000;
canvas.height = canvas.width / 4;


const SLICK_CF = 0.2;
const NORMAL_CF = 0.8;

let lastTime = 0;

class Road {
    constructor() {
        this.materials = [];
        for (let i = 0; i < canvas.width; i++) {
            this.materials.push(Math.sin(i / 100) > 0.10 ? SLICK_CF : NORMAL_CF);
        }

    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        ctx.lineWidth = 4;
        let y = canvas.height - 50 + 2;
        ctx.moveTo(0, y);
        let lastMat;
        this.materials.forEach((mat, idx) => {
            ctx.lineTo(idx + 1, y);
            if (mat !== lastMat) {
                ctx.lineTo(idx + 2, y);
                ctx.stroke();
                ctx.moveTo(idx + 1, y);
                ctx.beginPath();
                ctx.strokeStyle = mat == NORMAL_CF ? 'black' : 'lightblue';
                lastMat = mat;
            }
        });
    }
}

class Car {
    constructor(index) {
        this.width = 25;
        this.height = 5;
        this.x = index * this.width * 2;
        this.y = canvas.height - this.height - 50;
        this.color = 'red';

        this.dx = 0.10;
        this.dxBreaking = this.dx * 0.01;
        this.isBreaking = false;
        this.elapsedTime = 0;
        this.startBreakTime = 2000;
    }

    update(deltaTime) {
        this.x += this.dx * deltaTime;
        this.elapsedTime += deltaTime;

        if (this.startBreakTime >= this.elapsedTime) {
            this.isBreaking = true;
        }

        if (this.isBreaking) {
            let m1 = road.materials[Math.floor(this.x)];
            let m2 = road.materials[Math.floor(this.x + this.width)];
            let cf = (m1 + m2) / 2;
            // cf = 1.0;
            this.dx = Math.max(this.dx - this.dxBreaking * cf, 0);
        }
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

const road = new Road();
const carA = new Car(0);
const carB = new Car(1);
const carC = new Car(2);
const carD = new Car(3);
const cars = [carA, carB, carC, carD];

ctx.font = '48px Courier';
ctx.textBaseline = 'top';

const dt = 1.0 / 128.0 * 1000;
let accumulator = 0;

function animate(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const deltaTime = timestamp - lastTime;
    accumulator += deltaTime;

    while (accumulator >= dt) {
        cars.forEach(car => car.update(dt));

        accumulator -= dt;
    }

    // debugger;


    road.draw(ctx);
    cars.forEach(car => car.draw(ctx));

    const delta = Math.floor(carB.x - carA.x);
    ctx.fillText(`Gap: ${delta}`, 10, 10);

    lastTime = timestamp;
    requestAnimationFrame(animate);
}

window.onload = () => animate(lastTime);


// asset pack: https://unluckystudio.com/free-game-artassets-16-side-view-cars-assets/