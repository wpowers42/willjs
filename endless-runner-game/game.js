import InputHandler from "./input.js";
import Player from "./player.js";
import Background from "./background.js";
import { FlyingEnemy, GroundEnemy, ClimbingEnemy } from "./enemy.js";

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
        this.groundMargin = 80;
        this.backgroundSpeed = 0;
        this.minBackgroundSpeed = 0.75;
        this.maxBackgroundSpeed = 1.5;
        this.player = new Player(this);
        this.enemies = [];
        this.input = new InputHandler();
        this.background = new Background(this);
        this.enemyInterval = 2000;
        this.enemyTimer = 0;
        this.#addEnemy();
    }

    #addEnemy() {
        if (this.backgroundSpeed > 0 && Math.random() > 0.50) {
            this.enemies.push(new GroundEnemy(this));
        } else {
            // this.enemies.push(new ClimbingEnemy(this));
        }

        this.enemies.push(new FlyingEnemy(this));
        this.enemies.sort((a, b) => a.y - b.y);
        this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
    }

    step() {
        this.player.update();
        this.enemies.forEach(enemy => enemy.update());
        this.background.update();

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

        while (this.accumulator >= this.dt) {
            this.step();
            this.accumulator -= this.dt;
            this.t += this.dt;
        }

        // console.log(this.enemies.length);
        // console.log(this.player.dx, this.player.currentState);
        // console.log(this.player.dx);
        // console.log(this.player.currentState.state);
        // console.log(this.player.x, this.player.y);
        // console.log(this.input.keys);

    }

    draw() {
        this.background.draw();
        this.enemies.forEach(enemy => enemy.draw());
        this.player.draw();
    }
}
