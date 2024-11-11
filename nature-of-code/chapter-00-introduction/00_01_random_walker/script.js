import { canvas } from "../../shared/js/utils.js";

// setup canvas and context
const canvasElement = canvas.create(800, 600);
document.body.appendChild(canvasElement);
const ctx = canvasElement.getContext("2d");
ctx.canvas.style.backgroundColor = "white";

class Walker {
    constructor(ctx) {
        this.ctx = ctx;
        this.width = ctx.canvas.width;
        this.height = ctx.canvas.height;
        this.x = this.width / 2;
        this.y = this.height / 2;
        this.steps = 0;
        this.colorChangeRate = 360;
    }

    update() {
        const dx = Math.floor(Math.random() * 3);
        const dy = Math.floor(Math.random() * 3);
        switch (dx) {
            case 0:
                this.x += 1;
                break;
            case 1:
                this.x -= 1;
                break;
            case 2:
                this.x += 0;
                break;
        }
        switch (dy) {
            case 0:
                this.y += 1;
                break;
            case 1:
                this.y -= 1;
                break;
            case 2:
                this.y += 0;
                break;
        }

        this.steps++;

        // if out of bounds, wrap around
        if (this.x < 0) this.x = this.width;
        if (this.x > this.width) this.x = 0;
        if (this.y < 0) this.y = this.height;
        if (this.y > this.height) this.y = 0;
    }

    render() {
        // color based on modulus of steps and cycling through hues
        const hue = Math.floor(this.steps / this.colorChangeRate) % 360;
        this.ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        this.ctx.fillRect(this.x, this.y, 1, 1);
    }
}



const walker = new Walker(ctx);

function animate() {
    // ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < 100; i++) {
        walker.update();
        walker.render();
    }
    requestAnimationFrame(animate);
}

animate();