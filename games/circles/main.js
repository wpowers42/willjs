var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Circle from '../math/Circle.js';
var Constants;
(function (Constants) {
    Constants.canvasWidth = Math.min(window.innerWidth, window.innerHeight, 800);
    Constants.canvasHeight = Constants.canvasWidth;
    Constants.virtualWidth = Constants.canvasWidth;
    Constants.virtualHeight = Constants.canvasHeight;
})(Constants || (Constants = {}));
window.onload = () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = Constants.virtualWidth;
    canvas.height = Constants.virtualHeight;
    const circle = new Circle(0, 0, 1);
    const scale = Constants.virtualWidth / 2 / circle.radius * 0.90;
    const draw = () => __awaiter(void 0, void 0, void 0, function* () {
        ctx.strokeStyle = 'black';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(scale, scale);
        ctx.lineWidth = 0.01;
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        const segments = 2000;
        let validSegments = 0;
        // length of equilateral triangle inscribed in circle with radius r is 2 * r * sqrt(3) / 3
        const side = circle.radius * Math.sqrt(3);
        ctx.fillStyle = 'black';
        ctx.font = '20px Arial';
        // randomly draw vertical segments
        for (let i = 0; i < segments; i++) {
            ctx.beginPath();
            let s = circle.randomSegment('vertical');
            const length = s.y1 - s.y2;
            if (length > side) {
                validSegments++;
            }
            ctx.strokeStyle = length < side ? 'blue' : 'red';
            ctx.moveTo(s.x1 * scale + canvas.width / 2, s.y1 * scale + canvas.height / 2);
            ctx.lineTo(s.x2 * scale + canvas.width / 2, s.y2 * scale + canvas.height / 2);
            ctx.stroke();
            // sleep for 10ms
            ctx.clearRect(0, 0, 250, 70);
            // format the value to 2 decimal places using toFixed
            // ctx.fillText(`Valid segments: ${(validSegments / segments * 100).toFixed(2)}%`, 10, 30);
            ctx.fillText(`% Segments: ${(validSegments / i).toFixed(4)}`, 10, 30);
            yield new Promise(resolve => setTimeout(resolve, 20));
        }
        // randomly draw points inside the circle
        // ctx.fillStyle = 'red';
        // ctx.beginPath();
        // for (let i = 0; i < 1000; i++) {
        //     let p = circle.randomPoint('inside');
        //     // let p = circle.randomPointInsideNonUniform();
        //     ctx.rect(p.x * 200 + canvas.width / 2, p.y * 200 + canvas.height / 2, 2, 2);
        // }
        // ctx.fill();
        // sleep for 200ms
        setTimeout(() => {
            requestAnimationFrame(draw);
        }, 100);
    });
    draw();
};
//# sourceMappingURL=main.js.map