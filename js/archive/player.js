(() => {
  class ArchivePlayer {
    constructor(options) {
      this.video = options.video;
      this.scrubber = options.scrubber;
      this.nextButton = options.nextButton;
      this.empty = options.empty;
      this.meta = options.meta;
      this.sources = [];
      this.currentIndex = 0;
      this.pendingProgress = 0;
      this.isReady = false;
      this.isScrubbing = false;
    }

    init() {
      this.bindEvents();
      this.renderMeta();
      this.updateAvailability();
    }

    bindEvents() {
      this.scrubber?.addEventListener('input', () => {
        this.isScrubbing = true;
        const progress = Number(this.scrubber.value) / Number(this.scrubber.max || 1000);
        this.pendingProgress = progress;
        this.seekToProgress(progress);
      });

      this.scrubber?.addEventListener('change', () => {
        this.isScrubbing = false;
      });

      this.nextButton?.addEventListener('click', () => {
        if (!this.sources.length) return;
        const progress = Number(this.scrubber.value) / Number(this.scrubber.max || 1000);
        const nextIndex = (this.currentIndex + 1) % this.sources.length;
        this.loadIndex(nextIndex, progress);
      });

      this.video?.addEventListener('loadedmetadata', () => {
        this.isReady = true;
        this.seekToProgress(this.pendingProgress, true);
        this.updateAvailability();
      });

      this.video?.addEventListener('seeked', () => {
        if (!this.isScrubbing) {
          this.updateScrubberFromVideo();
        }
      });

      this.video?.addEventListener('timeupdate', () => {
        if (!this.isScrubbing) {
          this.updateScrubberFromVideo();
        }
      });
    }

    setSources(sources = []) {
      this.sources = Array.isArray(sources) ? sources : [];
      this.currentIndex = 0;
      this.pendingProgress = 0;
      if (!this.sources.length) {
        this.resetVideo();
        return;
      }
      this.loadIndex(0, 0);
    }

    loadIndex(index, progress = 0) {
      if (!this.video || !this.sources.length) return;
      this.currentIndex = index;
      this.pendingProgress = progress;
      this.isReady = false;
      this.video.pause();
      this.video.removeAttribute('src');
      this.video.src = this.sources[this.currentIndex];
      this.video.load();
      this.renderMeta();
      this.updateAvailability();
    }

    resetVideo() {
      if (!this.video) return;
      this.video.pause();
      this.video.removeAttribute('src');
      this.video.load();
      this.scrubber.value = '0';
      this.renderMeta();
      this.updateAvailability();
    }

    seekToProgress(progress, force = false) {
      if (!this.video || !this.sources.length) return;
      const clamped = Math.max(0, Math.min(1, progress));
      this.pendingProgress = clamped;
      this.scrubber.value = String(Math.round(clamped * Number(this.scrubber.max || 1000)));
      if (!this.isReady && !force) return;
      if (!Number.isFinite(this.video.duration) || this.video.duration <= 0) return;
      const targetTime = this.video.duration * clamped;
      if (Math.abs(this.video.currentTime - targetTime) > 0.04) {
        this.video.currentTime = targetTime;
      }
    }

    updateScrubberFromVideo() {
      if (!this.video || !this.sources.length) return;
      if (!Number.isFinite(this.video.duration) || this.video.duration <= 0) return;
      const progress = this.video.currentTime / this.video.duration;
      this.pendingProgress = progress;
      this.scrubber.value = String(Math.round(progress * Number(this.scrubber.max || 1000)));
    }

    renderMeta() {
      if (!this.meta) return;
      const total = this.sources.length;
      const current = total ? this.currentIndex + 1 : 0;
      this.meta.textContent = `${current} / ${total}`;
    }

    updateAvailability() {
      const hasVideo = this.sources.length > 0;
      if (this.empty) {
        this.empty.style.display = hasVideo ? 'none' : 'block';
      }
      if (this.scrubber) {
        this.scrubber.disabled = !hasVideo;
      }
      if (this.nextButton) {
        this.nextButton.disabled = !hasVideo;
      }
    }
  }

  window.ArchivePlayer = ArchivePlayer;
})();
