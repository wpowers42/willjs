import { Vector } from '../engine/core/Vector.js';

// setup canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// setup canvas size
canvas.width = 800;
canvas.height = 600;

// outline canvas
ctx.strokeRect(0, 0, canvas.width, canvas.height);

class Creature {
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

    addForce(force) {
        this.acceleration.add(force);
    }

    flap() {
        this.addForce(this.flapForce);
    }

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

    render() {
        // draw a line from the cycle position to the current position
        this.ctx.beginPath();
        this.ctx.moveTo(this.cyclePosition.x, this.cyclePosition.y);
        this.ctx.lineTo(this.position.x, this.position.y);
        this.ctx.strokeStyle = `hsl(${this.hue % 360}, 100%, 50%)`;
        this.ctx.stroke();
    }
}

function animate() {
    creature.update();
    creature.render();
    requestAnimationFrame(animate);
}

const gravity = new Vector(0, 0.05);
const wind = new Vector(0.0, 0);

const creature = new Creature(ctx, [gravity, wind]);

animate();