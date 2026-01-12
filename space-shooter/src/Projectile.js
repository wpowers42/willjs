/**
 * Projectile class - Seeking missiles fired by the turret
 * Features intelligent targeting and smooth seeking behavior
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

        // Enhanced seeking behavior
        this.seekingPower = config.seekingPower || 0.005; // Increased from 0.003
        this.maxTurnRate = config.maxTurnRate || 0.08; // Increased from 0.05
        this.predictionTime = config.predictionTime || 0.8; // Increased from 0.5
        this.lockOnDistance = config.lockOnDistance || 500; // Increased from 400
        this.proximityDetonation = config.proximityDetonation || 20; // Increased from 15

        // State
        this.life = this.maxLifeTime;
        this.shouldRemove = false;
        this.hasExploded = false;
        this.isLocked = false;

        // Visual properties
        this.trail = [];
        this.trailLength = 8;
        this.glowIntensity = 1.0;
        this.rotation = 0;

        // Behavior phases
        this.phase = 'launch'; // launch, seeking, terminal
        this.launchTime = 150; // Reduced time before seeking begins
        this.terminalDistance = 40; // Increased distance when terminal phase begins

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
            const direction = Vector2.subtract(this.target.position, this.position).normalized();
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
     * @param {Array} asteroids - Array of potential targets
     * @param {Array} allProjectiles - Array of all projectiles for target coordination
     */
    update(dt, asteroids = [], allProjectiles = []) {
        // Update lifetime
        this.life -= dt;
        if (this.life <= 0) {
            this.detonate();
            return;
        }

        // Update phase and behavior
        this.updatePhase(dt);
        this.updateSeeking(dt, asteroids, allProjectiles);
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
     * Update behavior phase
     * @param {number} dt - Delta time
     */
    updatePhase(dt) {
        switch (this.phase) {
            case 'launch':
                this.launchTime -= dt;
                if (this.launchTime <= 0) {
                    this.phase = 'seeking';
                }
                break;

            case 'seeking':
                if (this.target && this.target.position) {
                    const distance = this.position.distanceTo(this.target.position);
                    if (distance <= this.terminalDistance) {
                        this.phase = 'terminal';
                    }
                }
                break;

            case 'terminal':
                // Maximum seeking power and turn rate in terminal phase
                this.seekingPower = Math.min(this.seekingPower * 2.0, 0.015);
                this.maxTurnRate = Math.min(this.maxTurnRate * 1.5, 0.12);
                break;
        }
    }

    /**
     * Update seeking behavior
     * @param {number} dt - Delta time
     * @param {Array} asteroids - Available targets
     * @param {Array} allProjectiles - Array of all projectiles for target coordination
     */
    updateSeeking(dt, asteroids, allProjectiles = []) {
        // Always try to acquire target if we don't have one, even during launch
        if (!this.target || !this.isTargetValid()) {
            this.acquireNewTarget(asteroids, allProjectiles);
        }

        // Only apply seeking forces after launch phase
        if (this.phase === 'launch') return;

        if (!this.target || !this.target.position) return;

        // Calculate seeking force
        const seekingForce = this.calculateSeekingForce();

        // Apply seeking force with turn rate limitation
        if (seekingForce.magnitude() > 0) {
            this.applySeeking(seekingForce, dt);
        }

        // Update lock status
        this.updateLockStatus();
    }

    /**
     * Check if current target is still valid
     * @returns {boolean} True if target is valid
     */
    isTargetValid() {
        if (!this.target || this.target.shouldRemove) return false;
        if (!this.target.position) return false;

        // Release lock if asteroid has moved below screen (earlier threshold to prevent chasing)
        if (this.target.position.y > window.innerHeight + 25) return false;

        // Keep target locked regardless of distance (removed distance check)
        return true;
    }

    /**
     * Acquire new target from available asteroids using danger-based prioritization
     * Now includes target spreading to prevent clustering on same asteroid
     * @param {Array} asteroids - Available targets
     * @param {Array} allProjectiles - All projectiles for coordination
     */
    acquireNewTarget(asteroids, allProjectiles = []) {
        let bestTarget = null;
        let bestScore = -1;

        const weights = this.getTargetingWeights();

        for (const asteroid of asteroids) {
            if (asteroid.shouldRemove) continue;
            if (asteroid.position.y > window.innerHeight + 25) continue; // Skip below-screen asteroids

            const distance = this.position.distanceTo(asteroid.position);

            // Calculate base threat score
            let threatScore = this.calculateDangerBasedScore(asteroid, distance);

            // Count how many other projectiles are targeting this asteroid
            const targetingCount = this.countTargetingProjectiles(asteroid, allProjectiles);

            // Apply spread penalty based on popularity and bucket behavior
            if (targetingCount > 0) {
                const spreadPenalty = 1 / (1 + targetingCount * weights.spreadFactor);
                threatScore *= spreadPenalty;

                // Debug logging for spread calculations
                if (window.game && window.game.showDebug && targetingCount > 1) {
                    console.log(`${weights.name} spread penalty: ${targetingCount} others targeting, penalty: ${spreadPenalty.toFixed(2)}`);
                }
            }

            // Add small randomization for high-spread buckets to break ties
            if (weights.spreadFactor >= 1.5) {
                const randomSeed = (this.projectileId * 17 + asteroid.position.x * 13) % 100;
                threatScore += randomSeed * 10; // Small random bonus
            }

            if (threatScore > bestScore) {
                bestScore = threatScore;
                bestTarget = asteroid;
            }
        }

        // Only change target if we found a better one or don't have one
        if (bestTarget) {
            // Debug logging to understand target selection
            if (window.game && window.game.showDebug && this.target !== bestTarget) {
                const weights = this.getTargetingWeights();
                console.log(`${weights.name} Projectile #${this.projectileId} acquired new target: Score ${bestScore.toFixed(0)} at (${bestTarget.position.x.toFixed(1)}, ${bestTarget.position.y.toFixed(1)})`);
            }
            this.target = bestTarget;
        }
    }

    /**
     * Count how many other projectiles are targeting the same asteroid
     * @param {Object} asteroid - Asteroid to check
     * @param {Array} allProjectiles - All projectiles to check against
     * @returns {number} Number of other projectiles targeting this asteroid
     */
    countTargetingProjectiles(asteroid, allProjectiles) {
        let count = 0;
        for (const projectile of allProjectiles) {
            // Skip self and projectiles without targets
            if (projectile === this || !projectile.target) continue;

            // Check if this projectile is targeting the same asteroid
            if (projectile.target === asteroid) {
                count++;
            }
        }
        return count;
    }

    /**
     * Calculate danger-based score for target prioritization with bucket-specific weights
     * Each projectile has a unique targeting behavior based on its bucket assignment
     * @param {Object} asteroid - Asteroid to evaluate
     * @param {number} distance - Distance to asteroid
     * @returns {number} Danger score (higher = more dangerous/priority)
     */
    calculateDangerBasedScore(asteroid, distance) {
        let score = 0;

        const game = window.game;
        if (!game || !game.city) return score;

        // Get targeting weights for this projectile's bucket
        const weights = this.getTargetingWeights();

        // PRIORITY 1: Asteroids on direct collision course with city (CRITICAL)
        const collisionInfo = this.calculateCollisionTrajectory(asteroid, game.city);
        if (collisionInfo.willHitCity) {
            // Base collision threat score (reduced to allow other factors more influence), weighted by bucket behavior
            let collisionScore = 50000 * weights.collisionThreat;

            // Higher priority for asteroids that will hit sooner
            if (collisionInfo.timeToImpact > 0 && collisionInfo.timeToImpact < 10000) {
                // Shorter time = higher priority (inverse relationship)
                collisionScore += Math.max(0, 10000 - collisionInfo.timeToImpact) * weights.collisionThreat;
            }

            // Factor in damage potential for collision threats
            const damageScore = (asteroid.damage || 1) * 1000 * weights.collisionThreat;
            collisionScore += damageScore;

            // Size matters more for collision threats
            const sizeScore = (asteroid.size || 15) / 35 * 2000 * weights.collisionThreat;
            collisionScore += sizeScore;

            score += collisionScore;

            // Debug logging for collision threats
            if (window.game && window.game.showDebug) {
                console.log(`${weights.name} COLLISION THREAT: Asteroid at (${asteroid.position.x.toFixed(1)}, ${asteroid.position.y.toFixed(1)}) - Score: ${score.toFixed(0)}`);
            }

            // For high collision threat weights, return early (Guardian behavior)
            if (weights.collisionThreat >= 2.5) {
                return score;
            }
        }

        // PRIORITY 2: Asteroids moving toward city area (HIGH THREAT)
        const cityThreatScore = this.calculateCityProximityThreat(asteroid, game.city);
        score += cityThreatScore * 1000 * weights.cityProximity;

        // PRIORITY 3: Projectile intercept factors (MEDIUM THREAT)
        const interceptScore = this.calculateInterceptProbability(asteroid);
        score += interceptScore * 500 * weights.intercept;

        // PRIORITY 4: Distance-based scoring (MEDIUM THREAT)
        const distanceScore = Math.max(0, (this.lockOnDistance - distance) / this.lockOnDistance);
        score += distanceScore * 300 * weights.distance;

        // PRIORITY 5: Alignment with current projectile direction (LOW-MEDIUM THREAT)
        const directionToAsteroid = Vector2.subtract(asteroid.position, this.position).normalized();
        const currentDirection = this.velocity.normalized();
        const alignmentScore = Math.max(0, directionToAsteroid.dot(currentDirection));
        score += alignmentScore * 200 * weights.alignment;

        // PRIORITY 6: General asteroid threat level (LOW THREAT)
        const generalThreatScore = asteroid.getThreatLevel ?
            asteroid.getThreatLevel(this.position) / 100 : 0.5;
        score += generalThreatScore * 100 * weights.generalThreat;

        // Debug logging for target selection (only when debug enabled and score is significant)
        if (window.game && window.game.showDebug && score > 1000) {
            console.log(`${weights.name} targeting: Asteroid at (${asteroid.position.x.toFixed(1)}, ${asteroid.position.y.toFixed(1)}) - Score: ${score.toFixed(0)}`);
        }

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
     * Calculate probability of successful intercept
     * @param {Object} asteroid - Target asteroid
     * @returns {number} Intercept probability (0-1)
     */
    calculateInterceptProbability(asteroid) {
        if (!asteroid.velocity) return 0.5;

        const distance = this.position.distanceTo(asteroid.position);
        const relativeSpeed = this.speed - asteroid.velocity.magnitude();

        // Better intercept probability for slower targets or closer range
        if (relativeSpeed <= 0) return 0.1; // Can't catch up

        const timeToIntercept = distance / relativeSpeed;
        return Math.max(0, Math.min(1, (3.0 - timeToIntercept) / 3.0));
    }

    /**
     * Calculate seeking force toward target
     * @returns {Vector2} Seeking force vector
     */
    calculateSeekingForce() {
        if (!this.target || !this.target.position) {
            return Vector2.ZERO;
        }

        // Predict target position
        const predictedPosition = this.predictTargetPosition();

        // Calculate desired velocity
        const desired = Vector2.subtract(predictedPosition, this.position).normalized();
        desired.multiply(this.speed);

        // Calculate steering force
        const steering = Vector2.subtract(desired, this.velocity);
        steering.multiply(this.seekingPower);

        return steering;
    }

    /**
     * Predict where target will be
     * @returns {Vector2} Predicted target position
     */
    predictTargetPosition() {
        if (!this.target.velocity) {
            return this.target.position.clone();
        }

        const distance = this.position.distanceTo(this.target.position);
        const timeToTarget = distance / this.speed;
        const effectivePredictionTime = Math.min(timeToTarget * this.predictionTime, 1.0);

        const futureVelocity = Vector2.multiply(this.target.velocity, effectivePredictionTime);
        return Vector2.add(this.target.position, futureVelocity);
    }

    /**
     * Apply seeking force with turn rate limitation
     * @param {Vector2} seekingForce - Force to apply
     * @param {number} dt - Delta time
     */
    applySeeking(seekingForce, dt) {
        // Current direction
        const currentDirection = this.velocity.normalized();

        // Desired direction
        const newVelocity = Vector2.add(this.velocity, Vector2.multiply(seekingForce, dt));
        const desiredDirection = newVelocity.normalized();

        // Calculate angle difference
        const angleDiff = Math.acos(Math.max(-1, Math.min(1, currentDirection.dot(desiredDirection))));

        // Limit turn rate
        const maxTurn = this.maxTurnRate * (dt / 16.67); // Normalize to 60fps
        const actualTurn = Math.min(angleDiff, maxTurn);

        if (actualTurn > 0.001) {
            // Calculate which direction to turn
            const cross = currentDirection.x * desiredDirection.y - currentDirection.y * desiredDirection.x;
            const turnDirection = Math.sign(cross);

            // Apply limited turn
            const finalDirection = currentDirection.clone();
            finalDirection.rotate(actualTurn * turnDirection);

            this.velocity = Vector2.multiply(finalDirection, this.speed);
            this.rotation = Math.atan2(finalDirection.y, finalDirection.x);
        }
    }

    /**
     * Update lock-on status
     */
    updateLockStatus() {
        if (!this.target) {
            this.isLocked = false;
            return;
        }

        const distance = this.position.distanceTo(this.target.position);
        const directionToTarget = Vector2.subtract(this.target.position, this.position).normalized();
        const projectileDirection = this.velocity.normalized();

        const alignment = directionToTarget.dot(projectileDirection);

        this.isLocked = distance <= this.lockOnDistance * 0.7 && alignment > 0.8;
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

        // Update glow based on phase and lock status
        if (this.isLocked) {
            this.glowIntensity = 1.0 + 0.3 * Math.sin(Date.now() * 0.01);
        } else {
            this.glowIntensity = lerp(this.glowIntensity, 0.7, 0.05);
        }

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
        const weights = this.getTargetingWeights();
        return {
            id: this.projectileId,
            bucket: this.targetingBucket,
            behavior: weights.name,
            phase: this.phase,
            isLocked: this.isLocked,
            hasTarget: !!this.target,
            position: { x: this.position.x, y: this.position.y },
            velocity: { x: this.velocity.x, y: this.velocity.y },
            life: this.life,
            damage: this.damage,
            seekingPower: this.seekingPower,
            weights: weights
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
            ctx.shadowColor = this.isLocked ? '#ff0000' : '#ffff00';
            ctx.shadowBlur = this.glowIntensity * 8;
        }

        // Draw projectile body
        this.drawBody(ctx);

        // Draw seeking indicator
        if (this.isLocked && this.target) {
            this.drawLockIndicator(ctx);
        }

        ctx.restore();
    }

    /**
     * Draw projectile body
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawBody(ctx) {
        // Main projectile
        ctx.fillStyle = this.isLocked ? '#ff4444' : '#ffff44';
        ctx.strokeStyle = this.isLocked ? '#ff0000' : '#ffaa00';
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
        ctx.fillStyle = this.isLocked ? '#ffffff' : '#ffffaa';
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

    /**
     * Draw lock-on indicator
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawLockIndicator(ctx) {
        if (!this.target) return;

        ctx.save();
        ctx.rotate(-this.rotation); // Counter-rotate

        const targetPos = Vector2.subtract(this.target.position, this.position);
        const distance = targetPos.magnitude();

        if (distance > 20) {
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.6)';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);

            ctx.beginPath();
            ctx.moveTo(this.size * 2, 0);
            ctx.lineTo(targetPos.x, targetPos.y);
            ctx.stroke();

            ctx.setLineDash([]);
        }

        ctx.restore();
    }
}
