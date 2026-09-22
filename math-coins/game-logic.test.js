const test = require('node:test');
const assert = require('node:assert/strict');

const { MathCoinsGame } = require('./game-logic.js');

function seededRandom(seed = 1) {
    let state = seed;
    return () => {
        state = (state * 16807) % 2147483647;
        return (state - 1) / 2147483646;
    };
}

test('new rounds contain an age-appropriate equation and a fixed ordered keypad', () => {
    const game = new MathCoinsGame({ random: seededRandom(42) });

    for (let round = 0; round < 100; round += 1) {
        const state = game.getState();
        const answer = state.left + state.right;

        assert.ok(answer >= 0 && answer <= 20);
        assert.deepEqual(state.keys, [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);
        game.startRound();
    }
});

test('twenty identical coins disappear once per second', () => {
    const game = new MathCoinsGame({ random: seededRandom(3) });
    assert.equal(game.getState().coins.length, 20);
    assert.deepEqual(game.update(999), []);
    assert.deepEqual(game.update(1), [{ type: 'coin-dropped', value: 20 }]);
    assert.equal(game.getState().coins.length, 19);
    game.update(19000);
    assert.equal(game.getState().coins.length, 0);
});

test('skip reveals the answer, costs zero, and starts a new round after feedback', () => {
    const game = new MathCoinsGame({ random: seededRandom(7) });
    const initial = game.getState();
    game.update(2900);
    game.pressNumber(9);
    game.skip();

    const skipped = game.getState();
    assert.equal(skipped.phase, 'skip-feedback');
    assert.equal(skipped.feedback.answer, initial.left + initial.right);
    assert.equal(skipped.score, 0);
    assert.equal(skipped.answer, '');
    assert.deepEqual(game.update(100), []);
    assert.deepEqual(game.getState().coins, skipped.coins);
    assert.deepEqual(game.update(1000), [{ type: 'round-started' }]);
    assert.equal(game.getState().phase, 'playing');
    assert.equal(game.getState().score, 0);
    assert.deepEqual(game.getState().coins, initial.coins);
});

test('wrong answers lose remaining coins and reveal the answer before the next round', () => {
    const game = new MathCoinsGame({ random: seededRandom(7) });
    const initial = game.getState();
    const wrongAnswer = initial.left + initial.right + 1;

    game.update(1000);
    String(wrongAnswer).split('').forEach((digit) => game.pressNumber(Number(digit)));
    game.submit();

    assert.equal(game.getState().phase, 'wrong-feedback');
    assert.equal(game.getState().feedback.answer, initial.left + initial.right);
    assert.equal(game.getState().feedback.lost, 19);
    assert.equal(game.getState().score, -19);

    game.update(100);
    assert.equal(game.getState().coins.length, 19);
    assert.deepEqual(game.update(1000), [{ type: 'round-started' }]);
    assert.equal(game.getState().phase, 'playing');
    assert.equal(game.getState().answer, '');
    assert.equal(game.getState().score, -19);
    assert.equal(game.getState().coins.length, 20);
});

test('zero remaining coins give no reward or penalty but still advance', () => {
    const game = new MathCoinsGame({ random: seededRandom(9) });
    game.update(20000);
    const correct = game.getState().left + game.getState().right;
    String(correct).split('').forEach((digit) => game.pressNumber(Number(digit)));
    game.submit();
    game.update(450);
    assert.equal(game.getState().score, 0);
    assert.equal(game.getState().phase, 'playing');

    game.update(20000);
    const wrong = game.getState().left + game.getState().right + 1;
    String(wrong).split('').forEach((digit) => game.pressNumber(Number(digit)));
    game.submit();
    game.update(1100);
    assert.equal(game.getState().score, 0);
    assert.equal(game.getState().phase, 'playing');
});

test('a correct answer awards each remaining coin separately before the next round', () => {
    const game = new MathCoinsGame({ random: seededRandom(11) });
    const state = game.getState();
    const correctAnswer = state.left + state.right;

    String(correctAnswer).split('').forEach((digit) => game.pressNumber(Number(digit)));
    game.submit();

    assert.equal(game.getState().phase, 'awarding');
    assert.equal(game.getState().score, 0);

    assert.deepEqual(game.update(699), []);
    assert.equal(game.getState().score, 0);

    assert.deepEqual(game.update(1), [{ type: 'coin-awarded', value: 1, index: 0 }]);
    assert.equal(game.getState().score, 1);

    assert.deepEqual(game.update(160), [{ type: 'coin-awarded', value: 1, index: 1 }]);
    assert.equal(game.getState().score, 2);

    game.update(3130);
    const nextRound = game.getState();
    assert.equal(nextRound.score, 20);
    assert.equal(nextRound.phase, 'playing');
    assert.equal(nextRound.answer, '');
    assert.equal(nextRound.coins.length, 20);
});

test('the tenth equation ends the session after its last coin arrives', () => {
    const game = new MathCoinsGame({ random: seededRandom(13) });
    for (let round = 1; round < 10; round += 1) {
        assert.equal(game.getState().round, round);
        game.skip();
        assert.deepEqual(game.update(1100), [{ type: 'round-started' }]);
    }
    assert.equal(game.getState().round, 10);
    const state = game.getState();
    String(state.left + state.right).split('').forEach((digit) => game.pressNumber(Number(digit)));
    game.submit();
    assert.deepEqual(game.update(3990).at(-1), { type: 'finished' });
    assert.equal(game.getState().score, 20);
    assert.equal(game.getState().phase, 'finished');
    game.pressNumber(8);
    assert.equal(game.getState().answer, String(state.left + state.right));
    game.reset();
    assert.equal(game.getState().round, 1);
    assert.equal(game.getState().score, 0);
});

test('earned coins restore a negative balance one at a time', () => {
    const game = new MathCoinsGame({ random: seededRandom(4), rounds: 2 });
    const first = game.getState();
    String(first.left + first.right + 1).split('').forEach((digit) => game.pressNumber(Number(digit)));
    game.submit();
    game.update(1100);
    assert.equal(game.getState().score, -20);

    const second = game.getState();
    String(second.left + second.right).split('').forEach((digit) => game.pressNumber(Number(digit)));
    game.submit();
    game.update(700);
    assert.equal(game.getState().score, -19);
    game.update(3290);
    assert.equal(game.getState().score, 0);
    assert.equal(game.getState().phase, 'finished');
});

test('skipping the last equation finishes with no score change', () => {
    const game = new MathCoinsGame({ random: seededRandom(3), rounds: 1 });
    game.skip();
    assert.deepEqual(game.update(1100), [{ type: 'finished' }]);
    assert.equal(game.getState().score, 0);
    assert.equal(game.getState().round, 1);
});

test('wrong answers can finish a session with a negative balance', () => {
    const game = new MathCoinsGame({ random: seededRandom(5), rounds: 1 });
    const state = game.getState();
    String(state.left + state.right + 1).split('').forEach((digit) => game.pressNumber(Number(digit)));
    game.submit();
    assert.deepEqual(game.update(1100), [{ type: 'finished' }]);
    assert.equal(game.getState().score, -20);
    assert.equal(game.getState().phase, 'finished');
});
