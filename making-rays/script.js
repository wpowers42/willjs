const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('canvas'));
const ctx = canvas.getContext('2d');
const span = /** @type {HTMLSpanElement} */ (document.getElementById('fps'));
const sliderRayCount = /** @type {HTMLSelectElement} */ (document.getElementById('dropdownRayCount'));
const sliderWallCount = /** @type {HTMLSelectElement} */ (document.getElementById('dropdownWallCount'));

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


const particle = new Particle(Math.floor(canvas.width / 2),
    Math.floor(canvas.height / 2),
    sliderRayCount.value);

sliderRayCount.addEventListener('change', e => {
    particle.rayCount = e.target.value;
    particle.createRays();
});

let walls = [...Array(sliderWallCount.value * 1).keys()].map(_ => new Wall());

sliderWallCount.addEventListener('change', e => {
    walls = [...Array(e.target.value * 1).keys()].map(_ => new Wall());
});

let now = Date.now();

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particle.update(null);
    particle.draw();

    walls.forEach(wall => wall.draw());

    let milliseconds = Date.now() - now;
    now = now + milliseconds;
    span.textContent = Math.floor(1000 / milliseconds);

    requestAnimationFrame(update);
}

update();
