export default class FloatingMessage {
    constructor(value, x, y, targetX, targetY) {
        this.value = value;
        this.x = x;
        this.y = y;
        this.startX = this.x;
        this.startY = this.y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.timer = 0;
        this.lifetime = 1000;
        this.markedForDeletion = false;
        this.font = '20px Courier';
        this.fillStyle = ''
    }
    /** @param {number} dt */
    update(dt) {
        this.timer += dt;
        if (this.timer >= this.lifetime) {
            this.markedForDeletion = true;
        }

        let percent = Math.min(this.timer / this.lifetime, 1.0);
        this.x = (this.targetX - this.startX) * percent + this.startX;
        this.y = (this.targetY - this.startY) * percent + this.startY;
    }

    /** @param {CanvasRenderingContext2D} ctx */
    draw(ctx) {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 4;
        ctx.fillStyle = 'white';
        ctx.font = '20px Courier'
        ctx.fillText(this.value, this.x, this.y);
        ctx.restore();
    }
}
