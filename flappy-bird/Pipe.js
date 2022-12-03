export default class Pipe {
    constructor(y, orientation) {
        this.x = 500;
        this.y = y;
        this.dx = 0.05;
        this.image = document.getElementById('pipeImage');
        this.width = 70;
        this.height = 288;
        this.orientation = orientation;
        this.markedForDeletion = false;
    }
    update(dt) {
        this.x -= this.dx * dt;
        this.markedForDeletion = this.x + this.width < 0;
    }
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        if (this.orientation === 'top') {
            ctx.scale(1, -1);
        }
        ctx.drawImage(this.image, 0, 0, this.width, this.height);
        ctx.restore();
    }
}
//# sourceMappingURL=Pipe.js.map