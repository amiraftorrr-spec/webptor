// Authentic Windows XP Sound Synthesizer using Web Audio API (Zero external assets, instant & reliable)

class XpAudioService {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Windows XP Startup Chime Synthesizer
  playStartupSound() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Iconic chords: Eb major / Ab major progression with rich warm synth layers
      const chordNotes = [
        // Base note
        { freq: 155.56, time: 0.0, dur: 3.2, gain: 0.15 }, // Eb3
        { freq: 233.08, time: 0.05, dur: 3.0, gain: 0.18 }, // Bb3
        { freq: 311.13, time: 0.1, dur: 2.8, gain: 0.22 }, // Eb4
        { freq: 392.00, time: 0.18, dur: 2.6, gain: 0.20 }, // G4
        // Melodic accent progression
        { freq: 466.16, time: 0.35, dur: 2.2, gain: 0.25 }, // Bb4
        { freq: 622.25, time: 0.55, dur: 2.5, gain: 0.28 }, // Eb5
        { freq: 783.99, time: 0.85, dur: 2.2, gain: 0.22 }, // G5
        { freq: 932.33, time: 1.1, dur: 2.0, gain: 0.20 }, // Bb5
        { freq: 1244.5, time: 1.35, dur: 2.6, gain: 0.25 }, // Eb6
      ];

      chordNotes.forEach(({ freq, time, dur, gain }) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + time);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(freq * 3, now + time);
        filter.frequency.exponentialRampToValueAtTime(freq * 1.5, now + time + dur);

        gainNode.gain.setValueAtTime(0.001, now + time);
        gainNode.gain.linearRampToValueAtTime(gain, now + time + 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now + time);
        osc.stop(now + time + dur + 0.1);
      });

      // Warm background pad
      const padOsc = ctx.createOscillator();
      const padGain = ctx.createGain();
      padOsc.type = "triangle";
      padOsc.frequency.setValueAtTime(155.56, now);
      padGain.gain.setValueAtTime(0.001, now);
      padGain.gain.linearRampToValueAtTime(0.08, now + 0.5);
      padGain.gain.exponentialRampToValueAtTime(0.001, now + 3.5);
      padOsc.connect(padGain);
      padGain.connect(ctx.destination);
      padOsc.start(now);
      padOsc.stop(now + 3.6);
    } catch {
      // Audio playback fails gracefully if user hasn't interacted
    }
  }

  // Windows XP Click / Action Sound
  playClickSound() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  }

  // Windows XP Ding / Asterisk Sound
  playDingSound() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1760, now); // A6
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.42);
    } catch {}
  }

  // Windows XP Error / Critical Stop
  playErrorSound() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.25);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch {}
  }
}

export const xpAudio = new XpAudioService();
