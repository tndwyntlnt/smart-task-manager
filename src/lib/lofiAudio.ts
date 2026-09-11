class LofiStreamPlayer {
  private audio: HTMLAudioElement | null = null;
  private isPlaying = false;

  constructor() {
    if (typeof window !== 'undefined') {
      // Menggunakan file MP3 Musik Lo-Fi Chill / Study dari CDN terpercaya
      this.audio = new Audio(
        'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3'
      );
      this.audio.loop = true; // Musik akan terus berulang selama timer aktif
      this.audio.volume = 0.3; // Volume lembut (30%) agar tidak mengganggu konsentrasi
    }
  }

  async start() {
    if (!this.audio || this.isPlaying) return;

    try {
      await this.audio.play();
      this.isPlaying = true;
    } catch (err) {
      console.warn('Gagal memutar lagu Lo-Fi:', err);
    }
  }

  stop() {
    if (!this.audio) return;
    this.audio.pause();
    this.audio.currentTime = 0; // Reset ke awal lagu saat dihentikan/direset
    this.isPlaying = false;
  }

  setVolume(volume: number) {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }
}

export const lofiAudio = new LofiStreamPlayer();