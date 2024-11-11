import { canvas } from "../../shared/js/utils.js";

const canvasElement = canvas.create(800, 600);
document.body.appendChild(canvasElement);
const ctx = canvasElement.getContext("2d");

class Plotter {
    constructor(ctx) {
        this.ctx = ctx;
        this.numberOfBins = 20;
        this.x = 30;
        this.y = this.ctx.canvas.height - 30;
        this.width = this.ctx.canvas.width - this.x - 30;
        this.bins = Array(this.numberOfBins).fill(0);
        this.binWidth = this.width / this.numberOfBins;
        this.minBinHeight = 100;
        this.maxBinHeight = this.y;
        this.maxBinValue = 0;
        this.binHeightScale = 0.8;
        this.binHeightRatio = 1 * this.binHeightScale;
    }

    update() {
        const randomNumber = Math.floor(Math.random() * this.numberOfBins);
        this.bins[randomNumber]++;
        this.maxBinValue = Math.max(this.maxBinValue, this.bins[randomNumber], this.minBinHeight);
        this.binHeightRatio = this.maxBinHeight / this.maxBinValue * this.binHeightScale;
    }

    render() {
        // render the bins as a bar chart
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // scale the bins to the height of the canvas
        const scaledBins = this.bins.map(bin => bin * this.binHeightRatio);

        // draw the bins
        scaledBins.forEach((bin, index) => {
            const x = index * this.binWidth + this.x;
            const y = this.y - bin;

            // outline the bins in black
            this.ctx.strokeRect(x, y, this.binWidth, bin);
            // fill the bins with a light green color
            this.ctx.fillStyle = "lightgreen";
            this.ctx.fillRect(x + 1, y + 1, this.binWidth - 2, bin - 2);

            // show the percentage of the total samples for each bin
            const percentage = (this.bins[index] / this.bins.reduce((a, b) => a + b, 0)) * 100;
            this.ctx.fillStyle = "black";
            this.ctx.font = "14px Arial";
            this.ctx.fillText(`${percentage.toFixed(0)}%`, x + this.binWidth / 2 - 10, y - 10);

            // add a tick label
            this.ctx.fillStyle = "black";
            this.ctx.font = "14px Arial";
            this.ctx.fillText(index + 1, x + this.binWidth / 2 - 7, this.y + 20);

        });
        
        // add a y axis line and tick labels
        this.ctx.strokeStyle = "black";
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y);
        this.ctx.lineTo(this.x, 0);
        this.ctx.stroke();

        // show the total number of samples in the top left corner
        this.ctx.fillStyle = "black";
        this.ctx.font = "12px Arial";
        this.ctx.fillText(`Total Samples: ${this.bins.reduce((a, b) => a + b, 0)}`, this.x + 10, 20);

        // show the mean below the total samples
        this.ctx.fillStyle = "black";
        this.ctx.font = "12px Arial";
        this.ctx.fillText(`Mean: ${this.calculateMean().toFixed(1)}`, this.x + 10, 35);
        
        // show the standard deviation below the total samples
        this.ctx.fillStyle = "black";
        this.ctx.font = "12px Arial";
        this.ctx.fillText(`Standard Deviation: ${this.calculateStandardDeviation().toFixed(1)}`, this.x + 10, 50);
    }

    calculateMean() {
        return this.bins.reduce((a, b) => a + b, 0) / this.numberOfBins;
    }

    calculateStandardDeviation() {
        const mean = this.bins.reduce((a, b) => a + b, 0) / this.numberOfBins;
        const variance = this.bins.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / this.numberOfBins;
        return Math.sqrt(variance);
    }
}

const plotter = new Plotter(ctx);

function animate() {
    for (let i = 0; i < 10; i++) {
        plotter.update();
    }
    plotter.render();
    requestAnimationFrame(animate);
}

animate();