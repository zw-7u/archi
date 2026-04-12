(() => {
  class ArchiveTimeline {
    constructor(options) {
      this.data = options.data;
      this.mingEl = options.mingEl;
      this.qingEl = options.qingEl;
    }

    init() {
      this.render();
    }

    render() {
      this.renderColumn(this.mingEl, this.data.timeline.ming, {
        dotColor: '#4f8dc0',
        dotShadow: 'rgba(79, 141, 192, 0.14)',
        yearColor: '#356a96'
      });
      this.renderColumn(this.qingEl, this.data.timeline.qing, {
        dotColor: '#b9643a',
        dotShadow: 'rgba(185, 100, 58, 0.14)',
        yearColor: '#a3542d'
      });
    }

    renderColumn(container, items, palette) {
      if (!container) return;
      container.innerHTML = `
        <div class="archive-timeline-list">
          ${items.map((item) => `
            <article class="archive-timeline-item">
              <div class="archive-timeline-node" style="--dot-color:${palette.dotColor}; --dot-shadow:${palette.dotShadow};"></div>
              <div class="archive-timeline-content">
                <div class="archive-timeline-year" style="--year-color:${palette.yearColor};">${item.year}</div>
                <div class="archive-timeline-reign">${item.reign}</div>
                <div class="archive-timeline-desc">${item.desc}</div>
              </div>
            </article>
          `).join('')}
        </div>
      `;

      gsap.from(container.querySelectorAll('.archive-timeline-item'), {
        opacity: 0,
        x: -20,
        stagger: 0.06,
        duration: 0.45,
        ease: 'power2.out',
        delay: 0.5
      });
    }
  }

  window.ArchiveTimeline = ArchiveTimeline;
})();
