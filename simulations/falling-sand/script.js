// 1. Group related constants
const DISPLAY = {
    WIDTH: 1200,
    HEIGHT: 800,
    CELL_SIZE: 1
};

const GRID = {
    WIDTH: DISPLAY.WIDTH / DISPLAY.CELL_SIZE,
    HEIGHT: DISPLAY.HEIGHT / DISPLAY.CELL_SIZE
};

const SAND = {
    COLOR: 0xFF000000,
    SPAWN_PROBABILITY: 0.10,
    BLAST_RADIUS: 32
};

// 2. Create a SandSimulation class to encapsulate related functionality
class SandSimulation {
    constructor(canvas) {
        this.ctx = canvas.getContext('2d');
        this.imageData = this.ctx.createImageData(DISPLAY.WIDTH, DISPLAY.HEIGHT);
        this.nextImageData = this.ctx.createImageData(DISPLAY.WIDTH, DISPLAY.HEIGHT);
        this.pixels = new Uint32Array(this.imageData.data.buffer);
        this.nextPixels = new Uint32Array(this.nextImageData.data.buffer);
        
        // state
        this.spawnSand = false;
        this.mouseX = 0;
        this.mouseY = 0;
    }

    safeGet(buffer, x, y) {
        if (x < 0 || x >= GRID.WIDTH || y < 0 || y >= GRID.HEIGHT) {
            return undefined;
        }
        return buffer[y * DISPLAY.WIDTH + x];
    }

    spawnSandAt(x, y) {
        for (let dx = -SAND.BLAST_RADIUS; dx <= SAND.BLAST_RADIUS; dx++) {
            for (let dy = -SAND.BLAST_RADIUS; dy <= SAND.BLAST_RADIUS; dy++) {
                const newX = x + dx;
                const newY = y + dy;
                const inCircle = dx * dx + dy * dy <= SAND.BLAST_RADIUS * SAND.BLAST_RADIUS;
                
                if (newX >= 0 && newX < GRID.WIDTH && 
                    newY >= 0 && newY < GRID.HEIGHT && 
                    inCircle &&
                    Math.random() < SAND.SPAWN_PROBABILITY && 
                    this.pixels[newY * DISPLAY.WIDTH + newX] === 0) {
                        this.pixels[newY * DISPLAY.WIDTH + newX] = SAND.COLOR;
                }
            }
        }
    }

    update() {
        // Clear next buffer
        this.nextPixels.fill(0);

        if (this.spawnSand) {
            this.spawnSandAt(this.mouseX, this.mouseY);
        }

        // Update sand
        for (let y = GRID.HEIGHT - 1; y >= 0; y--) {
            const dir = Math.random() < 0.5 ? -1 : 1;
            const startX = dir === -1 ? GRID.WIDTH - 1 : 0;
            const endX = dir === -1 ? 0 : GRID.WIDTH - 1;
            
            for (let x = startX; x * dir <= endX; x += dir) {
                this.updateSandParticle(x, y, dir);
            }
        }

        // Swap buffers
        [this.pixels, this.nextPixels] = [this.nextPixels, this.pixels];
        [this.imageData, this.nextImageData] = [this.nextImageData, this.imageData];
    }

    updateSandParticle(x, y, dir) {
        if (this.pixels[y * DISPLAY.WIDTH + x] !== SAND.COLOR) return;

        const below = this.safeGet(this.nextPixels, x, y + 1);
        const belowA = this.safeGet(this.nextPixels, x - dir, y + 1);
        const belowB = this.safeGet(this.nextPixels, x + dir, y + 1);
        
        if (below === 0) {
            this.nextPixels[(y + 1) * DISPLAY.WIDTH + x] = SAND.COLOR;
        } else if (belowA === 0) {
            this.nextPixels[(y + 1) * DISPLAY.WIDTH + (x - dir)] = SAND.COLOR;
        } else if (belowB === 0) {
            this.nextPixels[(y + 1) * DISPLAY.WIDTH + (x + dir)] = SAND.COLOR;
        } else {
            this.nextPixels[y * DISPLAY.WIDTH + x] = SAND.COLOR;
        }
    }

    render() {
        this.ctx.putImageData(this.imageData, 0, 0);
    }

    windowToCanvas(x, y) {
        return {
            x: (x - this.ctx.canvas.offsetLeft) / this.ctx.canvas.width * DISPLAY.WIDTH,
            y: (y - this.ctx.canvas.offsetTop) / this.ctx.canvas.height * DISPLAY.HEIGHT
        };
    }

    handleMouseMove(event) {
        const { x, y } = this.windowToCanvas(event.clientX, event.clientY);
        this.mouseX = Math.floor(x - 0.5);
        this.mouseY = Math.floor(y - 0.5);
    }

    handleMouseDown() {
        this.spawnSand = true;
    }

    handleMouseUp() {
        this.spawnSand = false;
    }
}

// 3. Setup and main loop
const canvas = document.getElementById('canvas');
canvas.width = DISPLAY.WIDTH;
canvas.height = DISPLAY.HEIGHT;

const simulation = new SandSimulation(canvas);

canvas.addEventListener('mousemove', e => simulation.handleMouseMove(e));
canvas.addEventListener('mousedown', () => simulation.handleMouseDown());
canvas.addEventListener('mouseup', () => simulation.handleMouseUp());

// add fps counter with smoothing
let lastTime = 0;
let fps = 0;

function main() {
    simulation.update();
    simulation.render();
    
    const deltaTime = performance.now() - lastTime;
    fps = 0.95 * fps + 0.05 * (1000 / deltaTime);
    document.getElementById('fps').innerText = fps.toFixed(2);
    lastTime = performance.now();
    
    requestAnimationFrame(main);
}

main();
