export default class Graphics {
    constructor(game) {
        this.game = game;
        this.background = document.getElementById('backgroundImage');
        this.ground = document.getElementById('groundImage');
    }
    update() {
    }
    draw(ctx = this.game.ctx) {
        ctx.drawImage(this.background, 0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.drawImage(this.ground, 0, ctx.canvas.height - this.ground.height);
    }
}
//# sourceMappingURL=Graphics.js.map