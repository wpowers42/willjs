class Particle {

    constructor(x, y, rayCount) {
        this.origin = new Vector2(x, y);
        this.destination = this.origin;
        this.radius = 4;
        this.color = 'black';
        this.rayCount = rayCount;
        this.rays = [];
        this.createRays();
        this.speed = 1.5;
    }

    createRays() {

        this.rays = [];
        for (let i = 0; i < this.rayCount; i++) {
            this.rays.push(new Ray(this.origin.x, this.origin.y, i * Math.PI * 2 / this.rayCount));
        }

    }


    update() {

        if (this.destination.x - this.origin.x < 0.05 & this.destination.y - this.origin.y < 0.05) {
            let newX = Math.floor(Math.random() * (canvas.width - this.radius / 2));
            let newY = Math.floor(Math.random() * (canvas.height - this.radius / 2));
            this.destination = new Vector2(newX, newY);
            this.direction = new Vector2(newX - this.origin.x, newY - this.origin.y).normalize();
        }

        let step = Math.min(this.speed, this.origin.distance(this.destination));

        this.origin.x += this.direction.x * step;
        this.origin.y += this.direction.y * step;

        this.rays.forEach(ray => ray.update(this.origin.x, this.origin.y));

    }

    draw() {
        this.rays.forEach(ray => ray.draw());

        ctx.beginPath();
        ctx.arc(this.origin.x, this.origin.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.destination.x, this.destination.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'yellow';
        ctx.fill();
    }
}
