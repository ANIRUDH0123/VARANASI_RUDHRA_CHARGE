/**
 * Synthesized Web Audio API sound effects for Apex Dino Dash.
 * Zero external asset dependencies - works instantly offline and in any sandbox.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.5;
  private backgroundMusic: HTMLAudioElement | null = null;
  private startCue: HTMLAudioElement | null = null;

  constructor() {
    // Check localStorage for muted preference
    try {
      const savedMute = localStorage.getItem('dino_audio_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
    } catch {
      // ignore
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('dino_audio_muted', String(this.isMuted));
    } catch {
      // ignore
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public playJump(isDoubleJump: boolean = false) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = isDoubleJump ? 'sine' : 'triangle';
    const startFreq = isDoubleJump ? 380 : 180;
    const endFreq = isDoubleJump ? 720 : 420;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.14);

    gain.gain.setValueAtTime(0.28 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.17);

    // Bull grunt / trishul whoosh harmonic
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(140, now);
    subOsc.frequency.exponentialRampToValueAtTime(60, now + 0.12);
    subGain.gain.setValueAtTime(0.18 * this.volume, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.14);
  }

  public playDuck() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Bull charging snort
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);

    gain.gain.setValueAtTime(0.2 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  public playMilestone() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    // Resonant Temple Bell (Ghanta) chime harmonics
    const bellPitches = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    bellPitches.forEach((freq, idx) => {
      if (!this.ctx) return;
      const now = this.ctx.currentTime + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Bell sustain with long exponential decay
      gain.gain.setValueAtTime(0.35 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    });
  }

  public playHoofStep() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.04);

    gain.gain.setValueAtTime(0.08 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playPowerUpCollect() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    // Ascending major chord fanfare
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    freqs.forEach((freq, i) => {
      if (!this.ctx) return;
      const now = this.ctx.currentTime + i * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.22 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    });
  }

  public playShieldBreak() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.18);

    gain.gain.setValueAtTime(0.35 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  public playGameOver() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Impact bonk
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.35);

    gain.gain.setValueAtTime(0.4 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);

    // Dissonant sub rumble
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'square';
    subOsc.frequency.setValueAtTime(95, now + 0.05);
    subOsc.frequency.exponentialRampToValueAtTime(30, now + 0.4);

    subGain.gain.setValueAtTime(0.2 * this.volume, now + 0.05);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);

    subOsc.start(now + 0.05);
    subOsc.stop(now + 0.45);
  }

  public playButtonClick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.04);

    gain.gain.setValueAtTime(0.12 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playGameStartCue() {
    if (this.isMuted) return;

    if (this.startCue) {
      this.startCue.pause();
      this.startCue.currentTime = 0;
    }

    const audio = new Audio(`${import.meta.env.BASE_URL}audio/jai_babu_notification.mp3`);
    audio.volume = 0.7;
    audio.preload = 'auto';
    this.startCue = audio;

    audio.play().catch(() => {
      this.startCue = null;
    });
  }

  public startBackgroundMusic() {
    if (this.isMuted) return;

    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
    }

    const audio = new Audio(`${import.meta.env.BASE_URL}music/varanasi_charge_loop.mp3`);
    audio.loop = true;
    audio.volume = 0.45;
    audio.preload = 'auto';
    this.backgroundMusic = audio;

    audio.play().catch(() => {
      this.backgroundMusic = null;
    });
  }

  public stopBackgroundMusic() {
    if (!this.backgroundMusic) return;
    this.backgroundMusic.pause();
    this.backgroundMusic.currentTime = 0;
    this.backgroundMusic = null;
  }
}

export const sounds = new SoundEngine();
