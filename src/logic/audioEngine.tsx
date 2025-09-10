// Audio frequencies for each note (in Hz)
const noteFrequencies: { [key: string]: number } = {
    'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13,
    'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00,
    'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88,
};

// 🎨 Colors for notes
export const noteColors: { [key: string]: string } = {
    'C': 'hsl(0, 70%, 60%)',
    'C#': 'hsl(30, 70%, 60%)',
    'D': 'hsl(60, 70%, 60%)',
    'D#': 'hsl(90, 70%, 60%)',
    'E': 'hsl(120, 70%, 60%)',
    'F': 'hsl(180, 70%, 60%)',
    'F#': 'hsl(210, 70%, 60%)',
    'G': 'hsl(240, 70%, 60%)',
    'G#': 'hsl(270, 70%, 60%)',
    'A': 'hsl(300, 70%, 60%)',
    'A#': 'hsl(330, 70%, 60%)',
    'B': 'hsl(15, 70%, 60%)',
};

// Music theory data structures
const CHROMATIC_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11]; // C major: C D E F G A B
const MINOR_SCALE_INTERVALS = [0, 2, 3, 5, 7, 8, 10]; // Natural minor

// Common chord progressions (in scale degrees)
const CHORD_PROGRESSIONS = [
    [1, 5, 6, 4], // I-V-vi-IV (very popular)
    [1, 6, 4, 5], // I-vi-IV-V
    [6, 4, 1, 5], // vi-IV-I-V
    [1, 4, 5, 1], // I-IV-V-I
    [2, 5, 1],    // ii-V-I (jazz)
    [1, 3, 4, 1], // I-iii-IV-I
];

// Chord types and their intervals
const CHORD_TYPES = {
    major: [0, 4, 7],
    minor: [0, 3, 7],
    diminished: [0, 3, 6],
    major7: [0, 4, 7, 11],
    minor7: [0, 3, 7, 10],
    dominant7: [0, 4, 7, 10],
};

interface PlayedNote {
    note: string;
    octave: number;
    timestamp: number;
    scaleDegree?: number;
}

interface HarmonicContext {
    key: string;
    scale: string[];
    mode: 'major' | 'minor';
    currentChord?: string[];
    progression: number[];
    progressionIndex: number;
}

class IntelligentPianoEngine {
    private audioContext: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private recentNotes: PlayedNote[] = [];
    private harmonicContext: HarmonicContext;
    private maxHistoryLength = 20;

    constructor() {
        this.initializeAudio();
        this.harmonicContext = this.detectOrInitializeKey();
    }

    private initializeAudio() {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
        this.masterGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    }

    private detectOrInitializeKey(): HarmonicContext {
        // Start in C major as default
        return {
            key: 'C',
            scale: this.buildScale('C', 'major'),
            mode: 'major',
            progression: CHORD_PROGRESSIONS[0], // I-V-vi-IV
            progressionIndex: 0,
        };
    }

    private buildScale(root: string, mode: 'major' | 'minor'): string[] {
        const rootIndex = CHROMATIC_SCALE.indexOf(root);
        const intervals = mode === 'major' ? MAJOR_SCALE_INTERVALS : MINOR_SCALE_INTERVALS;

        return intervals.map(interval =>
            CHROMATIC_SCALE[(rootIndex + interval) % 12]
        );
    }

    private getNoteIndex(note: string): number {
        return CHROMATIC_SCALE.indexOf(note);
    }

    private getScaleDegree(note: string, scale: string[]): number | null {
        const index = scale.indexOf(note);
        return index >= 0 ? index + 1 : null;
    }

    private analyzeHarmony(): void {
        if (this.recentNotes.length < 3) return;

        // Analyze the last few notes to detect key changes or chord progressions
        const recentNoteNames = this.recentNotes.slice(-6).map(n => n.note);
        const noteHistogram: { [key: string]: number } = {};

        // Count note occurrences
        recentNoteNames.forEach(note => {
            noteHistogram[note] = (noteHistogram[note] || 0) + 1;
        });

        // Try to detect key based on most common notes
        const possibleKeys = this.detectPossibleKeys(recentNoteNames);
        if (possibleKeys.length > 0) {
            const bestKey = possibleKeys[0];
            if (bestKey.key !== this.harmonicContext.key || bestKey.mode !== this.harmonicContext.mode) {
                this.harmonicContext.key = bestKey.key;
                this.harmonicContext.mode = bestKey.mode;
                this.harmonicContext.scale = this.buildScale(bestKey.key, bestKey.mode);
            }
        }
    }

    private detectPossibleKeys(notes: string[]): Array<{key: string, mode: 'major' | 'minor', score: number}> {
        const results: Array<{key: string, mode: 'major' | 'minor', score: number}> = [];

        // Test each possible key
        for (const root of CHROMATIC_SCALE) {
            for (const mode of ['major', 'minor'] as const) {
                const scale = this.buildScale(root, mode);
                let score = 0;

                notes.forEach(note => {
                    if (scale.includes(note)) {
                        score += 1;
                        // Bonus for tonic, dominant, subdominant
                        const degree = this.getScaleDegree(note, scale);
                        if (degree === 1) score += 2; // Tonic
                        if (degree === 5) score += 1.5; // Dominant
                        if (degree === 4) score += 1; // Subdominant
                    }
                });

                results.push({ key: root, mode, score });
            }
        }

        return results.sort((a, b) => b.score - a.score);
    }

    private getNextChordInProgression(): string[] {
        const currentDegree = this.harmonicContext.progression[this.harmonicContext.progressionIndex];
        const chordRoot = this.harmonicContext.scale[currentDegree - 1];

        // Determine chord type based on scale degree and mode
        let chordType = 'major';
        if (this.harmonicContext.mode === 'major') {
            if ([2, 3, 6].includes(currentDegree)) chordType = 'minor';
            if (currentDegree === 7) chordType = 'diminished';
        } else {
            if ([1, 4, 5].includes(currentDegree)) chordType = 'minor';
            if ([3, 6, 7].includes(currentDegree)) chordType = 'major';
            if (currentDegree === 2) chordType = 'diminished';
        }

        // Build the chord
        const rootIndex = this.getNoteIndex(chordRoot);
        const intervals = CHORD_TYPES[chordType as keyof typeof CHORD_TYPES] || CHORD_TYPES.major;

        return intervals.map(interval =>
            CHROMATIC_SCALE[(rootIndex + interval) % 12]
        );
    }

    private findBestHarmony(inputNote: string): { harmony: string[], bass?: string } {
        // Update harmonic analysis
        this.analyzeHarmony();

        // If the input note is in our current scale, build harmony around it
        const scaleDegree = this.getScaleDegree(inputNote, this.harmonicContext.scale);

        if (scaleDegree) {
            // The note fits our key, build a chord around it
            const inputIndex = this.getNoteIndex(inputNote);

            // Create a harmony based on the chord progression
            const progressionChord = this.getNextChordInProgression();

            // If the input note is in the progression chord, use it
            if (progressionChord.includes(inputNote)) {
                this.harmonicContext.progressionIndex =
                    (this.harmonicContext.progressionIndex + 1) % this.harmonicContext.progression.length;
                return { harmony: progressionChord.filter(n => n !== inputNote) };
            }

            // Otherwise, build a chord around the input note
            let chordType = 'major';
            if (this.harmonicContext.mode === 'major') {
                if ([2, 3, 6].includes(scaleDegree)) chordType = 'minor';
                if (scaleDegree === 7) chordType = 'diminished';
            }

            const intervals = CHORD_TYPES[chordType as keyof typeof CHORD_TYPES];
            const harmony = intervals.slice(1).map(interval => // Skip root (input note)
                CHROMATIC_SCALE[(inputIndex + interval) % 12]
            );

            return { harmony };
        } else {
            // Note is outside our scale - treat it as a passing tone or chromatic note
            // Find the closest scale notes for harmony
            const inputIndex = this.getNoteIndex(inputNote);
            const closestScaleNotes = this.harmonicContext.scale
                .map(note => ({
                    note,
                    distance: Math.min(
                        Math.abs(this.getNoteIndex(note) - inputIndex),
                        12 - Math.abs(this.getNoteIndex(note) - inputIndex)
                    )
                }))
                .sort((a, b) => a.distance - b.distance)
                .slice(0, 2)
                .map(item => item.note);

            return { harmony: closestScaleNotes };
        }
    }

    private async playTone(note: string, octave: number, duration: number, volume: number = 0.8, delay: number = 0) {
        if (!this.audioContext || !this.masterGain) return;
        if (this.audioContext.state === "suspended") await this.audioContext.resume();

        const freq = noteFrequencies[note] * Math.pow(2, octave - 4);
        const now = this.audioContext.currentTime + delay;

        // Create piano-like sound with multiple harmonics
        const fundamentalGain = this.audioContext.createGain();
        fundamentalGain.connect(this.masterGain);

        // Piano sound uses multiple oscillators for rich harmonics
        const oscillators: OscillatorNode[] = [];
        const gains: GainNode[] = [];

        // Fundamental frequency (strongest)
        const fund = this.audioContext.createOscillator();
        const fundGain = this.audioContext.createGain();
        fund.connect(fundGain);
        fundGain.connect(fundamentalGain);
        fund.frequency.setValueAtTime(freq, now);
        fund.type = "triangle";
        oscillators.push(fund);
        gains.push(fundGain);

        // Second harmonic (octave)
        const second = this.audioContext.createOscillator();
        const secondGain = this.audioContext.createGain();
        second.connect(secondGain);
        secondGain.connect(fundamentalGain);
        second.frequency.setValueAtTime(freq * 2, now);
        second.type = "triangle";
        oscillators.push(second);
        gains.push(secondGain);

        // Third harmonic (perfect fifth)
        const third = this.audioContext.createOscillator();
        const thirdGain = this.audioContext.createGain();
        third.connect(thirdGain);
        thirdGain.connect(fundamentalGain);
        third.frequency.setValueAtTime(freq * 3, now);
        third.type = "sine";
        oscillators.push(third);
        gains.push(thirdGain);

        // Fourth harmonic (second octave)
        const fourth = this.audioContext.createOscillator();
        const fourthGain = this.audioContext.createGain();
        fourth.connect(fourthGain);
        fourthGain.connect(fundamentalGain);
        fourth.frequency.setValueAtTime(freq * 4, now);
        fourth.type = "sine";
        oscillators.push(fourth);
        gains.push(fourthGain);

        // Add subtle noise for piano "breath"
        const bufferSize = this.audioContext.sampleRate * 0.1;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            noiseData[i] = (Math.random() * 2 - 1) * 0.02;
        }

        const noiseSource = this.audioContext.createBufferSource();
        const noiseGain = this.audioContext.createGain();
        const noiseFilter = this.audioContext.createBiquadFilter();

        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;
        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(fundamentalGain);

        noiseFilter.type = "bandpass";
        noiseFilter.frequency.setValueAtTime(freq * 8, now);
        noiseFilter.Q.setValueAtTime(10, now);

        // Piano-like ADSR envelope with longer attack for main note, quicker for harmonies
        const isMainNote = delay === 0;
        const attackTime = isMainNote ? 0.01 : 0.005;
        const decayTime = isMainNote ? 0.3 : 0.15;
        const sustainLevel = isMainNote ? 0.7 : 0.4;
        const releaseTime = isMainNote ? 0.8 : 0.4;

        // Set harmonic levels (piano-like distribution)
        const harmonicLevels = [1.0, 0.4, 0.2, 0.1]; // Fundamental strongest, then decreasing

        gains.forEach((gain, index) => {
            const harmonicVolume = volume * harmonicLevels[index] * (isMainNote ? 1 : 0.6);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(harmonicVolume, now + attackTime);
            gain.gain.exponentialRampToValueAtTime(harmonicVolume * sustainLevel, now + attackTime + decayTime);
            gain.gain.setValueAtTime(harmonicVolume * sustainLevel, now + duration - releaseTime);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        });

        // Noise envelope (very subtle, just for texture)
        noiseGain.gain.setValueAtTime(0, now);
        noiseGain.gain.linearRampToValueAtTime(volume * 0.05, now + 0.001);
        noiseGain.gain.exponentialRampToValueAtTime(volume * 0.01, now + 0.1);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        // Start all oscillators
        oscillators.forEach(osc => {
            osc.start(now);
            osc.stop(now + duration);
        });

        noiseSource.start(now);
        noiseSource.stop(now + Math.min(0.5, duration));
    }

    async playNote(note: string, octave: number = 4, duration: number = 0.8) {
        // Record the played note
        const playedNote: PlayedNote = {
            note,
            octave,
            timestamp: Date.now(),
            scaleDegree: this.getScaleDegree(note, this.harmonicContext.scale) || undefined
        };

        this.recentNotes.push(playedNote);
        if (this.recentNotes.length > this.maxHistoryLength) {
            this.recentNotes.shift();
        }

        // Find the best harmony for this note
        const { harmony, bass } = this.findBestHarmony(note);

        // Play the main note (louder and with primary timbre)
        await this.playTone(note, octave, duration, 1.0, 0);

        // Play harmony notes (softer and with different timbre)
        const harmonicPromises = harmony.map((harmonyNote, index) => {
            const harmonyOctave = octave + (index === 0 ? 0 : index === 1 ? 1 : -1);
            const delay = index * 0.02; // Slight stagger for richness
            const volume = 0.4 - (index * 0.1); // Decreasing volume
            return this.playTone(harmonyNote, harmonyOctave, duration * 1.2, volume, delay);
        });

        // Add bass note if suggested
        if (bass) {
            harmonicPromises.push(
                this.playTone(bass, Math.max(2, octave - 2), duration * 1.5, 0.3, 0.05)
            );
        }

        await Promise.all(harmonicPromises);
    }

    // Get current harmonic context (useful for UI display)
    getHarmonicInfo() {
        return {
            key: this.harmonicContext.key,
            mode: this.harmonicContext.mode,
            scale: this.harmonicContext.scale,
            recentNotes: this.recentNotes.slice(-5).map(n => `${n.note}${n.octave}`),
            progression: this.harmonicContext.progression,
            progressionIndex: this.harmonicContext.progressionIndex
        };
    }

    // Manually set key and mode
    setKey(key: string, mode: 'major' | 'minor' = 'major') {
        this.harmonicContext.key = key;
        this.harmonicContext.mode = mode;
        this.harmonicContext.scale = this.buildScale(key, mode);
        this.harmonicContext.progressionIndex = 0;
    }

    // Reset the harmonic context
    reset() {
        this.recentNotes = [];
        this.harmonicContext = this.detectOrInitializeKey();
    }
}

export const audioEngine = new IntelligentPianoEngine();