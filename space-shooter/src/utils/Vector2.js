/**
 * 2D Vector math utility class
 * Provides vector operations for game physics and positioning
 */
export default class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * Create a copy of this vector
     * @returns {Vector2} New vector with same x, y values
     */
    clone() {
        return new Vector2(this.x, this.y);
    }

    /**
     * Set the values of this vector
     * @param {number} x - X component
     * @param {number} y - Y component
     * @returns {Vector2} This vector for chaining
     */
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    /**
     * Add another vector to this vector
     * @param {Vector2} other - Vector to add
     * @returns {Vector2} This vector for chaining
     */
    add(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    }

    /**
     * Subtract another vector from this vector
     * @param {Vector2} other - Vector to subtract
     * @returns {Vector2} This vector for chaining
     */
    subtract(other) {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }

    /**
     * Multiply this vector by a scalar
     * @param {number} scalar - Value to multiply by
     * @returns {Vector2} This vector for chaining
     */
    multiply(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    /**
     * Divide this vector by a scalar
     * @param {number} scalar - Value to divide by
     * @returns {Vector2} This vector for chaining
     */
    divide(scalar) {
        if (scalar !== 0) {
            this.x /= scalar;
            this.y /= scalar;
        }
        return this;
    }

    /**
     * Get the magnitude (length) of this vector
     * @returns {number} Vector magnitude
     */
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * Get the squared magnitude (length squared) of this vector
     * More efficient than magnitude() when you only need to compare lengths
     * @returns {number} Vector magnitude squared
     */
    magnitudeSquared() {
        return this.x * this.x + this.y * this.y;
    }

    /**
     * Normalize this vector (make it unit length)
     * @returns {Vector2} This vector for chaining
     */
    normalize() {
        const mag = this.magnitude();
        if (mag > 0) {
            this.divide(mag);
        }
        return this;
    }

    /**
     * Get a normalized copy of this vector
     * @returns {Vector2} New normalized vector
     */
    normalized() {
        return this.clone().normalize();
    }

    /**
     * Calculate distance to another vector
     * @param {Vector2} other - Other vector
     * @returns {number} Distance between vectors
     */
    distanceTo(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Calculate squared distance to another vector
     * @param {Vector2} other - Other vector
     * @returns {number} Squared distance between vectors
     */
    distanceSquaredTo(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return dx * dx + dy * dy;
    }

    /**
     * Calculate dot product with another vector
     * @param {Vector2} other - Other vector
     * @returns {number} Dot product
     */
    dot(other) {
        return this.x * other.x + this.y * other.y;
    }

    /**
     * Calculate angle between this vector and another
     * @param {Vector2} other - Other vector
     * @returns {number} Angle in radians
     */
    angleTo(other) {
        const dot = this.dot(other);
        const magProduct = this.magnitude() * other.magnitude();
        if (magProduct === 0) return 0;
        return Math.acos(Math.max(-1, Math.min(1, dot / magProduct)));
    }

    /**
     * Rotate this vector by an angle
     * @param {number} angle - Angle in radians
     * @returns {Vector2} This vector for chaining
     */
    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const newX = this.x * cos - this.y * sin;
        const newY = this.x * sin + this.y * cos;
        this.x = newX;
        this.y = newY;
        return this;
    }

    /**
     * Limit the magnitude of this vector
     * @param {number} maxMagnitude - Maximum allowed magnitude
     * @returns {Vector2} This vector for chaining
     */
    limit(maxMagnitude) {
        const mag = this.magnitude();
        if (mag > maxMagnitude) {
            this.normalize().multiply(maxMagnitude);
        }
        return this;
    }

    /**
     * Linear interpolation between this vector and another
     * @param {Vector2} other - Target vector
     * @param {number} t - Interpolation factor (0-1)
     * @returns {Vector2} This vector for chaining
     */
    lerp(other, t) {
        this.x += (other.x - this.x) * t;
        this.y += (other.y - this.y) * t;
        return this;
    }

    /**
     * Check if this vector equals another vector (within epsilon)
     * @param {Vector2} other - Other vector
     * @param {number} epsilon - Tolerance for comparison
     * @returns {boolean} True if vectors are equal
     */
    equals(other, epsilon = 0.001) {
        return Math.abs(this.x - other.x) < epsilon && Math.abs(this.y - other.y) < epsilon;
    }

    /**
     * Convert vector to string representation
     * @returns {string} String representation
     */
    toString() {
        return `Vector2(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
    }

    // Static utility methods

    /**
     * Create a vector from an angle
     * @param {number} angle - Angle in radians
     * @param {number} magnitude - Vector magnitude
     * @returns {Vector2} New vector
     */
    static fromAngle(angle, magnitude = 1) {
        return new Vector2(Math.cos(angle) * magnitude, Math.sin(angle) * magnitude);
    }

    /**
     * Add two vectors
     * @param {Vector2} a - First vector
     * @param {Vector2} b - Second vector
     * @returns {Vector2} New vector representing sum
     */
    static add(a, b) {
        return new Vector2(a.x + b.x, a.y + b.y);
    }

    /**
     * Subtract two vectors
     * @param {Vector2} a - First vector
     * @param {Vector2} b - Second vector
     * @returns {Vector2} New vector representing difference
     */
    static subtract(a, b) {
        return new Vector2(a.x - b.x, a.y - b.y);
    }

    /**
     * Multiply vector by scalar
     * @param {Vector2} vector - Vector to multiply
     * @param {number} scalar - Scalar value
     * @returns {Vector2} New vector
     */
    static multiply(vector, scalar) {
        return new Vector2(vector.x * scalar, vector.y * scalar);
    }

    /**
     * Distance between two vectors
     * @param {Vector2} a - First vector
     * @param {Vector2} b - Second vector
     * @returns {number} Distance
     */
    static distance(a, b) {
        return a.distanceTo(b);
    }

    /**
     * Linear interpolation between two vectors
     * @param {Vector2} a - Start vector
     * @param {Vector2} b - End vector
     * @param {number} t - Interpolation factor (0-1)
     * @returns {Vector2} New interpolated vector
     */
    static lerp(a, b, t) {
        return new Vector2(
            a.x + (b.x - a.x) * t,
            a.y + (b.y - a.y) * t
        );
    }

    // Common vector constants
    static get ZERO() { return new Vector2(0, 0); }
    static get ONE() { return new Vector2(1, 1); }
    static get UP() { return new Vector2(0, -1); }
    static get DOWN() { return new Vector2(0, 1); }
    static get LEFT() { return new Vector2(-1, 0); }
    static get RIGHT() { return new Vector2(1, 0); }
}
