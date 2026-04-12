(() => {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const INTERACTIVE_SELECTOR = 'path, rect, circle, ellipse, polygon, polyline';

  class ArchiveOverview {
    constructor(options) {
      this.mount = options.mount;
      this.data = options.data;
      this.onSelect = options.onSelect;
      this.mode = 'overview';
      this.svg = null;
      this.canvas = null;
      this.tooltip = null;
      this.hotspots = [];
      this.hotspotsByBuilding = new Map();
      this.currentSelection = null;
      this.floatingLayer = null;
      this.categoryTween = null;
    }

    async init() {
      this.mount.innerHTML = '<div class="archive-overview-canvas"></div>';
      this.canvas = this.mount.querySelector('.archive-overview-canvas');
      this.createTooltip();
      await this.loadSvg();
    }

    async loadSvg() {
      try {
        const response = await fetch('assets/images/map/overview.svg');
        const svgText = await response.text();
        this.canvas.innerHTML = svgText;
        this.svg = this.canvas.querySelector('svg');
        if (!this.svg) return;
        this.floatingLayer = document.createElementNS(SVG_NS, 'g');
        this.floatingLayer.setAttribute('class', 'archive-floating-layer');
        this.svg.appendChild(this.floatingLayer);
        this.scanHotspots();
      } catch (error) {
        this.canvas.innerHTML = '<div class="archive-video-empty" style="position:absolute;inset:50% auto auto 50%;transform:translate(-50%,-50%);display:block;">总览图加载失败，请检查 SVG 文件路径。</div>';
      }
    }

    createTooltip() {
      this.tooltip = document.createElement('div');
      this.tooltip.className = 'archive-overview-tip';
      this.tooltip.innerHTML = '<span class="archive-overview-tip__zh"></span><span class="archive-overview-tip__en"></span>';
      this.mount.appendChild(this.tooltip);
    }

    scanHotspots() {
      this.hotspots = [];
      this.hotspotsByBuilding.clear();
      const groups = [...this.svg.querySelectorAll('g[id]')];
      groups.forEach((group) => {
        const svgId = group.id;
        const buildingId = this.resolveBuildingId(svgId);
        const building = this.data.buildings[buildingId];
        if (!building) return;
        const shapeEls = [...group.querySelectorAll(INTERACTIVE_SELECTOR)];
        if (!shapeEls.length) return;
        group.classList.add('overview-hotspot');
        const hotspot = { svgId, buildingId, group, shapeEls, building };
        this.hotspots.push(hotspot);
        const collection = this.hotspotsByBuilding.get(buildingId) || [];
        collection.push(hotspot);
        this.hotspotsByBuilding.set(buildingId, collection);
        this.bindHotspot(hotspot);
      });
    }

    resolveBuildingId(svgId) {
      return this.data.svgAlias[svgId] || svgId;
    }

    bindHotspot(hotspot) {
      hotspot.shapeEls.forEach((shape) => {
        shape.classList.add('overview-hotspot__hit');
        shape.style.pointerEvents = 'all';
        shape.addEventListener('mouseenter', (event) => {
          if (this.mode === 'detail') return;
          this.showTooltip(hotspot, event);
          if (this.mode !== 'category') {
            hotspot.group.classList.add('is-selected');
          }
        });
        shape.addEventListener('mousemove', (event) => {
          if (this.mode === 'detail') return;
          this.positionTooltip(event);
        });
        shape.addEventListener('mouseleave', () => {
          this.hideTooltip();
          if (this.mode !== 'category') {
            this.refreshSelectionState();
          }
        });
        shape.addEventListener('click', (event) => {
          if (this.mode === 'detail') return;
          event.stopPropagation();
          this.hideTooltip();
          this.stopCategoryShowcase();
          this.setSelection(hotspot.buildingId);
          this.onSelect?.(hotspot.buildingId);
        });
      });
    }

    showTooltip(hotspot, event) {
      if (!this.tooltip) return;
      this.tooltip.querySelector('.archive-overview-tip__zh').textContent = hotspot.building.name;
      this.tooltip.querySelector('.archive-overview-tip__en').textContent = hotspot.building.nameEn || hotspot.building.name;
      this.positionTooltip(event);
      this.tooltip.classList.add('is-visible');
    }

    positionTooltip(event) {
      if (!this.tooltip) return;
      const bounds = this.mount.getBoundingClientRect();
      const offset = 14;
      const x = event.clientX - bounds.left + offset;
      const y = event.clientY - bounds.top + offset;
      this.tooltip.style.left = `${x}px`;
      this.tooltip.style.top = `${y}px`;
    }

    hideTooltip() {
      this.tooltip?.classList.remove('is-visible');
    }

    setMode(mode) {
      this.mode = mode;
      if (mode === 'detail') {
        this.hideTooltip();
      }
      this.refreshSelectionState();
    }

    setSelection(buildingId) {
      this.currentSelection = buildingId;
      this.refreshSelectionState();
    }

    clearSelection() {
      this.currentSelection = null;
      this.refreshSelectionState();
    }

    refreshSelectionState() {
      this.hotspots.forEach((hotspot) => {
        hotspot.group.classList.remove('is-selected', 'is-dimmed');
      });
      if (this.mode === 'category') return;
      if (!this.currentSelection) return;
      this.hotspots.forEach((hotspot) => {
        if (hotspot.buildingId === this.currentSelection) {
          hotspot.group.classList.add('is-selected');
        }
      });
    }

    playCategoryShowcase(categoryId) {
      this.stopCategoryShowcase();
      this.mode = 'category';
      const categoryHotspots = this.hotspots.filter((hotspot) => hotspot.building.category === categoryId);
      if (!categoryHotspots.length) return;
      this.hotspots.forEach((hotspot) => {
        hotspot.group.classList.toggle('is-dimmed', hotspot.building.category === categoryId);
      });
      const clones = [];
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
      categoryHotspots.forEach((hotspot, index) => {
        const clone = hotspot.group.cloneNode(true);
        this.stripIds(clone);
        clone.classList.add('archive-floating-building');
        this.floatingLayer.appendChild(clone);
        clones.push(clone);
        gsap.set(clone, { opacity: 0, y: 14, scale: 0.95, transformOrigin: 'center center' });
        timeline.to(clone, {
          opacity: 1,
          y: -16,
          scale: 1.05,
          duration: 0.48,
          onStart: () => hotspot.group.classList.add('is-selected')
        }, index * 0.14);
        timeline.to(clone, {
          y: -10,
          duration: 0.42,
          onComplete: () => {
            gsap.to(clone, {
              y: '-=8',
              repeat: -1,
              yoyo: true,
              duration: 1.8,
              ease: 'sine.inOut',
              delay: index * 0.08
            });
          }
        }, index * 0.14 + 0.18);
      });
      this.categoryTween = { timeline, clones, categoryId };
    }

    stopCategoryShowcase() {
      if (this.categoryTween?.timeline) {
        this.categoryTween.timeline.kill();
      }
      if (this.categoryTween?.clones) {
        this.categoryTween.clones.forEach((clone) => {
          gsap.killTweensOf(clone);
          clone.remove();
        });
      }
      this.categoryTween = null;
      this.hotspots.forEach((hotspot) => hotspot.group.classList.remove('is-dimmed', 'is-selected'));
      if (this.mode === 'category') {
        this.mode = 'overview';
      }
      this.refreshSelectionState();
    }

    stripIds(node) {
      if (node.nodeType !== 1) return;
      node.removeAttribute('id');
      [...node.children].forEach((child) => this.stripIds(child));
    }
  }

  window.ArchiveOverview = ArchiveOverview;
})();

