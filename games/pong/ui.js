import { GameState } from "./GameState.js";

export default class UI {
    constructor(game) {
        this.game = game;
        this.fontFamily = 'PressStart2P-Regular';
        this.fontSizeS = 16;
        this.fontSizeM = 48;
        this.fontSizeL = 72;
    }

    update() {

    }

    /** @param {CanvasRenderingContext2D} ctx */
    draw(ctx) {
        ctx.fillStyle = 'white';


        ctx.textAlign = 'center';
        if (this.game.currentState.state === GameState.START) {
            // show welcome message on START state
            let top = 'Welcome to Pong!';
            let bottom = 'Press Enter to begin!';
            ctx.font = `${this.fontSizeS}px ${this.fontFamily}`;
            ctx.fillText(top, this.game.width * 0.50, 40);
            ctx.fillText(bottom, this.game.width * 0.50, 75);
        } else if (this.game.currentState.state === GameState.SERVE) {
            // show serve instructions on SERVE state
            let top = `Players ${this.game.ball.servingPlayer}'s serve!`;
            let bottom = 'Press Enter to serve!';
            ctx.font = `${this.fontSizeS}px ${this.fontFamily}`;
            ctx.fillText(top, this.game.width * 0.50, 40);
            ctx.fillText(bottom, this.game.width * 0.50, 75);
        } else if (this.game.currentState.state === GameState.DONE) {
            // show winner message on DONE state
            let top = `Player ${this.game.winningPlayer} wins!`;
            let bottom = 'Press Enter to restart!';
            ctx.font = `${this.fontSizeM}px ${this.fontFamily}`;
            ctx.fillText(top, this.game.width * 0.50, 60);
            ctx.font = `${this.fontSizeS}px ${this.fontFamily}`;
            ctx.fillText(bottom, this.game.width * 0.50, 120);
        }


        // score
        let scoreY = this.game.height * 0.30 + this.fontSizeL;
        ctx.font = `${this.fontSizeL}px ${this.fontFamily}`;
        ctx.textAlign = 'right';
        ctx.fillText(this.game.player1.score, this.game.width * 0.50 - 80, 360);
        ctx.textAlign = 'left';
        ctx.fillText(this.game.player2.score, this.game.width * 0.50 + 80, 360);

        // fps
        let fps = parseInt(1000 / (this.game.frameTimes / this.game.frames));
        ctx.font = `${this.fontSizeS}px ${this.fontFamily}`;
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgb(0,255,0,1)';
        ctx.fillText(`FPS: ${fps}`, 10, 40);
    }
}
