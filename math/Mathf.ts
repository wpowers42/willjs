export namespace Mathf {
    export const Clamp = (value: number, min: number, max: number) => {
        if (value < min) {
            value = min;
        } else if (value > max) {
            value = max;
        }
        return value;
    }

    export const Clamp01 = (value: number) => {
        if (value < 0) {
            return 0.0;
        } else if (value > 1) {
            return 1.0;
        } else {
            return value;
        }
    }

    export const Deg2Rad = Math.PI * 2 / 360;
    export const Rad2Deg = 1.0 / Mathf.Deg2Rad;

    // Custom Implementation
    export const RandomInt = (minValue : number, maxValue: number) => {
        return Math.floor(Math.random() * (maxValue - minValue + 1) ) + minValue;
    }
}
