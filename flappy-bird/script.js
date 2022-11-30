"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Game_1 = require("./Game");
function animate(game) {
    var ctx = game.ctx;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    game.update();
    game.draw();
    requestAnimationFrame(function () { return animate(game); });
}
window.onload = function () {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = 1280;
    canvas.height = 720;
    var game = new Game_1.default(ctx);
    // enter main loop
    animate(game);
};
//# sourceMappingURL=script.js.map