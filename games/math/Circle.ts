export default class Circle {
    constructor(public x: number, public y: number, public radius: number) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    area(): number {
        return Math.PI * this.radius * this.radius;
    }

    circumference(): number {
        return 2 * Math.PI * this.radius;
    }

    diameter(): number {
        return this.radius * 2;
    }

    toString(): string {
        return `Circle: x=${this.x}, y=${this.y}, radius=${this.radius}`;
    }

    randomPoint(type: 'inside' | 'insideNonUniform' | 'circle'): { x: number, y: number } {
        if (type === 'inside') {
            return this.randomPointInside();
        } else if (type === 'insideNonUniform') {
            return this.randomPointInsideNonUniform();
        } else {
            return this.randomPointOnCircle();
        }
    }

    randomSegment(type: 'vertical'): { x1: number, y1: number, x2: number, y2: number } {
        if (type === 'vertical') {
            return this.randomVerticalSegment();
        } else {
            return this.randomSegmentOnCircle();
        }
    }

    private randomVerticalSegment(): { x1: number, y1: number, x2: number, y2: number } {
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

    private randomSegmentOnCircle(): { x1: number, y1: number, x2: number, y2: number } {
        let angle1 = Math.random() * Math.PI * 2;
        let angle2 = Math.random() * Math.PI * 2;
        return {
            x1: this.x + this.radius * Math.cos(angle1),
            y1: this.y + this.radius * Math.sin(angle1),
            x2: this.x + this.radius * Math.cos(angle2),
            y2: this.y + this.radius * Math.sin(angle2)
        };
    }

    private randomPointOnCircle(): { x: number, y: number } {
        let angle = Math.random() * Math.PI * 2;
        return {
            x: this.x + this.radius * Math.cos(angle),
            y: this.y + this.radius * Math.sin(angle)
        };
    }

    // https://stackoverflow.com/questions/5837572/generate-a-random-point-within-a-circle-uniformly
    private randomPointInside(): { x: number, y: number } {
        let r = this.radius * Math.sqrt(Math.random());
        let angle = Math.random() * Math.PI * 2;
        return {
            x: this.x + r * Math.cos(angle),
            y: this.y + r * Math.sin(angle)
        };
    }

    private randomPointInsideNonUniform(): { x: number, y: number } {
        let r = Math.random() * this.radius;
        let angle = Math.random() * Math.PI * 2;
        return {
            x: this.x + r * Math.cos(angle),
            y: this.y + r * Math.sin(angle)
        };
    }


}
