// constants.ts
import Util from "./util";
var Constants;
(function (Constants) {
    Constants.canvasWidth = 1280;
    Constants.canvasHeight = 720;
    Constants.virtualWidth = 432;
    Constants.virtualHeight = 243;
    Constants.paddleSpeed = 0.20;
    Constants.FPS = 120;
    Constants.debug = false;
    Constants.fonts = {
        small: '8px Copperplate',
        medium: '16px Copperplate',
        large: '32px Copperplate',
    };
    Constants.textures = {
        arrows: document.getElementById('arrows-image'),
        background: document.getElementById('background-image'),
        blocks: document.getElementById('blocks-image'),
        hearts: document.getElementById('hearts-image'),
        particle: document.getElementById('particle-image'),
        main: document.getElementById('main-image'),
    };
    // define the sounds
    Constants.sounds = {
        brickHit1: document.getElementById('brick-hit-1-sound'),
        brickHit2: document.getElementById('brick-hit-2-sound'),
        confirm: document.getElementById('confirm-sound'),
        highScore: document.getElementById('high-score-sound'),
        hurt: document.getElementById('hurt-sound'),
        music: document.getElementById('music-sound'),
        noSelect: document.getElementById('no-select-sound'),
        paddleHit: document.getElementById('paddle-hit-sound'),
        pause: document.getElementById('pause-sound'),
        recover: document.getElementById('recover-sound'),
        score: document.getElementById('score-sound'),
        select: document.getElementById('select-sound'),
        victory: document.getElementById('victory-sound'),
        wallHit: document.getElementById('wall-hit-sound'),
    };
    Object.keys(Constants.sounds).forEach(sound => Constants.sounds[sound].volume = 0.20);
    Constants.frames = {
        paddles: Util.generateQuadsPaddles(Constants.textures.main),
        balls: Util.generateQuadsBalls(Constants.textures.main),
        bricks: Util.generateQuadsBricks(Constants.textures.main),
        hearts: Util.generateQuads(Constants.textures.hearts, 10, 9),
        arrows: Util.generateQuads(Constants.textures.arrows, 24, 24),
    };
})(Constants || (Constants = {}));
export default Constants;
//# sourceMappingURL=constants.js.map