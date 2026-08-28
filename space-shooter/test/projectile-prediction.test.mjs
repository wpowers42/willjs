import assert from 'node:assert/strict';
import test from 'node:test';

import Projectile from '../src/Projectile.js';
import Vector2 from '../src/utils/Vector2.js';

const EPSILON = 0.001;

globalThis.window = { innerHeight: 900, game: null };

test('predicts the exact intercept point for a crossing target', () => {
    const target = {
        position: new Vector2(300, 0),
        velocity: new Vector2(0, 100)
    };
    const projectile = new Projectile(0, 0, target, { speed: 200 });

    const predicted = projectile.predictTargetPosition();
    const interceptTime = predicted.y / target.velocity.y;
    const projectileTravelDistance = projectile.position.distanceTo(predicted);

    assert.ok(Math.abs(predicted.x - 300) < EPSILON);
    assert.ok(Math.abs(projectileTravelDistance - projectile.speed * interceptTime) < EPSILON);
});

test('uses the current position when the target has no velocity', () => {
    const target = { position: new Vector2(120, 80) };
    const projectile = new Projectile(0, 0, target, { speed: 200 });

    assert.deepEqual(projectile.predictTargetPosition(), target.position);
});

test('launches directly toward the predicted intercept point', () => {
    const target = {
        position: new Vector2(300, 0),
        velocity: new Vector2(0, 100)
    };
    const projectile = new Projectile(0, 0, target, { speed: 200 });
    const expectedVelocity = Vector2.subtract(
        projectile.predictTargetPosition(),
        projectile.position
    ).normalized().multiply(projectile.speed);

    assert.ok(projectile.velocity.equals(expectedVelocity));
});

test('keeps its launch direction when the target moves', () => {
    const target = {
        position: new Vector2(300, 0),
        velocity: new Vector2(0, 0),
        shouldRemove: false
    };
    const projectile = new Projectile(0, 0, target, { speed: 200 });
    const launchVelocity = projectile.velocity.clone();
    target.position.set(0, 300);

    projectile.update(16);

    assert.ok(projectile.velocity.equals(launchVelocity));
});

test('limits predicted launch trajectories to 45 degrees from vertical', () => {
    const projectile = new Projectile(0, 0, null, { speed: 200 });
    const boundaryTarget = {
        position: new Vector2(100, -100),
        velocity: new Vector2(0, 0)
    };
    const outsideTarget = {
        position: new Vector2(101, -100),
        velocity: new Vector2(0, 0)
    };

    assert.equal(projectile.isTargetWithinFiringArc(boundaryTarget), true);
    assert.equal(projectile.isTargetWithinFiringArc(outsideTarget), false);
});

test('chooses the highest-threat target without an existing assignment', () => {
    const asteroids = [
        { position: new Vector2(100, 100), shouldRemove: false, threat: 10000 },
        { position: new Vector2(200, 100), shouldRemove: false, threat: 100 },
        { position: new Vector2(300, 100), shouldRemove: false, threat: 10 }
    ];
    const projectile = new Projectile(200, 500, null);
    projectile.calculateDangerBasedScore = asteroid => asteroid.threat;

    let iterationCount = 0;
    const allProjectiles = {
        *[Symbol.iterator]() {
            iterationCount++;
            yield projectile;
            yield { target: asteroids[0] };
        }
    };

    projectile.acquireNewTarget(asteroids, allProjectiles);

    assert.equal(iterationCount, 1);
    assert.equal(projectile.target, asteroids[1]);
});

test('scores asteroid threat independently of projectile location', () => {
    const city = { position: new Vector2(400, 800), size: 40 };
    window.game = { city, width: 800, height: 900 };
    const asteroid = {
        position: new Vector2(200, 100),
        velocity: new Vector2(10, 50),
        damage: 2,
        size: 20,
        getThreatLevel: targetPosition => 1000 - asteroid.position.distanceTo(targetPosition)
    };
    const leftProjectile = new Projectile(0, 800, asteroid);
    const rightProjectile = new Projectile(800, 800, asteroid);

    assert.equal(
        leftProjectile.calculateDangerBasedScore(
            asteroid,
            leftProjectile.position.distanceTo(asteroid.position)
        ),
        rightProjectile.calculateDangerBasedScore(
            asteroid,
            rightProjectile.position.distanceTo(asteroid.position)
        )
    );
});
