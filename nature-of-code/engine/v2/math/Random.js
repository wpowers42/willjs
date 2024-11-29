// random number generation

import { Calculation } from "./Calculation.js";

export class Random {

    /**
     * @param {number|Array<any>} [min] - Minimum value, upper bound, or array to choose from
     * @param {number} [max] - Maximum value when specifying a range
     * @returns {number|*} Random number or array element based on input:
     *  - With min and max numbers: Returns random number between min and max
     *  - With single number: Returns random number between 0 and that number
     *  - With array: Returns random element from the array
     */
    static random(min, max) {
        if (typeof min === "number" && typeof max === "number") {
            return Calculation.map(Math.random(), 0, 1, min, max);
        }
        else if (typeof min === "number" && max === undefined) {
            return Math.random() * min;
        }
        else if (Array.isArray(min)) {
            return min[Math.floor(Math.random() * min.length)];
        }
        else {
            return Math.random();
        }
    }

    /**
     * @param {number} [mean]
     * @param {number} [stddev]
     * @returns {number}
     */
    static randomGaussian(mean = 0, stddev = 1) {
        // Box-Muller transform
        const u1 = Random.random();
        const u2 = Random.random();
        const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        return z0 * stddev + mean;
    }

    /**
     * @param {Array<any>} array
     * @returns {void}
     */
    static shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}
