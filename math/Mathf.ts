export default class Mathf {
    constructor() { }

    static Clamp = (value : number, min : number, max : number) : number => {
        if (value < min) {
            value = min;
        } else if (value > max) {
            value = max;
        }
        return value;
    }

    static Clamp01 = (value : number) : number => {
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
