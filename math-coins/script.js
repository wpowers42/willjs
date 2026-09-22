const canvas = document.getElementById('game');
const context = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const { MathCoinsGame } = window.MathCoins;

const colors = {
    ink: '#173f52',
    blue: '#66c7e8',
    darkBlue: '#237da1',
    cream: '#fffdf4',
    green: '#63c174',
    darkGreen: '#27884c',
    gold: '#ffd34f',
    darkGold: '#bd741c',
    coral: '#f26f63',
    white: '#ffffff',
};

const logic = new MathCoinsGame();
let state = logic.getState();

const view = {
    fallingCoins: [],
    scorePops: [],
    confetti: [],
    pressedButton: null,
    lastFrame: performance.now(),
};

const keypadButtons = [];
const backspaceButton = {
    type: 'backspace',
    label: '←',
    x: 450,
    y: 159,
    width: 82,
    height: 84,
};
const submitButton = {
    type: 'submit',
    label: '✓',
    x: 545,
    y: 159,
    width: 92,
    height: 84,
};
const equationButtons = [backspaceButton, submitButton];
const playAgainButton = { x: 350, y: 488, width: 300, height: 82 };

function syncState() {
    state = logic.getState();
}

function buildKeypadButtons() {
    keypadButtons.length = 0;

    const startX = 76;
    const startY = 286;
    const buttonWidth = 174;
    const buttonHeight = 72;
    const gapX = 18;
    const gapY = 14;

    state.keys.slice(0, 9).forEach((value, index) => {
        keypadButtons.push({
            type: 'number',
            value,
            label: String(value),
            x: startX + (index % 3) * (buttonWidth + gapX),
            y: startY + Math.floor(index / 3) * (buttonHeight + gapY),
            width: buttonWidth,
            height: buttonHeight,
        });
    });

    const bottomY = startY + 3 * (buttonHeight + gapY);
    keypadButtons.push({
        type: 'disabled', label: ',',
        x: startX, y: bottomY, width: buttonWidth, height: buttonHeight,
    });
    keypadButtons.push({
        type: 'number', value: 0, label: '0',
        x: startX + buttonWidth + gapX, y: bottomY,
        width: buttonWidth, height: buttonHeight,
    });
    keypadButtons.push({
        type: 'skip', label: '?',
        x: startX + 2 * (buttonWidth + gapX), y: bottomY,
        width: buttonWidth, height: buttonHeight,
    });
}

function remainingCoinValue() {
    return state.coins.reduce((total, coin) => total + coin, 0);
}

function coinPosition(value) {
    return {
        x: 704 + (value - 1) * 29,
        y: 161,
    };
}

function addFallingCoin(value) {
    const position = coinPosition(value);
    view.fallingCoins.push({
        value,
        x: position.x,
        y: position.y,
        velocityY: 90,
        rotation: 0,
        alpha: 1,
    });
}

function addScorePop(value, index, awardCount) {
    const spacing = 68;
    const firstX = WIDTH / 2 - ((awardCount - 1) * spacing) / 2;
    view.scorePops.push({
        value,
        x: firstX + index * spacing,
        y: 116,
        remaining: 750,
    });
}

function activateButton(button) {
    if (state.phase !== 'playing' || button.type === 'disabled') return;

    view.pressedButton = { button, remaining: 130 };
    if (button.type === 'number') {
        logic.pressNumber(button.value);
    } else if (button.type === 'backspace') {
        logic.backspace();
    } else if (button.type === 'skip') {
        logic.skip();
    } else {
        logic.submit();
    }
    syncState();
}

function containsPoint(rectangle, x, y) {
    return x >= rectangle.x
        && x <= rectangle.x + rectangle.width
        && y >= rectangle.y
        && y <= rectangle.y + rectangle.height;
}

canvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    const bounds = canvas.getBoundingClientRect();
    const x = (event.clientX - bounds.left) * (WIDTH / bounds.width);
    const y = (event.clientY - bounds.top) * (HEIGHT / bounds.height);

    if (state.phase === 'won') {
        if (containsPoint(playAgainButton, x, y)) {
            logic.reset();
            view.fallingCoins = [];
            view.scorePops = [];
            view.confetti = [];
            syncState();
            buildKeypadButtons();
        }
        return;
    }

    const buttons = [...keypadButtons, ...equationButtons];
    const button = buttons.find((candidate) => containsPoint(candidate, x, y));
    if (button) activateButton(button);
});

function createConfetti() {
    const confettiColors = [colors.gold, colors.coral, colors.blue, colors.green, '#b889e8'];
    view.confetti = Array.from({ length: 90 }, () => ({
        x: 80 + Math.random() * 840,
        y: -250 + Math.random() * 230,
        width: 7 + Math.random() * 8,
        height: 10 + Math.random() * 12,
        velocityX: -40 + Math.random() * 80,
        velocityY: 100 + Math.random() * 130,
        rotation: Math.random() * Math.PI,
        rotationSpeed: (Math.random() - 0.5) * 5,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    }));
}

function update(deltaMilliseconds) {
    const deltaSeconds = deltaMilliseconds / 1000;
    const previousState = state;
    const events = logic.update(deltaMilliseconds);
    syncState();

    events.forEach((event) => {
        if (event.type === 'coin-dropped') {
            addFallingCoin(event.value);
        } else if (event.type === 'coin-awarded') {
            addScorePop(event.value, event.index, previousState.awards.length);
        } else if (event.type === 'round-started') {
            view.scorePops = [];
            buildKeypadButtons();
        } else if (event.type === 'won') {
            createConfetti();
        }
    });

    view.fallingCoins.forEach((coin) => {
        coin.velocityY += 260 * deltaSeconds;
        coin.y += coin.velocityY * deltaSeconds;
        coin.rotation += 2.4 * deltaSeconds;
        coin.alpha -= 0.55 * deltaSeconds;
    });
    view.fallingCoins = view.fallingCoins.filter((coin) => coin.alpha > 0 && coin.y < HEIGHT + 60);

    view.scorePops.forEach((scorePop) => {
        scorePop.y -= 24 * deltaSeconds;
        scorePop.remaining -= deltaMilliseconds;
    });
    view.scorePops = view.scorePops.filter((scorePop) => scorePop.remaining > 0);

    view.confetti.forEach((piece) => {
        piece.x += piece.velocityX * deltaSeconds;
        piece.y += piece.velocityY * deltaSeconds;
        piece.rotation += piece.rotationSpeed * deltaSeconds;
    });
    view.confetti = view.confetti.filter((piece) => piece.y < HEIGHT + 30);

    if (view.pressedButton) {
        view.pressedButton.remaining -= deltaMilliseconds;
        if (view.pressedButton.remaining <= 0) view.pressedButton = null;
    }
}

function roundedRectangle(x, y, width, height, radius, fill, stroke, lineWidth = 0) {
    context.beginPath();
    context.roundRect(x, y, width, height, radius);
    if (fill) {
        context.fillStyle = fill;
        context.fill();
    }
    if (stroke && lineWidth > 0) {
        context.strokeStyle = stroke;
        context.lineWidth = lineWidth;
        context.stroke();
    }
}

function drawText(
    text,
    x,
    y,
    size,
    color,
    align = 'center',
    weight = '700',
    family = 'system-ui, -apple-system, "Segoe UI", sans-serif',
) {
    context.fillStyle = color;
    context.font = `${weight} ${size}px ${family}`;
    context.textAlign = align;
    context.textBaseline = 'middle';
    context.fillText(text, x, y);
}

function drawCoinShape(x, y, radius, label, alpha = 1) {
    context.save();
    context.globalAlpha = alpha;
    context.translate(x, y);

    context.fillStyle = colors.darkGold;
    context.beginPath();
    context.arc(2, 4, radius, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = colors.gold;
    context.strokeStyle = '#d58e22';
    context.lineWidth = 3;
    context.beginPath();
    context.arc(0, 0, radius, 0, Math.PI * 2);
    context.fill();
    context.stroke();

    context.strokeStyle = '#ffeaa0';
    context.lineWidth = 3;
    context.beginPath();
    context.arc(-4, -4, radius - 7, Math.PI, Math.PI * 1.6);
    context.stroke();

    if (label !== '') drawText(label, 0, 1, radius * 1.05, colors.ink);
    context.restore();
}

function drawBackground() {
    context.fillStyle = colors.cream;
    context.fillRect(0, 0, WIDTH, HEIGHT);

    context.fillStyle = '#e8f7fb';
    context.beginPath();
    context.arc(52, 648, 150, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = '#fff1bf';
    context.beginPath();
    context.arc(958, 42, 130, 0, Math.PI * 2);
    context.fill();
}

function drawProgress() {
    const x = 70;
    const y = 48;
    const width = 860;
    const height = 48;
    const progress = Math.min(state.score / state.goal, 1);

    roundedRectangle(x, y, width, height, 24, '#d7edf3', colors.ink, 4);
    if (progress > 0) {
        roundedRectangle(x + 5, y + 5, (width - 10) * progress, height - 10, 19, colors.green);
    }

    drawText(`${state.score} / ${state.goal}`, WIDTH / 2, y + height / 2 + 1, 25, colors.ink);
    drawCoinShape(52, 72, 24, '');
}

function drawButton(button, fill, border, textColor, textSize) {
    const pressed = view.pressedButton && view.pressedButton.button === button;
    const offset = pressed ? 5 : 0;
    roundedRectangle(
        button.x,
        button.y + offset,
        button.width,
        button.height - offset,
        16,
        fill,
        border,
        4,
    );
    drawText(
        button.label,
        button.x + button.width / 2,
        button.y + button.height / 2 + offset,
        textSize,
        textColor,
    );
}

function drawEquation() {
    const wrong = state.phase === 'wrong-feedback';
    const borderColor = wrong ? colors.coral : colors.ink;

    roundedRectangle(55, 134, 600, 134, 24, colors.white, borderColor, wrong ? 7 : 4);
    drawText(`${state.left} + ${state.right} =`, 176, 202, 46, colors.ink);
    roundedRectangle(296, 159, 144, 84, 16, '#f2fbfe', borderColor, 4);
    const displayedAnswer = state.phase === 'skip-feedback'
        ? String(state.feedback.answer)
        : state.answer || '?';
    drawText(displayedAnswer, 368, 203, 40,
        state.phase === 'skip-feedback' || state.answer ? colors.darkBlue : '#a7bdc5');

    drawButton(backspaceButton, '#fff0b8', colors.darkGold, colors.ink, 40);
    drawButton(submitButton, colors.green, colors.darkGreen, colors.white, 40);
}

function drawKeypad() {
    keypadButtons.forEach((button) => {
        const disabled = button.type === 'disabled';
        drawButton(button, disabled ? '#e6ebed' : colors.white,
            disabled ? '#aab8be' : colors.darkBlue,
            disabled ? '#9aa8ae' : colors.ink, 40);
    });
}

function drawCoins() {
    state.coins.forEach((value) => {
        const award = state.awards.find((candidate) => candidate.value === value);
        const animationElapsed = award
            ? state.awardElapsed - (award.awardAt - state.coinFlowDurationMs)
            : -1;
        if (award && animationElapsed >= 0) return;

        const position = coinPosition(value);
        drawCoinShape(position.x, position.y, 12, String(value));
    });

    if (state.coins.length > 0 && state.phase !== 'awarding') {
        const nextValue = state.coins[state.coins.length - 1];
        const position = coinPosition(nextValue);
        const progress = state.dropElapsed / state.coinDropMs;
        context.strokeStyle = colors.coral;
        context.lineWidth = 4;
        context.lineCap = 'round';
        context.beginPath();
        context.arc(position.x, position.y, 17, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
        context.stroke();
    }

    let barFill = '#fff8da';
    let barBorder = '#e2a533';
    let barText = String(remainingCoinValue());
    let barTextColor = colors.ink;
    let showCoinSymbol = true;

    if (state.feedback && state.feedback.type === 'correct') {
        barFill = colors.green;
        barBorder = colors.darkGreen;
        barText = `${state.feedback.answer}  ✓   +${state.feedback.earned}`;
        barTextColor = colors.white;
        showCoinSymbol = false;
    } else if (state.feedback && state.feedback.type === 'wrong') {
        barFill = colors.coral;
        barBorder = '#b9463e';
        barText = `${state.feedback.answer}  ✕`;
        barTextColor = colors.white;
        showCoinSymbol = false;
    } else if (state.feedback && state.feedback.type === 'skip') {
        barText = '→  0';
        showCoinSymbol = false;
    }

    roundedRectangle(682, 190, 268, 70, 20, barFill, barBorder, 4);
    drawText(barText, showCoinSymbol ? 799 : 816, 226, 25, barTextColor);
    if (showCoinSymbol) drawCoinShape(846, 225, 13, '');

    view.fallingCoins.forEach((coin) => {
        context.save();
        context.translate(coin.x, coin.y);
        context.rotate(coin.rotation);
        drawCoinShape(0, 0, 12, String(coin.value), Math.max(coin.alpha, 0));
        context.restore();
    });

    state.awards.forEach((award) => {
        const startAt = award.awardAt - state.coinFlowDurationMs;
        const elapsed = state.awardElapsed - startAt;
        if (elapsed < 0 || elapsed >= state.coinFlowDurationMs) return;

        const progress = elapsed / state.coinFlowDurationMs;
        const easedProgress = 1 - (1 - progress) ** 3;
        const start = coinPosition(award.value);
        const targetX = 75 + 850 * Math.min(award.targetScore / state.goal, 1);
        const x = start.x + (targetX - start.x) * easedProgress;
        const y = start.y + (72 - start.y) * easedProgress - Math.sin(progress * Math.PI) * 70;
        drawCoinShape(x, y, 14, String(award.value));
    });

    view.scorePops.forEach((scorePop) => {
        const alpha = Math.min(scorePop.remaining / 250, 1);
        context.save();
        context.globalAlpha = alpha;
        drawText(`+${scorePop.value}`, scorePop.x, scorePop.y, 22, colors.darkGreen);
        context.restore();
    });
}

function drawConfetti() {
    view.confetti.forEach((piece) => {
        context.save();
        context.translate(piece.x, piece.y);
        context.rotate(piece.rotation);
        context.fillStyle = piece.color;
        context.fillRect(-piece.width / 2, -piece.height / 2, piece.width, piece.height);
        context.restore();
    });
}

function drawWinScreen() {
    context.fillStyle = 'rgb(23 63 82 / 72%)';
    context.fillRect(0, 0, WIDTH, HEIGHT);

    roundedRectangle(225, 160, 550, 430, 38, colors.cream, colors.gold, 8);
    drawText('★  ★  ★', 500, 245, 56, colors.gold);
    drawText('✓', 500, 337, 100, colors.darkGreen);
    drawText(String(state.score), 475, 418, 38, colors.ink);
    drawCoinShape(555, 416, 23, '');
    roundedRectangle(
        playAgainButton.x,
        playAgainButton.y,
        playAgainButton.width,
        playAgainButton.height,
        25,
        colors.green,
        colors.darkGreen,
        5,
    );
    drawText('↻', 500, 530, 49, colors.white);
}

function draw() {
    drawBackground();
    drawProgress();
    drawEquation();
    drawKeypad();
    drawCoins();
    drawConfetti();

    if (state.phase === 'won') drawWinScreen();
}

function gameLoop(timestamp) {
    const elapsed = Math.min(timestamp - view.lastFrame, 100);
    view.lastFrame = timestamp;
    update(elapsed);
    draw();
    requestAnimationFrame(gameLoop);
}

buildKeypadButtons();
requestAnimationFrame(gameLoop);
