export class GameState {
    constructor(game, state) {
        this.game = game;
        this.state = state;
    }
    enter() { }
    handleInput(keyPresses) { }
}
GameState.START = 0; // Initial Screen. Enter => SERVE
GameState.SERVE = 1; // Enter => PLAY
GameState.PLAY = 2; // Point => SERVE || Any Score === Winning Score => DONE
GameState.DONE = 3; // Enter => START
export class StartGameState extends GameState {
    constructor(game) {
        super(game, GameState.START);
    }
    enter() {
        this.game.reset();
    }
    handleInput(keyPresses) {
        if (keyPresses['Enter'] === 1) {
            keyPresses['Enter'] = 0; // consume keypress
            this.game.setState(GameState.SERVE);
        }
    }
}
export class ServeGameState extends GameState {
    constructor(game) {
        super(game, GameState.SERVE);
    }
    handleInput(keyPresses) {
        if (keyPresses['Enter'] === 1) {
            keyPresses['Enter'] = 0; // consume keypress
            this.game.setState(GameState.PLAY);
        }
    }
}
export class PlayGameState extends GameState {
    constructor(game) {
        super(game, GameState.PLAY);
    }
}
export class DoneGameState extends GameState {
    constructor(game) {
        super(game, GameState.DONE);
    }
    handleInput(keyPresses) {
        if (keyPresses['Enter'] === 1) {
            keyPresses['Enter'] = 0; // consume keypress
            this.game.setState(GameState.START);
        }
    }
}
