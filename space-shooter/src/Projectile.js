/**
 * Projectile class - Predictively aimed missiles fired by defense turrets
 * Launches toward a calculated intercept point and follows a fixed trajectory
 */

import Vector2 from './utils/Vector2.js';
import { random, lerp } from './utils/Utils.js';

export default class Projectile {
    // Static counter for unique projectile IDs
    static projectileCounter = 0;

    constructor(x, y, target, config = {}) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(0, 0);
        this.target = target;
        this.initialTarget = target; // Keep reference to original target

        // Assign unique ID and targeting bucket
        this.projectileId = ++Projectile.projectileCounter;
        this.targetingBucket = this.calculateTargetingBucket();

        // Projectile properties
        this.size = config.size || 3;
        this.speed = config.speed || 200;
        this.damage = config.damage || 1;
        this.explosionRadius = config.explosionRadius || 0;
        this.maxLifeTime = config.maxLifeTime || 4000; // 4 seconds

        this.proximityDetonation = config.proximityDetonation || 20;

        // State
        this.life = this.maxLifeTime;
        this.shouldRemove = false;
        this.hasExploded = false;

        // Visual properties
        this.trail = [];
        this.trailLength = 8;
        this.glowIntensity = 1.0;
        this.rotation = 0;

        // Set initial velocity toward target (or default if no target)
        this.initializeVelocity();

        // Sound effect trigger
        this.hasPlayedLaunchSound = false;
    }

    /**
     * Calculate targeting bucket using deterministic hash
     * @returns {number} Bucket number (0-9)
     */
    calculateTargetingBucket() {
        // Use a large prime number for better distribution
        return (this.projectileId * 2654435761) % 10;
    }

    /**
     * Get targeting weights based on bucket assignment
     * @returns {Object} Weight multipliers for different targeting factors
     */
    getTargetingWeights() {
        switch (this.targetingBucket) {
            case 0: // "Guardian" (City Protector)
                return {
                    collisionThreat: 3.0,
                    cityProximity: 2.0,
                    intercept: 1.0,
                    distance: 1.0,
                    alignment: 1.0,
                    generalThreat: 1.0,
                    spreadFactor: 0.5, // Low spread - can cluster on critical threats
                    name: "Guardian"
                };

            case 1: // "Hunter" (Close Range Specialist)
                return {
                    collisionThreat: 1.0,
                    cityProximity: 1.0,
                    intercept: 2.0,
                    distance: 3.0,
                    alignment: 1.0,
                    generalThreat: 1.0,
                    spreadFactor: 1.0, // Medium spread - normal behavior
                    name: "Hunter"
                };

            case 2: // "Sniper" (Long Range Specialist)
                return {
                    collisionThreat: 1.0,
                    cityProximity: 1.0,
                    intercept: 1.0,
                    distance: 0.5,
                    alignment: 2.0,
                    generalThreat: 1.0,
                    spreadFactor: 2.0, // High spread - prefers unique targets
                    name: "Sniper"
                };

            case 3: // "Interceptor" (Speed Focused)
                return {
                    collisionThreat: 1.0,
                    cityProximity: 1.0,
                    intercept: 3.0,
                    distance: 1.0,
                    alignment: 2.0,
                    generalThreat: 1.0,
                    spreadFactor: 1.0, // Medium spread - normal behavior
                    name: "Interceptor"
                };

            case 4: // "Threat Analyst" (General Threat Focused)
                return {
                    collisionThreat: 1.0,
                    cityProximity: 1.0,
                    intercept: 1.0,
                    distance: 1.0,
                    alignment: 1.0,
                    generalThreat: 3.0,
                    spreadFactor: 0.3, // Low spread - clusters on biggest threats
                    name: "Threat Analyst"
                };

            case 5: // "Proximity Fighter" (Close Combat)
                return {
                    collisionThreat: 1.0,
                    cityProximity: 1.0,
                    intercept: 1.5,
                    distance: 4.0,
                    alignment: 1.0,
                    generalThreat: 1.0,
                    spreadFactor: 0.5, // Low spread - can cluster on close threats
                    name: "Proximity Fighter"
                };

            case 6: // "Strategic" (Balanced with City Bias)
                return {
                    collisionThreat: 1.5,
                    cityProximity: 1.5,
                    intercept: 1.0,
                    distance: 1.0,
                    alignment: 1.0,
                    generalThreat: 1.0,
                    spreadFactor: 1.0, // Medium spread - balanced approach
                    name: "Strategic"
                };

            case 7: // "Aggressive" (High Threat Focused)
                return {
                    collisionThreat: 1.5,
                    cityProximity: 1.0,
                    intercept: 1.0,
                    distance: 1.0,
                    alignment: 1.0,
                    generalThreat: 2.0,
                    spreadFactor: 0.3, // Low spread - focuses on high-value targets
                    name: "Aggressive"
                };

            case 8: // "Opportunist" (Best Alignment)
                return {
                    collisionThreat: 1.0,
                    cityProximity: 1.0,
                    intercept: 1.5,
                    distance: 0.7,
                    alignment: 3.0,
                    generalThreat: 1.0,
                    spreadFactor: 1.5, // High spread - seeks opportunities others miss
                    name: "Opportunist"
                };

            case 9: // "Last Resort" (Cleanup Crew)
            default:
                return {
                    collisionThreat: 1.0,
                    cityProximity: 1.0,
                    intercept: 1.0,
                    distance: 1.0,
                    alignment: 1.0,
                    generalThreat: 1.2,
                    spreadFactor: 2.0, // High spread - cleans up neglected targets
                    name: "Last Resort"
                };
        }
    }

    /**
     * Initialize velocity toward target
     */
    initializeVelocity() {
        if (this.target && this.target.position) {
            const aimPosition = this.predictTargetPosition();
            const direction = Vector2.subtract(aimPosition, this.position).normalized();
            this.velocity = Vector2.multiply(direction, this.speed);
            this.rotation = Math.atan2(direction.y, direction.x);
        } else {
            // Default upward velocity if no target
            this.velocity.set(0, -this.speed);
            this.rotation = -Math.PI / 2;
        }
    }

    /**
     * Update projectile logic
     * @param {number} dt - Delta time in milliseconds
     */
    update(dt) {
        // Update lifetime
        this.life -= dt;
        if (this.life <= 0) {
            this.detonate();
            return;
        }

        // Projectiles keep their predicted launch trajectory without steering.
        this.updateMovement(dt);
        this.updateVisuals(dt);

        // Check proximity detonation
        this.checkProximityDetonation();

        // Play launch sound
        if (!this.hasPlayedLaunchSound) {
            this.playLaunchSound();
            this.hasPlayedLaunchSound = true;
        }
    }

    /**
     * Acquire new target from available asteroids using danger-based prioritization
     * Now includes target spreading to prevent clustering on same asteroid
     * @param {Array} asteroids - Available targets
     * @param {Array} allProjectiles - All projectiles for coordination
     */
    acquireNewTarget(asteroids, allProjectiles = []) {
        let highestThreatTarget = null;
        let highestThreatScore = -1;
        let highestUnassignedTarget = null;
        let highestUnassignedScore = -1;
        const targetingCounts = new Map();

        // Count assignments once instead of rescanning every projectile per asteroid.
        for (const projectile of allProjectiles) {
            if (projectile === this || projectile.shouldRemove || !projectile.target) continue;
            if (projectile.target.shouldRemove) continue;
            targetingCounts.set(
                projectile.target,
                (targetingCounts.get(projectile.target) || 0) + 1
            );
        }

        for (const asteroid of asteroids) {
            if (asteroid.shouldRemove) continue;
            if (asteroid.position.y > window.innerHeight + 25) continue;

            const threatScore = this.calculateDangerBasedScore(asteroid);
            if (threatScore > highestThreatScore) {
                highestThreatScore = threatScore;
                highestThreatTarget = asteroid;
            }

            if (!targetingCounts.has(asteroid) && threatScore > highestUnassignedScore) {
                highestUnassignedScore = threatScore;
                highestUnassignedTarget = asteroid;
            }
        }

        // Cover threats in priority order, then focus fire when every threat is covered.
        this.target = highestUnassignedTarget || highestThreatTarget;
    }

    /**
     * Calculate danger-based score for target prioritization with bucket-specific weights
     * Each projectile has a unique targeting behavior based on its bucket assignment
     * @param {Object} asteroid - Asteroid to evaluate
     * @param {number} distance - Distance to asteroid
     * @returns {number} Danger score (higher = more dangerous/priority)
     */
    calculateDangerBasedScore(asteroid) {
        let score = 0;

        const game = window.game;
        if (!game || !game.city) return score;

        // Asteroids on a collision course with the city are always the top priority.
        const collisionInfo = this.calculateCollisionTrajectory(asteroid, game.city);
        if (collisionInfo.willHitCity) {
            score += 50000;

            if (collisionInfo.timeToImpact > 0 && collisionInfo.timeToImpact < 10000) {
                score += Math.max(0, 10000 - collisionInfo.timeToImpact);
            }

            score += (asteroid.damage || 1) * 1000;
            score += (asteroid.size || 15) / 35 * 2000;
        }

        // Remaining factors are measured relative to the city, not the projectile.
        score += this.calculateCityProximityThreat(asteroid, game.city) * 1000;
        score += asteroid.getThreatLevel ?
            asteroid.getThreatLevel(game.city.position) : 50;

        return score;
    }

    /**
     * Calculate if asteroid will collide with city based on current trajectory
     * @param {Object} asteroid - Asteroid to check
     * @param {Object} city - City object to check collision against
     * @returns {Object} Collision info {willHitCity, timeToImpact, missDistance}
     */
    calculateCollisionTrajectory(asteroid, city) {
        if (!asteroid.velocity || !asteroid.position || !city) {
            return { willHitCity: false, timeToImpact: Infinity, missDistance: Infinity };
        }

        const cityPos = city.position;
        const cityRadius = city.size;

        // Calculate asteroid's trajectory
        const asteroidPos = asteroid.position.clone();
        const asteroidVel = asteroid.velocity.clone();

        // Project asteroid position at city Y level
        if (asteroidVel.y <= 0) {
            // Asteroid moving up or sideways - won't hit city
            return { willHitCity: false, timeToImpact: Infinity, missDistance: Infinity };
        }

        const timeToReachCityY = (cityPos.y - asteroidPos.y) / asteroidVel.y;
        if (timeToReachCityY < 0) {
            // Asteroid already past city Y level
            return { willHitCity: false, timeToImpact: Infinity, missDistance: Infinity };
        }

        // Calculate where asteroid will be when it reaches city Y level
        const projectedX = asteroidPos.x + asteroidVel.x * timeToReachCityY;
        const projectedPos = new Vector2(projectedX, cityPos.y);

        // Calculate distance between projected position and city center
        const missDistance = projectedPos.distanceTo(cityPos);
        const asteroidRadius = asteroid.size || 15;
        const totalRadius = cityRadius + asteroidRadius + 15; // Buffer for collision detection

        const willHitCity = missDistance <= totalRadius;

        return {
            willHitCity: willHitCity,
            timeToImpact: willHitCity ? timeToReachCityY : Infinity,
            missDistance: missDistance
        };
    }

    /**
     * Calculate threat level based on asteroid's movement toward city
     * @param {Object} asteroid - Asteroid to evaluate
     * @param {Object} city - City object
     * @returns {number} Proximity threat score (0-1)
     */
    calculateCityProximityThreat(asteroid, city) {
        if (!asteroid.velocity || !asteroid.position || !city) return 0;

        const cityPos = city.position;

        // Vector from asteroid to city
        const toCity = Vector2.subtract(cityPos, asteroid.position);
        if (toCity.magnitude() === 0) return 1; // Already at city

        const toCityNormalized = toCity.normalized();
        const asteroidDirection = asteroid.velocity.normalized();

        // Calculate how aligned asteroid movement is with city direction
        const alignment = asteroidDirection.dot(toCityNormalized);

        // Only consider asteroids moving generally toward city (positive alignment)
        if (alignment <= 0) return 0;

        // Higher score for better alignment and closer proximity
        const distance = asteroid.position.distanceTo(cityPos);
        const game = window.game;
        const maxDistance = game ? Math.sqrt(game.width * game.width + game.height * game.height) : 1000;
        const proximityScore = Math.max(0, 1 - (distance / maxDistance));

        // Combine alignment and proximity with stronger weight on alignment
        return (alignment * 0.7) + (proximityScore * 0.3);
    }

    /**
     * Predict where target will be when a constant-speed projectile intercepts it
     * @returns {Vector2} Predicted target position
     */
    predictTargetPosition() {
        if (!this.target.velocity) {
            return this.target.position.clone();
        }

        const relativePosition = Vector2.subtract(this.target.position, this.position);
        const targetVelocity = this.target.velocity;

        // Solve |relativePosition + targetVelocity * t| = projectileSpeed * t.
        const a = targetVelocity.magnitudeSquared() - this.speed * this.speed;
        const b = 2 * relativePosition.dot(targetVelocity);
        const c = relativePosition.magnitudeSquared();
        const epsilon = 0.000001;
        let interceptTime = 0;

        if (Math.abs(a) < epsilon) {
            const linearTime = Math.abs(b) < epsilon ? 0 : -c / b;
            interceptTime = linearTime > 0 ? linearTime : 0;
        } else {
            const discriminant = b * b - 4 * a * c;
            if (discriminant >= 0) {
                const squareRoot = Math.sqrt(discriminant);
                const firstTime = (-b - squareRoot) / (2 * a);
                const secondTime = (-b + squareRoot) / (2 * a);
                const positiveTimes = [firstTime, secondTime].filter(time => time > 0);

                if (positiveTimes.length > 0) {
                    interceptTime = Math.min(...positiveTimes);
                }
            }
        }

        return Vector2.add(
            this.target.position,
            Vector2.multiply(targetVelocity, interceptTime)
        );
    }

    /**
     * Update movement
     * @param {number} dt - Delta time
     */
    updateMovement(dt) {
        // Update position
        this.position.add(Vector2.multiply(this.velocity, dt / 1000));

        // Maintain constant speed
        if (this.velocity.magnitude() > 0) {
            this.velocity = this.velocity.normalized().multiply(this.speed);
        }
    }

    /**
     * Update visual properties
     * @param {number} dt - Delta time
     */
    updateVisuals(dt) {
        // Update trail
        this.updateTrail();

        this.glowIntensity = lerp(this.glowIntensity, 0.7, 0.05);

        // Update rotation to match velocity direction
        if (this.velocity.magnitude() > 0) {
            this.rotation = Math.atan2(this.velocity.y, this.velocity.x);
        }
    }

    /**
     * Update particle trail
     */
    updateTrail() {
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

        // Remove trail points that are too old
        const maxAge = 200; // milliseconds
        const now = Date.now();
        this.trail = this.trail.filter(point => now - point.time < maxAge);
    }

    /**
     * Check for proximity detonation
     */
    checkProximityDetonation() {
        if (this.hasExploded || !this.target) return;

        const distance = this.position.distanceTo(this.target.position);

        if (distance <= this.proximityDetonation) {
            this.detonate();
        }
    }

    /**
     * Detonate the projectile
     */
    detonate() {
        if (this.hasExploded) return;

        this.hasExploded = true;
        this.shouldRemove = true;

        // Create explosion effect
        this.createExplosion();

        // Play explosion sound
        this.playExplosionSound();
    }

    /**
     * Create explosion effect
     */
    createExplosion() {
        if (window.game && window.game.createParticles) {
            window.game.createParticles('explosion', this.position, {
                count: 8 + Math.floor(this.explosionRadius / 5),
                radius: this.explosionRadius || 20,
                damage: this.damage
            });
        }
    }

    /**
     * Check collision with target
     * @param {Object} target - Target object
     * @returns {boolean} True if collision occurred
     */
    checkCollision(target) {
        if (this.hasExploded) return false;

        const distance = this.position.distanceTo(target.position);
        const collisionDistance = this.size + target.size;

        if (distance <= collisionDistance) {
            this.detonate();
            return true;
        }

        return false;
    }

    /**
     * Get projectile info for debugging
     * @returns {Object} Projectile information
     */
    getInfo() {
        return {
            id: this.projectileId,
            behavior: 'fixed trajectory',
            hasTarget: !!this.target,
            position: { x: this.position.x, y: this.position.y },
            velocity: { x: this.velocity.x, y: this.velocity.y },
            life: this.life,
            damage: this.damage
        };
    }

    /**
     * Play launch sound effect
     */
    playLaunchSound() {
        // Placeholder for sound effect
        // In a real implementation, this would play a projectile launch sound
    }

    /**
     * Play explosion sound effect
     */
    playExplosionSound() {
        // Placeholder for sound effect
        // In a real implementation, this would play an explosion sound
    }

    /**
     * Draw the projectile
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        // Draw trail first
        this.drawTrail(ctx);

        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);

        // Glow effect
        if (this.glowIntensity > 0.5) {
            ctx.shadowColor = '#ffff00';
            ctx.shadowBlur = this.glowIntensity * 8;
        }

        // Draw projectile body
        this.drawBody(ctx);

        ctx.restore();
    }

    /**
     * Draw projectile body
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawBody(ctx) {
        // Main projectile
        ctx.fillStyle = '#ffff44';
        ctx.strokeStyle = '#ffaa00';
        ctx.lineWidth = 1;

        // Draw missile shape
        ctx.beginPath();
        ctx.moveTo(this.size * 2, 0);
        ctx.lineTo(-this.size, -this.size);
        ctx.lineTo(-this.size * 0.5, 0);
        ctx.lineTo(-this.size, this.size);
        ctx.closePath();

        ctx.fill();
        ctx.stroke();

        // Draw nose cone
        ctx.fillStyle = '#ffffaa';
        ctx.beginPath();
        ctx.arc(this.size * 1.5, 0, this.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Draw particle trail
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawTrail(ctx) {
        if (this.trail.length < 2) return;

        ctx.save();

        for (let i = 0; i < this.trail.length - 1; i++) {
            const point = this.trail[i];
            const nextPoint = this.trail[i + 1];
            const alpha = (this.trail.length - i) / this.trail.length;

            ctx.strokeStyle = `rgba(255, 150, 0, ${alpha * 0.8})`;
            ctx.lineWidth = alpha * 3;

            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(nextPoint.x, nextPoint.y);
            ctx.stroke();
        }

        ctx.restore();
    }

}
