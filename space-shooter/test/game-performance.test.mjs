import assert from 'node:assert/strict';
import test from 'node:test';

import Game from '../src/Game.js';

test('reports rolling frame-rate and frame-cost metrics', () => {
    const game = {
        performanceMetrics: {
            frameCount: 0,
            elapsedTime: 0,
            workTime: 0,
            fps: 0,
            frameTime: 0,
            averageWorkTime: 0
        }
    };

    for (let frame = 0; frame < 25; frame++) {
        Game.prototype.updatePerformanceMetrics.call(game, 20, 3);
    }

    assert.equal(game.performanceMetrics.fps, 50);
    assert.equal(game.performanceMetrics.frameTime, 20);
    assert.equal(game.performanceMetrics.averageWorkTime, 3);
});
