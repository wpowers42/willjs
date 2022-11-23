const states = {
    STANDING: 0,
    SITTING: 1,
    RUNNING: 2,
    JUMPING: 3,
    FALLING: 4
}

class State {
    constructor(state) {
        this.state = state;
        this.player;
        this.frameY;
        this.frames;
        this.dx;
        this.dy;
    }

    enter() {
        this.player.frameX = 0;
        this.player.frameY = this.frameY;
        this.player.frames = this.frames;
        this.player.dx = this.dx;
        this.player.dy = this.dy;
    }
}

export class StandingState extends State {
    constructor(player) {
        super('STANDING');
        this.player = player;
        this.frameY = 0;
        this.frames = 7;
        this.dx = 0;
        this.dy = 0;
    }

    enter() {
        super.enter();
    }

    /** @param {Array<string>} input */
    handleInput(input) {
        if (input.includes('ArrowDown')) {
            this.player.setState(states.SITTING);
        } else if (input.includes('ArrowLeft') || input.includes('ArrowRight')) {
            this.player.setState(states.RUNNING);
        } else if (input.includes('ArrowUp')) {
            this.player.setState(states.JUMPING);
        }
    }
}

export class SittingState extends State {
    constructor(player) {
        super('SITTING');
        this.player = player;
        this.frameY = 5;
        this.frames = 5;
        this.dx = 0;
        this.dy = 0;
    }

    enter() {
        super.enter();
    }

    /** @param {Array<string>} input */
    handleInput(input) {
        if (!input.includes('ArrowDown')) {
            this.player.setState(states.STANDING);
        }
    }
}

export class RunningState extends State {
    constructor(player) {
        super('RUNNING');
        this.player = player;
        this.frameY = 3;
        this.frames = 9;
        this.dx = this.player.maxDX;
        this.dy = 0;
    }

    enter() {
        super.enter();
    }

    /** @param {Array<string>} input */
    handleInput(input) {
        if (input.includes('ArrowUp')) {
            this.player.setState(states.JUMPING);
        } else if (!input.includes('ArrowLeft') && !input.includes('ArrowRight')) {
            this.player.setState(states.STANDING);
        } else if (input.includes('ArrowLeft') && !input.includes('ArrowRight')) {
            this.player.dx = -this.player.maxDX;
        } else if (input.includes('ArrowRight') && !input.includes('ArrowLeft')) {
            this.player.dx = this.player.maxDX;
        } else if (input.includes('ArrowRight') && input.includes('ArrowLeft')) {
            this.player.setState(states.STANDING);
        }
    }
}

export class JumpingState extends State {
    constructor(player) {
        super('JUMPING');
        this.player = player;
        this.frameY = 1;
        this.frames = 7;
        this.dx = this.player.dx;
        this.maxDX = this.player.maxDX * 0.75;
        this.dy = -this.player.maxDY;
    }

    enter() {
        super.enter();
    }

    /** @param {Array<string>} input */
    handleInput(input) {
        this.dx = 0;

        if (input.includes('ArrowLeft')) {
            this.dx -= this.maxDX;
        }

        if (input.includes('ArrowRight')) {
            this.dx += this.maxDX;
        }

        this.player.dx = this.dx;

        if (this.player.dy >= 0) {
            this.player.setState(states.FALLING);
        }
    }
}

export class FallingState extends State {
    constructor(player) {
        super('FALLING');
        this.player = player;
        this.frameY = 2;
        this.frames = 7;
        this.dx = this.player.dx;
        this.maxDX = this.player.maxDX * 0.75;
        this.dy = this.player.dy;
    }

    enter() {
        super.enter();
    }

    /** @param {Array<string>} input */
    handleInput(input) {
        this.dx = 0;

        if (input.includes('ArrowLeft')) {
            this.dx -= this.maxDX;
        }

        if (input.includes('ArrowRight')) {
            this.dx += this.maxDX;
        }

        this.player.dx = this.dx;

        if (this.player.onGround()) {
            this.player.setState(states.STANDING);
        }
    }
}
