import Game from "./game.js";

class Layer {
    /** @param {Game} game */
    constructor(game, width, height, speedModifier, image) {
        this.game = game;
        this.width = width;
        this.height = height;
        this.speedModifier = speedModifier;
        this.image = image;
        this.x = 0;
        this.y = 0;
    }

    /** @param {number} dt */
    update(dt = this.game.dt) {
        this.x -= this.game.backgroundSpeed * this.speedModifier * dt;

        if (this.x < 0 - this.width) {
            this.x += this.width;
        }
    }

    /** @param {CanvasRenderingContext2D} ctx */
    draw(ctx = this.game.ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.x + this.width - 1, this.y, this.width, this.height);
    }
}

export default class Background {
    /** @param {Game} game */
    constructor(game) {
        this.game = game;
        this.width = 1667;
        this.height = 500;
        this.globalSpeedModifier = 0.10;
        this.layers = []
        this.#createLayers();
    }

    #createLayers() {
        for (let i = 1; i < 6; i++) {
            let image = document.getElementById(`backgroundLayer${i}`);
            this.layers.push(new Layer(this.game, this.width, this.height, this.globalSpeedModifier * i, image));
        }
    }

    update() {
        this.layers.forEach(layer => layer.update());
    }

    draw() {
        this.layers.forEach(layer => layer.draw());
    }
}
