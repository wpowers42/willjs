const polarCanvas = document.getElementById('polarCanvas');
const rejectionCanvas = document.getElementById('rejectionCanvas');
const sineCanvas = document.getElementById('sineCanvas');
const polarCtx = polarCanvas.getContext('2d');
const rejectionCtx = rejectionCanvas.getContext('2d');
const sineCtx = sineCanvas.getContext('2d');

// UI elements
const slowBtn = document.getElementById('slowBtn');
const fastBtn = document.getElementById('fastBtn');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const polarCountEl = document.getElementById('polarCount');
const rejectionCountEl = document.getElementById('rejectionCount');
const rejectedCountEl = document.getElementById('rejectedCount');
const sineCountEl = document.getElementById('sineCount');
const sineRejectedCountEl = document.getElementById('sineRejectedCount');
const polarUniformityEl = document.getElementById('polarUniformity');
const rejectionUniformityEl = document.getElementById('rejectionUniformity');
const sineUniformityEl = document.getElementById('sineUniformity');

// State
const TARGET_POINTS = 10000;
let polarPoints = [];
let rejectionPoints = [];
let sinePoints = [];
let rejectedCount = 0;
let sineRejectedCount = 0;
let isRunning = false;
let isFastMode = false;
let animationId = null;

// Timing for slow mode - dynamic scaling
const MIN_POINTS_PER_FRAME = 1;
const MAX_POINTS_PER_FRAME = 15;
const FRAME_DELAY = 16; // Consistent frame rate

// Uniformity calculation settings
const NUM_RINGS = 10;

function resizeCanvases() {
    const container = document.querySelector('.canvas-container');
    const containerRect = container.getBoundingClientRect();

    // Calculate available size for each canvas
    // Account for gap and headers
    const isWideScreen = window.innerWidth >= 1200;
    const isMediumScreen = window.innerWidth >= 800;
    let availableWidth, availableHeight;

    if (isWideScreen) {
        // Three side by side: split width by 3
        availableWidth = (containerRect.width - 40) / 3; // 40px total gap
        availableHeight = containerRect.height - 40; // header space
    } else if (isMediumScreen) {
        // Two + one stacked
        availableWidth = (containerRect.width - 20) / 2;
        availableHeight = (containerRect.height - 60) / 2;
    } else {
        // All stacked: full width, split height by 3
        availableWidth = containerRect.width;
        availableHeight = (containerRect.height - 80) / 3;
    }

    const size = Math.min(availableWidth, availableHeight, 350);

    [polarCanvas, rejectionCanvas, sineCanvas].forEach((canvas) => {
        const ctx = canvas.getContext('2d');
        canvas.style.width = size + 'px';
        canvas.style.height = size + 'px';
        canvas.width = size * window.devicePixelRatio;
        canvas.height = size * window.devicePixelRatio;
        ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    });

    draw();
}

// Polar method (naive): generates clustered distribution toward center
function generatePolarPoint() {
    const angle = Math.random() * 2 * Math.PI;
    const r = Math.random(); // This is the naive approach - linear distribution
    return {
        x: r * Math.cos(angle)
      , y: r * Math.sin(angle)
    };
}

// Rejection sampling: generates uniform distribution
function generateRejectionPoint() {
    let attempts = 0;
    while (true) {
        const x = Math.random() * 2 - 1; // [-1, 1]
        const y = Math.random() * 2 - 1; // [-1, 1]
        attempts++;

        if (x * x + y * y <= 1) {
            return { point: { x, y }, rejected: attempts - 1 };
        }
    }
}

// Sine sampling: choose two random angles, take sin of each
// Creates a distribution biased toward center (sin clusters around 0)
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

// Ease-in smoothing function for dynamic speed scaling
// Uses smoothstep variant that starts slow and accelerates
function easeInCubic(t) {
    return t * t * t;
}

// Calculate points per frame based on progress (0 to 1)
function getPointsPerFrame(progress) {
    const eased = easeInCubic(progress);
    return Math.floor(MIN_POINTS_PER_FRAME + eased * (MAX_POINTS_PER_FRAME - MIN_POINTS_PER_FRAME));
}

// Calculate uniformity score using ring-based analysis
// Returns a score from 0-100 where 100 is perfectly uniform
function calculateUniformity(points) {
    if (points.length < NUM_RINGS) return 0;

    // Count points in each ring
    const ringCounts = new Array(NUM_RINGS).fill(0);

    for (const point of points) {
        const r = Math.sqrt(point.x * point.x + point.y * point.y);
        const ringIndex = Math.min(Math.floor(r * NUM_RINGS), NUM_RINGS - 1);
        ringCounts[ringIndex]++;
    }

    // Calculate expected counts for uniform distribution
    // Area of ring i: π * ((i+1)/N)² - π * (i/N)² = π/N² * (2i + 1)
    // Expected proportion: (2i + 1) / N²
    const expectedCounts = [];
    for (let i = 0; i < NUM_RINGS; i++) {
        const proportion = (2 * i + 1) / (NUM_RINGS * NUM_RINGS);
        expectedCounts.push(proportion * points.length);
    }

    // Calculate chi-squared statistic
    let chiSquared = 0;
    for (let i = 0; i < NUM_RINGS; i++) {
        if (expectedCounts[i] > 0) {
            const diff = ringCounts[i] - expectedCounts[i];
            chiSquared += (diff * diff) / expectedCounts[i];
        }
    }

    // Convert to a 0-100 score
    // Lower chi-squared = more uniform = higher score
    // Use exponential decay: score = 100 * exp(-chiSquared / scale)
    const scale = points.length / 10; // Scale based on sample size
    const score = 100 * Math.exp(-chiSquared / scale);

    return Math.round(score);
}

function generateAllPointsFast() {
    polarPoints = [];
    rejectionPoints = [];
    sinePoints = [];
    rejectedCount = 0;
    sineRejectedCount = 0;

    for (let i = 0; i < TARGET_POINTS; i++) {
        polarPoints.push(generatePolarPoint());

        const rejectionResult = generateRejectionPoint();
        rejectionPoints.push(rejectionResult.point);
        rejectedCount += rejectionResult.rejected;

        const sineResult = generateSinePoint();
        sinePoints.push(sineResult.point);
        sineRejectedCount += sineResult.rejected;
    }

    updateStats();
    draw();
    finishGeneration();
}

function generatePointsSlow() {
    if (!isRunning) return;

    // Calculate dynamic points per frame based on progress
    const progress = polarPoints.length / TARGET_POINTS;
    const pointsThisFrame = getPointsPerFrame(progress);

    for (let i = 0; i < pointsThisFrame && polarPoints.length < TARGET_POINTS; i++) {
        polarPoints.push(generatePolarPoint());

        const rejectionResult = generateRejectionPoint();
        rejectionPoints.push(rejectionResult.point);
        rejectedCount += rejectionResult.rejected;

        const sineResult = generateSinePoint();
        sinePoints.push(sineResult.point);
        sineRejectedCount += sineResult.rejected;
    }

    updateStats();
    draw();

    if (polarPoints.length < TARGET_POINTS) {
        animationId = setTimeout(generatePointsSlow, FRAME_DELAY);
    } else {
        finishGeneration();
    }
}

function updateStats() {
    polarCountEl.textContent = polarPoints.length.toLocaleString();
    rejectionCountEl.textContent = rejectionPoints.length.toLocaleString();
    rejectedCountEl.textContent = rejectedCount.toLocaleString();
    sineCountEl.textContent = sinePoints.length.toLocaleString();
    sineRejectedCountEl.textContent = sineRejectedCount.toLocaleString();

    // Calculate and display uniformity scores
    const polarScore = calculateUniformity(polarPoints);
    const rejectionScore = calculateUniformity(rejectionPoints);
    const sineScore = calculateUniformity(sinePoints);

    polarUniformityEl.textContent = polarScore + '%';
    rejectionUniformityEl.textContent = rejectionScore + '%';
    sineUniformityEl.textContent = sineScore + '%';

    // Color code the scores
    polarUniformityEl.style.color = getScoreColor(polarScore);
    rejectionUniformityEl.style.color = getScoreColor(rejectionScore);
    sineUniformityEl.style.color = getScoreColor(sineScore);
}

function getScoreColor(score) {
    if (score >= 80) return '#4ade80'; // Green
    if (score >= 50) return '#fbbf24'; // Yellow
    return '#f87171'; // Red
}

function finishGeneration() {
    isRunning = false;
    startBtn.disabled = false;
    startBtn.textContent = 'Generate Points';
    slowBtn.disabled = false;
    fastBtn.disabled = false;
}

function draw() {
    drawCanvas(polarCtx, polarCanvas, polarPoints, '#e94560');
    drawCanvas(rejectionCtx, rejectionCanvas, rejectionPoints, '#00d9ff');
    drawCanvas(sineCtx, sineCanvas, sinePoints, '#a855f7');
}

function drawCanvas(ctx, canvas, points, color) {
    const size = canvas.width / window.devicePixelRatio;
    const center = size / 2;
    const radius = size * 0.45; // Leave some padding

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

    // Draw points (smaller for 10k points)
    ctx.fillStyle = color + '60'; // More transparency for many points
    for (const point of points) {
        const x = center + point.x * radius;
        const y = center - point.y * radius; // Flip y for screen coordinates
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
        // Use setTimeout to allow UI to update
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
    polarPoints = [];
    rejectionPoints = [];
    sinePoints = [];
    rejectedCount = 0;
    sineRejectedCount = 0;
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
