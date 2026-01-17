/**
 * AudioEngine.js - Web Audio synthesis for ambient music generator
 * Inspired by Brian Eno's "Music for Airports"
 */

// Loop configuration: 7 independent loops with incommensurable lengths
const LOOP_CONFIG = [
    { length: 17.3, note: 'D4',  frequency: 293.66 },
    { length: 21.7, note: 'E4',  frequency: 329.63 },
    { length: 19.1, note: 'F#4', frequency: 369.99 },
    { length: 23.9, note: 'A4',  frequency: 440.00 },
    { length: 29.3, note: 'C4',  frequency: 261.63 },
    { length: 31.1, note: 'D5',  frequency: 587.33 },
    { length: 37.7, note: 'A3',  frequency: 220.00 },
];

// Envelope timing (in seconds)
const ENVELOPE = {
    attack: 2.5,
    sustain: 3.0,
    release: 4.5,
};

class Loop {
    constructor(audioEngine, config, index) {
        this.audioEngine = audioEngine;
        this.config = config;
        this.index = index;
        this.length = config.length;
        this.frequency = config.frequency;

        // Track loop state for visualization
        this.startTime = 0;
        this.isPlaying = false;
        this.noteActive = false;
        this.nextNoteTime = 0;

        // Track position for pause/resume
        this.hasStarted = false;
        this.pausedElapsed = 0;

        // Session ID to invalidate old setTimeout callbacks
        this.sessionId = 0;

        // Track active oscillators so we can stop them on pause
        this.activeOscillators = [];
    }

    start(startOffset = 0) {
        const ctx = this.audioEngine.ctx;

        // Increment session ID to invalidate any pending setTimeout callbacks
        this.sessionId++;

        if (this.hasStarted) {
            // Resume from paused position
            this.startTime = ctx.currentTime - this.pausedElapsed;
            this.isPlaying = true;

            const positionInLoop = this.pausedElapsed % this.length;
            const noteDuration = ENVELOPE.attack + ENVELOPE.sustain + ENVELOPE.release;

            if (positionInLoop < noteDuration) {
                // We're in the middle of a note - resume it from current envelope position
                this.scheduleNoteFromPosition(ctx.currentTime, positionInLoop);
            }

            // Schedule the next note at the appropriate time
            const timeUntilNextCycle = this.length - positionInLoop;
            this.scheduleNote(ctx.currentTime + timeUntilNextCycle);
        } else {
            // First time start with staggered offset
            this.hasStarted = true;
            this.startTime = ctx.currentTime + startOffset;
            this.isPlaying = true;
            this.scheduleNote(this.startTime);
        }
    }

    stop() {
        if (this.isPlaying) {
            // Save current position before stopping
            const ctx = this.audioEngine.ctx;
            this.pausedElapsed = ctx.currentTime - this.startTime;
        }
        this.isPlaying = false;

        // Stop all active oscillators immediately to prevent overlap on resume
        this.activeOscillators.forEach(osc => {
            try {
                osc.stop();
            } catch (e) {
                // Oscillator may have already stopped
            }
        });
        this.activeOscillators = [];
    }

    // Resume a note from the middle of its envelope
    scheduleNoteFromPosition(time, positionInNote) {
        if (!this.isPlaying) return;

        const ctx = this.audioEngine.ctx;
        const noteDuration = ENVELOPE.attack + ENVELOPE.sustain + ENVELOPE.release;
        const remainingDuration = noteDuration - positionInNote;

        // Create oscillators
        const sineOsc = ctx.createOscillator();
        const triangleOsc = ctx.createOscillator();
        sineOsc.type = 'sine';
        triangleOsc.type = 'triangle';
        sineOsc.frequency.value = this.frequency;
        triangleOsc.frequency.value = this.frequency;

        // Gain nodes for mixing
        const sineGain = ctx.createGain();
        const triangleGain = ctx.createGain();
        sineGain.gain.value = 0.7;
        triangleGain.gain.value = 0.3;

        // Calculate current envelope value and remaining envelope
        const envelopeGain = ctx.createGain();

        if (positionInNote < ENVELOPE.attack) {
            // In attack phase - continue ramping up
            const currentGain = (positionInNote / ENVELOPE.attack) * 0.15;
            const remainingAttack = ENVELOPE.attack - positionInNote;
            envelopeGain.gain.setValueAtTime(currentGain, time);
            envelopeGain.gain.linearRampToValueAtTime(0.15, time + remainingAttack);
            envelopeGain.gain.setValueAtTime(0.15, time + remainingAttack + ENVELOPE.sustain);
            envelopeGain.gain.linearRampToValueAtTime(0, time + remainingDuration);
        } else if (positionInNote < ENVELOPE.attack + ENVELOPE.sustain) {
            // In sustain phase
            const remainingSustain = (ENVELOPE.attack + ENVELOPE.sustain) - positionInNote;
            envelopeGain.gain.setValueAtTime(0.15, time);
            envelopeGain.gain.setValueAtTime(0.15, time + remainingSustain);
            envelopeGain.gain.linearRampToValueAtTime(0, time + remainingDuration);
        } else {
            // In release phase - continue ramping down
            const releaseProgress = (positionInNote - ENVELOPE.attack - ENVELOPE.sustain) / ENVELOPE.release;
            const currentGain = 0.15 * (1 - releaseProgress);
            envelopeGain.gain.setValueAtTime(currentGain, time);
            envelopeGain.gain.linearRampToValueAtTime(0, time + remainingDuration);
        }

        // Lowpass filter
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 2000;
        filter.Q.value = 0.5;

        // Connect
        sineOsc.connect(sineGain);
        triangleOsc.connect(triangleGain);
        sineGain.connect(envelopeGain);
        triangleGain.connect(envelopeGain);
        envelopeGain.connect(filter);
        filter.connect(this.audioEngine.reverbInput);

        // Track oscillators
        this.activeOscillators.push(sineOsc, triangleOsc);
        const removeOsc = (osc) => {
            const idx = this.activeOscillators.indexOf(osc);
            if (idx > -1) this.activeOscillators.splice(idx, 1);
        };
        sineOsc.onended = () => removeOsc(sineOsc);
        triangleOsc.onended = () => removeOsc(triangleOsc);

        // Start and stop
        sineOsc.start(time);
        triangleOsc.start(time);
        sineOsc.stop(time + remainingDuration + 0.1);
        triangleOsc.stop(time + remainingDuration + 0.1);
    }

    scheduleNote(time) {
        if (!this.isPlaying) return;

        const ctx = this.audioEngine.ctx;
        const noteDuration = ENVELOPE.attack + ENVELOPE.sustain + ENVELOPE.release;

        // Create oscillators (sine + triangle blend for warmth)
        const sineOsc = ctx.createOscillator();
        const triangleOsc = ctx.createOscillator();
        sineOsc.type = 'sine';
        triangleOsc.type = 'triangle';
        sineOsc.frequency.value = this.frequency;
        triangleOsc.frequency.value = this.frequency;

        // Gain nodes for mixing oscillators
        const sineGain = ctx.createGain();
        const triangleGain = ctx.createGain();
        sineGain.gain.value = 0.7;
        triangleGain.gain.value = 0.3;

        // Envelope gain
        const envelopeGain = ctx.createGain();
        envelopeGain.gain.setValueAtTime(0, time);
        envelopeGain.gain.linearRampToValueAtTime(0.15, time + ENVELOPE.attack);
        envelopeGain.gain.setValueAtTime(0.15, time + ENVELOPE.attack + ENVELOPE.sustain);
        envelopeGain.gain.linearRampToValueAtTime(0, time + noteDuration);

        // Lowpass filter for warmth
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 2000;
        filter.Q.value = 0.5;

        // Connect the chain
        sineOsc.connect(sineGain);
        triangleOsc.connect(triangleGain);
        sineGain.connect(envelopeGain);
        triangleGain.connect(envelopeGain);
        envelopeGain.connect(filter);
        filter.connect(this.audioEngine.reverbInput);

        // Track oscillators for cleanup on stop
        this.activeOscillators.push(sineOsc, triangleOsc);

        // Remove from tracking when oscillator ends
        const removeOsc = (osc) => {
            const idx = this.activeOscillators.indexOf(osc);
            if (idx > -1) this.activeOscillators.splice(idx, 1);
        };
        sineOsc.onended = () => removeOsc(sineOsc);
        triangleOsc.onended = () => removeOsc(triangleOsc);

        // Start and stop oscillators
        sineOsc.start(time);
        triangleOsc.start(time);
        sineOsc.stop(time + noteDuration + 0.1);
        triangleOsc.stop(time + noteDuration + 0.1);

        // Store next note time for visualization
        this.nextNoteTime = time + this.length;

        // Capture current session ID to check in callback
        const currentSessionId = this.sessionId;

        // Schedule next note
        const scheduleNext = () => {
            // Only schedule if still playing AND session hasn't changed
            if (this.isPlaying && this.sessionId === currentSessionId) {
                this.scheduleNote(time + this.length);
            }
        };

        // Use setTimeout as a backup, but rely on Web Audio timing
        const delay = (this.length - 1) * 1000;
        setTimeout(scheduleNext, Math.max(0, delay));
    }

    // Get current progress through loop (0-1)
    getProgress() {
        if (!this.hasStarted) return 0;
        const ctx = this.audioEngine.ctx;
        // Use paused position if not playing, otherwise calculate from startTime
        const elapsed = this.isPlaying
            ? ctx.currentTime - this.startTime
            : this.pausedElapsed;
        return (elapsed % this.length) / this.length;
    }

    // Check if note is currently sounding
    isNotePlaying() {
        if (!this.isPlaying) return false;
        const ctx = this.audioEngine.ctx;
        const elapsed = ctx.currentTime - this.startTime;
        const positionInLoop = elapsed % this.length;
        const noteDuration = ENVELOPE.attack + ENVELOPE.sustain + ENVELOPE.release;
        return positionInLoop < noteDuration;
    }

    // Get note intensity (0-1) based on envelope position
    getNoteIntensity() {
        if (!this.hasStarted) return 0;
        const ctx = this.audioEngine.ctx;
        // Use paused position if not playing, otherwise calculate from startTime
        const elapsed = this.isPlaying
            ? ctx.currentTime - this.startTime
            : this.pausedElapsed;
        const positionInLoop = elapsed % this.length;
        const noteDuration = ENVELOPE.attack + ENVELOPE.sustain + ENVELOPE.release;

        if (positionInLoop > noteDuration) return 0;

        if (positionInLoop < ENVELOPE.attack) {
            return positionInLoop / ENVELOPE.attack;
        } else if (positionInLoop < ENVELOPE.attack + ENVELOPE.sustain) {
            return 1;
        } else {
            const releaseProgress = (positionInLoop - ENVELOPE.attack - ENVELOPE.sustain) / ENVELOPE.release;
            return 1 - releaseProgress;
        }
    }
}

export class AudioEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.reverbInput = null;
        this.convolver = null;
        this.loops = [];
        this.isPlaying = false;
        this.initialized = false;

        // Fade state
        this.targetVolume = 0.7;
        this.fadeLevel = 0; // 0 = silent/paused, 1 = full volume/playing
        this.isFading = false;
        this.fadeDuration = 1.5; // seconds
        this.fadeTarget = 0; // Track fade direction: 0 = fading out, 1 = fading in
    }

    async init() {
        if (this.initialized) return;

        // Create audio context
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();

        // Create master gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.7;
        this.masterGain.connect(this.ctx.destination);

        // Create reverb
        this.convolver = this.ctx.createConvolver();
        this.convolver.buffer = this.createReverbImpulse(4, 2, false);

        // Dry/wet mix for reverb
        this.dryGain = this.ctx.createGain();
        this.wetGain = this.ctx.createGain();
        this.dryGain.gain.value = 0.4;
        this.wetGain.gain.value = 0.6;

        // Reverb input node
        this.reverbInput = this.ctx.createGain();
        this.reverbInput.connect(this.dryGain);
        this.reverbInput.connect(this.convolver);
        this.convolver.connect(this.wetGain);
        this.dryGain.connect(this.masterGain);
        this.wetGain.connect(this.masterGain);

        // Create loops
        this.loops = LOOP_CONFIG.map((config, index) => new Loop(this, config, index));

        this.initialized = true;
    }

    createReverbImpulse(duration, decay, reverse) {
        const sampleRate = this.ctx.sampleRate;
        const length = sampleRate * duration;
        const impulse = this.ctx.createBuffer(2, length, sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                const n = reverse ? length - i : i;
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
            }
        }

        return impulse;
    }

    async start() {
        if (!this.initialized) {
            await this.init();
        }

        // Resume audio context if suspended (iOS/Chrome autoplay policy)
        if (this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }

        if (this.isPlaying) return;

        // Stop any loops still playing (in case we're restarting during fade-out)
        // This also saves their current position
        this.loops.forEach(loop => loop.stop());

        this.isPlaying = true;

        // Start with current fade level (allows smooth restart during fade-out)
        const startGain = this.fadeLevel * this.targetVolume;
        this.masterGain.gain.setValueAtTime(startGain, this.ctx.currentTime);

        // Start or resume loops
        // First-time starts get staggered offsets; resumes use saved position
        this.loops.forEach((loop, index) => {
            const offset = index * 0.3 + Math.random() * 0.2;
            loop.start(offset); // Offset is ignored if loop has already started
        });

        // Fade in
        this.fadeIn();
    }

    stop() {
        if (!this.isPlaying) return;

        // Fade out, then stop loops
        this.fadeOut(() => {
            this.loops.forEach(loop => loop.stop());
        });
    }

    fadeIn() {
        if (!this.ctx || !this.masterGain) return;

        this.isFading = true;
        this.fadeTarget = 1;
        const startTime = this.ctx.currentTime;

        // Cancel any pending ramps
        this.masterGain.gain.cancelScheduledValues(startTime);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, startTime);
        this.masterGain.gain.linearRampToValueAtTime(this.targetVolume, startTime + this.fadeDuration);

        // Animate fade level for visualization
        this.animateFadeLevel(1, startTime);
    }

    fadeOut(onComplete) {
        if (!this.ctx || !this.masterGain) {
            if (onComplete) onComplete();
            return;
        }

        this.isFading = true;
        this.fadeTarget = 0;
        this.isPlaying = false;
        const startTime = this.ctx.currentTime;

        // Cancel any pending ramps
        this.masterGain.gain.cancelScheduledValues(startTime);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, startTime);
        this.masterGain.gain.linearRampToValueAtTime(0, startTime + this.fadeDuration);

        // Animate fade level for visualization
        this.animateFadeLevel(0, startTime, onComplete);
    }

    animateFadeLevel(target, startTime, onComplete) {
        const startLevel = this.fadeLevel;
        const currentTarget = target; // Capture target at start

        const animate = () => {
            if (!this.ctx) return;

            // Stop if fade direction changed
            if (this.fadeTarget !== currentTarget) return;

            const elapsed = this.ctx.currentTime - startTime;
            const progress = Math.min(elapsed / this.fadeDuration, 1);

            this.fadeLevel = startLevel + (target - startLevel) * progress;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.fadeLevel = target;
                this.isFading = false;
                if (onComplete) onComplete();
            }
        };
        requestAnimationFrame(animate);
    }

    toggle() {
        // If actively playing or fading in, stop
        if (this.isPlaying || (this.isFading && this.fadeTarget === 1)) {
            this.stop();
            return false;
        } else {
            // If stopped or fading out, start
            this.start();
            return true;
        }
    }

    setVolume(value) {
        this.targetVolume = value;
        if (this.masterGain && this.isPlaying && !this.isFading) {
            this.masterGain.gain.setTargetAtTime(value, this.ctx.currentTime, 0.1);
        }
    }

    getFadeLevel() {
        return this.fadeLevel;
    }

    getLoopStates() {
        return this.loops.map(loop => ({
            progress: loop.getProgress(),
            intensity: loop.getNoteIntensity(),
            isNotePlaying: loop.isNotePlaying(),
            note: loop.config.note,
        }));
    }
}
