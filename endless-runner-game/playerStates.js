import { Dust, Fire } from "./particles.js";

const states = {
    STANDING: 0,
    SITTING: 1,
    RUNNING: 2,
    JUMPING: 3,
    FALLING: 4,
    ROLLING: 5,
    DIVING: 6,
    HIT: 7,
}

class State {
    constructor(state, player) {
        this.state = state;
        this.player = player;
        this.game = this.player.game;
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
    constructor(game) {
        super('STANDING', game);
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
        } else if (input.includes('ArrowUp')) {
            this.player.setState(states.JUMPING);
        } else if (input.includes('ArrowLeft') && !input.includes('ArrowRight')) {
            this.player.setState(states.RUNNING);
        } else if (input.includes('ArrowRight') && !input.includes('ArrowLeft')) {
            this.player.setState(states.RUNNING);
        }
    }
}

export class SittingState extends State {
    constructor(game) {
        super('SITTING', game);
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
        if (input.includes('Enter')) {
            this.player.setState(states.ROLLING);
        } else if (!input.includes('ArrowDown')) {
            this.player.setState(states.STANDING);
        }
    }
}

export class RunningState extends State {
    constructor(game) {
        super('RUNNING', game);
        this.frameY = 3;
        this.frames = 9;
        this.dx = this.player.maxDX;
        this.dy = 0;
        this.particleInterval = 32;
        this.particleTimer = 0;
    }

    enter() {
        super.enter();
    }

    /** @param {Array<string>} input */
    handleInput(input) {
        this.particleTimer += this.game.dt;
        if (this.particleTimer >= this.particleInterval) {
            this.game.particles.push(new Dust(this.game, this.player.x + this.player.width * 0.65,
                                              this.player.y + this.player.height));
            this.particleTimer -= this.particleInterval;
        }
        if (input.includes('ArrowUp')) {
            this.player.setState(states.JUMPING);
        } else if (input.includes('Enter')) {
            this.player.setState(states.ROLLING);
        } else if (input.includes('ArrowLeft') && !input.includes('ArrowRight')) {
            this.player.dx = -this.player.maxDX;
        } else if (input.includes('ArrowRight') && !input.includes('ArrowLeft')) {
            this.player.dx = this.player.maxDX;
        } else {
            this.player.setState(states.STANDING);
        }
    }
}

export class JumpingState extends State {
    constructor(game) {
        super('JUMPING', game);
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
        if (input.includes('Enter')) {
            this.player.setState(states.ROLLING);
        } else if (this.player.dy >= 0) {
            this.player.setState(states.FALLING);
        } else if (input.includes('ArrowLeft') && !input.includes('ArrowRight')) {
            this.player.dx = -this.maxDX;
        } else if (input.includes('ArrowRight') && !input.includes('ArrowLeft')) {
            this.player.dx = this.maxDX;
        } else {
            this.player.dx = 0;
        }
    }
}

export class FallingState extends State {
    constructor(game) {
        super('FALLING', game);
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
        if (this.player.onGround()) {
            this.player.setState(states.STANDING);
        } else if (input.includes('Enter')) {
            this.player.setState(states.ROLLING);
        } else if (input.includes('ArrowLeft') && !input.includes('ArrowRight')) {
            this.player.dx = -this.maxDX;
        } else if (input.includes('ArrowRight') && !input.includes('ArrowLeft')) {
            this.player.dx = this.maxDX;
        } else {
            this.player.dx = 0;
        }
    }
}

export class RollingState extends State {
    constructor(game) {
        super('ROLLING', game);
        this.frameY = 6;
        this.frames = 7;
        this.dx = this.player.dx;
        this.maxDX = this.player.maxDX * 2.00;
        this.dy = this.player.dy;
        this.maxDY = this.player.maxDY;
        this.particleInterval = 32;
        this.particleTimer = 0;
    }
    
    enter() {
        super.enter();
    }

    /** @param {Array<string>} input */
    handleInput(input) {
        this.particleTimer += this.game.dt;
        if (this.particleTimer >= this.particleInterval) {
            this.game.particles.push(new Fire(this.game, this.player.x + this.player.width * 0.50,
                                              this.player.y + this.player.height * 0.50));
            this.particleTimer -= this.particleInterval;
        }
        if (!input.includes('Enter') && this.player.onGround()) {
            this.player.setState(states.RUNNING);
        } else if (!input.includes('Enter') && !this.player.onGround()) {
            this.player.setState(states.FALLING);
        } else if (input.includes('ArrowUp') && this.player.onGround()) {
            this.player.dy = -this.maxDY;
        } else if (input.includes('ArrowLeft') && !input.includes('ArrowRight')) {
            this.player.dx = -this.maxDX;
        } else if (input.includes('ArrowRight') && !input.includes('ArrowLeft')) {
            this.player.dx = this.maxDX;
        } else {
            this.player.dx = 0;
        }
    }
}
