import * as Mathf from "../../math/Mathf";
class ParticleSystem {
    constructor(maxParticles, particleLifetime, linearAcceleration, emissionArea) {
        this.maxParticles = maxParticles;
        this.particleLifetime = particleLifetime;
        this.linearAcceleration = linearAcceleration;
        this.emissionArea = emissionArea;
        this.particles = [];
        this.startColor = [0, 0, 0];
        this.endColor = [0, 0, 0];
    }
    emit(numParticles, x, y) {
        // TODO: only remove the required number of particles
        this.particles = this.particles.filter(particle => particle.lifetime > this.particleLifetime.min);
        numParticles = Mathf.Clamp(numParticles, 0, this.maxParticles - this.particles.length);
        for (let i = 0; i < numParticles; i++) {
            this.particles.push(new Particle(Mathf.RandomNormal(x, this.emissionArea.dx), Mathf.RandomNormal(y, this.emissionArea.dy), Mathf.RandomRange(this.linearAcceleration.xmin, this.linearAcceleration.xmax), Mathf.RandomRange(this.linearAcceleration.ymin, this.linearAcceleration.ymax), this.startColor, this.endColor, this.particleLifetime.max));
        }
    }
    setColors(startColor, endColor) {
        this.startColor = startColor;
        this.endColor = endColor;
    }
    update(dt) {
        this.particles.forEach(particle => particle.update(dt));
        this.particles = this.particles.filter(particle => particle.lifetime < this.particleLifetime.max);
    }
    draw(ctx) {
        this.particles.forEach(particle => particle.draw(ctx));
    }
}
ParticleSystem.paletteColors = {
    1: [99, 155, 255],
    2: [106, 190, 47],
    3: [217, 87, 99],
    4: [215, 123, 186],
    5: [251, 242, 54], // gold
};
export default ParticleSystem;
class Particle {
    constructor(x, y, xForce, yForce, startColor, endColor, maxLifetime) {
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
    update(dt) {
        this.lifetime += dt;
        this.x += this.dx * dt;
        this.y += this.dy * dt;
        this.dx += this.xForce * dt;
        this.dy += this.yForce * dt;
        // update color
        this.color = `rgba(${Mathf.LerpList(this.startColor, this.endColor, this.lifetime / this.maxLifetime).join(',')})`;
    }
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.width * 0.50, this.y - this.height * 0.50, this.width, this.height);
    }
}
//# sourceMappingURL=ParticleSystem.js.map