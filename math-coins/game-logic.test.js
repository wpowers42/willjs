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
    assert.deepEqual(game.getState().coins, initial.coins);
    assert.deepEqual(game.update(1000), [{ type: 'round-started' }]);
    assert.equal(game.getState().phase, 'playing');
    assert.equal(game.getState().score, 0);
    assert.deepEqual(game.getState().coins, initial.coins);
});

test('a wrong answer keeps the round and coin timer running before clearing the guess', () => {
    const game = new MathCoinsGame({ random: seededRandom(7) });
    const initial = game.getState();
    const wrongAnswer = initial.left + initial.right + 1;

    game.update(2900);
    String(wrongAnswer).split('').forEach((digit) => game.pressNumber(Number(digit)));
    game.submit();

    assert.equal(game.getState().phase, 'wrong-feedback');
    assert.equal(game.getState().answer, String(wrongAnswer));

    game.update(100);
    assert.deepEqual(game.getState().coins, [1, 2, 3, 4, 5, 6, 7, 8]);

    game.update(1000);
    const retried = game.getState();
    assert.equal(retried.phase, 'playing');
    assert.equal(retried.answer, '');
    assert.equal(retried.left, initial.left);
    assert.equal(retried.right, initial.right);
    assert.equal(retried.score, 0);
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

    assert.deepEqual(game.update(160), [{ type: 'coin-awarded', value: 2, index: 1 }]);
    assert.equal(game.getState().score, 3);

    game.update(1370);
    const nextRound = game.getState();
    assert.equal(nextRound.score, 45);
    assert.equal(nextRound.phase, 'playing');
    assert.equal(nextRound.answer, '');
    assert.deepEqual(nextRound.coins, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
});

test('reaching the goal finishes the game after the last coin arrives', () => {
    const game = new MathCoinsGame({
        random: seededRandom(13),
        goal: 45,
    });
    const state = game.getState();
    const correctAnswer = state.left + state.right;

    String(correctAnswer).split('').forEach((digit) => game.pressNumber(Number(digit)));
    game.submit();
    const events = game.update(2230);

    assert.equal(game.getState().score, 45);
    assert.equal(game.getState().phase, 'won');
    assert.deepEqual(events.at(-1), { type: 'won' });
});
