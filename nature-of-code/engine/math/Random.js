// random number generation

import { Calculation } from "./Calculation.js";

export class Random {

    static random() {
        return Math.random();
    }

    static randomGaussian(mean = 0, stddev = 1) {
        // Box-Muller transform
        const u1 = Random.random();
        const u2 = Random.random();
        const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        return z0 * stddev + mean;
    }

    static shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}
