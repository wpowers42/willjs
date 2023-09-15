import * as Mathf from "../../math/Mathf";
import Constants from "./constants.js";

interface NumberArrays {
    [key: number]: number[];
}

export default class ParticleSystem {

    static paletteColors: NumberArrays = {
        1: [99, 155, 255], // blue
        2: [106, 190, 47], // greeen
        3: [217, 87, 99], // red
        4: [215, 123, 186], // purple
        5: [251, 242, 54], // gold
    }

    private maxParticles: number;
    private particleLifetime: { min: number, max: number };
    private linearAcceleration: { xmin: number, ymin: number, xmax: number, ymax: number };
    private emissionArea: { dx: number, dy: number };
    private particles: Particle[];
    startColor: number[];
    endColor: number[];

    constructor(maxParticles: number,
        particleLifetime: { min: number, max: number },
        linearAcceleration: { xmin: number, ymin: number, xmax: number, ymax: number },
        emissionArea: { dx: number, dy: number }) {

        this.maxParticles = maxParticles;
        this.particleLifetime = particleLifetime;
        this.linearAcceleration = linearAcceleration;
        this.emissionArea = emissionArea;
        this.particles = [];
        this.startColor = [0, 0, 0];
        this.endColor = [0, 0, 0];
    }

    emit(numParticles: number, x: number, y: number) {
        // TODO: only remove the required number of particles
        this.particles = this.particles.filter(particle => particle.lifetime > this.particleLifetime.min);
        numParticles = Mathf.Clamp(numParticles, 0, this.maxParticles - this.particles.length);
        for (let i = 0; i < numParticles; i++) {
            this.particles.push(new Particle(
                Mathf.RandomNormal(x, this.emissionArea.dx),
                Mathf.RandomNormal(y, this.emissionArea.dy),
                Mathf.RandomRange(this.linearAcceleration.xmin, this.linearAcceleration.xmax),
                Mathf.RandomRange(this.linearAcceleration.ymin, this.linearAcceleration.ymax),
                this.startColor,
                this.endColor,
                this.particleLifetime.max
            ));
        }

    }

    setColors(startColor: number[], endColor: number[]) {
        this.startColor = startColor;
        this.endColor = endColor;
    }

    update(dt: number) {
        this.particles.forEach(particle => particle.update(dt));
        this.particles = this.particles.filter(particle => particle.lifetime < this.particleLifetime.max);

    }

    draw(ctx: CanvasRenderingContext2D) {
        this.particles.forEach(particle => particle.draw(ctx));
    }
}

class Particle {
    lifetime: number;
    x: number;
    y: number;
    xForce: number;
    yForce: number;
    dx: number;
    dy: number;
    startColor: number[];
    endColor: number[];
    color: string;
    maxLifetime: number;
    width: number;
    height: number;

    constructor(x: number, y: number, xForce: number, yForce: number,
        startColor: number[], endColor: number[], maxLifetime: number) {
        this.lifetime = 0;
        this.maxLifetime = maxLifetime;
        this.x = x;
        this.y = y;
        this.dx = 0;
        this.dy = 0;
        this.xForce = xForce;
        this.yForce = yForce;
        this.startColor = startColor;
        this.endColor = endColor;
        this.color = `rgba(${startColor.join(',')})`;
        this.width = 4;
        this.height = 4;
    }

    update(dt: number) {
        this.lifetime += dt;
        this.x += this.dx * dt;
        this.y += this.dy * dt;
        this.dx += this.xForce * dt;
        this.dy += this.yForce * dt;

        // update color
        this.color = `rgba(${Mathf.LerpList(this.startColor, this.endColor, this.lifetime / this.maxLifetime).join(',')})`;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.width * 0.50, this.y - this.height * 0.50, this.width, this.height);
    }
}
