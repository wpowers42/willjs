/**
 * Asteroid class - Falling threats that the turret must destroy
 * Features different sizes, speeds, and damage values
 */

import Vector2 from './utils/Vector2.js';
import { random, randomInt, randomChoice } from './utils/Utils.js';

export default class Asteroid {
    constructor(x, y, type = null, gameScore = 0) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(0, 0);
        this.gameScore = gameScore; // Store game score for scaling
        
        // Asteroid type determines properties
        this.type = type || this.generateRandomType();
        this.applyTypeProperties();
        
        // Health and damage
        this.maxHealth = this.health;
        
        // Visual properties
        this.rotation = random(0, Math.PI * 2);
        this.rotationSpeed = random(-0.002, 0.002);
        this.vertices = this.generateVertices();
        
        // Animation properties
        this.damageFlashTime = 0;
        this.pulseTime = 0;
        
        // State
        this.shouldRemove = false;
        this.hasHitGround = false;
        
        // Particle trail for fast asteroids
        this.trail = [];
        this.trailLength = this.speed > 80 ? 8 : 0;
    }

    /**
     * Generate random asteroid type
     * @returns {string} Asteroid type
     */
    generateRandomType() {
        const types = [
            { name: 'small', weight: 40 },
            { name: 'medium', weight: 30 },
            { name: 'large', weight: 20 },
            { name: 'fast', weight: 15 },
            { name: 'armored', weight: 10 },
            { name: 'giant', weight: 3 }
        ];
        
        const totalWeight = types.reduce((sum, type) => sum + type.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const type of types) {
            random -= type.weight;
            if (random <= 0) {
                return type.name;
            }
        }
        
        return 'small'; // Fallback
    }

    /**
     * Apply properties based on asteroid type
     */
    applyTypeProperties() {
        switch (this.type) {
            case 'small':
                this.size = random(8, 15);
                this.health = 1;
                this.damage = 1;
                this.speed = random(30, 50);
                this.points = 10;
                this.color = '#8B4513';
                break;
                
            case 'medium':
                this.size = random(15, 25);
                this.health = 2;
                this.damage = 2;
                this.speed = random(25, 40);
                this.points = 20;
                this.color = '#A0522D';
                break;
                
            case 'large':
                this.size = random(25, 35);
                this.health = 3;
                this.damage = 3;
                this.speed = random(20, 35);
                this.points = 40;
                this.color = '#CD853F';
                break;
                
            case 'fast':
                this.size = random(10, 18);
                this.health = 1;
                this.damage = 2;
                this.speed = random(60, 90);
                this.points = 30;
                this.color = '#FF6347';
                break;
                
            case 'armored':
                this.size = random(18, 28);
                this.health = 4;
                this.damage = 2;
                this.speed = random(15, 25);
                this.points = 50;
                this.color = '#696969';
                break;
                
            case 'giant':
                this.size = random(35, 50);
                this.health = 6;
                this.damage = 5;
                this.speed = random(10, 20);
                this.points = 100;
                this.color = '#2F4F4F';
                break;
                
            default:
                this.applyTypeProperties.call({ type: 'small' });
        }
        
        // Add some randomization to base properties
        this.speed *= random(0.8, 1.2);
        this.damage = Math.max(1, Math.floor(this.damage * random(0.8, 1.2)));
        
        // Apply score-based scaling (reduce damage and speed for early game)
        this.applyScoreScaling();
        
        // Set initial velocity
        this.setRandomVelocity();
    }

    /**
     * Apply score-based scaling to asteroid properties
     */
    applyScoreScaling() {
        // Calculate scaling factors based on cumulative score
        // At 0 score: 50% damage, 70% speed
        // At 500 score: 100% damage, 100% speed
        // At 1000+ score: 150% damage, 130% speed
        
        const damageScale = Math.max(0.5, Math.min(1.5, 0.5 + (this.gameScore / 500)));
        const speedScale = Math.max(0.7, Math.min(1.3, 0.7 + (this.gameScore / 1000) * 0.6));
        
        // Apply scaling
        this.damage = Math.max(1, Math.floor(this.damage * damageScale));
        this.speed = this.speed * speedScale;
        
        // Also scale health slightly for balance
        const healthScale = Math.max(0.8, Math.min(1.2, 0.8 + (this.gameScore / 1250) * 0.4));
        this.health = Math.max(1, Math.floor(this.health * healthScale));
        this.maxHealth = this.health;
    }

    /**
     * Set random velocity with some variation
     */
    setRandomVelocity() {
        // Mostly downward movement with slight horizontal drift
        const horizontalDrift = random(-15, 15);
        this.velocity.set(horizontalDrift, this.speed);
        
        // Add some chaos for more interesting movement
        if (Math.random() < 0.1) {
            this.velocity.rotate(random(-0.3, 0.3));
        }
    }

    /**
     * Generate irregular vertices for more interesting visuals
     * @returns {Array} Array of vertex positions
     */
    generateVertices() {
        const vertexCount = randomInt(6, 10);
        const vertices = [];
        
        for (let i = 0; i < vertexCount; i++) {
            const angle = (i / vertexCount) * Math.PI * 2;
            const radius = this.size * random(0.7, 1.0);
            
            vertices.push({
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius
            });
        }
        
        return vertices;
    }

    /**
     * Update asteroid logic
     * @param {number} dt - Delta time in milliseconds
     */
    update(dt) {
        // Update position
        this.position.add(Vector2.multiply(this.velocity, dt / 1000));
        
        // Update rotation
        this.rotation += this.rotationSpeed * dt;
        
        // Update animations
        this.updateAnimations(dt);
        
        // Update trail for fast asteroids
        this.updateTrail();
        
        // Apply gravity effect (slight acceleration downward)
        this.velocity.y += 5 * (dt / 1000);
        
        // Add slight atmospheric drag
        this.velocity.multiply(0.999);
        
        // Check if asteroid has moved off screen
        if (this.position.y > window.innerHeight + 100) {
            this.hasHitGround = true;
            this.shouldRemove = true;
        }
        
        // Check if health depleted
        if (this.health <= 0) {
            this.shouldRemove = true;
        }
    }

    /**
     * Update animation properties
     * @param {number} dt - Delta time
     */
    updateAnimations(dt) {
        // Reduce damage flash
        if (this.damageFlashTime > 0) {
            this.damageFlashTime -= dt;
        }
        
        // Update pulse animation for certain types
        this.pulseTime += dt * 0.005;
        
        // Increase rotation speed when damaged
        const healthPercent = this.health / this.maxHealth;
        this.rotationSpeed += (1 - healthPercent) * 0.0001 * dt;
    }

    /**
     * Update particle trail
     */
    updateTrail() {
        if (this.trailLength > 0) {
            // Add current position to trail
            this.trail.unshift({
                x: this.position.x,
                y: this.position.y,
                time: Date.now()
            });
            
            // Remove old trail points
            while (this.trail.length > this.trailLength) {
                this.trail.pop();
            }
        }
    }

    /**
     * Take damage from projectile
     * @param {number} damage - Damage amount
     * @param {Vector2} hitPosition - Position where hit occurred
     * @returns {boolean} True if asteroid was destroyed
     */
    takeDamage(damage, hitPosition = null) {
        this.health -= damage;
        this.damageFlashTime = 150; // Flash for 150ms
        
        // Add screen shake for large asteroids
        if (this.size > 30 && window.game) {
            // This would trigger screen shake effect
        }
        
        // Create damage particles
        if (hitPosition) {
            this.createDamageParticles(hitPosition, damage);
        }
        
        // Slight knockback effect
        if (hitPosition) {
            const knockback = Vector2.subtract(this.position, hitPosition).normalized().multiply(10);
            this.velocity.add(knockback);
        }
        
        return this.health <= 0;
    }

    /**
     * Create damage particles at hit location
     * @param {Vector2} hitPosition - Where the hit occurred
     * @param {number} damage - Damage amount for particle intensity
     */
    createDamageParticles(hitPosition, damage) {
        // This would create particles in the game's particle system
        // For now, we'll store the request for the game to handle
        if (window.game && window.game.createParticles) {
            const particleCount = Math.min(damage * 3, 12);
            window.game.createParticles('damage', hitPosition, {
                count: particleCount,
                color: this.color,
                size: this.size / 10
            });
        }
    }

    /**
     * Split asteroid into smaller pieces (for large asteroids)
     * @returns {Array} Array of smaller asteroids
     */
    split() {
        const fragments = [];
        
        if (this.size > 20 && this.type !== 'fast') {
            const fragmentCount = randomInt(2, 4);
            
            for (let i = 0; i < fragmentCount; i++) {
                const fragment = new Asteroid(
                    this.position.x + random(-10, 10),
                    this.position.y + random(-10, 10),
                    this.size > 35 ? 'medium' : 'small',
                    this.gameScore
                );
                
                // Give fragments random velocities
                const angle = random(0, Math.PI * 2);
                const speed = random(20, 40);
                fragment.velocity = Vector2.fromAngle(angle, speed);
                fragment.velocity.y += this.velocity.y * 0.5; // Inherit some downward velocity
                
                fragments.push(fragment);
            }
        }
        
        return fragments;
    }

    /**
     * Check collision with another object
     * @param {Object} other - Other object with position and size
     * @returns {boolean} True if colliding
     */
    collidesWith(other) {
        const distance = this.position.distanceTo(other.position);
        return distance < (this.size + other.size);
    }

    /**
     * Get asteroid threat level (for AI prioritization)
     * @param {Vector2} targetPosition - Position to evaluate threat against
     * @returns {number} Threat score
     */
    getThreatLevel(targetPosition) {
        const distance = this.position.distanceTo(targetPosition);
        const speed = this.velocity.magnitude();
        
        let threat = 0;
        
        // Closer = more threatening
        threat += Math.max(0, (500 - distance) / 500) * 40;
        
        // Faster = more threatening
        threat += (speed / 100) * 30;
        
        // Bigger = more threatening
        threat += (this.size / 50) * 20;
        
        // More damage = more threatening
        threat += this.damage * 10;
        
        return threat;
    }

    /**
     * Draw the asteroid
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);
        
        // Draw trail for fast asteroids
        if (this.trail.length > 0) {
            this.drawTrail(ctx);
        }
        
        // Damage flash effect
        if (this.damageFlashTime > 0) {
            ctx.globalAlpha = 0.3 + 0.7 * Math.sin(this.damageFlashTime * 0.1);
        }
        
        // Pulse effect for certain types
        let sizeMultiplier = 1;
        if (this.type === 'armored' || this.type === 'giant') {
            sizeMultiplier = 1 + Math.sin(this.pulseTime) * 0.1;
        }
        
        // Draw asteroid body
        this.drawBody(ctx, sizeMultiplier);
        
        // Draw type-specific effects
        this.drawTypeEffects(ctx);
        
        ctx.restore();
        
        // Draw health bar for asteroids with multiple health points or when damaged
        if (this.maxHealth > 1 || this.health < this.maxHealth) {
            this.drawHealthBar(ctx);
        }
    }

    /**
     * Draw the main asteroid body
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} sizeMultiplier - Size scaling factor
     */
    drawBody(ctx, sizeMultiplier = 1) {
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.getDarkerColor(this.color);
        ctx.lineWidth = 2;
        
        // Draw irregular shape using vertices
        ctx.beginPath();
        for (let i = 0; i < this.vertices.length; i++) {
            const vertex = this.vertices[i];
            const x = vertex.x * sizeMultiplier;
            const y = vertex.y * sizeMultiplier;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        
        ctx.fill();
        ctx.stroke();
        
        // Add surface details for larger asteroids
        if (this.size > 20) {
            this.drawSurfaceDetails(ctx, sizeMultiplier);
        }
    }

    /**
     * Draw surface details (craters, lines)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} sizeMultiplier - Size scaling factor
     */
    drawSurfaceDetails(ctx, sizeMultiplier) {
        ctx.strokeStyle = this.getDarkerColor(this.color);
        ctx.lineWidth = 1;
        
        // Draw some surface lines
        const lineCount = Math.floor(this.size / 10);
        for (let i = 0; i < lineCount; i++) {
            const angle = (i / lineCount) * Math.PI * 2;
            const startRadius = this.size * 0.3 * sizeMultiplier;
            const endRadius = this.size * 0.7 * sizeMultiplier;
            
            ctx.beginPath();
            ctx.moveTo(
                Math.cos(angle) * startRadius,
                Math.sin(angle) * startRadius
            );
            ctx.lineTo(
                Math.cos(angle) * endRadius,
                Math.sin(angle) * endRadius
            );
            ctx.stroke();
        }
    }

    /**
     * Draw type-specific visual effects
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawTypeEffects(ctx) {
        switch (this.type) {
            case 'fast':
                // Speed lines
                ctx.strokeStyle = 'rgba(255, 100, 0, 0.6)';
                ctx.lineWidth = 2;
                for (let i = 0; i < 3; i++) {
                    ctx.beginPath();
                    ctx.moveTo(-this.size, -5 + i * 5);
                    ctx.lineTo(-this.size - 10, -5 + i * 5);
                    ctx.stroke();
                }
                break;
                
            case 'armored':
                // Armor plating - draw as thicker outline instead of square
                ctx.strokeStyle = '#C0C0C0';
                ctx.lineWidth = 4;
                ctx.stroke(); // Use the existing circular outline
                break;
                
            case 'giant':
                // Menacing glow
                ctx.shadowColor = this.color;
                ctx.shadowBlur = 10;
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 1;
                ctx.strokeRect(-this.size * 0.6, -this.size * 0.6, this.size * 1.2, this.size * 1.2);
                break;
        }
    }

    /**
     * Draw particle trail
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawTrail(ctx) {
        ctx.save();
        ctx.rotate(-this.rotation); // Counter-rotate for trail
        
        for (let i = 0; i < this.trail.length; i++) {
            const point = this.trail[i];
            const alpha = (this.trail.length - i) / this.trail.length;
            const size = (alpha * 3) + 1;
            
            ctx.fillStyle = `rgba(255, 100, 0, ${alpha * 0.6})`;
            ctx.beginPath();
            ctx.arc(
                point.x - this.position.x,
                point.y - this.position.y,
                size, 0, Math.PI * 2
            );
            ctx.fill();
        }
        
        ctx.restore();
    }

    /**
     * Draw enhanced health bar for damaged asteroids with improved styling
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawHealthBar(ctx) {
        // Scale bar size based on asteroid size, with minimum and maximum limits
        const barWidth = Math.max(20, Math.min(this.size * 1.4, 60));
        const barHeight = Math.max(3, Math.min(this.size * 0.15, 6));
        const yOffset = -this.size - 12;
        
        ctx.save();
        
        const healthPercent = this.health / this.maxHealth;
        const fillWidth = barWidth * healthPercent;
        
        // Enhanced background with border
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1;
        ctx.fillRect(
            this.position.x - barWidth / 2,
            this.position.y + yOffset,
            barWidth,
            barHeight
        );
        ctx.strokeRect(
            this.position.x - barWidth / 2,
            this.position.y + yOffset,
            barWidth,
            barHeight
        );
        
        // Color-coded health fill with smooth gradients
        const healthColor = this.getHealthColor(healthPercent);
        ctx.fillStyle = healthColor;
        ctx.fillRect(
            this.position.x - barWidth / 2,
            this.position.y + yOffset,
            fillWidth,
            barHeight
        );
        
        // Add subtle glow effect for critical health
        if (healthPercent < 0.3) {
            ctx.shadowColor = 'rgba(255, 0, 0, 0.5)';
            ctx.shadowBlur = 4;
            ctx.fillRect(
                this.position.x - barWidth / 2,
                this.position.y + yOffset,
                fillWidth,
                barHeight
            );
            ctx.shadowBlur = 0;
        }
        
        ctx.restore();
    }

    /**
     * Get color-coded health bar color based on health percentage
     * @param {number} healthPercent - Health percentage (0-1)
     * @returns {string} Color string for health bar
     */
    getHealthColor(healthPercent) {
        if (healthPercent > 0.75) {
            // Bright green for healthy (75-100%)
            return 'rgba(0, 255, 0, 0.9)';
        } else if (healthPercent > 0.5) {
            // Yellow-green for moderate damage (50-75%)
            return 'rgba(150, 255, 0, 0.9)';
        } else if (healthPercent > 0.25) {
            // Orange for significant damage (25-50%)
            return 'rgba(255, 150, 0, 0.9)';
        } else {
            // Bright red for critical damage (0-25%)
            return 'rgba(255, 0, 0, 1.0)';
        }
    }

    /**
     * Get a darker version of a color
     * @param {string} color - Original color
     * @returns {string} Darker color
     */
    getDarkerColor(color) {
        // Simple color darkening - in a real implementation you'd use proper color manipulation
        const colorMap = {
            '#8B4513': '#654321',
            '#A0522D': '#8B4513',
            '#CD853F': '#A0522D',
            '#FF6347': '#CD5C5C',
            '#696969': '#2F2F2F',
            '#2F4F4F': '#1C3333'
        };
        
        return colorMap[color] || '#333';
    }

    /**
     * Get asteroid info for debugging
     * @returns {Object} Asteroid information
     */
    getInfo() {
        return {
            type: this.type,
            size: this.size,
            health: this.health,
            maxHealth: this.maxHealth,
            damage: this.damage,
            speed: this.speed,
            points: this.points,
            position: { x: this.position.x, y: this.position.y },
            velocity: { x: this.velocity.x, y: this.velocity.y }
        };
    }
}