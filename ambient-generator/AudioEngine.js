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
    }

    start(startOffset = 0) {
        this.startTime = this.audioEngine.ctx.currentTime + startOffset;
        this.isPlaying = true;
        this.scheduleNote(this.startTime);
    }

    stop() {
        this.isPlaying = false;
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

        // Start and stop oscillators
        sineOsc.start(time);
        triangleOsc.start(time);
        sineOsc.stop(time + noteDuration + 0.1);
        triangleOsc.stop(time + noteDuration + 0.1);

        // Store next note time for visualization
        this.nextNoteTime = time + this.length;

        // Schedule next note
        const scheduleNext = () => {
            if (this.isPlaying) {
                this.scheduleNote(time + this.length);
            }
        };

        // Use setTimeout as a backup, but rely on Web Audio timing
        const delay = (this.length - 1) * 1000;
        setTimeout(scheduleNext, Math.max(0, delay));
    }

    // Get current progress through loop (0-1)
    getProgress() {
        if (!this.isPlaying) return 0;
        const ctx = this.audioEngine.ctx;
        const elapsed = ctx.currentTime - this.startTime;
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
        if (!this.isPlaying) return 0;
        const ctx = this.audioEngine.ctx;
        const elapsed = ctx.currentTime - this.startTime;
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

        this.isPlaying = true;

        // Stagger loop starts to avoid initial chord burst
        this.loops.forEach((loop, index) => {
            const offset = index * 0.3 + Math.random() * 0.2;
            loop.start(offset);
        });
    }

    stop() {
        if (!this.isPlaying) return;

        this.isPlaying = false;
        this.loops.forEach(loop => loop.stop());
    }

    toggle() {
        if (this.isPlaying) {
            this.stop();
        } else {
            this.start();
        }
        return this.isPlaying;
    }

    setVolume(value) {
        if (this.masterGain) {
            this.masterGain.gain.setTargetAtTime(value, this.ctx.currentTime, 0.1);
        }
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
