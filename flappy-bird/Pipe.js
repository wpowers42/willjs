export default class Pipe {
    constructor(game) {
        this.game = game;
        this.x = this.game.width;
        this.y = Math.random() * this.game.height * 0.20 + this.game.height * 0.50; // top of the bottom section of the pipe
        this.dx = 0.05;
        this.image = document.getElementById('pipeImage');
        this.spriteWidth = this.image.width;
        this.spriteHeight = this.image.height;
        this.width = this.spriteWidth * 0.50;
        this.height = this.spriteWidth * 0.50;
        this.pipeGap = 75;
        this.markedForDeletion = false;
    }
    update(dt) {
        this.x -= this.dx * dt;
        this.markedForDeletion = this.x + this.width < 0;
    }
    draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y);
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(1, -1);
        ctx.drawImage(this.image, 0, this.pipeGap);
        ctx.restore();
    }
}
//# sourceMappingURL=Pipe.js.map