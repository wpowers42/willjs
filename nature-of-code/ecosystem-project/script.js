import { Vector } from '../engine/v1/core/Vector.js';

/** @type {HTMLCanvasElement} */
const canvas = document.createElement("canvas");
canvas.id = "canvas";
document.body.appendChild(canvas);


const ctx = canvas.getContext("2d");
if (!ctx) {
    throw new Error("Could not get canvas context");
}

// setup canvas size
canvas.width = 800;
canvas.height = 600;

// outline canvas
ctx.strokeRect(0, 0, canvas.width, canvas.height);

class Creature {
    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {Vector[]} forces
     */
    constructor(ctx, forces) {
        this.ctx = ctx;
        this.position = new Vector(0, ctx.canvas.height / 2);
        this.velocity = new Vector(0.5, 0);
        this.acceleration = new Vector(0, 0);
        this.radius = 5;
        this.forces = forces;
        this.flapForce = new Vector(0, -0.10);
        this.maxSpeed = 20;
        this.hue = 0;
        this.cyclePosition = new Vector(this.ctx.canvas.width / 2, 0);
    }

    /**
     * @param {Vector} force
     */
    addForce(force) {
        this.acceleration.add(force);
    }

    /**
     * @returns {void}
     */
    flap() {
        this.addForce(this.flapForce);
    }

    /**
     * @returns {void}
     */
    update() {
        this.forces.forEach(force => {
            this.addForce(force);
        });
        if (this.position.y / this.ctx.canvas.height >= Math.sqrt(Math.random())) {
            this.flap();
        }
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.position.add(this.velocity);
        this.acceleration.mult(0);

        if (this.position.x >= this.ctx.canvas.width) {
            this.position.x = 0;
            // this.cyclePosition = Vector.copy(this.position);
            this.hue = this.hue + 20;
        }
    }

    /**
     * @returns {void}
     */
    render() {
        // draw a line from the cycle position to the current position
        this.ctx.beginPath();
        this.ctx.moveTo(this.ctx.canvas.width / 2, this.ctx.canvas.height / 2);
        const randX = Math.random() * this.ctx.canvas.width;
        const randY = Math.random() * this.ctx.canvas.height;
        this.ctx.lineTo(randX, randY);
        this.ctx.strokeStyle = `hsl(${this.hue % 360}, 100%, 50%)`;
        this.ctx.stroke();
    }
}

function animate() {
    for (let i = 0; i < 100; i++) {
        creature.update();
        creature.render();
    }
    requestAnimationFrame(animate);
}

const gravity = new Vector(0, 0.01);
const wind = new Vector(0.0, 0);

const creature = new Creature(ctx, [gravity, wind]);

animate();