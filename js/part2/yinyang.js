/* =====================================================
   js/yinyang.js — 阴阳五行 交互模块
   依赖：app.js, yinyang-data.js
   用法：将 overview-with-overlay.svg 替换 assets/images/map/overview.svg
         在 index.html 引入 yinyang-data.js + yinyang.js + yinyang.css
   ===================================================== */
;(function () {
  'use strict'

  const SVG_W = 987.436, SVG_H = 1398.857

  /* ---------- 模块状态 ---------- */
  const yy = {
    activeBtn: 'earth',          // 当前选中按钮 key
    _injected: false,
    _yyDialPanel: null,
    _wxDialPanel: null,
    _yyCanvas: null,
    _wxCanvas: null,
    _relGroup: null,             // SVG <g> for relation lines
    _arrowDef: false,
  }
  window._yyState = yy

  /* ---------- helpers ---------- */
  function item()   { return YY_ITEMS[yy.activeBtn] || YY_ITEMS.earth }
  function p(zh,en) { return (typeof isZh==='function' && isZh()) ? zh : en }
  function esc(v)   { return typeof escapeHTML==='function' ? escapeHTML(v) : String(v||'') }

  function getSvg() {
    const host = document.getElementById('thought-svg-host')
    return host ? host.querySelector('svg') : null
  }

  /* anchor 屏幕坐标 → 百分比 */
  function anchorPct(anchorId) {
    const svg = getSvg()
    if (!svg) return null
    const el = svg.getElementById(anchorId)
    if (!el) return null
    const cx = parseFloat(el.getAttribute('cx'))
    const cy = parseFloat(el.getAttribute('cy'))
    return { left: `${(cx/SVG_W)*100}%`, top: `${(cy/SVG_H)*100}%`, cx, cy }
  }

  /* ---------- 左侧面板注入 ---------- */
  function ensurePanels() {
    const col = document.querySelector('.thought-side-column')
    if (!col) return

    if (!yy._injected) {
      // 阴阳表盘
      const d1 = document.createElement('div')
      d1.className = 'panel-card yy-dial-panel'; d1.id = 'yy-dial-yinyang'
      d1.innerHTML = `<div class="yy-dial-panel__head"><span class="panel-head__eyebrow">阴阳表盘</span><h3 class="thought-card-title" id="yy-dial-yy-title">阴阳</h3></div><div class="yy-dial-panel__body"><div class="yy-dial-canvas-wrap"><canvas id="yy-canvas-yinyang" width="220" height="220"></canvas></div></div>`
      // 五行表盘
      const d2 = document.createElement('div')
      d2.className = 'panel-card yy-dial-panel'; d2.id = 'yy-dial-wuxing'
      d2.innerHTML = `<div class="yy-dial-panel__head"><span class="panel-head__eyebrow">五行表盘</span><h3 class="thought-card-title" id="yy-dial-wx-title">五行</h3></div><div class="yy-dial-panel__body"><div class="yy-dial-canvas-wrap"><canvas id="yy-canvas-wuxing" width="220" height="220"></canvas></div></div>`
      col.appendChild(d1); col.appendChild(d2)
      yy._yyDialPanel = d1; yy._wxDialPanel = d2
      yy._yyCanvas = d1.querySelector('canvas')
      yy._wxCanvas = d2.querySelector('canvas')
      yy._injected = true
    }

    const sideCard = col.querySelector('.thought-side-card')
    // 也兼容 module2 的面板
    const m2Dial = document.getElementById('m2-ritual-dial')
    const m2Track = document.getElementById('m2-track-panel')
    if (state.thoughtTab === 'yinyang') {
      col.classList.add('yy-active')
      col.classList.remove('axis-active')
      if (sideCard) sideCard.style.display = 'none'
      if (m2Dial) m2Dial.style.display = 'none'
      if (m2Track) m2Track.style.display = 'none'
      if (yy._yyDialPanel) yy._yyDialPanel.style.display = ''
      if (yy._wxDialPanel) yy._wxDialPanel.style.display = ''
    } else {
      col.classList.remove('yy-active')
      if (yy._yyDialPanel) yy._yyDialPanel.style.display = 'none'
      if (yy._wxDialPanel) yy._wxDialPanel.style.display = 'none'
    }
  }

  /* ---------- Canvas 表盘绘制 ---------- */
  function drawDial(canvas, centerText, descText, colorHue, isYinyang) {
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const w = 220, h = 220
    canvas.width = w * dpr; canvas.height = h * dpr
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px'
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    ctx.clearRect(0,0,w,h)
    const cx = w/2, cy = h/2, R = 86

    // 外圈
    ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2)
    ctx.strokeStyle = `hsla(${colorHue},40%,55%,0.25)`; ctx.lineWidth = 2; ctx.stroke()

    // 内圈
    ctx.beginPath(); ctx.arc(cx,cy,R*0.62,0,Math.PI*2)
    ctx.strokeStyle = `hsla(${colorHue},40%,55%,0.12)`; ctx.lineWidth = 1; ctx.stroke()

    // 刻度
    for (let i = 0; i < (isYinyang ? 8 : 5); i++) {
      const a = (i/(isYinyang ? 8 : 5)) * Math.PI*2 - Math.PI/2
      const x1 = cx + Math.cos(a)*(R-6), y1 = cy + Math.sin(a)*(R-6)
      const x2 = cx + Math.cos(a)*(R+2), y2 = cy + Math.sin(a)*(R+2)
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2)
      ctx.strokeStyle = `hsla(${colorHue},30%,55%,0.35)`; ctx.lineWidth = 2; ctx.stroke()
    }

    if (isYinyang) {
      // 太极弧
      ctx.save(); ctx.globalAlpha = 0.08
      ctx.beginPath(); ctx.arc(cx, cy - R*0.28, R*0.28, 0, Math.PI, true)
      ctx.arc(cx, cy + R*0.28, R*0.28, 0, Math.PI, false)
      ctx.arc(cx, cy, R*0.56, Math.PI*1.5, Math.PI*0.5, false)
      ctx.fillStyle = `hsl(${colorHue},30%,45%)`; ctx.fill(); ctx.restore()
    } else {
      // 五角外圈指示
      const elements = ['木','火','土','金','水']
      const colors = ['#5a9a60','#c86a30','#b88a35','#a09880','#5080b0']
      for (let i = 0; i < 5; i++) {
        const a = (i/5)*Math.PI*2 - Math.PI/2
        const x = cx + Math.cos(a)*(R+14), y = cy + Math.sin(a)*(R+14)
        ctx.fillStyle = colors[i]; ctx.globalAlpha = 0.55
        ctx.font = '11px "STKaiti","KaiTi",serif'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(elements[i], x, y)
        ctx.globalAlpha = 1
      }
    }

    // 中心文字
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.font = 'bold 22px "STKaiti","KaiTi","Noto Serif SC",serif'
    ctx.fillStyle = `hsl(${colorHue},35%,35%)`
    ctx.fillText(centerText, cx, cy - 8)

    // 描述文字（自动换行）
    ctx.font = '11px "Noto Sans SC",sans-serif'
    ctx.fillStyle = `hsla(${colorHue},20%,40%,0.75)`
    const words = descText.split('')
    const maxW = R * 1.4
    let line = '', ly = cy + 18
    for (const ch of words) {
      const test = line + ch
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, cx, ly); ly += 15; line = ch
      } else { line = test }
    }
    if (line) ctx.fillText(line, cx, ly)
  }

  function renderDials() {
    const it = item()
    const yyData = it.dialYinyang
    const wxData = it.dialWuxing
    const hue = it.mode === 'yinyang' ? (it.id === 'yang' ? 35 : 210) :
                it.mode === 'wuxing' ? ({wood:130,fire:18,earth:42,metal:45,water:215}[it.id]||42) : 280
    drawDial(yy._yyCanvas, p(yyData.centerZh,yyData.centerEn), p(yyData.descZh,yyData.descEn), it.id==='yin'?210:hue, true)
    drawDial(yy._wxCanvas, p(wxData.centerZh,wxData.centerEn), p(wxData.descZh,wxData.descEn), hue, false)
    // 标题
    const t1 = document.getElementById('yy-dial-yy-title')
    const t2 = document.getElementById('yy-dial-wx-title')
    if (t1) t1.textContent = p(yyData.centerZh, yyData.centerEn)
    if (t2) t2.textContent = p(wxData.centerZh, wxData.centerEn)
  }

  /* ---------- 右侧按钮 ---------- */
  function renderButtons() {
    const c = document.getElementById('thought-secondary-tabs')
    if (!c) return
    const colorMap = { yang:'35,60%,50%', yin:'210,40%,55%', wood:'130,40%,45%', fire:'18,65%,52%', earth:'42,55%,48%', metal:'45,15%,60%', water:'215,40%,48%', shengke:'42,55%,48%', xiangke:'0,45%,48%', waterfire:'215,40%,48%' }
    c.innerHTML = YY_BTN_GROUPS.map(g => `
      <div class="yy-btn-group">
        <div class="yy-btn-group__title">${esc(p(g.groupZh,g.groupEn))}</div>
        <div class="yy-btn-group__list">
          ${g.ids.map(id => {
            const it = YY_ITEMS[id]
            const hsl = colorMap[id] || '42,55%,48%'
            return `<button class="yy-btn${yy.activeBtn===id?' is-active':''}" type="button" data-yy-btn="${id}"><span class="yy-btn__dot" style="background:hsl(${hsl});"></span>${esc(p(it.labelZh,it.labelEn))}</button>`
          }).join('')}
        </div>
      </div>
    `).join('')
  }

  function renderStatus() {
    const c = document.getElementById('thought-status-list')
    if (!c) return
    const it = item()
    c.innerHTML = `<span class="thought-status-item"><span class="thought-status-item__dot" style="--dot-color:${it.zoneStroke||'#b88a35'};"></span>${esc(p(it.labelZh,it.labelEn))}</span>`
  }

  /* ---------- 视频 ---------- */
  function renderMedia() {
    const body = document.getElementById('thought-media-body')
    const ey = document.getElementById('thought-media-eyebrow')
    const ti = document.getElementById('thought-media-title')
    if (!body) return
    if (ey) ey.textContent = p('宇宙结构图','Cosmic Diagram')
    if (ti) ti.textContent = p('阴阳五行','Yin-Yang & Five Elements')
    const exts = ['mp4','webm','mov']
    const cands = exts.map(e => (typeof encodeAssetPath==='function' ? encodeAssetPath : (s=>s))(`${YY_VIDEO_PATH}.${e}`))
    body.innerHTML = `
      <article class="thought-video-card">
        <div class="thought-video-frame" data-video-lightbox-src="${esc(cands[0])}" role="button" tabindex="0">
          <video class="thought-video-frame__media" controls playsinline preload="metadata">
            ${cands.map((s,i) => `<source src="${esc(s)}" type="${i===1?'video/webm':'video/mp4'}">`).join('')}
          </video>
          <span class="thought-video-frame__overlay"><span class="thought-video-frame__play">${p('放大查看','Expand')}</span></span>
        </div>
        <div class="thought-video-meta">
          <div class="thought-video-meta__title">${p('阴阳五行','Yin-Yang & Five Elements')}</div>
          <p class="thought-video-meta__body">${p('通过阴阳分区与五行定位，把故宫从建筑集合转为一套有内在关系的宇宙模型。','Yin-yang zoning and five-element orientation turn the palace into a cosmological system.')}</p>
          <code class="thought-video-meta__path">${esc(cands[0])}</code>
        </div>
      </article>`
  }

  /* ---------- 底部卡片 ---------- */
  function renderCard() {
    const body = document.getElementById('thought-text-body')
    const ey = document.getElementById('thought-text-eyebrow')
    const ti = document.getElementById('thought-text-title')
    if (!body) return
    const it = item(), cd = it.card
    if (ey) ey.textContent = p('内容解读','Interpretation')
    if (ti) ti.textContent = p(cd.titleZh, cd.titleEn)
    body.innerHTML = `
      <div class="yy-card">
        <div class="yy-card__title">${esc(p(cd.titleZh,cd.titleEn))}</div>
        <p class="yy-card__brief">${esc(p(cd.briefZh,cd.briefEn))}</p>
        <p class="yy-card__body">${esc(p(cd.bodyZh,cd.bodyEn))}</p>
        <div class="yy-card__tags">${(p(cd.tagsZh,cd.tagsEn)||[]).map(t => `<span class="yy-card__tag">${esc(t)}</span>`).join('')}</div>
      </div>`
  }

  /* ---------- 地图 zone 高亮 ---------- */
  function renderZones() {
    const svg = getSvg()
    if (!svg) return
    const it = item()
    const allZones = svg.querySelectorAll('#zones-overlay .zone')

    // 重置
    allZones.forEach(z => {
      z.classList.remove('yy-active-zone','yy-dim','yy-glow')
      z.setAttribute('fill','transparent')
      z.setAttribute('stroke','transparent')
      z.setAttribute('opacity','0.15')
      z.style.removeProperty('--yy-glow')
    })

    if (it.mode === 'yinyang') {
      // 阴阳：高亮对应区，弱化另一个
      const target = svg.getElementById(it.zoneId)
      const yinyangGroup = svg.getElementById('zones-yinyang')
      const wuxingGroup = svg.getElementById('zones-wuxing')
      if (yinyangGroup) yinyangGroup.style.display = ''
      if (wuxingGroup) wuxingGroup.style.display = 'none'
      if (target) {
        target.setAttribute('fill', it.zoneColor)
        target.setAttribute('stroke', it.zoneStroke)
        target.setAttribute('opacity', '1')
        target.style.setProperty('--yy-glow', it.zoneGlow)
        target.classList.add('yy-active-zone','yy-glow')
      }
      // dim the other
      allZones.forEach(z => {
        if (z.dataset.group === 'yinyang' && z.id !== it.zoneId) z.classList.add('yy-dim')
      })
    } else if (it.mode === 'wuxing') {
      const yinyangGroup = svg.getElementById('zones-yinyang')
      const wuxingGroup = svg.getElementById('zones-wuxing')
      if (yinyangGroup) yinyangGroup.style.display = 'none'
      if (wuxingGroup) wuxingGroup.style.display = ''
      const target = svg.getElementById(it.zoneId)
      if (target) {
        target.setAttribute('fill', it.zoneColor)
        target.setAttribute('stroke', it.zoneStroke)
        target.setAttribute('opacity', '1')
        target.style.setProperty('--yy-glow', it.zoneGlow)
        target.classList.add('yy-active-zone','yy-glow')
      }
      allZones.forEach(z => {
        if (z.dataset.group === 'wuxing' && z.id !== it.zoneId) z.classList.add('yy-dim')
      })
    } else {
      // relation mode
      const yinyangGroup = svg.getElementById('zones-yinyang')
      const wuxingGroup = svg.getElementById('zones-wuxing')
      if (yinyangGroup) yinyangGroup.style.display = 'none'
      if (wuxingGroup) wuxingGroup.style.display = ''
      if (it.highlightZones) {
        it.highlightZones.forEach(zid => {
          const z = svg.getElementById(zid)
          if (!z) return
          const elem = zid.replace('zone-','')
          const ec = YY_ELEMENT_COLORS[elem]
          if (ec) { z.setAttribute('fill', ec.fill); z.setAttribute('stroke', ec.stroke) }
          z.setAttribute('opacity','1')
          z.classList.add('yy-active-zone','yy-glow')
        })
        allZones.forEach(z => {
          if (z.dataset.group === 'wuxing' && !it.highlightZones.includes(z.id)) z.classList.add('yy-dim')
        })
      } else {
        // shengke / xiangke — light all five
        allZones.forEach(z => {
          if (z.dataset.group !== 'wuxing') return
          const elem = z.dataset.zone
          const ec = YY_ELEMENT_COLORS[elem]
          if (ec) { z.setAttribute('fill', ec.fill); z.setAttribute('stroke', ec.stroke) }
          z.setAttribute('opacity','0.6')
          z.classList.add('yy-active-zone')
        })
      }
    }

    // 也 dim all building hotspots (the original ones)
    if (typeof thoughtHotspots !== 'undefined') {
      thoughtHotspots.forEach(h => {
        if (h.overlayEl) {
          h.overlayEl.classList.remove('thought-highlight','m2-highlight','m2-selected','m2-dim')
          h.overlayEl.style.removeProperty('--thought-highlight-color')
          h.overlayEl.style.opacity = '0.18'
        }
      })
    }
  }

  /* ---------- 关系线 ---------- */
  function ensureArrowMarker() {
    const svg = getSvg()
    if (!svg || yy._arrowDef) return
    let defs = svg.querySelector('defs')
    if (!defs) { defs = document.createElementNS('http://www.w3.org/2000/svg','defs'); svg.insertBefore(defs, svg.firstChild) }
    defs.insertAdjacentHTML('beforeend', `
      <marker id="yy-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" opacity="0.7"/>
      </marker>`)
    yy._arrowDef = true
  }

  function ensureRelGroup() {
    const svg = getSvg()
    if (!svg) return null
    if (!yy._relGroup || !svg.contains(yy._relGroup)) {
      yy._relGroup = document.createElementNS('http://www.w3.org/2000/svg','g')
      yy._relGroup.setAttribute('id','yy-relation-lines')
      svg.appendChild(yy._relGroup)
    }
    return yy._relGroup
  }

  function renderRelationLines() {
    ensureArrowMarker()
    const g = ensureRelGroup()
    if (!g) return
    g.innerHTML = ''
    const it = item()
    if (!it.relLines) return
    const svg = getSvg()
    if (!svg) return

    it.relLines.forEach((pair, i) => {
      const a = svg.getElementById(pair[0])
      const b = svg.getElementById(pair[1])
      if (!a || !b) return
      const x1 = parseFloat(a.getAttribute('cx')), y1 = parseFloat(a.getAttribute('cy'))
      const x2 = parseFloat(b.getAttribute('cx')), y2 = parseFloat(b.getAttribute('cy'))
      const line = document.createElementNS('http://www.w3.org/2000/svg','line')
      line.setAttribute('x1',x1); line.setAttribute('y1',y1)
      line.setAttribute('x2',x2); line.setAttribute('y2',y2)
      line.setAttribute('stroke', it.relColor || 'rgba(180,140,60,0.7)')
      line.classList.add('yy-relation-line')
      // 动画延迟
      if (it.id === 'shengke') {
        line.classList.add('is-animated')
        line.style.animationDelay = `${i * 0.35}s`
        line.style.opacity = '1'
      } else {
        line.classList.add('is-visible')
      }
      g.appendChild(line)
    })
  }

  function clearRelationLines() {
    if (yy._relGroup) yy._relGroup.innerHTML = ''
  }

  /* ---------- 地图装饰层（anchor 标签） ---------- */
  function renderDecor() {
    const decor = document.getElementById('thought-stage-decor')
    if (!decor) return
    const it = item()

    if (it.mode === 'wuxing' || it.mode === 'relation') {
      const elements = ['wood','fire','earth','metal','water']
      const labels = { wood: p('木·东','Wood·E'), fire: p('火·南','Fire·S'), earth: p('土·中','Earth·C'), metal: p('金·西','Metal·W'), water: p('水·北','Water·N') }
      decor.innerHTML = elements.map(e => {
        const pos = anchorPct('anchor-' + e)
        if (!pos) return ''
        const vis = (it.mode === 'relation' || it.id === e) ? ' is-visible' : ''
        return `<span class="yy-anchor-label yy-anchor-label--${e}${vis}" style="left:${pos.left};top:${pos.top};">${labels[e]}</span>`
      }).join('')
    } else {
      // 阴阳模式：方位标签
      decor.innerHTML = `
        <span class="yy-anchor-label yy-anchor-label--fire is-visible" style="left:50%;top:78%;">${p('南 · 阳','South · Yang')}</span>
        <span class="yy-anchor-label yy-anchor-label--water is-visible" style="left:50%;top:18%;">${p('北 · 阴','North · Yin')}</span>`
    }
  }

  /* ---------- zone 点击绑定 ---------- */
  function bindZoneClicks() {
    const svg = getSvg()
    if (!svg) return
    const zones = svg.querySelectorAll('#zones-overlay .zone')
    zones.forEach(z => {
      z.style.cursor = 'pointer'
      z.addEventListener('click', (e) => {
        if (state.thoughtTab !== 'yinyang') return
        e.stopPropagation()
        const zoneKey = z.dataset.zone // 'yang','yin','wood','fire',...
        if (YY_ITEMS[zoneKey]) selectBtn(zoneKey)
      })
      z.addEventListener('mouseenter', () => {
        if (state.thoughtTab !== 'yinyang') return
        const label = z.dataset.label || ''
        showZoneTip(z, label)
      })
      z.addEventListener('mouseleave', hideZoneTip)
    })
  }

  function showZoneTip(zone, text) {
    let tip = document.getElementById('yy-zone-tip')
    if (!tip) {
      tip = document.createElement('div')
      tip.id = 'yy-zone-tip'; tip.className = 'yy-zone-hover-tip'
      const stage = document.getElementById('thought-stage')
      if (stage) stage.appendChild(tip)
    }
    tip.textContent = text
    tip.classList.add('is-visible')
    // 简易定位
    const rect = zone.getBoundingClientRect()
    const stageRect = document.getElementById('thought-stage')?.getBoundingClientRect()
    if (stageRect) {
      tip.style.left = `${rect.left + rect.width/2 - stageRect.left}px`
      tip.style.top = `${rect.top - stageRect.top}px`
    }
  }
  function hideZoneTip() {
    const tip = document.getElementById('yy-zone-tip')
    if (tip) tip.classList.remove('is-visible')
  }

  /* ---------- 总渲染 ---------- */
  function renderModule() {
    ensurePanels()
    if (state.thoughtTab !== 'yinyang') return
    renderDials()
    renderButtons()
    renderStatus()
    renderMedia()
    renderCard()
    renderZones()
    const it = item()
    if (it.relLines) renderRelationLines()
    else clearRelationLines()
    renderDecor()

    // 顶部文案
    const st = document.getElementById('thought-stage-title')
    const sh = document.getElementById('thought-stage-hint')
    const ct = document.getElementById('thought-control-title')
    const ce = document.getElementById('thought-control-eyebrow')
    if (st) st.textContent = p('阴阳五行分区视图','Yin-Yang Five Elements View')
    if (sh) sh.textContent = p('点击右侧按钮或地图区域，查看阴阳五行空间逻辑。','Click right-side buttons or map zones to explore yin-yang and five-element spatial logic.')
    if (ct) ct.textContent = p('模式切换','View Mode')
    if (ce) ce.textContent = p('阴阳五行','Yin-Yang')
  }

  // 单独渲染右侧按钮（供外部调用，防止被 app.js 覆盖）
  function renderButtonsOnly() {
    if (state.thoughtTab !== 'yinyang') return
    renderButtons()
  }

  /* ---------- 交互 ---------- */
  function selectBtn(key) {
    if (!YY_ITEMS[key]) return
    yy.activeBtn = key
    renderModule()
  }

  /* ---------- 接入系统 ---------- */
  function applyPatches() {
    const thoughtGrid = document.querySelector('.thought-grid')
    if (thoughtGrid) {
      const obs = new MutationObserver(() => {
        if (state.module === 'thought') scheduleOverride()
      })
      obs.observe(thoughtGrid, { childList: true, subtree: true, characterData: true })
    }

    document.addEventListener('click', e => {
      const tab = e.target.closest('[data-thought-tab]')
      if (tab) {
        setTimeout(() => {
          if (state.thoughtTab === 'yinyang') {
            yy.activeBtn = 'earth'
          }
          scheduleOverride()
        }, 60)
      }
    }, true)

    setTimeout(scheduleOverride, 350)
  }

  let _rafId = 0
  function scheduleOverride() {
    cancelAnimationFrame(_rafId)
    _rafId = requestAnimationFrame(() => {
      ensurePanels()
      if (state.module === 'thought' && state.thoughtTab === 'yinyang') {
        renderModule()
      }
    })
  }

  /* SVG 加载后绑定 zone 点击 */
  function waitForSvg() {
    const host = document.getElementById('thought-svg-host')
    if (!host) return
    const obs = new MutationObserver(() => {
      if (host.querySelector('svg #zones-overlay')) {
        obs.disconnect()
        bindZoneClicks()
      }
    })
    obs.observe(host, { childList: true, subtree: true })
    if (host.querySelector('svg #zones-overlay')) {
      obs.disconnect()
      bindZoneClicks()
    }
  }

  /* ---------- Init ---------- */
  function init() {
    applyPatches()
    waitForSvg()
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 250))
  } else { setTimeout(init, 250) }

  window.YinyangModule = { selectBtn, render: renderModule, renderButtonsOnly, state: yy }
})()
