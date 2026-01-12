const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// UI elements
const v1xEl = document.getElementById('v1x');
const v1yEl = document.getElementById('v1y');
const v1areaEl = document.getElementById('v1area');
const v2xEl = document.getElementById('v2x');
const v2yEl = document.getElementById('v2y');
const v2areaEl = document.getElementById('v2area');
const dist1El = document.getElementById('dist1');
const dist2El = document.getElementById('dist2');
const newBtn = document.getElementById('newBtn');
const fireBtn = document.getElementById('fireBtn');

// Physics constants
const GRAVITY = 500; // pixels per second squared
const VECTOR_SCALE = 0.3; // for display

// State
let v1 = { x: 0, y: 0 };
let v2 = { x: 0, y: 0 };
let projectile1 = null;
let projectile2 = null;
let trail1 = [];
let trail2 = [];
let isAnimating = false;
let groundY = 0;
let startX = 0;

// Drag state
let isDragging = false;
let dragTarget = null; // 'v2'

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    groundY = rect.height - 50;
    startX = 80;
    draw();
}

function generateRandomV1() {
    // Generate random velocity components
    // Ensure reasonable range for visualization
    v1.x = 150 + Math.random() * 300; // 150-450
    v1.y = 150 + Math.random() * 300; // 150-450

    // Calculate V2 from area
    const area = v1.x * v1.y;
    const side = Math.sqrt(area);
    v2.x = side;
    v2.y = side;

    updateUI();
    resetProjectiles();
}

function updateUI() {
    const area1 = v1.x * v1.y;
    const area2 = v2.x * v2.y;

    v1xEl.textContent = v1.x.toFixed(1);
    v1yEl.textContent = v1.y.toFixed(1);
    v1areaEl.textContent = area1.toFixed(0);

    v2xEl.textContent = v2.x.toFixed(1);
    v2yEl.textContent = v2.y.toFixed(1);
    v2areaEl.textContent = area2.toFixed(0);

    // Calculate theoretical distances
    // D = (2 * Vx * Vy) / g
    const d1 = (2 * v1.x * v1.y) / GRAVITY;
    const d2 = (2 * v2.x * v2.y) / GRAVITY;

    dist1El.textContent = d1.toFixed(1) + ' px';
    dist2El.textContent = d2.toFixed(1) + ' px';
}

function resetProjectiles() {
    projectile1 = null;
    projectile2 = null;
    trail1 = [];
    trail2 = [];
    isAnimating = false;
    draw();
}

// RK4 integration for projectile motion
// State: [x, y, vx, vy]
// Derivatives: [vx, vy, 0, g]
function rk4Step(state, dt, g) {
    const [x, y, vx, vy] = state;

    // k1
    const k1_x = vx;
    const k1_y = vy;
    const k1_vx = 0;
    const k1_vy = g;

    // k2
    const k2_x = vx + k1_vx * dt / 2;
    const k2_y = vy + k1_vy * dt / 2;
    const k2_vx = 0;
    const k2_vy = g;

    // k3
    const k3_x = vx + k2_vx * dt / 2;
    const k3_y = vy + k2_vy * dt / 2;
    const k3_vx = 0;
    const k3_vy = g;

    // k4
    const k4_x = vx + k3_vx * dt;
    const k4_y = vy + k3_vy * dt;
    const k4_vx = 0;
    const k4_vy = g;

    // Combine
    const new_x = x + (k1_x + 2 * k2_x + 2 * k3_x + k4_x) * dt / 6;
    const new_y = y + (k1_y + 2 * k2_y + 2 * k3_y + k4_y) * dt / 6;
    const new_vx = vx + (k1_vx + 2 * k2_vx + 2 * k3_vx + k4_vx) * dt / 6;
    const new_vy = vy + (k1_vy + 2 * k2_vy + 2 * k3_vy + k4_vy) * dt / 6;

    return [new_x, new_y, new_vx, new_vy];
}

function fireProjectiles() {
    if (isAnimating) return;

    trail1 = [];
    trail2 = [];

    // Initialize projectiles at ground level
    projectile1 = {
        x: startX,
        y: groundY,
        vx: v1.x,
        vy: -v1.y, // negative because y increases downward
        color: '#e94560',
        landed: false,
        landX: null
    };

    projectile2 = {
        x: startX,
        y: groundY,
        vx: v2.x,
        vy: -v2.y,
        color: '#00d9ff',
        landed: false,
        landX: null
    };

    isAnimating = true;
    lastTime = performance.now();
    requestAnimationFrame(animate);
}

let lastTime = 0;
const FIXED_DT = 1 / 240; // Fixed timestep for physics (240 Hz)

function animate(currentTime = performance.now()) {
    if (!isAnimating) return;

    const frameTime = Math.min((currentTime - lastTime) / 1000, 0.1); // cap delta time
    lastTime = currentTime;

    // Accumulator for fixed timestep
    let accumulator = frameTime;

    while (accumulator >= FIXED_DT) {
        // Update projectile 1 with RK4
        if (projectile1 && !projectile1.landed) {
            const state1 = [projectile1.x, projectile1.y, projectile1.vx, projectile1.vy];
            const newState1 = rk4Step(state1, FIXED_DT, GRAVITY);

            projectile1.x = newState1[0];
            projectile1.y = newState1[1];
            projectile1.vx = newState1[2];
            projectile1.vy = newState1[3];

            // Check for ground collision with interpolation
            if (projectile1.y >= groundY && projectile1.vy > 0) {
                // Interpolate to find exact landing position
                const prevY = state1[1];
                const t = (groundY - prevY) / (projectile1.y - prevY);
                projectile1.landX = state1[0] + t * (projectile1.x - state1[0]);
                projectile1.y = groundY;
                projectile1.x = projectile1.landX;
                projectile1.landed = true;
            }
        }

        // Update projectile 2 with RK4
        if (projectile2 && !projectile2.landed) {
            const state2 = [projectile2.x, projectile2.y, projectile2.vx, projectile2.vy];
            const newState2 = rk4Step(state2, FIXED_DT, GRAVITY);

            projectile2.x = newState2[0];
            projectile2.y = newState2[1];
            projectile2.vx = newState2[2];
            projectile2.vy = newState2[3];

            // Check for ground collision with interpolation
            if (projectile2.y >= groundY && projectile2.vy > 0) {
                const prevY = state2[1];
                const t = (groundY - prevY) / (projectile2.y - prevY);
                projectile2.landX = state2[0] + t * (projectile2.x - state2[0]);
                projectile2.y = groundY;
                projectile2.x = projectile2.landX;
                projectile2.landed = true;
            }
        }

        accumulator -= FIXED_DT;
    }

    // Record trail points (only once per frame for performance)
    if (projectile1 && !projectile1.landed) {
        trail1.push({ x: projectile1.x, y: projectile1.y });
    }
    if (projectile2 && !projectile2.landed) {
        trail2.push({ x: projectile2.x, y: projectile2.y });
    }

    draw();

    // Continue animation if either projectile is still in flight
    if (!projectile1?.landed || !projectile2?.landed) {
        requestAnimationFrame(animate);
    } else {
        isAnimating = false;
        // Update distances with actual landed positions
        if (projectile1.landX && projectile2.landX) {
            dist1El.textContent = (projectile1.landX - startX).toFixed(1) + ' px';
            dist2El.textContent = (projectile2.landX - startX).toFixed(1) + ' px';
        }
    }
}

function draw() {
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);

    // Draw ground
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(width, groundY);
    ctx.stroke();

    // Draw start position marker
    ctx.fillStyle = '#666';
    ctx.beginPath();
    ctx.arc(startX, groundY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Always draw iso-area curve (hyperbola)
    drawIsoAreaCurve();

    // Draw initial velocity vectors (if not animating)
    if (!isAnimating && !projectile1?.landed) {
        // V1 vector
        ctx.strokeStyle = '#e94560';
        ctx.lineWidth = 3;
        drawArrow(startX, groundY, startX + v1.x * VECTOR_SCALE, groundY - v1.y * VECTOR_SCALE);

        // V2 vector (with drag handle)
        ctx.strokeStyle = '#00d9ff';
        ctx.lineWidth = 3;
        const v2EndX = startX + v2.x * VECTOR_SCALE;
        const v2EndY = groundY - v2.y * VECTOR_SCALE;
        drawArrow(startX, groundY, v2EndX, v2EndY);

        // Draw drag handle for V2
        ctx.fillStyle = isDragging && dragTarget === 'v2' ? '#ffffff' : '#00d9ff';
        ctx.beginPath();
        ctx.arc(v2EndX, v2EndY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Draw trails
    if (trail1.length > 1) {
        ctx.strokeStyle = '#e9456080';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(trail1[0].x, trail1[0].y);
        for (let i = 1; i < trail1.length; i++) {
            ctx.lineTo(trail1[i].x, trail1[i].y);
        }
        ctx.stroke();
    }

    if (trail2.length > 1) {
        ctx.strokeStyle = '#00d9ff80';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(trail2[0].x, trail2[0].y);
        for (let i = 1; i < trail2.length; i++) {
            ctx.lineTo(trail2[i].x, trail2[i].y);
        }
        ctx.stroke();
    }

    // Draw projectiles
    if (projectile1) {
        ctx.fillStyle = projectile1.color;
        ctx.beginPath();
        ctx.arc(projectile1.x, projectile1.y, 8, 0, Math.PI * 2);
        ctx.fill();

        // Draw landing marker
        if (projectile1.landed) {
            ctx.strokeStyle = projectile1.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(projectile1.landX, groundY - 15);
            ctx.lineTo(projectile1.landX, groundY + 15);
            ctx.stroke();
        }
    }

    if (projectile2) {
        ctx.fillStyle = projectile2.color;
        ctx.beginPath();
        ctx.arc(projectile2.x, projectile2.y, 8, 0, Math.PI * 2);
        ctx.fill();

        // Draw landing marker
        if (projectile2.landed) {
            ctx.strokeStyle = projectile2.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(projectile2.landX, groundY - 15);
            ctx.lineTo(projectile2.landX, groundY + 15);
            ctx.stroke();
        }
    }

    // Draw legend
    ctx.font = '14px -apple-system, sans-serif';
    ctx.fillStyle = '#e94560';
    ctx.fillText('V1 (Random)', 10, 25);
    ctx.fillStyle = '#00d9ff';
    ctx.fillText('V2 (Drag to adjust)', 10, 45);
    ctx.fillStyle = '#ffd70080';
    ctx.fillText('Iso-Area Curve (same Vx·Vy)', 10, 65);
}

function drawIsoAreaCurve() {
    const area = v1.x * v1.y;
    if (area <= 0) return;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width;

    ctx.strokeStyle = '#ffd70040';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();

    // Draw hyperbola: Vx * Vy = area
    // Extend to canvas bounds
    // Min Vx: small positive value to avoid division issues
    // Max Vx: determined by canvas width

    const minVx = 10;
    const maxVx = (width - startX) / VECTOR_SCALE + 100; // extend beyond canvas edge
    let started = false;

    for (let vx = minVx; vx <= maxVx; vx += 2) {
        const vy = area / vx;

        const screenX = startX + vx * VECTOR_SCALE;
        const screenY = groundY - vy * VECTOR_SCALE;

        // Only draw if within reasonable screen bounds
        if (screenY < -100 || screenY > groundY + 50) continue;
        if (screenX < 0 || screenX > width + 50) continue;

        if (!started) {
            ctx.moveTo(screenX, screenY);
            started = true;
        } else {
            ctx.lineTo(screenX, screenY);
        }
    }

    ctx.stroke();
    ctx.setLineDash([]);

    // Draw a small marker at V1's position on the curve
    const v1ScreenX = startX + v1.x * VECTOR_SCALE;
    const v1ScreenY = groundY - v1.y * VECTOR_SCALE;
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(v1ScreenX, v1ScreenY, 4, 0, Math.PI * 2);
    ctx.fill();
}

function drawArrow(fromX, fromY, toX, toY) {
    const headLen = 12;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Arrow head
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
}

// Drag handling
function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    return { x, y };
}

function isNearV2Handle(x, y) {
    const v2EndX = startX + v2.x * VECTOR_SCALE;
    const v2EndY = groundY - v2.y * VECTOR_SCALE;
    const dist = Math.hypot(x - v2EndX, y - v2EndY);
    return dist < 20;
}

function handleDragStart(e) {
    if (isAnimating) return;

    const coords = getCanvasCoords(e);
    if (isNearV2Handle(coords.x, coords.y)) {
        isDragging = true;
        dragTarget = 'v2';
        canvas.style.cursor = 'grabbing';
        e.preventDefault();
    }
}

function handleDragMove(e) {
    const coords = getCanvasCoords(e);

    if (isDragging && dragTarget === 'v2') {
        // Constrain V2 to the iso-area hyperbola
        // Use mouse X position to determine Vx, then calculate Vy = area / Vx
        const area = v1.x * v1.y;
        const newVx = (coords.x - startX) / VECTOR_SCALE;

        // Clamp Vx to reasonable range
        v2.x = Math.max(20, Math.min(1500, newVx));
        // Calculate Vy to stay on hyperbola
        v2.y = area / v2.x;

        updateUI();
        resetProjectiles();
        e.preventDefault();
    } else if (!isAnimating && !projectile1?.landed) {
        // Update cursor when hovering over handle
        if (isNearV2Handle(coords.x, coords.y)) {
            canvas.style.cursor = 'grab';
        } else {
            canvas.style.cursor = 'default';
        }
    }
}

function handleDragEnd(e) {
    if (isDragging) {
        isDragging = false;
        dragTarget = null;
        canvas.style.cursor = 'default';
    }
}

// Event listeners
newBtn.addEventListener('click', generateRandomV1);
fireBtn.addEventListener('click', fireProjectiles);
window.addEventListener('resize', resizeCanvas);

// Mouse drag events
canvas.addEventListener('mousedown', handleDragStart);
canvas.addEventListener('mousemove', handleDragMove);
canvas.addEventListener('mouseup', handleDragEnd);
canvas.addEventListener('mouseleave', handleDragEnd);

// Touch drag events
canvas.addEventListener('touchstart', handleDragStart);
canvas.addEventListener('touchmove', handleDragMove);
canvas.addEventListener('touchend', handleDragEnd);

// Initialize
resizeCanvas();
generateRandomV1();
