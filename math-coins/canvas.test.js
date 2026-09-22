const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { MathCoinsGame } = require('./game-logic.js');

const script = fs.readFileSync(require.resolve('./script.js'), 'utf8');

test('canvas stays sharp at display resolution and pointer hits use logical coordinates', () => {
    const transforms = [];
    const scales = [];
    const handlers = {};
    const context = {
        setTransform: (...values) => transforms.push(values),
        scale: (...values) => scales.push(values),
    };
    for (const method of ['save', 'restore', 'translate', 'rotate', 'beginPath', 'arc',
        'fill', 'stroke', 'roundRect', 'fillText']) {
        context[method] = () => {};
    }
    const canvas = {
        width: 1000,
        height: 700,
        clientWidth: 1250,
        clientHeight: 875,
        clientLeft: 4,
        clientTop: 4,
        getContext: () => context,
        getBoundingClientRect: () => ({ left: 100, top: 50 }),
        addEventListener: (event, handler) => { handlers[event] = handler; },
    };
    const window = {
        devicePixelRatio: 2,
        MathCoins: { MathCoinsGame },
        addEventListener: (event, handler) => { handlers[event] = handler; },
    };
    const sandbox = vm.createContext({
        document: { getElementById: () => canvas },
        window,
        performance: { now: () => 0 },
        requestAnimationFrame: () => {},
        ResizeObserver: class {
            constructor(callback) { handlers.observedResize = callback; }
            observe() {}
        },
    });

    vm.runInContext(script, sandbox);
    assert.equal(canvas.width, 2500);
    assert.equal(canvas.height, 1750);
    assert.deepEqual(transforms.at(-1), [2.5, 0, 0, 2.5, 0, 0]);

    handlers.pointerdown({
        preventDefault() {},
        clientX: 100 + 4 + 163 * 1.25,
        clientY: 50 + 4 + 322 * 1.25,
    });
    assert.equal(vm.runInContext('state.answer', sandbox), '1');

    vm.runInContext('state.dropElapsed = 500; drawCoins()', sandbox);
    assert.ok(scales.some(([x]) => x < 1), 'the next coin tips while time runs down');

    canvas.clientWidth = 1000;
    canvas.clientHeight = 700;
    window.devicePixelRatio = 1;
    handlers.observedResize();
    assert.equal(canvas.width, 1000);
    assert.equal(canvas.height, 700);
    assert.deepEqual(transforms.at(-1), [1, 0, 0, 1, 0, 0]);
});
