class TextInstructions {
    constructor(radius) {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.radius = radius;
        this.font = '24px Courier';
        this.activeAlpha = 1.0;
        this.inactiveAlpha = 0.15;
        this.color = 'white';
        this.activeSegment = 0;
    }

    resize(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    update(timestamp) {
        this.activeSegment = Math.floor(timestamp / 1000 / 4.0) % 4;
    }

    draw() {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.font = this.font;

        let instructions = [
            ['Breathe In', this.x, this.y - this.radius + 32, 'center', 'top'],
            ['Hold', this.x + this.radius - 16, this.y, 'right', 'center'],
            ['Breathe Out', this.x, this.y + this.radius - 32, 'center', 'bottom'],
            ['Hold', this.x - this.radius + 16, this.y, 'left', 'center']
        ];

        for (let i = 0; i < 4; i++) {
            ctx.save();
            ctx.globalAlpha = this.activeSegment == i ? this.activeAlpha : this.inactiveAlpha;
            let [message, x, y, textAlign, textBaseline] = instructions[i];
            ctx.textAlign = textAlign;
            ctx.textBaseline = textBaseline;
            ctx.fillText(message, x, y);
            ctx.restore();
        }

        ctx.restore();
    }
}
