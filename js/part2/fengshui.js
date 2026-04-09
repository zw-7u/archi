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
    compassFrame: null,
    compassTime: 0,
  }

  const FENGSHUI_VIDEO_PATH = 'assets/videos/culture/风水格局.mp4'
  const FENGSHUI_SINOLOGY_CARDS = {
    front: {
      sourceZh: '《周礼·考工记》',
      sourceEn: 'The Rites of Zhou, Kaogongji',
      quoteZh: '“匠人营国，方九里，旁三门。国中九经九纬，经涂九轨。左祖右社，面朝后市。”',
      quoteEn: '"In founding a capital... ancestral temple on the left, altar on the right, audience court in front, market behind."',
      interpretZh: '这段古文强调，都城与宫城必须先有清楚的朝向和中心，再安排进入的次序。可以把“明堂”理解成进入核心建筑前的开阔前场：它先让视线展开，再把人的注意力慢慢收向中轴。',
      interpretEn: 'This passage frames the capital as a spatial order with direction, center, and sequence. The forecourt can be read as an open field before the core buildings: it expands the view first, then gradually gathers attention toward the axis.',
      architectureZh: '故宫从天安门到午门，再到太和门前广场，空间由外向内逐层放大又收束。第一次走进宫城的人，会先感到开阔，随后才感到威严；礼制就是这样被空间一步步讲出来的。',
      architectureEn: 'From Tiananmen to the Meridian Gate and then the plaza before the Gate of Supreme Harmony, space expands and tightens in stages. Visitors feel openness before solemnity; ritual order is explained through movement in space.',
      tagsZh: ['朝向', '前场', '礼序'],
      tagsEn: ['Orientation', 'Forecourt', 'Ritual order'],
    },
    water: {
      sourceZh: '《葬书》',
      sourceEn: 'The Book of Burial',
      quoteZh: '“气乘风则散，界水则止。”',
      quoteEn: '"Qi scatters when it rides the wind; it settles when bounded by water."',
      interpretZh: '这句话的意思是：无形的气势容易被风吹散，遇到水线才会被收住。放到建筑里看，水不只是景观，而是帮助人流、视线和节奏减速、转向、再进入核心的空间装置；《管子·水地》把水比作“地之血气”，正说明它像宫城的脉络。',
      interpretEn: 'The idea is that invisible momentum disperses easily and needs water to collect it. In architecture, water is not mere scenery but a device that slows, redirects, and guides movement toward the core. Another classical text compares water to the earth\'s blood and veins, highlighting its structural role.',
      architectureZh: '故宫金水河从西北进入，在太和门前回环，再向东南流出。弯水没有直冲殿门，而是先缓冲、再导入，所以核心空间显得更稳，也更有层次。',
      architectureEn: 'The Golden Water River enters from the northwest, bends before the Gate of Supreme Harmony, and exits to the southeast. Instead of striking the halls directly, the curve buffers and redirects the approach, making the core feel steadier and more layered.',
      tagsZh: ['水线', '缓冲', '导入'],
      tagsEn: ['Waterline', 'Buffer', 'Guidance'],
    },
    guard: {
      sourceZh: '《葬书》',
      sourceEn: 'The Book of Burial',
      quoteZh: '“青龙蜿蜒，白虎驯俯。”',
      quoteEn: '"Let the Azure Dragon extend and the White Tiger settle in obedience."',
      interpretZh: '这里的“青龙”“白虎”不是神怪故事，而是左侧与右侧空间的比喻。它强调两翼要向中心拱护，让核心不显得孤立；换成今天更容易理解的说法，就是两侧体量一起把中间的主位托稳。',
      interpretEn: 'The Azure Dragon and White Tiger are not mythical creatures here but metaphors for the left and right spatial wings. The point is that the flanks should gather around and support the center rather than leave it isolated.',
      architectureZh: '故宫东六宫、西六宫、文华殿、武英殿分布在中轴两侧，形成稳定的左右回应。可以把它理解成舞台两边的侧幕：主位在中央，两侧结构负责托住整个场面。',
      architectureEn: 'The Eastern and Western Six Palaces, together with Wenhua Hall and Wuying Hall, answer each other across the axis. They work like stage wings: the main position stays in the center while both sides stabilize the whole scene.',
      tagsZh: ['青龙白虎', '两翼', '拱护'],
      tagsEn: ['Dragon and Tiger', 'Twin wings', 'Support'],
    },
    back: {
      sourceZh: '《葬书》',
      sourceEn: 'The Book of Burial',
      quoteZh: '“玄武垂头。”',
      quoteEn: '"Let the Black Tortoise incline in support."',
      interpretZh: '“玄武”指背后的依托。中国古建筑重视“后有靠”，不是为了把空间堵死，而是让整条序列在结尾处有收束、有落点，前面展开的气势到这里能够安定下来。',
      interpretEn: 'The Black Tortoise refers to the backing behind the site. A rear support does not close space off; it gives the whole sequence a place to settle so that earlier momentum can come to rest.',
      architectureZh: '故宫北部以景山为靠，内廷之后又由御花园、神武门把序列收住。走完整条宫城轴线后，气势不是散掉，而是在后场被稳稳托住，这就是“后靠聚势”。',
      architectureEn: 'Prospect Hill backs the northern end of the palace, while the Imperial Garden and the Gate of Divine Might close the sequence. The experience does not disperse at the end; it is firmly gathered and supported.',
      tagsZh: ['靠山', '收束', '锚定'],
      tagsEn: ['Backing hill', 'Closure', 'Anchoring'],
    },
  }

  // ── SVG 节点缓存 ────────────────────────────────────────
  let svgRoot = null
  const visualEls = {}
  const hitEls = {}

  // ── Canvas 引用 ─────────────────────────────────────────
  let compassCanvas = null
  let compassCtx = null

  // ── 工具函数 ────────────────────────────────────────────
  function isZh() { return (window.state?.lang || 'zh') === 'zh' }
  function pick(zh, en) { return isZh() ? zh : en }
  function escapeText(value) {
    const source = value == null ? '' : String(value)
    return source
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  function getTheme(id) { return FENGSHUI_THEMES[id || fsState.activeTheme] }
  function getHotspot(id) { return FENGSHUI_HOTSPOTS[id] }
  function getSinologyCard(themeId) { return FENGSHUI_SINOLOGY_CARDS[themeId] || FENGSHUI_SINOLOGY_CARDS.front }
  function getLeftPanelSource() { return typeof FENGSHUI_LEFT_PANEL_DATA !== 'undefined' ? FENGSHUI_LEFT_PANEL_DATA : null }
  function getLeftPanelMode() {
    const source = getLeftPanelSource()
    if (!source) return null
    return source.modes?.[fsState.activeTheme] || source.modes?.[source.defaultMode] || null
  }
  function getEncodedVideoPath() {
    const encode = typeof encodeAssetPath === 'function' ? encodeAssetPath : (path) => path
    return encode(FENGSHUI_VIDEO_PATH)
  }

  function withAlpha(color, alpha) {
    if (!color) return `rgba(212, 180, 92, ${alpha})`
    const normalized = String(color).trim()
    if (normalized.startsWith('#')) {
      let hex = normalized.slice(1)
      if (hex.length === 3) hex = hex.split('').map((ch) => ch + ch).join('')
      if (hex.length === 6) {
        const r = parseInt(hex.slice(0, 2), 16)
        const g = parseInt(hex.slice(2, 4), 16)
        const b = parseInt(hex.slice(4, 6), 16)
        return `rgba(${r}, ${g}, ${b}, ${alpha})`
      }
    }
    const rgbMatch = normalized.match(/^rgba?\(([^)]+)\)$/i)
    if (rgbMatch) {
      const parts = rgbMatch[1].split(',').map((part) => part.trim())
      if (parts.length >= 3) {
        return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`
      }
    }
    return color
  }

  const COMPASS_POINTS = [
    { id: 'north', trigramId: 'qian', angle: -Math.PI / 2, step: 0 },
    { id: 'northeast', trigramId: 'kan', angle: -Math.PI / 4, step: 1 },
    { id: 'east', trigramId: 'zhen', angle: 0, step: 2 },
    { id: 'southeast', trigramId: 'xun', angle: Math.PI / 4, step: 3 },
    { id: 'south', trigramId: 'li', angle: Math.PI / 2, step: 4 },
    { id: 'southwest', trigramId: 'kun', angle: Math.PI * 3 / 4, step: 5 },
    { id: 'west', trigramId: 'dui', angle: Math.PI, step: 6 },
    { id: 'northwest', trigramId: 'gen', angle: Math.PI * 5 / 4, step: 7 },
  ]

  function getCompassDirectionLabel(id) {
    const labels = {
      north: ['北', 'N'],
      northeast: ['东北', 'NE'],
      east: ['东', 'E'],
      southeast: ['东南', 'SE'],
      south: ['南', 'S'],
      southwest: ['西南', 'SW'],
      west: ['西', 'W'],
      northwest: ['西北', 'NW'],
    }
    const [zh, en] = labels[id] || [id, id]
    return pick(zh, en)
  }

  function getCompassTrigramLabel(id) {
    const labels = {
      qian: ['乾', 'Qian'],
      kan: ['坎', 'Kan'],
      zhen: ['震', 'Zhen'],
      xun: ['巽', 'Xun'],
      li: ['离', 'Li'],
      kun: ['坤', 'Kun'],
      dui: ['兑', 'Dui'],
      gen: ['艮', 'Gen'],
    }
    const [zh, en] = labels[id] || [id, id]
    return pick(zh, en)
  }

  function syncFengshuiUiClasses() {
    const sideColumn = document.querySelector('.thought-side-column')
    if (sideColumn) {
      sideColumn.classList.add('fs-active')
      sideColumn.classList.remove('yy-active', 'axis-active')
    }

    const visualEl = document.getElementById('thought-side-visual')
    if (visualEl) visualEl.classList.add('fs-side-visual')

    const focusEl = document.getElementById('thought-side-focus')
    if (focusEl) focusEl.classList.add('fs-side-focus')

    const tabs = document.getElementById('thought-secondary-tabs')
    if (!tabs) return
    tabs.classList.add('fs-tabs-active')
    tabs.classList.remove('yy-tabs-active', 'axis-tabs-active')

    const controlCard = tabs.closest('.thought-control-card')
    if (controlCard) {
      controlCard.classList.add('fs-control-active')
      controlCard.classList.remove('yy-control-active', 'axis-control-active')
    }

    const detailColumn = tabs.closest('.thought-detail-column')
    if (detailColumn) {
      detailColumn.classList.add('fs-detail-active')
      detailColumn.classList.remove('yy-detail-active', 'axis-detail-active')
    }
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
    const hitFill = withAlpha(theme.color, 0.10)
    const hitStroke = withAlpha(theme.color, 0.48)
    const hoverFill = withAlpha(theme.color, 0.16)
    const hoverStroke = withAlpha(theme.color, 0.76)
    const activeFill = withAlpha(theme.color, 0.22)
    const activeStroke = withAlpha(theme.color, 0.92)
    const activeGlow = withAlpha(theme.color, 0.34)

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
      el.style.setProperty('--fs-hit-fill', hitFill)
      el.style.setProperty('--fs-hit-stroke', hitStroke)
      el.style.setProperty('--fs-hit-hover-fill', hoverFill)
      el.style.setProperty('--fs-hit-hover-stroke', hoverStroke)
      el.style.setProperty('--fs-hit-active-fill', activeFill)
      el.style.setProperty('--fs-hit-active-stroke', activeStroke)
      el.style.setProperty('--fs-hit-glow', activeGlow)
      el.style.pointerEvents = enabled ? 'auto' : 'none'
      el.style.opacity = enabled ? '1' : '0.1'
      el.classList.remove('fs-hit-theme', 'fs-hit-active', 'fs-hit-hover')
      if (enabled) {
        el.classList.add('fs-hit-theme')
      }
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
    syncFengshuiUiClasses()

    container.innerHTML = FENGSHUI_THEME_ORDER.map(id => {
      const t = FENGSHUI_THEMES[id]
      const active = fsState.activeTheme === id
      return `
        <button class="thought-secondary-tab fs-theme-btn${active ? ' active' : ''}"
                type="button" data-fs-theme="${id}"
                style="--fs-btn-color:${t.color}">
          <span class="thought-secondary-tab__main">${pick(t.titleZh, t.titleEn)}</span>
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

  function renderFengshuiVideoBody() {
    const container = document.getElementById('thought-media-body')
    if (!container) return

    const videoSrc = getEncodedVideoPath()
    container.innerHTML = `
      <div class="fs-video-card">
        <div class="fs-video-shell">
          <video class="fs-video-player" controls playsinline preload="metadata">
            <source src="${escapeText(videoSrc)}" type="video/mp4">
            ${escapeText(pick('当前浏览器不支持视频播放。', 'This browser does not support embedded video.'))}
          </video>
        </div>
        <p class="fs-video-caption">${escapeText(
          pick(
            '用一段视频把前场、金水河、左右护持与后靠聚势串成完整的空间逻辑。',
            'This video links the forecourt, river, flanking wings, and rear support into one spatial sequence.',
          )
        )}</p>
      </div>
    `
  }

  function renderFengshuiTextBody() {
    const container = document.getElementById('thought-text-body')
    if (!container) return

    const theme = getTheme()
    const hs = fsState.activeHotspot ? getHotspot(fsState.activeHotspot) : null
    const card = getSinologyCard(theme.id)
    const tags = pick(card.tagsZh, card.tagsEn) || []
    const focusNote = hs
      ? `
        <section class="fs-sinology-section fs-sinology-section--focus">
          <div class="fs-sinology-section__label">${pick('图中位置', 'Highlighted zone')}</div>
          <p class="fs-sinology-section__text">${escapeText(
            pick(`${hs.titleZh}：${hs.roleZh}`, `${hs.titleEn}: ${hs.roleEn}`)
          )}</p>
        </section>
      `
      : ''

    container.innerHTML = `
      <article class="fs-sinology-card" style="--fs-sinology-color:${theme.color}; --fs-sinology-soft:${theme.colorSoft}">
        <blockquote class="fs-sinology-quote">
          <div class="fs-sinology-quote__source">${escapeText(pick(card.sourceZh, card.sourceEn))}</div>
          <p class="fs-sinology-quote__text">${escapeText(pick(card.quoteZh, card.quoteEn))}</p>
        </blockquote>
        <section class="fs-sinology-section">
          <div class="fs-sinology-section__label">${pick('汉学解释', 'Sinological reading')}</div>
          <p class="fs-sinology-section__text">${escapeText(pick(card.interpretZh, card.interpretEn))}</p>
        </section>
        <section class="fs-sinology-section">
          <div class="fs-sinology-section__label">${pick('建筑对应', 'Architectural link')}</div>
          <p class="fs-sinology-section__text">${escapeText(pick(card.architectureZh, card.architectureEn))}</p>
        </section>
        ${focusNote}
        <div class="fs-sinology-tags">${tags.map((tag) => `<span class="fs-sinology-tag">${escapeText(tag)}</span>`).join('')}</div>
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
    const size = resizeCanvas(baguaCanvas)
    if (!size) return
    const ctx = baguaCtx
    const w = size.width
    const h = size.height
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
    const size = resizeCanvas(qiCanvas)
    if (!size) return
    const ctx = qiCtx
    const w = size.width
    const h = size.height
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
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    if (!rect || !rect.width || !rect.height) return null
    const dpr = window.devicePixelRatio || 1
    const width = Math.max(1, Math.round(rect.width))
    const height = Math.max(1, Math.round(rect.height))
    const targetWidth = Math.round(width * dpr)
    const targetHeight = Math.round(height * dpr)
    const ctx = canvas.getContext('2d')
    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth
      canvas.height = targetHeight
      // 存逻辑尺寸供绘图用
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    return { ctx, width, height }
  }

  function initCompassCanvas() {
    compassCanvas = document.getElementById('fs-compass-canvas')
    if (!compassCanvas) {
      compassCtx = null
      return
    }
    compassCtx = compassCanvas.getContext('2d')
    resizeCanvas(compassCanvas)
  }

  function stopCompassAnimation() {
    if (fsState.compassFrame) cancelAnimationFrame(fsState.compassFrame)
    fsState.compassFrame = null
  }

  function startCompassAnimation() {
    if (!compassCanvas || !compassCtx) return
    stopCompassAnimation()
    fsState.compassFrame = requestAnimationFrame(stepCompassAnimation)
  }

  function stepCompassAnimation(timestamp) {
    if (!compassCanvas || !compassCanvas.isConnected || window.state?.thoughtTab !== 'fengshui') {
      stopCompassAnimation()
      return
    }
    fsState.compassTime = timestamp
    drawCompass(timestamp / 1000)
    fsState.compassFrame = requestAnimationFrame(stepCompassAnimation)
  }

  function drawSectorBand(ctx, cx, cy, innerR, outerR, angle, spread, color, alpha) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, outerR, angle - spread, angle + spread)
    ctx.arc(cx, cy, innerR, angle + spread, angle - spread, true)
    ctx.closePath()
    ctx.fillStyle = withAlpha(color, alpha)
    ctx.fill()
    ctx.restore()
  }

  function drawArcStroke(ctx, cx, cy, radius, angle, spread, color, width, alpha) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, radius, angle - spread, angle + spread)
    ctx.strokeStyle = withAlpha(color, alpha)
    ctx.lineWidth = width
    ctx.lineCap = 'round'
    ctx.shadowColor = withAlpha(color, alpha * 0.78)
    ctx.shadowBlur = width * 1.3
    ctx.stroke()
    ctx.restore()
  }

  function pointOnQuadratic(p0, p1, p2, t) {
    const omt = 1 - t
    return {
      x: omt * omt * p0.x + 2 * omt * t * p1.x + t * t * p2.x,
      y: omt * omt * p0.y + 2 * omt * t * p1.y + t * t * p2.y,
    }
  }

  function drawParticle(ctx, point, radius, color, alpha) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2)
    ctx.fillStyle = withAlpha(color, alpha)
    ctx.shadowColor = withAlpha(color, alpha)
    ctx.shadowBlur = radius * 3.2
    ctx.fill()
    ctx.restore()
  }

  function drawCompass(time = 0) {
    if (!compassCtx || !compassCanvas) return
    const size = resizeCanvas(compassCanvas)
    if (!size) return

    const source = getLeftPanelSource()
    const mode = getLeftPanelMode()
    if (!source || !mode) return

    const ctx = compassCtx
    const w = size.width
    const h = size.height
    const cx = w / 2
    const cy = h / 2
    const radius = Math.min(w, h) * 0.385
    const bandInner = radius * 0.59
    const bandOuter = radius * 0.78
    const centerR = radius * 0.245
    const trigramR = radius * 0.54
    const directionR = radius * 1.13
    const accent = mode.accent || '#C9A34A'
    const accentBlue = '#55A9D9'
    const pulse = 0.5 + 0.5 * Math.sin(time * 1.45)
    const focusDirections = new Set(mode.compassState?.focusDirections || [])
    const focusTrigrams = new Set(mode.compassState?.focusTrigrams || [])
    const pointMap = Object.fromEntries(COMPASS_POINTS.map(point => [point.id, point]))

    ctx.clearRect(0, 0, w, h)

    const bgGlow = ctx.createRadialGradient(cx, cy, centerR * 0.5, cx, cy, radius * 1.18)
    bgGlow.addColorStop(0, 'rgba(255, 248, 229, 0.92)')
    bgGlow.addColorStop(0.56, 'rgba(255, 250, 241, 0.52)')
    bgGlow.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = bgGlow
    ctx.fillRect(0, 0, w, h)

    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, bandOuter, 0, Math.PI * 2)
    ctx.arc(cx, cy, bandInner, Math.PI * 2, 0, true)
    ctx.closePath()
    ctx.fillStyle = 'rgba(198, 219, 210, 0.13)'
    ctx.fill()
    ctx.restore()

    ;[radius, radius * 0.92, radius * 0.82, radius * 0.68, radius * 0.46].forEach((ring, index) => {
      ctx.beginPath()
      ctx.arc(cx, cy, ring, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(193, 153, 78, ${index === 0 ? 0.72 : 0.14 + (4 - index) * 0.04})`
      ctx.lineWidth = index === 0 ? 1.85 : 1
      ctx.stroke()
    })

    for (let i = 0; i < 64; i++) {
      const angle = -Math.PI / 2 + (Math.PI * 2 * i) / 64
      const isMajor = i % 8 === 0
      const startR = radius * (isMajor ? 0.91 : 0.945)
      const endR = radius * 0.985
      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(angle) * startR, cy + Math.sin(angle) * startR)
      ctx.lineTo(cx + Math.cos(angle) * endR, cy + Math.sin(angle) * endR)
      ctx.strokeStyle = withAlpha('#c7a25b', isMajor ? 0.34 : 0.18)
      ctx.lineWidth = isMajor ? 1.2 : 0.7
      ctx.stroke()
    }

    COMPASS_POINTS.forEach(point => {
      const lineStart = radius * 0.42
      const lineEnd = radius * 0.88
      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(point.angle) * lineStart, cy + Math.sin(point.angle) * lineStart)
      ctx.lineTo(cx + Math.cos(point.angle) * lineEnd, cy + Math.sin(point.angle) * lineEnd)
      ctx.strokeStyle = 'rgba(186, 157, 102, 0.20)'
      ctx.lineWidth = 1
      ctx.stroke()
    })

    COMPASS_POINTS.forEach(point => {
      if (!focusDirections.has(point.id)) return
      drawSectorBand(ctx, cx, cy, bandInner, bandOuter, point.angle, 0.31, accent, 0.12 + pulse * 0.05)
      drawArcStroke(ctx, cx, cy, bandOuter + 4, point.angle, 0.24, accent, 4.2, 0.16 + pulse * 0.12)
    })

    if (mode.compassState?.glowRing === 'flow-arc') {
      COMPASS_POINTS.forEach(point => {
        if (!focusDirections.has(point.id)) return
        drawArcStroke(ctx, cx, cy, radius * 0.97, point.angle, 0.18, accentBlue, 7.8 + pulse * 2.2, 0.15 + pulse * 0.08)
      })
    } else if (['south-arc', 'north-arc', 'left-right'].includes(mode.compassState?.glowRing)) {
      COMPASS_POINTS.forEach(point => {
        if (!focusDirections.has(point.id)) return
        drawArcStroke(ctx, cx, cy, radius * 0.97, point.angle, 0.18, accent, 8 + pulse * 2.5, 0.14 + pulse * 0.1)
      })
    }

    const south = pointMap.south
    const southeast = pointMap.southeast
    const east = pointMap.east
    const west = pointMap.west
    const north = pointMap.north

    if (mode.compassState?.axisLine === 'south-to-center' && south) {
      const start = { x: cx + Math.cos(south.angle) * radius * 0.94, y: cy + Math.sin(south.angle) * radius * 0.94 }
      const end = { x: cx, y: cy }
      ctx.beginPath()
      ctx.moveTo(start.x, start.y)
      ctx.lineTo(end.x, end.y)
      ctx.strokeStyle = withAlpha(accent, 0.28)
      ctx.lineWidth = 2
      ctx.stroke()
      const travel = (time * 0.28) % 1
      drawParticle(ctx, {
        x: start.x + (end.x - start.x) * travel,
        y: start.y + (end.y - start.y) * travel,
      }, 4.6, accent, 0.62)
    }

    if (mode.compassState?.axisLine === 'southeast-to-center' && southeast) {
      const p0 = { x: cx + Math.cos(southeast.angle) * radius * 0.95, y: cy + Math.sin(southeast.angle) * radius * 0.95 }
      const p1 = { x: cx + radius * 0.18, y: cy + radius * 0.34 }
      const p2 = { x: cx, y: cy }
      ctx.beginPath()
      ctx.moveTo(p0.x, p0.y)
      ctx.quadraticCurveTo(p1.x, p1.y, p2.x, p2.y)
      ctx.strokeStyle = withAlpha(accentBlue, 0.34)
      ctx.lineWidth = 3
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(p0.x, p0.y)
      ctx.quadraticCurveTo(p1.x, p1.y, p2.x, p2.y)
      ctx.strokeStyle = withAlpha(accent, 0.18)
      ctx.lineWidth = 1.4
      ctx.stroke()
      for (let i = 0; i < 8; i++) {
        const t = (1 + time * 0.15 - i * 0.11) % 1
        const point = pointOnQuadratic(p0, p1, p2, t)
        drawParticle(ctx, point, 2 + ((8 - i) / 8) * 2, i % 2 === 0 ? accentBlue : accent, 0.24 + (1 - t) * 0.36)
      }
    }

    if (mode.compassState?.axisLine === 'horizontal-balance' && east && west) {
      const left = { x: cx + Math.cos(west.angle) * radius * 0.66, y: cy + Math.sin(west.angle) * radius * 0.66 }
      const right = { x: cx + Math.cos(east.angle) * radius * 0.66, y: cy + Math.sin(east.angle) * radius * 0.66 }
      ctx.beginPath()
      ctx.moveTo(left.x, left.y)
      ctx.lineTo(right.x, right.y)
      ctx.strokeStyle = withAlpha(accent, 0.2)
      ctx.lineWidth = 2
      ctx.stroke()
      drawParticle(ctx, left, 5 + pulse * 1.2, accent, 0.34 + pulse * 0.16)
      drawParticle(ctx, right, 5 + pulse * 1.2, accent, 0.34 + pulse * 0.16)
    }

    if (mode.compassState?.axisLine === 'north-anchor' && north) {
      const start = { x: cx + Math.cos(north.angle) * radius * 0.94, y: cy + Math.sin(north.angle) * radius * 0.94 }
      const end = { x: cx, y: cy }
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(start.x, start.y)
      ctx.lineTo(end.x, end.y)
      ctx.strokeStyle = withAlpha(accent, 0.22)
      ctx.lineWidth = 3.4
      ctx.shadowColor = withAlpha(accent, 0.16)
      ctx.shadowBlur = 10
      ctx.stroke()
      ctx.restore()
    }

    COMPASS_POINTS.forEach(point => {
      const activeDir = focusDirections.has(point.id)
      const activeTrigram = focusTrigrams.has(point.trigramId)
      const dirPos = {
        x: cx + Math.cos(point.angle) * directionR,
        y: cy + Math.sin(point.angle) * directionR,
      }
      const trigramPos = {
        x: cx + Math.cos(point.angle) * trigramR,
        y: cy + Math.sin(point.angle) * trigramR,
      }

      const dirLabel = getCompassDirectionLabel(point.id)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = isZh()
        ? `${dirLabel.length > 1 ? 600 : 700} ${dirLabel.length > 1 ? 16 : 21}px "STKaiti","KaiTi","Noto Serif SC",serif`
        : '600 13px "Noto Serif SC", serif'
      ctx.fillStyle = activeDir ? accent : 'rgba(121, 87, 34, 0.78)'
      ctx.fillText(dirLabel, dirPos.x, dirPos.y)

      ctx.font = isZh()
        ? `${activeTrigram ? 700 : 600} ${activeTrigram ? 25 : 20}px "STKaiti","KaiTi","Noto Serif SC",serif`
        : `${activeTrigram ? 700 : 600} 12px "Noto Serif SC", serif`
      ctx.fillStyle = activeTrigram ? 'rgba(147, 96, 18, 0.96)' : 'rgba(131, 97, 46, 0.82)'
      ctx.fillText(getCompassTrigramLabel(point.trigramId), trigramPos.x, trigramPos.y)
    })

    const centerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, centerR * 1.75)
    centerGlow.addColorStop(0, withAlpha(accent, 0.16 + pulse * 0.1))
    centerGlow.addColorStop(0.62, 'rgba(255, 245, 220, 0.24)')
    centerGlow.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = centerGlow
    ctx.beginPath()
    ctx.arc(cx, cy, centerR * 1.75, 0, Math.PI * 2)
    ctx.fill()

    ctx.beginPath()
    ctx.arc(cx, cy, centerR, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255, 252, 244, 0.92)'
    ctx.fill()
    ctx.lineWidth = 2.2
    ctx.strokeStyle = withAlpha('#f0cf7c', 0.72)
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(cx, cy, centerR * 1.06, 0, Math.PI * 2)
    ctx.strokeStyle = withAlpha(accent, 0.18 + pulse * 0.14)
    ctx.lineWidth = 5.4
    ctx.stroke()

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = isZh()
      ? `700 ${Math.round(centerR * 0.82)}px "STKaiti","KaiTi","Noto Serif SC",serif`
      : `700 ${Math.round(centerR * 0.3)}px "Noto Serif SC", serif`
    ctx.fillStyle = 'rgba(176, 111, 18, 0.92)'
    ctx.fillText(
      pick(mode.compassState?.centerTextZh || source.compass.centerDefaultZh, mode.compassState?.centerTextEn || source.compass.centerDefaultEn),
      cx,
      cy + 2
    )
  }

  // ── 13. 左侧面板渲染（接管 thought-side-visual / focus）─

  function renderSidePanel() {
    const visualEl = document.getElementById('thought-side-visual')
    const focusEl = document.getElementById('thought-side-focus')
    const titleEl = document.getElementById('thought-side-title')
    const descEl = document.getElementById('thought-side-desc')
    const eyebrowEl = document.getElementById('thought-side-eyebrow')
    const source = getLeftPanelSource()
    const mode = getLeftPanelMode()
    syncFengshuiUiClasses()
    if (!source || !mode) return

    if (titleEl) titleEl.textContent = pick(source.panelTitleZh, source.panelTitleEn)
    if (eyebrowEl) eyebrowEl.textContent = pick('风水格局', 'Feng Shui Layout')
    if (descEl) descEl.textContent = pick(
      source.panelDescZh,
      source.panelDescEn
    )

    if (visualEl) {
      visualEl.classList.add('fs-side-visual')
      visualEl.innerHTML = `
        <section class="fs-compass-card" style="--fs-mode-accent:${mode.accent}; --fs-mode-soft:${mode.accentSoft}; --fs-mode-glow:${mode.accentGlow || mode.accentSoft};">
          <div class="fs-compass-card__head">
            <span class="fs-compass-card__kicker">${pick(mode.titleZh, mode.titleEn)}</span>
            <span class="fs-compass-card__summary">${pick(mode.footerSummaryZh, mode.footerSummaryEn)}</span>
          </div>
          <canvas id="fs-compass-canvas" class="fs-compass-canvas"></canvas>
        </section>
      `
      initCompassCanvas()
    }

    if (focusEl) {
      const tags = pick(mode.tagsZh, mode.tagsEn) || []
      const badges = pick(mode.footerBadgesZh, mode.footerBadgesEn) || []
      focusEl.classList.add('fs-side-focus')
      focusEl.innerHTML = `
        <article class="fs-side-note" style="--fs-mode-accent:${mode.accent}; --fs-mode-soft:${mode.accentSoft};">
          <div class="fs-side-note__head">
            <div class="fs-side-note__title">${pick(mode.titleZh, mode.titleEn)}</div>
            <div class="fs-side-note__subtitle">${pick(mode.subtitleZh, mode.subtitleEn)}</div>
          </div>
          <p class="fs-side-note__lead">${pick(mode.shortNoteZh, mode.shortNoteEn)}</p>
          <p class="fs-side-note__detail">${pick(mode.detailZh, mode.detailEn)}</p>
          <div class="fs-side-tags">${tags.map(tag => `<span class="fs-side-tag">${tag}</span>`).join('')}</div>
          <div class="fs-side-badges">${badges.map(badge => `<span class="fs-side-badge">${badge}</span>`).join('')}</div>
        </article>
      `
    }
  }

  // ── 14. Stage 上方装饰与摘要 ──────────────────────────

  function renderStageDecor() {
    const decorEl = document.getElementById('thought-stage-decor')
    if (!decorEl) return
    decorEl.innerHTML = ''
  }

  // ── 15. 顶栏与全局 header 更新 ────────────────────────

  function renderHeader() {
    const kickerEl = document.getElementById('thought-module-kicker')
    const titleEl = document.getElementById('thought-module-title')
    const statusEl = document.getElementById('thought-module-status')
    const stageEyebrow = document.getElementById('thought-stage-eyebrow')
    const stageTitle = document.getElementById('thought-stage-title')
    const stageHint = document.getElementById('thought-stage-hint')
    const controlEyebrow = document.getElementById('thought-control-eyebrow')
    const controlTitle = document.getElementById('thought-control-title')
    const mediaEyebrow = document.getElementById('thought-media-eyebrow')
    const mediaTitle = document.getElementById('thought-media-title')
    const textEyebrow = document.getElementById('thought-text-eyebrow')
    const textTitle = document.getElementById('thought-text-title')

    const theme = getTheme()
    const hotspot = fsState.activeHotspot ? getHotspot(fsState.activeHotspot) : null
    if (kickerEl) kickerEl.textContent = pick('堪舆哲思', 'Spatial Thought')
    if (titleEl) titleEl.textContent = pick('风水格局', 'Feng Shui Logic')
    if (statusEl) statusEl.textContent = pick('前场明堂 · 水脉导气 · 左右护持 · 后靠聚势', 'Forecourt · Water · Guard · Rear Support')
    if (stageEyebrow) stageEyebrow.textContent = 'Overview'
    if (stageTitle) stageTitle.textContent = pick('宫城风水格局图', 'Palace Feng Shui Layout')
    if (stageHint) {
      stageHint.textContent = hotspot
        ? pick('当前高亮节点已联动左侧气脉与右侧说明，可继续点击其他区域切换。', 'The highlighted zone is synced with the side panels. Click another area to continue exploring.')
        : pick('点击地图中的高亮区域，查看对应风水节点的方位、气脉与说明。', 'Click any highlighted zone on the map to inspect its directional role, qi profile, and explanation.')
    }
    if (controlEyebrow) controlEyebrow.textContent = pick('格局主题', 'Layout Theme')
    if (controlTitle) controlTitle.textContent = pick('主题切换', 'Theme Switch')
    if (mediaEyebrow) mediaEyebrow.textContent = pick('格局概要', 'Layout Summary')
    if (mediaTitle) mediaTitle.textContent = pick(theme.titleZh, theme.titleEn)
    if (textEyebrow) textEyebrow.textContent = pick('内容解释', 'Interpretation')
    if (textTitle) textTitle.textContent = pick(theme.titleZh, theme.titleEn)
  }

  function renderFengshuiHeader() {
    renderHeader()

    const mediaEyebrow = document.getElementById('thought-media-eyebrow')
    const mediaTitle = document.getElementById('thought-media-title')
    const textEyebrow = document.getElementById('thought-text-eyebrow')
    const textTitle = document.getElementById('thought-text-title')
    const theme = getTheme()

    if (mediaEyebrow) mediaEyebrow.textContent = pick('文化视频', 'Culture Video')
    if (mediaTitle) mediaTitle.textContent = pick('风水格局', 'Feng Shui Layout')
    if (textEyebrow) textEyebrow.textContent = pick('汉学解读', 'Sinological Interpretation')
    if (textTitle) textTitle.textContent = pick(theme.titleZh, theme.titleEn)
  }

  // ── 16. 统一渲染 ──────────────────────────────────────

  function renderAll() {
    renderFengshuiHeader()
    renderSecondaryButtons()
    renderStatusList()
    renderSidePanel()
    renderFengshuiVideoBody()
    renderFengshuiTextBody()
    renderStageDecor()
    startCompassAnimation()
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
