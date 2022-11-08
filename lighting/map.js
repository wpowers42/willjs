class Map {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.color = 'rgb(255,0,255)';
        this.lineWidth = 2;
        this.visiblePoints = new Set();
        this.imageData = ctx.createImageData(width, height);
    }

    blocksLight(x, y) {
        return boxA.pointInBox(x, y) | boxB.pointInBox(x, y);
    }

    setVisible(x, y) {
        this.imageData.data[y * this.width * 4 + x * 4 + 0] = 255;
        this.imageData.data[y * this.width * 4 + x * 4 + 1] = 255;
        this.imageData.data[y * this.width * 4 + x * 4 + 2] = 255;
        this.imageData.data[y * this.width * 4 + x * 4 + 3] = 255;
        this.visiblePoints.add(`${x}.${y}`);
    }
    
    draw() {

        ctx.putImageData(this.imageData, 0, 0);
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        ctx.rect(0 + this.lineWidth / 2,
            0 + this.lineWidth / 2,
            this.width - this.lineWidth,
            this.height - this.lineWidth);
        ctx.stroke();
    }
}