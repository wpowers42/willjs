class BreathingCircle {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = 'white';
        this.loopTimeMS = 16000;
        this.angularSpeed = Math.PI * 2 / this.loopTimeMS;
        this.baseAngle = Math.PI * 1.25;
        this.angle = this.baseAngle;
        this.activeSegment = 0;
    }

    resize(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    update(timestamp) {
        this.angle = (timestamp * this.angularSpeed + this.baseAngle) % (Math.PI * 2.0);
        this.activeSegment = Math.floor(timestamp / 1000 / 4.0) % 4;
    }

    draw() {

        ctx.save();

        // Define the start and end angles for 1/4 of the circle
        const endAngle = this.angle;
        const startAngle = endAngle - Math.PI / 4.0;

        // Create a gradient for the stroke
        const gradient = ctx.createLinearGradient(
            this.x + this.radius * Math.cos(startAngle), // x start of gradient
            this.y + this.radius * Math.sin(startAngle), // y start of gradient
            this.x + this.radius * Math.cos(endAngle),   // x end of gradient
            this.y + this.radius * Math.sin(endAngle)    // y end of gradient
        );

        // Add color stops to the gradient
        gradient.addColorStop(1.00, `rgba(255, 255, 255, 1.00`);
        gradient.addColorStop(0.66, `rgba(255, 255, 255, 0.10)`);
        gradient.addColorStop(0.00, `rgba(255, 255, 255, 0.10)`);

        // Set the stroke style to the gradient
        ctx.strokeStyle = gradient;
        ctx.lineWidth = this.lineWidth;
        ctx.fillStyle = this.color;


        // Draw the arc for 1/4 of the circle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, startAngle, endAngle);

        ctx.stroke();

        ctx.strokeStyle = this.color;

        for (let i = 0; i < 4; i++) {
            ctx.save();
            ctx.globalAlpha = this.activeSegment == i ||
                this.activeSegment == (i - 1 + 4) % 4 ? 1.0 : 0.10;
            ctx.translate(this.x, this.y);
            ctx.rotate(Math.PI * 2 * i / 4 - this.baseAngle);
            ctx.translate(0, this.radius);
            ctx.fillRect(0, -8, 1, 16);
            ctx.restore();
        }

        ctx.restore();
    }
}