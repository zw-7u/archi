/* ============================================================
 *  fengshui.js  —  风水格局模块交互与渲染
 *  负责：SVG overlay 显隐 · 热区点击 · Canvas 八卦与气脉
 *        右侧按钮 · 详情卡 · 与 app.js 集成
 * ============================================================ */

;(function () {
  'use strict'

  // ── 内部状态 ─────────────────────────────────────────────
  const fsState = {
    activeTheme: 'front',
    activeHotspot: null,
    hoveredHotspot: null,
    svgLoaded: false,
    /** 动画插值用的当前气脉值 */
    qiCurrent: [0, 0, 0, 0, 0],
    qiTarget: [0, 0, 0, 0, 0],
    animId: null,
  }

  // ── SVG 节点缓存 ────────────────────────────────────────
  let svgRoot = null
  const visualEls = {}
  const hitEls = {}

  // ── Canvas 引用 ─────────────────────────────────────────
  let baguaCanvas = null
  let baguaCtx = null
  let qiCanvas = null
  let qiCtx = null

  // ── 工具函数 ────────────────────────────────────────────
  function isZh() { return (window.state?.lang || 'zh') === 'zh' }
  function pick(zh, en) { return isZh() ? zh : en }

  function getTheme(id) { return FENGSHUI_THEMES[id || fsState.activeTheme] }
  function getHotspot(id) { return FENGSHUI_HOTSPOTS[id] }
  function getBagua(key) { return FENGSHUI_BAGUA_MAP[key] }
  function getQiValues(key) {
    if (key && FENGSHUI_QI_HOTSPOT[key]) return FENGSHUI_QI_HOTSPOT[key]
    return FENGSHUI_QI_THEME[fsState.activeTheme] || [50, 50, 50, 50, 50]
  }

  // ── 1. SVG 加载与挂载 ──────────────────────────────────

  async function loadFengshuiSvg() {
    const host = document.getElementById('thought-svg-host')
    if (!host) return

    /* 底图使用 overview.png 作为 CSS 背景，overlay SVG 覆盖其上 */
    const svgPath = 'assets/images/map/overview_fengshui_overlay_only.svg'
    try {
      const res = await fetch(new URL(svgPath, window.location.href))
      if (!res.ok) throw new Error(`SVG load failed: ${res.status}`)
      const markup = await res.text()

      /* 在 host 内先放底图 img，再追加 overlay SVG */
      host.innerHTML = ''

      const bgImg = document.createElement('img')
      bgImg.src = 'assets/images/map/overview.png'
      bgImg.className = 'fs-basemap-img'
      bgImg.alt = '故宫总览底图'
      bgImg.draggable = false
      host.appendChild(bgImg)

      const svgWrap = document.createElement('div')
      svgWrap.className = 'fs-overlay-wrap'
      svgWrap.innerHTML = markup
      host.appendChild(svgWrap)

      svgRoot = svgWrap.querySelector('svg')
      if (!svgRoot) throw new Error('SVG root not found')
      svgRoot.removeAttribute('width')
      svgRoot.removeAttribute('height')
      svgRoot.setAttribute('preserveAspectRatio', 'xMidYMid meet')

      cacheNodes()
      bindHitEvents()
      fsState.svgLoaded = true
      host.dataset.currentFile = 'fengshui-overlay'

      applyTheme()
    } catch (err) {
      console.error('[fengshui]', err)
      host.innerHTML = '<p class="overview-svg-fallback">风水格局图加载失败，请检查 SVG 路径。</p>'
      fsState.svgLoaded = false
    }
  }

  function cacheNodes() {
    FENGSHUI_VISUAL_IDS.forEach(id => { visualEls[id] = svgRoot?.getElementById(id) })
    FENGSHUI_HIT_IDS.forEach(id => { hitEls[id] = svgRoot?.getElementById(id) })
  }

  // ── 2. overlay 显隐与主题切换 ──────────────────────────

  function applyTheme() {
    const theme = getTheme()
    if (!theme || !svgRoot) return

    const showSet = new Set(theme.overlays || [])
    const dimSet = new Set(theme.overlaysDim || [])
    const hideSet = new Set(theme.overlaysHide || [])
    const hotspotSet = new Set(theme.hotspots || [])

    // visual overlay
    FENGSHUI_VISUAL_IDS.forEach(id => {
      const el = visualEls[id]
      if (!el) return
      if (showSet.has(id)) {
        el.style.opacity = '1'
        el.style.pointerEvents = 'none'
      } else if (dimSet.has(id)) {
        el.style.opacity = '0.25'
        el.style.pointerEvents = 'none'
      } else if (hideSet.has(id)) {
        el.style.opacity = '0'
        el.style.pointerEvents = 'none'
      } else {
        el.style.opacity = '0'
      }
    })

    // hit overlay — 只有当前主题的热区可交互
    FENGSHUI_HIT_IDS.forEach(id => {
      const el = hitEls[id]
      if (!el) return
      const enabled = hotspotSet.has(id)
      el.style.pointerEvents = enabled ? 'auto' : 'none'
      el.style.opacity = enabled ? '1' : '0.08'
      el.classList.remove('fs-hit-active', 'fs-hit-hover')
    })

    // 如果有激活热区，高亮
    if (fsState.activeHotspot && hitEls[fsState.activeHotspot]) {
      hitEls[fsState.activeHotspot].classList.add('fs-hit-active')
    }
  }

  // ── 3. 热区事件绑定 ────────────────────────────────────

  function bindHitEvents() {
    FENGSHUI_HIT_IDS.forEach(id => {
      const el = hitEls[id]
      if (!el) return

      el.addEventListener('mouseenter', () => {
        fsState.hoveredHotspot = id
        el.classList.add('fs-hit-hover')
        showFsTooltip(id, el)
      })

      el.addEventListener('mouseleave', () => {
        if (fsState.hoveredHotspot === id) fsState.hoveredHotspot = null
        el.classList.remove('fs-hit-hover')
        hideFsTooltip()
      })

      el.addEventListener('click', () => {
        hideFsTooltip()
        if (fsState.activeHotspot === id) {
          fsState.activeHotspot = null
        } else {
          fsState.activeHotspot = id
        }
        applyTheme()
        renderAll()
      })
    })
  }

  // ── 4. Tooltip ─────────────────────────────────────────

  function showFsTooltip(id, el) {
    const tooltip = document.getElementById('thought-tooltip')
    if (!tooltip) return
    const hs = getHotspot(id)
    if (!hs) return
    tooltip.textContent = pick(hs.titleZh, hs.titleEn)
    tooltip.hidden = false
    const rect = el.getBoundingClientRect()
    const tw = tooltip.getBoundingClientRect().width
    tooltip.style.left = `${rect.left + rect.width / 2 - tw / 2}px`
    tooltip.style.top = `${rect.top - 32}px`
  }

  function hideFsTooltip() {
    const tooltip = document.getElementById('thought-tooltip')
    if (tooltip) tooltip.hidden = true
  }

  // ── 5. 右侧主题按钮渲染（接管 thought-secondary-tabs） ─

  function renderSecondaryButtons() {
    const container = document.getElementById('thought-secondary-tabs')
    if (!container) return

    container.innerHTML = FENGSHUI_THEME_ORDER.map(id => {
      const t = FENGSHUI_THEMES[id]
      const active = fsState.activeTheme === id
      return `
        <button class="thought-secondary-tab fs-theme-btn${active ? ' active' : ''}"
                type="button" data-fs-theme="${id}"
                style="--fs-btn-color:${t.color}">
          <span class="thought-secondary-tab__main">${pick(t.titleZh, t.titleEn)}</span>
          <span class="fs-theme-btn__sub">${pick(t.subtitleZh, t.subtitleEn)}</span>
        </button>
      `
    }).join('')

    container.querySelectorAll('[data-fs-theme]').forEach(btn => {
      btn.addEventListener('click', () => {
        setTheme(btn.dataset.fsTheme)
      })
    })
  }

  // ── 6. 右侧状态标签 ───────────────────────────────────

  function renderStatusList() {
    const container = document.getElementById('thought-status-list')
    if (!container) return
    const theme = getTheme()
    container.innerHTML = (theme.statusItems || []).map(item => `
      <span class="thought-status-item">
        <span class="thought-status-item__dot" style="--dot-color:${item.color || theme.color}"></span>
        ${pick(item.labelZh, item.labelEn)}
      </span>
    `).join('')
  }

  // ── 7. 右侧详情卡 ─────────────────────────────────────

  function renderTextBody() {
    const container = document.getElementById('thought-text-body')
    if (!container) return

    const theme = getTheme()
    const hs = fsState.activeHotspot ? getHotspot(fsState.activeHotspot) : null

    let html = ''

    if (hs) {
      // 热区详情态
      const kw = pick(hs.keywordsZh, hs.keywordsEn) || []
      html = `
        <section class="thought-text-section fs-detail-section">
          <h4 class="thought-text-section__title">${pick(hs.titleZh, hs.titleEn)}</h4>
          <p class="thought-text-section__body fs-role">${pick(hs.roleZh, hs.roleEn)}</p>
          <p class="thought-text-section__body">${pick(hs.descZh, hs.descEn)}</p>
          <div class="fs-keywords">${kw.map(k => `<span class="fs-kw-tag">${k}</span>`).join('')}</div>
        </section>
      `
    } else {
      // 主题总说明态
      html = `
        <section class="thought-text-section">
          <h4 class="thought-text-section__title">${pick(theme.titleZh, theme.titleEn)}</h4>
          <p class="thought-text-section__body fs-role">${pick(theme.subtitleZh, theme.subtitleEn)}</p>
          <p class="thought-text-section__body">${pick(theme.descZh, theme.descEn)}</p>
        </section>
      `
    }

    container.innerHTML = html
  }

  // ── 8. 右中 media 区 ──────────────────────────────────

  function renderMediaBody() {
    const container = document.getElementById('thought-media-body')
    if (!container) return

    const theme = getTheme()
    const hs = fsState.activeHotspot ? getHotspot(fsState.activeHotspot) : null
    const title = hs ? pick(hs.titleZh, hs.titleEn) : pick(theme.titleZh, theme.titleEn)
    const body = hs ? pick(hs.roleZh, hs.roleEn) : pick(theme.subtitleZh, theme.subtitleEn)

    container.innerHTML = `
      <article class="thought-poster thought-poster--summary fs-media-poster" style="--fs-poster-color:${theme.color}">
        <div class="thought-poster__title">${title}</div>
        <div class="thought-poster__body">${body}</div>
        <div class="thought-media-tags">
          ${(theme.statusItems || []).map(item => `
            <span class="thought-media-tag">
              <span class="thought-status-item__dot" style="--dot-color:${item.color || theme.color}"></span>
              ${pick(item.labelZh, item.labelEn)}
            </span>
          `).join('')}
        </div>
      </article>
    `
  }

  // ── 9. 左侧 Canvas：八卦格局 ──────────────────────────

  function initBaguaCanvas() {
    baguaCanvas = document.getElementById('fs-bagua-canvas')
    if (!baguaCanvas) return
    baguaCtx = baguaCanvas.getContext('2d')
    resizeCanvas(baguaCanvas)
  }

  function drawBagua() {
    if (!baguaCtx || !baguaCanvas) return
    resizeCanvas(baguaCanvas)
    const ctx = baguaCtx
    const w = baguaCanvas.width
    const h = baguaCanvas.height
    const cx = w / 2
    const cy = h / 2
    const r = Math.min(w, h) * 0.38

    ctx.clearRect(0, 0, w, h)

    const baguaKey = fsState.activeHotspot || fsState.activeTheme
    const bagua = getBagua(baguaKey) || getBagua(fsState.activeTheme)
    if (!bagua) return

    const activeSet = new Set(bagua.active || [])
    const theme = getTheme()

    // 方位定义：上北下南左西右东（地图方位）
    const directions = [
      { id: 'north',  angle: -Math.PI / 2, labelZh: '北', labelEn: 'N' },
      { id: 'east',   angle: 0,            labelZh: '东', labelEn: 'E' },
      { id: 'south',  angle: Math.PI / 2,  labelZh: '南', labelEn: 'S' },
      { id: 'west',   angle: Math.PI,      labelZh: '西', labelEn: 'W' },
      { id: 'center', angle: null,          labelZh: '中', labelEn: 'C' },
    ]

    // 外圈
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(212,180,92,0.2)'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // 内圈
    ctx.beginPath()
    ctx.arc(cx, cy, r * 0.45, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(212,180,92,0.12)'
    ctx.lineWidth = 1
    ctx.stroke()

    // 各方位节点
    directions.forEach(dir => {
      const isActive = activeSet.has(dir.id)
      let x, y
      if (dir.id === 'center') {
        x = cx; y = cy
      } else {
        x = cx + Math.cos(dir.angle) * r * 0.72
        y = cy + Math.sin(dir.angle) * r * 0.72
      }

      // 节点圆
      const nodeR = dir.id === 'center' ? 16 : 12
      ctx.beginPath()
      ctx.arc(x, y, nodeR, 0, Math.PI * 2)
      if (isActive) {
        ctx.fillStyle = theme.color + 'cc'
        ctx.fill()
        ctx.strokeStyle = theme.color
        ctx.lineWidth = 2
        ctx.stroke()
        // 光晕
        ctx.beginPath()
        ctx.arc(x, y, nodeR + 6, 0, Math.PI * 2)
        ctx.strokeStyle = theme.color + '40'
        ctx.lineWidth = 3
        ctx.stroke()
      } else {
        ctx.fillStyle = 'rgba(212,180,92,0.08)'
        ctx.fill()
        ctx.strokeStyle = 'rgba(212,180,92,0.2)'
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // 标签
      ctx.font = `${isActive ? '600' : '400'} ${isActive ? 13 : 11}px "Noto Sans SC", sans-serif`
      ctx.fillStyle = isActive ? '#e8e4dc' : 'rgba(232,228,220,0.4)'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(pick(dir.labelZh, dir.labelEn), x, y)
    })

    // 流线
    drawBaguaFlow(ctx, cx, cy, r, bagua.flow, theme.color)

    // 底部标签
    const label = pick(bagua.labelZh, bagua.labelEn)
    ctx.font = '500 12px "Noto Sans SC", sans-serif'
    ctx.fillStyle = 'rgba(232,228,220,0.5)'
    ctx.textAlign = 'center'
    ctx.fillText(label, cx, h - 12)
  }

  function drawBaguaFlow(ctx, cx, cy, r, flowType, color) {
    ctx.save()
    ctx.strokeStyle = color + '60'
    ctx.lineWidth = 2
    ctx.setLineDash([6, 4])

    const sR = r * 0.72
    switch (flowType) {
      case 'southToCenter': {
        const sx = cx, sy = cy + sR
        ctx.beginPath()
        ctx.moveTo(sx, sy)
        ctx.quadraticCurveTo(cx - 20, cy + sR * 0.4, cx, cy)
        ctx.stroke()
        drawArrow(ctx, cx, cy, color)
        break
      }
      case 'curveToCenter': {
        const sx = cx, sy = cy + sR
        ctx.beginPath()
        ctx.moveTo(sx, sy)
        ctx.bezierCurveTo(cx + sR * 0.5, cy + sR * 0.6, cx + sR * 0.3, cy - sR * 0.2, cx, cy)
        ctx.stroke()
        drawArrow(ctx, cx, cy, color)
        break
      }
      case 'eastWestWrap': {
        // east->center
        ctx.beginPath()
        ctx.moveTo(cx + sR, cy)
        ctx.quadraticCurveTo(cx + sR * 0.4, cy - 15, cx, cy)
        ctx.stroke()
        // west->center
        ctx.beginPath()
        ctx.moveTo(cx - sR, cy)
        ctx.quadraticCurveTo(cx - sR * 0.4, cy + 15, cx, cy)
        ctx.stroke()
        drawArrow(ctx, cx, cy, color)
        break
      }
      case 'northToCenter': {
        const sx = cx, sy = cy - sR
        ctx.beginPath()
        ctx.moveTo(sx, sy)
        ctx.quadraticCurveTo(cx + 20, cy - sR * 0.4, cx, cy)
        ctx.stroke()
        drawArrow(ctx, cx, cy, color)
        break
      }
    }
    ctx.restore()
  }

  function drawArrow(ctx, x, y, color) {
    ctx.fillStyle = color + '80'
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fill()
  }

  // ── 10. 左侧 Canvas：气脉势能 ─────────────────────────

  function initQiCanvas() {
    qiCanvas = document.getElementById('fs-qi-canvas')
    if (!qiCanvas) return
    qiCtx = qiCanvas.getContext('2d')
    resizeCanvas(qiCanvas)
  }

  function drawQi() {
    if (!qiCtx || !qiCanvas) return
    resizeCanvas(qiCanvas)
    const ctx = qiCtx
    const w = qiCanvas.width
    const h = qiCanvas.height
    const cx = w / 2
    const cy = h / 2 - 4
    const r = Math.min(w, h) * 0.36

    ctx.clearRect(0, 0, w, h)

    const theme = getTheme()
    const values = fsState.qiCurrent
    const labels = pick(FENGSHUI_QI_LABELS_ZH, FENGSHUI_QI_LABELS_EN)
    const n = 5
    const step = (Math.PI * 2) / n

    // 背景网格 (3层)
    for (let level = 1; level <= 3; level++) {
      ctx.beginPath()
      for (let i = 0; i < n; i++) {
        const angle = -Math.PI / 2 + i * step
        const px = cx + Math.cos(angle) * r * (level / 3)
        const py = cy + Math.sin(angle) * r * (level / 3)
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.strokeStyle = `rgba(212,180,92,${0.06 + level * 0.03})`
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // 轴线
    for (let i = 0; i < n; i++) {
      const angle = -Math.PI / 2 + i * step
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r)
      ctx.strokeStyle = 'rgba(212,180,92,0.1)'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // 数据多边形
    ctx.beginPath()
    for (let i = 0; i < n; i++) {
      const angle = -Math.PI / 2 + i * step
      const v = (values[i] || 0) / 100
      const px = cx + Math.cos(angle) * r * v
      const py = cy + Math.sin(angle) * r * v
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.closePath()
    ctx.fillStyle = theme.color + '28'
    ctx.fill()
    ctx.strokeStyle = theme.color + 'bb'
    ctx.lineWidth = 2
    ctx.stroke()

    // 数据点 + 标签
    for (let i = 0; i < n; i++) {
      const angle = -Math.PI / 2 + i * step
      const v = (values[i] || 0) / 100
      const px = cx + Math.cos(angle) * r * v
      const py = cy + Math.sin(angle) * r * v

      // 数据点
      ctx.beginPath()
      ctx.arc(px, py, 4, 0, Math.PI * 2)
      ctx.fillStyle = theme.color
      ctx.fill()

      // 标签
      const lx = cx + Math.cos(angle) * (r + 18)
      const ly = cy + Math.sin(angle) * (r + 18)
      ctx.font = '400 10px "Noto Sans SC", sans-serif'
      ctx.fillStyle = 'rgba(232,228,220,0.55)'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(labels[i], lx, ly)

      // 数值
      ctx.font = '600 10px "Noto Sans SC", sans-serif'
      ctx.fillStyle = theme.color + 'cc'
      const vx = cx + Math.cos(angle) * r * v
      const vy = cy + Math.sin(angle) * r * v - 12
      ctx.fillText(Math.round(values[i]), vx, vy)
    }

    // 底部标签
    const hsData = fsState.activeHotspot ? getHotspot(fsState.activeHotspot) : null
    const label = hsData ? pick(hsData.titleZh, hsData.titleEn) : pick(theme.titleZh, theme.titleEn)
    ctx.font = '500 12px "Noto Sans SC", sans-serif'
    ctx.fillStyle = 'rgba(232,228,220,0.5)'
    ctx.textAlign = 'center'
    ctx.fillText(label, cx, h - 10)
  }

  // ── 11. 气脉值动画插值 ────────────────────────────────

  function animateQi() {
    const key = fsState.activeHotspot || fsState.activeTheme
    fsState.qiTarget = getQiValues(key).slice()
    if (fsState.animId) cancelAnimationFrame(fsState.animId)
    stepQi()
  }

  function stepQi() {
    let done = true
    for (let i = 0; i < 5; i++) {
      const diff = fsState.qiTarget[i] - fsState.qiCurrent[i]
      if (Math.abs(diff) > 0.5) {
        fsState.qiCurrent[i] += diff * 0.12
        done = false
      } else {
        fsState.qiCurrent[i] = fsState.qiTarget[i]
      }
    }
    drawQi()
    if (!done) {
      fsState.animId = requestAnimationFrame(stepQi)
    } else {
      fsState.animId = null
    }
  }

  // ── 12. Canvas 工具 ───────────────────────────────────

  function resizeCanvas(canvas) {
    if (!canvas) return
    const rect = canvas.parentElement?.getBoundingClientRect()
    if (!rect) return
    const dpr = window.devicePixelRatio || 1
    const w = Math.floor(rect.width)
    const h = Math.floor(rect.height)
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      canvas.getContext('2d').scale(dpr, dpr)
      // 存逻辑尺寸供绘图用
      canvas.width = w
      canvas.height = h
    }
  }

  // ── 13. 左侧面板渲染（接管 thought-side-visual / focus）─

  function renderSidePanel() {
    const visualEl = document.getElementById('thought-side-visual')
    const focusEl = document.getElementById('thought-side-focus')
    const titleEl = document.getElementById('thought-side-title')
    const descEl = document.getElementById('thought-side-desc')
    const eyebrowEl = document.getElementById('thought-side-eyebrow')

    if (titleEl) titleEl.textContent = pick('风水方位盘', 'Feng Shui Compass')
    if (eyebrowEl) eyebrowEl.textContent = pick('八卦格局', 'Bagua Layout')
    if (descEl) descEl.textContent = pick(
      '通过方位关系理解当前格局区域在宫城中的风水角色。',
      'Understand each zone\'s feng shui role through directional relationships.'
    )

    if (visualEl) {
      visualEl.innerHTML = `
        <div class="fs-canvas-card">
          <div class="fs-canvas-head">${pick('八卦格局', 'Bagua Layout')}</div>
          <canvas id="fs-bagua-canvas" class="fs-canvas"></canvas>
        </div>
        <div class="fs-canvas-card">
          <div class="fs-canvas-head">${pick('气脉势能', 'Qi Energy Field')}</div>
          <canvas id="fs-qi-canvas" class="fs-canvas"></canvas>
        </div>
      `
      initBaguaCanvas()
      initQiCanvas()
    }

    if (focusEl) {
      const theme = getTheme()
      const hs = fsState.activeHotspot ? getHotspot(fsState.activeHotspot) : null
      focusEl.textContent = hs
        ? pick(hs.roleZh, hs.roleEn)
        : pick(theme.subtitleZh, theme.subtitleEn)
    }
  }

  // ── 14. Stage 上方装饰与摘要 ──────────────────────────

  function renderStageDecor() {
    const decorEl = document.getElementById('thought-stage-decor')
    if (!decorEl) return

    const theme = getTheme()
    const hs = fsState.activeHotspot ? getHotspot(fsState.activeHotspot) : null
    const title = hs ? pick(hs.titleZh, hs.titleEn) : pick(theme.titleZh, theme.titleEn)
    const body = hs ? pick(hs.descZh, hs.descEn) : pick(theme.descZh, theme.descEn)

    decorEl.innerHTML = `
      <article class="thought-stage-summary" style="--fs-accent:${theme.color}">
        <div class="thought-stage-summary__eyebrow">${pick('风水格局', 'Feng Shui')}</div>
        <h4 class="thought-stage-summary__title">${title}</h4>
        <p class="thought-stage-summary__body">${body.slice(0, 120)}${body.length > 120 ? '…' : ''}</p>
        <div class="thought-stage-summary__list">
          ${(theme.statusItems || []).map(item =>
            `<span class="thought-stage-summary__item" style="color:${item.color}">${pick(item.labelZh, item.labelEn)}</span>`
          ).join('')}
        </div>
      </article>
    `
  }

  // ── 15. 顶栏与全局 header 更新 ────────────────────────

  function renderHeader() {
    const kickerEl = document.getElementById('thought-module-kicker')
    const titleEl = document.getElementById('thought-module-title')
    const statusEl = document.getElementById('thought-module-status')
    const stageEyebrow = document.getElementById('thought-stage-eyebrow')
    const stageTitle = document.getElementById('thought-stage-title')
    const controlEyebrow = document.getElementById('thought-control-eyebrow')
    const controlTitle = document.getElementById('thought-control-title')
    const mediaEyebrow = document.getElementById('thought-media-eyebrow')
    const mediaTitle = document.getElementById('thought-media-title')
    const textEyebrow = document.getElementById('thought-text-eyebrow')
    const textTitle = document.getElementById('thought-text-title')

    const theme = getTheme()
    if (kickerEl) kickerEl.textContent = pick('堪舆哲思', 'Spatial Thought')
    if (titleEl) titleEl.textContent = pick('风水格局', 'Feng Shui Logic')
    if (statusEl) statusEl.textContent = pick('前场明堂 · 水脉导气 · 左右护持 · 后靠聚势', 'Forecourt · Water · Guard · Rear Support')
    if (stageEyebrow) stageEyebrow.textContent = 'Overview'
    if (stageTitle) stageTitle.textContent = pick('宫城风水格局图', 'Palace Feng Shui Layout')
    if (controlEyebrow) controlEyebrow.textContent = pick('格局主题', 'Layout Theme')
    if (controlTitle) controlTitle.textContent = pick('主题切换', 'Theme Switch')
    if (mediaEyebrow) mediaEyebrow.textContent = pick('格局概要', 'Layout Summary')
    if (mediaTitle) mediaTitle.textContent = pick(theme.titleZh, theme.titleEn)
    if (textEyebrow) textEyebrow.textContent = pick('内容解释', 'Interpretation')
    if (textTitle) textTitle.textContent = pick(theme.titleZh, theme.titleEn)
  }

  // ── 16. 统一渲染 ──────────────────────────────────────

  function renderAll() {
    renderHeader()
    renderSecondaryButtons()
    renderStatusList()
    renderSidePanel()
    renderMediaBody()
    renderTextBody()
    renderStageDecor()
    drawBagua()
    animateQi()
  }

  // ── 17. 切换主题 ──────────────────────────────────────

  function setTheme(themeId) {
    if (!FENGSHUI_THEMES[themeId]) return
    fsState.activeTheme = themeId
    fsState.activeHotspot = null
    applyTheme()
    renderAll()
  }

  // ── 18. 公开接口 ──────────────────────────────────────

  /** 由 app.js renderThoughtModule 中调用 */
  function renderButtonsOnly() {
    renderSecondaryButtons()
    renderStatusList()
  }

  /**
   * 完整初始化 — 当 thoughtTab 切换到 fengshui 时调用
   * 负责加载 SVG、初始化 Canvas、首次渲染
   */
  async function init() {
    await loadFengshuiSvg()
    renderAll()
  }

  // 暴露到全局
  window.FengshuiModule = {
    init,
    renderButtonsOnly,
    renderAll,
    setTheme,
    getState: () => ({ ...fsState }),
  }
})()
