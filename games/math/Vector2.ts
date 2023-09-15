import * as Mathf from "./Mathf.js";

export default class Vector2 {
    x: number;
    y: number;

    static kEpsilon = 0.00001;
    static kEpsilonNormalSqrt = 1e-15;

    static zeroVector = new Vector2(0, 0);
    static upVector = new Vector2(0, 1);
    static downVector = new Vector2(0, -1);
    static rightVector = new Vector2(1, 0);
    static leftVector = new Vector2(-1, 0);

    static get zero() { return this.zeroVector };
    static get up() { return this.upVector };
    static get down() { return this.downVector };
    static get right() { return this.rightVector };
    static get left() { return this.leftVector };

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static Lerp = (a: Vector2, b: Vector2, t: number): Vector2 => {
        t = Mathf.Clamp01(t);
        return new Vector2(
            a.x + (b.x - a.x) * t,
            a.y + (b.y - a.y) * t
        )
    }

    static Reflect = (inDirection: Vector2, inNormal: Vector2): Vector2 => {
        let factor = -2 * Vector2.Dot(inDirection, inNormal);
        return new Vector2(factor * inNormal.x + inDirection.x,
            factor * inNormal.y + inDirection.y);
    }

    static Angle = (from: Vector2, to: Vector2): number => {
        let denominator = Math.sqrt(from.sqrMagnitude * to.sqrMagnitude);
        if (denominator < Vector2.kEpsilonNormalSqrt) {
            return 0.0;
        }

        let dot = Mathf.Clamp(Vector2.Dot(from, to) / denominator, -1.0, 1.0);
        return Math.acos(dot) * Mathf.Rad2Deg;
    }

    static SignedAngle = (from: Vector2, to: Vector2): number => {
        let unsignedAngle = Vector2.Angle(from, to);
        let sign = Math.sign(from.x * to.y - from.y * to.x);
        return unsignedAngle * sign;
    }

    static Dot = (lhs: Vector2, rhs: Vector2): number => { return lhs.x * rhs.x + lhs.y * rhs.y; }

    static Distance = (a: Vector2, b: Vector2): number => {
        let diff_x = a.x - b.x;
        let diff_y = a.y - b.y;
        return Math.sqrt(diff_x * diff_x + diff_y * diff_y);
    }

    normalize() {
        let mag = this.magnitude;
        if (mag > Vector2.kEpsilon) {
            let v = this.divide(mag);
            this.x = v.x;
            this.y = v.y;
        } else {
            let v = Vector2.zero;
            this.x = v.x;
            this.y = v.y;
        }
    }

    divide(b: Vector2 | number): Vector2 {
        if (typeof b === 'number') {
            return new Vector2(this.x / b, this.y / b);
        } else {
            return new Vector2(this.x / b.x, this.y / b.y);
        }
    }

    get magnitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    get sqrMagnitude(): number {
        return this.x * this.x + this.y * this.y;
    }

    get normalized(): Vector2 {
        let v = new Vector2(this.x, this.y);
        v.normalize();
        return v;
    }

}
