export default class Graphics {
    constructor(game) {
        this.game = game;
        this.background = new Background();
        this.ground = new Ground(this.game.height);
    }
    update(dt) {
        this.background.update(dt);
        this.ground.update(dt);
    }
    draw(ctx) {
        this.background.draw(ctx);
        this.ground.draw(ctx);
    }
}
class Scene {
    constructor() {
        this.x = 0;
        this.y = 0;
    }
    update(dt) {
        this.x -= this.dx * dt;
        if (this.x + this.width < 0) {
            this.x += this.width;
        }
    }
    draw(ctx) {
        let sx = 0;
        let sy = 0;
        let sw = this.width;
        let sh = this.height;
        let dx = this.x;
        let dy = this.y;
        let dw = this.width;
        ;
        let dh = this.height;
        ctx.drawImage(this.image, sx, sy, sw, sh, dx, dy, dw, dh);
        ctx.drawImage(this.image, sx, sy, sw, sh, dx + sw - 1, dy, dw, dh);
    }
}
class Background extends Scene {
    constructor() {
        super();
        this.image = document.getElementById('backgroundImage');
        this.width = this.image.width;
        this.height = this.image.height;
        this.dx = 0.08;
    }
}
class Ground extends Scene {
    constructor(gameHeight) {
        super();
        this.image = document.getElementById('groundImage');
        this.width = this.image.width;
        this.height = this.image.height;
        this.dx = 0.10;
        this.y = gameHeight - this.height;
    }
}
//# sourceMappingURL=Graphics.js.map