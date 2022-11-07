class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    normalize() {
        const len = Math.sqrt(this.x ** 2 + this.y ** 2);
        return new Vector2(this.x / len, this.y / len);
    }

    distance(/** @type {Vector2} */ other) {
        return Math.sqrt((other.x - this.x) ** 2 +
                         (other.y - this.y) ** 2);
    }
}
