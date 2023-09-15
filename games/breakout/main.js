import Constants from './src/constants.js';
import InputHandler from './src/InputHandler.js';
import StateMachine from './src/StateMachine.js';
import StartState from './src/states/StartState.js';
import PlayState from './src/states/PlayState.js';
import ServeState from './src/states/ServeState.js';
import GameOverState from './src/states/GameOverState.js';
import VictoryState from './src/states/VictoryState.js';
import HighScoreState from './src/states/HighScoreState.js';
import EnterHighScoreState from './src/states/EnterHighScoreState.js';
import PaddleSelectState from './src/states/PaddleSelectState.js';
window.onload = () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = Constants.virtualWidth;
    canvas.height = Constants.virtualHeight;
    const inputHandler = new InputHandler();
    /* Initialize the State Machine
       1. start
       2. paddle-select
       3. serve
       4. play
       5. victory
       6. game-over
    */
    const stateMachine = new StateMachine({
        'start': () => new StartState(),
        'serve': () => new ServeState(),
        'play': () => new PlayState(),
        'gameOver': () => new GameOverState(),
        'victory': () => new VictoryState(),
        'highScores': () => new HighScoreState(),
        'enterHighScore': () => new EnterHighScoreState(),
        'paddleSelect': () => new PaddleSelectState(),
    });
    stateMachine.change('start', {});
    Constants.sounds.music.loop = true;
    Constants.sounds.music.play();
    const dt = 1000 / Constants.FPS; // delta time using imported FPS constant
    let t = 0; // time
    let lastTime = performance.now(); // last time
    let accumulator = 0; // accumulator
    const runGameLoop = () => {
        const currentTime = performance.now();
        const frameTime = currentTime - lastTime;
        lastTime = currentTime;
        accumulator += frameTime;
        while (dt < accumulator) {
            stateMachine.update(dt, inputHandler);
            t += dt;
            accumulator -= dt;
        }
        ctx.clearRect(0, 0, Constants.virtualWidth, Constants.virtualHeight);
        // draw background
        ctx.drawImage(Constants.textures.background, 0, 0, Constants.virtualWidth, Constants.virtualHeight);
        stateMachine.draw(ctx);
        displayFPS(frameTime);
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
            ctx.fillStyle = "green";
            ctx.font = Constants.fonts.small;
            ctx.textAlign = 'left';
            ctx.fillText(`FPS: ${fps}`, 10, 10);
            ctx.fillStyle = "white";
        };
    };
    const displayFPS = createDisplayFPS();
    runGameLoop();
};
//# sourceMappingURL=main.js.map