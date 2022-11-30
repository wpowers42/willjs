export class GameState {
    static START = 0; // Initial Screen. Enter => SERVE
    static SERVE = 1; // Enter => PLAY
    static PLAY = 2; // Point => SERVE || Any Score === Winning Score => DONE
    static DONE = 3; // Enter => START

    constructor(state) {
        this.state = state;
    }

    enter() { }

    handleInput() { }
}

export class StartGameState extends GameState {
    /** @param {Game} game */
    constructor(game) {
        super(GameState.START);
        this.game = game;
    }

    enter() {
        this.game.reset();
    }

    /** @param {Object} keyPresses */
    handleInput(keyPresses) {
        if (keyPresses['Enter'] === 1) {
            keyPresses['Enter'] = 0; // consume keypress
            this.game.setState(GameState.SERVE);
        }
    }
}

export class ServeGameState extends GameState {
    /** @param {Game} game */
    constructor(game) {
        super(GameState.SERVE);
        this.game = game;
    }

    /** 
     * @param {Object} keyPresses
     */
    handleInput(keyPresses) {
        if (keyPresses['Enter'] === 1) {
            keyPresses['Enter'] = 0; // consume keypress
            this.game.setState(GameState.PLAY);
        }
    }
}

export class PlayGameState extends GameState {
    /** @param {Game} game */
    constructor(game) {
        super(GameState.PLAY);
        this.game = game;
    }
}


export class DoneGameState extends GameState {
    /** @param {Game} game */
    constructor(game) {
        super(GameState.DONE);
        this.game = game;
    }

    /** @param {Object} keyPresses */
    handleInput(keyPresses) {
        if (keyPresses['Enter'] === 1) {
            keyPresses['Enter'] = 0; // consume keypress
            this.game.setState(GameState.START);
        }
    }
}
