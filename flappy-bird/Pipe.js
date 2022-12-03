export default class Pipe {
    constructor(y, orientation) {
        this.x = 500;
        this.y = y;
        this.image = document.getElementById('pipeImage');
        this.width = 70;
        this.height = 288;
        this.orientation = orientation;
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