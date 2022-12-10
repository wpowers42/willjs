class Wall {
    constructor(x1, y1, x2, y2) {
        this.a = new Vector2(Math.random() * canvas.width, Math.random() * canvas.height);
        this.b = new Vector2(Math.random() * canvas.width, Math.random() * canvas.height);
        this.lineWidth = 2;
        this.color = 'orange';
    }

    draw() {
        ctx.beginPath();
        ctx.lineWidth = this.lineWidth;
        ctx.strokeStyle = this.color;
        ctx.moveTo(this.a.x, this.a.y);
        ctx.lineTo(this.b.x, this.b.y);
        ctx.stroke();
    }
}