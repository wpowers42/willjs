class Light {
    constructor(x, y) {

        this.x = x;
        this.y = y;
        this.radius = 10;
        this.fillColor = 'rgb(155, 155, 155)';
        this.lightColor = 'rgb(255, 255, 255)';
        this.rayCastVisibility = new RayCastVisibility([CANVAS_WIDTH, CANVAS_HEIGHT],
            map.blocksLight.bind(map), map.setVisible.bind(map));
        this.isMoving = false;
        this.update();

    }

    pointInArc(x, y) {

        // TODO: Add a cheaper rect check first
        return (x - this.x) ** 2 + (y - this.y) ** 2 < this.radius ** 2;

    }

    update() {

        map.imageData = ctx.createImageData(map.width, map.height);
        this.rayCastVisibility.compute(this);

    }

    draw() {

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        ctx.fillStyle = this.fillColor;
        ctx.fill();

    }
}
