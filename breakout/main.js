import { virtualWidth, virtualHeight, FPS } from './src/constants.js';
import InputHandler from './src/InputHandler.js';
import StateMachine from './src/StateMachine.js';
import StartState from './src/states/StartState.js';
window.onload = () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = virtualWidth;
    canvas.height = virtualHeight;
    const inputHandler = new InputHandler();
    // define the fonts
    const gFonts = {
        small: '8px Copperplate',
        medium: '16px Copperplate',
        large: '32px Copperplate',
    };
    // define the textures
    const gTextures = {
        arrows: document.getElementById('arrows-image'),
        background: document.getElementById('background-image'),
        blocks: document.getElementById('blocks-image'),
        hearts: document.getElementById('hearts-image'),
        particle: document.getElementById('particle-image'),
    };
    // define the sounds
    const gSounds = {
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
    /* Initialize the State Machine
       1. start
       2. paddle-select
       3. serve
       4. play
       5. victory
       6. game-over
    */
    const stateMachine = new StateMachine({
        'start': () => new StartState()
    });
    stateMachine.change('start');
    const dt = 1000 / FPS; // delta time using imported FPS constant
    let t = 0; // time
    let lastTime = performance.now(); // last time
    let accumulator = 0; // accumulator
    const runGameLoop = () => {
        const currentTime = performance.now();
        const frameTime = currentTime - lastTime;
        lastTime = currentTime;
        accumulator += frameTime;
        while (dt < accumulator) {
            stateMachine.update(dt);
            t += dt;
            accumulator -= dt;
        }
        ctx.clearRect(0, 0, virtualWidth, virtualHeight);
        // draw background
        ctx.drawImage(gTextures.background, 0, 0, virtualWidth, virtualHeight);
        displayFPS(frameTime);
        stateMachine.draw(ctx);
        requestAnimationFrame(runGameLoop);
    };
    const createDisplayFPS = () => {
        // Create an array to store the last 60 frame times
        const frameTimes = [];
        return (currentFrameTime) => {
            // Add the current frame time to the array
            frameTimes.push(currentFrameTime);
            // If the array has more than 60 elements, remove the oldest element
            if (frameTimes.length > 60) {
                frameTimes.shift();
            }
            // Calculate the average of the last 30 frame times
            const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
            // Calculate the FPS based on the average frame time and round it to the nearest 5
            let fps = Math.round(1000 / avgFrameTime / 5) * 5;
            // Display the FPS on the screen
            ctx.fillStyle = "white";
            ctx.fillText(`FPS: ${fps}`, 10, 20);
        };
    };
    const displayFPS = createDisplayFPS();
    runGameLoop();
};
//# sourceMappingURL=main.js.map