class FourierAnimation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        this.canvas.width = 800;
        this.canvas.height = 600;

        this.points = [];
        this.ys = [];
        this.lastTime = 0;
        this.timeScale = 0.01;
        this.currentTime = 0;
        this.waves = 12;
        this.paused = false;

        // Bind methods to the class instance
        this.animate = this.animate.bind(this);
        this.togglePause = this.togglePause.bind(this);

        // Add pause button
        this.setupPauseButton();
    }

    drawCircle(x, y, radius) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    drawLine(fromX, fromY, toX, toY) {
        this.ctx.beginPath();
        this.ctx.moveTo(fromX, fromY);
        this.ctx.lineTo(toX, toY);
        this.ctx.stroke();
    }

    calculateWavePoints() {
        let x = 0;
        let y = 0;
        const waveComponentHeights = [];

        for (let i = 0; i < this.waves; i++) {
            const prevX = x;
            const prevY = y;
            const n = i * 2 + 1;
            const radius = 20 * 4 / n;

            x += radius * Math.cos(n * this.currentTime * 100);
            const newY = radius * Math.sin(n * this.currentTime * 100);
            y += newY;

            this.drawCircle(prevX, prevY, radius);
            this.drawLine(prevX, prevY, x, y);
            waveComponentHeights.push(newY);
        }

        return { x, y, waveComponentHeights };
    }

    drawWaveforms(x, waveComponentHeights) {
        let translateY = 15;
        const deltaY = 100;
        this.ctx.translate(0, translateY);

        for (let i = 0; i < this.waves; i++) {
            const step = deltaY * (1 - Math.log(i + 1) / Math.log(this.waves + 3));
            this.ctx.translate(0, step);
            translateY += step;

            this.ctx.beginPath();
            this.ctx.moveTo(0, this.ys[0][i]);
            for (let j = 0; j < this.ys.length; j++) {
                this.ctx.lineTo(j, this.ys[j][i]);
            }
            this.ctx.stroke();
        }

        return translateY;
    }

    togglePause() {
        this.paused = !this.paused;
        if (!this.paused) {
            this.lastTime = null;  // Reset lastTime when resuming
            requestAnimationFrame(this.animate);
        }
    }

    setupPauseButton() {
        const button = document.createElement('button');
        button.textContent = 'Pause';

        const canvasRect = this.canvas.getBoundingClientRect();
        const buttonWidth = canvasRect.width / 8;
        const buttonHeight = buttonWidth;

        // Updated styling for better appearance and mobile-friendliness
        button.style.position = 'absolute';
        button.style.fontSize = `${buttonWidth * 0.30}px`;
        button.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        button.style.border = '2px solid #333';
        button.style.borderRadius = '12px';
        button.style.cursor = 'pointer';
        button.style.width = `${buttonWidth}px`;
        button.style.height = `${buttonHeight}px`;

        // Center the button at the bottom of the canvas
        const updateButtonPosition = () => {
            const canvasRect = this.canvas.getBoundingClientRect();
            const offset = canvasRect.width * 0.05;
            const buttonLeft = canvasRect.left + offset;
            const buttonBottom = canvasRect.bottom - offset;
            button.style.left = `${buttonLeft}px`;
            button.style.top = `${buttonBottom - buttonHeight}px`;
        };

        // Initial position
        updateButtonPosition();

        // Update position when window resizes
        window.addEventListener('resize', updateButtonPosition);

        // Update the toggle function to change the symbol
        const originalToggle = this.togglePause;
        this.togglePause = () => {
            originalToggle.call(this);
            button.textContent = this.paused ? 'Play' : 'Pause';
        };

        this.canvas.parentNode.appendChild(button);
        button.addEventListener('click', this.togglePause);
    }

    animate(timestamp) {
        if (!this.paused) {
            const deltaTime = this.lastTime ? (timestamp - this.lastTime) / 250 : 0;
            this.lastTime = timestamp;
            this.currentTime += deltaTime * this.timeScale;

            // Clear canvas
            this.ctx.fillStyle = "white";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Initial translation
            this.ctx.translate(150, 150);

            // Calculate and draw wave circles
            const { x, y, waveComponentHeights } = this.calculateWavePoints();

            // Update history arrays
            this.ys.unshift(waveComponentHeights);
            this.points.unshift(y);
            if (this.ys.length > 500) this.ys.pop();
            if (this.points.length > 500) this.points.pop();

            // Draw waveforms
            this.ctx.translate(150, 0);
            const translateY = this.drawWaveforms(x, waveComponentHeights);
            this.ctx.translate(0, -translateY);

            // Draw final wave
            this.ctx.beginPath();
            this.ctx.moveTo(0, this.points[0]);
            for (let i = 0; i < this.points.length; i++) {
                this.ctx.lineTo(i, this.points[i]);
            }
            this.ctx.stroke();

            // Draw connecting line
            this.ctx.translate(-150, 0);
            this.drawLine(x, this.points[0], 150, this.points[0]);

            // Reset translation
            this.ctx.translate(-150, -150);

            // draw the title in the top left corner
            this.ctx.fillStyle = "black";
            this.ctx.font = "24px Arial";
            this.ctx.fillText("Fourier Transform", 10, 30);

            requestAnimationFrame(this.animate);
        }
    }

    start() {
        this.animate(0);
    }
}

// Initialize and start the animation
const fourierAnimation = new FourierAnimation('canvas');
fourierAnimation.start();
