// @ts-check

const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('canvas'));
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 720;

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
    ctx.fillStyle = 'black';
    ctx.fillText(`Score: ${score}`, 20, 50);
    ctx.fillStyle = 'white';
    ctx.fillText(`Score: ${score}`, 22, 52);
    ctx.restore();

    if (gameOver) {
        ctx.font = '40px Courier';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'black';
        ctx.fillText(`Game Over! Final Score: ${score}`, canvas.width / 2, canvas.height / 2);
        ctx.fillStyle = 'white';
        ctx.fillText(`Game Over! Final Score: ${score}`, canvas.width / 2 + 3, canvas.height / 2 + 3);
    }
};

let lastTime = 0;
let timeSinceLastEnemy = 0;
const enemyInterval = 2000;

function animate(timestamp) {
    if (gameOver) {
        return;
    }


    if (!ctx) {
        throw new Error(`2d context not supported or canvas already initialized`);
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    timeSinceLastEnemy += deltaTime;
    if (timeSinceLastEnemy >= enemyInterval) {
        enemies.push(new Enemy(canvas.width, canvas.height));
        timeSinceLastEnemy -= enemyInterval;
        enemies = enemies.filter(enemy => !enemy.markedForDeletion);
    }

    background.update(deltaTime);
    background.draw(ctx, deltaTime);
    handleEnemies(ctx, deltaTime);
    player.update(deltaTime, input, enemies);
    player.draw(ctx);
    displayStatusText(ctx);

    requestAnimationFrame(animate);
}

window.onload = () => animate(lastTime);
