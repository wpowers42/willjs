export const Clamp = (value, min, max) => {
    if (value < min) {
        value = min;
    }
    else if (value > max) {
        value = max;
    }
    return value;
};
export const Clamp01 = (value) => {
    if (value < 0) {
        return 0.0;
    }
    else if (value > 1) {
        return 1.0;
    }
    else {
        return value;
    }
};
// Interpolates between /a/ and /b/ by /t/. /t/ is clamped between 0 and 1.
export const Lerp = (a, b, t) => {
    return a + (b - a) * Clamp01(t);
};
export const Deg2Rad = Math.PI * 2 / 360;
export const Rad2Deg = 1.0 / Deg2Rad;
// Custom Implementation
export const RandomRange = (minValue, maxValue) => {
    return Math.random() * (maxValue - minValue) + minValue;
};
export const RandomInt = (minValue, maxValue) => {
    return Math.floor(RandomRange(minValue, maxValue));
};
export const RandomNormal = (mean, standardDeviation) => {
    // Generate two random numbers between 0 and 1
    const u = 1 - Math.random();
    const v = Math.random();
    // Use the Box-Muller transform to convert the random numbers
    // into a normal distribution with the given mean and standard deviation
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return mean + standardDeviation * z;
};
export const LerpList = (start, end, t) => {
    // Check that the two lists have the same length
    if (start.length !== end.length) {
        throw new Error('Lists have different lengths');
    }
    return start.map((x, i) => Lerp(x, end[i], t));
};
//# sourceMappingURL=Mathf.js.map