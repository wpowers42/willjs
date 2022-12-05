import Brick from "./Brick.js";

export default class LevelMaker {
    constructor() {

    }

    static createMap = (level: number): Brick[] => {
        let bricks = [];

        let numRows = Math.floor(Math.random() * 4 + 1);
        let numCols = Math.floor(Math.random() * 6 + 7);

        for (let y = 0; y < numRows; y++) {
            for (let x = 0; x < numCols; x++) {
                let brick = new Brick(
                    x * 32                 // brick width times index
                    + 8                    // 8px for the screen
                    + (13 - numCols) * 16, // math to center entire row
                    y * 16                 // brick height times index
                );
                bricks.push(brick);
            }
        }

        return bricks;
    }
}
