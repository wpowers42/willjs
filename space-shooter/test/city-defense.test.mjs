import assert from 'node:assert/strict';
import test from 'node:test';

import City from '../src/City.js';
import Vector2 from '../src/utils/Vector2.js';

globalThis.window = { game: { width: 800 } };

test('adds fixed turret positions from the center outward', () => {
    const city = new City(400, 540);
    const basePosition = city.getDefenseTurretPositions(800)[0].x;

    city.defense.upgrades.multiShot = 2;
    const upgradedPositions = city.getDefenseTurretPositions(800).map(position => position.x);

    assert.equal(upgradedPositions[0], basePosition);
    assert.deepEqual(upgradedPositions, [800 * 3 / 7, 800 * 4 / 7, 800 * 2 / 7]);

    city.defense.upgrades.multiShot = 5;
    const finalPositions = city.getDefenseTurretPositions(800)
        .map(position => position.x)
        .sort((a, b) => a - b);

    assert.deepEqual(finalPositions, [1, 2, 3, 4, 5, 6].map(slot => 800 * slot / 7));
});

test('fires one projectile from each turret location', () => {
    const city = new City(400, 540);
    window.game.city = city;
    city.defense.target = {};
    city.defense.upgrades.multiShot = 2;
    const asteroids = [300, 200, 100].map((threat, index) => ({
        position: new Vector2(100 + index * 300, 100),
        velocity: new Vector2(0, 0),
        size: 15,
        damage: 1,
        shouldRemove: false,
        getThreatLevel: () => threat
    }));
    const projectiles = [];

    city.fireDefenseProjectiles(asteroids, projectiles);

    assert.equal(projectiles.length, 3);
    assert.deepEqual(
        projectiles.map(projectile => projectile.position.x),
        [800 * 3 / 7, 800 * 4 / 7, 800 * 2 / 7]
    );
    assert.deepEqual(projectiles.map(projectile => projectile.position.y), [540, 540, 540]);
    assert.deepEqual(projectiles.map(projectile => projectile.target), asteroids);
    assert.ok(projectiles[0].velocity.x < 0);
});
