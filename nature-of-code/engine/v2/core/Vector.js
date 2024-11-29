export class Vector {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * @param {Vector} vector
     */
    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
        this.z += vector.z;
    }

    /**
     * @param {Vector} vector
     */
    sub(vector) {
        this.x -= vector.x;
        this.y -= vector.y;
        this.z -= vector.z;
    }

    /**
     * @param {number} scalar
     */
    mult(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
    }

    /**
     * @param {number} scalar
     */
    div(scalar) {
        if (scalar !== 0) {
            this.x /= scalar;
            this.y /= scalar;
            this.z /= scalar;
        } else {
            throw new Error('Division by zero');
        }
    }

    /**
     * @returns {number}
     */
    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    /**
     * @returns {void}
     */
    normalize() {
        const mag = this.mag();
        if (mag !== 0) {
            this.x /= mag;
            this.y /= mag;
            this.z /= mag;
        } else {
            throw new Error('Normalization of zero vector');
        }
    }

    /**
     * @param {number} mag
     */
    setMag(mag) {
        this.normalize();
        this.x *= mag;
        this.y *= mag;
        this.z *= mag;
    }

    /**
     * @param {number} max
     */
    limit(max) {
        if (this.mag() > max) {
            this.setMag(max);
        }
    }

    /**
     * @param {Vector} vector
     * @returns {Vector}
     */
    static copy(vector) {
        return new Vector(vector.x, vector.y, vector.z);
    }

    /**
     * @returns {Vector}
     */
    static zero() {
        return new Vector(0, 0, 0);
    }
}
