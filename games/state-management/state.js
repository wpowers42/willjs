import Player from "./player.js";

export const states = {
    STANDING_LEFT: 0,
    STANDING_RIGHT: 1,
    SITTING_LEFT: 2,
    SITTING_RIGHT: 3,
    RUNNING_LEFT: 4,
    RUNNING_RIGHT: 5,
    JUMPING_LEFT: 6,
    JUMPING_RIGHT: 7,
    FALLING_LEFT: 8,
    FALLING_RIGHT: 9
}

export class State {
    constructor(state) {
        this.state = state;
        this.frameY;
        this.frames;
        this.dx = 0;
    }

    enter() {
        this.player.frameY = this.frameY;
        this.player.frames = this.frames;
        this.player.dx = this.dx;
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
        if (input === 'PRESS left') {
            this.player.setState(states.RUNNING_LEFT);
        } else if (input === 'PRESS right') {
            this.player.setState(states.RUNNING_RIGHT);
        } else if (input === 'PRESS down') {
            this.player.setState(states.SITTING_LEFT);
        } else if (input === 'PRESS up') {
            this.player.setState(states.JUMPING_LEFT);
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
            this.player.setState(states.RUNNING_LEFT);
        } else if (input === 'PRESS right') {
            this.player.setState(states.RUNNING_RIGHT);
        } else if (input === 'PRESS down') {
            this.player.setState(states.SITTING_RIGHT);
        } else if (input === 'PRESS up') {
            this.player.setState(states.JUMPING_RIGHT);
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
        if (input === 'PRESS left') {
            this.player.setState(states.RUNNING_LEFT);
        } else if (input === 'PRESS right') {
            this.player.setState(states.RUNNING_RIGHT);
        } else if (input === 'RELEASE down') {
            this.player.setState(states.STANDING_LEFT);
        } else if (input === 'PRESS up') {
            this.player.setState(states.JUMPING_LEFT);
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
            this.player.setState(states.RUNNING_LEFT);
        } else if (input === 'PRESS right') {
            this.player.setState(states.RUNNING_RIGHT);
        } else if (input === 'RELEASE down') {
            this.player.setState(states.STANDING_RIGHT);
        } else if (input === 'PRESS up') {
            this.player.setState(states.JUMPING_RIGHT);
        }
    }
}

export class RunningLeft extends State {
    constructor(player) {
        super('RUNNING_LEFT');
        this.player = player;
        this.frameY = 7;
        this.frames = 9;
        this.dx = -this.player.maxDX;
    }

    enter() {
        super.enter();
    }

    /** @param {string} input */
    handleInput(input) {
        if (input === 'PRESS right') {
            this.player.setState(states.RUNNING_RIGHT);
        } else if (input === 'RELEASE left') {
            this.player.setState(states.STANDING_LEFT);
        } else if (input === 'PRESS down') {
            this.player.setState(states.SITTING_LEFT);
        } else if (input === 'PRESS up') {
            this.player.setState(states.JUMPING_LEFT);
        }
    }
}

export class RunningRight extends State {
    constructor(player) {
        super('RUNNING_RIGHT');
        this.player = player;
        this.frameY = 6;
        this.frames = 9;
        this.dx = this.player.maxDX;
    }

    enter() {
        super.enter();
    }

    /** @param {string} input */
    handleInput(input) {
        if (input === 'PRESS left') {
            this.player.setState(states.RUNNING_LEFT);
        } else if (input === 'RELEASE right') {
            this.player.setState(states.STANDING_RIGHT);
        } else if (input === 'PRESS down') {
            this.player.setState(states.SITTING_RIGHT);
        } else if (input === 'PRESS up') {
            this.player.setState(states.JUMPING_RIGHT);
        }
    }
}

export class JumpingLeft extends State {
    constructor(player) {
        super('JUMPING_LEFT');
        this.player = player;
        this.frameY = 3;
        this.frames = 7;
        this.dx = -this.player.maxDX * 0.5;
        this.dy = -this.player.maxDY;
    }

    enter() {
        super.enter();
        if (this.player.onGround()) {
            this.player.dy = this.dy;
        }
    }

    /** @param {string} input */
    handleInput(input) {
        if (input === 'PRESS right') {
            this.player.setState(states.JUMPING_RIGHT);
        } else if (this.player.onGround()) {
            this.player.setState(states.STANDING_LEFT);
        } else if (this.player.dy >= 0) {
            this.player.setState(states.FALLING_LEFT);
        }
    }
}

export class JumpingRight extends State {
    constructor(player) {
        super('JUMPING_RIGHT');
        this.player = player;
        this.frameY = 2;
        this.frames = 7;
        this.dx = this.player.maxDX * 0.5;
        this.dy = -this.player.maxDY;
    }

    enter() {
        super.enter();
        if (this.player.onGround()) {
            this.player.dy = this.dy;
        }
    }

    /** @param {string} input */
    handleInput(input) {
        if (input === 'PRESS left') {
            this.player.setState(states.JUMPING_LEFT);
        } else if (this.player.onGround()) {
            this.player.setState(states.STANDING_RIGHT);
        } else if (this.player.dy >= 0) {
            this.player.setState(states.FALLING_RIGHT);
        }
    }
}

export class FallingLeft extends State {
    constructor(player) {
        super('FALLING_LEFT');
        this.player = player;
        this.frameY = 5;
        this.frames = 7;
        this.dx = -this.player.maxDX * 0.5;
    }

    enter() {
        super.enter();
    }

    /** @param {string} input */
    handleInput(input) {
        if (input === 'PRESS right') {
            this.player.setState(states.FALLING_RIGHT);
        } else if (this.player.onGround()) {
            this.player.setState(states.STANDING_LEFT);
        }
    }
}

export class FallingRight extends State {
    constructor(player) {
        super('FALLING_RIGHT');
        this.player = player;
        this.frameY = 4;
        this.frames = 7;
        this.dx = this.player.maxDX * 0.5;
    }

    enter() {
        super.enter();
    }

    /** @param {string} input */
    handleInput(input) {
        if (input === 'PRESS left') {
            this.player.setState(states.FALLING_LEFT);
        } else if (this.player.onGround()) {
            this.player.setState(states.STANDING_RIGHT);
        }
    }
}
