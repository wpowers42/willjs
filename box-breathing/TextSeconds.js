class TextSeconds {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.spacing = 32;
        this.font = '24px Courier';
        this.activeAlpha = 1.0;
        this.inactiveAlpha = 0.1;
        this.activeSecond = 1;
        this.color = 'white';
    }

    resize(x, y, _) {
        this.x = x;
        this.y = y;
    }

    update(timestamp) {
        this.activeSecond = Math.floor(timestamp / 1000 % 4) + 1;
    }

    draw() {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.font = this.font;
        for (let i = 1; i < 5; i++) {
            ctx.globalAlpha = this.activeSecond == i ? this.activeAlpha : this.inactiveAlpha;
            let x = this.x + (i - 1) * this.spacing - this.spacing * 1.5;
            ctx.fillText(i, x, this.y);
        }
        ctx.restore();
    }
}
