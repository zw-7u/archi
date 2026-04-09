/* =====================================================
   js/yinyang.js — 阴阳五行 交互模块（重构版）
   依赖：app.js (state, isZh, escapeHTML, encodeAssetPath)
         yinyang-data.js (YY_BTN_GROUPS, YY_ITEMS, YY_ANCHORS, ...)
   方案：PNG底图 + overlay-only.svg 叠加交互层
   ===================================================== */
   ;(function () {
    'use strict'
  
    const SVG_W = 987.436, SVG_H = 1398.857
  
    /* ---------- 模块状态 ---------- */
    const yy = {
      activeBtn: 'earth',
      expandedGroup: null,   // accordion 展开的组
      _injected: false,
      _mapInjected: false,
    }
    window._yyState = yy
  
    /* ---------- helpers ---------- */
    function item()    { return YY_ITEMS[yy.activeBtn] || YY_ITEMS.earth }
    function p(zh, en) { return (typeof isZh === 'function' && isZh()) ? zh : en }
    function esc(v)    { return typeof escapeHTML === 'function' ? escapeHTML(v) : String(v || '') }
    function $(sel, ctx) { return (ctx || document).querySelector(sel) }
    function leftPanelData() { return typeof LEFT_PANEL_DATA !== 'undefined' ? LEFT_PANEL_DATA : null }

    const LEFT_PANEL_RELATION_MAP = {
      shengke: 'sheng',
      xiangke: 'ke',
      waterfire: 'special',
    }

    const LEFT_PANEL_ACCENTS = {
      default: { solid: '#b88a35', soft: '#e8cf97', glow: 'rgba(184,138,53,0.26)' },
      yang: { solid: '#c4864d', soft: '#efd1a8', glow: 'rgba(196,134,77,0.28)' },
      yin: { solid: '#7d95ab', soft: '#cad8e1', glow: 'rgba(125,149,171,0.28)' },
      wood: { solid: '#5a9a60', soft: '#cde3ca', glow: 'rgba(90,154,96,0.28)' },
      fire: { solid: '#c86a30', soft: '#efc8b2', glow: 'rgba(200,106,48,0.28)' },
      earth: { solid: '#b88a35', soft: '#ead7a9', glow: 'rgba(184,138,53,0.28)' },
      metal: { solid: '#8b8a81', soft: '#ddd8ce', glow: 'rgba(139,138,129,0.26)' },
      water: { solid: '#5080b0', soft: '#cad8eb', glow: 'rgba(80,128,176,0.28)' },
      sheng: { solid: '#b88a35', soft: '#ead7a9', glow: 'rgba(184,138,53,0.28)' },
      ke: { solid: '#8d6653', soft: '#ddc7bb', glow: 'rgba(141,102,83,0.24)' },
      special: { solid: '#5e8ab4', soft: '#cfdded', glow: 'rgba(94,138,180,0.26)' },
    }

    const LEFT_PANEL_WUXING_POSITIONS = {
      wood:  { x: 150, y: 58,  label: '木' },
      fire:  { x: 236, y: 120, label: '火' },
      earth: { x: 204, y: 228, label: '土' },
      metal: { x: 96,  y: 228, label: '金' },
      water: { x: 64,  y: 120, label: '水' },
    }

    const LEFT_PANEL_RELATION_LINES = {
      sheng: [['wood', 'fire'], ['fire', 'earth'], ['earth', 'metal'], ['metal', 'water'], ['water', 'wood']],
      ke: [['wood', 'earth'], ['earth', 'water'], ['water', 'fire'], ['fire', 'metal'], ['metal', 'wood']],
      special: [['water', 'fire']],
    }

    function getAccent(key) {
      return LEFT_PANEL_ACCENTS[key] || LEFT_PANEL_ACCENTS.default
    }

    function getCurrentRelationModeId() {
      const active = item()
      return LEFT_PANEL_RELATION_MAP[active.id] || leftPanelData()?.meta?.defaultRelationMode || 'special'
    }

    function getYinyangPanelState() {
      const source = leftPanelData()
      if (!source) return null

      const active = item()
      if (active.mode === 'yinyang') {
        return { ...source.yinyang[active.id], stateKey: active.id, accentKey: active.id }
      }

      if (active.mode === 'wuxing') {
        const elementKey = active.id
        const hint = source.yinyang.hintsByElement[elementKey] || null
        const stateKey = elementKey === 'earth' ? 'default' : (elementKey === 'metal' || elementKey === 'water' ? 'yin' : 'yang')
        return {
          ...source.yinyang[stateKey],
          stateKey,
          accentKey: elementKey,
          hint,
          activeElement: elementKey,
        }
      }

      return {
        ...source.yinyang[source.meta.defaultYinYangState],
        stateKey: source.meta.defaultYinYangState,
        accentKey: 'default',
      }
    }

    function getWuxingPanelState() {
      const source = leftPanelData()
      if (!source) return null

      const active = item()
      if (active.mode === 'wuxing') {
        const elementKey = active.id
        const element = source.wuxing.elements[elementKey] || source.wuxing.elements[source.meta.defaultWuXingElement]
        const relationKey = element.narrativeModes?.primary || source.meta.defaultRelationMode
        return {
          kind: 'element',
          elementKey,
          element,
          relationKey,
          relation: source.wuxing.relationModes[relationKey] || null,
          accentKey: elementKey,
        }
      }

      if (active.mode === 'relation') {
        const relationKey = getCurrentRelationModeId()
        return {
          kind: 'relation',
          elementKey: source.meta.defaultWuXingElement,
          element: null,
          relationKey,
          relation: source.wuxing.relationModes[relationKey] || source.wuxing.relationModes[source.meta.defaultRelationMode],
          accentKey: relationKey,
        }
      }

      const defaultElementKey = source.meta.defaultWuXingElement
      return {
        kind: 'element',
        elementKey: defaultElementKey,
        element: source.wuxing.elements[defaultElementKey],
        relationKey: source.meta.defaultRelationMode,
        relation: source.wuxing.relationModes[source.meta.defaultRelationMode],
        accentKey: defaultElementKey,
      }
    }
  
    /* ---------- 左侧面板注入 ---------- */
    function ensurePanels() {
      const col = $('.thought-side-column')
      if (!col) return
  
      if (!yy._injected) {
        const d1 = document.createElement('div')
        d1.className = 'panel-card yy-dial-panel'; d1.id = 'yy-dial-yinyang'
        d1.innerHTML = `
          <div class="yy-dial-panel__head yy-dial-panel__head--minimal">
            <h3 class="thought-card-title yy-dial-panel__title">${p('阴阳关系盘','Yin-Yang Dial')}</h3>
          </div>
          <div class="yy-dial-panel__body yy-dial-panel__body--rich" id="yy-panel-body-yy"></div>`
  
        const d2 = document.createElement('div')
        d2.className = 'panel-card yy-dial-panel'; d2.id = 'yy-dial-wuxing'
        d2.innerHTML = `
          <div class="yy-dial-panel__head yy-dial-panel__head--minimal">
            <h3 class="thought-card-title yy-dial-panel__title">${p('五行关系盘','Five Elements Dial')}</h3>
          </div>
          <div class="yy-dial-panel__body yy-dial-panel__body--rich" id="yy-panel-body-wx"></div>`
  
        col.appendChild(d1); col.appendChild(d2)
        yy._injected = true
      }
  
      // 切换面板可见性
      const sideCard = col.querySelector('.thought-side-card')
      const m2Dial = document.getElementById('m2-ritual-dial')
      const m2Track = document.getElementById('m2-track-panel')
      const yyPanels = [document.getElementById('yy-dial-yinyang'), document.getElementById('yy-dial-wuxing')]
  
      if (state.thoughtTab === 'yinyang') {
        col.classList.add('yy-active')
        col.classList.remove('axis-active')
        if (sideCard) sideCard.style.display = 'none'
        if (m2Dial) m2Dial.style.display = 'none'
        if (m2Track) m2Track.style.display = 'none'
        yyPanels.forEach(el => { if (el) el.style.display = '' })
      } else {
        col.classList.remove('yy-active')
        if (sideCard) sideCard.style.display = ''
        if (m2Dial && state.thoughtTab !== 'axis') m2Dial.style.display = 'none'
        if (m2Track && state.thoughtTab !== 'axis') m2Track.style.display = 'none'
        yyPanels.forEach(el => { if (el) el.style.display = 'none' })
      }
    }
  
    function buildTicks(count, inner, outer, clsName) {
      let html = ''
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 - Math.PI / 2
        const x1 = 150 + Math.cos(angle) * inner
        const y1 = 150 + Math.sin(angle) * inner
        const x2 = 150 + Math.cos(angle) * outer
        const y2 = 150 + Math.sin(angle) * outer
        html += `<line class="${clsName}" x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}"></line>`
      }
      return html
    }

    function buildYinyangVisual(panelState) {
      const mode = panelState?.stateKey || 'default'
      const yinOpacity = mode === 'yang' ? 0.46 : 0.94
      const yangOpacity = mode === 'yin' ? 0.46 : 0.94
      const centerGlow = mode === 'default' ? 1 : 0.72
      const yinBadge = panelState?.stateKey === 'default' ? '和' : (panelState?.title || '和')

      return `
        <div class="yy-panel-visual yy-panel-visual--yinyang yy-panel-visual--${mode}">
          <svg viewBox="0 0 300 300" aria-hidden="true">
            <defs>
              <radialGradient id="yy-panel-wash" cx="50%" cy="48%" r="68%">
                <stop offset="0%" stop-color="#fffdf8"></stop>
                <stop offset="100%" stop-color="#f6efdf"></stop>
              </radialGradient>
              <linearGradient id="yy-panel-yin" x1="12%" y1="15%" x2="88%" y2="84%">
                <stop offset="0%" stop-color="#d6e3e7"></stop>
                <stop offset="100%" stop-color="#728592"></stop>
              </linearGradient>
              <linearGradient id="yy-panel-yang" x1="12%" y1="15%" x2="88%" y2="84%">
                <stop offset="0%" stop-color="#f7ead5"></stop>
                <stop offset="100%" stop-color="#d3a068"></stop>
              </linearGradient>
              <filter id="yy-panel-soft-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="7"></feGaussianBlur>
              </filter>
            </defs>

            <circle class="yy-panel-disc" cx="150" cy="150" r="138"></circle>
            <circle class="yy-panel-ring yy-panel-ring--outer" cx="150" cy="150" r="130"></circle>
            <circle class="yy-panel-ring yy-panel-ring--mid" cx="150" cy="150" r="118"></circle>
            <circle class="yy-panel-ring yy-panel-ring--inner" cx="150" cy="150" r="102"></circle>
            ${buildTicks(72, 110, 122, 'yy-panel-tick')}
            <line class="yy-panel-axis" x1="150" y1="18" x2="150" y2="282"></line>
            <line class="yy-panel-axis" x1="18" y1="150" x2="282" y2="150"></line>

            <g class="yy-yang-stack" style="opacity:${yangOpacity}">
              <path class="yy-yang-layer yy-yang-layer--1" d="M150 28 A122 122 0 0 1 150 272 A61 61 0 0 0 150 150 A61 61 0 0 1 150 28 Z"></path>
              <path class="yy-yang-layer yy-yang-layer--2" d="M154 34 A116 116 0 0 1 154 266 A57 57 0 0 0 154 154 A57 57 0 0 1 154 34 Z"></path>
              <path class="yy-yang-layer yy-yang-layer--3" d="M160 42 A106 106 0 0 1 160 258 A52 52 0 0 0 160 160 A52 52 0 0 1 160 42 Z"></path>
              <path class="yy-yang-layer yy-yang-layer--4" d="M168 52 A94 94 0 0 1 168 248 A46 46 0 0 0 168 168 A46 46 0 0 1 168 52 Z"></path>
            </g>

            <g class="yy-yin-stack" style="opacity:${yinOpacity}">
              <path class="yy-yin-layer yy-yin-layer--1" d="M150 28 A122 122 0 0 0 150 272 A61 61 0 0 1 150 150 A61 61 0 0 0 150 28 Z"></path>
              <path class="yy-yin-layer yy-yin-layer--2" d="M146 34 A116 116 0 0 0 146 266 A57 57 0 0 1 146 154 A57 57 0 0 0 146 34 Z"></path>
              <path class="yy-yin-layer yy-yin-layer--3" d="M140 42 A106 106 0 0 0 140 258 A52 52 0 0 1 140 160 A52 52 0 0 0 140 42 Z"></path>
              <path class="yy-yin-layer yy-yin-layer--4" d="M132 52 A94 94 0 0 0 132 248 A46 46 0 0 1 132 168 A46 46 0 0 0 132 52 Z"></path>
            </g>

            <circle class="yy-panel-core-glow" cx="150" cy="150" r="18" style="opacity:${centerGlow}" filter="url(#yy-panel-soft-glow)"></circle>
            <circle class="yy-panel-core" cx="150" cy="150" r="13"></circle>
            <circle class="yy-panel-seal yy-panel-seal--top" cx="150" cy="97" r="18"></circle>
            <circle class="yy-panel-seal yy-panel-seal--bottom" cx="150" cy="204" r="21"></circle>
            <text class="yy-panel-seal-text yy-panel-seal-text--top" x="150" y="103">中</text>
            <text class="yy-panel-seal-text yy-panel-seal-text--bottom" x="150" y="211">${esc(yinBadge)}</text>
          </svg>
        </div>
      `
    }

    function buildLinePath(from, to) {
      const a = LEFT_PANEL_WUXING_POSITIONS[from]
      const b = LEFT_PANEL_WUXING_POSITIONS[to]
      if (!a || !b) return ''
      const mx = ((a.x + b.x) / 2).toFixed(2)
      const my = ((a.y + b.y) / 2 - (from === 'water' || to === 'water' ? 14 : 10)).toFixed(2)
      return `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`
    }

    function buildWuxingVisual(panelState) {
      const activeElement = panelState?.kind === 'element' ? panelState.elementKey : null
      const relationKey = panelState?.relationKey || null
      const relationLines = LEFT_PANEL_RELATION_LINES[relationKey] || []
      const activeNodes = new Set(panelState?.kind === 'relation'
        ? (relationKey === 'special' ? ['water', 'fire'] : Object.keys(LEFT_PANEL_WUXING_POSITIONS))
        : [panelState?.elementKey])

      return `
        <div class="yy-panel-visual yy-panel-visual--wuxing yy-panel-visual--${panelState?.kind || 'element'}" data-relation="${esc(relationKey || '')}">
          <svg viewBox="0 0 300 300" aria-hidden="true">
            <circle class="yy-panel-disc" cx="150" cy="150" r="138"></circle>
            <circle class="yy-panel-ring yy-panel-ring--outer" cx="150" cy="150" r="130"></circle>
            <circle class="yy-panel-ring yy-panel-ring--mid" cx="150" cy="150" r="118"></circle>
            <circle class="yy-panel-ring yy-panel-ring--inner" cx="150" cy="150" r="102"></circle>
            ${buildTicks(60, 114, 124, 'yy-panel-tick')}
            <circle class="yy-wx-core yy-wx-core--halo" cx="150" cy="150" r="36"></circle>
            <circle class="yy-wx-core" cx="150" cy="150" r="28"></circle>
            <circle class="yy-wx-core yy-wx-core--inner" cx="150" cy="150" r="18"></circle>

            <g class="yy-wx-web">
              ${Object.entries(LEFT_PANEL_WUXING_POSITIONS).map(([key, pos]) => `
                <path class="yy-wx-web-line${activeElement === key ? ' is-active' : ''}" d="M 150 150 L ${pos.x} ${pos.y}"></path>
              `).join('')}
            </g>

            <g class="yy-wx-relations yy-wx-relations--${esc(relationKey || 'none')}">
              ${relationLines.map(([from, to], index) => `
                <path class="yy-wx-relation-line${panelState?.kind === 'relation' ? ' is-visible' : ' is-soft'}" style="animation-delay:${(index * 0.16).toFixed(2)}s" d="${buildLinePath(from, to)}"></path>
              `).join('')}
            </g>

            <g class="yy-wx-dots">
              ${Object.entries(LEFT_PANEL_WUXING_POSITIONS).map(([key, pos]) => {
                const color = YY_ELEMENT_COLORS[key] || YY_ELEMENT_COLORS.earth
                const isEarth = key === 'earth'
                const isActive = activeNodes.has(key)
                const isDim = activeNodes.size && !isActive
                return `
                  <g class="yy-wx-node${isActive ? ' is-active' : ''}${isDim ? ' is-dim' : ''}${isEarth ? ' is-earth' : ''}" style="--node-fill:${color.fill};--node-stroke:${color.stroke};--node-text:${color.text}" transform="translate(${pos.x} ${pos.y})">
                    <circle class="yy-wx-node__halo" r="${isEarth ? 34 : 30}"></circle>
                    <circle class="yy-wx-node__outer" r="${isEarth ? 28 : 24}"></circle>
                    <circle class="yy-wx-node__inner" r="${isEarth ? 22 : 19}"></circle>
                    <text class="yy-wx-node__text" text-anchor="middle" dominant-baseline="middle">${pos.label}</text>
                  </g>
                `
              }).join('')}
            </g>
          </svg>
        </div>
      `
    }

    function renderYinyangPanel(panelState) {
      if (!panelState) return ''
      return `
        <div class="yy-panel-rich yy-panel-rich--visual-only" style="--yy-panel-accent:${getAccent(panelState.accentKey).solid};--yy-panel-soft:${getAccent(panelState.accentKey).soft};--yy-panel-glow:${getAccent(panelState.accentKey).glow}">
          ${buildYinyangVisual(panelState)}
        </div>
      `
    }

    function renderWuxingPanel(panelState) {
      if (!panelState) return ''
      return `
        <div class="yy-panel-rich yy-panel-rich--visual-only" style="--yy-panel-accent:${getAccent(panelState.accentKey).solid};--yy-panel-soft:${getAccent(panelState.accentKey).soft};--yy-panel-glow:${getAccent(panelState.accentKey).glow}">
          ${buildWuxingVisual(panelState)}
        </div>
      `
    }

    function renderDials() {
      const yinYangPanel = getYinyangPanelState()
      const wuxingPanel = getWuxingPanelState()

      const b1 = document.getElementById('yy-panel-body-yy')
      const b2 = document.getElementById('yy-panel-body-wx')

      if (b1) b1.innerHTML = renderYinyangPanel(yinYangPanel)
      if (b2) b2.innerHTML = renderWuxingPanel(wuxingPanel)
    }
  
    /* ---------- 中间地图（PNG + overlay SVG） ---------- */
    function ensureMap() {
      const stage = document.getElementById('thought-stage')
      const stageCard = stage?.closest('.thought-stage-card')
      const existingContainer = document.getElementById('yy-map-container')
      yy._mapInjected = Boolean(existingContainer && stage?.contains(existingContainer))
      if (!stage || yy._mapInjected) return

      // 添加 override class 使 stage 可完整显示
      if (stageCard) stageCard.classList.add('yy-stage-override')
  
      // 创建地图容器
      const container = document.createElement('div')
      container.className = 'yy-map-container'
      container.id = 'yy-map-container'
  
      // PNG 底图
      const img = document.createElement('img')
      img.className = 'yy-base-map'
      img.src = (typeof encodeAssetPath === 'function' ? encodeAssetPath : (s => s))('assets/images/map/overview.png')
      img.alt = p('故宫总览图', 'Forbidden City Overview')
      img.draggable = false
      container.appendChild(img)
  
      // overlay SVG（内联）
      const svgNS = 'http://www.w3.org/2000/svg'
      const svg = document.createElementNS(svgNS, 'svg')
      svg.setAttribute('viewBox', `0 0 ${SVG_W} ${SVG_H}`)
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
      svg.classList.add('yy-overlay-svg')
      svg.id = 'yy-overlay-svg'
  
      // 注入 overlay 内容（从 overlay-only.svg 的数据）
      svg.innerHTML = buildOverlaySVGContent()
  
      // 箭头 marker
      const defs = document.createElementNS(svgNS, 'defs')
      defs.innerHTML = `<marker id="yy-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" opacity="0.7"/></marker>`
      svg.insertBefore(defs, svg.firstChild)
  
      // 关系线图层
      const relGroup = document.createElementNS(svgNS, 'g')
      relGroup.id = 'yy-relation-lines'
      svg.appendChild(relGroup)
  
      container.appendChild(svg)
  
      // anchor 标签容器
      const anchorWrap = document.createElement('div')
      anchorWrap.id = 'yy-anchor-labels'
      anchorWrap.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:4;'
      container.appendChild(anchorWrap)
  
      // zone hover tip
      const tip = document.createElement('div')
      tip.id = 'yy-zone-tip'
      tip.className = 'yy-zone-hover-tip'
      container.appendChild(tip)
  
      // 插入到 stage（在 svg-host 同级）
      stage.appendChild(container)
  
      yy._mapInjected = true
  
      // 绑定 zone 交互
      bindZoneEvents(svg)
    }
  
    function buildOverlaySVGContent() {
      // 阴阳分区
      const yinyangPaths = `
        <g id="zones-yinyang" data-mode="yinyang">
          <path id="zone-yin" class="zone zone-yinyang"
            d="M 20,20 Q 20,8 32,8 L 955,8 Q 967,8 967,20 L 967,610 C 810,620 690,610 493.718,605 C 300,610 180,620 20,610 Z"
            fill="#000" fill-opacity="0.001" stroke="none" pointer-events="all"
            data-zone="yin" data-group="yinyang" data-label="${p('内廷（阴）','Inner Court (Yin)')}" />
          <path id="zone-yang" class="zone zone-yinyang"
            d="M 20,610 C 180,620 300,610 493.718,605 C 690,610 810,620 967,610 L 967,1379 Q 967,1391 955,1391 L 32,1391 Q 20,1391 20,1379 Z"
            fill="#000" fill-opacity="0.001" stroke="none" pointer-events="all"
            data-zone="yang" data-group="yinyang" data-label="${p('外朝（阳）','Outer Court (Yang)')}" />
        </g>`
  
      // 五行分区
      const wuxingPaths = `
        <g id="zones-wuxing" data-mode="wuxing">
          <path id="zone-water" class="zone zone-wuxing"
            d="M 360,18 L 628,18 C 742,120 830,220 870,310 L 118,310 C 158,220 246,120 360,18 Z"
            fill="#000" fill-opacity="0.001" stroke="none" pointer-events="all"
            data-zone="water" data-group="wuxing" data-label="${p('水（北）','Water (N)')}" />
          <path id="zone-earth" class="zone zone-wuxing"
            d="M 318,318 L 670,318 Q 686,318 686,334 L 686,900 Q 686,916 670,916 L 318,916 Q 302,916 302,900 L 302,334 Q 302,318 318,318 Z"
            fill="#000" fill-opacity="0.001" stroke="none" pointer-events="all"
            data-zone="earth" data-group="wuxing" data-label="${p('土（中）','Earth (C)')}" />
          <path id="zone-fire" class="zone zone-wuxing"
            d="M 118,924 L 870,924 C 840,1005 740,1185 684,1391 L 304,1391 C 248,1185 148,1005 118,924 Z"
            fill="#000" fill-opacity="0.001" stroke="none" pointer-events="all"
            data-zone="fire" data-group="wuxing" data-label="${p('火（南）','Fire (S)')}" />
          <path id="zone-metal" class="zone zone-wuxing"
            d="M 20,20 L 360,20 C 250,120 164,218 118,310 L 118,924 C 162,1010 250,1186 304,1391 L 32,1391 Q 20,1391 20,1379 Z"
            fill="#000" fill-opacity="0.001" stroke="none" pointer-events="all"
            data-zone="metal" data-group="wuxing" data-label="${p('金（西）','Metal (W)')}" />
          <path id="zone-wood" class="zone zone-wuxing"
            d="M 628,20 L 955,20 Q 967,20 967,32 L 967,1379 Q 967,1391 955,1391 L 684,1391 C 738,1186 826,1010 870,924 L 870,310 C 824,218 738,120 628,20 Z"
            fill="#000" fill-opacity="0.001" stroke="none" pointer-events="all"
            data-zone="wood" data-group="wuxing" data-label="${p('木（东）','Wood (E)')}" />
        </g>`
  
      return `<g id="overlay-yinyang-wuxing">${yinyangPaths}${wuxingPaths}</g>`
    }
  
    function cleanupMap() {
      const container = document.getElementById('yy-map-container')
      if (container) container.remove()
      const stageCard = document.querySelector('.thought-stage-card.yy-stage-override')
      if (stageCard) stageCard.classList.remove('yy-stage-override')
      const sideCard = document.querySelector('.thought-side-column .thought-side-card')
      if (sideCard) sideCard.style.display = ''
      const svgHost = document.getElementById('thought-svg-host')
      if (svgHost) delete svgHost.dataset.currentFile
      yy._mapInjected = false
      cleanupRightPanel()
    }
  
    /* ---------- Zone 高亮 ---------- */
    function renderZones() {
      const svg = document.getElementById('yy-overlay-svg')
      if (!svg) return
      const it = item()
      const allZones = svg.querySelectorAll('.zone')
      const yinyangGroup = svg.querySelector('#zones-yinyang')
      const wuxingGroup = svg.querySelector('#zones-wuxing')
  
      // 重置
      allZones.forEach(z => {
        z.classList.remove('yy-dim', 'yy-glow')
        z.setAttribute('fill', '#000')
        z.setAttribute('fill-opacity', '0.001')
        z.setAttribute('stroke', 'none')
        z.style.removeProperty('--yy-glow')
      })
  
      if (it.mode === 'yinyang') {
        if (yinyangGroup) yinyangGroup.style.display = ''
        if (wuxingGroup) wuxingGroup.style.display = 'none'
        const target = svg.querySelector('#' + it.zoneId)
        if (target) {
          target.setAttribute('fill', it.zoneColor)
          target.setAttribute('fill-opacity', '1')
          target.setAttribute('stroke', it.zoneStroke)
          target.setAttribute('stroke-width', '3')
          target.style.setProperty('--yy-glow', it.zoneGlow)
          target.classList.add('yy-glow')
        }
        allZones.forEach(z => {
          if (z.dataset.group === 'yinyang' && z.id !== it.zoneId) z.classList.add('yy-dim')
        })
      } else if (it.mode === 'wuxing') {
        if (yinyangGroup) yinyangGroup.style.display = 'none'
        if (wuxingGroup) wuxingGroup.style.display = ''
        const target = svg.querySelector('#' + it.zoneId)
        if (target) {
          target.setAttribute('fill', it.zoneColor)
          target.setAttribute('fill-opacity', '1')
          target.setAttribute('stroke', it.zoneStroke)
          target.setAttribute('stroke-width', '3')
          target.style.setProperty('--yy-glow', it.zoneGlow)
          target.classList.add('yy-glow')
        }
        allZones.forEach(z => {
          if (z.dataset.group === 'wuxing' && z.id !== it.zoneId) z.classList.add('yy-dim')
        })
      } else {
        // relation mode
        if (yinyangGroup) yinyangGroup.style.display = 'none'
        if (wuxingGroup) wuxingGroup.style.display = ''
        if (it.highlightZones) {
          it.highlightZones.forEach(zid => {
            const z = svg.querySelector('#' + zid)
            if (!z) return
            const elem = zid.replace('zone-', '')
            const ec = YY_ELEMENT_COLORS[elem]
            if (ec) {
              z.setAttribute('fill', ec.fill)
              z.setAttribute('fill-opacity', '1')
              z.setAttribute('stroke', ec.stroke)
              z.setAttribute('stroke-width', '2.5')
            }
            z.classList.add('yy-glow')
          })
          allZones.forEach(z => {
            if (z.dataset.group === 'wuxing' && !it.highlightZones.includes(z.id)) z.classList.add('yy-dim')
          })
        } else {
          // shengke/xiangke: light all five
          allZones.forEach(z => {
            if (z.dataset.group !== 'wuxing') return
            const elem = z.dataset.zone
            const ec = YY_ELEMENT_COLORS[elem]
            if (ec) {
              z.setAttribute('fill', ec.fill)
              z.setAttribute('fill-opacity', '0.6')
              z.setAttribute('stroke', ec.stroke)
              z.setAttribute('stroke-width', '2')
            }
          })
        }
      }
    }
  
    /* ---------- 关系线 ---------- */
    function renderRelationLines() {
      const svg = document.getElementById('yy-overlay-svg')
      const g = svg?.querySelector('#yy-relation-lines')
      if (!g) return
      g.innerHTML = ''
      const it = item()
      if (!it.relLines) return
  
      const svgNS = 'http://www.w3.org/2000/svg'
      it.relLines.forEach((pair, i) => {
        const a = YY_ANCHORS[pair[0]]
        const b = YY_ANCHORS[pair[1]]
        if (!a || !b) return
        const line = document.createElementNS(svgNS, 'line')
        line.setAttribute('x1', a.cx); line.setAttribute('y1', a.cy)
        line.setAttribute('x2', b.cx); line.setAttribute('y2', b.cy)
        line.setAttribute('stroke', it.relColor || 'rgba(180,140,60,0.7)')
        line.setAttribute('marker-end', 'url(#yy-arrow)')
        line.classList.add('yy-relation-line')
        if (it.id === 'shengke') {
          line.classList.add('is-animated')
          line.style.animationDelay = `${i * 0.3}s`
          line.style.opacity = '1'
        } else {
          line.classList.add('is-visible')
        }
        g.appendChild(line)
      })
    }
  
    /* ---------- Anchor 标签 ---------- */
    function renderAnchors() {
      const wrap = document.getElementById('yy-anchor-labels')
      if (!wrap) return
      const it = item()
  
      if (it.mode === 'wuxing' || it.mode === 'relation') {
        const elements = ['wood','fire','earth','metal','water']
        const labels = {
          wood: p('木·东','Wood·E'), fire: p('火·南','Fire·S'),
          earth: p('土·中','Earth·C'), metal: p('金·西','Metal·W'), water: p('水·北','Water·N')
        }
        wrap.innerHTML = elements.map(e => {
          const anc = YY_ANCHORS['anchor-' + e]
          if (!anc) return ''
          const vis = (it.mode === 'relation' || it.id === e) ? ' is-visible' : ''
          const left = `${(anc.cx / SVG_W) * 100}%`
          const top = `${(anc.cy / SVG_H) * 100}%`
          return `<span class="yy-anchor-label yy-anchor-label--${e}${vis}" style="left:${left};top:${top};">${labels[e]}</span>`
        }).join('')
      } else {
        // 阴阳模式
        wrap.innerHTML = `
          <span class="yy-anchor-label yy-anchor-label--fire is-visible" style="left:50%;top:78%;">${p('南·阳','S·Yang')}</span>
          <span class="yy-anchor-label yy-anchor-label--water is-visible" style="left:50%;top:18%;">${p('北·阴','N·Yin')}</span>`
      }
    }
  
    /* ---------- Zone 交互事件 ---------- */
    function bindZoneEvents(svg) {
      const zones = svg.querySelectorAll('.zone')
      zones.forEach(z => {
        z.addEventListener('click', (e) => {
          if (state.thoughtTab !== 'yinyang') return
          e.stopPropagation()
          const key = z.dataset.zone
          if (YY_ITEMS[key]) selectBtn(key)
        })
        z.addEventListener('mouseenter', (e) => {
          if (state.thoughtTab !== 'yinyang') return
          showZoneTip(e, z.dataset.label || '')
        })
        z.addEventListener('mousemove', (e) => {
          if (state.thoughtTab !== 'yinyang') return
          showZoneTip(e, z.dataset.label || '')
        })
        z.addEventListener('mouseleave', hideZoneTip)
      })
    }
  
    function showZoneTip(event, text) {
      const tip = document.getElementById('yy-zone-tip')
      if (!tip) return
      tip.textContent = text
      tip.classList.add('is-visible')
      const container = document.getElementById('yy-map-container')
      if (container) {
        const rect = container.getBoundingClientRect()
        tip.style.left = `${event.clientX - rect.left}px`
        tip.style.top = `${event.clientY - rect.top}px`
      }
    }
    function hideZoneTip() {
      const tip = document.getElementById('yy-zone-tip')
      if (tip) tip.classList.remove('is-visible')
    }
  
    /* ---------- 右侧 accordion 按钮 ---------- */
    function renderButtons() {
      const c = document.getElementById('thought-secondary-tabs')
      if (!c) return
  
      c.classList.add('yy-tabs-active')
      const controlCard = c.closest('.thought-control-card')
      if (controlCard) controlCard.classList.add('yy-control-active')

      c.innerHTML = YY_BTN_GROUPS.map(g => {
        const expanded = yy.expandedGroup === g.id
        return `
          <div class="yy-accordion-group${expanded ? ' is-expanded' : ''}" data-yy-group="${g.id}">
            <button class="yy-accordion-header" type="button" data-yy-toggle="${g.id}" aria-expanded="${expanded ? 'true' : 'false'}">
              <span>${esc(p(g.groupZh, g.groupEn))}</span>
              <span class="yy-accordion-arrow">›</span>
            </button>
            <div class="yy-accordion-body">
              ${g.ids.map(id => {
                const it = YY_ITEMS[id]
                const hsl = it.dotColor || '42,55%,48%'
                return `<button class="yy-btn${yy.activeBtn === id ? ' is-active' : ''}" type="button" data-yy-btn="${id}"><span class="yy-btn__dot" style="background:hsl(${hsl});"></span>${esc(p(it.labelZh, it.labelEn))}</button>`
              }).join('')}
            </div>
          </div>`
      }).join('')
    }
  
    /** 清理右侧 panel 的 yy class */
    function cleanupRightPanel() {
      const c = document.getElementById('thought-secondary-tabs')
      if (c) c.classList.remove('yy-tabs-active')
      const controlCard = c?.closest('.thought-control-card')
      if (controlCard) controlCard.classList.remove('yy-control-active')
      yy.expandedGroup = null
    }
  
    /* ---------- 视频 ---------- */
    function renderMedia() {
      const body = document.getElementById('thought-media-body')
      const ey = document.getElementById('thought-media-eyebrow')
      const ti = document.getElementById('thought-media-title')
      if (!body) return
      if (ey) ey.textContent = p('宇宙结构图', 'Cosmic Diagram')
      if (ti) ti.textContent = p('阴阳五行', 'Yin-Yang & Five Elements')
  
      const encode = typeof encodeAssetPath === 'function' ? encodeAssetPath : (s => s)
      const videoSrc = encode(`${YY_VIDEO_PATH}.mp4`)
  
      body.innerHTML = `
        <div class="yy-video-wrap" data-video-lightbox-src="${esc(videoSrc)}" role="button" tabindex="0">
          <video preload="metadata" muted playsinline>
            <source src="${esc(videoSrc)}" type="video/mp4">
          </video>
          <div class="yy-video-overlay">
            <div class="yy-video-play-icon"></div>
          </div>
        </div>`
    }
  
    /* ---------- 底部卡片 ---------- */
    function renderCard() {
      const body = document.getElementById('thought-text-body')
      const ey = document.getElementById('thought-text-eyebrow')
      const ti = document.getElementById('thought-text-title')
      if (!body) return
      const it = item(), cd = it.card
      const zhMode = typeof isZh === 'function' ? isZh() : true
      const wuxingState = getWuxingPanelState()
      const narrative = it.mode === 'yinyang'
        ? getYinyangPanelState()
        : (wuxingState?.kind === 'relation' ? wuxingState?.relation : wuxingState?.element)
      const summary = zhMode
        ? (narrative?.shortText || cd.briefZh || '')
        : (cd.briefEn || cd.briefZh || '')
      const bodyParts = (zhMode
        ? [narrative?.desc, narrative?.sceneSentence, cd.bodyZh]
        : [cd.bodyEn || cd.bodyZh]
      ).map(part => String(part || '').trim()).filter(Boolean)
      const content = Array.from(new Set(bodyParts)).join('\n\n')
      const tags = Array.from(new Set([
        ...((zhMode ? narrative?.tags : cd.tagsEn) || []),
        ...((zhMode ? cd.tagsZh : cd.tagsEn) || []),
      ].filter(Boolean))).slice(0, 3)
      if (ey) ey.textContent = it.mode === 'yinyang'
        ? p('阴阳关系盘', 'Yin-Yang Dial')
        : p('五行关系盘', 'Five Elements Dial')
      if (ti) ti.textContent = p(cd.titleZh, cd.titleEn)
      body.innerHTML = `
        <div class="yy-card">
          <p class="yy-card__summary">${esc(summary)}</p>
          <p class="yy-card__body">${esc(content)}</p>
          <div class="yy-card__tags">${tags.map(t => `<span class="yy-card__tag">${esc(t)}</span>`).join('')}</div>
        </div>`
    }
  
    /* ---------- Status bar ---------- */
    function renderStatus() {
      const c = document.getElementById('thought-status-list')
      if (!c) return
      const it = item()
      c.innerHTML = `<span class="thought-status-item"><span class="thought-status-item__dot" style="--dot-color:${it.zoneStroke || '#b88a35'};"></span>${esc(p(it.labelZh, it.labelEn))}</span>`
    }
  
    /* ---------- 总渲染 ---------- */
    function renderModule() {
      ensurePanels()
      if (state.thoughtTab !== 'yinyang') {
        cleanupMap()
        return
      }
  
      // 隐藏原有 svg-host（CSS 也做了，但 JS 层确保清空）
      const svgHost = document.getElementById('thought-svg-host')
      if (svgHost) svgHost.innerHTML = ''
  
      // 清空 decor 层（由 CSS 隐藏，但也清空内容防残留）
      const decor = document.getElementById('thought-stage-decor')
      if (decor) decor.innerHTML = ''
  
      ensureMap()
      renderDials()
      renderButtons()
      renderStatus()
      renderMedia()
      renderCard()
      renderZones()
      renderAnchors()
  
      const it = item()
      if (it.relLines) renderRelationLines()
      else {
        const g = document.querySelector('#yy-relation-lines')
        if (g) g.innerHTML = ''
      }
  
      // 顶部文案
      const st = document.getElementById('thought-stage-title')
      const sh = document.getElementById('thought-stage-hint')
      const ct = document.getElementById('thought-control-title')
      const ce = document.getElementById('thought-control-eyebrow')
      if (st) st.textContent = p('阴阳五行分区视图', 'Yin-Yang Five Elements View')
      if (sh) sh.innerHTML = `<span style="color:var(--ink-soft);font-size:12.5px;">${p('点击右侧按钮或地图区域，查看阴阳五行空间逻辑。', 'Click buttons or map zones to explore spatial logic.')}</span>`
      if (ct) ct.textContent = p('模式切换', 'View Mode')
      if (ce) ce.textContent = p('阴阳五行', 'Yin-Yang & Five Elements')
    }
  
    /* ---------- 交互 ---------- */
    function selectBtn(key) {
      if (!YY_ITEMS[key]) return
      yy.activeBtn = key
      // 自动展开对应 accordion 组
      const group = YY_BTN_GROUPS.find(g => g.ids.includes(key))
      if (group) yy.expandedGroup = group.id
      renderModule()
    }
  
    function toggleAccordion(groupId) {
      if (!YY_BTN_GROUPS.some(g => g.id === groupId)) return
      yy.expandedGroup = yy.expandedGroup === groupId ? null : groupId
      renderButtons()
    }
  
    /* ---------- 事件代理 ---------- */
    function setupEvents() {
      // accordion toggle（按钮选中由 app.js 的通用事件委托处理，避免重复渲染）
      document.addEventListener('click', e => {
        // accordion 展开/收起
        const toggle = e.target.closest('[data-yy-toggle]')
        if (toggle) {
          e.preventDefault()
          toggleAccordion(toggle.dataset.yyToggle)
        }
      })

      // tab 切换时：离开 yinyang 时清理，进入 yinyang 时渲染
      document.addEventListener('click', e => {
        const tab = e.target.closest('[data-thought-tab]')
        if (!tab) return
        // 如果正要切离 yinyang，立即清理地图
        if (state.thoughtTab === 'yinyang' && tab.dataset.thoughtTab !== 'yinyang') {
          cleanupMap()
        }
      }, true)  // capture phase: runs BEFORE app.js's bubbling handler
    }
  
    /* ---------- 接入系统 ---------- */
    function init() {
      setupEvents()

      // 初始渲染
      setTimeout(() => {
        if (state.module === 'thought' && state.thoughtTab === 'yinyang') {
          renderModule()
        }
      }, 400)
    }

    /* ---------- Init ---------- */
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => setTimeout(init, 300))
    } else {
      setTimeout(init, 300)
    }
  
    window.YinyangModule = { selectBtn, render: renderModule, state: yy }
  })()
