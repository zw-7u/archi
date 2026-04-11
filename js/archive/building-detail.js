/**
 * =====================================================
 *  js/archive/building-detail.js
 *  建筑详情弹层 - 宫阙载史（重构修复版）
 *  =====================================================
 */

class BuildingDetail {
  constructor(options = {}) {
    this.overlay = null
    this.stageShell = null
    this.videoStage = null
    this.overviewStage = null
    this.video = null
    this.halo = null
    this.scrubber = null
    this.infoPanel = null
    this.header = null
    this.actions = null
    this.overviewThumb = null
    this.closeBtn = null

    this.currentBuilding = null
    this.currentMode = 'video'
    this.isExternalView = true
    this.videoReady = false
    this.isDragging = false
    this.frameUpdateTimer = null
    this.currentTime = 0
    this.totalDuration = 0
    this.thumbnailCount = 8
    this.svgMarkupCache = ''
    this.activeCategoryTimeline = null
    this._isSwitchingVideo = false

    this.gsap = window.gsap || null
  }

  init() {
    this._createOverlay()
    this._bindEvents()
  }

  _createOverlay() {
    this.overlay = document.createElement('div')
    this.overlay.className = 'building-detail-overlay is-hidden'
    this.overlay.innerHTML = this._getTemplate()
    document.body.appendChild(this.overlay)

    this.stageShell = this.overlay.querySelector('.building-detail__stage-shell')
    this.videoStage = this.overlay.querySelector('.building-detail__video-stage')
    this.overviewStage = this.overlay.querySelector('.building-detail__overview-stage')
    this.video = this.overlay.querySelector('.building-detail__video')
    this.halo = this.overlay.querySelector('.building-detail__video-halo')
    this.scrubber = this.overlay.querySelector('.building-detail__scrubber')
    this.infoPanel = this.overlay.querySelector('.building-detail__info-panel')
    this.header = this.overlay.querySelector('.building-detail__header')
    this.actions = this.overlay.querySelector('.building-detail__actions')
    this.overviewThumb = this.overlay.querySelector('.building-detail__overview-thumb')
    this.closeBtn = this.overlay.querySelector('.building-detail__close')

    if (this.video) {
      this.video.preload = 'metadata'
      this.video.playsInline = true
      this.video.muted = true
      this.video.controls = false
    }
  }

  _getTemplate() {
    const lang = this._getLang()
    const backLabel = lang === 'en' ? 'Return to Overview' : '返回总览'
    const switchLabel = lang === 'en' ? 'Switch interior / exterior' : '切换内外景'
    const loadingText = lang === 'en' ? 'Loading frames…' : '正在加载帧预览…'
    const overviewEmpty = lang === 'en' ? 'Category overview preview' : '分类总览预览'

    return `
      <div class="building-detail__overview-thumb" role="button" aria-label="${backLabel}" tabindex="0">
        <div class="building-detail__overview-thumb-svg" id="detail-overview-thumb-svg"></div>
        <span class="building-detail__overview-thumb-label">${backLabel}</span>
      </div>

      <button class="building-detail__close" aria-label="关闭">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.3 5.71 12 12.01l-6.29-6.3-1.42 1.42 6.3 6.29-6.3 6.29 1.42 1.42 6.29-6.3 6.3 6.3 1.41-1.42-6.29-6.29 6.29-6.29z"/>
        </svg>
      </button>

      <header class="building-detail__header">
        <div class="building-detail__title-wrap">
          <h2 class="building-detail__title"></h2>
          <p class="building-detail__title-en"></p>
        </div>
        <div class="building-detail__actions"></div>
      </header>

      <section class="building-detail__main">
        <div class="building-detail__stage-shell stage-mode-video">
          <div class="building-detail__video-stage is-active">
            <div class="building-detail__video-wrapper">
              <video class="building-detail__video"></video>
              <div class="building-detail__video-placeholder is-hidden">
                <div class="building-detail__placeholder-inner">
                  <div class="building-detail__placeholder-title">视频占位</div>
                  <div class="building-detail__placeholder-path"></div>
                </div>
              </div>
              <div class="building-detail__video-loading">
                <div class="building-detail__video-loading-spinner"></div>
                <span class="building-detail__video-loading-text">${loadingText}</span>
              </div>
              <button class="building-detail__video-halo is-external" aria-label="${switchLabel}">
                <span class="building-detail__video-halo-ring"></span>
                <span class="building-detail__video-halo-core"></span>
                <span class="building-detail__video-halo-text">外</span>
              </button>
            </div>
            <div class="building-detail__scrubber">
              <div class="building-detail__scrubber-thumbs"></div>
              <div class="building-detail__scrubber-track" aria-label="video scrubber">
                <div class="building-detail__scrubber-progress"></div>
                <div class="building-detail__scrubber-thumb" tabindex="0"></div>
              </div>
              <span class="building-detail__scrubber-time">00:00 / 00:00</span>
            </div>
          </div>

          <div class="building-detail__overview-stage" aria-hidden="true">
            <div class="building-detail__overview-stage-svg" id="detail-overview-stage-svg"></div>
            <div class="building-detail__overview-stage-empty">${overviewEmpty}</div>
          </div>
        </div>

        <aside class="building-detail__info-panel is-hidden">
          <div class="building-detail__info-panel-header">
            <h3 class="building-detail__info-panel-title"></h3>
            <button class="building-detail__info-panel-close" aria-label="关闭面板">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.3 5.71 12 12.01l-6.29-6.3-1.42 1.42 6.3 6.29-6.3 6.29 1.42 1.42 6.29-6.3 6.3 6.3 1.41-1.42-6.29-6.29 6.29-6.29z"/>
              </svg>
            </button>
          </div>
          <div class="building-detail__info-panel-content"></div>
        </aside>
      </section>
    `
  }

  _bindEvents() {
    this.closeBtn?.addEventListener('click', () => this.close())

    this.overviewThumb?.addEventListener('click', () => this.close())
    this.overviewThumb?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        this.close()
      }
    })

    this.halo?.addEventListener('click', () => this._toggleView())

    this._bindScrubberEvents()

    this.actions?.addEventListener('click', (event) => {
      const btn = event.target.closest('.building-detail__action-btn')
      if (!btn) return

      const action = btn.dataset.action
      if (action === 'category') {
        this._toggleCategoryOverview(btn)
      } else if (action === 'archive') {
        this._setActionState(btn)
        this._setMode('video')
        this._resetCategoryOverviewState()
        this._showArchiveCard()
      } else if (action === 'events') {
        this._setActionState(btn)
        this._setMode('video')
        this._resetCategoryOverviewState()
        this._showEventsCard()
      }
    })

    this.overlay.querySelector('.building-detail__info-panel-close')?.addEventListener('click', () => {
      this._hideInfoPanel()
    })

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.overlay && !this.overlay.classList.contains('is-hidden')) {
        this.close()
      }
    })
  }

  _bindScrubberEvents() {
    const track = this.scrubber?.querySelector('.building-detail__scrubber-track')
    const thumb = this.scrubber?.querySelector('.building-detail__scrubber-thumb')
    if (!track || !thumb) return

    const startDrag = (event) => {
      event.preventDefault()
      this.isDragging = true
      thumb.style.cursor = 'grabbing'
      this._updateVideoTime(event)
    }

    thumb.addEventListener('mousedown', startDrag)
    thumb.addEventListener('touchstart', startDrag, { passive: false })

    document.addEventListener('mousemove', (event) => {
      if (this.isDragging) this._updateVideoTime(event)
    })

    document.addEventListener('touchmove', (event) => {
      if (this.isDragging) {
        event.preventDefault()
        this._updateVideoTime(event)
      }
    }, { passive: false })

    document.addEventListener('mouseup', () => {
      if (!this.isDragging) return
      this.isDragging = false
      thumb.style.cursor = 'grab'
    })

    document.addEventListener('touchend', () => {
      if (!this.isDragging) return
      this.isDragging = false
      thumb.style.cursor = 'grab'
    })

    track.addEventListener('click', (event) => {
      if (event.target === thumb) return
      this._updateVideoTime(event)
    })

    thumb.addEventListener('keydown', (event) => {
      if (!this.video || !this.totalDuration) return
      const step = Math.max(this.totalDuration / 50, 0.15)
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        this.video.currentTime = Math.min(this.video.currentTime + step, this.totalDuration)
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        this.video.currentTime = Math.max(this.video.currentTime - step, 0)
      }
      this.currentTime = this.video.currentTime
      this._updateTimeDisplay()
      this._updateScrubberProgress()
      this._updateActiveThumbnail()
    })
  }

  async open(buildingId) {
    const building = this._getBuilding(buildingId)
    if (!building) {
      console.error('BuildingDetail: 未找到建筑数据', buildingId)
      return
    }

    this.currentBuilding = building
    this.currentMode = 'video'
    this.isExternalView = true
    this.videoReady = false
    this.currentTime = 0
    this.totalDuration = 0

    this._renderHeader()
    this._renderActions()
    this._setMode('video')
    this._hideInfoPanel()
    this._resetCategoryOverviewState()
    this._showOverlay()

    try {
      await this._ensureOverviewMarkup()
      this._renderOverviewThumb()
      this._renderOverviewStageBase()
    } catch (error) {
      console.warn('BuildingDetail: 概览图加载失败', error)
    }

    await this._loadVideo({ preserveTime: false, withFrameStrip: true })
  }

  _getLang() {
    return window.state?.lang || 'zh'
  }

  _getGlobal(name) {
    if (typeof window !== 'undefined' && window[name]) return window[name]
    try {
      // eslint-disable-next-line no-new-func
      return Function(`return typeof ${name} !== "undefined" ? ${name} : undefined`)()
    } catch (error) {
      return undefined
    }
  }

  _getBuildings() {
    return this._getGlobal('BUILDINGS') || {}
  }

  _getBuilding(buildingId) {
    const buildings = this._getBuildings()
    return buildings[buildingId] || null
  }

  _getCategoryMeta(categoryKey) {
    const lang = this._getLang()
    const map = {
      ritual: { zh: '礼仪政治', en: 'Ritual Politics' },
      living: { zh: '起居生活', en: 'Living Quarters' },
      culture: { zh: '休闲文化', en: 'Culture & Leisure' },
      worship: { zh: '祭祀宗教', en: 'Worship & Ritual' },
      decor: { zh: '装饰景观', en: 'Decor & Landscape' },
      gate: { zh: '宫门城门', en: 'Gates & Portals' }
    }
    const item = map[categoryKey] || { zh: '功能分类', en: 'Category' }
    return lang === 'en' ? item.en : item.zh
  }

  _renderHeader() {
    if (!this.currentBuilding || !this.header) return
    const lang = this._getLang()
    const title = this.header.querySelector('.building-detail__title')
    const titleEn = this.header.querySelector('.building-detail__title-en')
    if (!title || !titleEn) return

    title.textContent = lang === 'en' ? this.currentBuilding.nameEn : this.currentBuilding.name
    titleEn.textContent = lang === 'en' ? this.currentBuilding.name : this.currentBuilding.nameEn
  }

  _renderActions() {
    if (!this.actions || !this.currentBuilding) return
    const categoryLabel = this._getCategoryMeta(this.currentBuilding.category)
    const lang = this._getLang()

    this.actions.innerHTML = `
      <button class="building-detail__action-btn" data-action="category">${categoryLabel}</button>
      <button class="building-detail__action-btn" data-action="archive">${lang === 'en' ? 'Archive Card' : '档案卡'}</button>
      <button class="building-detail__action-btn" data-action="events">${lang === 'en' ? 'Event Card' : '事件卡'}</button>
    `
  }

  _setActionState(activeBtn) {
    this.actions?.querySelectorAll('.building-detail__action-btn').forEach((btn) => {
      btn.classList.toggle('is-active', btn === activeBtn)
    })
  }

  _setMode(mode) {
    this.currentMode = mode
    if (!this.stageShell) return
    this.stageShell.classList.toggle('stage-mode-video', mode === 'video')
    this.stageShell.classList.toggle('stage-mode-overview', mode === 'overview')
    this.videoStage?.classList.toggle('is-active', mode === 'video')
    this.overviewStage?.classList.toggle('is-active', mode === 'overview')
  }

  async _ensureOverviewMarkup() {
    if (this.svgMarkupCache) return this.svgMarkupCache
    const response = await fetch('assets/images/map/overview.svg')
    if (!response.ok) {
      throw new Error(`overview.svg 加载失败: ${response.status}`)
    }
    this.svgMarkupCache = await response.text()
    return this.svgMarkupCache
  }

  _renderOverviewThumb() {
    const container = this.overlay?.querySelector('#detail-overview-thumb-svg')
    if (!container || !this.svgMarkupCache) return

    container.innerHTML = this.svgMarkupCache
    const svg = container.querySelector('svg')
    if (!svg) return

    svg.classList.add('building-detail__mini-overview-svg')
    svg.style.pointerEvents = 'none'
    this._highlightBuildingInOverview(svg, this.currentBuilding?.id)
  }

  _renderOverviewStageBase() {
    const container = this.overlay?.querySelector('#detail-overview-stage-svg')
    if (!container || !this.svgMarkupCache) return

    container.innerHTML = this.svgMarkupCache
    const svg = container.querySelector('svg')
    if (!svg) return

    svg.classList.add('building-detail__stage-overview-svg')
    svg.style.pointerEvents = 'none'

    const empty = this.overviewStage?.querySelector('.building-detail__overview-stage-empty')
    if (empty) empty.style.display = 'none'
  }

  _findOverviewTargetsByBuildingId(svg, buildingId) {
    if (!svg || !buildingId) return []

    if (typeof scanSVGHotspots === 'function') {
      try {
        const hotspots = scanSVGHotspots(svg) || []
        const matched = hotspots.filter((hotspot) => hotspot.buildingId === buildingId)
        if (matched.length) return matched
      } catch (error) {
        console.warn('BuildingDetail: scanSVGHotspots 在详情概览中扫描失败', error)
      }
    }

    const groups = Array.from(svg.querySelectorAll('g[id]'))
    return groups
      .filter((group) => {
        let resolvedId = group.id
        if (typeof resolveBuildingId === 'function') {
          try {
            resolvedId = resolveBuildingId(group.id)
          } catch (error) {
            resolvedId = group.id
          }
        }
        return resolvedId === buildingId || group.id === buildingId
      })
      .map((group) => ({ group, paths: Array.from(group.querySelectorAll('path')), buildingId }))
  }

  _highlightBuildingInOverview(svg, buildingId) {
    const matched = this._findOverviewTargetsByBuildingId(svg, buildingId)
    matched.forEach((item) => {
      ;(item.paths || []).forEach((path) => {
        path.style.fill = 'rgba(214, 174, 82, 0.34)'
        path.style.stroke = 'rgba(255, 221, 142, 0.95)'
        path.style.strokeWidth = '2.4'
        path.style.filter = 'drop-shadow(0 0 8px rgba(214, 174, 82, 0.55))'
      })
    })
  }

  async _toggleCategoryOverview(btn) {
    if (!this.currentBuilding) return

    const shouldOpenOverview = this.currentMode !== 'overview'
    this._setActionState(shouldOpenOverview ? btn : null)

    if (!shouldOpenOverview) {
      this._setMode('video')
      this._resetCategoryOverviewState()
      return
    }

    this._hideInfoPanel()
    this._setMode('overview')
    await this._animateCategoryOverview(this.currentBuilding.category)
  }

  _resetCategoryOverviewState() {
    if (this.activeCategoryTimeline) {
      this.activeCategoryTimeline.kill()
      this.activeCategoryTimeline = null
    }

    const svg = this.overviewStage?.querySelector('svg')
    if (!svg) return

    svg.querySelectorAll('g[id], path').forEach((el) => {
      el.style.opacity = ''
      el.style.filter = ''
      el.style.transformOrigin = ''
      el.style.transformBox = ''
      el.style.willChange = ''
      if (this.gsap) {
        this.gsap.set(el, { clearProps: 'x,y,scale,rotation,transform' })
      } else {
        el.style.transform = ''
      }
    })
  }

  async _animateCategoryOverview(category) {
    const svg = this.overviewStage?.querySelector('svg')
    if (!svg) return

    this._resetCategoryOverviewState()

    const buildings = Object.values(this._getBuildings())
    const targetIds = new Set(
      buildings
        .filter((item) => item && item.category === category)
        .map((item) => item.id)
    )

    const hotspots = typeof scanSVGHotspots === 'function'
      ? (scanSVGHotspots(svg) || [])
      : this._fallbackScanStageHotspots(svg)

    const targetHotspots = hotspots.filter((hotspot) => targetIds.has(hotspot.buildingId))
    const otherHotspots = hotspots.filter((hotspot) => !targetIds.has(hotspot.buildingId))

    otherHotspots.forEach((hotspot) => {
      const subject = hotspot.group || hotspot.paths?.[0]
      if (!subject) return
      subject.style.opacity = '0.18'
      subject.style.filter = 'grayscale(0.35) blur(0.4px)'
    })

    targetHotspots.forEach((hotspot) => {
      const subject = hotspot.group || hotspot.paths?.[0]
      if (!subject) return
      subject.style.opacity = '1'
      subject.style.filter = 'drop-shadow(0 0 12px rgba(214, 174, 82, 0.55))'
      subject.style.transformBox = 'fill-box'
      subject.style.transformOrigin = 'center center'
      subject.style.willChange = 'transform, filter'

      ;(hotspot.paths || []).forEach((path) => {
        path.style.fill = 'rgba(214, 174, 82, 0.30)'
        path.style.stroke = 'rgba(255, 232, 166, 0.98)'
        path.style.strokeWidth = '2.4'
      })
    })

    if (!this.gsap || !targetHotspots.length) return

    const tl = this.gsap.timeline()
    this.activeCategoryTimeline = tl

    targetHotspots.forEach((hotspot, index) => {
      const subject = hotspot.group || hotspot.paths?.[0]
      if (!subject) return
      tl.fromTo(subject,
        { scale: 1, y: 0 },
        {
          scale: 1.08,
          y: -8,
          duration: 0.48,
          ease: 'back.out(1.7)',
          yoyo: true,
          repeat: -1,
          repeatDelay: 0.12
        },
        index * 0.1
      )
    })
  }

  _fallbackScanStageHotspots(svg) {
    const groups = Array.from(svg.querySelectorAll('g[id]'))
    return groups
      .map((group) => {
        const paths = Array.from(group.querySelectorAll('path'))
        if (!paths.length) return null
        let buildingId = group.id
        if (typeof resolveBuildingId === 'function') {
          try {
            buildingId = resolveBuildingId(group.id)
          } catch (error) {
            buildingId = group.id
          }
        }
        return { group, paths, buildingId, svgId: group.id }
      })
      .filter(Boolean)
  }

  async _loadVideo(options = {}) {
    if (!this.video || !this.currentBuilding) return

    const { preserveTime = true, withFrameStrip = false } = options
    const nextTime = preserveTime ? this.currentTime : 0
    const path = this._getVideoPath(this.isExternalView)
    const loadingEl = this.overlay.querySelector('.building-detail__video-loading')
    const loadingText = loadingEl?.querySelector('.building-detail__video-loading-text')
    const placeholder = this.overlay.querySelector('.building-detail__video-placeholder')
    const placeholderPath = placeholder?.querySelector('.building-detail__placeholder-path')
    const haloText = this.halo?.querySelector('.building-detail__video-halo-text')

    if (haloText) haloText.textContent = this.isExternalView ? '外' : '内'
    this.halo?.classList.toggle('is-external', this.isExternalView)
    this.halo?.classList.toggle('is-internal', !this.isExternalView)

    if (placeholderPath) placeholderPath.textContent = path
    loadingText && (loadingText.textContent = this._getLang() === 'en' ? 'Loading frames…' : '正在加载帧预览…')
    loadingEl && (loadingEl.style.display = 'flex')
    placeholder?.classList.add('is-hidden')

    this.videoReady = false
    this.totalDuration = 0
    this.currentTime = 0
    this._updateTimeDisplay()
    this._updateScrubberProgress()
    this._renderFramePlaceholders()

    const result = await this._prepareVideoElement(path)

    if (!result.ok) {
      loadingEl && (loadingEl.style.display = 'none')
      placeholder?.classList.remove('is-hidden')
      this.video.removeAttribute('src')
      this.video.load()
      return
    }

    this.videoReady = true
    this.totalDuration = Number(this.video.duration) || 0
    this.video.currentTime = Math.min(nextTime, Math.max(this.totalDuration - 0.05, 0))
    this.video.pause()
    this.currentTime = this.video.currentTime
    this._updateTimeDisplay()
    this._updateScrubberProgress()
    this._startFrameUpdate()

    if (withFrameStrip) {
      await this._generateFrameStrip(path)
    }

    loadingEl && (loadingEl.style.display = 'none')
  }

  async _prepareVideoElement(path) {
    return new Promise((resolve) => {
      const cleanup = () => {
        this.video.removeEventListener('loadedmetadata', onLoadedMetadata)
        this.video.removeEventListener('error', onError)
      }

      const onLoadedMetadata = () => {
        cleanup()
        resolve({ ok: true })
      }

      const onError = () => {
        cleanup()
        console.warn('BuildingDetail: 视频路径当前不可用，已保留占位路径', path)
        resolve({ ok: false })
      }

      this.video.addEventListener('loadedmetadata', onLoadedMetadata, { once: true })
      this.video.addEventListener('error', onError, { once: true })
      this.video.src = path
      this.video.load()
    })
  }

  _getVideoPath(isExternal) {
    const name = this.currentBuilding?.name || ''
    const suffix = isExternal ? '外部' : '内部'
    return `assets/videos/buildings/${name}-${suffix}.mp4`
  }

  _renderFramePlaceholders() {
    const container = this.scrubber?.querySelector('.building-detail__scrubber-thumbs')
    if (!container) return

    container.innerHTML = ''
    for (let index = 0; index < this.thumbnailCount; index += 1) {
      const frame = document.createElement('button')
      frame.type = 'button'
      frame.className = 'building-detail__scrubber-thumb-frame is-placeholder'
      frame.dataset.index = String(index)
      frame.innerHTML = `<span>${index + 1}</span>`
      frame.addEventListener('click', () => {
        if (!this.totalDuration || !this.video) return
        const ratio = this.thumbnailCount === 1 ? 0 : index / (this.thumbnailCount - 1)
        this.video.currentTime = ratio * this.totalDuration
        this.currentTime = this.video.currentTime
        this._updateTimeDisplay()
        this._updateScrubberProgress()
        this._updateActiveThumbnail()
      })
      container.appendChild(frame)
    }
  }

  async _generateFrameStrip(path) {
    const container = this.scrubber?.querySelector('.building-detail__scrubber-thumbs')
    if (!container || !this.totalDuration) return

    const shots = await this._captureFrames(path, this.totalDuration, this.thumbnailCount)
    if (!shots.length) return

    container.innerHTML = ''

    shots.forEach((shot, index) => {
      const frame = document.createElement('button')
      frame.type = 'button'
      frame.className = 'building-detail__scrubber-thumb-frame'
      frame.dataset.index = String(index)
      frame.innerHTML = `<img src="${shot.dataUrl}" alt="frame-${index + 1}">`
      frame.addEventListener('click', () => {
        if (!this.video) return
        this.video.currentTime = shot.time
        this.currentTime = this.video.currentTime
        this._updateTimeDisplay()
        this._updateScrubberProgress()
        this._updateActiveThumbnail()
      })
      container.appendChild(frame)
    })

    this._updateActiveThumbnail()
  }

  async _captureFrames(path, duration, count) {
    const sampleVideo = document.createElement('video')
    sampleVideo.muted = true
    sampleVideo.playsInline = true
    sampleVideo.preload = 'auto'
    sampleVideo.src = path

    const ready = await new Promise((resolve) => {
      const onReady = () => resolve(true)
      const onError = () => resolve(false)
      sampleVideo.addEventListener('loadedmetadata', onReady, { once: true })
      sampleVideo.addEventListener('error', onError, { once: true })
      sampleVideo.load()
    })

    if (!ready) return []

    const canvas = document.createElement('canvas')
    const width = 220
    const height = 124
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return []

    const frames = []
    const step = count === 1 ? 0 : duration / (count - 1)

    for (let index = 0; index < count; index += 1) {
      const time = Math.min(Math.max(step * index, 0), Math.max(duration - 0.05, 0))
      const ok = await this._seekVideo(sampleVideo, time)
      if (!ok) continue
      ctx.clearRect(0, 0, width, height)
      ctx.drawImage(sampleVideo, 0, 0, width, height)
      frames.push({ time, dataUrl: canvas.toDataURL('image/jpeg', 0.72) })
    }

    sampleVideo.removeAttribute('src')
    sampleVideo.load()
    return frames
  }

  async _seekVideo(video, time) {
    return new Promise((resolve) => {
      if (Math.abs((video.currentTime || 0) - time) < 0.01) {
        requestAnimationFrame(() => resolve(true))
        return
      }

      const cleanup = () => {
        video.removeEventListener('seeked', onSeeked)
        video.removeEventListener('error', onError)
      }

      const onSeeked = () => {
        cleanup()
        resolve(true)
      }

      const onError = () => {
        cleanup()
        resolve(false)
      }

      video.addEventListener('seeked', onSeeked)
      video.addEventListener('error', onError)

      try {
        video.currentTime = time
      } catch (error) {
        cleanup()
        resolve(false)
      }
    })
  }

  _startFrameUpdate() {
    if (this.frameUpdateTimer) {
      cancelAnimationFrame(this.frameUpdateTimer)
    }

    const update = () => {
      if (!this.video || !this.videoReady) return
      this.currentTime = this.video.currentTime || 0
      this._updateTimeDisplay()
      this._updateScrubberProgress()
      this._updateActiveThumbnail()
      this.frameUpdateTimer = requestAnimationFrame(update)
    }

    this.frameUpdateTimer = requestAnimationFrame(update)
  }

  _updateVideoTime(event) {
    if (!this.video || !this.totalDuration) return
    const track = this.scrubber?.querySelector('.building-detail__scrubber-track')
    if (!track) return

    const rect = track.getBoundingClientRect()
    const point = event.touches?.[0] || event.changedTouches?.[0] || event
    const clientX = point?.clientX
    if (typeof clientX !== 'number') return

    const progress = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    this.video.currentTime = progress * this.totalDuration
    this.currentTime = this.video.currentTime
    this._updateTimeDisplay()
    this._updateScrubberProgress()
    this._updateActiveThumbnail()
  }

  _updateTimeDisplay() {
    const timeEl = this.scrubber?.querySelector('.building-detail__scrubber-time')
    if (!timeEl) return
    timeEl.textContent = `${this._formatTime(this.currentTime)} / ${this._formatTime(this.totalDuration)}`
  }

  _formatTime(seconds) {
    if (!seconds || Number.isNaN(seconds)) return '00:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  _updateScrubberProgress() {
    const progress = this.scrubber?.querySelector('.building-detail__scrubber-progress')
    const thumb = this.scrubber?.querySelector('.building-detail__scrubber-thumb')
    if (!progress || !thumb || !this.totalDuration) {
      if (progress) progress.style.width = '0%'
      if (thumb) thumb.style.left = '0%'
      return
    }

    const percent = Math.max(0, Math.min(100, (this.currentTime / this.totalDuration) * 100))
    progress.style.width = `${percent}%`
    thumb.style.left = `${percent}%`
  }

  _updateActiveThumbnail() {
    const frames = Array.from(this.scrubber?.querySelectorAll('.building-detail__scrubber-thumb-frame') || [])
    if (!frames.length || !this.totalDuration) return
    const index = Math.min(frames.length - 1, Math.floor((this.currentTime / this.totalDuration) * frames.length))
    frames.forEach((frame, frameIndex) => {
      frame.classList.toggle('is-active', frameIndex === index)
    })
  }

  async _toggleView() {
    if (!this.video || this._isSwitchingVideo) return
    this._isSwitchingVideo = true

    const nextState = !this.isExternalView

    if (this.gsap) {
      await new Promise((resolve) => {
        this.gsap.to(this.videoStage, {
          opacity: 0.22,
          duration: 0.22,
          ease: 'power2.out',
          onComplete: resolve
        })
      })
    } else {
      this.videoStage.style.opacity = '0.22'
    }

    this.isExternalView = nextState
    await this._loadVideo({ preserveTime: false, withFrameStrip: true })

    if (this.gsap) {
      await new Promise((resolve) => {
        this.gsap.to(this.videoStage, {
          opacity: 1,
          duration: 0.28,
          ease: 'power2.out',
          onComplete: resolve
        })
      })
    } else {
      this.videoStage.style.opacity = '1'
    }

    this._isSwitchingVideo = false
  }

  _showArchiveCard() {
    if (!this.currentBuilding || !this.infoPanel) return
    const b = this.currentBuilding
    const lang = this._getLang()

    this.infoPanel.classList.remove('is-hidden')
    this.infoPanel.querySelector('.building-detail__info-panel-title').textContent = lang === 'en' ? 'Archive Card' : '档案卡'
    this.infoPanel.querySelector('.building-detail__info-panel-content').innerHTML = `
      <div class="archive-card__section">
        <div class="archive-card__label">${lang === 'en' ? 'Location' : '位置'}</div>
        <div class="archive-card__value">${b.location || '—'}</div>
      </div>
      <div class="archive-card__divider"></div>
      <div class="archive-card__section">
        <div class="archive-card__label">${lang === 'en' ? 'Category' : '功能分类'}</div>
        <div class="archive-card__value">${this._getCategoryMeta(b.category)}</div>
      </div>
      <div class="archive-card__divider"></div>
      <div class="archive-card__section">
        <div class="archive-card__label">${lang === 'en' ? 'Roof Type' : '屋顶形制'}</div>
        <div class="archive-card__value">${lang === 'en' ? (b.roofTypeEn || b.roofType || '—') : (b.roofType || '—')}</div>
      </div>
      <div class="archive-card__divider"></div>
      <div class="archive-card__section">
        <div class="archive-card__label">${lang === 'en' ? 'Built' : '建造年代'}</div>
        <div class="archive-card__value">${lang === 'en' ? (b.builtEn || b.built || '—') : (b.built || '—')}</div>
      </div>
      ${b.rebuilt ? `
        <div class="archive-card__divider"></div>
        <div class="archive-card__section">
          <div class="archive-card__label">${lang === 'en' ? 'Rebuilt' : '重建年代'}</div>
          <div class="archive-card__value">${lang === 'en' ? (b.rebuiltEn || b.rebuilt) : b.rebuilt}</div>
        </div>
      ` : ''}
      <div class="archive-card__divider"></div>
      <div class="archive-card__section">
        <div class="archive-card__label">${lang === 'en' ? 'Materials' : '建筑材料'}</div>
        <div class="archive-card__value">${b.materials || '—'}</div>
      </div>
      <div class="archive-card__divider"></div>
      <div class="archive-card__section">
        <div class="archive-card__label">${lang === 'en' ? 'Archive' : '档案'}</div>
        <div class="archive-card__value">${lang === 'en' ? (b.archiveEn || b.archive || '—') : (b.archive || '—')}</div>
      </div>
    `
  }

  _showEventsCard() {
    if (!this.currentBuilding || !this.infoPanel) return
    const b = this.currentBuilding
    const lang = this._getLang()

    this.infoPanel.classList.remove('is-hidden')
    this.infoPanel.querySelector('.building-detail__info-panel-title').textContent = lang === 'en' ? 'Event Card' : '事件卡'

    if (!Array.isArray(b.events) || !b.events.length) {
      this.infoPanel.querySelector('.building-detail__info-panel-content').innerHTML = `
        <div class="archive-card__value">${lang === 'en' ? 'No event records for now.' : '暂无事件记录。'}</div>
      `
      return
    }

    this.infoPanel.querySelector('.building-detail__info-panel-content').innerHTML = `
      <ul class="event-card__list">
        ${b.events.map((item) => `
          <li class="event-card__item">
            <div class="event-card__year">${item.year || '—'}</div>
            <div class="event-card__desc">${lang === 'en' ? (item.descEn || item.desc || '') : (item.desc || '')}</div>
          </li>
        `).join('')}
      </ul>
    `
  }

  _hideInfoPanel() {
    this.infoPanel?.classList.add('is-hidden')
  }

  _showOverlay() {
    if (!this.overlay) return
    this.overlay.classList.remove('is-hidden')

    if (!this.gsap) return

    const tl = this.gsap.timeline()
    tl.fromTo(this.overlay, { opacity: 0 }, { opacity: 1, duration: 0.24, ease: 'power2.out' })
      .fromTo(this.stageShell, { y: 26, scale: 0.965, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.48, ease: 'power3.out' }, '-=0.06')
      .fromTo(this.header, { opacity: 0, y: -18 }, { opacity: 1, y: 0, duration: 0.36, ease: 'power2.out' }, '-=0.28')
      .fromTo(this.overviewThumb, { opacity: 0, x: -18, y: -18 }, { opacity: 1, x: 0, y: 0, duration: 0.34, ease: 'power2.out' }, '-=0.28')
  }

  close() {
    if (this.frameUpdateTimer) {
      cancelAnimationFrame(this.frameUpdateTimer)
      this.frameUpdateTimer = null
    }

    this._resetCategoryOverviewState()
    this._hideInfoPanel()

    if (this.actions) {
      this.actions.querySelectorAll('.building-detail__action-btn').forEach((btn) => {
        btn.classList.remove('is-active')
      })
    }

    const finish = () => {
      this.overlay.classList.add('is-hidden')
      this.overlay.style.opacity = ''
      this.stageShell && (this.stageShell.style.opacity = '')
      this.stageShell && (this.stageShell.style.transform = '')
      this.currentBuilding = null
      this.videoReady = false
      this.currentTime = 0
      this.totalDuration = 0
      this.currentMode = 'video'
      this.isExternalView = true
      if (this.video) {
        this.video.pause()
        this.video.removeAttribute('src')
        this.video.load()
      }
      window.dispatchEvent(new CustomEvent('building-detail:closed'))
    }

    if (this.gsap) {
      this.gsap.to(this.overlay, {
        opacity: 0,
        duration: 0.24,
        ease: 'power2.in',
        onComplete: finish
      })
    } else {
      finish()
    }
  }
}

window.BuildingDetail = BuildingDetail
