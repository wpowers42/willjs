import * as Mathf from "./Mathf.js";
class Vector2 {
    static get zero() { return this.zeroVector; }
    ;
    static get up() { return this.upVector; }
    ;
    static get down() { return this.downVector; }
    ;
    static get right() { return this.rightVector; }
    ;
    static get left() { return this.leftVector; }
    ;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    normalize() {
        let mag = this.magnitude;
        if (mag > Vector2.kEpsilon) {
            let v = this.divide(mag);
            this.x = v.x;
            this.y = v.y;
        }
        else {
            let v = Vector2.zero;
            this.x = v.x;
            this.y = v.y;
        }
    }
    divide(b) {
        if (typeof b === 'number') {
            return new Vector2(this.x / b, this.y / b);
        }
        else {
            return new Vector2(this.x / b.x, this.y / b.y);
        }
    }
    get magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    get sqrMagnitude() {
        return this.x * this.x + this.y * this.y;
    }
    get normalized() {
        let v = new Vector2(this.x, this.y);
        v.normalize();
        return v;
    }
}
Vector2.kEpsilon = 0.00001;
Vector2.kEpsilonNormalSqrt = 1e-15;
Vector2.zeroVector = new Vector2(0, 0);
Vector2.upVector = new Vector2(0, 1);
Vector2.downVector = new Vector2(0, -1);
Vector2.rightVector = new Vector2(1, 0);
Vector2.leftVector = new Vector2(-1, 0);
Vector2.Lerp = (a, b, t) => {
    t = Mathf.Clamp01(t);
    return new Vector2(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
};
Vector2.Reflect = (inDirection, inNormal) => {
    let factor = -2 * Vector2.Dot(inDirection, inNormal);
    return new Vector2(factor * inNormal.x + inDirection.x, factor * inNormal.y + inDirection.y);
};
Vector2.Angle = (from, to) => {
    let denominator = Math.sqrt(from.sqrMagnitude * to.sqrMagnitude);
    if (denominator < Vector2.kEpsilonNormalSqrt) {
        return 0.0;
    }
    let dot = Mathf.Clamp(Vector2.Dot(from, to) / denominator, -1.0, 1.0);
    return Math.acos(dot) * Mathf.Rad2Deg;
};
Vector2.SignedAngle = (from, to) => {
    let unsignedAngle = Vector2.Angle(from, to);
    let sign = Math.sign(from.x * to.y - from.y * to.x);
    return unsignedAngle * sign;
};
Vector2.Dot = (lhs, rhs) => { return lhs.x * rhs.x + lhs.y * rhs.y; };
Vector2.Distance = (a, b) => {
    let diff_x = a.x - b.x;
    let diff_y = a.y - b.y;
    return Math.sqrt(diff_x * diff_x + diff_y * diff_y);
};
export default Vector2;
//# sourceMappingURL=Vector2.js.map