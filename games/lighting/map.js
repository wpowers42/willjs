class Map {
    constructor(width, height, boxCount) {
        this.width = width;
        this.height = height;
        this.color = 'rgb(255,0,255)';
        this.lineWidth = 2;
        this.imageData = ctx.createImageData(width, height);
        this.boxCount = boxCount;
        this.coords;
        this.boxes;
        this.setUpCoords();
        this.createBoxes();
    }

    createBoxes() {
        this.boxes = [];
        let boxesCreated = 0;
        let maxWidth = 300;
        let maxHeight = 300;
        while (boxesCreated < this.boxCount) {
            let x = Math.floor(Math.random() * this.width);
            let y = Math.floor(Math.random() * this.height);
            let w = Math.min(Math.floor(Math.random() * (this.width - x)), maxWidth);
            let h = Math.min(Math.floor(Math.random() * (this.height - y)), maxHeight);

            let box = new Box(x, y, w, h);
            this.boxes.push(box);
            this.addBox(box);
            boxesCreated++;
        }
        
    }

    moveBox(box, newX, newY) {
        this.removeBox(box);
        box.x = newX;
        box.y = newY;
        this.addBox(box);
    }

    setUpCoords() {
        this.coords = [...Array(this.height).keys()].map(_ => [...Array(this.width).keys()].map(_ => 0));
    }

    addBox(box) {

        for (let x = box.x; x < box.x + box.width; x++) {
            for (let y = box.y; y < box.y + box.height; y++) {
                this.coords[x][y]++;
            }
        }

    }

    removeBox(box) {
        
        for (let x = box.x; x < box.x + box.width; x++) {
            for (let y = box.y; y < box.y + box.height; y++) {
                this.coords[x][y]--;
            }
        }
    }

    blocksLight(x, y) {

        return this.coords[x][y] > 0;
        
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