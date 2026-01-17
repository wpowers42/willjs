/**
 * AudioEngine.js - Tone.js synthesis for ambient music generator
 * Inspired by Brian Eno's "Music for Airports"
 */

// Loop configuration: 8 planets with cycles proportional to orbital periods
// Orbital periods compressed via cube root, normalized to 13-114 second range
const LOOP_CONFIG = [
    { length: 13.1,  note: 'D5',  planet: 'Mercury' },  // 88 days
    { length: 17.9,  note: 'B4',  planet: 'Venus' },    // 225 days
    { length: 21.3,  note: 'A4',  planet: 'Earth' },    // 365 days
    { length: 25.7,  note: 'F#4', planet: 'Mars' },     // 687 days
    { length: 47.3,  note: 'E4',  planet: 'Jupiter' },  // 4,333 days
    { length: 64.9,  note: 'D4',  planet: 'Saturn' },   // 10,759 days
    { length: 91.1,  note: 'C4',  planet: 'Uranus' },   // 30,687 days
    { length: 113.9, note: 'A3',  planet: 'Neptune' },  // 60,190 days
];

// Envelope timing (in seconds)
const ENVELOPE = {
    attack: 2.5,
    sustain: 3.0,
    release: 4.5,
};

// Synth configurations
const SYNTH_CONFIGS = {
    fm: {
        type: Tone.FMSynth,
        options: {
            harmonicity: 8,
            modulationIndex: 20,
            oscillator: { type: 'sine' },
            envelope: {
                attack: ENVELOPE.attack,
                decay: 0.1,
                sustain: 1,
                release: ENVELOPE.release,
            },
            modulation: { type: 'square' },
            modulationEnvelope: {
                attack: 0.5,
                decay: 0.5,
                sustain: 0.3,
                release: ENVELOPE.release * 0.5,
            },
        },
        volume: -18,
    },
    am: {
        type: Tone.AMSynth,
        options: {
            harmonicity: 3,
            oscillator: { type: 'triangle' },
            envelope: {
                attack: ENVELOPE.attack,
                decay: 0.1,
                sustain: 1,
                release: ENVELOPE.release,
            },
            modulation: { type: 'square' },
            modulationEnvelope: {
                attack: 0.01,
                decay: 0.5,
                sustain: 1,
                release: ENVELOPE.release,
            },
        },
        volume: -12,
    },
    pad: {
        type: Tone.Synth,
        options: {
            oscillator: {
                type: 'fatsawtooth',
                count: 3,
                spread: 30,
            },
            envelope: {
                attack: ENVELOPE.attack,
                decay: 0.3,
                sustain: 0.8,
                release: ENVELOPE.release,
            },
        },
        volume: -20,
    },
    pluck: {
        type: Tone.Synth,
        options: {
            oscillator: { type: 'triangle' },
            envelope: {
                attack: 0.01,
                decay: 1.5,
                sustain: 0,
                release: 3,
            },
        },
        volume: -8,
    },
    saw: {
        type: Tone.Synth,
        options: {
            oscillator: { type: 'sawtooth' },
            envelope: {
                attack: ENVELOPE.attack,
                decay: 0.5,
                sustain: 0.6,
                release: ENVELOPE.release,
            },
        },
        volume: -18,
    },
};

const SYNTH_TYPES = Object.keys(SYNTH_CONFIGS);

class Loop {
    constructor(audioEngine, config, index) {
        this.audioEngine = audioEngine;
        this.config = config;
        this.index = index;
        this.length = config.length;
        this.note = config.note;

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

        // Track scheduled events
        this.scheduledEvents = [];
    }

    start(startOffset = 0) {
        // Increment session ID to invalidate any pending setTimeout callbacks
        this.sessionId++;

        if (this.hasStarted) {
            // Resume from paused position
            this.startTime = Tone.now() - this.pausedElapsed;
            this.isPlaying = true;

            const positionInLoop = this.pausedElapsed % this.length;
            const noteDuration = ENVELOPE.attack + ENVELOPE.sustain + ENVELOPE.release;

            if (positionInLoop < noteDuration) {
                // We're in the middle of a note - play remainder with random synth
                const remainingDuration = noteDuration - positionInLoop;
                this.playNoteWithDuration(Tone.now(), remainingDuration, positionInLoop);
            }

            // Schedule the next note at the appropriate time
            const timeUntilNextCycle = this.length - positionInLoop;
            this.scheduleNote(Tone.now() + timeUntilNextCycle);
        } else {
            // First time start with staggered offset
            this.hasStarted = true;
            this.startTime = Tone.now() + startOffset;
            this.isPlaying = true;
            this.scheduleNote(this.startTime);
        }
    }

    stop() {
        if (this.isPlaying) {
            // Save current position before stopping
            this.pausedElapsed = Tone.now() - this.startTime;
        }
        this.isPlaying = false;

        // Clear scheduled events
        this.scheduledEvents.forEach(id => Tone.Transport.clear(id));
        this.scheduledEvents = [];
    }

    // Play a note with custom duration (for resuming mid-note)
    playNoteWithDuration(time, duration, positionInNote = 0) {
        if (!this.isPlaying) return;

        // Get a random synth
        const synth = this.audioEngine.getRandomSynth();

        // Calculate envelope based on position
        let attackTime, sustainTime, releaseTime;

        if (positionInNote < ENVELOPE.attack) {
            attackTime = ENVELOPE.attack - positionInNote;
            sustainTime = ENVELOPE.sustain;
            releaseTime = ENVELOPE.release;
        } else if (positionInNote < ENVELOPE.attack + ENVELOPE.sustain) {
            attackTime = 0.01;
            sustainTime = (ENVELOPE.attack + ENVELOPE.sustain) - positionInNote;
            releaseTime = ENVELOPE.release;
        } else {
            attackTime = 0.01;
            sustainTime = 0;
            releaseTime = duration;
        }

        const totalDuration = attackTime + sustainTime + releaseTime;

        synth.triggerAttackRelease(
            this.note,
            totalDuration,
            time
        );
    }

    scheduleNote(time) {
        if (!this.isPlaying) return;

        // Get a random synth for this note
        const synth = this.audioEngine.getRandomSynth();
        const noteDuration = ENVELOPE.attack + ENVELOPE.sustain + ENVELOPE.release;

        // Trigger the note
        synth.triggerAttackRelease(
            this.note,
            noteDuration,
            time
        );

        // Store next note time for visualization
        this.nextNoteTime = time + this.length;

        // Capture current session ID to check in callback
        const currentSessionId = this.sessionId;

        // Schedule next note
        const scheduleNext = () => {
            if (this.isPlaying && this.sessionId === currentSessionId) {
                this.scheduleNote(time + this.length);
            }
        };

        // Use setTimeout as a backup scheduler
        const delay = (this.length - 1) * 1000;
        setTimeout(scheduleNext, Math.max(0, delay));
    }

    // Get current progress through loop (0-1)
    getProgress() {
        if (!this.hasStarted) return 0;
        const elapsed = this.isPlaying
            ? Tone.now() - this.startTime
            : this.pausedElapsed;
        return (elapsed % this.length) / this.length;
    }

    // Check if note is currently sounding
    isNotePlaying() {
        if (!this.isPlaying) return false;
        const elapsed = Tone.now() - this.startTime;
        const positionInLoop = elapsed % this.length;
        const noteDuration = ENVELOPE.attack + ENVELOPE.sustain + ENVELOPE.release;
        return positionInLoop < noteDuration;
    }

    // Get note intensity (0-1) based on envelope position
    getNoteIntensity() {
        if (!this.hasStarted) return 0;
        const elapsed = this.isPlaying
            ? Tone.now() - this.startTime
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
        this.synths = {};
        this.masterGain = null;
        this.reverb = null;
        this.chorus = null;
        this.filter = null;
        this.loops = [];
        this.isPlaying = false;
        this.initialized = false;

        // Fade state
        this.targetVolume = 0.7;
        this.fadeLevel = 0;
        this.isFading = false;
        this.fadeDuration = 1.5;
        this.fadeTarget = 0;
    }

    createSynth(type) {
        const config = SYNTH_CONFIGS[type];
        if (!config) return null;

        const synth = new Tone.PolySynth(config.type, {
            maxPolyphony: 14,
            options: config.options,
        });
        synth.volume.value = config.volume;

        return synth;
    }

    getRandomSynth() {
        const type = SYNTH_TYPES[Math.floor(Math.random() * SYNTH_TYPES.length)];
        return this.synths[type];
    }

    async init() {
        if (this.initialized) return;

        // Create effects chain
        this.reverb = new Tone.Reverb({
            decay: 8,
            wet: 0.6,
            preDelay: 0.2,
        });
        await this.reverb.generate();

        this.chorus = new Tone.Chorus({
            frequency: 0.3,
            delayTime: 3.5,
            depth: 0.7,
            wet: 0.3,
        }).start();

        this.filter = new Tone.Filter({
            type: 'lowpass',
            frequency: 2500,
            Q: 0.5,
        });

        this.masterGain = new Tone.Gain(0);

        // Connect effects chain
        this.filter.connect(this.chorus);
        this.chorus.connect(this.reverb);
        this.reverb.connect(this.masterGain);
        this.masterGain.toDestination();

        // Create all synths and connect them to the effects chain
        for (const type of SYNTH_TYPES) {
            this.synths[type] = this.createSynth(type);
            this.synths[type].connect(this.filter);
        }

        // Create loops
        this.loops = LOOP_CONFIG.map((config, index) => new Loop(this, config, index));

        this.initialized = true;
    }

    async start() {
        if (!this.initialized) {
            await this.init();
        }

        await Tone.start();

        if (this.isPlaying) return;

        this.loops.forEach(loop => loop.stop());

        this.isPlaying = true;

        const startGain = this.fadeLevel * this.targetVolume;
        this.masterGain.gain.value = startGain;

        this.loops.forEach((loop, index) => {
            const offset = index * 0.3 + Math.random() * 0.2;
            loop.start(offset);
        });

        this.fadeIn();
    }

    stop() {
        if (!this.isPlaying) return;

        this.fadeOut(() => {
            this.loops.forEach(loop => loop.stop());
        });
    }

    fadeIn() {
        if (!this.masterGain) return;

        this.isFading = true;
        this.fadeTarget = 1;
        const startTime = Tone.now();

        this.masterGain.gain.cancelScheduledValues(startTime);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, startTime);
        this.masterGain.gain.linearRampToValueAtTime(this.targetVolume, startTime + this.fadeDuration);

        this.animateFadeLevel(1, startTime);
    }

    fadeOut(onComplete) {
        if (!this.masterGain) {
            if (onComplete) onComplete();
            return;
        }

        this.isFading = true;
        this.fadeTarget = 0;
        this.isPlaying = false;
        const startTime = Tone.now();

        this.masterGain.gain.cancelScheduledValues(startTime);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, startTime);
        this.masterGain.gain.linearRampToValueAtTime(0, startTime + this.fadeDuration);

        this.animateFadeLevel(0, startTime, onComplete);
    }

    animateFadeLevel(target, startTime, onComplete) {
        const startLevel = this.fadeLevel;
        const currentTarget = target;

        const animate = () => {
            if (this.fadeTarget !== currentTarget) return;

            const elapsed = Tone.now() - startTime;
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
        if (this.isPlaying || (this.isFading && this.fadeTarget === 1)) {
            this.stop();
            return false;
        } else {
            this.start();
            return true;
        }
    }

    setVolume(value) {
        this.targetVolume = value;
        if (this.masterGain && this.isPlaying && !this.isFading) {
            this.masterGain.gain.rampTo(value, 0.1);
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
