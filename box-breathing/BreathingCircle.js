class BreathingCircle {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.segments = 360 * 2;
        this.lineWidth = 4;
        this.startAlpha = 1.0;
        this.endAlpha = 0.1;
        this.radiansPerSegment = Math.PI * 2 / this.segments;
        this.alphaRadians = Math.PI * 2 / 16; // 1/16 of a circle
        this.alphaSegments = this.alphaRadians / this.radiansPerSegment;
        this.alphaDecayPerSegment = (this.startAlpha - this.endAlpha) / this.alphaSegments;
        this.color = 'white';
        this.loopTimeMS = 16000;
        this.angularSpeed = Math.PI * 2 / this.loopTimeMS;
        this.baseAngle = Math.PI * 0.75; // starting angle top left
        this.angle = this.baseAngle;
        this.activeSegment = 0;
    }

    resize(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    update(timestamp) {
        let angle = -(timestamp * this.angularSpeed) % (Math.PI * 2.0) ;
        this.angle = angle + this.baseAngle;
        this.activeSegment = Math.floor(timestamp / 1000 / 4.0) % 4;
    }

    draw() {

        ctx.save();

        ctx.globalAlpha = this.startAlpha;
        ctx.lineWidth = this.lineWidth;
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;

        for (let i = 0; i < this.segments; i++) {
            ctx.beginPath();
            // negative to move counter clockwise
            let start = -i / this.segments * Math.PI * 2 - this.angle;
            let stop = -(i + 1) / this.segments * Math.PI * 2 - this.angle;
            ctx.globalAlpha = Math.max(this.startAlpha - i * this.alphaDecayPerSegment, this.endAlpha);
            ctx.arc(this.x, this.y, this.radius, start, stop, true);
            ctx.stroke();
        }

        for (let i = 0; i < 4; i++) {
            ctx.save();
            ctx.globalAlpha = this.activeSegment == i ||
                              this.activeSegment == (i - 1 + 4) % 4 ? 1.0 : 0.10;
            ctx.translate(this.x, this.y);
            ctx.rotate(Math.PI * 2 * i / 4 + this.baseAngle);
            ctx.translate(0, this.radius);
            ctx.fillRect(0, -8, 1, 16);
            ctx.restore();
        }

        ctx.restore();
    }
}