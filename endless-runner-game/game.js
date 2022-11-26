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
        this.fps = 60;
        this.dt = 1000 / this.fps;
        this.currentTime = performance.now();
        this.accumulator = 0;
        this.paused = false;
        this.groundMargin = 80;
        this.backgroundSpeed = 0;
        this.minBackgroundSpeed = 0.75;
        this.maxBackgroundSpeed = 1.5;
        this.particles = [];
        this.collisions = [];
        this.enemies = [];
        this.floatingMessages = [];
        this.player = new Player(this);
        this.input = new InputHandler(this);
        this.background = new Background(this);
        this.enemyInterval = 2000;
        this.enemyTimer = 0;
        this.#addEnemy();
        this.debug = false;
        this.score = 0;
        this.maxTime = 60000;
        this.lives = 5;
        this.gameOver = false;
        this.frameTimes = [];
        this.UI = new UI(this);

        document.addEventListener('blur', _ => this.paused = true);
        document.addEventListener('focus', _ => {
            this.currentTime = performance.now();
            this.paused = false;
        });
    }

    reset() {
        this.t = 0;
        this.currentTime = performance.now();
        this.accumulator = 0;
        this.paused = false;
        this.player = new Player(this);
        this.background = new Background(this);
        this.enemyTimer = 0;
        this.particles = [];
        this.collisions = [];
        this.enemies = [];
        this.floatingMessages = [];
        this.lives = 5;
        this.gameOver = false;
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
        this.collisions.forEach(collision => collision.update());
        this.floatingMessages.forEach(floatingMessage => floatingMessage.update(this.dt));

        this.enemyTimer += this.dt;
        if (this.enemyTimer > this.enemyInterval) {
            this.#addEnemy();
            this.enemyTimer = 0;
        }
    }

    update() {
        let newTime = performance.now();
        let frameTime = newTime - this.currentTime;
        this.frameTimes.push(frameTime);
        if (this.frameTimes.length > 120) {
            this.frameTimes.shift();
        }
        this.currentTime = newTime;
        this.accumulator += frameTime;

        
        while (this.accumulator >= this.dt) {
            this.step();
            this.accumulator -= this.dt;
            this.t += this.dt;
            // gameOver because of time or lives
            this.gameOver = this.t >= this.maxTime || this.gameOver;
        }
        
        this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
        this.particles = this.particles.filter(particle => !particle.markedForDeletion);
        this.collisions = this.collisions.filter(collision => !collision.markedForDeletion);
        this.floatingMessages = this.floatingMessages.filter(floatingMessage => !floatingMessage.markedForDeletion);
    }

    draw() {
        this.background.draw();
        this.particles.forEach(particle => particle.draw());
        this.collisions.forEach(collision => collision.draw());
        this.enemies.forEach(enemy => enemy.draw());
        this.floatingMessages.forEach(floatingMessage => floatingMessage.draw(this.ctx));
        this.UI.draw();
        this.player.draw();
    }
}
