import Player from "./player.js";

export const states = {
    STANDING_LEFT: 0,
    STANDING_RIGHT: 1,
    SITTING_LEFT: 2,
    SITTING_RIGHT: 3,
    RUNNING_LEFT: 4,
    RUNNING_RIGHT: 5
}

export class State {
    constructor(state) {
        this.state = state;
        this.frameY;
        this.frames;
    }

    enter() {
        this.player.frameY = this.frameY;
        this.player.frames = this.frames;
    }

    handleInput() { }
}

export class StandingLeft extends State {
    /** @param {Player} player */
    constructor(player) {
        super('STANDING_LEFT');
        this.player = player;
        this.frameY = 1;
        this.frames = 7;
    }

    enter() {
        super.enter();
    }

    /** @param {string} input */
    handleInput(input) {
        if (input === 'PRESS right') {
            this.player.setState(states.STANDING_RIGHT);
        } else if (input === 'PRESS down') {
            this.player.setState(states.SITTING_LEFT);
        }
    }
}

export class StandingRight extends State {
    constructor(player) {
        super('STANDING_RIGHT');
        this.player = player;
        this.frameY = 0;
        this.frames = 7;
    }

    enter() {
        super.enter();
    }

    /** @param {string} input */
    handleInput(input) {
        if (input === 'PRESS left') {
            this.player.setState(states.STANDING_LEFT);
        } else if (input === 'PRESS down') {
            this.player.setState(states.SITTING_RIGHT);
        }
    }
}

export class SittingLeft extends State {
    constructor(player) {
        super('SITTING_LEFT');
        this.player = player;
        this.frameY = 9;
        this.frames = 5;
    }

    enter() {
        super.enter();
    }

    /** @param {string} input */
    handleInput(input) {
        if (input === 'PRESS right') {
            this.player.setState(states.SITTING_RIGHT);
        } else if (input === 'PRESS up') {
            this.player.setState(states.STANDING_LEFT);
        } else if (input === 'RELEASE down') {
            // set state to StandingLeft
            this.player.setState(states.STANDING_LEFT);
        }
    }
}

export class SittingRight extends State {
    constructor(player) {
        super('SITTING_RIGHT');
        this.player = player;
        this.frameY = 8;
        this.frames = 5;
    }

    enter() {
        super.enter();
    }

    /** @param {string} input */
    handleInput(input) {
        if (input === 'PRESS left') {
            this.player.setState(states.SITTING_LEFT);
        } else if (input === 'PRESS up') {
            // set state to StandingLeft
            this.player.setState(states.STANDING_RIGHT);
        } else if (input === 'RELEASE down') {
            // set state to StandingLeft
            this.player.setState(states.STANDING_RIGHT);
        }
    }
}
