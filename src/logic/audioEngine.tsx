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

// 🎶 C major scale
const scale = ["C", "D", "E", "F", "G", "A", "B"];

class AudioEngine {
    private audioContext: AudioContext | null = null;
    private masterGain: GainNode | null = null;

    constructor() {
        this.initializeAudio();
    }

    private initializeAudio() {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
        this.masterGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    }

    async playNote(note: string, octave: number = 4, duration: number = 0.8) {
        if (!this.audioContext || !this.masterGain) return;
        if (this.audioContext.state === "suspended") await this.audioContext.resume();

        const freq = noteFrequencies[note] * Math.pow(2, octave - 4);
        const now = this.audioContext.currentTime;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now);

        // ADSR
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.8, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.3, now + 0.2);
        gain.gain.setValueAtTime(0.3, now + duration - 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.start(now);
        osc.stop(now + duration);
    }

    // 🎹 Harmony: pick chord tones around the note
    async playHarmonized(note: string, octave: number = 4) {
        if (!scale.includes(note)) {
            // if note outside scale, just play the note
            return this.playNote(note, octave);
        }

        const idx = scale.indexOf(note);

        // Chord = root + 3rd + 5th
        const chordNotes = [
            scale[idx], // root
            scale[(idx + 2) % scale.length], // 3rd
            scale[(idx + 4) % scale.length], // 5th
        ];

        // Play all together (with your pressed note louder)
        await Promise.all(chordNotes.map((n, i) =>
            this.playNote(n, octave + (i === 0 ? 0 : (i === 2 ? 1 : 0)))
        ));
    }
}

export const audioEngine = new AudioEngine();
