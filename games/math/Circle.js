export default class Circle {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.x = x;
        this.y = y;
        this.radius = radius;
    }
    area() {
        return Math.PI * this.radius * this.radius;
    }
    circumference() {
        return 2 * Math.PI * this.radius;
    }
    diameter() {
        return this.radius * 2;
    }
    toString() {
        return `Circle: x=${this.x}, y=${this.y}, radius=${this.radius}`;
    }
    randomPoint(type) {
        if (type === 'inside') {
            return this.randomPointInside();
        }
        else if (type === 'insideNonUniform') {
            return this.randomPointInsideNonUniform();
        }
        else {
            return this.randomPointOnCircle();
        }
    }
    randomSegment(type) {
        if (type === 'vertical') {
            return this.randomVerticalSegment();
        }
        else {
            return this.randomSegmentOnCircle();
        }
    }
    randomVerticalSegment() {
        let x = this.x + (Math.random() - 0.5) * this.radius * 2;
        // points on circumference derived from circle equation
        let y1 = this.y + Math.sqrt(this.radius * this.radius - (x - this.x) * (x - this.x));
        let y2 = this.y - Math.sqrt(this.radius * this.radius - (x - this.x) * (x - this.x));
        // let y1 = this.y + (Math.random() - 0.5) * this.radius * 2;
        // let y2 = this.y + (Math.random() - 0.5) * this.radius * 2;
        return {
            x1: x,
            y1: y1,
            x2: x,
            y2: y2
        };
    }
    randomSegmentOnCircle() {
        let angle1 = Math.random() * Math.PI * 2;
        let angle2 = Math.random() * Math.PI * 2;
        return {
            x1: this.x + this.radius * Math.cos(angle1),
            y1: this.y + this.radius * Math.sin(angle1),
            x2: this.x + this.radius * Math.cos(angle2),
            y2: this.y + this.radius * Math.sin(angle2)
        };
    }
    randomPointOnCircle() {
        let angle = Math.random() * Math.PI * 2;
        return {
            x: this.x + this.radius * Math.cos(angle),
            y: this.y + this.radius * Math.sin(angle)
        };
    }
    // https://stackoverflow.com/questions/5837572/generate-a-random-point-within-a-circle-uniformly
    randomPointInside() {
        let r = this.radius * Math.sqrt(Math.random());
        let angle = Math.random() * Math.PI * 2;
        return {
            x: this.x + r * Math.cos(angle),
            y: this.y + r * Math.sin(angle)
        };
    }
    randomPointInsideNonUniform() {
        let r = Math.random() * this.radius;
        let angle = Math.random() * Math.PI * 2;
        return {
            x: this.x + r * Math.cos(angle),
            y: this.y + r * Math.sin(angle)
        };
    }
}
//# sourceMappingURL=Circle.js.map