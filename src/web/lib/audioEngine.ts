class AudioEngine {
  public ctx: AudioContext | null = null;
  public analyser: AnalyserNode | null = null;
  public source: MediaElementAudioSourceNode | null = null;
  
  // 5-band EQ
  public filters: BiquadFilterNode[] = [];
  private initialized = false;

  public init(audioEl: HTMLAudioElement) {
    if (this.initialized) return;

    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      this.source = this.ctx.createMediaElementSource(audioEl);

      // Create 5-band Equalizer (60Hz, 230Hz, 910Hz, 3600Hz, 14000Hz)
      const freqs = [60, 230, 910, 3600, 14000];
      this.filters = freqs.map((freq, i) => {
        const filter = this.ctx!.createBiquadFilter();
        if (i === 0) filter.type = "lowshelf";
        else if (i === freqs.length - 1) filter.type = "highshelf";
        else filter.type = "peaking";
        
        filter.frequency.value = freq;
        filter.gain.value = 0; // Default flat
        return filter;
      });

      // Chain: Source -> Filter0 -> Filter1 -> Filter2 -> Filter3 -> Filter4 -> Analyser -> Destination
      this.source.connect(this.filters[0]);
      for (let i = 0; i < this.filters.length - 1; i++) {
        this.filters[i].connect(this.filters[i + 1]);
      }
      this.filters[this.filters.length - 1].connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      this.initialized = true;
    } catch (err) {
      console.warn("Failed to initialize Master Audio Engine:", err);
    }
  }

  public setFilterGain(index: number, gain: number) {
    if (this.filters[index]) {
      this.filters[index].gain.value = gain;
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }
}

// Global Singleton
export const Engine = new AudioEngine();
