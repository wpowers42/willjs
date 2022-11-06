const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('canvas'));
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = canvas.width = 800;
const CANVAS_HEIGHT = canvas.height = 700;

const slider = /** @type {HTMLInputElement} */ (document.getElementById('slider'));
const showGameSpeed = /** @type {HTMLSpanElement} */ (document.getElementById('showGameSpeed'));

let gameSpeed = slider.value;

slider.addEventListener('change', e => {
    gameSpeed = e.target.value;
    showGameSpeed.textContent = gameSpeed;
});


class Layer {
    constructor(image, speedModifier) {
        this.image = image;
        this.speedModifier = speedModifier;
        this.speed = gameSpeed * speedModifier;
        this.width = 2400;
        this.height = 700;
        this.x = 0;
        this.y = 0;
    }

    update() {
        this.speed = gameSpeed * this.speedModifier;
        this.x -= this.speed;

        if (this.x < -this.width) {
            this.x += this.width;
        }
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y);
        ctx.drawImage(this.image, this.x + this.width, this.y);
    }
}

const backgroundLayers = [];
for (let i = 1; i < 6; i++) {
    let image = new Image();
    image.src = `./backgroundLayers/layer-${i}.png`;
    let layer = new Layer(image, i / 5);
    backgroundLayers.push(layer);
}

function animate() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    backgroundLayers.forEach((layer, _) => {
        layer.update();
        layer.draw();
    });
    requestAnimationFrame(animate);
}


animate();