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

    static map(value, start1, stop1, start2, stop2) {
        return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
    }
}
