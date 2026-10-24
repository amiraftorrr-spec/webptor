// Authentic Windows XP Sound Service
// Uses real authentic Windows XP audio recordings with synthesized fallback

class XpAudioService {
  private ctx: AudioContext | null = null;
  private volume: number = 0.7;
  private isMuted: boolean = false;
  private audioCache: Map<string, HTMLAudioElement> = new Map();

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

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  getVolume(): number {
    return this.volume;
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  getMuted(): boolean {
    return this.isMuted;
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  private playSoundFile(src: string, fallback?: () => void) {
    if (this.isMuted || typeof window === "undefined") return;

    try {
      const audio = new Audio(src);
      audio.volume = this.volume;
      const playPromise = audio.play();
      if (playPromise) {
        playPromise.catch(() => {
          fallback?.();
        });
      }
    } catch {
      fallback?.();
    }
  }

  private lastStartupTime = 0;
  private currentStartupAudio: HTMLAudioElement | null = null;

  // Windows XP Startup Chime (Play single authentic WAV sound, throttled to prevent duplicate/double audio)
  playStartupSound() {
    const now = Date.now();
    if (now - this.lastStartupTime < 5000) return;
    this.lastStartupTime = now;

    if (this.isMuted || typeof window === "undefined") return;

    try {
      if (this.currentStartupAudio) {
        this.currentStartupAudio.pause();
        this.currentStartupAudio.currentTime = 0;
      }
      const audio = new Audio("/assets/winxp/sounds/startup.wav");
      audio.volume = this.volume;
      this.currentStartupAudio = audio;
      audio.play().catch(() => {
        // Silently catch autoplay restriction without playing any duplicate sound
      });
    } catch {}
  }

  // Windows XP Shutdown Chime
  playShutdownSound() {
    this.playSoundFile("/assets/winxp/sounds/shutdown.wav");
  }

  // Windows XP Click / Action Sound
  playClickSound() {
    this.playSoundFile("/assets/winxp/sounds/click.wav", () => this.synthesizeClick());
  }

  // Hardware Insert (when files are dropped/added)
  playInsertSound() {
    this.playSoundFile("/assets/winxp/sounds/insert.wav", () => this.synthesizeDing());
  }

  // Recycle / Empty Bin
  playRecycleSound() {
    this.playSoundFile("/assets/winxp/sounds/recycle.wav");
  }

  // Windows XP Ding / Asterisk Sound
  playDingSound() {
    this.playSoundFile("/assets/winxp/sounds/ding.wav", () => this.synthesizeDing());
  }

  // Windows XP Error / Critical Stop
  playErrorSound() {
    this.playSoundFile("/assets/winxp/sounds/error.wav", () => this.synthesizeError());
  }

  // Windows XP Balloon Notification
  playBalloonSound() {
    this.playSoundFile("/assets/winxp/sounds/balloon.wav");
  }

  // Windows XP Window Minimize
  playMinimizeSound() {
    this.playSoundFile("/assets/winxp/sounds/minimize.wav");
  }

  // Windows XP Window Restore
  playRestoreSound() {
    this.playSoundFile("/assets/winxp/sounds/restore.wav");
  }

  // Windows XP Notification
  playNotifySound() {
    this.playSoundFile("/assets/winxp/sounds/notify.wav");
  }

  // Web Audio Fallbacks in case sound files cannot be loaded
  private synthesizeStartup() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const chordNotes = [
        { freq: 155.56, time: 0.0, dur: 3.2, gain: 0.15 },
        { freq: 233.08, time: 0.05, dur: 3.0, gain: 0.18 },
        { freq: 311.13, time: 0.1, dur: 2.8, gain: 0.22 },
        { freq: 392.00, time: 0.18, dur: 2.6, gain: 0.20 },
        { freq: 466.16, time: 0.35, dur: 2.2, gain: 0.25 },
        { freq: 622.25, time: 0.55, dur: 2.5, gain: 0.28 },
        { freq: 783.99, time: 0.85, dur: 2.2, gain: 0.22 },
        { freq: 932.33, time: 1.1, dur: 2.0, gain: 0.20 },
        { freq: 1244.5, time: 1.35, dur: 2.6, gain: 0.25 },
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
        gainNode.gain.linearRampToValueAtTime(gain * this.volume, now + time + 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);
        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(now + time);
        osc.stop(now + time + dur + 0.1);
      });
    } catch {}
  }

  private synthesizeClick() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
      gain.gain.setValueAtTime(0.12 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  }

  private synthesizeDing() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1760, now);
      gain.gain.setValueAtTime(0.15 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.42);
    } catch {}
  }

  private synthesizeError() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.25);
      gain.gain.setValueAtTime(0.2 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    } catch {}
  }
}

export const xpAudio = new XpAudioService();
