import * as Mathf from "../../math/Mathf";
import Brick from "./Brick.js";
class LevelMaker {
    constructor() {
    }
}
// global patterns
LevelMaker.none = 1;
LevelMaker.single_pyramid = 2;
LevelMaker.multi_pyramid = 3;
// per-row patterns
LevelMaker.solid = 1; // all colors the same in this row
LevelMaker.alternate = 2; // alternate colors
LevelMaker.skip = 3; // skip every other block
LevelMaker._none = 4; // no blocks this row
LevelMaker.createMap = (level) => {
    const bricks = [];
    const numRows = Mathf.RandomInt(1, 5);
    let numCols = Mathf.RandomInt(7, 13);
    numCols = numCols % 2 === 0 ? numCols + 1 : numCols; // ensure odd
    const highestTier = Math.min(3, Math.floor(level / 5));
    const highestColor = Math.min(5, level % 5 + 3);
    for (let y = 0; y < numRows; y++) {
        // whether we want to enable skipping for this row
        const skipPattern = Math.random() < 0.50;
        // whether we want alternate colors for this row
        const alternatePattern = Math.random() < 0.50;
        const alternateColor1 = Mathf.RandomInt(1, highestColor);
        const alternateColor2 = Mathf.RandomInt(1, highestColor);
        const alternateTier1 = Mathf.RandomInt(0, highestTier);
        const alternateTier2 = Mathf.RandomInt(0, highestTier);
        let skipFlag = Math.random() < 0.50;
        let alternateFlag = Math.random() < 0.50;
        const solidColor = Mathf.RandomInt(1, highestColor);
        const solidTier = Mathf.RandomInt(0, highestTier);
        for (let x = 0; x < numCols; x++) {
            skipFlag = !skipFlag; // flip the flag
            if (skipPattern && skipFlag) {
                continue;
            }
            alternateFlag = !alternateFlag;
            let color;
            let tier;
            if (alternatePattern && alternateFlag) {
                color = alternateColor1;
                tier = alternateTier1;
            }
            else {
                color = alternateColor2;
                tier = alternateTier2;
            }
            if (!alternatePattern) {
                color = solidColor;
                tier = solidTier;
            }
            const brick = new Brick(x * 32 // brick width times index
                + 8 // 8px for the screen
                + (13 - numCols) * 16, // math to center entire row
            y * 16 + 16, // brick height times index
            color, tier);
            bricks.push(brick);
        }
    }
    return bricks;
};
export default LevelMaker;
//# sourceMappingURL=LevelMaker.js.map