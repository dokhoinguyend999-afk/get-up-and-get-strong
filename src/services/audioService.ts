// Audio Service for "GET UP AND GET STRONG!"
// Manages local voice MP3 clips (David Goggins) and Web Audio API synthesized sound effects & background ambiance.

class SoundService {
  private audioCtx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.8;
  private bgmEnabled: boolean = true;
  private bgmInterval: number | null = null;
  private isUserInteracted: boolean = false;

  // Voice audio elements
  private currentVoice: HTMLAudioElement | null = null;
  private voiceAudios: { [key: string]: HTMLAudioElement } = {};

  // Audio paths with fallbacks
  private readonly AUDIO_SOURCES = {
    stayHard: [
      '/assets/david-goggins-stay-hard.mp3',
      '/assets/aistudio/david-goggins-stay-hard_6a9fb61e.mp3',
    ],
    voicemodFail: [
      '/assets/david-goggins-made-with-Voicemod.mp3',
      '/assets/aistudio/david-goggins-made-with-Voicemod_bf42c7dd.mp3',
    ],
    dontKnowMe: [
      '/assets/aistudio/they-don_t-know-me-son-made-with-Voicemod_90beb1f6.mp3',
    ],
    carryBoats: [
      '/assets/aistudio/who-is-going-to-carry-the-boats-and-the-logs-made-with-Voicemod_f2374435.mp3',
    ],
  };

  constructor() {
    // Lazy preload
    if (typeof window !== 'undefined') {
      this.preloadVoiceClips();
    }
  }

  private preloadVoiceClips() {
    Object.entries(this.AUDIO_SOURCES).forEach(([key, urls]) => {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = urls[0];
      // Attach error fallback if primary path fails
      audio.onerror = () => {
        if (urls[1] && audio.src !== urls[1]) {
          audio.src = urls[1];
          audio.load();
        }
      };
      this.voiceAudios[key] = audio;
    });
  }

  private ensureAudioContext() {
    if (!this.audioCtx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();

        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.audioCtx.currentTime);
        this.masterGain.connect(this.audioCtx.destination);

        this.sfxGain = this.audioCtx.createGain();
        this.sfxGain.gain.setValueAtTime(0.7, this.audioCtx.currentTime);
        this.sfxGain.connect(this.masterGain);

        this.bgmGain = this.audioCtx.createGain();
        // Keep background music lower in volume than voice clips (Section 9)
        this.bgmGain.gain.setValueAtTime(0.18, this.audioCtx.currentTime);
        this.bgmGain.connect(this.masterGain);
      }
    }

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  public registerUserInteraction() {
    this.isUserInteracted = true;
    this.ensureAudioContext();
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : this.volume, this.audioCtx.currentTime, 0.05);
    }
    if (this.currentVoice) {
      this.currentVoice.muted = muted;
    }
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.audioCtx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.audioCtx.currentTime, 0.05);
    }
    if (this.currentVoice) {
      this.currentVoice.volume = this.volume;
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public setBgmEnabled(enabled: boolean) {
    this.bgmEnabled = enabled;
    if (!enabled) {
      this.stopBackgroundMusic();
    } else if (this.isUserInteracted) {
      this.startBackgroundMusic();
    }
  }

  public isBgmOn(): boolean {
    return this.bgmEnabled;
  }

  // --- Voice Clip Management ---

  public stopCurrentVoice() {
    if (this.currentVoice) {
      try {
        this.currentVoice.pause();
        this.currentVoice.currentTime = 0;
      } catch {
        // Ignore audio interrupt errors
      }
      this.currentVoice = null;
    }
  }

  public playVoice(key: 'stayHard' | 'voicemodFail' | 'dontKnowMe' | 'carryBoats', onEnd?: () => void) {
    if (this.isMuted || !this.isUserInteracted) return;

    this.ensureAudioContext();

    // Prevent overlapping instances of the voice clips
    this.stopCurrentVoice();

    let audio = this.voiceAudios[key];
    if (!audio) {
      const urls = this.AUDIO_SOURCES[key];
      audio = new Audio(urls[0]);
      this.voiceAudios[key] = audio;
    }

    try {
      audio.currentTime = 0;
      audio.volume = this.volume;
      audio.muted = this.isMuted;
      this.currentVoice = audio;

      const handleEnded = () => {
        if (this.currentVoice === audio) {
          this.currentVoice = null;
        }
        audio.removeEventListener('ended', handleEnded);
        onEnd?.();
      };

      audio.addEventListener('ended', handleEnded);

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn(`Voice playback prevented or interrupted: ${key}`, err);
          this.currentVoice = null;
        });
      }
    } catch (e) {
      console.warn(`Failed to play voice clip: ${key}`, e);
    }
  }

  // Specific event mappings from Section 9
  public playStartMotivational() {
    // "Game start: Play david-goggins-stay-hard.mp3 once when the player starts the challenge."
    this.playVoice('stayHard');
  }

  public playWrongAnswerMotivational() {
    // "Incorrect answer: Play david-goggins-made-with-Voicemod.mp3 when the player fails a checkpoint and begins running back"
    this.playVoice('voicemodFail');
  }

  public playVictoryMotivational() {
    // "Final victory: Play the short motivational clip once as the characters cross the finish line."
    this.playVoice('stayHard');
  }

  public playMajorMilestoneCallout(milestoneNumber: number) {
    // "Major milestone: The short 'Stay hard!' clip may play at selected important milestones, but avoid excessive repetition."
    if (milestoneNumber === 3) {
      this.playVoice('carryBoats');
    } else if (milestoneNumber === 4) {
      this.playVoice('dontKnowMe');
    }
  }

  // --- Synthesized SFX ---

  public playCorrectSound() {
    // "Correct answer: Play a subtle, short success sound if available. Do not play the long voice clip for every correct answer."
    if (this.isMuted) return;
    this.ensureAudioContext();
    if (!this.audioCtx || !this.sfxGain) return;

    const notes = [659.25, 880.0, 1046.5]; // E5, A5, C6 (Bright pleasant chime)
    notes.forEach((freq, idx) => {
      const start = this.audioCtx!.currentTime + idx * 0.07;
      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.12, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(start);
      osc.stop(start + 0.38);
    });
  }

  public playWrongBuzzer() {
    if (this.isMuted) return;
    this.ensureAudioContext();
    if (!this.audioCtx || !this.sfxGain) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(90, this.audioCtx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.28);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.3);
  }

  public playButtonClick() {
    if (this.isMuted) return;
    this.ensureAudioContext();
    if (!this.audioCtx || !this.sfxGain) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(480, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(240, this.audioCtx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.07);
  }

  public playFinishHorn() {
    if (this.isMuted) return;
    this.ensureAudioContext();
    if (!this.audioCtx || !this.sfxGain) return;

    const chords = [523.25, 659.25, 783.99, 1046.5]; // C major fanfare
    chords.forEach((f) => {
      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, this.audioCtx!.currentTime);

      gain.gain.setValueAtTime(0.16, this.audioCtx!.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx!.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start();
      osc.stop(this.audioCtx!.currentTime + 1.25);
    });
  }

  // Soft running cadence tap (subtle physical feel)
  public playFootstepTap() {
    if (this.isMuted || !this.isUserInteracted) return;
    this.ensureAudioContext();
    if (!this.audioCtx || !this.sfxGain) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(70 + Math.random() * 20, this.audioCtx.currentTime);

    gain.gain.setValueAtTime(0.02, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.05);
  }

  // --- Background Ambiance (Low volume athletic rhythm) ---

  public startBackgroundMusic() {
    if (!this.bgmEnabled || this.bgmInterval) return;
    this.ensureAudioContext();
    if (!this.audioCtx || !this.bgmGain) return;

    // Upbeat steady 130 BPM running synth progression: D minor -> F -> C -> G
    const chordProgressions = [
      [146.83, 220.0, 293.66], // Dm
      [174.61, 220.0, 261.63], // F
      [130.81, 164.81, 196.0], // C
      [146.83, 196.0, 246.94], // G
    ];

    let step = 0;

    const playAmbianceStep = () => {
      if (!this.audioCtx || !this.bgmGain || this.isMuted || !this.bgmEnabled) return;

      const chord = chordProgressions[step % chordProgressions.length];
      step++;

      chord.forEach((freq, i) => {
        const osc = this.audioCtx!.createOscillator();
        const gain = this.audioCtx!.createGain();

        osc.type = i === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, this.audioCtx!.currentTime);

        gain.gain.setValueAtTime(0.001, this.audioCtx!.currentTime);
        gain.gain.linearRampToValueAtTime(0.025, this.audioCtx!.currentTime + 0.4);
        gain.gain.linearRampToValueAtTime(0.015, this.audioCtx!.currentTime + 1.4);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx!.currentTime + 1.8);

        osc.connect(gain);
        gain.connect(this.bgmGain!);

        osc.start();
        osc.stop(this.audioCtx!.currentTime + 1.85);
      });
    };

    playAmbianceStep();
    this.bgmInterval = window.setInterval(playAmbianceStep, 1850);
  }

  public stopBackgroundMusic() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

export const soundService = new SoundService();
export const soundManager = soundService;
