// Canvas Utilities
const canvas = {
    // Create and setup a canvas with given dimensions
    create: (width, height) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    },

    // Clear canvas with optional color
    clear: (ctx, color = 'white') => {
        const {width, height} = ctx.canvas;
        ctx.save();
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
    },

    // Map a value from one range to another
    map: (value, start1, stop1, start2, stop2) => {
        return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
    },

    // Constrain a value between min and max
    constrain: (value, min, max) => Math.min(Math.max(value, min), max)
};


// Animation Utilities
const animation = {
    // Request animation frame with consistent time step
    loop: (callback, fps = 60) => {
        let then = performance.now();
        const interval = 1000 / fps;

        const animate = (now) => {
            requestAnimationFrame(animate);
            const delta = now - then;

            if (delta > interval) {
                then = now - (delta % interval);
                callback(delta);
            }
        };
        
        requestAnimationFrame(animate);
    }
};

// Export all utilities
export { canvas, animation }; 