/**
 * City class - The space city that must be protected
 * Represents the player's objective to defend
 */

import Vector2 from './utils/Vector2.js';
import { random, lerp } from './utils/Utils.js';
import Projectile from './Projectile.js';

export default class City {
    constructor(x, y) {
        this.position = new Vector2(x, y);
        this.size = 40;
        
        // Health system
        this.health = 10;
        this.maxHealth = 10;
        this.isDestroyed = false;
        
        // Visual properties
        this.buildings = this.generateBuildings();
        this.lights = this.generateLights();
        this.damageLevel = 0; // 0 = pristine, 1 = destroyed
        
        // Animation properties
        this.damageFlashTime = 0;
        this.emergencyLightPhase = 0;
        this.smokeParticles = [];
        this.fireParticles = [];
        
        // Shield system (active by default)
        this.hasShield = true;
        this.shieldHealth = 5;
        this.maxShieldHealth = 5;
        this.shieldRegenRate = 1.0; // 1 shield point per second
        this.shieldRegenDelay = 0;
        this.lastDamageTime = 0;
        
        // Repair system
        this.repairProgress = 0;
        this.isRepairing = false;
        
        // Integrated defense system
        this.defense = {
            // Targeting system
            target: null,
            targetingRange: Infinity,
            lastTargetUpdate: 0,
            targetUpdateInterval: 100,
            
            // Firing system
            lastFireTime: 0,
            fireRate: 800,
            projectileSpeed: 200,
            projectileDamage: 1,
            canFire: true,
            
            // Upgrade properties
            upgrades: {
                fireRate: 0,
                damage: 0,
                multiShot: 0
            }
        };
        
        this.shouldRemove = false;
    }

    /**
     * Generate building structures for the city
     * @returns {Array} Array of building objects
     */
    generateBuildings() {
        const buildings = [];
        const buildingCount = 8;
        const baseWidth = this.size * 2;
        
        for (let i = 0; i < buildingCount; i++) {
            const x = (i / (buildingCount - 1)) * baseWidth - baseWidth / 2;
            const height = random(15, 35);
            const width = random(8, 15);
            
            buildings.push({
                x: x,
                y: -height / 2,
                width: width,
                height: height,
                type: this.getBuildingType(height),
                windows: this.generateWindows(width, height),
                damaged: false
            });
        }
        
        return buildings;
    }

    /**
     * Determine building type based on height
     * @param {number} height - Building height
     * @returns {string} Building type
     */
    getBuildingType(height) {
        if (height > 28) return 'skyscraper';
        if (height > 20) return 'tower';
        return 'building';
    }

    /**
     * Generate windows for a building
     * @param {number} width - Building width
     * @param {number} height - Building height
     * @returns {Array} Array of window objects
     */
    generateWindows(width, height) {
        const windows = [];
        const windowSize = 2;
        const spacing = 4;
        
        const cols = Math.floor(width / spacing);
        const rows = Math.floor(height / spacing);
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (Math.random() > 0.3) { // 70% chance for window
                    windows.push({
                        x: (col * spacing) - width / 2 + spacing / 2,
                        y: (row * spacing) - height / 2 + spacing / 2,
                        size: windowSize,
                        lit: Math.random() > 0.4 // 60% chance window is lit
                    });
                }
            }
        }
        
        return windows;
    }

    /**
     * Generate decorative lights around the city
     * @returns {Array} Array of light objects
     */
    generateLights() {
        const lights = [];
        const lightCount = 12;
        
        for (let i = 0; i < lightCount; i++) {
            const angle = (i / lightCount) * Math.PI * 2;
            const radius = this.size + random(10, 25);
            
            lights.push({
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius,
                color: this.getRandomLightColor(),
                intensity: random(0.5, 1.0),
                flickerSpeed: random(0.01, 0.03),
                phase: random(0, Math.PI * 2)
            });
        }
        
        return lights;
    }

    /**
     * Get random light color for city ambiance
     * @returns {string} CSS color string
     */
    getRandomLightColor() {
        const colors = ['#00ff88', '#0088ff', '#ff8800', '#ff4444', '#8844ff', '#44ff88'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * Update city logic
     * @param {number} dt - Delta time in milliseconds
     * @param {Array} asteroids - Array of asteroids for turret targeting
     * @param {Array} projectiles - Array to add projectiles to
     */
    update(dt, asteroids = [], projectiles = []) {
        // Update animations
        this.updateAnimations(dt);
        
        // Update shield system
        this.updateShield(dt);
        
        // Update damage effects
        this.updateDamageEffects(dt);
        
        // Update particles
        this.updateParticles(dt);
        
        // Update integrated defense system
        this.updateDefenseSystem(dt, asteroids, projectiles);
        
        // Check if city should be removed
        if (this.health <= 0 && !this.isDestroyed) {
            this.destroy();
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
        
        // Update emergency lights when damaged
        if (this.health < this.maxHealth) {
            this.emergencyLightPhase += dt * 0.01;
        }
        
        // Update light flickering
        for (const light of this.lights) {
            light.phase += light.flickerSpeed * dt;
        }
    }

    /**
     * Update shield system
     * @param {number} dt - Delta time
     */
    updateShield(dt) {
        if (!this.hasShield) return;
        
        // Shield regeneration
        this.shieldRegenDelay -= dt;
        if (this.shieldRegenDelay <= 0 && this.shieldHealth < this.maxShieldHealth) {
            this.shieldHealth += this.shieldRegenRate * (dt / 1000);
            if (this.shieldHealth > this.maxShieldHealth) {
                this.shieldHealth = this.maxShieldHealth;
            }
        }
    }

    /**
     * Update damage effects
     * @param {number} dt - Delta time
     */
    updateDamageEffects(dt) {
        // Update damage level based on health
        this.damageLevel = 1 - (this.health / this.maxHealth);
        
        // Damage buildings randomly when city is damaged
        if (this.damageLevel > 0.5 && Math.random() < 0.001) {
            this.damageRandomBuilding();
        }
        
        // Generate smoke particles when heavily damaged
        if (this.damageLevel > 0.3 && Math.random() < 0.1) {
            this.createSmokeParticle();
        }
        
        // Generate fire particles when critically damaged
        if (this.damageLevel > 0.7 && Math.random() < 0.05) {
            this.createFireParticle();
        }
    }

    /**
     * Update particle systems
     * @param {number} dt - Delta time
     */
    updateParticles(dt) {
        // Update smoke particles
        for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
            const particle = this.smokeParticles[i];
            particle.update(dt);
            
            if (particle.shouldRemove) {
                this.smokeParticles.splice(i, 1);
            }
        }
        
        // Update fire particles
        for (let i = this.fireParticles.length - 1; i >= 0; i--) {
            const particle = this.fireParticles[i];
            particle.update(dt);
            
            if (particle.shouldRemove) {
                this.fireParticles.splice(i, 1);
            }
        }
    }

    /**
     * Update integrated defense system
     * @param {number} dt - Delta time
     * @param {Array} asteroids - Available targets
     * @param {Array} projectiles - Array to add projectiles to
     */
    updateDefenseSystem(dt, asteroids, projectiles) {
        // Update targeting
        this.updateDefenseTargeting(dt, asteroids);
        
        // Update firing
        this.updateDefenseFiring(dt, projectiles);
    }


    /**
     * Update defense targeting system
     * @param {number} dt - Delta time
     * @param {Array} asteroids - Available targets
     */
    updateDefenseTargeting(dt, asteroids) {
        this.defense.lastTargetUpdate += dt;
        
        if (this.defense.lastTargetUpdate >= this.defense.targetUpdateInterval) {
            this.acquireTarget(asteroids);
            this.defense.lastTargetUpdate = 0;
        }
    }

    /**
     * Acquire best target for turret using enhanced danger-based prioritization
     * Prioritizes asteroids on collision course with city above all else
     * @param {Array} asteroids - Available targets
     */
    acquireTarget(asteroids) {
        let bestTarget = null;
        let bestScore = -1;
        
        for (const asteroid of asteroids) {
            if (asteroid.shouldRemove) continue;
            
            // Only target asteroids that are on screen
            if (!this.isAsteroidOnScreen(asteroid)) continue;
            
            const distance = this.position.distanceTo(asteroid.position);
            
            // Use enhanced threat calculation that prioritizes collision trajectories
            const threatScore = this.calculateThreatScore(asteroid, distance);
            
            if (threatScore > bestScore) {
                bestScore = threatScore;
                bestTarget = asteroid;
            }
        }
        
        this.defense.target = bestTarget;
    }

    /**
     * Check if asteroid is visible on screen
     * @param {Object} asteroid - Asteroid to check
     * @returns {boolean} True if asteroid is on screen
     */
    isAsteroidOnScreen(asteroid) {
        const game = window.game;
        if (!game) return false;
        
        const margin = 50;
        return asteroid.position.x >= -margin &&
               asteroid.position.x <= game.width + margin &&
               asteroid.position.y >= -margin &&
               asteroid.position.y <= game.height + margin;
    }

    /**
     * Calculate basic threat score for target prioritization
     * Note: Main targeting logic is now handled by projectiles themselves
     * @param {Object} asteroid - Asteroid to evaluate
     * @param {number} distance - Distance to asteroid
     * @returns {number} Threat score (higher = more threatening)
     */
    calculateThreatScore(asteroid, distance) {
        let score = 0;
        
        // Basic distance scoring
        const distanceScore = Math.max(0, (1000 - distance) / 1000);
        score += distanceScore * 0.5;
        
        // Speed factor
        const speed = asteroid.velocity ? asteroid.velocity.magnitude() : 50;
        const speedScore = speed / 100;
        score += speedScore * 0.3;
        
        // Damage factor
        const damageScore = (asteroid.damage || 1) / 5;
        score += damageScore * 0.2;
        
        return score;
    }

    /**
     * Update defense firing system
     * @param {number} dt - Delta time
     * @param {Array} projectiles - Array to add projectiles to
     */
    updateDefenseFiring(dt, projectiles) {
        this.defense.lastFireTime += dt;
        
        const effectiveFireRate = this.getDefenseEffectiveFireRate();
        
        if (this.defense.canFire && this.defense.target && this.defense.lastFireTime >= effectiveFireRate) {
            this.fireDefenseProjectiles(projectiles);
            this.defense.lastFireTime = 0;
        }
    }

    /**
     * Fire defense projectiles
     * @param {Array} projectiles - Array to add projectiles to
     */
    fireDefenseProjectiles(projectiles) {
        if (!this.defense.target) return;
        
        const multiShotCount = 1 + this.defense.upgrades.multiShot;
        const spreadAngle = multiShotCount > 1 ? Math.PI / 12 : 0;
        
        for (let i = 0; i < multiShotCount; i++) {
            const angleOffset = multiShotCount > 1 ? 
                (i - (multiShotCount - 1) / 2) * (spreadAngle / (multiShotCount - 1)) : 0;
            
            this.createDefenseProjectile(projectiles, angleOffset);
        }
    }

    /**
     * Create defense projectile fired from city center
     * @param {Array} projectiles - Array to add projectile to
     * @param {number} angleOffset - Angle offset for spread shot
     */
    createDefenseProjectile(projectiles, angleOffset = 0) {
        // Fire from fixed point at city center
        const firePosition = this.position.clone();
        
        // Create projectile configuration with intelligent static seeking defaults
        const projectileConfig = {
            speed: this.defense.projectileSpeed,
            damage: this.getDefenseEffectiveDamage(),
            size: 3,
            maxLifeTime: 4000,
            seekingPower: 0.015,    // Optimal intelligent seeking strength
            maxTurnRate: 0.11,      // Fast turning for effective tracking
            predictionTime: 1.1,    // Strong target prediction
            lockOnDistance: 500,
            proximityDetonation: 20
        };
        
        // Create projectile with no initial target - let projectile choose
        const projectile = new Projectile(
            firePosition.x, 
            firePosition.y, 
            null, // No initial target - projectile will find best target
            projectileConfig
        );
        
        // Apply angle offset for spread shots
        if (angleOffset !== 0) {
            projectile.velocity.rotate(angleOffset);
            projectile.rotation += angleOffset;
        }
        
        projectiles.push(projectile);
    }


    /**
     * Get effective fire rate with upgrades
     * @returns {number} Fire rate in milliseconds
     */
    getDefenseEffectiveFireRate() {
        const reduction = this.defense.upgrades.fireRate * 0.15;
        return this.defense.fireRate * Math.max(0.2, 1 - reduction);
    }

    /**
     * Get effective damage with upgrades
     * @returns {number} Damage amount
     */
    getDefenseEffectiveDamage() {
        return this.defense.projectileDamage + this.defense.upgrades.damage;
    }

    /**
     * Apply defense upgrade
     * @param {string} upgradeType - Type of upgrade
     */
    applyDefenseUpgrade(upgradeType) {
        if (this.defense.upgrades.hasOwnProperty(upgradeType)) {
            this.defense.upgrades[upgradeType]++;
            return true;
        }
        return false;
    }

    /**
     * Take damage to the city
     * @param {number} damage - Amount of damage
     * @param {Vector2} impactPosition - Where the damage occurred
     */
    takeDamage(damage, impactPosition = null) {
        // Apply damage to shield first
        if (this.hasShield && this.shieldHealth > 0) {
            const shieldDamage = Math.min(damage, this.shieldHealth);
            this.shieldHealth -= shieldDamage;
            damage -= shieldDamage;
            
            this.shieldRegenDelay = 3000; // 3 second delay before shield regen
            this.lastDamageTime = Date.now();
            
            if (damage <= 0) {
                this.createShieldImpactEffect(impactPosition);
                return false; // Shield absorbed all damage
            }
        }
        
        // Apply damage to city health
        this.health -= damage;
        this.damageFlashTime = 300; // Flash for 300ms
        this.lastDamageTime = Date.now();
        
        if (this.health < 0) {
            this.health = 0;
        }
        
        // Create impact effects
        this.createImpactEffect(impactPosition, damage);
        
        // Damage nearby buildings
        if (impactPosition) {
            this.damageNearbyBuildings(impactPosition, damage);
        }
        
        return this.health <= 0;
    }

    /**
     * Heal the city
     * @param {number} amount - Amount to heal
     */
    heal(amount) {
        if (this.isDestroyed) return;
        
        this.health += amount;
        if (this.health > this.maxHealth) {
            this.health = this.maxHealth;
        }
        
        // Repair some buildings
        this.repairBuildings(amount);
    }

    /**
     * Repair city damage (store upgrade function)
     * @param {number} repairAmount - Amount of health to restore
     */
    repairCity(repairAmount = 3) {
        if (this.isDestroyed) return false;
        
        const oldHealth = this.health;
        this.heal(repairAmount);
        
        // Visual repair effects
        this.createRepairEffect();
        
        return this.health > oldHealth;
    }

    /**
     * Create repair visual effect
     */
    createRepairEffect() {
        // Create healing particles
        for (let i = 0; i < 10; i++) {
            const particle = {
                position: new Vector2(
                    this.position.x + random(-this.size, this.size),
                    this.position.y + random(-this.size, this.size)
                ),
                velocity: new Vector2(random(-30, 30), random(-50, -10)),
                life: 1500,
                maxLife: 1500,
                size: random(2, 4),
                color: '#00ff88',
                shouldRemove: false,
                
                update: function(dt) {
                    this.position.add(Vector2.multiply(this.velocity, dt / 1000));
                    this.velocity.multiply(0.98); // Slow down
                    this.life -= dt;
                    
                    if (this.life <= 0) {
                        this.shouldRemove = true;
                    }
                }
            };
            
            // Add to existing particle systems (could extend this)
            if (window.game && window.game.createParticles) {
                window.game.createParticles('repair', this.position, {
                    count: 10,
                    color: '#00ff88'
                });
            }
        }
    }

    /**
     * Activate shield system
     * @param {number} shieldHealth - Shield capacity
     * @param {number} regenRate - Regeneration rate per second
     */
    activateShield(shieldHealth, regenRate) {
        this.hasShield = true;
        this.maxShieldHealth = shieldHealth;
        this.shieldHealth = shieldHealth;
        this.shieldRegenRate = regenRate;
    }

    /**
     * Destroy the city
     */
    destroy() {
        this.isDestroyed = true;
        this.health = 0;
        
        // Damage all buildings
        for (const building of this.buildings) {
            building.damaged = true;
        }
        
        // Turn off most lights
        for (const light of this.lights) {
            if (Math.random() < 0.8) {
                light.intensity = 0;
            }
        }
        
        // Create destruction effects
        this.createDestructionEffect();
        
        // Game over trigger
        if (window.game) {
            window.game.gameOver();
        }
    }

    /**
     * Damage a random building
     */
    damageRandomBuilding() {
        const undamagedBuildings = this.buildings.filter(b => !b.damaged);
        if (undamagedBuildings.length > 0) {
            const building = undamagedBuildings[Math.floor(Math.random() * undamagedBuildings.length)];
            building.damaged = true;
        }
    }

    /**
     * Damage buildings near impact point
     * @param {Vector2} impactPosition - Impact location
     * @param {number} damage - Damage amount
     */
    damageNearbyBuildings(impactPosition, damage) {
        const localImpact = Vector2.subtract(impactPosition, this.position);
        const damageRadius = damage * 15;
        
        for (const building of this.buildings) {
            const buildingCenter = new Vector2(building.x, building.y);
            const distance = buildingCenter.distanceTo(localImpact);
            
            if (distance <= damageRadius && Math.random() < 0.3) {
                building.damaged = true;
            }
        }
    }

    /**
     * Repair damaged buildings
     * @param {number} amount - Repair amount
     */
    repairBuildings(amount) {
        const damagedBuildings = this.buildings.filter(b => b.damaged);
        const repairCount = Math.min(amount, damagedBuildings.length);
        
        for (let i = 0; i < repairCount; i++) {
            if (damagedBuildings.length > 0) {
                const building = damagedBuildings[Math.floor(Math.random() * damagedBuildings.length)];
                building.damaged = false;
            }
        }
    }

    /**
     * Create smoke particle
     */
    createSmokeParticle() {
        const particle = {
            position: new Vector2(
                this.position.x + random(-this.size, this.size),
                this.position.y + random(-this.size / 2, this.size / 2)
            ),
            velocity: new Vector2(random(-10, 10), random(-30, -10)),
            life: random(2000, 4000),
            maxLife: 4000,
            size: random(3, 8),
            opacity: random(0.3, 0.7),
            shouldRemove: false,
            
            update: function(dt) {
                this.position.add(Vector2.multiply(this.velocity, dt / 1000));
                this.velocity.multiply(0.995); // Slow down over time
                this.life -= dt;
                this.size += dt * 0.002; // Expand over time
                this.opacity = (this.life / this.maxLife) * 0.7;
                
                if (this.life <= 0) {
                    this.shouldRemove = true;
                }
            }
        };
        
        this.smokeParticles.push(particle);
    }

    /**
     * Create fire particle
     */
    createFireParticle() {
        const particle = {
            position: new Vector2(
                this.position.x + random(-this.size / 2, this.size / 2),
                this.position.y + random(-this.size / 4, this.size / 4)
            ),
            velocity: new Vector2(random(-5, 5), random(-20, -5)),
            life: random(500, 1500),
            maxLife: 1500,
            size: random(2, 5),
            color: Math.random() > 0.5 ? '#ff4400' : '#ff8800',
            shouldRemove: false,
            
            update: function(dt) {
                this.position.add(Vector2.multiply(this.velocity, dt / 1000));
                this.velocity.y -= 20 * (dt / 1000); // Fire rises
                this.life -= dt;
                
                if (this.life <= 0) {
                    this.shouldRemove = true;
                }
            }
        };
        
        this.fireParticles.push(particle);
    }

    /**
     * Create impact effect at damage location
     * @param {Vector2} impactPosition - Impact location
     * @param {number} damage - Damage amount
     */
    createImpactEffect(impactPosition, damage) {
        if (window.game && window.game.createParticles) {
            window.game.createParticles('cityImpact', impactPosition, {
                count: damage * 5,
                intensity: damage,
                color: '#ff4444'
            });
        }
    }

    /**
     * Create shield impact effect
     * @param {Vector2} impactPosition - Impact location
     */
    createShieldImpactEffect(impactPosition) {
        if (window.game && window.game.createParticles) {
            window.game.createParticles('shieldImpact', impactPosition, {
                count: 8,
                color: '#4488ff',
                sparkle: true
            });
        }
    }

    /**
     * Create destruction effect when city is destroyed
     */
    createDestructionEffect() {
        if (window.game && window.game.createParticles) {
            window.game.createParticles('cityDestruction', this.position, {
                count: 50,
                radius: this.size * 2,
                intensity: 10
            });
        }
        
        // Create screen shake effect
        if (window.game && window.game.addScreenShake) {
            window.game.addScreenShake(1000, 10);
        }
    }

    /**
     * Draw the city
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        
        // Health flash effect
        if (this.damageFlashTime > 0) {
            ctx.globalAlpha = 0.3 + 0.7 * Math.sin(this.damageFlashTime * 0.02);
        }
        
        // Draw shield if active
        if (this.hasShield && this.shieldHealth > 0) {
            this.drawShield(ctx);
        }
        
        // Draw city base
        this.drawBase(ctx);
        
        // Draw buildings
        this.drawBuildings(ctx);
        
        // Draw lights
        this.drawLights(ctx);
        
        
        // Draw particles
        this.drawParticles(ctx);
        
        ctx.restore();
        
        // Draw health bar
        this.drawHealthBar(ctx);
    }

    /**
     * Draw city base platform
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawBase(ctx) {
        const baseColor = this.isDestroyed ? '#444' : '#666';
        const baseHeight = 8;
        
        ctx.fillStyle = baseColor;
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2;
        
        // Main platform
        ctx.fillRect(-this.size, this.size / 2 - baseHeight, this.size * 2, baseHeight);
        ctx.strokeRect(-this.size, this.size / 2 - baseHeight, this.size * 2, baseHeight);
        
        // Support pillars
        const pillarCount = 4;
        for (let i = 0; i < pillarCount; i++) {
            const x = (i / (pillarCount - 1)) * (this.size * 1.5) - this.size * 0.75;
            ctx.fillRect(x - 2, this.size / 2 - baseHeight, 4, baseHeight + 5);
        }
    }

    /**
     * Draw city buildings
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawBuildings(ctx) {
        for (const building of this.buildings) {
            this.drawBuilding(ctx, building);
        }
    }

    /**
     * Draw individual building
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} building - Building object
     */
    drawBuilding(ctx, building) {
        ctx.save();
        ctx.translate(building.x, building.y);
        
        // Building color based on damage and type
        let buildingColor = '#00ff88';
        if (building.damaged) {
            buildingColor = '#666';
        } else if (building.type === 'skyscraper') {
            buildingColor = '#00cc99';
        } else if (building.type === 'tower') {
            buildingColor = '#00dd77';
        }
        
        // Draw building body
        ctx.fillStyle = buildingColor;
        ctx.strokeStyle = '#44aa66';
        ctx.lineWidth = 1;
        
        ctx.fillRect(-building.width / 2, 0, building.width, building.height);
        ctx.strokeRect(-building.width / 2, 0, building.width, building.height);
        
        // Draw windows
        if (!building.damaged) {
            this.drawWindows(ctx, building);
        }
        
        // Draw building details
        if (building.type === 'skyscraper') {
            this.drawSkyscraperDetails(ctx, building);
        }
        
        ctx.restore();
    }

    /**
     * Draw building windows
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} building - Building object
     */
    drawWindows(ctx, building) {
        for (const window of building.windows) {
            if (window.lit && !building.damaged) {
                ctx.fillStyle = this.emergencyLightPhase > 0 ? 
                    `rgba(255, 100, 100, ${0.8 + 0.2 * Math.sin(this.emergencyLightPhase)})` :
                    'rgba(255, 255, 150, 0.8)';
            } else {
                ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
            }
            
            ctx.fillRect(
                window.x - window.size / 2,
                window.y - window.size / 2,
                window.size,
                window.size
            );
        }
    }

    /**
     * Draw skyscraper details
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} building - Building object
     */
    drawSkyscraperDetails(ctx, building) {
        // Antenna
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -8);
        ctx.stroke();
        
        // Blinking light on top
        if (!building.damaged && Math.sin(Date.now() * 0.005) > 0) {
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(0, -8, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Draw city lights
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawLights(ctx) {
        if (this.isDestroyed) return;
        
        for (const light of this.lights) {
            if (light.intensity > 0.1) {
                const flickerIntensity = light.intensity * (0.8 + 0.2 * Math.sin(light.phase));
                
                ctx.fillStyle = light.color;
                ctx.globalAlpha = flickerIntensity * 0.8;
                ctx.beginPath();
                ctx.arc(light.x, light.y, 2, 0, Math.PI * 2);
                ctx.fill();
                
                // Glow effect
                ctx.shadowColor = light.color;
                ctx.shadowBlur = flickerIntensity * 8;
                ctx.beginPath();
                ctx.arc(light.x, light.y, 1, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }

    /**
     * Draw shield effect
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawShield(ctx) {
        const shieldRadius = this.size + 15;
        const shieldAlpha = (this.shieldHealth / this.maxShieldHealth) * 0.3;
        
        ctx.save();
        ctx.globalAlpha = shieldAlpha;
        ctx.strokeStyle = '#4488ff';
        ctx.lineWidth = 3;
        
        // Shield outline
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(0, 0, shieldRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Shield energy pattern
        ctx.setLineDash([]);
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + Date.now() * 0.002;
            const x = Math.cos(angle) * shieldRadius;
            const y = Math.sin(angle) * shieldRadius;
            
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }

    /**
     * Draw particle effects
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawParticles(ctx) {
        // Draw smoke particles
        for (const particle of this.smokeParticles) {
            ctx.save();
            ctx.globalAlpha = particle.opacity;
            ctx.fillStyle = '#666';
            ctx.beginPath();
            ctx.arc(particle.position.x - this.position.x, particle.position.y - this.position.y, 
                   particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        
        // Draw fire particles
        for (const particle of this.fireParticles) {
            ctx.save();
            const lifePercent = particle.life / particle.maxLife;
            ctx.globalAlpha = lifePercent;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.position.x - this.position.x, particle.position.y - this.position.y, 
                   particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }



    /**
     * Draw health bar above city
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawHealthBar(ctx) {
        const barWidth = 60;
        const barHeight = 6;
        const yOffset = -this.size - 20;
        
        ctx.save();
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(
            this.position.x - barWidth / 2,
            this.position.y + yOffset,
            barWidth,
            barHeight
        );
        
        // Health fill
        const healthPercent = this.health / this.maxHealth;
        const fillWidth = barWidth * healthPercent;
        
        let healthColor = '#00ff00';
        if (healthPercent < 0.3) healthColor = '#ff0000';
        else if (healthPercent < 0.6) healthColor = '#ffff00';
        
        ctx.fillStyle = healthColor;
        ctx.fillRect(
            this.position.x - barWidth / 2,
            this.position.y + yOffset,
            fillWidth,
            barHeight
        );
        
        // Shield bar
        if (this.hasShield && this.maxShieldHealth > 0) {
            const shieldPercent = this.shieldHealth / this.maxShieldHealth;
            const shieldFillWidth = barWidth * shieldPercent;
            
            ctx.fillStyle = 'rgba(100, 150, 255, 0.7)';
            ctx.fillRect(
                this.position.x - barWidth / 2,
                this.position.y + yOffset - 8,
                shieldFillWidth,
                4
            );
        }
        
        // Border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(
            this.position.x - barWidth / 2,
            this.position.y + yOffset,
            barWidth,
            barHeight
        );
        
        ctx.restore();
    }

    /**
     * Get city statistics
     * @returns {Object} City stats
     */
    getStats() {
        return {
            health: this.health,
            maxHealth: this.maxHealth,
            isDestroyed: this.isDestroyed,
            damageLevel: this.damageLevel,
            hasShield: this.hasShield,
            shieldHealth: this.shieldHealth,
            maxShieldHealth: this.maxShieldHealth,
            buildingCount: this.buildings.length,
            damagedBuildings: this.buildings.filter(b => b.damaged).length
        };
    }
}