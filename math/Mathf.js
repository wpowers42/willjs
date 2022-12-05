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
    Mathf.Deg2Rad = Math.PI * 2 / 360;
    Mathf.Rad2Deg = 1.0 / Mathf.Deg2Rad;
})(Mathf || (Mathf = {}));
//# sourceMappingURL=Mathf.js.map