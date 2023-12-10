class BreathingCircle {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
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
        let angle = -(timestamp * this.angularSpeed) % (Math.PI * 2.0);
        this.angle = angle + this.baseAngle;
        this.activeSegment = Math.floor(timestamp / 1000 / 4.0) % 4;
    }

    draw() {

        ctx.save();


        // Define the start and end angles for 1/4 of the circle
        const startAngle = -this.angle - Math.PI / 2;
        const endAngle = startAngle + Math.PI / 2;

        // Create a gradient for the stroke
        const gradient = ctx.createLinearGradient(
            this.x + this.radius * Math.cos(startAngle), // x start of gradient
            this.y + this.radius * Math.sin(startAngle), // y start of gradient
            this.x + this.radius * Math.cos(endAngle),   // x end of gradient
            this.y + this.radius * Math.sin(endAngle)    // y end of gradient
        );

        // Add color stops to the gradient
        gradient.addColorStop(1, `rgba(255, 255, 255, ${this.startAlpha})`);
        gradient.addColorStop(.75, `rgba(255, 255, 255, 0.1)`); // Fade to transparent
        gradient.addColorStop(0, `rgba(255, 255, 255, 0)`); // Fade to transparent

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
            ctx.rotate(Math.PI * 2 * i / 4 + this.baseAngle);
            ctx.translate(0, this.radius);
            ctx.fillRect(0, -8, 1, 16);
            ctx.restore();
        }

        ctx.restore();
    }
}