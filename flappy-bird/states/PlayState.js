/*
The PlayState class is the bulk of the game, where the player actually controls the bird and
avoids pipes. When the player collides with a pipe, we should go to the GameOver state, where
we then go back to the main menu.
*/
import Bird from "../Bird.js";
import Mathf from "../../math/Mathf.js";
import PipePair from "../PipePair.js";
import BaseState from "./BaseState.js";
export default class PlayState extends BaseState {
    constructor(game) {
        super();
        this.game = game;
        this.bird = new Bird(this.game);
        this.pipePairs = [];
        this.pipePairY = this.game.height * 0.5;
        this.pipePairSpawnInterval = 2500;
        this.pipePairSpawnTimer = 0;
        this.score = 0;
    }
    enter(enterParams) {
        if (enterParams && 'state' in enterParams) {
            let state = enterParams['state'];
            // restore prior state
            this.bird = state.bird;
            this.pipePairs = state.pipePairs;
            this.pipePairY = state.pipePairY;
            this.pipePairSpawnInterval = state.pipePairSpawnInterval;
            this.pipePairSpawnTimer = state.pipePairSpawnTimer;
            this.score = state.score;
        }
    }
    exit() { }
    update(dt) {
        this.pipePairSpawnTimer += dt;
        if (this.pipePairSpawnTimer > this.pipePairSpawnInterval) {
            this.pipePairY = Mathf.Clamp(this.pipePairY + Math.random() * 40 - 20, this.game.height * 0.25, this.game.height * 0.75);
            this.pipePairs.push(new PipePair(this, this.pipePairY));
            this.pipePairs = this.pipePairs.filter(pipePair => !pipePair.markedForDeletion);
            this.pipePairSpawnTimer -= this.pipePairSpawnInterval;
            // make next PipePair slightly random
            this.pipePairSpawnInterval = Math.random() * 1000 + 2000;
        }
        this.bird.update(dt);
        this.pipePairs.forEach(pipePair => {
            pipePair.update(dt, this.bird, this.game.stateMachine);
            pipePair.pipes.forEach(pipe => {
                if (this.bird.collides(pipe)) {
                    this.game.audio.play('explosion');
                    this.game.audio.play('hurt');
                    this.game.stateMachine.change('score', {
                        score: this.score,
                    });
                }
                ;
            });
            if (!pipePair.scored) {
                if (pipePair.x + pipePair.pipeWidth < this.bird.x) {
                    this.game.audio.play('score');
                    this.score++;
                    pipePair.scored = true;
                }
            }
        });
        if (this.bird.y + this.bird.height > this.game.height) {
            this.game.audio.play('explosion');
            this.game.audio.play('hurt');
            this.game.stateMachine.change('score', {
                score: this.score,
            });
        }
        if (this.game.input.isKeyPressed('Enter')) {
            this.game.stateMachine.change('paused', {
                state: this
            });
        }
    }
    draw(ctx) {
        this.pipePairs.forEach(pipePair => pipePair.draw(ctx, this.game.debug));
        this.bird.draw(ctx, this.game.debug);
        ctx.textAlign = 'left';
        ctx.font = this.game.fonts.medium;
        ctx.fillText(`Score: ${this.score}`, 8, 24);
    }
}
//# sourceMappingURL=PlayState.js.map