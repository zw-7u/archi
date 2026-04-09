/* =====================================================
   js/module2.js — 中轴礼序 交互模块
   依赖：app.js (state, els, pick, isZh, escapeHTML, thoughtHotspots,
               renderThoughtModule, getBuilding, toStagePos, THOUGHT_TABS,
               getThoughtVideoCandidates, encodeAssetPath)
         module2-data.js (AXIS_MODES, AXIS_MODE_ORDER, AXIS_SEQUENCE,
               AXIS_TRACK_NODES, AXIS_REGION_DATA,
               AXIS_VIDEO_PATH, COURT_COLORS)
   ===================================================== */

;(function () {
  'use strict'

  /* ---------- 模块内部状态 ---------- */
  const m2 = {
    activeMode: 'ritual',
    activeRegion: 'taihedian',
    _leftPanelsInjected: false,
    _trackPanel: null,
  }

  window._m2State = m2

  /* ---------- 初始化数据 ---------- */
  const M2_AXIS_NODE_SET = new Set(AXIS_SEQUENCE)
  const M2_RITUAL_CORE_SET = new Set(['taihedian', 'baohedian'])
  const M2_RITUAL_SECONDARY_SET = new Set(['taiheimen', 'qianqingmen'])
  const M2_OUTER_SET = new Set(['wumen', 'taiheimen', 'taihedian', 'baohedian'])
  const M2_INNER_SET = new Set(['qianqinggong', 'kunninggong', 'yuhuayuan'])
  const M2_DIVIDER_ID = 'qianqingmen'
  const M2_MODE_META = {
    ritual: {
      labelZh: '礼制秩序',
      labelEn: 'Ritual Order',
      summaryZh: '双层金带强调中轴等级，太和门至保和殿形成礼制核心带。',
      summaryEn: 'A dual gold axis emphasizes hierarchy, with a ritual core band between Taihemen and Baohedian.',
      tint: '#c18a3b',
      softTint: '#8a7453',
    },
    progression: {
      labelZh: '由外入内',
      labelEn: 'Outside In',
      summaryZh: '暖金光点沿午门至御花园北移，已过节点保留余光。',
      summaryEn: 'A warm gold orb travels northward while passed nodes retain a lower glow.',
      tint: '#d5a04a',
      softTint: '#8e7856',
    },
    courtLiving: {
      labelZh: '前朝后寝',
      labelEn: 'Court and Residence',
      summaryZh: '午门至保和殿为前朝暖金段，乾清门以北转为后寝淡玉灰段。',
      summaryEn: 'The outer court glows warm gold while the northern residence shifts to a calm muted tint.',
      tint: '#8b7a64',
      softTint: '#6f7c72',
    },
  }

  /* ---------- 工具函数 ---------- */
  function getMode() {
    return AXIS_MODES[m2.activeMode] || AXIS_MODES.ritual
  }

  function getRegion() {
    if (!M2_AXIS_NODE_SET.has(m2.activeRegion)) return AXIS_REGION_DATA.taihedian
    return AXIS_REGION_DATA[m2.activeRegion] || AXIS_REGION_DATA.taihedian
  }

  function seqIndex(id) { return AXIS_SEQUENCE.indexOf(id) }
  function getTabsContainer() { return document.getElementById('thought-secondary-tabs') }

  function cleanupAxisUiClasses() {
    const container = getTabsContainer()
    if (!container) return
    container.classList.remove('axis-tabs-active')
    container.classList.remove('yy-tabs-active')
    const controlCard = container.closest('.thought-control-card')
    if (controlCard) {
      controlCard.classList.remove('axis-control-active')
      controlCard.classList.remove('yy-control-active')
    }
    const detailCol = container.closest('.thought-detail-column')
    if (detailCol) {
      detailCol.classList.remove('axis-detail-active')
      detailCol.classList.remove('yy-detail-active')
    }
  }

  function syncAxisUiClasses() {
    const container = getTabsContainer()
    if (!container) return
    cleanupAxisUiClasses()
    container.classList.add('axis-tabs-active')
    const controlCard = container.closest('.thought-control-card')
    if (controlCard) controlCard.classList.add('axis-control-active')
    const detailCol = container.closest('.thought-detail-column')
    if (detailCol) detailCol.classList.add('axis-detail-active')
  }

  function encodeAssetPath(path) {
    if (!path || path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) return path
    const i = path.lastIndexOf('/')
    const dir = i >= 0 ? path.slice(0, i + 1) : ''
    const file = i >= 0 ? path.slice(i + 1) : path
    return dir + encodeURIComponent(file)
  }

  function escapeHTML(value) {
    return String(value || '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;')
  }

  function getThoughtSvgMetrics() {
    const svg = document.querySelector('#thought-svg-host svg')
    const vb = svg?.viewBox?.baseVal
    if (vb && Number.isFinite(vb.width) && Number.isFinite(vb.height) && vb.width > 0 && vb.height > 0) {
      return { x: vb.x || 0, y: vb.y || 0, width: vb.width, height: vb.height }
    }
    return { x: 0, y: 0, width: SVG_WIDTH, height: SVG_HEIGHT }
  }

  function toStagePercentPos(x, y) {
    const metrics = getThoughtSvgMetrics()
    return {
      left: `${((x - metrics.x) / metrics.width) * 100}%`,
      top: `${((y - metrics.y) / metrics.height) * 100}%`,
    }
  }

  function getHotspotCenter(buildingId) {
    if (typeof thoughtHotspots !== 'undefined' && Array.isArray(thoughtHotspots)) {
      const hotspot = thoughtHotspots.find((item) => item.buildingId === buildingId)
      const node = hotspot?.group || hotspot?.sourceEl || hotspot?.overlayEl
      if (node && typeof node.getBBox === 'function') {
        try {
          const bbox = node.getBBox()
          if (
            bbox &&
            Number.isFinite(bbox.x) &&
            Number.isFinite(bbox.y) &&
            Number.isFinite(bbox.width) &&
            Number.isFinite(bbox.height)
          ) {
            return { x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height / 2 }
          }
        } catch (error) {
          // SVG bbox can fail while the host is still being replaced; fall back to static data.
        }
      }
    }
    return null
  }

  function getAxisStagePos(buildingId) {
    const center = getHotspotCenter(buildingId)
    return center ? toStagePercentPos(center.x, center.y) : toStagePos(buildingId)
  }

  /* ---------- 左侧面板注入 ---------- */
  function ensureLeftPanels() {
    const col = document.querySelector('.thought-side-column')
    if (!col) return

    if (!m2._leftPanelsInjected) {
      const track = document.createElement('div')
      track.className = 'panel-card m2-track-panel'
      track.id = 'm2-track-panel'
      track.innerHTML = `
        <div class="m2-track-panel__head">
          <span class="panel-head__eyebrow">宫城脉络</span>
          <h3 class="thought-card-title">路径位置</h3>
        </div>
        <div class="m2-track-panel__body" id="m2-track-body"></div>
      `
      const oldDial = document.getElementById('m2-ritual-dial')
      if (oldDial) oldDial.remove()
      col.appendChild(track)
      m2._trackPanel = track
      m2._leftPanelsInjected = true
    }

    const sideCard = col.querySelector('.thought-side-card')
    const yyDial = document.getElementById('yy-dial-yinyang')
    const wxDial = document.getElementById('yy-dial-wuxing')
    if (state.thoughtTab === 'axis') {
      col.classList.add('axis-active')
      col.classList.remove('yy-active')
      if (sideCard) sideCard.style.display = 'none'
      if (m2._trackPanel) m2._trackPanel.style.display = ''
      if (yyDial) yyDial.style.display = 'none'
      if (wxDial) wxDial.style.display = 'none'
    } else {
      col.classList.remove('axis-active')
      if (sideCard) sideCard.style.display = ''
      if (m2._trackPanel) m2._trackPanel.style.display = 'none'
      cleanupAxisUiClasses()
    }
  }

  /* ---------- 计算函数 ---------- */
  function m2Percent(value) {
    return Number.parseFloat(String(value || '0').replace('%', '')) || 0
  }

  function m2GetAxisPoint(buildingId) {
    const pos = getAxisStagePos(buildingId)
    return {
      left: pos.left,
      top: pos.top,
      leftNum: m2Percent(pos.left),
      topNum: m2Percent(pos.top),
    }
  }

  function m2GetAxisMetrics(ids = AXIS_SEQUENCE, pad = 4.2) {
    const points = ids.map(m2GetAxisPoint)
    const leftNum = points.reduce((sum, point) => sum + point.leftNum, 0) / Math.max(points.length, 1)
    const topNum = Math.max(Math.min(...points.map((point) => point.topNum)) - pad, 3)
    const bottomNum = Math.min(Math.max(...points.map((point) => point.topNum)) + pad, 97)
    return {
      left: `${leftNum}%`,
      top: `${topNum}%`,
      height: `${bottomNum - topNum}%`,
      leftNum,
      topNum,
      bottomNum,
    }
  }

  function m2GetSegmentMetrics(startId, endId, pad = 2.6) {
    const start = m2GetAxisPoint(startId)
    const end = m2GetAxisPoint(endId)
    const topNum = Math.max(Math.min(start.topNum, end.topNum) - pad, 3)
    const bottomNum = Math.min(Math.max(start.topNum, end.topNum) + pad, 97)
    return {
      top: `${topNum}%`,
      height: `${bottomNum - topNum}%`,
      topNum,
      bottomNum,
    }
  }

  function m2GetModeMeta(modeId) {
    return M2_MODE_META[modeId] || M2_MODE_META.ritual
  }

  function m2GetRegionLabel(regionId) {
    const region = AXIS_REGION_DATA[regionId]
    if (!region) return ''
    return pick(region.nameZh, region.nameEn)
  }

  function m2GetRitualTier(regionId) {
    if (M2_RITUAL_CORE_SET.has(regionId)) return 'core'
    if (M2_RITUAL_SECONDARY_SET.has(regionId)) return 'secondary'
    return 'soft'
  }

  function m2GetCourtZone(regionId) {
    if (regionId === M2_DIVIDER_ID) return 'divider'
    if (M2_OUTER_SET.has(regionId)) return 'outer'
    return 'inner'
  }

  function m2GetProgressState(regionId) {
    const index = seqIndex(regionId)
    const activeIndex = seqIndex(m2.activeRegion)
    if (index < activeIndex) return 'past'
    if (index === activeIndex) return 'current'
    return 'future'
  }

  function m2GetRegionTail(modeId, regionId) {
    const region = AXIS_REGION_DATA[regionId]
    if (!region) return { zh: '宫城中轴', en: 'Central Axis' }

    return {
      zh: `${region.nameZh} · ${region.roleZh}`,
      en: `${region.nameEn} · ${region.roleEn}`,
    }
  }

  function m2GetNarrative(modeId, regionId) {
    const region = AXIS_REGION_DATA[regionId] || AXIS_REGION_DATA.taihedian
    const meta = m2GetModeMeta(modeId)

    if (modeId === 'progression') {
      const step = seqIndex(regionId) + 1
      return {
        focusZh: `第${step}站`,
        focusEn: `Stop ${step}`,
        leadZh: `${region.nameZh}位于"午门至御花园"的第${step}段递进路径中。暖金光点向北推进时，它之前的节点保留余光，之后的节点维持淡亮，因此整张图会呈现出清晰的入宫节奏。`,
        leadEn: `${region.nameEn} is stop ${step} on the route from the Meridian Gate to the Imperial Garden. Passed nodes remain softly lit while upcoming ones stay faint.`,
        summaryZh: meta.summaryZh,
        summaryEn: meta.summaryEn,
      }
    }

    if (modeId === 'courtLiving') {
      const zone = m2GetCourtZone(regionId)
      if (zone === 'divider') {
        return {
          focusZh: '前后分界',
          focusEn: 'Spatial Divider',
          leadZh: `${region.nameZh}是前朝与后寝的分界节点。它既承接南侧公开朝仪的秩序，也把北侧起居空间单独区分出来，因此在同图中会被单独强化显示。`,
          leadEn: `${region.nameEn} marks the divide between the outer court and the inner residence, so it is emphasized as a boundary node on the shared overview map.`,
          summaryZh: meta.summaryZh,
          summaryEn: meta.summaryEn,
        }
      }

      if (zone === 'outer') {
        return {
          focusZh: '前朝段',
          focusEn: 'Outer Court',
          leadZh: `${region.nameZh}位于午门至保和殿之间的前朝段。这里以暖金光带与轻暖罩染强化公共礼仪的庄重感，强调它服务于朝会与国家礼制的空间属性。`,
          leadEn: `${region.nameEn} belongs to the outer court segment. A warm gold wash reinforces its role in public ritual and ceremony.`,
          summaryZh: meta.summaryZh,
          summaryEn: meta.summaryEn,
        }
      }

      return {
        focusZh: '后寝段',
        focusEn: 'Inner Residence',
        leadZh: `${region.nameZh}位于乾清门以北的后寝段。这里改用浅棕灰金与淡玉灰的安静高亮，让空间重心从公开朝仪转向起居、内廷与更私密的秩序。`,
        leadEn: `${region.nameEn} sits north of the divider within the residential court. A calmer muted glow shifts attention from public ritual to private order.`,
        summaryZh: meta.summaryZh,
        summaryEn: meta.summaryEn,
      }
    }

    const tier = m2GetRitualTier(regionId)
    if (tier === 'core') {
      return {
        focusZh: '朝仪中心',
        focusEn: 'Ceremonial Center',
        leadZh: `${region.nameZh}与另一座核心殿宇共同构成外朝礼仪的中心段落。双层金轴与礼制核心带把它稳稳托出，强调它在朝会、颁诏与国家典礼中的中心位置。`,
        leadEn: `${region.nameEn} joins the paired ceremonial halls at the center of state ritual. The dual gold axis and ceremonial band reinforce its role in major court rites.`,
        summaryZh: meta.summaryZh,
        summaryEn: meta.summaryEn,
      }
    }

    if (tier === 'secondary') {
      return {
        focusZh: '礼序承转',
        focusEn: 'Ritual Transition',
        leadZh: `${region.nameZh}承担由门入殿、由前场入核心的转承作用。它把礼序的节奏一层层推向中心，使中轴不只是直线，而是一段有起承递进的礼仪过程。`,
        leadEn: `${region.nameEn} transfers the ceremonial rhythm from gate to hall, carrying the sequence inward toward the center.`,
        summaryZh: meta.summaryZh,
        summaryEn: meta.summaryEn,
      }
    }

    return {
      focusZh: '轴线陪位',
      focusEn: 'Axial Support',
      leadZh: `${region.nameZh}作为完整中轴叙事中的陪位节点，负责把礼制线索延续成连续空间。它不争夺中心，却让门、殿、宫、园之间的礼序关系读起来更完整。`,
      leadEn: `${region.nameEn} supports the continuity of the axis, keeping the ceremonial sequence legible without competing for the center.`,
      summaryZh: meta.summaryZh,
      summaryEn: meta.summaryEn,
    }
  }

  /** 单条南北中轴线 + 从午门起沿轴线移动的光球 */
  function m2RenderAxisBands() {
    const axis = m2GetAxisMetrics()
    const startPoint = m2GetAxisPoint(AXIS_SEQUENCE[0])
    const activeId = m2.activeMode === 'ritual'
      ? AXIS_SEQUENCE[AXIS_SEQUENCE.length - 1]
      : (M2_AXIS_NODE_SET.has(m2.activeRegion) ? m2.activeRegion : AXIS_SEQUENCE[0])
    const endPoint = m2GetAxisPoint(activeId)
    return `
      <div class="m2-axis-line" style="left:${axis.left};top:${axis.top};height:${axis.height};"></div>
      <span class="m2-progress-orb" style="left:${axis.left};top:${startPoint.top};--m2-progress-start:${startPoint.top};--m2-progress-end:${endPoint.top};"></span>
    `
  }

  function renderTrack() {
    const card = document.getElementById('m2-track-panel')
    const body = document.getElementById('m2-track-body')
    if (!card || !body) return

    const eyebrow = card.querySelector('.panel-head__eyebrow')
    const title = card.querySelector('.thought-card-title')
    if (eyebrow) eyebrow.textContent = pick('宫城脉络', 'Axis Lineage')
    if (title) title.textContent = pick('路径位置', 'Axis Route')

    const activeIndex = seqIndex(m2.activeRegion)
    const displayNodes = [...AXIS_TRACK_NODES].reverse()
    const nodesHTML = displayNodes.map((regionId) => {
      const region = AXIS_REGION_DATA[regionId]
      if (!region) return ''

      const currentClass = regionId === m2.activeRegion ? ' is-current' : ''
      const reachedClass = m2.activeMode === 'progression' && seqIndex(regionId) < activeIndex ? ' is-reached' : ''
      const ritualTier = m2.activeMode === 'ritual' ? ` is-${m2GetRitualTier(regionId)}` : ''
      const courtZone = m2.activeMode === 'courtLiving' ? ` is-${m2GetCourtZone(regionId)}` : ''

      return `
        <div class="m2-track-node${currentClass}${reachedClass}${ritualTier}${courtZone}" data-m2-track="${regionId}">
          <span class="m2-track-node__label">${escapeHTML(pick(region.nameZh, region.nameEn))}</span>
          <span class="m2-track-node__meta">${escapeHTML(pick(region.roleZh, region.roleEn))}</span>
        </div>
      `
    }).join('')

    body.innerHTML = `<div class="m2-track-list">${nodesHTML}</div>`
    body.querySelectorAll('[data-m2-track]').forEach((el) => {
      el.addEventListener('click', () => selectRegion(el.dataset.m2Track))
    })
  }

  function renderSecondaryTabs() {
    const container = document.getElementById('thought-secondary-tabs')
    if (!container) return
    syncAxisUiClasses()

    container.innerHTML = AXIS_MODE_ORDER.map((modeId) => {
      const meta = m2GetModeMeta(modeId)
      return `
        <button class="thought-secondary-tab m2-mode-btn${m2.activeMode === modeId ? ' active' : ''}"
                type="button"
                data-m2-mode="${modeId}"
                aria-pressed="${String(m2.activeMode === modeId)}"
                title="${escapeHTML(pick(meta.labelZh, meta.labelEn))}">
          <span class="thought-secondary-tab__main">${escapeHTML(pick(meta.labelZh, meta.labelEn))}</span>
        </button>
      `
    }).join('')

    container.querySelectorAll('[data-m2-mode]').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        event.preventDefault()
        event.stopPropagation()
        selectMode(btn.dataset.m2Mode)
      })
    })
  }

  function renderStatusList() {
    const container = document.getElementById('thought-status-list')
    if (!container) return

    const meta = m2GetModeMeta(m2.activeMode)
    const tail = m2GetRegionTail(m2.activeMode, m2.activeRegion)
    const items = [
      { label: pick('当前模式', 'Current Mode'), color: '#caa067' },
      { label: pick(meta.labelZh, meta.labelEn), color: meta.tint },
      { label: pick(tail.zh, tail.en), color: meta.softTint },
    ]

    container.innerHTML = items.map((item) => `
      <span class="thought-status-item">
        <span class="thought-status-item__dot" style="--dot-color:${item.color};"></span>
        ${escapeHTML(item.label)}
      </span>
    `).join('')
  }

  function renderMedia() {
    const body = document.getElementById('thought-media-body')
    const eyebrow = document.getElementById('thought-media-eyebrow')
    const title = document.getElementById('thought-media-title')
    if (!body) return
    if (eyebrow) eyebrow.textContent = pick('礼序长卷', 'Ritual Scroll')
    if (title) title.textContent = pick('中轴礼序', 'Central Axis Order')

    const exts = ['mp4', 'webm', 'mov']
    const mimeMap = { mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime' }
    const pathBases = [AXIS_VIDEO_PATH, 'assets/videos/culture/中轴礼序']
    const sources = []
    pathBases.forEach((base) => {
      exts.forEach((ext) => {
        sources.push({ src: encodeAssetPath(`${base}.${ext}`), type: mimeMap[ext] })
      })
    })
    const primary = sources[0].src
    const lightboxSrcs = sources.map((s) => s.src).join('|')
    const poster = encodeAssetPath('assets/images/buildings/太和殿.jpg')

    body.innerHTML = `
      <article class="thought-video-card">
        <div class="thought-video-frame thought-video-frame--axis"
             data-video-lightbox-src="${escapeHTML(primary)}"
             data-video-lightbox-srcs="${escapeHTML(lightboxSrcs)}"
             data-video-label="${escapeHTML(pick('中轴礼序', 'Central Axis Order'))}"
             role="button" tabindex="0"
             aria-label="${escapeHTML(pick('放大查看视频', 'Open video preview'))}">
          <video class="thought-video-frame__media" controls playsinline preload="metadata" poster="${escapeHTML(poster)}">
            ${sources.map((s) => `<source src="${escapeHTML(s.src)}" type="${s.type}">`).join('')}
          </video>
          <div class="thought-video-frame__fallback" style="display:none;">
            <span class="thought-video-frame__fallback-icon" aria-hidden="true">▶</span>
            <span class="thought-video-frame__fallback-text">${escapeHTML(pick(
              '未找到视频文件。请将 MP4/WebM 放入 assets/videos/culture/ 下，命名为 axis-order 或 中轴礼序。',
              'No video file found. Add axis-order or 中轴礼序 under assets/videos/culture/.',
            ))}</span>
          </div>
          <span class="thought-video-frame__overlay">
            <span class="thought-video-frame__play">${pick('放大查看', 'Expand')}</span>
          </span>
        </div>
        <div class="thought-video-meta">
          <div class="thought-video-meta__title">${pick('中轴礼序', 'Central Axis Ritual Order')}</div>
          <p class="thought-video-meta__body">${pick(
            '以南北中轴为主线，把礼制、权力与空间节奏压缩进一条可感知的路径中。点击可放大查看全屏播放。',
            'A single north-south line condenses ritual hierarchy, imperial power, and spatial cadence. Click to expand and watch in fullscreen.',
          )}</p>
          <code class="thought-video-meta__path">${escapeHTML(primary)}</code>
        </div>
      </article>
    `

    const video = body.querySelector('.thought-video-frame__media')
    const fallback = body.querySelector('.thought-video-frame__fallback')
    const showFallback = () => {
      if (video) video.style.display = 'none'
      if (fallback) {
        fallback.removeAttribute('hidden')
        fallback.style.display = 'flex'
      }
    }
    if (video && fallback) {
      video.addEventListener('error', showFallback, { once: true })
    }
  }

  function renderTextCard() {
    const body = document.getElementById('thought-text-body')
    const eyebrow = document.getElementById('thought-text-eyebrow')
    const title = document.getElementById('thought-text-title')
    if (!body) return

    const mode = getMode()
    const region = getRegion()
    const meta = m2GetModeMeta(mode.id)
    const narrative = m2GetNarrative(mode.id, m2.activeRegion)

    if (eyebrow) eyebrow.textContent = pick('建筑解读', 'Interpretation')
    if (title) title.textContent = pick(region.nameZh, region.nameEn)

    body.innerHTML = `
      <div class="m2-interpret-card">
        <div class="m2-interpret-card__mode-row">
          <span class="m2-interpret-card__mode">${escapeHTML(pick(meta.labelZh, meta.labelEn))}</span>
          <span class="m2-interpret-card__focus">${escapeHTML(pick(narrative.focusZh, narrative.focusEn))}</span>
        </div>
        <div class="m2-interpret-card__name">${escapeHTML(pick(region.nameZh, region.nameEn))}</div>
        <span class="m2-interpret-card__role">${escapeHTML(pick(region.roleZh, region.roleEn))}</span>
        <p class="m2-interpret-card__lead">${escapeHTML(pick(narrative.leadZh, narrative.leadEn))}</p>
        <p class="m2-interpret-card__subtitle">${escapeHTML(pick(region.subtitleZh, region.subtitleEn))}</p>
        <p class="m2-interpret-card__desc">${escapeHTML(pick(region.descZh, region.descEn))}</p>
      </div>
    `
  }

  function renderStageDecor() {
    const decor = document.getElementById('thought-stage-decor')
    if (!decor) return
    decor.innerHTML = m2RenderAxisBands()
  }

  function renderMapHighlights() {
    if (typeof thoughtHotspots === 'undefined') return

    thoughtHotspots.forEach((hotspot) => {
      const node = hotspot.overlayEl
      if (!node) return

      node.classList.remove(
        'm2-highlight',
        'm2-highlight-outer',
        'm2-highlight-inner',
        'm2-highlight-divider',
        'm2-dim',
        'm2-selected',
        'm2-hover',
        'thought-highlight',
        'is-hovered',
        'is-selected',
        'm2-map-off-axis',
        'm2-map-ritual-core',
        'm2-map-ritual-secondary',
        'm2-map-ritual-soft',
        'm2-map-progress-past',
        'm2-map-progress-current',
        'm2-map-progress-future',
        'm2-map-court-outer',
        'm2-map-court-divider',
        'm2-map-court-inner',
        'm2-map-selected',
        'm2-map-hover'
      )

      if (!M2_AXIS_NODE_SET.has(hotspot.buildingId)) {
        node.classList.add('m2-map-off-axis')
        return
      }

      if (m2.activeMode === 'progression') {
        node.classList.add(`m2-map-progress-${m2GetProgressState(hotspot.buildingId)}`)
      } else if (m2.activeMode === 'courtLiving') {
        node.classList.add(`m2-map-court-${m2GetCourtZone(hotspot.buildingId)}`)
      } else {
        node.classList.add(`m2-map-ritual-${m2GetRitualTier(hotspot.buildingId)}`)
      }

      if (hotspot.buildingId === m2.activeRegion) {
        node.classList.add('m2-map-selected')
      }

      if (state.thoughtHoveredHotspotId === hotspot.hotspotId) {
        node.classList.add('m2-map-hover')
      }
    })
  }

  /* ---------- 总渲染 ---------- */
  function renderAxisModule() {
    ensureLeftPanels()
    if (state.thoughtTab !== 'axis') return

    syncAxisUiClasses()
    renderTrack()
    renderSecondaryTabs()
    renderStatusList()
    renderMedia()
    renderTextCard()
    renderStageDecor()
    renderMapHighlights()
    hookThoughtHotspots()

    const stageTitle = document.getElementById('thought-stage-title')
    const stageHint = document.getElementById('thought-stage-hint')
    const controlTitle = document.getElementById('thought-control-title')
    const controlEyebrow = document.getElementById('thought-control-eyebrow')
    const mediaEyebrow = document.getElementById('thought-media-eyebrow')
    const mediaTitle = document.getElementById('thought-media-title')

    if (stageTitle) stageTitle.textContent = pick('中轴总览图', 'Axis Overview Map')
    if (stageHint) {
      stageHint.textContent = pick(
        '三个按钮切换同一张总览图的观看方式，点击节点查看联动解读。',
        'Use the three buttons to switch how the same overview map is read, then click any node for linked interpretation.'
      )
    }
    if (controlTitle) controlTitle.textContent = pick('同图切换', 'Shared Modes')
    if (controlEyebrow) controlEyebrow.textContent = pick('中轴总览', 'Axis Overview')
    if (mediaEyebrow) mediaEyebrow.textContent = pick('中轴长卷', 'Axis Scroll')
    if (mediaTitle) mediaTitle.textContent = pick('同图联动', 'Linked Overview')
  }

  function renderSecondaryTabsOnly() {
    if (state.thoughtTab !== 'axis') return
    renderSecondaryTabs()
  }

  /* ---------- 交互操作 ---------- */
  function selectMode(modeId) {
    if (!AXIS_MODES[modeId]) return
    m2.activeMode = modeId
    if (!AXIS_REGION_DATA[m2.activeRegion] || !M2_AXIS_NODE_SET.has(m2.activeRegion)) {
      m2.activeRegion = AXIS_MODES[modeId].defaultRegion
    }
    renderAxisModule()
  }

  function selectRegion(regionId) {
    if (!AXIS_REGION_DATA[regionId] || !M2_AXIS_NODE_SET.has(regionId)) return
    m2.activeRegion = regionId
    state.thoughtSelectedBuilding = regionId
    renderAxisModule()
  }

  /* ---------- 接入 thought 系统 ---------- */
  let _m2RafId = 0

  function refreshAxisStageFromHotspots() {
    if (state.module === 'thought' && state.thoughtTab === 'axis') {
      renderStageDecor()
      renderMapHighlights()
    }
  }

  function scheduleAxisOverride() {
    cancelAnimationFrame(_m2RafId)
    _m2RafId = requestAnimationFrame(() => {
      if (state.module === 'thought' && state.thoughtTab === 'axis') {
        renderAxisModule()
      }
    })
  }

  function applyPatches() {
    document.addEventListener('click', (e) => {
      const tabBtn = e.target.closest('[data-thought-tab]')
      if (tabBtn) {
        const nextTab = tabBtn.dataset.thoughtTab
        setTimeout(() => {
          if (nextTab === 'axis') {
            m2.activeMode = 'ritual'
            m2.activeRegion = 'taihedian'
            scheduleAxisOverride()
          } else {
            ensureLeftPanels()
            cleanupAxisUiClasses()
          }
        }, 50)
      }
    }, true)
    setTimeout(scheduleAxisOverride, 300)
  }

  function rebindHotspotsForAxis() {
    const host = document.getElementById('thought-svg-host')
    if (!host) return

    const observer = new MutationObserver(() => {
      if (host.querySelector('svg') && typeof thoughtHotspots !== 'undefined') {
        observer.disconnect()
        hookThoughtHotspots()
        refreshAxisStageFromHotspots()
      }
    })
    observer.observe(host, { childList: true, subtree: true })

    if (host.querySelector('svg') && typeof thoughtHotspots !== 'undefined') {
      observer.disconnect()
      hookThoughtHotspots()
      refreshAxisStageFromHotspots()
    }
  }

  function hookThoughtHotspots() {
    if (typeof thoughtHotspots === 'undefined') {
      setTimeout(hookThoughtHotspots, 100)
      return
    }
    const axisSet = new Set(AXIS_SEQUENCE)

    thoughtHotspots.forEach(hotspot => {
      if (!axisSet.has(hotspot.buildingId)) return

      const targetEls = hotspot.paths.length ? hotspot.paths : []
      targetEls.forEach(path => {
        if (path.dataset.m2Bound) return
        path.dataset.m2Bound = '1'
        path.addEventListener('click', (e) => {
          if (state.thoughtTab === 'axis') {
            e.stopImmediatePropagation()
            selectRegion(hotspot.buildingId)
          }
        }, true)
      })

      if (hotspot.customPath && hotspot.sourceEl) {
        if (hotspot.sourceEl.dataset.m2Bound) return
        hotspot.sourceEl.dataset.m2Bound = '1'
        hotspot.sourceEl.addEventListener('click', (e) => {
          if (state.thoughtTab === 'axis') {
            e.stopImmediatePropagation()
            selectRegion(hotspot.buildingId)
          }
        }, true)
      }
    })
  }

  /* ---------- 初始化 ---------- */
  function initModule2() {
    applyPatches()
    rebindHotspotsForAxis()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(initModule2, 200))
  } else {
    setTimeout(initModule2, 200)
  }

  window.Module2 = {
    selectMode,
    selectRegion,
    render: renderAxisModule,
    renderSecondaryTabsOnly,
    refreshMapHighlights: renderMapHighlights,
    state: m2,
  }

})()
