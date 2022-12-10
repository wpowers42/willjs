// http://www.adammil.net/blog/v125_Roguelike_Vision_Algorithms.html#raycode

class RayCastVisibility {
    constructor(mapSize, blocksLight, setVisible) {
        this.mapSize = mapSize;
        this.blocksLight = blocksLight;
        this.setVisible = setVisible;
    }

    compute(origin) {
        this.setVisible(origin.x, origin.y);
        const area = {
            left: 0,
            top: 0,
            right: this.mapSize[0],
            bottom: this.mapSize[1]
        }

        // cast rays towards the top and bottom of the area
        let traces = 0;
        for (let x = area.left; x < area.right; x++) {
            this.traceLine(origin, x, area.top);
            this.traceLine(origin, x, area.bottom - 1);
        }

        // and to the left and right
        for (let y = area.top + 1; y < area.bottom - 1; y++) {
            this.traceLine(origin, area.left, y);
            this.traceLine(origin, area.right - 1, y);
        }

    }

    traceLine(origin, x2, y2) {
        const xDiff = x2 - origin.x;
        const yDiff = y2 - origin.y;
        let xLen = Math.abs(xDiff);
        let yLen = Math.abs(yDiff);
        let xInc = Math.sign(xDiff);
        let yInc = Math.sign(yDiff) << 16; // shifts 16 bits to the left
        let index = (origin.y << 16) + origin.x;

        // make sure we walk along the long axis
        if (xLen < yLen) {
            [xLen, yLen] = [yLen, xLen];
            [xInc, yInc] = [yInc, xInc];
        }

        const errorInc = yLen * 2;
        let error = -xLen;
        const errorReset = xLen * 2;

        // skip the first point (the origin) since it's always visible and should never stop rays
        while (--xLen >= 0) {
            index += xInc; // advance down the long axis (could be X or Y)
            error += errorInc;
            if (error > 0) {
                error -= errorReset;
                index += yInc;
            }
            const x = index & 0xFFFF; // bitwise and with 1111111111111111
            const y = index >> 16; // shift 16 bits to the right

            this.setVisible(x, y);
            if (this.blocksLight(x, y)) {
                break;
            };

        }
    }
}