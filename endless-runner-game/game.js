import InputHandler from "./input.js";
import Player from "./player.js";
import Background from "./background.js";
import { FlyingEnemy, GroundEnemy, ClimbingEnemy } from "./enemy.js";
import UI from "./ui.js";

export default class Game {
    /** 
     * @param {CanvasRenderingContext2D} ctx
     **/
    constructor(ctx) {
        this.ctx = ctx;
        this.width = this.ctx.canvas.width;
        this.height = this.ctx.canvas.height;
        this.t = 0;
        this.dt = 0.01;
        this.currentTime = performance.now();
        this.accumulator = 0;
        this.paused = false;
        this.groundMargin = 80;
        this.backgroundSpeed = 0;
        this.minBackgroundSpeed = 0.75;
        this.maxBackgroundSpeed = 1.5;
        this.particles = [];
        this.player = new Player(this);
        this.enemies = [];
        this.input = new InputHandler(this);
        this.background = new Background(this);
        this.enemyInterval = 2000;
        this.enemyTimer = 0;
        this.#addEnemy();
        this.debug = false;
        this.score = 0;
        this.UI = new UI(this);

        document.addEventListener('blur', _ => this.paused = true);
        document.addEventListener('focus', _ => {
            this.currentTime = performance.now();
            this.paused = false;
        });
    }

    #addEnemy() {
        if (this.backgroundSpeed > 0 && Math.random() < 0.50) {
            this.enemies.push(new GroundEnemy(this));
        }

        if (Math.random() < 0.25) {
            this.enemies.push(new ClimbingEnemy(this));
        }

        this.enemies.push(new FlyingEnemy(this));
        this.enemies.sort((a, b) => a.y - b.y);
    }

    step() {
        this.player.update();
        this.enemies.forEach(enemy => enemy.update());
        this.background.update();
        this.particles.forEach(particle => particle.update());

        this.enemyTimer += this.dt;
        if (this.enemyTimer > this.enemyInterval) {
            this.#addEnemy();
            this.enemyTimer = 0;
        }
    }

    update() {
        let newTime = performance.now();
        let frameTime = newTime - this.currentTime;
        this.currentTime = newTime;
        this.accumulator += frameTime;

        this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
        this.particles = this.particles.filter(particle => !particle.markedForDeletion);

        while (this.accumulator >= this.dt) {
            this.step();
            this.accumulator -= this.dt;
            this.t += this.dt;
        }
    }

    draw() {
        this.background.draw();
        this.particles.forEach(particle => particle.draw());
        this.UI.draw();
        this.enemies.forEach(enemy => enemy.draw());
        this.player.draw();
    }
}
