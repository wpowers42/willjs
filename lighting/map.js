class Map {
    constructor(width, height, boxes) {
        this.width = width;
        this.height = height;
        this.color = 'rgb(255,0,255)';
        this.lineWidth = 2;
        this.imageData = ctx.createImageData(width, height);
        this.boxes = boxes;
    }

    blocksLight(x, y) {
        return boxA.pointInBox(x, y) | boxB.pointInBox(x, y);
        let isBlocked = false;
        this.boxes.forEach(box => {
            if (box.pointInBox(x, y)) {
                isBlocked = true;
                return;
            }
        });
        return isBlocked;
    }

    setVisible(x, y) {
        this.imageData.data[y * this.width * 4 + x * 4 + 0] = 255;
        this.imageData.data[y * this.width * 4 + x * 4 + 1] = 255;
        this.imageData.data[y * this.width * 4 + x * 4 + 2] = 255;
        this.imageData.data[y * this.width * 4 + x * 4 + 3] = 255;
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

        this.boxes.forEach(box => box.draw());
    }
}