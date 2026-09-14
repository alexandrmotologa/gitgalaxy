class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneLfo: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private masterGain: GainNode | null = null;

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    } catch {
      console.warn('Web Audio API not supported in this browser.');
    }
  }

  public async setMuted(muted: boolean) {
    this.isMuted = muted;

    if (!this.ctx) {
      this.init();
    }

    if (this.ctx && this.ctx.state === 'suspended' && !muted) {
      await this.ctx.resume();
    }

    if (muted) {
      this.stopDrone();
    } else {
      // Play a quick, pleasant "Interface Online" chime so user immediately hears sound
      this.playStartupChime();
      this.startDrone();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Quick two-tone chime confirming sound is active.
   */
  public playStartupChime() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.1); // A5

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.18, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.42);
    } catch {
      // Audio errors are non-fatal
    }
  }

  /**
   * Ambient cosmic drone: two detuned harmonic oscillators (A2 + E3)
   * with a slowly modulating resonant lowpass filter.
   */
  public startDrone() {
    if (this.isMuted || !this.ctx) return;
    if (this.droneOsc1) return;

    try {
      const now = this.ctx.currentTime;

      // Osc 1: Root fundamental at 110 Hz (A2)
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(110, now);

      // Osc 2: Perfect fifth at 164.8 Hz (E3) with slight warmth
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(165.2, now);

      // Lowpass filter with breathing cutoff
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now);
      filter.Q.setValueAtTime(3.0, now);

      // LFO for organic space breathing
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.12, now); // Slow 8-second cycle
      lfoGain.gain.setValueAtTime(90, now);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      // Drone Gain
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.09, now + 1.5);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      lfo.start(now);

      this.droneOsc1 = osc1;
      this.droneOsc2 = osc2;
      this.droneLfo = lfo;
      this.droneGain = gain;
    } catch (err) {
      console.warn('Could not start ambient space drone:', err);
    }
  }

  public stopDrone() {
    if (this.droneGain && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.droneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
        setTimeout(() => {
          this.droneOsc1?.stop();
          this.droneOsc1?.disconnect();
          this.droneOsc2?.stop();
          this.droneOsc2?.disconnect();
          this.droneLfo?.stop();
          this.droneLfo?.disconnect();
          this.droneOsc1 = null;
          this.droneOsc2 = null;
          this.droneLfo = null;
          this.droneGain = null;
        }, 320);
      } catch {
        this.droneOsc1 = null;
        this.droneOsc2 = null;
        this.droneLfo = null;
        this.droneGain = null;
      }
    }
  }

  /**
   * Resonant laser beam sweep fired towards modified files during commits.
   */
  public playLaser() {
    if (this.isMuted || !this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      // High-to-mid resonant sweep
      osc.frequency.setValueAtTime(1050, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.14);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Non-fatal
    }
  }

  /**
   * Musical chime tone triggered with each commit revision.
   */
  public playCommitTone(type: string = 'feat') {
    if (this.isMuted || !this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      let freq = 523.25; // C5 default
      if (type.includes('feat')) freq = 659.25; // E5
      else if (type.includes('fix')) freq = 587.33; // D5
      else if (type.includes('refactor')) freq = 440.0; // A4
      else if (type.includes('perf')) freq = 783.99; // G5

      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.23);
    } catch {
      // Non-fatal
    }
  }

  /**
   * Radial shockwave rumble when file churn spikes.
   */
  public playShockwave() {
    if (this.isMuted || !this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.28);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.29);
    } catch {
      // Non-fatal
    }
  }
}

export const soundFx = new AudioSynthesizer();
