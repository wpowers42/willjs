/*
The PlayState class is the bulk of the game, where the player actually controls the bird and
avoids pipes. When the player collides with a pipe, we should go to the GameOver state, where
we then go back to the main menu.
*/

import Game from "../Game";
import Bird from "../Bird.js";
import Mathf from "../../math/Mathf.js";
import PipePair from "../PipePair.js";
import BaseState from "./BaseState.js";

export default class PlayState extends BaseState {
    game: Game;
    ctx: any;
    bird: Bird;
    pipePairs: any[];
    pipePairY: number;
    pipePairSpawnInterval: number;
    pipePairSpawnTimer: number;
    constructor(game: Game) {

        super();
        this.game = game;
        this.bird = new Bird(this.game);
        this.pipePairs = [];
        this.pipePairY = this.game.height * 0.5;
        this.pipePairSpawnInterval = 2500;
        this.pipePairSpawnTimer = 0;
    }
    enter(enterParams) { }
    exit() { }
    update(dt: number) {
        this.pipePairSpawnTimer += dt;
        if (this.pipePairSpawnTimer > this.pipePairSpawnInterval) {
            this.pipePairY = Mathf.Clamp(this.pipePairY + Math.random() * 40 - 20,
                this.game.height * 0.25, this.game.height * 0.75);
            this.pipePairs.push(new PipePair(this.game, this.pipePairY));
            this.pipePairs = this.pipePairs.filter(pipePair => !pipePair.markedForDeletion);
            this.pipePairSpawnTimer -= this.pipePairSpawnInterval;
        }

        this.bird.update(dt);
        this.pipePairs.forEach(pipePair => pipePair.update(dt, this.bird, this.game.stateMachine));

        if (this.bird.y + this.bird.height > this.game.height) {
            this.game.stateMachine.change('title');
        }

    }

    draw(ctx: CanvasRenderingContext2D) {
        this.pipePairs.forEach(pipePair => pipePair.draw(ctx, this.game.debug));
        this.bird.draw(ctx, this.game.debug);
    }
}
