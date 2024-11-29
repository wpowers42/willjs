export class Noise {
    static PERLIN_YWRAPB = 4;
    static PERLIN_YWRAP = 1 << Noise.PERLIN_YWRAPB;
    static PERLIN_ZWRAPB = 8;
    static PERLIN_ZWRAP = 1 << Noise.PERLIN_ZWRAPB;
    static PERLIN_SIZE = 2047;

    constructor() {
        this.perlin_octaves = 8; // default to medium smooth
        this.perlin_amp_falloff = 0.5; // 50% reduction/octave
        this.perlin = new Array(Noise.PERLIN_SIZE + 1);
        this.initialize();
    }

    /**
     * @returns {void}
     */
    initialize() {
        for (let i = 0; i < Noise.PERLIN_SIZE + 1; i++) {
            this.perlin[i] = Math.random();
        }
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {number}
     */
    noise(x, y = 0, z = 0) {

        // Convert negative coordinates to positive
        if (x < 0) x = -x;
        if (y < 0) y = -y;
        if (z < 0) z = -z;

        // Get integer and fractional parts of coordinates
        let integerX = Math.floor(x);
        let integerY = Math.floor(y);
        let integerZ = Math.floor(z);
        let fractionalX = x - integerX;
        let fractionalY = y - integerY;
        let fractionalZ = z - integerZ;
        let smoothedX, smoothedY;

        let result = 0;
        let amplitude = 0.5;

        let noise1, noise2, noise3;

        // Add successive octaves of noise
        for (let octave = 0; octave < this.perlin_octaves; octave++) {
            // Calculate offset into noise array
            let offset = integerX + (integerY << Noise.PERLIN_YWRAPB) + (integerZ << Noise.PERLIN_ZWRAPB);

            // Calculate smoothed coordinate values
            smoothedX = this.scaledCosine(fractionalX);
            smoothedY = this.scaledCosine(fractionalY);

            // Interpolate between noise values
            noise1 = this.perlin[offset & Noise.PERLIN_SIZE];
            noise1 += smoothedX * (this.perlin[(offset + 1) & Noise.PERLIN_SIZE] - noise1);
            noise2 = this.perlin[(offset + Noise.PERLIN_YWRAP) & Noise.PERLIN_SIZE];
            noise2 += smoothedX * (this.perlin[(offset + Noise.PERLIN_YWRAP + 1) & Noise.PERLIN_SIZE] - noise2);
            noise1 += smoothedY * (noise2 - noise1);

            offset += Noise.PERLIN_ZWRAP;
            noise2 = this.perlin[offset & Noise.PERLIN_SIZE];
            noise2 += smoothedX * (this.perlin[(offset + 1) & Noise.PERLIN_SIZE] - noise2);
            noise3 = this.perlin[(offset + Noise.PERLIN_YWRAP) & Noise.PERLIN_SIZE];
            noise3 += smoothedX * (this.perlin[(offset + Noise.PERLIN_YWRAP + 1) & Noise.PERLIN_SIZE] - noise3);
            noise2 += smoothedY * (noise3 - noise2);

            // Interpolate along z dimension
            noise1 += this.scaledCosine(fractionalZ) * (noise2 - noise1);

            // Accumulate weighted result
            result += noise1 * amplitude;
            amplitude *= this.perlin_amp_falloff;

            // Scale coordinates for next octave
            integerX <<= 1;
            fractionalX *= 2;
            integerY <<= 1;
            fractionalY *= 2;
            integerZ <<= 1;
            fractionalZ *= 2;

            // Handle overflow into integer portion
            if (fractionalX >= 1.0) {
                integerX++;
                fractionalX--;
            }
            if (fractionalY >= 1.0) {
                integerY++;
                fractionalY--;
            }
            if (fractionalZ >= 1.0) {
                integerZ++;
                fractionalZ--;
            }
        }
        return result;
    }

    /**
     * @param {number} i
     * @returns {number}
     */
    scaledCosine(i) {
        return 0.5 * (1.0 - Math.cos(i * Math.PI));
    }
}
