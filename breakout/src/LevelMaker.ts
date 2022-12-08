import { Mathf } from "../../math/Mathf.js";
import Brick from "./Brick.js";

export default class LevelMaker {

    // global patterns
    static none = 1;
    static single_pyramid = 2;
    static multi_pyramid = 3;

    // per-row patterns
    static solid = 1; // all colors the same in this row
    static alternate = 2; // alternate colors
    static skip = 3; // skip every other block
    static _none = 4; // no blocks this row
    

    constructor() {

    }

    static createMap = (level: number): Brick[] => {
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
                
                const brick = new Brick(
                    x * 32                 // brick width times index
                    + 8                    // 8px for the screen
                    + (13 - numCols) * 16, // math to center entire row
                    y * 16 + 16            // brick height times index
                );

                alternateFlag = !alternateFlag;
                if (alternatePattern && alternateFlag) {
                    brick.color = alternateColor1;
                    brick.tier = alternateTier1;
                } else {
                    brick.color = alternateColor2;
                    brick.tier = alternateTier2;
                }

                if (!alternatePattern) {
                    brick.color = solidColor;
                    brick.tier = solidTier;
                }

                bricks.push(brick);
            }
        }

        return bricks;
    }
}
