class Light {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.fillColor = 'rgb(155, 155, 155)';
        this.lightColor = 'rgb(255, 255, 255)';
        this.rayCastVisibility = new RayCastVisibility([CANVAS_WIDTH, CANVAS_HEIGHT],
            map.blocksLight.bind(map), map.setVisible.bind(map));
        this.frame = 0;
    }

    update() {
        this.x = Math.floor(Math.sin(this.frame / 50) * CANVAS_WIDTH / 3 + CANVAS_WIDTH / 2);
        this.y = Math.floor(Math.cos(this.frame / 50 + 135) * CANVAS_HEIGHT / 3 + CANVAS_HEIGHT / 2);

        // this.x = Math.floor(Math.random() * (CANVAS_WIDTH - this.radius));
        // this.y = Math.floor(Math.random() * (CANVAS_HEIGHT - this.radius));
        map.imageData = ctx.createImageData(map.width, map.height);
        
        this.rayCastVisibility.compute(this);

        this.frame++;
    }

    draw() {
        // ctx.beginPath();
        // ctx.fillStyle = this.lightColor;
        // map.visiblePoints.forEach(point => {
        //     let coords = point.split('.');
        //     ctx.fillRect(coords[0], coords[1], 1, 1);
        // });

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        ctx.fillStyle = this.fillColor;
        ctx.fill();

        // console.log(map.visiblePoints.size);
        // debugger;

    }
}