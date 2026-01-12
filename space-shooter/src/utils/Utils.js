/**
 * General utility functions for the game
 */

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 */
export function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Map a value from one range to another
 * @param {number} value - Value to map
 * @param {number} inMin - Input range minimum
 * @param {number} inMax - Input range maximum
 * @param {number} outMin - Output range minimum
 * @param {number} outMax - Output range maximum
 * @returns {number} Mapped value
 */
export function map(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

/**
 * Generate random number between min and max
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number
 */
export function random(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Generate random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Choose random element from array
 * @param {Array} array - Array to choose from
 * @returns {*} Random element
 */
export function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
export function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 * @param {number} radians - Angle in radians
 * @returns {number} Angle in degrees
 */
export function radToDeg(radians) {
    return radians * (180 / Math.PI);
}

/**
 * Get distance between two points
 * @param {number} x1 - First point x
 * @param {number} y1 - First point y
 * @param {number} x2 - Second point x
 * @param {number} y2 - Second point y
 * @returns {number} Distance
 */
export function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Get squared distance between two points (more efficient for comparisons)
 * @param {number} x1 - First point x
 * @param {number} y1 - First point y
 * @param {number} x2 - Second point x
 * @param {number} y2 - Second point y
 * @returns {number} Squared distance
 */
export function distanceSquared(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return dx * dx + dy * dy;
}

/**
 * Calculate angle between two points
 * @param {number} x1 - First point x
 * @param {number} y1 - First point y
 * @param {number} x2 - Second point x
 * @param {number} y2 - Second point y
 * @returns {number} Angle in radians
 */
export function angleBetween(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

/**
 * Normalize angle to 0-2π range
 * @param {number} angle - Angle in radians
 * @returns {number} Normalized angle
 */
export function normalizeAngle(angle) {
    while (angle < 0) angle += Math.PI * 2;
    while (angle >= Math.PI * 2) angle -= Math.PI * 2;
    return angle;
}

/**
 * Check if a number is approximately equal to another (within epsilon)
 * @param {number} a - First number
 * @param {number} b - Second number
 * @param {number} epsilon - Tolerance
 * @returns {boolean} True if approximately equal
 */
export function approximately(a, b, epsilon = 0.001) {
    return Math.abs(a - b) < epsilon;
}

/**
 * Smooth step function for easing
 * @param {number} t - Input value (0-1)
 * @returns {number} Smoothed value
 */
export function smoothStep(t) {
    return t * t * (3 - 2 * t);
}

/**
 * Smoother step function for easing
 * @param {number} t - Input value (0-1)
 * @returns {number} Smoother value
 */
export function smootherStep(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
}

/**
 * Create a delay/timer utility
 * @param {number} duration - Duration in milliseconds
 * @returns {Promise} Promise that resolves after duration
 */
export function delay(duration) {
    return new Promise(resolve => setTimeout(resolve, duration));
}

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Object pool for efficient memory management
 */
export class ObjectPool {
    constructor(createFn, resetFn = null) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.pool = [];
    }

    /**
     * Get an object from the pool
     * @returns {*} Object from pool or newly created
     */
    get() {
        if (this.pool.length > 0) {
            return this.pool.pop();
        }
        return this.createFn();
    }

    /**
     * Return an object to the pool
     * @param {*} obj - Object to return
     */
    release(obj) {
        if (this.resetFn) {
            this.resetFn(obj);
        }
        this.pool.push(obj);
    }

    /**
     * Get current pool size
     * @returns {number} Pool size
     */
    size() {
        return this.pool.length;
    }

    /**
     * Clear the pool
     */
    clear() {
        this.pool.length = 0;
    }
}
