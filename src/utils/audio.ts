/**
 * Web Audio API synthesized sound generator for chess events
 * Accurately mimics Chess.com signature acoustic sound profile:
 * - Crisp, organic wooden "thock" for moves
 * - Satisfying double-wood snap for captures
 * - Preserved bell ding chime for checks
 * - Dual rapid slide-wood clicks for castling
 * - Ascending warm chord for checkmate / game victory
 */

class ChessAudio {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Chess.com signature Move sound:
   * Warm, organic, wooden piece placement "thock"
   */
  public playMove() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const t = ctx.currentTime;

      // 1. Wood body resonance
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(340, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.065);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.075);

      // 2. Subtle click transient (high-passed micro burst)
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(820, t);
      clickOsc.frequency.exponentialRampToValueAtTime(300, t + 0.015);

      clickGain.gain.setValueAtTime(0.18, t);
      clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);

      clickOsc.start(t);
      clickOsc.stop(t + 0.025);
    } catch {
      // Audio quiet fail
    }
  }

  /**
   * Chess.com signature Capture sound:
   * Crisp, satisfying double-wood impact (piece knock + piece land).
   * Warm, tactile, zero harsh distortion.
   */
  public playCapture() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const t = ctx.currentTime;

      // First snap: piece displacement (t to t+0.03s)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(460, t);
      osc1.frequency.exponentialRampToValueAtTime(260, t + 0.035);

      gain1.gain.setValueAtTime(0.38, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(t);
      osc1.stop(t + 0.045);

      // Second solid impact: capturing piece lands on board (t + 0.028s)
      const t2 = t + 0.028;
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(280, t2);
      osc2.frequency.exponentialRampToValueAtTime(110, t2 + 0.08);

      gain2.gain.setValueAtTime(0.42, t2);
      gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.085);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(t2);
      osc2.stop(t2 + 0.09);

      // Micro tap click for organic texture
      const click = ctx.createOscillator();
      const clickGain = ctx.createGain();
      click.type = 'triangle';
      click.frequency.setValueAtTime(950, t2);
      click.frequency.exponentialRampToValueAtTime(400, t2 + 0.015);
      clickGain.gain.setValueAtTime(0.2, t2);
      clickGain.gain.exponentialRampToValueAtTime(0.001, t2 + 0.018);

      click.connect(clickGain);
      clickGain.connect(ctx.destination);
      click.start(t2);
      click.stop(t2 + 0.02);
    } catch {
      // Audio quiet fail
    }
  }

  /**
   * Castling:
   * Rapid dual piece placement
   */
  public playCastle() {
    this.playMove();
    setTimeout(() => {
      this.playMove();
    }, 75);
  }

  /**
   * Check sound:
   * Keep the crisp ringing bell ding sound that the user specifically requested!
   */
  public playCheck() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      [660, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.09);

        gain.gain.setValueAtTime(0.3, now + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.09);
        osc.stop(now + i * 0.09 + 0.25);
      });
    } catch {
      // Audio quiet fail
    }
  }

  /**
   * Checkmate / Victory:
   * Harmonious warm ascending chord (C5, E5, G5, C6)
   */
  public playCheckmate() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.22, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.05);
        osc.stop(now + 0.7);
      });
    } catch {
      // Audio quiet fail
    }
  }

  /**
   * Tutorial Success chime
   */
  public playSuccess() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);

        gain.gain.setValueAtTime(0.24, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.32);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.35);
      });
    } catch {
      // Fallback
    }
  }

  /**
   * Muted subtle wood thud for invalid moves
   */
  public playBlunder() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.exponentialRampToValueAtTime(85, t + 0.12);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.14);
    } catch {
      // Fallback
    }
  }
}

export const soundFx = new ChessAudio();
