export var Mathf;
(function (Mathf) {
    Mathf.Clamp = (value, min, max) => {
        if (value < min) {
            value = min;
        }
        else if (value > max) {
            value = max;
        }
        return value;
    };
    Mathf.Clamp01 = (value) => {
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
    Mathf.Lerp = (a, b, t) => {
        return a + (b - a) * Mathf.Clamp01(t);
    };
    Mathf.Deg2Rad = Math.PI * 2 / 360;
    Mathf.Rad2Deg = 1.0 / Mathf.Deg2Rad;
    // Custom Implementation
    Mathf.RandomRange = (minValue, maxValue) => {
        return Math.random() * (maxValue - minValue) + minValue;
    };
    Mathf.RandomInt = (minValue, maxValue) => {
        return Math.floor(Mathf.RandomRange(minValue, maxValue));
    };
    Mathf.RandomNormal = (mean, standardDeviation) => {
        // Generate two random numbers between 0 and 1
        const u = 1 - Math.random();
        const v = Math.random();
        // Use the Box-Muller transform to convert the random numbers
        // into a normal distribution with the given mean and standard deviation
        const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
        return mean + standardDeviation * z;
    };
    Mathf.LerpList = (start, end, t) => {
        // Check that the two lists have the same length
        if (start.length !== end.length) {
            throw new Error('Lists have different lengths');
        }
        return start.map((x, i) => Mathf.Lerp(x, end[i], t));
    };
})(Mathf || (Mathf = {}));
//# sourceMappingURL=Mathf.js.map