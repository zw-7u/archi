/* =====================================================
   js/module2.js — 中轴礼序 交互模块
   依赖：app.js (state, els, pick, isZh, escapeHTML, thoughtHotspots,
               renderThoughtModule, getBuilding, toStagePos, THOUGHT_TABS,
               getThoughtVideoCandidates, encodeAssetPath)
         module2-data.js (AXIS_MODES, AXIS_MODE_ORDER, AXIS_SEQUENCE,
               AXIS_TRACK_NODES, RITUAL_CONCEPTS, AXIS_REGION_DATA,
               AXIS_VIDEO_PATH, COURT_COLORS)
   ===================================================== */

;(function () {
  'use strict'

  /* ---------- 模块内部状态 ---------- */
  const m2 = {
    activeMode: 'ritual',
    activeRegion: 'taihedian',
    _leftPanelsInjected: false,
    _ritualDial: null,
    _trackPanel: null,
  }

  window._m2State = m2 // 暴露供调试

  /* ---------- 工具 ---------- */
  function getMode() { return AXIS_MODES[m2.activeMode] || AXIS_MODES.ritual }
  function getRegion() { return AXIS_REGION_DATA[m2.activeRegion] || AXIS_REGION_DATA.taihedian }
  function seqIndex(id) { return AXIS_SEQUENCE.indexOf(id) }
  function trackIndex(id) {
    const r = AXIS_REGION_DATA[id]
    return r ? r.trackIndex : -1
  }

  /* ---------- 左侧面板注入 ---------- */
  function ensureLeftPanels() {
    const col = document.querySelector('.thought-side-column')
    if (!col) return

    if (!m2._leftPanelsInjected) {
      // 礼意盘
      const dial = document.createElement('div')
      dial.className = 'panel-card m2-ritual-dial'
      dial.id = 'm2-ritual-dial'
      dial.innerHTML = `
        <div class="m2-ritual-dial__head">
          <span class="panel-head__eyebrow">中轴礼意盘</span>
          <h3 class="thought-card-title">礼制身份</h3>
        </div>
        <div class="m2-ritual-dial__body" id="m2-dial-body"></div>
      `
      // 脉络盘
      const track = document.createElement('div')
      track.className = 'panel-card m2-track-panel'
      track.id = 'm2-track-panel'
      track.innerHTML = `
        <div class="m2-track-panel__head">
          <span class="panel-head__eyebrow">礼序脉络盘</span>
          <h3 class="thought-card-title">中轴位置</h3>
        </div>
        <div class="m2-track-panel__body" id="m2-track-body"></div>
      `
      col.appendChild(dial)
      col.appendChild(track)
      m2._ritualDial = dial
      m2._trackPanel = track
      m2._leftPanelsInjected = true
    }

    // 切换可见性
    const sideCard = col.querySelector('.thought-side-card')
    // 阴阳五行的面板也要一并处理，保持对称性
    const yyDial = document.getElementById('yy-dial-yinyang')
    const wxDial = document.getElementById('yy-dial-wuxing')
    if (state.thoughtTab === 'axis') {
      col.classList.add('axis-active')
      col.classList.remove('yy-active')
      if (sideCard) sideCard.style.display = 'none'
      if (m2._ritualDial) m2._ritualDial.style.display = ''
      if (m2._trackPanel) m2._trackPanel.style.display = ''
      if (yyDial) yyDial.style.display = 'none'
      if (wxDial) wxDial.style.display = 'none'
    } else {
      col.classList.remove('axis-active')
      if (sideCard) sideCard.style.display = ''
      if (m2._ritualDial) m2._ritualDial.style.display = 'none'
      if (m2._trackPanel) m2._trackPanel.style.display = 'none'
    }
  }

  /* ---------- 渲染礼意盘 ---------- */
  function renderDial() {
    const body = document.getElementById('m2-dial-body')
    if (!body) return
    const region = getRegion()
    const activeSet = new Set(region.concepts || [])

    const conceptsHTML = RITUAL_CONCEPTS.map(c =>
      `<span class="m2-concept-chip${activeSet.has(c.id) ? ' is-active' : ''}">${escapeHTML(pick(c.labelZh, c.labelEn))}</span>`
    ).join('')

    body.innerHTML = `
      <div class="m2-ritual-center">
        <div class="m2-ritual-center__name">${escapeHTML(pick(region.nameZh, region.nameEn))}</div>
        <div class="m2-ritual-center__role">${escapeHTML(pick(region.roleZh, region.roleEn))}</div>
      </div>
      <div class="m2-ritual-concepts">${conceptsHTML}</div>
    `
  }

  /* ---------- 渲染脉络盘 ---------- */
  function renderTrack() {
    const body = document.getElementById('m2-track-body')
    if (!body) return
    const curIdx = AXIS_TRACK_NODES.indexOf(m2.activeRegion)
    // 如果当前选中的建筑不在脉络列表中（如中和殿），找最近的
    const effectiveIdx = curIdx >= 0 ? curIdx : (() => {
      const si = seqIndex(m2.activeRegion)
      for (let i = AXIS_TRACK_NODES.length - 1; i >= 0; i--) {
        if (seqIndex(AXIS_TRACK_NODES[i]) <= si) return i
      }
      return 0
    })()

    const mode = getMode()
    const nodesHTML = AXIS_TRACK_NODES.map((id, i) => {
      const r = AXIS_REGION_DATA[id]
      if (!r) return ''
      const isCurrent = (i === effectiveIdx)
      const isReached = (i < effectiveIdx)
      const isDivider = (id === 'qianqingmen')
      let cls = 'm2-track-node'
      if (isCurrent) cls += ' is-current'
      else if (isReached) cls += ' is-reached'
      if (isDivider && isCurrent) cls += ' is-divider'
      return `
        <div class="${cls}" data-m2-track="${id}">
          <span class="m2-track-node__label">${escapeHTML(pick(r.nameZh, r.nameEn))}</span>
          <span class="m2-track-node__meta">${isCurrent ? escapeHTML(pick(r.roleZh, r.roleEn)) : ''}</span>
        </div>
      `
    }).join('')

    body.innerHTML = `<div class="m2-track-list">${nodesHTML}</div>`

    // 绑定点击
    body.querySelectorAll('[data-m2-track]').forEach(el => {
      el.addEventListener('click', () => {
        selectRegion(el.dataset.m2Track)
      })
    })
  }

  /* ---------- 渲染右上按钮 ---------- */
  function renderSecondaryTabs() {
    const container = document.getElementById('thought-secondary-tabs')
    if (!container) return

    container.innerHTML = AXIS_MODE_ORDER.map(id => {
      const mode = AXIS_MODES[id]
      return `
        <button class="thought-secondary-tab m2-mode-btn${m2.activeMode === id ? ' active' : ''}"
                type="button" data-m2-mode="${id}">
          <span class="thought-secondary-tab__main">${escapeHTML(pick(mode.labelZh, mode.labelEn))}</span>
          <span class="thought-secondary-tab__sub">${escapeHTML(pick(mode.descZh, mode.descEn))}</span>
        </button>
      `
    }).join('')
  }

  /* ---------- 渲染右上状态条 ---------- */
  function renderStatusList() {
    const container = document.getElementById('thought-status-list')
    if (!container) return
    const mode = getMode()
    const items = [
      { label: pick('当前视角', 'Current View'), color: '#c18a3b' },
      { label: pick(mode.labelZh, mode.labelEn), color: '#b88a35' },
      { label: pick(`${mode.highlightIds.length} 个节点`, `${mode.highlightIds.length} nodes`), color: '#8a7453' },
    ]
    container.innerHTML = items.map(i => `
      <span class="thought-status-item">
        <span class="thought-status-item__dot" style="--dot-color:${i.color};"></span>
        ${escapeHTML(i.label)}
      </span>
    `).join('')
  }

  /* ---------- 渲染视频区（不随热区变化） ---------- */
  function renderMedia() {
    const body = document.getElementById('thought-media-body')
    const eyebrow = document.getElementById('thought-media-eyebrow')
    const title = document.getElementById('thought-media-title')
    if (!body) return
    if (eyebrow) eyebrow.textContent = pick('礼序长卷', 'Ritual Scroll')
    if (title) title.textContent = pick('中轴礼序', 'Central Axis Order')

    const exts = ['mp4', 'webm', 'mov']
    const candidates = exts.map(ext => encodeAssetPath(`${AXIS_VIDEO_PATH}.${ext}`))
    const primary = candidates[0]

    body.innerHTML = `
      <article class="thought-video-card">
        <div class="thought-video-frame"
             data-video-lightbox-src="${escapeHTML(primary)}"
             data-video-label="${escapeHTML(pick('中轴礼序', 'Central Axis Order'))}"
             role="button" tabindex="0"
             aria-label="${escapeHTML(pick('放大查看视频', 'Open video preview'))}">
          <video class="thought-video-frame__media" controls playsinline preload="metadata">
            ${candidates.map((src, idx) => `<source src="${escapeHTML(src)}" type="${idx === 1 ? 'video/webm' : 'video/mp4'}">`).join('')}
          </video>
          <span class="thought-video-frame__overlay">
            <span class="thought-video-frame__play">${pick('放大查看', 'Expand')}</span>
          </span>
        </div>
        <div class="thought-video-meta">
          <div class="thought-video-meta__title">${pick('中轴礼序', 'Central Axis Ritual Order')}</div>
          <p class="thought-video-meta__body">${pick(
            '以南北中轴为主线，把礼制、权力与空间节奏压缩进一条可感知的路径中。',
            'A single north-south line condenses ritual hierarchy, imperial power, and spatial cadence.'
          )}</p>
          <code class="thought-video-meta__path">${escapeHTML(primary)}</code>
        </div>
      </article>
    `
  }

  /* ---------- 渲染右下解读卡 ---------- */
  function renderTextCard() {
    const body = document.getElementById('thought-text-body')
    const eyebrow = document.getElementById('thought-text-eyebrow')
    const title = document.getElementById('thought-text-title')
    if (!body) return
    if (eyebrow) eyebrow.textContent = pick('建筑解读', 'Interpretation')
    const region = getRegion()
    if (title) title.textContent = pick(region.nameZh, region.nameEn)

    body.innerHTML = `
      <div class="m2-interpret-card">
        <div class="m2-interpret-card__name">${escapeHTML(pick(region.nameZh, region.nameEn))}</div>
        <span class="m2-interpret-card__role">${escapeHTML(pick(region.roleZh, region.roleEn))}</span>
        <p class="m2-interpret-card__subtitle">${escapeHTML(pick(region.subtitleZh, region.subtitleEn))}</p>
        <p class="m2-interpret-card__desc">${escapeHTML(pick(region.descZh, region.descEn))}</p>
      </div>
    `
  }

  /* ---------- 渲染地图装饰层 ---------- */
  function renderStageDecor() {
    const decor = document.getElementById('thought-stage-decor')
    if (!decor) return
    const mode = getMode()
    let html = ''

    if (mode.id === 'courtLiving') {
      html += renderCourtLivingDecor()
    } else if (mode.id === 'progression') {
      html += renderProgressionDecor()
    } else {
      html += renderRitualDecor()
    }

    decor.innerHTML = html
  }

  function renderRitualDecor() {
    const mode = getMode()
    let html = '<div class="m2-axis-line"></div>'
    mode.highlightIds.forEach(id => {
      const pos = toStagePos(id)
      const building = getBuilding(id)
      const label = pick(building?.name || '', building?.nameEn || building?.name || '')
      const isActive = (id === m2.activeRegion)
      html += `<span class="m2-axis-dot${isActive ? ' is-active' : ''}" style="left:${pos.left};top:${pos.top};"></span>`
      html += `<span class="m2-axis-tag${isActive ? ' is-active' : ''}" style="left:${pos.left};top:${pos.top};">${escapeHTML(label)}</span>`
    })
    // dim nodes
    const dimIds = mode.dimIds || []
    dimIds.forEach(id => {
      const pos = toStagePos(id)
      const building = getBuilding(id)
      const label = pick(building?.name || '', building?.nameEn || building?.name || '')
      html += `<span class="m2-axis-dot is-dim" style="left:${pos.left};top:${pos.top};"></span>`
      html += `<span class="m2-axis-tag is-dim" style="left:${pos.left};top:${pos.top};">${escapeHTML(label)}</span>`
    })
    return html
  }

  function renderProgressionDecor() {
    const curSeq = seqIndex(m2.activeRegion)
    let html = ''
    AXIS_SEQUENCE.forEach((id, i) => {
      const pos = toStagePos(id)
      const building = getBuilding(id)
      const label = pick(building?.name || '', building?.nameEn || building?.name || '')
      const isActive = (id === m2.activeRegion)
      const isReached = (i <= curSeq)
      const isDim = (i > curSeq)
      let dotCls = 'm2-axis-dot'
      let tagCls = 'm2-axis-tag'
      if (isActive) { dotCls += ' is-active'; tagCls += ' is-active' }
      else if (isDim) { dotCls += ' is-dim'; tagCls += ' is-dim' }
      html += `<span class="${dotCls}" style="left:${pos.left};top:${pos.top};"></span>`
      html += `<span class="${tagCls}" style="left:${pos.left};top:${pos.top};">${escapeHTML(label)}</span>`
    })
    // 进度轴线
    if (curSeq >= 0) {
      const startPos = toStagePos(AXIS_SEQUENCE[0])
      const curPos = toStagePos(m2.activeRegion)
      const endPos = toStagePos(AXIS_SEQUENCE[AXIS_SEQUENCE.length - 1])
      html += `<div class="m2-progress-reached" style="top:${startPos.top};bottom:calc(100% - ${curPos.top});"></div>`
      html += `<div class="m2-progress-unreached" style="top:${curPos.top};bottom:calc(100% - ${endPos.top});"></div>`
    }
    return html
  }

  function renderCourtLivingDecor() {
    const mode = AXIS_MODES.courtLiving
    let html = '<div class="m2-axis-line"></div>'

    // 分界线（乾清门位置）
    const dividerPos = toStagePos('qianqingmen')
    html += `<div class="m2-divider-line" style="top:${dividerPos.top};"></div>`

    // 分区标签
    html += `<span class="m2-zone-label m2-zone-label--outer" style="left:18%;top:62%;">${pick('前朝 · 阳', 'Outer Court · Yang')}</span>`
    html += `<span class="m2-zone-label m2-zone-label--inner" style="left:18%;top:25%;">${pick('后寝 · 阴', 'Inner Court · Yin')}</span>`

    // 所有节点
    AXIS_SEQUENCE.forEach(id => {
      const pos = toStagePos(id)
      const building = getBuilding(id)
      const label = pick(building?.name || '', building?.nameEn || building?.name || '')
      const isActive = (id === m2.activeRegion)
      const isDivider = (id === mode.dividerId)
      let dotCls = 'm2-axis-dot'
      let tagCls = 'm2-axis-tag'
      if (isActive) { dotCls += ' is-active'; tagCls += ' is-active' }
      if (isDivider && !isActive) { dotCls += ' is-active' }
      html += `<span class="${dotCls}" style="left:${pos.left};top:${pos.top};"></span>`
      html += `<span class="${tagCls}" style="left:${pos.left};top:${pos.top};">${escapeHTML(label)}</span>`
    })

    return html
  }

  /* ---------- 渲染地图高亮 ---------- */
  function renderMapHighlights() {
    if (typeof thoughtHotspots === 'undefined') return
    const mode = getMode()
    const activeSet = new Set(AXIS_SEQUENCE)
    const highlightSet = new Set(mode.highlightIds)
    const dimSet = new Set(mode.dimIds || [])
    const curSeq = seqIndex(m2.activeRegion)

    thoughtHotspots.forEach(hotspot => {
      const node = hotspot.overlayEl
      if (!node) return

      // 清除之前所有 m2- classes
      node.classList.remove(
        'm2-highlight', 'm2-highlight-outer', 'm2-highlight-inner',
        'm2-highlight-divider', 'm2-dim', 'm2-selected', 'm2-hover',
        'thought-highlight'
      )
      node.style.removeProperty('--thought-highlight-color')

      if (!activeSet.has(hotspot.buildingId)) {
        // 不在 9 个中轴热区中 → dim
        node.classList.add('m2-dim')
        return
      }

      const isSelected = (hotspot.buildingId === m2.activeRegion)
      const isHovered = (state.thoughtHoveredHotspotId === hotspot.hotspotId)

      if (isSelected) {
        node.classList.add('m2-selected')
        return
      }
      if (isHovered) {
        node.classList.add('m2-hover')
        return
      }

      if (mode.id === 'ritual') {
        if (highlightSet.has(hotspot.buildingId)) {
          node.classList.add('m2-highlight')
        } else {
          node.classList.add('m2-dim')
        }
      } else if (mode.id === 'progression') {
        const idx = seqIndex(hotspot.buildingId)
        if (idx <= curSeq) {
          node.classList.add('m2-highlight')
        } else {
          node.classList.add('m2-dim')
        }
      } else if (mode.id === 'courtLiving') {
        const outerSet = new Set(mode.outerIds)
        const innerSet = new Set(mode.innerIds)
        if (hotspot.buildingId === mode.dividerId) {
          node.classList.add('m2-highlight-divider')
        } else if (outerSet.has(hotspot.buildingId)) {
          node.classList.add('m2-highlight-outer')
        } else if (innerSet.has(hotspot.buildingId)) {
          node.classList.add('m2-highlight-inner')
        } else {
          node.classList.add('m2-highlight')
        }
      }
    })
  }

  /* ---------- 总渲染 ---------- */
  function renderAxisModule() {
    ensureLeftPanels()
    if (state.thoughtTab !== 'axis') return

    renderDial()
    renderTrack()
    renderSecondaryTabs()
    renderStatusList()
    renderMedia()
    renderTextCard()
    renderStageDecor()
    renderMapHighlights()

    // 更新顶部标题
    const stageTitle = document.getElementById('thought-stage-title')
    const stageHint = document.getElementById('thought-stage-hint')
    if (stageTitle) stageTitle.textContent = pick('中轴强化视图', 'Axis Emphasis View')
    if (stageHint) stageHint.textContent = pick(
      '点击中轴建筑，查看礼制身份与位置关系。',
      'Click an axial building to read its ritual identity and position.'
    )

    const controlTitle = document.getElementById('thought-control-title')
    const controlEyebrow = document.getElementById('thought-control-eyebrow')
    if (controlTitle) controlTitle.textContent = pick('视角切换', 'View Mode')
    if (controlEyebrow) controlEyebrow.textContent = pick('中轴礼序', 'Central Axis')
  }

  // 单独渲染右侧按钮（供外部调用，防止被 app.js 覆盖）
  function renderSecondaryTabsOnly() {
    if (state.thoughtTab !== 'axis') return
    renderSecondaryTabs()
  }

  /* ---------- 交互操作 ---------- */
  function selectMode(modeId) {
    if (!AXIS_MODES[modeId]) return
    m2.activeMode = modeId
    const mode = getMode()
    m2.activeRegion = mode.defaultRegion
    renderAxisModule()
  }

  function selectRegion(regionId) {
    if (!AXIS_REGION_DATA[regionId]) return
    m2.activeRegion = regionId
    // 同步到 app.js 的 state
    state.thoughtSelectedBuilding = regionId
    renderAxisModule()
  }

  /* ---------- 接入现有 thought 系统 ---------- */
  /*
   * 策略：app.js 中 renderAll → renderThoughtModule 是局部调用链，
   * 无法直接 override。改用 MutationObserver 在 DOM 更新后进行覆盖渲染。
   * 同时使用 requestAnimationFrame 延迟，确保原始渲染完成后再覆盖。
   */

  let _m2RafId = 0

  function scheduleAxisOverride() {
    cancelAnimationFrame(_m2RafId)
    _m2RafId = requestAnimationFrame(() => {
      if (state.module === 'thought' && state.thoughtTab === 'axis') {
        renderAxisModule()
      } else {
        ensureLeftPanels() // 确保左侧面板切回原始状态
      }
    })
  }

  function applyPatches() {
    // 监听 thought 区域的 DOM 变化，检测原始 renderThoughtModule 完成后进行覆盖
    const thoughtGrid = document.querySelector('.thought-grid')
    if (thoughtGrid) {
      const observer = new MutationObserver(() => {
        if (state.module === 'thought') {
          scheduleAxisOverride()
        }
      })
      observer.observe(thoughtGrid, { childList: true, subtree: true, characterData: true })
    }

    // 监听一级 tab 点击（primary tabs 由 renderThoughtModule 动态生成）
    document.addEventListener('click', (e) => {
      const tabBtn = e.target.closest('[data-thought-tab]')
      if (tabBtn) {
        // 等原始 selectThoughtTab 处理完后，我们再覆盖
        setTimeout(() => {
          if (state.thoughtTab === 'axis') {
            m2.activeMode = 'ritual'
            m2.activeRegion = 'taihedian'
          }
          scheduleAxisOverride()
        }, 50)
      }
    }, true)

    // 初始触发
    setTimeout(scheduleAxisOverride, 300)
  }

  function rebindHotspotsForAxis() {
    // 由于 createThoughtHotspots 是异步的，我们需要在它完成后拦截
    // 通过 MutationObserver 监听 SVG 加载完成
    const host = document.getElementById('thought-svg-host')
    if (!host) return

    const observer = new MutationObserver(() => {
      if (host.querySelector('svg') && typeof thoughtHotspots !== 'undefined' && thoughtHotspots.length > 0) {
        observer.disconnect()
        hookThoughtHotspots()
      }
    })
    observer.observe(host, { childList: true, subtree: true })

    // 如果已经加载了
    if (host.querySelector('svg') && typeof thoughtHotspots !== 'undefined' && thoughtHotspots.length > 0) {
      observer.disconnect()
      hookThoughtHotspots()
    }
  }

  function hookThoughtHotspots() {
    if (typeof thoughtHotspots === 'undefined') return
    // 给每个中轴热区添加额外的点击处理
    const axisSet = new Set(AXIS_SEQUENCE)

    thoughtHotspots.forEach(hotspot => {
      if (!axisSet.has(hotspot.buildingId)) return

      const targetEls = hotspot.paths.length ? hotspot.paths : []
      targetEls.forEach(path => {
        // 添加一个优先级更高的 click listener
        path.addEventListener('click', (e) => {
          if (state.thoughtTab === 'axis') {
            e.stopImmediatePropagation()
            selectRegion(hotspot.buildingId)
          }
        }, true) // capture phase
      })

      if (hotspot.customPath && hotspot.sourceEl) {
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

  // DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(initModule2, 200))
  } else {
    setTimeout(initModule2, 200)
  }

  // 暴露 API
  window.Module2 = {
    selectMode,
    selectRegion,
    render: renderAxisModule,
    renderSecondaryTabsOnly,
    state: m2,
  }

})()
