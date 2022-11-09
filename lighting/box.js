class Box {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.fillColor = 'rgb(255,0,0)';
        this.strokeColor = 'rgb(255,255,255)';
        this.isMoving = false;
        this.mouseOffsetX = 0;
        this.mouseOffsetY = 0;
    }

    pointInBox(x, y) {
        const xLine = x >= this.x & x <= this.x + this.width;
        const yLine = y >= this.y & y <= this.y + this.height;

        return xLine & yLine;
    }

    update() {
        
    }

    draw() {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = this.fillColor;
        ctx.fill();
        ctx.strokeStyle = this.strokeColor;
        ctx.stroke();
    }
}