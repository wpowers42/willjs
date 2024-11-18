export class Vector {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
        this.z += vector.z;
    }

    sub(vector) {
        this.x -= vector.x;
        this.y -= vector.y;
        this.z -= vector.z;
    }

    mult(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
    }

    div(scalar) {
        if (scalar !== 0) {
            this.x /= scalar;
            this.y /= scalar;
            this.z /= scalar;
        } else {
            throw new Error('Division by zero');
        }
    }

    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

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

    setMag(mag) {
        this.normalize();
        this.x *= mag;
        this.y *= mag;
        this.z *= mag;
    }

    limit(max) {
        if (this.mag() > max) {
            this.setMag(max);
        }
    }

    static copy(vector) {
        return new Vector(vector.x, vector.y, vector.z);
    }
}
