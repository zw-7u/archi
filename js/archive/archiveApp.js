(() => {
  class ArchiveChapter {
    constructor(options) {
      this.root = options.root;
      this.data = options.data;
      this.motionTargets = options.motionTargets;
      this.state = {
        mode: 'overview',
        activeBuildingId: null,
        activeView: 'intro'
      };
      this.refs = {
        overviewPanel: document.getElementById('archive-overview-panel'),
        stageShell: document.getElementById('archive-stage-shell'),
        videoPanel: document.getElementById('archive-video-panel'),
        scrubberBar: document.getElementById('archive-player-bar'),
        info: document.getElementById('archive-info'),
        video: document.getElementById('archive-video'),
        empty: document.getElementById('archive-video-empty'),
        scrubber: document.getElementById('archive-scrubber'),
        nextVideo: document.getElementById('archive-next-video'),
        playerMeta: document.getElementById('archive-player-meta'),
        timelineMing: document.getElementById('timeline-ming'),
        timelineQing: document.getElementById('timeline-qing')
      };
      this.motionSetters = [];
    }

    async init() {
      this.timeline = new window.ArchiveTimeline({
        data: this.data,
        mingEl: this.refs.timelineMing,
        qingEl: this.refs.timelineQing
      });
      this.timeline.init();

      this.overview = new window.ArchiveOverview({
        mount: this.refs.overviewPanel,
        data: this.data,
        onSelect: (buildingId) => this.openBuilding(buildingId)
      });
      await this.overview.init();

      this.player = new window.ArchivePlayer({
        video: this.refs.video,
        scrubber: this.refs.scrubber,
        nextButton: this.refs.nextVideo,
        empty: this.refs.empty,
        meta: this.refs.playerMeta
      });
      this.player.init();

      this.refs.overviewPanel.dataset.returnLabel = '点击总览图 · 返回总览';
      this.refs.overviewPanel.addEventListener('click', () => {
        if (this.state.mode === 'detail') {
          this.showIntro();
        }
      });

      window.addEventListener('resize', () => this.syncStageLayout(true));
      this.renderIntro();
      this.syncStageLayout(true);
    }

    applyMotion(focus) {
      const specs = [
        { el: this.motionTargets.timeline, x: -30, y: 18 },
        { el: this.motionTargets.stage, x: 0, y: 0 },
        { el: this.motionTargets.info, x: 30, y: 18 }
      ];
      specs.forEach(({ el, x, y }) => {
        if (!el) return;
        const opacity = 0.22 + focus * 0.78;
        const scale = 0.84 + focus * 0.16;
        el.style.transform = `translate3d(${x * (1 - focus)}px, ${y * (1 - focus)}px, 0) scale(${scale})`;
        el.style.opacity = opacity.toFixed(3);
        el.style.filter = 'none';
      });
    }

    openBuilding(buildingId) {
      const building = this.data.buildings[buildingId];
      if (!building) return;
      this.overview.stopCategoryShowcase();
      this.state.activeBuildingId = buildingId;
      this.state.activeView = 'archive';
      this.overview.setSelection(buildingId);
      this.renderBuilding(building, 'archive');
      this.player.setSources(building.videos);
      this.showDetail();
    }

    showDetail() {
      if (this.state.mode === 'detail') {
        this.syncStageLayout();
        return;
      }
      this.state.mode = 'detail';
      this.overview.setMode('detail');
      this.refs.overviewPanel.classList.add('is-returnable');
      const overviewTarget = this.getOverviewDetailRect();
      const stageRect = this.refs.stageShell.getBoundingClientRect();
      gsap.killTweensOf([this.refs.overviewPanel, this.refs.videoPanel, this.refs.scrubberBar]);
      gsap.to(this.refs.overviewPanel, {
        x: overviewTarget.x,
        y: overviewTarget.y,
        scale: overviewTarget.scale,
        borderRadius: 26,
        duration: 0.72,
        ease: 'power3.inOut'
      });
      gsap.set(this.refs.videoPanel, { visibility: 'visible', pointerEvents: 'auto' });
      gsap.to(this.refs.videoPanel, {
        opacity: 1,
        duration: 0.58,
        ease: 'power2.out'
      });
      gsap.set(this.refs.scrubberBar, { visibility: 'visible' });
      gsap.to(this.refs.scrubberBar, {
        opacity: 1,
        duration: 0.48,
        delay: 0.14,
        ease: 'power2.out'
      });
    }

    transitionToOverview(renderIntro = true) {
      this.state.mode = 'overview';
      if (renderIntro) {
        this.state.activeView = 'intro';
      }
      this.overview.setMode('overview');
      this.overview.clearSelection();
      this.refs.overviewPanel.classList.remove('is-returnable');
      gsap.killTweensOf([this.refs.overviewPanel, this.refs.videoPanel, this.refs.scrubberBar]);
      gsap.to(this.refs.overviewPanel, {
        x: 0,
        y: 0,
        scale: 1,
        borderRadius: 0,
        duration: 0.72,
        ease: 'power3.inOut'
      });
      gsap.to(this.refs.videoPanel, {
        opacity: 0,
        duration: 0.42,
        ease: 'power2.out',
        onComplete: () => {
          this.refs.videoPanel.style.visibility = 'hidden';
          this.refs.videoPanel.style.pointerEvents = 'none';
        }
      });
      gsap.to(this.refs.scrubberBar, {
        opacity: 0,
        duration: 0.32,
        ease: 'power2.out',
        onComplete: () => {
          this.refs.scrubberBar.style.visibility = 'hidden';
        }
      });
      if (renderIntro) {
        this.renderIntro();
      }
    }

    showIntro() {
      this.transitionToOverview(true);
    }

    showCategory(categoryId) {
      const building = this.data.buildings[this.state.activeBuildingId];
      if (!building) return;
      this.state.activeView = 'category';
      this.renderCategory(categoryId, building.id);
      const runShowcase = () => this.overview.playCategoryShowcase(categoryId);
      if (this.state.mode === 'detail') {
        this.transitionToOverview(false);
        gsap.delayedCall(0.74, runShowcase);
      } else {
        runShowcase();
      }
    }

    showArchive() {
      const building = this.data.buildings[this.state.activeBuildingId];
      if (!building) return;
      this.overview.stopCategoryShowcase();
      this.state.activeView = 'archive';
      this.renderBuilding(building, 'archive');
      this.showDetail();
    }

    showEvents() {
      const building = this.data.buildings[this.state.activeBuildingId];
      if (!building) return;
      this.overview.stopCategoryShowcase();
      this.state.activeView = 'events';
      this.renderBuilding(building, 'events');
      this.showDetail();
    }

    renderIntro() {
      const intro = this.data.intro;
      const statsHtml = this.data.stats.map((item) => `
        <div class="archive-stat">
          <div class="archive-stat__value">${item.value}<span class="archive-stat__unit">${item.unit}</span></div>
          <div class="archive-stat__label">${item.label}</div>
        </div>
      `).join('');
      this.refs.info.innerHTML = `
        <div class="archive-info__eyebrow">Chapter 01</div>
        <h2 class="archive-info__title">${intro.title}</h2>
        <div class="archive-info__subtitle">${intro.subtitle}</div>
        <div class="archive-stat-grid">${statsHtml}</div>
        <div class="archive-info__summary">${intro.summary}</div>
      `;
    }

    renderBuilding(building, activeView) {
      const archiveCard = this.renderArchiveCard(building);
      const eventsCard = this.renderEventsCard(building);
      const card = activeView === 'events' ? eventsCard : archiveCard;
      this.refs.info.innerHTML = `
        <div class="archive-info__eyebrow">${building.typeLabel}</div>
        <h2 class="archive-info__title">${building.name}</h2>
        <div class="archive-info__subtitle">${building.nameEn}</div>
        <div class="archive-actions">
          <button class="archive-action ${activeView === 'category' ? 'is-active' : ''}" data-action="category">${building.categoryLabel}</button>
          <button class="archive-action ${activeView === 'archive' ? 'is-active' : ''}" data-action="archive">档案卡</button>
          <button class="archive-action ${activeView === 'events' ? 'is-active' : ''}" data-action="events">事件卡</button>
        </div>
        ${card}
      `;
      this.bindInfoActions(building);
    }

    renderArchiveCard(building) {
      return `
        <section class="archive-card">
          <div class="archive-card__lead">${building.archive || '暂无档案说明。'}</div>
          <div class="archive-card__meta">
            ${this.renderMetaRow('位置', building.location)}
            ${this.renderMetaRow('始建', building.built)}
            ${this.renderMetaRow('重修', building.rebuilt || '—')}
            ${this.renderMetaRow('屋顶', building.roofType || '—')}
            ${this.renderMetaRow('材料', building.materials || '—')}
          </div>
        </section>
      `;
    }

    renderEventsCard(building) {
      if (!building.events?.length) {
        return `
          <section class="archive-card">
            <div class="archive-card__lead">该建筑暂无独立事件记录。</div>
          </section>
        `;
      }
      return `
        <section class="archive-card">
          <div class="archive-event-list">
            ${building.events.map((event) => `
              <article class="archive-event">
                <div class="archive-event__year">${event.year}</div>
                <div class="archive-event__desc">${event.desc}</div>
              </article>
            `).join('')}
          </div>
        </section>
      `;
    }

    renderCategory(categoryId, currentId) {
      const category = this.data.categories[categoryId];
      const buildings = Object.values(this.data.buildings).filter((building) => building.category === categoryId);
      this.refs.info.innerHTML = `
        <div class="archive-info__eyebrow">Category Focus</div>
        <h2 class="archive-info__title">${category?.label || categoryId}</h2>
        <div class="archive-info__subtitle">${category?.labelEn || categoryId}</div>
        <div class="archive-actions">
          <button class="archive-action is-active" data-action="category">${category?.label || categoryId}</button>
          <button class="archive-action" data-action="archive">档案卡</button>
          <button class="archive-action" data-action="events">事件卡</button>
        </div>
        <section class="archive-card">
          <div class="archive-card__lead">已返回总览图，正在依次抬升同一类型建筑。点击总览中任一建筑，可重新进入对应档案。</div>
          <div class="archive-category-list">
            ${buildings.map((building) => `
              <div class="archive-category-item">
                <div>
                  <div class="archive-category-item__name">${building.name}${building.id === currentId ? ' · 当前' : ''}</div>
                  <div class="archive-category-item__en">${building.nameEn}</div>
                </div>
                <div class="archive-category-item__en">${building.typeLabel}</div>
              </div>
            `).join('')}
          </div>
        </section>
      `;
      this.bindInfoActions(this.data.buildings[currentId]);
    }

    renderMetaRow(label, value) {
      return `
        <div class="archive-card__row">
          <span class="archive-card__row-label">${label}</span>
          <span class="archive-card__row-value">${value || '—'}</span>
        </div>
      `;
    }

    bindInfoActions(building) {
      this.refs.info.querySelectorAll('[data-action]').forEach((button) => {
        button.addEventListener('click', () => {
          const action = button.dataset.action;
          if (action === 'category') {
            this.showCategory(building.category);
          }
          if (action === 'archive') {
            this.showArchive();
          }
          if (action === 'events') {
            this.showEvents();
          }
        });
      });
    }

    getOverviewDetailRect() {
      const stageWidth = this.refs.stageShell.clientWidth;
      const stageHeight = this.refs.stageShell.clientHeight;
      const targetWidth = Math.min(176, stageWidth * 0.21);
      const targetHeight = Math.min(232, stageHeight * 0.28);
      const scale = targetWidth / stageWidth;
      return {
        x: 24,
        y: 24,
        scale: Math.min(scale, targetHeight / stageHeight)
      };
    }

    syncStageLayout(instant = false) {
      if (this.state.mode === 'detail') {
        const target = this.getOverviewDetailRect();
        gsap.set(this.refs.overviewPanel, { x: target.x, y: target.y, scale: target.scale, transformOrigin: 'top left' });
        gsap.set(this.refs.videoPanel, { opacity: 1, visibility: 'visible', pointerEvents: 'auto' });
        gsap.set(this.refs.scrubberBar, { opacity: 1, visibility: 'visible' });
      } else {
        gsap.set(this.refs.overviewPanel, { x: 0, y: 0, scale: 1, transformOrigin: 'top left' });
        gsap.set(this.refs.videoPanel, { opacity: 0, visibility: 'hidden', pointerEvents: 'none' });
        gsap.set(this.refs.scrubberBar, { opacity: 0, visibility: 'hidden' });
      }
    }
  }

  window.ArchiveChapter = ArchiveChapter;
})();
