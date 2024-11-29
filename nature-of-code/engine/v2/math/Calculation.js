export class Calculation {
    /**
     * Linear interpolation between two values
     * @param {number} a - The starting value
     * @param {number} b - The ending value
     * @param {number} t - The interpolation factor, which is a value between 0 and 1
     * @returns {number} The interpolated value
     */
    static lerp(t, a, b) {
        return a + t * (b - a);
    }

    /**
     * @param {number} value
     * @param {number} start1
     * @param {number} stop1
     * @param {number} start2
     * @param {number} stop2
     * @returns {number}
     */
    static map(value, start1, stop1, start2, stop2) {
        return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
    }
}
