export default class Pipe {

    constructor(x, y, orientation) {
        this.x = x;
        this.y = y;
        this.image = document.getElementById('pipeImage');
        this.width = 70;
        this.height = 288;
        this.orientation = orientation;
    }

    draw(ctx, debug) {
        ctx.save();
        if (this.orientation === 'top') {
            // Adjust the y position of the pipe before scaling the canvas
            ctx.translate(this.x, this.y + this.height);
            ctx.scale(1, -1);
        } else {
            ctx.translate(this.x, this.y);
        }
        ctx.drawImage(this.image, 0, 0, this.width, this.height);

        if (debug) {
            ctx.strokeRect(0, 0, this.width, this.height);
        }
        ctx.restore();

    }

}