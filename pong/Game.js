import Ball from "./Ball.js";
import InputHandler from "./input.js";
import { Player1, Player2 } from "./Paddle.js";
import { GameState, StartGameState, ServeGameState, PlayGameState, DoneGameState } from "./GameState.js";
import UI from "./ui.js"

export default class Game {

    constructor(ctx) {
        this.ctx = ctx;
        this.width = this.ctx.canvas.width;
        this.height = this.ctx.canvas.height;
        this.gameOver = false;
        this.scoreToWin = 11;

        this.player1 = new Player1(this);
        this.player2 = new Player2(this);
        this.ball = new Ball(this.width * 0.50, this.height * 0.50, this);
        this.gameObjects = [this.player1, this.player2];

        this.inputHandler = new InputHandler();
        this.ui = new UI(this);

        this.states = [new StartGameState(this), new ServeGameState(this),
        new PlayGameState(this), new DoneGameState(this)];
        this.currentState;
        this.setState(GameState.START);
    }

    reset() {
        this.winningPlayer = undefined;
        this.player1.reset();
        this.player2.reset();
        this.ball.reset();
        this.t = 0;
        this.fps = 60;
        this.dt = 1000 / this.fps;
        this.accumulator = 0;
        this.currentTime = performance.now();
        this.frameTimes = 0;
        this.frames = 0;
    }

    update() {
        let newTime = performance.now();
        let frameTime = newTime - this.currentTime;
        this.currentTime = newTime;

        if (this.frames >= 60) {
            this.frameTimes -= this.frameTimes / this.frames;
            this.frames -= 1;
        }
        this.frameTimes += frameTime;
        this.frames += 1;

        
        this.accumulator += frameTime;
        while (this.accumulator >= this.dt) {
            this.currentState.handleInput(this.inputHandler.keyPresses);
            this.player1.update(this.dt);
            this.player2.update(this.dt);
            if (this.currentState.state === GameState.PLAY) {
                this.ball.update(this.dt);
            }
            this.accumulator -= this.dt;
            this.t += this.dt;
        }

    }

    draw() {
        this.player1.draw(this.ctx);
        this.player2.draw(this.ctx);
        this.ball.draw(this.ctx);
        this.ui.draw(this.ctx);
    }

    setState(state) {
        this.currentState = this.states[state];
        this.currentState.enter();
    }

}
