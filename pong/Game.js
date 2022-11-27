import Ball from "./Ball.js";
import InputHandler from "./input.js";
import { Player1, Player2 } from "./Paddle.js";
import UI from "./ui.js"

class GameState {
    static START = 0;
    static PLAY = 1;

    constructor(state) {
        this.state = state;
    }
}

class StartGameState extends GameState {
    /** @param {Game} game */
    constructor(game) {
        super(GameState.START);
        this.game = game;
    }

    enter() {
        this.game.player1 = new Player1(15, 20, this.game);
        this.game.player2 = new Player2(this.game.width - 15, this.game.height - 20, this.game);
        this.game.ball = new Ball(this.game.width * 0.50, this.game.height * 0.50, this.game);
        this.game.gameObjects = [this.game.player1, this.game.player2, this.game.ball];
        this.game.paused = true;
        this.game.t = 0;
        this.game.fps = 60;
        this.game.dt = 1000 / this.game.fps;
        this.game.accumulator = 0;
        this.game.currentTime = performance.now();
    }
}

class PlayGameState extends GameState {
    /** @param {Game} game */
    constructor(game) {
        super(GameState.PLAY);
        this.game = game;
    }

    enter() {
        this.game.paused = false;
    }
}

export default class Game {

    constructor(ctx) {
        this.ctx = ctx;
        this.width = this.ctx.canvas.width;
        this.height = this.ctx.canvas.height;
        this.paused = false;
        this.gameOver = false;

        this.inputHandler = new InputHandler();
        this.inputMap = {
            START: 'Enter',
            PLAY: ' ', // space
        }
        this.ui = new UI(this);

        this.states = [new StartGameState(this), new PlayGameState(this)];
        this.currentState;
        this.setState(GameState.START);
    }

    update() {
        let newTime = performance.now();
        let frameTime = newTime - this.currentTime;
        this.currentTime = newTime;
        this.#handleInput(this.inputHandler.keys);

        if (!this.paused) {
            this.accumulator += frameTime;
            while (this.accumulator >= this.dt) {
                this.gameObjects.forEach(object => object.update(this.dt));
                this.accumulator -= this.dt;
                this.t += this.dt;
            }
        }

    }

    draw() {
        this.gameObjects.forEach(object => object.draw(this.ctx));
        this.ui.draw(this.ctx);
    }

    setState(state) {
        this.currentState = this.states[state];
        // debugger;
        this.currentState.enter();
    }

    /** @param {Array<number>} keys */
    #handleInput(keys) {
        switch (this.currentState.state) {
            case GameState.START:
                if (keys.includes(this.inputMap.PLAY)) {
                    this.setState(GameState.PLAY);
                    break;
                }
                break;
            case GameState.PLAY:
                if (keys.includes(this.inputMap.START)) {
                    this.setState(GameState.START);
                    break;
                }
                break;

        }

    }

}
