class Ball {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.e = 1.00; // coefficient of restitution
        this.fillColor = 'rgb(0, 0, 0)';
        this.dy = 0;
        this.bounceTime;
        this.draw();
        this.bounced = false;
    }

    update(dt) {

        // X m/s/s * Y s => Z m/s
        let acceleration = GRAVITY * dt / 1000 * pixelsPerMeter;

        this.dy += 0.5 * acceleration;
        // X m/s * Y s => Z m
        this.y += this.dy * (dt / 1000); // dt is in ms
        this.dy += 0.5 * acceleration;

        // https://math.stackexchange.com/questions/781193/velocity-of-a-ball-when-it-hits-the-ground

        // Potential Energy = mass * gravity * height
        this.potentialEnergy = 1 * GRAVITY * (CANVAS_HEIGHT - this.y - this.radius) / pixelsPerMeter;

        // Kinetic Energy = 0.5 * mass * velocity * velocity
        this.kineticEnergy = 0.5 * 1 * ((this.dy / pixelsPerMeter) ** 2);

        // Initial PE = 4000 J


        // KE at ground should be = PE at top => 4000
        // sqrt(8000) => 89.4427191 m/s

        if (this.y + this.radius >= CANVAS_HEIGHT) {
            // hits the floor
            this.y = CANVAS_HEIGHT - this.radius;
            this.dy = -this.dy * this.e;
            this.bounceTime = Date.now();
            this.bounced = true;
        }

    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.fillColor;
        ctx.fill();
    }
}
