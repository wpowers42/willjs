import Mathf from "../math/Mathf.js";
import Vector2 from "../math/Vector2.js";
import { GameState } from "./GameState.js";
import Audio from "./Audio.js";

export default class Ball {
    constructor(x, y, game) {
        this.game = game;
        this.width = 12;
        this.height = 12;
        this.startX = x - this.width * 0.50;
        this.startY = y - this.height * 0.50;
        this.x = this.startX;
        this.y = this.startY;
        this.startSpeed = 0.30;
        this.speed = this.startSpeed;
        this.radians;
        this.dx;
        this.dy;
        this.servingPlayer = 1;
        this.audio = new Audio();
    }

    collides(player) {
        if (this.x > player.x + player.width ||
            this.x + this.width < player.x ||
            this.y > player.y + player.height ||
            this.y + this.height < player.y) {
            return false;
        } else {
            return true;
        }
    }

    setVelocity(angle) {
        // randomly change angle by +- 1.5 degrees
        angle += Math.random() * (3 * Mathf.Deg2Rad) - (1.5 * Mathf.Deg2Rad);

        this.heading = new Vector2(Math.cos(angle), Math.sin(angle));
        this.dx = this.heading.x * this.speed;
        this.dy = this.heading.y * this.speed;
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.speed = this.startSpeed;


        let rand = Math.random() * 90 - 45;
        // use reasonable angles to start
        this.angle = this.servingPlayer === 1 ? rand : rand + 180;
        this.setVelocity(this.angle * Mathf.Deg2Rad);
    }

    update(dt) {
        this.x += this.dx * dt;
        this.y += this.dy * dt;

        // check paddle collision
        if (this.collides(this.game.player1) || this.collides(this.game.player2)) {
            this.audio.play(Audio.PaddleHit);
            let left = this.game.player1.x + this.game.player1.width;
            let right = this.game.player2.x - this.width;
            this.x = Mathf.Clamp(this.x, left, right);

            // speed up ball with each hit
            this.speed *= 1.1;

            if (this.x === left) {
                // hit left player
                this.heading = Vector2.Reflect(this.heading, Vector2.right);
                this.setVelocity(Vector2.SignedAngle(Vector2.right, this.heading) * Mathf.Deg2Rad);

            } else {
                // hit right player
                this.heading = Vector2.Reflect(this.heading, Vector2.left);
                this.setVelocity(Vector2.SignedAngle(Vector2.right, this.heading) * Mathf.Deg2Rad);
            }
        }

        // check top or bottom collision
        if (this.y <= 0 || this.y >= this.game.height - this.height) {
            this.audio.play(Audio.WallHit);
            this.heading = Vector2.Reflect(this.heading, Vector2.up);
            this.setVelocity(Vector2.SignedAngle(Vector2.right, this.heading) * Mathf.Deg2Rad);
            this.y = Mathf.Clamp(this.y, 0, this.game.height - this.height);
        }

        // check left or right edge collision
        if (this.x + this.width < 0) {
            // left edge collision, player2 scores point
            this.audio.play(Audio.Score);
            this.game.player2.score++;
            if (this.game.player2.score === this.game.scoreToWin) {
                this.game.winningPlayer = 2;
                this.game.setState(GameState.DONE);
            } else {
                this.servingPlayer = 1;
                this.game.setState(GameState.SERVE);
                this.reset();
            }
        } else if (this.x > this.game.width) {
            // left edge collision, player1 scores point
            this.audio.play(Audio.Score);
            this.game.player1.score++;
            if (this.game.player1.score === this.game.scoreToWin) {
                this.game.winningPlayer = 1;
                this.game.setState(GameState.DONE);
            } else {
                this.servingPlayer = 2;
                this.game.setState(GameState.SERVE);
                this.reset();
            }
        }

    }

    /** @param {CanvasRenderingContext2D} ctx */
    draw(ctx) {
        ctx.save();
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }
}
