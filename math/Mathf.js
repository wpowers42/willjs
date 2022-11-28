export default class Mathf {
    constructor() { }

    /** 
     * @param {number} value
     * @param {min} value
     * @param {max} value
     * @returns {number} */
    static Clamp = (value, min, max) => {
        if (value < min) {
            value = min;
        } else if (value > 1) {
            value = max;
        }
        return value;
    }

    /** 
     * @param {number} value
     * @returns {number} */
    static Clamp01 = (value) => {
        if (value < 0) {
            return 0.0;
        } else if (value > 1) {
            return 1.0;
        } else {
            return value;
        }
    }

    static Deg2Rad = Math.PI * 2 / 360;
    static Rad2Deg = 1.0 / Mathf.Deg2Rad;
}
