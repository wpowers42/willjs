import Mathf from "./Mathf.js";

export default class Vector2 {
    /**
     *  @param {number} x 
     *  @param {number} y  */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     *  @param {Vector2} a
     *  @param {Vector2} b 
     *  @param {number} a
     *  @returns {number}  */
    static Lerp = (a, b, t) => {
        t = Mathf.Clamp01(t);
        return new Vector2(
            a.x + (b.x - a.x) * t,
            a.y + (b.y - a.y) * t
        )
    }

    /**
     *  @param {Vector2} inDirection
     *  @param {Vector2} inNormal
     *  @returns {Vector2}  */
    static Reflect = (inDirection, inNormal) => {
        let factor = -2 * Vector2.Dot(inDirection, inNormal);
        return new Vector2(factor * inNormal.x + inDirection.x,
                           factor * inNormal.y + inDirection.y);
    }

    /**
     *  @param {Vector2} from
     *  @param {Vector2} to
     *  @returns {number}  */
    static Angle = (from, to) => {
        let denominator = Math.sqrt(from.sqrMagnitude * to.sqrMagnitude);
        if (denominator < Vector2.kEpsilonNormalSqrt) {
            return 0.0;
        }

        let dot = Mathf.Clamp(Vector2.Dot(from, to) / denominator, -1.0, 1.0);
        return Math.acos(dot) * Mathf.Rad2Deg;
    }

    /**
     *  @param {Vector2} from
     *  @param {Vector2} to
     *  @returns {number}  */
    static SignedAngle = (from, to) => {
        let unsignedAngle = Vector2.Angle(from, to);
        let sign = Math.sign(from.x * to.y - from.y * to.x);
        return unsignedAngle * sign;
    }

    /**
     *  @param {Vector2} lhs
     *  @param {Vector2} rhs
     *  @returns {number}  */
    static Dot = (lhs, rhs) => { return lhs.x * rhs.x + lhs.y * rhs.y; }

    /**
     *  @param {Vector2} a
     *  @param {Vector2} b
     *  @returns {number}  */
    static Distance = (a, b) => {
        let diff_x = a.x - b.x;
        let diff_y = a.y - b.y;
        return Math.Sqrt(diff_x * diff_x + diff_y * diff_y);
    }

    normalize() {
        let mag = this.magnitude;
        if (mag > this.kEpsilon) {
            // don't think we can assign new object to this in js?
            // this = this.divide(mag);
            let v = this.divide(mag);
        } else {
            let v = Vector2.zero;
        }
        this.x = v.x;
        this.y = v.y;
    }

    /** 
     * @param {Vector2|number}
     * @returns {Vector2} */
    divide(b) {
        if (typeof b === 'number') {
            return new Vector2(this.x / b, this.y / b);
        } else {
            return new Vector2(this.x / b.x, this.y / b.y);
        }
    }

    /** @returns {number} */
    get magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /** @returns {number} */
    get sqrMagnitude() {
        return this.x * this.x + this.y * this.y;
    }

    /** @returns {Vector2} */
    get normalized() {
        v = new Vector2(this.x, this.y);
        v.normalize();
        return v;
    }

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

    static kEpsilon = 0.00001;
    static kEpsilonNormalSqrt = 1e-15;
}
