class Map {
    constructor(width, height, boxCount) {
        this.width = width;
        this.height = height;
        this.color = 'rgb(255,0,255)';
        this.lineWidth = 2;
        this.imageData = ctx.createImageData(width, height);
        this.boxCount = boxCount;
        this.boxes = [];
        this.setUpBoxes();
        this.coords = [];
        this.setUpCoords();
    }

    setUpBoxes() {
        let boxesCreated = 0;
        let maxWidth = 300;
        let maxHeight = 300;
        while (boxesCreated < this.boxCount) {
            let x = Math.floor(Math.random() * this.width);
            let y = Math.floor(Math.random() * this.height);
            let w = Math.min(Math.floor(Math.random() * (this.width - x)), maxWidth);
            let h = Math.min(Math.floor(Math.random() * (this.height - y)), maxHeight);

            this.boxes.push(new Box(x, y, w, h));
            boxesCreated++;
        }
        
    }

    setUpCoords() {
        // TODO: things break in blocksLight if I remove the + 1 from the x loop.
        for (let x = 0; x < this.width + 1; x++) {
            for (let y = 0; y < this.height; y++) {
                if(typeof this.coords[x] == 'undefined'){
                    this.coords[x] = [];
                 }
                 if (this._blocksLight(x, y)) {
                    this.coords[x][y] = 1;
                 } else {
                    this.coords[x][y] = 0;
                 }
            }
        }
    }

    blocksLight(x, y) {
        return this.coords[x][y] == 1;
    }

    _blocksLight(x, y) {
        let isBlocked = false;
        this.boxes.forEach(box => {
            if (box.pointInBox(x, y)) {
                isBlocked = true;
                return;
            }
        });
        return isBlocked;
    }

    setVisible(x, y) {
        this.imageData.data[y * this.width * 4 + x * 4 + 0] = 255;
        this.imageData.data[y * this.width * 4 + x * 4 + 1] = 255;
        this.imageData.data[y * this.width * 4 + x * 4 + 2] = 255;
        this.imageData.data[y * this.width * 4 + x * 4 + 3] = 255;
    }
    
    draw() {
        ctx.putImageData(this.imageData, 0, 0);
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        ctx.rect(0 + this.lineWidth / 2,
            0 + this.lineWidth / 2,
            this.width - this.lineWidth,
            this.height - this.lineWidth);
        ctx.stroke();

        this.boxes.forEach(box => box.draw());
    }
}