import assert from 'node:assert/strict';
import test from 'node:test';

import Projectile from '../src/Projectile.js';
import Vector2 from '../src/utils/Vector2.js';

const EPSILON = 0.001;

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
