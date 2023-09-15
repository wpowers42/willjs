import type Game from "./Game";
import type { keyPresses } from "./input";

export class GameState {
    static START = 0; // Initial Screen. Enter => SERVE
    static SERVE = 1; // Enter => PLAY
    static PLAY = 2; // Point => SERVE || Any Score === Winning Score => DONE
    static DONE = 3; // Enter => START

    state: number;
    game: Game;

    constructor(game: Game, state: number) {
        this.game = game;
        this.state = state;
    }

    enter() { }

    handleInput(keyPresses: keyPresses) { }
}

export class StartGameState extends GameState {

    constructor(game: Game) {
        super(game, GameState.START);
    }

    enter() {
        this.game.reset();
    }


    handleInput(keyPresses: keyPresses) {
        if (keyPresses['Enter'] === 1) {
            keyPresses['Enter'] = 0; // consume keypress
            this.game.setState(GameState.SERVE);
        }
    }
}

export class ServeGameState extends GameState {

    constructor(game: Game) {
        super(game, GameState.SERVE);
    }

    handleInput(keyPresses: keyPresses) {
        if (keyPresses['Enter'] === 1) {
            keyPresses['Enter'] = 0; // consume keypress
            this.game.setState(GameState.PLAY);
        }
    }
}

export class PlayGameState extends GameState {

    constructor(game: Game) {
        super(game, GameState.PLAY);
    }
}


export class DoneGameState extends GameState {

    constructor(game: Game) {
        super(game, GameState.DONE);
    }

    handleInput(keyPresses: keyPresses) {
        if (keyPresses['Enter'] === 1) {
            keyPresses['Enter'] = 0; // consume keypress
            this.game.setState(GameState.START);
        }
    }
}
