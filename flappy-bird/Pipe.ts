export default class Pipe {
    x: number;
    y: number;
    image: HTMLImageElement;
    width: number;
    height: number;
    pipeGap: number;
    orientation: string;

    constructor(x: number, y: number, orientation: string) {
        this.x = x;
        this.y = y;
        this.image = <HTMLImageElement>document.getElementById('pipeImage');
        this.width = 70;
        this.height = 288;
        this.orientation = orientation;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        if (this.orientation === 'top') {
            // Adjust the y position of the pipe before scaling the canvas
            ctx.translate(this.x, this.y + this.height);
            ctx.scale(1, -1);
        } else {
            ctx.translate(this.x, this.y);
        }
        ctx.drawImage(this.image, 0, 0, this.width, this.height);
        ctx.restore();
    }
    
} 

