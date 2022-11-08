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
        if (this.frame > 0 & this.frame % 10 == 0) {
            this.x = Math.floor(Math.random() * (CANVAS_WIDTH - this.radius));
            this.y = Math.floor(Math.random() * (CANVAS_HEIGHT - this.radius));
            for (let i = 0; i < map.imageData.data.length; i += 4) {
                map.imageData.data[i + 0] = 0;    // R value
                map.imageData.data[i + 1] = 0;  // G value
                map.imageData.data[i + 2] = 0;    // B value
                map.imageData.data[i + 3] = 255;  // A value
              }
            map.visiblePoints = new Set();
            this.rayCastVisibility.compute(this);
        }

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