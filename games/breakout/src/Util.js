import Constants from "./constants.js";
var Util;
(function (Util) {
    // Generate quads for the tiles in an atlas or spritesheet
    Util.generateQuads = (atlas, tileWidth, tileHeight) => {
        // Calculate the number of tiles in the atlas
        const sheetWidth = atlas.width / tileWidth;
        const sheetHeight = atlas.height / tileHeight;
        // An array to hold the quad objects for the tiles
        const tileQuads = [];
        // Generate quads for each tile in the atlas
        for (let y = 0; y < sheetHeight; y++) {
            for (let x = 0; x < sheetWidth; x++) {
                // Each quad is tileWidth x tileHeight pixels at coordinates (x * tileWidth, y * tileHeight)
                tileQuads.push(new Quad(x * tileWidth, y * tileHeight, tileWidth, tileHeight));
            }
        }
        // Return the array of tile quads
        return tileQuads;
    };
    // Generate quads for the bricks in the atlas
    Util.generateQuadsBricks = (atlas) => {
        // Generate quads for the entire atlas, using a cell size of 32x16 pixels
        const allQuads = Util.generateQuads(atlas, 32, 16);
        // Return the first 21 quads, which correspond to the bricks in the atlas
        return allQuads.slice(0, 21);
    };
    // Generate quads for the paddles in the atlas
    Util.generateQuadsPaddles = (atlas) => {
        // The starting x and y coordinates for the paddles in the atlas
        const x = 0;
        let y = 64;
        // An array to hold the quad objects for the paddles
        const paddleQuads = [];
        // Generate four sets of quads for the paddles
        for (let i = 0; i < 4; i++) {
            // The first quad is 32x16 pixels at coordinates (x, y)
            paddleQuads.push(new Quad(x, y, 32, 16));
            // The second quad is 64x16 pixels at coordinates (x + 32, y)
            paddleQuads.push(new Quad(x + 32, y, 64, 16));
            // The third quad is 96x16 pixels at coordinates (x + 96, y)
            paddleQuads.push(new Quad(x + 96, y, 96, 16));
            // The fourth quad is 128x16 pixels at coordinates (x, y + 16)
            paddleQuads.push(new Quad(x, y + 16, 128, 16));
            // next set of paddles
            y += 32;
        }
        // Return the array of paddle quads
        return paddleQuads;
    };
    // Generate quads for the balls in the atlas
    Util.generateQuadsBalls = (atlas) => {
        // An array to hold the quad objects for the balls
        const ballQuads = [];
        // The locations and numbers of balls in the atlas
        const ballLocations = [
            // Four balls at coordinates (x: 96, y: 48)
            { x: 96, y: 48, count: 4 },
            // Two balls at coordinates (x: 96, y: 56)
            { x: 96, y: 56, count: 2 },
        ];
        // Generate quads for each ball location
        for (const ballLocation of ballLocations) {
            // Generate the specified number of quads for this ball location
            for (let i = 0; i < ballLocation.count; i++) {
                // Each quad is 8x8 pixels at coordinates (x * 8, y)
                ballQuads.push(new Quad(ballLocation.x + i * 8, ballLocation.y, 8, 8));
            }
        }
        // Return the array of ball quads
        return ballQuads;
    };
    class Quad {
        constructor(sx, sy, sw, sh) {
            this.sx = sx;
            this.sy = sy;
            this.sw = sw;
            this.sh = sh;
        }
    }
    Util.Quad = Quad;
    Util.drawHealth = (ctx, health) => {
        for (let i = 0; i < 3; i++) {
            const x = Constants.virtualWidth - 100 + i * 11;
            const textureIndex = health > i ? 0 : 1;
            const quad = Constants.frames.hearts[textureIndex];
            let { sx, sy, sw, sh } = quad;
            let dx = x;
            let dy = 4;
            let dw = sw;
            let dh = sh;
            ctx.drawImage(Constants.textures.hearts, sx, sy, sw, sh, dx, dy, dw, dh);
        }
    };
    Util.drawScore = (ctx, score) => {
        ctx.font = Constants.fonts.small;
        ctx.fillStyle = 'white';
        ctx.fillText('Score: ', Constants.virtualWidth - 60, 10);
        ctx.textAlign = 'right';
        ctx.fillText(`${score}`, Constants.virtualWidth - 10, 10);
    };
})(Util || (Util = {}));
export default Util;
//# sourceMappingURL=util.js.map