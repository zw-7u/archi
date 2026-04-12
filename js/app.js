(() => {
  class PalaceArchiveApp {
    constructor() {
      this.viewport = document.getElementById('chapter-viewport');
      this.stage = document.getElementById('chapter-stage');
      this.railNodes = [...document.querySelectorAll('.chapter-rail__node')];
      this.chapters = [...document.querySelectorAll('.chapter')];
      this.current = 0;
      this.target = 0;
      this.isDragging = false;
      this.dragStartX = 0;
      this.dragStartTarget = 0;
      this.snapTimer = null;
      this.meta = [
        { title: '宫阙载史', subtitle: 'Chapter 01' },
        { title: '宫阙清赏', subtitle: 'Chapter 02' },
        { title: '宫阙玄思', subtitle: 'Chapter 03' },
        { title: '宫阙形制', subtitle: 'Chapter 04' }
      ];
    }

    async init() {
      gsap.defaults({ ease: 'power3.out', duration: 0.68 });

      // 入场动画序列
      const entryTl = gsap.timeline({ delay: 0.15 });

      entryTl.from('.site-header', {
        y: -40,
        opacity: 0,
        duration: 0.8,
        ease: 'back.out(1.4)'
      });

      entryTl.from('.chapter--archive', {
        scale: 0.88,
        opacity: 0,
        duration: 1.0,
        ease: 'power2.out'
      }, '-=0.4');

      entryTl.from('.chapter--jishou', {
        scale: 0.88,
        opacity: 0,
        duration: 1.0,
        ease: 'power2.out'
      }, '-=0.7');

      entryTl.from('.chapter-rail', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out'
      }, '-=0.3');

      this.archiveChapter = new window.ArchiveChapter({
        root: document.getElementById('archive-layout'),
        data: window.ARCHIVE_DATA,
        motionTargets: {
          timeline: document.getElementById('archive-timeline-panel'),
          stage: document.getElementById('archive-stage-panel'),
          info: document.getElementById('archive-info-panel')
        }
      });
      await this.archiveChapter.init();

      this.jishouChapter = new window.JishouChapter({
        root: document.getElementById('jishou-layout')
      });
      await this.jishouChapter.init();

      this.xuansiChapter = new window.XuansiChapter({
        root: document.getElementById('xuansi-layout')
      });
      await this.xuansiChapter.init();

      this.xingzhiChapter = new window.XingzhiChapter({
        root: document.getElementById('xingzhi-layout')
      });
      await this.xingzhiChapter.init();

      this.bindEvents();
      gsap.ticker.add(this.render);
      this.render();
    }

    bindEvents() {
      this.render = this.render.bind(this);
      this.onPointerMove = this.onPointerMove.bind(this);
      this.onPointerUp = this.onPointerUp.bind(this);

      this.railNodes.forEach((node) => {
        node.addEventListener('click', () => this.goTo(Number(node.dataset.targetIndex)));
      });

      this.viewport.addEventListener('wheel', (event) => {
        if (event.target.closest('button, input')) return;
        event.preventDefault();
        const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
        this.target = this.clamp(this.target + delta / 620, 0, this.chapters.length - 1);
        this.scheduleSnap();
      }, { passive: false });

      this.viewport.addEventListener('pointerdown', (event) => {
        if (event.target.closest('button, input')) return;
        this.isDragging = true;
        this.dragStartX = event.clientX;
        this.dragStartTarget = this.target;
        this.viewport.classList.add('is-dragging');
        window.addEventListener('pointermove', this.onPointerMove);
        window.addEventListener('pointerup', this.onPointerUp);
        window.addEventListener('pointercancel', this.onPointerUp);
      });

      window.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight') this.goTo(Math.min(Math.round(this.target) + 1, this.chapters.length - 1));
        if (event.key === 'ArrowLeft') this.goTo(Math.max(Math.round(this.target) - 1, 0));
      });

      window.addEventListener('resize', () => this.render(true));
    }

    onPointerMove(event) {
      if (!this.isDragging) return;
      const spacing = this.getSpacing();
      const delta = (event.clientX - this.dragStartX) / spacing;
      this.target = this.clamp(this.dragStartTarget - delta, 0, this.chapters.length - 1);
    }

    onPointerUp() {
      this.isDragging = false;
      this.viewport.classList.remove('is-dragging');
      this.scheduleSnap(0);
      window.removeEventListener('pointermove', this.onPointerMove);
      window.removeEventListener('pointerup', this.onPointerUp);
      window.removeEventListener('pointercancel', this.onPointerUp);
    }

    scheduleSnap(delay = 120) {
      clearTimeout(this.snapTimer);
      this.snapTimer = setTimeout(() => {
        this.goTo(Math.round(this.target), true);
      }, delay);
    }

    goTo(index, instant = false) {
      this.target = this.clamp(index, 0, this.chapters.length - 1);
      if (instant) {
        this.current = this.target;
      }
      this.updateRail();
    }

    getSpacing() {
      return Math.min(window.innerWidth * 0.88, 1480);
    }

    clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    render(force = false) {
      this.current += (this.target - this.current) * (this.isDragging ? 0.22 : 0.12);
      if (Math.abs(this.target - this.current) < 0.0004) {
        this.current = this.target;
      }
      const spacing = this.getSpacing();
      this.chapters.forEach((chapter, index) => {
        const delta = index - this.current;
        const distance = Math.abs(delta);
        const focus = this.clamp(1 - distance * 0.62, 0, 1);
        const x = delta * spacing;
        const scale = 0.72 + focus * 0.28;
        const opacity = 0.08 + focus * 0.92;
        chapter.style.transform = `translate3d(calc(-50% + ${x}px), -50%, 0) scale(${scale})`;
        chapter.style.opacity = opacity.toFixed(3);
        chapter.style.filter = 'none';
        chapter.style.pointerEvents = focus > 0.62 ? 'auto' : 'none';
        chapter.classList.toggle('is-active', focus > 0.92);
        if (index === 0) {
          this.archiveChapter?.applyMotion(focus);
        }
        if (index === 1) {
          this.jishouChapter?.applyMotion(focus);
        }
        if (index === 2) {
          this.xuansiChapter?.applyMotion(focus);
        }
        if (index === 3) {
          this.xingzhiChapter?.applyMotion(focus);
        }
      });
      this.updateRail();
    }

    updateRail() {
      const activeIndex = Math.round(this.current);
      this.railNodes.forEach((node, index) => {
        node.classList.toggle('is-active', index === activeIndex);
      });
    }
  }

  window.addEventListener('DOMContentLoaded', async () => {
    const app = new PalaceArchiveApp();
    await app.init();
    window.palaceArchiveApp = app;
  });
})();
