class Ray {
    constructor(x, y, angle) {
        this.origin = new Vector2(x, y);
        this.angle = angle;
        this.direction = new Vector2(Math.sin(angle), Math.cos(angle))
        this.maxDistance = new Vector2(0, 0).distance(new Vector2(canvas.width, canvas.height));
        this.distance = this.maxDistance;
        this.color = 'white';
        this.lineWidth = 1; 
        this.debug = [];
    }

    cast(/** @type {Wall} */ wall) {
        let [x1, y1] = [this.origin.x, this.origin.y];
        let [x2, y2] = [x1 + this.direction.x, y1 + this.direction.y];
        let [x3, y3] = [wall.a.x, wall.a.y];
        let [x4, y4] = [wall.b.x, wall.b.y];

        let denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

        if (denom == 0) {
            return;
        }

        let t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
        let u = ((x1 - x3) * (y1 - y2) - (y1 - y3) * (x1 - x2)) / denom;

        if (0 <= t & 0 <= u & u <= 1) {
            return new Vector2(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
        } else {
            return;
        }
    }

    update(x, y) {
        this.origin.x = x;
        this.origin.y = y;

        const collisions = [];
        walls.forEach(wall => {
            const collision = this.cast(wall);
            if (collision) {
                collisions.push(collision);
            }
        });

        this.distance = this.maxDistance;

        collisions.forEach(c => {
            this.distance = Math.min(this.origin.distance(c), this.distance);
        });

    }

    draw() {
        ctx.beginPath();
        ctx.lineWidth = this.lineWidth;
        ctx.strokeStyle = this.color;
        ctx.moveTo(this.origin.x, this.origin.y);
        ctx.lineTo(this.origin.x + this.distance * this.direction.x,
                   this.origin.y + this.distance * this.direction.y);
        ctx.stroke();
    }

}