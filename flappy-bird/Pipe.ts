export default class Pipe {
    x: number;
    y: number;
    image: HTMLImageElement;
    width: number;
    height: number;
    pipeGap: number;
    orientation: string;

    constructor(y: number, orientation: string) {
        this.y = y;
        this.image = <HTMLImageElement>document.getElementById('pipeImage');
        this.width = 70;
        this.height = 288;
        this.orientation = orientation;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, this.y);
        if (this.orientation === 'top') {
            ctx.scale(1, -1);
        }
        ctx.drawImage(this.image, 0, 0, this.width, this.height);
        ctx.restore();
    }
}
