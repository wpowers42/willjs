/**
 * Main Game class that manages the game loop and overall state
 */

import Vector2 from './utils/Vector2.js';
import { SpatialGrid } from './utils/Collision.js';
import City from './City.js';
import Asteroid from './Asteroid.js';
import Projectile from './Projectile.js';
import Store from './Store.js';
import { random, randomInt } from './utils/Utils.js';

export default class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        // Use clientWidth/clientHeight to get the actual display size
        this.width = canvas.clientWidth || canvas.width;
        this.height = canvas.clientHeight || canvas.height;

        // Game state
        this.isRunning = false;
        this.isPaused = false;
        this.isGameOver = false;
        this.score = 0;
        this.gameTime = 0;

        // Game objects arrays
        this.entities = [];
        this.projectiles = [];
        this.asteroids = [];
        this.particles = [];

        // Core game objects (will be set later)
        this.city = null;

        // Systems
        this.spatialGrid = new SpatialGrid(100);
        this.inputHandler = null;
        this.ui = null;
        this.store = null;

        // Timing
        this.lastTime = 0;
        this.accumulator = 0;
        this.deltaTime = 1000 / 60; // 60 FPS target
        this.maxDeltaTime = 1000 / 30; // Prevent spiral of death

        // Game settings
        this.baseAsteroidSpawnRate = 2000; // Base milliseconds between spawns (reduced for easier start)
        this.asteroidSpawnRate = this.baseAsteroidSpawnRate;
        this.lastAsteroidSpawn = 0;
        this.difficultyMultiplier = 1.0;

        // Starfield for background
        this.stars = [];
        this.initializeStarfield();

        // Debug mode disabled for final version
        this.showDebug = false;

        // Bind methods
        this.gameLoop = this.gameLoop.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleMouseClick = this.handleMouseClick.bind(this);

        // Initialize
        this.init();
    }

    /**
     * Update canvas dimensions (called when canvas is resized)
     */
    updateDimensions() {
        this.width = this.canvas.clientWidth || this.canvas.width;
        this.height = this.canvas.clientHeight || this.canvas.height;
        console.log('Canvas dimensions updated:', this.width, 'x', this.height);
    }

    /**
     * Initialize the game
     */
    init() {
        // Set up input handling
        document.addEventListener('keydown', this.handleKeyPress);
        this.canvas.addEventListener('click', this.handleMouseClick);

        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        // Set up canvas
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        console.log('Game initialized');
    }

    /**
     * Start the game
     */
    start() {
        if (this.isRunning) return;

        // Update dimensions to ensure we have current canvas size
        this.updateDimensions();

        this.isRunning = true;
        this.isPaused = false;
        this.isGameOver = false;
        this.score = 100000; // Debug: Start with high score for testing upgrades
        this.gameTime = 0;
        this.lastTime = performance.now();

        // Reset arrays
        this.entities.length = 0;
        this.projectiles.length = 0;
        this.asteroids.length = 0;
        this.particles.length = 0;

        // Initialize game objects
        this.initializeGameObjects();

        // Start game loop
        requestAnimationFrame(this.gameLoop);

        console.log('Game started');
    }

    /**
     * Initialize core game objects
     */
    initializeGameObjects() {
        // Position objects on the ground surface
        const groundHeight = 40;
        const groundLevel = this.height - groundHeight;

        // City centered horizontally on the ground
        const cityX = this.width / 2;
        const cityY = groundLevel - 20; // Slightly above ground surface

        // Create city
        this.city = new City(cityX, cityY);

        // Initialize store system
        this.store = new Store(this);

        // Debug logging
        console.log('=== SPACE SHOOTER DEBUG ===');
        console.log('Canvas dimensions:', this.width, 'x', this.height);
        console.log('Ground level:', groundLevel);
        console.log('City positioned at:', cityX, ',', cityY, '(centered horizontally, on ground)');
        console.log('Turret positioned at:', cityX, ',', cityY, '(integrated within city center)');
        console.log('City created at:', this.city.position.x, ',', this.city.position.y, 'Size:', this.city.size);
        console.log('Objects should be visible:', {
            cityInBounds: this.city.position.y >= 0 && this.city.position.y <= this.height
        });
        console.log('=== END DEBUG ===');

        // Add to entities array
        this.entities = [this.city];

        // Set global reference for classes that need it
        window.game = this;
    }

    /**
     * Main game loop
     * @param {number} currentTime - Current timestamp
     */
    gameLoop(currentTime) {
        if (!this.isRunning) return;

        const frameTime = Math.min(currentTime - this.lastTime, this.maxDeltaTime);
        this.lastTime = currentTime;

        if (!this.isPaused && !this.isGameOver) {
            this.accumulator += frameTime;

            // Fixed timestep updates
            while (this.accumulator >= this.deltaTime) {
                this.update(this.deltaTime);
                this.accumulator -= this.deltaTime;
            }
        }

        // Always render
        this.render();

        // Continue loop
        requestAnimationFrame(this.gameLoop);
    }

    /**
     * Update game logic
     * @param {number} dt - Delta time in milliseconds
     */
    update(dt) {
        this.gameTime += dt;

        // Update spatial grid
        this.spatialGrid.clear();
        for (const entity of this.entities) {
            if (entity.position) {
                this.spatialGrid.insert(entity);
            }
        }

        // Update city (includes integrated turret system)
        if (this.city && this.city.update) {
            this.city.update(dt, this.asteroids, this.projectiles);
        }

        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            if (projectile.update) {
                projectile.update(dt, this.asteroids, this.projectiles);
            }

            // Remove if out of bounds or marked for removal
            if (projectile.shouldRemove || this.isOutOfBounds(projectile.position)) {
                this.projectiles.splice(i, 1);
            }
        }

        // Update asteroids
        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            const asteroid = this.asteroids[i];
            if (asteroid.update) {
                asteroid.update(dt);
            }

            // Remove if out of bounds or destroyed
            if (asteroid.shouldRemove || this.isOutOfBounds(asteroid.position)) {
                if (asteroid.shouldRemove && !asteroid.hasHitGround) {
                    this.onAsteroidDestroyed(asteroid);
                }
                this.asteroids.splice(i, 1);
            }
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            if (particle.update) {
                particle.update(dt);
            }

            if (particle.shouldRemove) {
                this.particles.splice(i, 1);
            }
        }

        // Spawn asteroids
        this.updateAsteroidSpawning(dt);

        // Check collisions
        this.checkCollisions();

        // Update difficulty
        this.updateDifficulty();

        // Check game over conditions
        this.checkGameOver();
    }

    /**
     * Handle asteroid spawning
     * @param {number} dt - Delta time
     */
    updateAsteroidSpawning(dt) {
        this.lastAsteroidSpawn += dt;

        // Use the dynamically calculated spawn rate
        if (this.lastAsteroidSpawn >= this.asteroidSpawnRate) {
            this.spawnAsteroid();
            this.lastAsteroidSpawn = 0;
        }
    }

    /**
     * Spawn a new asteroid
     */
    spawnAsteroid() {
        // Random spawn position across the top of the screen
        const spawnMargin = 100;
        const x = random(-spawnMargin, this.width + spawnMargin);
        const y = random(-100, -50);

        // Create new asteroid using the Asteroid class with current game score for scaling
        const asteroid = new Asteroid(x, y, null, this.score);

        // Set trajectory toward the city/turret area with some randomness
        const targetX = this.width / 2 + random(-100, 100);
        const targetY = this.height + random(-50, 50);

        const direction = Vector2.subtract(new Vector2(targetX, targetY), asteroid.position);
        direction.normalize();

        // Apply speed with some variation
        const speed = asteroid.speed * random(0.8, 1.2);
        asteroid.velocity = Vector2.multiply(direction, speed);

        // Add some random horizontal drift
        asteroid.velocity.x += random(-20, 20);

        this.asteroids.push(asteroid);
    }

    /**
     * Check for collisions between game objects
     */
    checkCollisions() {
        // Projectile vs Asteroid collisions
        for (const projectile of this.projectiles) {
            for (const asteroid of this.asteroids) {
                if (projectile.checkCollision && projectile.checkCollision(asteroid)) {
                    this.onProjectileHitAsteroid(projectile, asteroid);
                } else if (this.checkCircleCollision(projectile, asteroid)) {
                    this.onProjectileHitAsteroid(projectile, asteroid);
                }
            }
        }

        // Asteroid vs City collisions
        for (const asteroid of this.asteroids) {
            if (asteroid.collidesWith && asteroid.collidesWith(this.city)) {
                this.onAsteroidHitCity(asteroid);
            } else if (this.checkCircleCollision(asteroid, this.city)) {
                this.onAsteroidHitCity(asteroid);
            }
        }

    }

    /**
     * Simple circle collision detection
     */
    checkCircleCollision(obj1, obj2) {
        const dx = obj1.position.x - obj2.position.x;
        const dy = obj1.position.y - obj2.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (obj1.size + obj2.size);
    }

    /**
     * Handle projectile hitting asteroid
     */
    onProjectileHitAsteroid(projectile, asteroid) {
        const damage = projectile.damage || 1;

        if (asteroid.takeDamage) {
            const destroyed = asteroid.takeDamage(damage, projectile.position);
            if (destroyed) {
                this.onAsteroidDestroyed(asteroid);
            }
        } else {
            asteroid.health -= damage;
            if (asteroid.health <= 0) {
                asteroid.shouldRemove = true;
                this.onAsteroidDestroyed(asteroid);
            }
        }

        projectile.shouldRemove = true;
        this.createExplosion(asteroid.position.x, asteroid.position.y);
    }

    /**
     * Handle asteroid hitting city
     */
    onAsteroidHitCity(asteroid) {
        const damage = asteroid.damage || 1;

        if (this.city.takeDamage) {
            this.city.takeDamage(damage, asteroid.position);
        } else {
            this.city.health -= damage;
        }

        asteroid.shouldRemove = true;
        this.createExplosion(asteroid.position.x, asteroid.position.y);
        this.updateUI();
    }


    /**
     * Handle asteroid destruction
     */
    onAsteroidDestroyed(asteroid) {
        // Award points
        const points = asteroid.points || Math.floor(asteroid.size);
        this.score += points;

        // Check for asteroid splitting
        if (asteroid.split && typeof asteroid.split === 'function') {
            const fragments = asteroid.split();
            this.asteroids.push(...fragments);
        }

        // Update UI
        this.updateUI();
    }

    /**
     * Create explosion effect
     */
    createExplosion(x, y) {
        // Placeholder explosion - will be replaced with proper particle system
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const speed = 50 + Math.random() * 50;
            const particle = {
                position: new Vector2(x, y),
                velocity: new Vector2(Math.cos(angle) * speed, Math.sin(angle) * speed),
                life: 500,
                maxLife: 500,
                size: 3,
                shouldRemove: false,
                update: function(dt) {
                    this.position.add(Vector2.multiply(this.velocity, dt / 1000));
                    this.life -= dt;
                    if (this.life <= 0) {
                        this.shouldRemove = true;
                    }
                }
            };
            this.particles.push(particle);
        }
    }

    /**
     * Update game difficulty based on cumulative score
     */
    updateDifficulty() {
        // Score-based difficulty scaling
        // Every 100 points increases difficulty by 0.1
        this.difficultyMultiplier = 1.0 + (this.score / 1000);

        // Update spawn rate based on score (faster spawning at higher scores)
        // Start at 2000ms, reduce to minimum of 500ms at high scores
        const scoreSpeedUp = Math.min(this.score / 200, 3.0); // Max 3x speed increase
        this.asteroidSpawnRate = Math.max(500, this.baseAsteroidSpawnRate / (1 + scoreSpeedUp));
    }

    /**
     * Check if position is out of bounds
     */
    isOutOfBounds(position) {
        const margin = 100;
        return position.x < -margin ||
               position.x > this.width + margin ||
               position.y < -margin ||
               position.y > this.height + margin;
    }

    /**
     * Check for game over conditions
     */
    checkGameOver() {
        const cityHealth = this.city.health !== undefined ? this.city.health : 0;
        const cityDestroyed = this.city.isDestroyed !== undefined ? this.city.isDestroyed : cityHealth <= 0;

        if (cityDestroyed || cityHealth <= 0) {
            this.gameOver();
        }
    }

    /**
     * Handle game over
     */
    gameOver() {
        this.isGameOver = true;
        console.log('Game Over! Final Points:', this.score);

        // Show game over screen
        this.showGameOverScreen();
    }

    /**
     * Show game over screen
     */
    showGameOverScreen() {
        const gameOverScreen = document.getElementById('game-over-screen');
        const finalScore = document.getElementById('final-score');

        if (gameOverScreen && finalScore) {
            finalScore.textContent = this.score;
            gameOverScreen.classList.remove('hidden');
        }
    }

    /**
     * Render the game
     */
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw space background
        this.drawSpaceBackground();

        // Draw ground
        this.drawGround();

        // Draw city
        if (this.city && this.city.draw) {
            this.city.draw(this.ctx);
            // Debug: Draw a bright circle at city position for debugging
            if (this.showDebug) {
                this.ctx.save();
                this.ctx.strokeStyle = '#ff00ff';
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.arc(this.city.position.x, this.city.position.y, this.city.size + 10, 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.restore();
            }
        } else {
            console.log('City draw failed - city exists:', !!this.city, 'has draw method:', !!(this.city && this.city.draw));
        }

        // Draw asteroids with collision course highlighting
        for (const asteroid of this.asteroids) {
            // Check if asteroid is on collision course with city
            const isCollisionThreat = this.checkAsteroidCollisionCourse(asteroid);

            // Draw collision warning effects first (behind asteroid)
            if (isCollisionThreat) {
                this.drawCollisionWarning(asteroid);
            }

            // Draw the asteroid
            if (asteroid.draw) {
                asteroid.draw(this.ctx);
            } else {
                this.drawAsteroid(asteroid);
            }
        }

        // Draw projectiles
        for (const projectile of this.projectiles) {
            if (projectile.draw) {
                projectile.draw(this.ctx);
            } else {
                this.drawProjectile(projectile);
            }
        }

        // Draw particles
        for (const particle of this.particles) {
            this.drawParticle(particle);
        }

        // Draw upgrade display (always visible)
        this.drawUpgradeDisplay();

        // Draw debug info if needed
        if (this.showDebug) {
            this.drawDebugInfo();
        }

        // Draw pause overlay
        if (this.isPaused && !this.isGameOver) {
            this.drawPauseOverlay();
        }
    }

    /**
     * Initialize starfield with random star positions
     */
    initializeStarfield() {
        this.stars = [];
        const starCount = 100;

        for (let i = 0; i < starCount; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2 + 1,
                brightness: Math.random() * 0.8 + 0.2,
                twinkleSpeed: Math.random() * 0.002 + 0.001,
                twinklePhase: Math.random() * Math.PI * 2
            });
        }
    }

    /**
     * Draw space background with stars
     */
    drawSpaceBackground() {
        // Draw stars
        for (const star of this.stars) {
            // Calculate twinkling effect
            star.twinklePhase += star.twinkleSpeed * this.deltaTime;
            const twinkle = 0.5 + 0.5 * Math.sin(star.twinklePhase);
            const alpha = star.brightness * twinkle;

            this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            this.ctx.fillRect(star.x, star.y, star.size, star.size);
        }
    }

    /**
     * Draw ground/planet surface at bottom of screen
     */
    drawGround() {
        const groundHeight = 40;
        const groundY = this.height - groundHeight;

        this.ctx.save();

        // Main ground surface
        this.ctx.fillStyle = '#4a4a4a';
        this.ctx.fillRect(0, groundY, this.width, groundHeight);

        // Ground texture/details (static pattern)
        this.ctx.fillStyle = '#5a5a5a';
        for (let i = 0; i < this.width; i += 25) {
            const rockHeight = 6;
            this.ctx.fillRect(i, groundY - rockHeight, 18, rockHeight);
        }

        // Ground highlight
        this.ctx.fillStyle = '#6a6a6a';
        this.ctx.fillRect(0, groundY, this.width, 2);

        this.ctx.restore();
    }


    /**
     * Draw an asteroid
     */
    drawAsteroid(asteroid) {
        this.ctx.save();
        this.ctx.translate(asteroid.position.x, asteroid.position.y);

        this.ctx.fillStyle = '#8B4513';
        this.ctx.strokeStyle = '#A0522D';
        this.ctx.lineWidth = 2;

        this.ctx.beginPath();
        this.ctx.arc(0, 0, asteroid.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.restore();
    }

    /**
     * Draw targeting indicator around targeted asteroid
     * @param {Object} asteroid - The targeted asteroid
     */
    drawTargetingIndicator(asteroid) {
        this.ctx.save();
        this.ctx.translate(asteroid.position.x, asteroid.position.y);

        // Animated targeting circle
        const pulseSize = 1 + 0.3 * Math.sin(this.gameTime * 0.01);
        const radius = (asteroid.size + 8) * pulseSize;

        // Outer targeting ring
        this.ctx.strokeStyle = '#ff0000';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
        this.ctx.stroke();

        // Crosshair
        this.ctx.setLineDash([]);
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        // Horizontal line
        this.ctx.moveTo(-radius * 0.8, 0);
        this.ctx.lineTo(-radius * 0.6, 0);
        this.ctx.moveTo(radius * 0.6, 0);
        this.ctx.lineTo(radius * 0.8, 0);
        // Vertical line
        this.ctx.moveTo(0, -radius * 0.8);
        this.ctx.lineTo(0, -radius * 0.6);
        this.ctx.moveTo(0, radius * 0.6);
        this.ctx.lineTo(0, radius * 0.8);
        this.ctx.stroke();

        this.ctx.restore();
    }

    /**
     * Draw a projectile
     */
    drawProjectile(projectile) {
        this.ctx.save();
        this.ctx.translate(projectile.position.x, projectile.position.y);

        this.ctx.fillStyle = '#ffff00';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 3, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }

    /**
     * Draw a particle
     */
    drawParticle(particle) {
        this.ctx.save();
        this.ctx.translate(particle.position.x, particle.position.y);

        const alpha = particle.life / particle.maxLife;
        this.ctx.fillStyle = `rgba(255, 100, 0, ${alpha})`;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }

    /**
     * Draw pause overlay
     */
    drawPauseOverlay() {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.fillStyle = '#fff';
        this.ctx.font = '32px Arial';
        this.ctx.fillText('PAUSED', this.width / 2, this.height / 2);

        this.ctx.restore();
    }

    /**
     * Draw debug information
     */
    drawDebugInfo() {
        this.ctx.save();
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'left';

        const debugInfo = [
            `Entities: ${this.entities.length}`,
            `Asteroids: ${this.asteroids.length}`,
            `Projectiles: ${this.projectiles.length}`,
            `Particles: ${this.particles.length}`,
            `Points: ${this.score}`,
            `Time: ${(this.gameTime / 1000).toFixed(1)}s`
        ];

        for (let i = 0; i < debugInfo.length; i++) {
            this.ctx.fillText(debugInfo[i], 10, 20 + i * 15);
        }

        this.ctx.restore();
    }

    /**
     * Draw integrated upgrade panel in top left corner
     */
    drawUpgradeDisplay() {
        if (!this.city || !this.city.defense) return;

        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.strokeStyle = '#00ff88';
        this.ctx.lineWidth = 1;
        this.ctx.font = '13px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';

        const upgrades = this.city.defense.upgrades;
        const x = 10;
        const y = 10;
        const lineHeight = 20;
        const padding = 8;
        const width = 280;
        const height = 8 * lineHeight + padding * 2;

        // Store upgrade button areas for mouse interaction
        this.upgradeButtons = [];

        // Background panel
        this.ctx.fillRect(x, y, width, height);
        this.ctx.strokeRect(x, y, width, height);

        // Points display
        this.ctx.fillStyle = '#ffff00';
        this.ctx.font = '16px monospace';
        this.ctx.fillText(`POINTS: ${this.score}`, x + padding, y + padding);

        // Title
        this.ctx.fillStyle = '#00ff88';
        this.ctx.font = '14px monospace';
        this.ctx.fillText('UPGRADES', x + padding, y + padding + 24);

        this.ctx.font = '13px monospace';
        let textY = y + padding + 48;

        // Helper function to draw upgrade line
        const drawUpgradeLine = (name, currentValue, upgradeType, maxUpgrades = 10) => {
            const cost = this.store.getItemCost(upgradeType);
            const canAfford = this.score >= cost;
            const isMaxed = maxUpgrades !== -1 && this.store.items[upgradeType].purchaseCount >= maxUpgrades;

            // Upgrade name and current value
            this.ctx.fillStyle = currentValue > 0 ? '#ffffff' : '#888888';
            this.ctx.fillText(`${name}: ${currentValue}`, x + padding, textY);

            if (!isMaxed) {
                // Cost display
                this.ctx.fillStyle = canAfford ? '#00ff00' : '#ff6666';
                this.ctx.fillText(`${cost}pts`, x + padding + 140, textY);

                // '+' Button
                const buttonX = x + width - 35;
                const buttonY = textY - 2;
                const buttonSize = 16;

                this.ctx.fillStyle = canAfford ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 102, 102, 0.3)';
                this.ctx.fillRect(buttonX, buttonY, buttonSize, buttonSize);

                this.ctx.strokeStyle = canAfford ? '#00ff00' : '#ff6666';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(buttonX, buttonY, buttonSize, buttonSize);

                this.ctx.fillStyle = canAfford ? '#00ff00' : '#ff6666';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('+', buttonX + buttonSize/2, buttonY + 2);
                this.ctx.textAlign = 'left';

                // Store button area for click detection
                this.upgradeButtons.push({
                    x: buttonX,
                    y: buttonY,
                    width: buttonSize,
                    height: buttonSize,
                    type: upgradeType,
                    canAfford: canAfford
                });
            } else {
                // MAX indicator
                this.ctx.fillStyle = '#666666';
                this.ctx.fillText('MAX', x + padding + 140, textY);
            }

            textY += lineHeight;
        };

        // Fire Rate
        const fireRatePercent = (upgrades.fireRate * 15).toFixed(0);
        drawUpgradeLine(`Fire Rate +${fireRatePercent}%`, upgrades.fireRate, 'fireRate', 10);

        // Damage
        drawUpgradeLine(`Damage +${upgrades.damage}`, upgrades.damage, 'damage', -1);

        // Multi-Shot
        const shotCount = 1 + upgrades.multiShot;
        drawUpgradeLine(`Multi-Shot ${shotCount}x`, upgrades.multiShot, 'multiShot', 5);

        // City Repair
        if (this.city.health < this.city.maxHealth) {
            drawUpgradeLine(`Repair City`, 0, 'repair', -1);
        }

        // Shield Upgrade
        drawUpgradeLine(`Shield Cap ${this.city.maxShieldHealth}`, Math.floor(this.city.maxShieldHealth / 5) - 1, 'cityShield', 3);

        // City Status
        textY += 4;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(`Health: ${Math.floor(this.city.health)}/${this.city.maxHealth}`, x + padding, textY);
        textY += lineHeight;
        this.ctx.fillText(`Shield: ${Math.floor(this.city.shieldHealth)}/${this.city.maxShieldHealth}`, x + padding, textY);

        this.ctx.restore();
    }

    /**
     * Handle key press events
     */
    handleKeyPress(event) {
        switch (event.code) {
            case 'Space':
                event.preventDefault();
                this.togglePause();
                break;
            case 'KeyR':
                if (this.isGameOver) {
                    this.restart();
                }
                break;
            case 'KeyD':
                this.showDebug = !this.showDebug;
                break;
        }
    }

    /**
     * Handle mouse click events for upgrade buttons
     */
    handleMouseClick(event) {
        if (!this.upgradeButtons || this.isGameOver) return;

        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        const mouseX = (event.clientX - rect.left) * scaleX;
        const mouseY = (event.clientY - rect.top) * scaleY;

        // Check if click is on any upgrade button
        for (const button of this.upgradeButtons) {
            if (mouseX >= button.x && mouseX <= button.x + button.width &&
                mouseY >= button.y && mouseY <= button.y + button.height) {

                if (button.canAfford && this.store) {
                    const success = this.store.purchase(button.type);
                    if (success) {
                        console.log(`Purchased ${button.type} upgrade`);
                        // Update UI will happen automatically on next render
                    }
                }
                break;
            }
        }
    }

    /**
     * Toggle pause state
     */
    togglePause() {
        if (this.isGameOver) return;

        this.isPaused = !this.isPaused;

        // Show/hide pause screen
        const pauseScreen = document.getElementById('pause-screen');
        if (pauseScreen) {
            if (this.isPaused) {
                pauseScreen.classList.remove('hidden');
            } else {
                pauseScreen.classList.add('hidden');
            }
        }
    }

    /**
     * Restart the game
     */
    restart() {
        // Hide game over screen
        const gameOverScreen = document.getElementById('game-over-screen');
        if (gameOverScreen) {
            gameOverScreen.classList.add('hidden');
        }

        // Restart game
        this.start();
    }

    /**
     * Update UI elements
     */
    updateUI() {
        // Points are now displayed in the integrated upgrade panel
        // City health is shown via health bar above the city
    }

    /**
     * Create particles for visual effects
     * @param {string} type - Type of particles
     * @param {Vector2} position - Position to create particles
     * @param {Object} options - Particle options
     */
    createParticles(type, position, options = {}) {
        // Placeholder for particle system - will be implemented later
        // For now, just create some simple particles
        const count = options.count || 8;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const speed = 50 + Math.random() * 50;
            const particle = {
                position: new Vector2(position.x, position.y),
                velocity: new Vector2(Math.cos(angle) * speed, Math.sin(angle) * speed),
                life: 500,
                maxLife: 500,
                size: 3,
                shouldRemove: false,
                update: function(dt) {
                    this.position.add(Vector2.multiply(this.velocity, dt / 1000));
                    this.life -= dt;
                    if (this.life <= 0) {
                        this.shouldRemove = true;
                    }
                }
            };
            this.particles.push(particle);
        }
    }

    /**
     * Check if asteroid is on collision course with city
     * Uses the same logic as the enhanced projectile targeting system
     * @param {Object} asteroid - Asteroid to check
     * @returns {boolean} True if asteroid will hit city
     */
    checkAsteroidCollisionCourse(asteroid) {
        if (!asteroid.velocity || !asteroid.position || !this.city) {
            return false;
        }

        const cityPos = this.city.position;
        const cityRadius = this.city.size;

        // Calculate asteroid's trajectory
        const asteroidPos = asteroid.position.clone();
        const asteroidVel = asteroid.velocity.clone();

        // Project asteroid position at city Y level
        if (asteroidVel.y <= 0) {
            // Asteroid moving up or sideways - won't hit city
            return false;
        }

        const timeToReachCityY = (cityPos.y - asteroidPos.y) / asteroidVel.y;
        if (timeToReachCityY < 0) {
            // Asteroid already past city Y level
            return false;
        }

        // Calculate where asteroid will be when it reaches city Y level
        const projectedX = asteroidPos.x + asteroidVel.x * timeToReachCityY;
        const projectedPos = new Vector2(projectedX, cityPos.y);

        // Calculate distance between projected position and city center
        const missDistance = projectedPos.distanceTo(cityPos);
        const asteroidRadius = asteroid.size || 15;
        const totalRadius = cityRadius + asteroidRadius + 15; // Buffer for collision detection

        return missDistance <= totalRadius;
    }

    /**
     * Draw collision warning effects for asteroids on collision course
     * @param {Object} asteroid - Asteroid to highlight
     */
    drawCollisionWarning(asteroid) {
        this.ctx.save();
        this.ctx.translate(asteroid.position.x, asteroid.position.y);

        // Pulsing animation based on game time
        const pulseIntensity = 0.5 + 0.5 * Math.sin(this.gameTime * 0.01);
        const glowRadius = (asteroid.size + 10) * (1 + pulseIntensity * 0.3);

        // Outer warning glow
        const gradient = this.ctx.createRadialGradient(0, 0, asteroid.size, 0, 0, glowRadius);
        gradient.addColorStop(0, 'rgba(255, 0, 0, 0)');
        gradient.addColorStop(0.7, `rgba(255, 50, 0, ${0.3 * pulseIntensity})`);
        gradient.addColorStop(1, `rgba(255, 100, 0, ${0.6 * pulseIntensity})`);

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
        this.ctx.fill();

        // Pulsing red border
        this.ctx.strokeStyle = `rgba(255, 0, 0, ${0.8 + 0.2 * pulseIntensity})`;
        this.ctx.lineWidth = 3 + pulseIntensity * 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.arc(0, 0, asteroid.size + 8 + pulseIntensity * 5, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Warning icon above asteroid
        const iconY = -asteroid.size - 20 - pulseIntensity * 5;
        this.ctx.fillStyle = `rgba(255, 255, 0, ${0.9 + 0.1 * pulseIntensity})`;
        this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.9)';
        this.ctx.lineWidth = 2;

        // Exclamation mark background
        this.ctx.beginPath();
        this.ctx.arc(0, iconY, 8, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        // Exclamation mark
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('!', 0, iconY);

        this.ctx.restore();
    }

    /**
     * Clean up resources
     */
    destroy() {
        this.isRunning = false;
        document.removeEventListener('keydown', this.handleKeyPress);
        this.canvas.removeEventListener('click', this.handleMouseClick);
    }
}
