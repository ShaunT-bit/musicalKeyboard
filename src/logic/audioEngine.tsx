// Audio frequencies for each note (in Hz)
const noteFrequencies: { [key: string]: number } = {
  'C': 261.63,
  'C#': 277.18,
  'D': 293.66,
  'D#': 311.13,
  'E': 329.63,
  'F': 349.23,
  'F#': 369.99,
  'G': 392.00,
  'G#': 415.30,
  'A': 440.00,
  'A#': 466.16,
  'B': 493.88,
};

// Colors for each note
export const noteColors: { [key: string]: string } = {
  'C': 'hsl(0, 70%, 60%)',     // Red
  'C#': 'hsl(30, 70%, 60%)',   // Orange
  'D': 'hsl(60, 70%, 60%)',    // Yellow
  'D#': 'hsl(90, 70%, 60%)',   // Yellow-green
  'E': 'hsl(120, 70%, 60%)',   // Green
  'F': 'hsl(180, 70%, 60%)',   // Cyan
  'F#': 'hsl(210, 70%, 60%)',  // Light blue
  'G': 'hsl(240, 70%, 60%)',   // Blue
  'G#': 'hsl(270, 70%, 60%)',  // Purple
  'A': 'hsl(300, 70%, 60%)',   // Magenta
  'A#': 'hsl(330, 70%, 60%)',  // Pink
  'B': 'hsl(15, 70%, 60%)',    // Red-orange
};

class AudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  constructor() {
    this.initializeAudio();
  }

  private initializeAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }

  async playNote(note: string, octave: number = 4, duration: number = 0.5) {
    if (!this.audioContext || !this.masterGain) {
      console.warn('Audio context not available');
      return;
    }

    // Resume audio context if suspended (required by some browsers)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    const frequency = noteFrequencies[note] * Math.pow(2, octave - 4);
    const currentTime = this.audioContext.currentTime;

    // Create oscillator for the note
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    // Set up the waveform (piano-like sound)
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, currentTime);

    // Create envelope (attack, decay, sustain, release)
    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(0.8, currentTime + 0.01); // Attack
    gainNode.gain.exponentialRampToValueAtTime(0.3, currentTime + 0.1); // Decay
    gainNode.gain.setValueAtTime(0.3, currentTime + duration - 0.1); // Sustain
    gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + duration); // Release

    oscillator.start(currentTime);
    oscillator.stop(currentTime + duration);
  }
}

export const audioEngine = new AudioEngine();