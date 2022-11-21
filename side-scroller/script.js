"use strict";

const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('canvas'));
const ctx = canvas.getContext('2d');

canvas.width = 1080;
canvas.height = 720;

const toggleFullScreenButton = document.getElementById('fullScreenButton');

const toggleFullScreen = () => {
    console.log(document.fullscreenElement);
    if (!document.fullscreenElement) {
        canvas.requestFullscreen().catch(err => {
            alert(`Error, can't enable full-screen mode: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

toggleFullScreenButton.addEventListener('click', toggleFullScreen);


const input = new InputHandler();
const player = new Player(canvas.width, canvas.height);
const background = new Background(canvas.width, canvas.height);
let enemies = [];
let score = 0;
let gameOver = false;


/** @param {CanvasRenderingContext2D} ctx */
const handleEnemies = (ctx, deltaTime) => {
    enemies.forEach(enemy => enemy.update(deltaTime));
    enemies.forEach(enemy => enemy.draw(ctx));
};

/** @param {CanvasRenderingContext2D} ctx */
const displayStatusText = (ctx) => {
    ctx.save();
    ctx.font = '40px Courier';
    ctx.shadowColor = "black";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = 'white';
    let scoreMessage = `Score: ${score}`;
    ctx.fillText(scoreMessage, 20, 50);

    if (gameOver) {
        let gameOverMessages = ['Game Over!', 'Press ENTER or Swipe Down to try again.'];
        let lineHeight = 40;

        ctx.textAlign = 'center';
        gameOverMessages.forEach((message, index) => {
            ctx.fillText(message, canvas.width / 2, canvas.height / 2 + lineHeight * index);
        })
    }
    ctx.restore();
};

const restartGame = () => {
    score = 0;
    gameOver = false;
    enemies = [];
    timeSinceLastEnemy = 0;
    lastTime = performance.now();
    background.restart();
    player.restart();
    animate(0);
}

let initialFrame = true;
let lastTime = 0;
let timeSinceLastEnemy = 0;

const enemyInterval = 2000;
let enemyCounter = 0;
const nextEnemyTime = () => enemyInterval + enemyInterval * (Math.sin(enemyCounter) + 1);

// not using timestamp built into the requestAnimationFrame callback
// because it creates a large gap when restarting the game. performance.now()
// is a sensible workaround, but we lose sub-ms granularity on Firefox. Perhaps
// there is a way to more gracefull restart the timings (e.g. temp variable that
// uses 0 deltatime for the first loop)
function animate(timestamp) {

    if (!ctx) {
        throw new Error(`2d context not supported or canvas already initialized`);
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let deltaTime;

    if (initialFrame) {
        deltaTime = 0;
        initialFrame = false;
    } else {
        deltaTime = timestamp - lastTime;
    }


    initialFrame = false;
    lastTime = lastTime + deltaTime;
    timeSinceLastEnemy += deltaTime;

    if (timeSinceLastEnemy >= nextEnemyTime()) {
        enemies.push(new Enemy(canvas.width, canvas.height));
        timeSinceLastEnemy -= nextEnemyTime();
        enemyCounter++;
        enemies = enemies.filter(enemy => !enemy.markedForDeletion);
    }

    background.update(deltaTime);
    background.draw(ctx, deltaTime);
    handleEnemies(ctx, deltaTime);
    player.update(deltaTime, input, enemies);
    player.draw(ctx);

    displayStatusText(ctx);

    if (!gameOver) {
        requestAnimationFrame(animate);
    }
}

window.onload = () => animate(lastTime);
