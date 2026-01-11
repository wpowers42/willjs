const idealCanvas = document.getElementById('idealCanvas');
const polarCanvas = document.getElementById('polarCanvas');
const rejectionCanvas = document.getElementById('rejectionCanvas');
const sineCanvas = document.getElementById('sineCanvas');
const walkCanvas = document.getElementById('walkCanvas');
const idealCtx = idealCanvas.getContext('2d');
const polarCtx = polarCanvas.getContext('2d');
const rejectionCtx = rejectionCanvas.getContext('2d');
const sineCtx = sineCanvas.getContext('2d');
const walkCtx = walkCanvas.getContext('2d');

// UI elements
const slowBtn = document.getElementById('slowBtn');
const fastBtn = document.getElementById('fastBtn');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const idealCountEl = document.getElementById('idealCount');
const polarCountEl = document.getElementById('polarCount');
const rejectionCountEl = document.getElementById('rejectionCount');
const rejectedCountEl = document.getElementById('rejectedCount');
const sineCountEl = document.getElementById('sineCount');
const sineRejectedCountEl = document.getElementById('sineRejectedCount');
const walkCountEl = document.getElementById('walkCount');
const walkRejectedCountEl = document.getElementById('walkRejectedCount');
const idealUniformityEl = document.getElementById('idealUniformity');
const polarUniformityEl = document.getElementById('polarUniformity');
const rejectionUniformityEl = document.getElementById('rejectionUniformity');
const sineUniformityEl = document.getElementById('sineUniformity');
const walkUniformityEl = document.getElementById('walkUniformity');

// State
const TARGET_POINTS = 10000;
let idealPoints = [];
let polarPoints = [];
let rejectionPoints = [];
let sinePoints = [];
let walkPoints = [];
let rejectedCount = 0;
let sineRejectedCount = 0;
let walkRejectedCount = 0;
let walkCurrentPos = { x: 0, y: 0 };
let isRunning = false;
let isFastMode = false;
let animationId = null;

// Timing for slow mode - dynamic scaling
const MIN_POINTS_PER_FRAME = 5;
const MAX_POINTS_PER_FRAME = 20;
const FRAME_DELAY = 16; // Consistent frame rate

// Uniformity calculation settings
const NUM_RINGS = 10;

function resizeCanvases() {
    const container = document.querySelector('.canvas-container');
    const containerRect = container.getBoundingClientRect();

    // Calculate available size for each canvas
    const numCanvases = 5;
    const gap = 15;
    const isWideScreen = window.innerWidth >= 1600;
    const isMediumScreen = window.innerWidth >= 1000;
    let availableWidth, availableHeight;

    if (isWideScreen) {
        // Five side by side
        availableWidth = (containerRect.width - gap * (numCanvases - 1)) / numCanvases;
        availableHeight = containerRect.height - 40;
    } else if (isMediumScreen) {
        // 3 + 2 layout (wrapping)
        availableWidth = (containerRect.width - gap * 2) / 3;
        availableHeight = (containerRect.height - gap - 60) / 2;
    } else {
        // 2 + 2 + 1 or smaller
        availableWidth = (containerRect.width - gap) / 2;
        availableHeight = (containerRect.height - gap * 2 - 80) / 3;
    }

    const size = Math.min(availableWidth, availableHeight, 200);

    [idealCanvas, polarCanvas, rejectionCanvas, sineCanvas, walkCanvas].forEach((canvas) => {
        const ctx = canvas.getContext('2d');
        canvas.style.width = size + 'px';
        canvas.style.height = size + 'px';
        canvas.width = size * window.devicePixelRatio;
        canvas.height = size * window.devicePixelRatio;
        ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    });

    draw();
}

// Ideal method: uniform distribution with sqrt correction (0% rejection)
function generateIdealPoint() {
    const angle = Math.random() * 2 * Math.PI;
    const r = Math.sqrt(Math.random()); // sqrt correction for uniform area distribution
    return {
        x: r * Math.cos(angle)
      , y: r * Math.sin(angle)
    };
}

// Polar method (naive): generates clustered distribution toward center (0% rejection)
function generatePolarPoint() {
    const angle = Math.random() * 2 * Math.PI;
    const r = Math.random(); // Linear distribution - clusters toward center
    return {
        x: r * Math.cos(angle)
      , y: r * Math.sin(angle)
    };
}

// Rejection sampling: try once, return point if in circle, null if rejected
function tryRejectionPoint() {
    const x = Math.random() * 2 - 1; // [-1, 1]
    const y = Math.random() * 2 - 1; // [-1, 1]

    if (x * x + y * y <= 1) {
        return { x, y };
    }
    return null; // Rejected
}

// Sine sampling: try once, return point if in circle, null if rejected
function trySinePoint() {
    const angle1 = Math.random() * 2 * Math.PI;
    const angle2 = Math.random() * 2 * Math.PI;
    const x = Math.sin(angle1);
    const y = Math.sin(angle2);

    if (x * x + y * y <= 1) {
        return { x, y };
    }
    return null; // Rejected
}

// Random walk: from current position, try stepping to a new point
function tryWalkPoint() {
    const angle = Math.random() * 2 * Math.PI;
    const length = Math.random(); // Length between 0 and 1
    const newX = walkCurrentPos.x + length * Math.cos(angle);
    const newY = walkCurrentPos.y + length * Math.sin(angle);

    if (newX * newX + newY * newY <= 1) {
        walkCurrentPos = { x: newX, y: newY };
        return { x: newX, y: newY };
    }
    return null; // Rejected, stay at current position
}

// Full generation for rejection sampling (used in fast mode)
function generateRejectionPoint() {
    let attempts = 0;
    while (true) {
        const x = Math.random() * 2 - 1;
        const y = Math.random() * 2 - 1;
        attempts++;
        if (x * x + y * y <= 1) {
            return { point: { x, y }, rejected: attempts - 1 };
        }
    }
}

// Full generation for sine sampling (used in fast mode)
function generateSinePoint() {
    let attempts = 0;
    while (true) {
        const angle1 = Math.random() * 2 * Math.PI;
        const angle2 = Math.random() * 2 * Math.PI;
        const x = Math.sin(angle1);
        const y = Math.sin(angle2);
        attempts++;
        if (x * x + y * y <= 1) {
            return { point: { x, y }, rejected: attempts - 1 };
        }
    }
}

// Full generation for walk sampling (used in fast mode)
function generateWalkPoint(currentPos) {
    let attempts = 0;
    while (true) {
        const angle = Math.random() * 2 * Math.PI;
        const length = Math.random();
        const newX = currentPos.x + length * Math.cos(angle);
        const newY = currentPos.y + length * Math.sin(angle);
        attempts++;
        if (newX * newX + newY * newY <= 1) {
            return { point: { x: newX, y: newY }, rejected: attempts - 1 };
        }
    }
}

// Ease-in smoothing function for dynamic speed scaling
function easeInCubic(t) {
    return t * t * t;
}

// Calculate points per frame based on progress (0 to 1)
function getPointsPerFrame(progress) {
    const eased = easeInCubic(progress);
    return Math.floor(MIN_POINTS_PER_FRAME + eased * (MAX_POINTS_PER_FRAME - MIN_POINTS_PER_FRAME));
}

// Calculate uniformity score using ring-based analysis
function calculateUniformity(points) {
    if (points.length < NUM_RINGS) return 0;

    const ringCounts = new Array(NUM_RINGS).fill(0);

    for (const point of points) {
        const r = Math.sqrt(point.x * point.x + point.y * point.y);
        const ringIndex = Math.min(Math.floor(r * NUM_RINGS), NUM_RINGS - 1);
        ringCounts[ringIndex]++;
    }

    const expectedCounts = [];
    for (let i = 0; i < NUM_RINGS; i++) {
        const proportion = (2 * i + 1) / (NUM_RINGS * NUM_RINGS);
        expectedCounts.push(proportion * points.length);
    }

    let chiSquared = 0;
    for (let i = 0; i < NUM_RINGS; i++) {
        if (expectedCounts[i] > 0) {
            const diff = ringCounts[i] - expectedCounts[i];
            chiSquared += (diff * diff) / expectedCounts[i];
        }
    }

    const scale = points.length / 10;
    const score = 100 * Math.exp(-chiSquared / scale);

    return Math.round(score);
}

function generateAllPointsFast() {
    idealPoints = [];
    polarPoints = [];
    rejectionPoints = [];
    sinePoints = [];
    walkPoints = [];
    rejectedCount = 0;
    sineRejectedCount = 0;
    walkRejectedCount = 0;
    walkCurrentPos = { x: 0, y: 0 };

    for (let i = 0; i < TARGET_POINTS; i++) {
        idealPoints.push(generateIdealPoint());
        polarPoints.push(generatePolarPoint());

        const rejectionResult = generateRejectionPoint();
        rejectionPoints.push(rejectionResult.point);
        rejectedCount += rejectionResult.rejected;

        const sineResult = generateSinePoint();
        sinePoints.push(sineResult.point);
        sineRejectedCount += sineResult.rejected;

        const walkResult = generateWalkPoint(walkCurrentPos);
        walkPoints.push(walkResult.point);
        walkCurrentPos = walkResult.point;
        walkRejectedCount += walkResult.rejected;
    }

    updateStats();
    draw();
    finishGeneration();
}

function generatePointsSlow() {
    if (!isRunning) return;

    // Calculate dynamic attempts per frame based on progress of fastest method
    const maxPoints = Math.max(
        idealPoints.length
      , polarPoints.length
      , rejectionPoints.length
      , sinePoints.length
      , walkPoints.length
    );
    const progress = maxPoints / TARGET_POINTS;
    const attemptsThisFrame = getPointsPerFrame(progress);

    // Each method gets the same number of attempts per frame
    // Methods with 0% rejection (ideal, polar) will finish first
    for (let i = 0; i < attemptsThisFrame; i++) {
        // Ideal - always succeeds
        if (idealPoints.length < TARGET_POINTS) {
            idealPoints.push(generateIdealPoint());
        }

        // Polar - always succeeds
        if (polarPoints.length < TARGET_POINTS) {
            polarPoints.push(generatePolarPoint());
        }

        // Rejection - may reject
        if (rejectionPoints.length < TARGET_POINTS) {
            const point = tryRejectionPoint();
            if (point) {
                rejectionPoints.push(point);
            } else {
                rejectedCount++;
            }
        }

        // Sine - may reject
        if (sinePoints.length < TARGET_POINTS) {
            const point = trySinePoint();
            if (point) {
                sinePoints.push(point);
            } else {
                sineRejectedCount++;
            }
        }

        // Walk - may reject
        if (walkPoints.length < TARGET_POINTS) {
            const point = tryWalkPoint();
            if (point) {
                walkPoints.push(point);
            } else {
                walkRejectedCount++;
            }
        }
    }

    updateStats();
    draw();

    // Continue if any method hasn't reached target
    const allDone = idealPoints.length >= TARGET_POINTS &&
                    polarPoints.length >= TARGET_POINTS &&
                    rejectionPoints.length >= TARGET_POINTS &&
                    sinePoints.length >= TARGET_POINTS &&
                    walkPoints.length >= TARGET_POINTS;

    if (!allDone) {
        animationId = setTimeout(generatePointsSlow, FRAME_DELAY);
    } else {
        finishGeneration();
    }
}

function updateStats() {
    idealCountEl.textContent = idealPoints.length.toLocaleString();
    polarCountEl.textContent = polarPoints.length.toLocaleString();
    rejectionCountEl.textContent = rejectionPoints.length.toLocaleString();
    rejectedCountEl.textContent = rejectedCount.toLocaleString();
    sineCountEl.textContent = sinePoints.length.toLocaleString();
    sineRejectedCountEl.textContent = sineRejectedCount.toLocaleString();
    walkCountEl.textContent = walkPoints.length.toLocaleString();
    walkRejectedCountEl.textContent = walkRejectedCount.toLocaleString();

    const idealScore = calculateUniformity(idealPoints);
    const polarScore = calculateUniformity(polarPoints);
    const rejectionScore = calculateUniformity(rejectionPoints);
    const sineScore = calculateUniformity(sinePoints);
    const walkScore = calculateUniformity(walkPoints);

    idealUniformityEl.textContent = idealScore + '%';
    polarUniformityEl.textContent = polarScore + '%';
    rejectionUniformityEl.textContent = rejectionScore + '%';
    sineUniformityEl.textContent = sineScore + '%';
    walkUniformityEl.textContent = walkScore + '%';

    idealUniformityEl.style.color = getScoreColor(idealScore);
    polarUniformityEl.style.color = getScoreColor(polarScore);
    rejectionUniformityEl.style.color = getScoreColor(rejectionScore);
    sineUniformityEl.style.color = getScoreColor(sineScore);
    walkUniformityEl.style.color = getScoreColor(walkScore);
}

function getScoreColor(score) {
    if (score >= 80) return '#4ade80';
    if (score >= 50) return '#fbbf24';
    return '#f87171';
}

function finishGeneration() {
    isRunning = false;
    startBtn.disabled = false;
    startBtn.textContent = 'Generate Points';
    slowBtn.disabled = false;
    fastBtn.disabled = false;
}

function draw() {
    drawCanvas(idealCtx, idealCanvas, idealPoints, '#4ade80');
    drawCanvas(polarCtx, polarCanvas, polarPoints, '#e94560');
    drawCanvas(rejectionCtx, rejectionCanvas, rejectionPoints, '#00d9ff');
    drawCanvas(sineCtx, sineCanvas, sinePoints, '#a855f7');
    drawCanvas(walkCtx, walkCanvas, walkPoints, '#f97316');
}

function drawCanvas(ctx, canvas, points, color) {
    const size = canvas.width / window.devicePixelRatio;
    const center = size / 2;
    const radius = size * 0.45;

    ctx.clearRect(0, 0, size, size);

    // Draw circle outline
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Draw crosshairs
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(center - radius, center);
    ctx.lineTo(center + radius, center);
    ctx.moveTo(center, center - radius);
    ctx.lineTo(center, center + radius);
    ctx.stroke();

    // Draw points
    ctx.fillStyle = color + '60';
    for (const point of points) {
        const x = center + point.x * radius;
        const y = center - point.y * radius;
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function startGeneration() {
    if (isRunning) return;

    reset();
    isRunning = true;
    startBtn.disabled = true;
    startBtn.textContent = 'Generating...';
    slowBtn.disabled = true;
    fastBtn.disabled = true;

    if (isFastMode) {
        setTimeout(generateAllPointsFast, 10);
    } else {
        generatePointsSlow();
    }
}

function reset() {
    if (animationId) {
        clearTimeout(animationId);
        animationId = null;
    }
    isRunning = false;
    idealPoints = [];
    polarPoints = [];
    rejectionPoints = [];
    sinePoints = [];
    walkPoints = [];
    rejectedCount = 0;
    sineRejectedCount = 0;
    walkRejectedCount = 0;
    walkCurrentPos = { x: 0, y: 0 };
    updateStats();
    draw();
    startBtn.disabled = false;
    startBtn.textContent = 'Generate Points';
    slowBtn.disabled = false;
    fastBtn.disabled = false;
}

function setSpeedMode(fast) {
    isFastMode = fast;
    slowBtn.classList.toggle('active', !fast);
    fastBtn.classList.toggle('active', fast);
}

// Event listeners
slowBtn.addEventListener('click', () => setSpeedMode(false));
fastBtn.addEventListener('click', () => setSpeedMode(true));
startBtn.addEventListener('click', startGeneration);
resetBtn.addEventListener('click', reset);
window.addEventListener('resize', resizeCanvases);

// Initialize
resizeCanvases();
