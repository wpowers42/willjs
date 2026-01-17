/**
 * Ambient Music Generator - Main Controller
 * Brian Eno-inspired generative ambient music for sleeping
 */

import { AudioEngine } from './AudioEngine.js';

// Canvas and context
let canvas, ctx;
let audioEngine;
let animationId;
let silentAudio;

// Colors
const COLORS = {
    background: '#0a0a0f',
    ring: '#f4a460',
    ringDim: 'rgba(244, 164, 96, 0.15)',
    ringActive: 'rgba(244, 164, 96, 0.9)',
    text: '#f4a460',
};

// Visualization settings (will be updated based on screen size)
let VIZ = {
    ringSpacing: 30,
    ringWidth: 4,
    centerRadius: 45,
};

function updateVisualizationSettings() {
    const minDimension = Math.min(window.innerWidth, window.innerHeight);
    // Scale visualization based on screen size
    // Target: fit 8 rings comfortably with some padding
    const availableRadius = (minDimension * 0.42); // 42% of min dimension for rings
    const numRings = 8;

    VIZ.ringSpacing = Math.max(18, Math.min(35, availableRadius / numRings));
    VIZ.centerRadius = Math.max(25, Math.min(50, minDimension * 0.05));
    VIZ.ringWidth = Math.max(2, Math.min(5, minDimension * 0.005));
}

function init() {
    // Setup canvas
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();

    // Create audio engine
    audioEngine = new AudioEngine();

    // Get silent audio element for background playback
    silentAudio = document.getElementById('silentAudio');

    // Setup event listeners
    window.addEventListener('resize', resizeCanvas);
    document.getElementById('playBtn').addEventListener('click', togglePlay);
    document.getElementById('volumeSlider').addEventListener('input', handleVolume);

    // Handle visibility change (resync on return)
    document.addEventListener('visibilitychange', handleVisibility);

    // Setup additional background audio support for mobile
    setupBackgroundAudioSupport();

    // Setup Media Session API for lock screen controls
    setupMediaSession();

    // Start animation loop
    animate();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    updateVisualizationSettings();
}

function setupMediaSession() {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: 'Ambient Generator',
            artist: 'Planetary Orbits',
            album: 'D Mixolydian',
        });

        navigator.mediaSession.setActionHandler('play', () => {
            if (!audioEngine.isPlaying) {
                togglePlay();
            }
        });

        navigator.mediaSession.setActionHandler('pause', () => {
            if (audioEngine.isPlaying) {
                togglePlay();
            }
        });

        navigator.mediaSession.setActionHandler('stop', () => {
            if (audioEngine.isPlaying) {
                togglePlay();
            }
        });
    }
}

function updateMediaSessionState(isPlaying) {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
}

async function togglePlay() {
    const btn = document.getElementById('playBtn');

    if (!audioEngine.initialized) {
        await audioEngine.init();
    }

    const isPlaying = audioEngine.toggle();

    if (isPlaying) {
        btn.textContent = 'Pause';
        btn.classList.add('playing');
        // Start silent audio to keep audio session alive on mobile
        if (silentAudio) {
            silentAudio.play().catch(() => {});
        }
    } else {
        btn.textContent = 'Play';
        btn.classList.remove('playing');
        // Pause silent audio when not playing
        if (silentAudio) {
            silentAudio.pause();
        }
    }

    updateMediaSessionState(isPlaying);
}

function handleVolume(e) {
    const value = parseFloat(e.target.value);
    audioEngine.setVolume(value);
}

function handleVisibility() {
    if (document.visibilityState === 'visible') {
        // Resume audio context if it was suspended while hidden
        if (audioEngine.isPlaying) {
            audioEngine.resumeContext();
            // Ensure silent audio is playing for mobile background support
            if (silentAudio && silentAudio.paused) {
                silentAudio.play().catch(() => {});
            }
        }
    } else {
        // When hidden, try to keep audio playing
        // The silent audio element helps maintain the audio session
        if (audioEngine.isPlaying) {
            if (silentAudio && silentAudio.paused) {
                silentAudio.play().catch(() => {});
            }
            // Proactively try to resume context when going to background
            audioEngine.resumeContext();
        }
    }
}

// Additional event listeners for iOS background audio support
// These events fire when the page loses/gains focus on mobile
function setupBackgroundAudioSupport() {
    // Handle page hide/show (works better on some mobile browsers)
    window.addEventListener('pagehide', () => {
        if (audioEngine.isPlaying && silentAudio) {
            silentAudio.play().catch(() => {});
        }
    });

    window.addEventListener('pageshow', () => {
        if (audioEngine.isPlaying) {
            audioEngine.resumeContext();
            if (silentAudio && silentAudio.paused) {
                silentAudio.play().catch(() => {});
            }
        }
    });

    // Handle blur/focus events
    window.addEventListener('blur', () => {
        if (audioEngine.isPlaying && silentAudio && silentAudio.paused) {
            silentAudio.play().catch(() => {});
        }
    });

    window.addEventListener('focus', () => {
        if (audioEngine.isPlaying) {
            audioEngine.resumeContext();
        }
    });
}

function animate() {
    animationId = requestAnimationFrame(animate);
    draw();
}

function draw() {
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear canvas with fade effect for smooth trails
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, width, height);

    // Get loop states and fade level from audio engine
    const loopStates = audioEngine.getLoopStates();
    const fadeLevel = audioEngine.getFadeLevel();

    // Draw concentric rings
    loopStates.forEach((state, index) => {
        const radius = VIZ.centerRadius + (index + 1) * VIZ.ringSpacing;
        drawRing(centerX, centerY, radius, state, index, fadeLevel);
    });

    // Draw center circle
    drawCenter(centerX, centerY, fadeLevel);
}

function drawRing(cx, cy, radius, state, index, fadeLevel) {
    const { progress, intensity, isNotePlaying } = state;

    // Apply fade level to dim during pause transitions
    const dimmedIntensity = intensity * fadeLevel;

    // Background ring (full circle, dim)
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(244, 164, 96, ${0.15 * (0.3 + fadeLevel * 0.7)})`;
    ctx.lineWidth = VIZ.ringWidth;
    ctx.stroke();

    // Progress arc
    const startAngle = -Math.PI / 2; // Start from top
    const endAngle = startAngle + progress * Math.PI * 2;

    // Calculate color based on intensity and fade level
    const alpha = (0.3 + dimmedIntensity * 0.6) * (0.2 + fadeLevel * 0.8);
    const ringColor = `rgba(244, 164, 96, ${alpha})`;

    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.strokeStyle = ringColor;
    ctx.lineWidth = VIZ.ringWidth + (dimmedIntensity * 3);
    ctx.lineCap = 'round';
    ctx.stroke();

    // Draw glow effect when note is playing
    if (isNotePlaying && dimmedIntensity > 0.1) {
        ctx.beginPath();
        ctx.arc(cx, cy, radius, startAngle, endAngle);
        ctx.strokeStyle = `rgba(244, 164, 96, ${dimmedIntensity * 0.3})`;
        ctx.lineWidth = VIZ.ringWidth + 10;
        ctx.stroke();
    }

    // Draw progress indicator dot
    const dotX = cx + radius * Math.cos(endAngle);
    const dotY = cy + radius * Math.sin(endAngle);
    const dotRadius = 4 + dimmedIntensity * 4;

    ctx.beginPath();
    ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
    const dotAlpha = isNotePlaying ? 0.9 * fadeLevel : alpha;
    ctx.fillStyle = `rgba(244, 164, 96, ${dotAlpha})`;
    ctx.fill();
}

function drawCenter(cx, cy, fadeLevel) {
    // Subtle pulsing center based on combined intensity
    const loopStates = audioEngine.getLoopStates();
    const totalIntensity = loopStates.length > 0
        ? loopStates.reduce((sum, s) => sum + (s.intensity || 0), 0) / loopStates.length
        : 0;

    // Apply fade level to dim during pause transitions
    const dimmedIntensity = totalIntensity * fadeLevel;
    const pulseRadius = VIZ.centerRadius * (1 + dimmedIntensity * 0.1);

    // Outer glow
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseRadius);
    const glowAlpha = (0.1 + dimmedIntensity * 0.2) * fadeLevel;
    gradient.addColorStop(0, `rgba(244, 164, 96, ${glowAlpha})`);
    gradient.addColorStop(1, 'rgba(244, 164, 96, 0)');

    ctx.beginPath();
    ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Center dot - dims with fade but keeps minimum visibility
    const dotAlpha = 0.2 + fadeLevel * 0.8;
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(244, 164, 96, ${dotAlpha})`;
    ctx.fill();
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);
