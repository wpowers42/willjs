class Game {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.enemies = [];
        this.enemyInterval = 500;
        this.enemyTimer = 0;
        this.enemyTypes = [Worm, Ghost, Spider];
    }

    update(deltaTime) {
        this.enemyTimer += deltaTime;
        if (this.enemyTimer >= this.enemyInterval) {
            this.#addNewEnemy();
            this.enemyTimer -= this.enemyInterval;

            // remove enemies marked for deletion
            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
        }
        this.enemies.forEach(enemy => enemy.update(deltaTime));
    }

    draw() {
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
    }

    // leading # indicates private method
    #addNewEnemy() {
        const randomEnemy = this.enemyTypes[Math.floor(Math.random() * this.enemyTypes.length)];
        this.enemies.push(new randomEnemy(this));
        // draw enemies from back to front
        this.enemies = this.enemies.sort((a, b) => a.y - b.y);
    }
}
