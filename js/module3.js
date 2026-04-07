/* =====================================================
   js/module3.js - 模块三：巧物精工核心交互
   ===================================================== */

;(function () {
  'use strict'

  const $ = (s) => document.querySelector(s)
  const $$ = (s) => document.querySelectorAll(s)

  /* ---------- 状态 ---------- */
  let m3State = {
    building: DEFAULT_BUILDING,
    componentId: null,
    tab: 'craft',
    isExploded: false,
    autoPlay: true,
    galleryIndex: 0,
    galleryTimer: null,
    componentPaths: [],  // [{ el, id, name, explode }]
  }

  let initialized = false

  /* ---------- 辅助 ---------- */
  function escape(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  function formatCard(text) {
    return text.split('\n').map(line => {
      const t = line.trim()
      if (!t) return ''
      if (/^[一二三四五六七]、/.test(t)) {
        return `<p class="m3-card-h">${escape(t)}</p>`
      }
      if (/^\([一二三四五六七]\)/.test(t) || /^[（(（]/.test(t)) {
        return `<p class="m3-card-sub">${escape(t)}</p>`
      }
      return `<p>${escape(t)}</p>`
    }).join('')
  }

  /* ---------- 渲染：建筑按钮选中态 ---------- */
  function renderBuildingButtons() {
    $$('.component-building-btn').forEach(btn => {
      const active = btn.dataset.building === m3State.building
      btn.classList.toggle('is-active', active)
      btn.setAttribute('aria-selected', String(active))
    })
  }

  /* ---------- 渲染：构件按钮列表 ---------- */
  function renderComponentButtons() {
    const data = MODULE3_DATA[m3State.building]
    if (!data) return
    const list = $('#component-btns')
    if (!list) return

    list.innerHTML = data.components.map(c => {
      const active = c.id === m3State.componentId ? ' is-active' : ''
      return `<button type="button" class="component-btn${active}" data-component-id="${escape(c.id)}" role="listitem">
        <span class="component-btn__dot"></span>
        <span>${escape(c.name)}</span>
      </button>`
    }).join('')

    list.querySelectorAll('.component-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        showComponent(btn.dataset.componentId, true)
      })
    })
  }

  /* ---------- 渲染：图片轮播 ---------- */
  function renderGallery(immediate) {
    const data = MODULE3_DATA[m3State.building]
    if (!data) return
    const images = data.components.filter(c => c.image).map(c => c.image)
    const n = images.length
    if (n === 0) return

    const track = $('#component-gallery-track')
    const dots = $('#component-gallery-dots')
    const prevBtn = $('#component-gallery-prev')
    const nextBtn = $('#component-gallery-next')
    if (!track) return

    if (n <= 1) {
      track.innerHTML = `<img src="${images[0]}" alt="" loading="lazy" />`
      if (dots) dots.innerHTML = ''
      if (prevBtn) prevBtn.hidden = true
      if (nextBtn) nextBtn.hidden = true
      return
    }

    const show = (idx) => {
      m3State.galleryIndex = ((idx % n) + n) % n
      track.innerHTML = `<img src="${images[m3State.galleryIndex]}" alt="" loading="lazy" />`
      if (dots) {
        dots.innerHTML = images.map((_, i) =>
          `<button type="button" class="component-gallery__dot${i === m3State.galleryIndex ? ' is-active' : ''}" data-idx="${i}" aria-label="${i + 1}/${n}"></button>`
        ).join('')
        dots.querySelectorAll('.component-gallery__dot').forEach(d => {
          d.addEventListener('click', () => {
            clearAutoPlay()
            renderGallery()
          })
        })
      }
    }

    if (prevBtn) {
      prevBtn.hidden = false
      prevBtn.onclick = () => { clearAutoPlay(); renderGallery() }
    }
    if (nextBtn) {
      nextBtn.hidden = false
      nextBtn.onclick = () => { clearAutoPlay(); renderGallery() }
    }

    show(immediate ? m3State.galleryIndex : 0)
    if (m3State.autoPlay) armAutoPlay(images.length)
  }

  function armAutoPlay(n) {
    clearAutoPlay()
    if (n <= 1) return
    m3State.galleryTimer = setInterval(() => {
      m3State.galleryIndex = (m3State.galleryIndex + 1) % n
      renderGallery()
    }, 4000)
  }

  function clearAutoPlay() {
    if (m3State.galleryTimer) {
      clearInterval(m3State.galleryTimer)
      m3State.galleryTimer = null
    }
    m3State.autoPlay = false
  }

  /* ---------- 渲染：知识卡片 ---------- */
  function renderCard() {
    const data = MODULE3_DATA[m3State.building]
    if (!data) return
    const comp = data.components.find(c => c.id === m3State.componentId)
    if (!comp) return

    const nameEl = $('#component-card-name')
    const bodyEl = $('#component-card-body')
    if (nameEl) nameEl.textContent = comp.name

    $$('.component-card-tab').forEach(t => {
      t.classList.toggle('is-active', t.dataset.tab === m3State.tab)
    })

    if (bodyEl) {
      bodyEl.innerHTML = formatCard(comp[m3State.tab] || '')
    }
  }

  /* ---------- 渲染：侧边标题 ---------- */
  function renderSidebarTitle() {
    const el = $('#component-sidebar-title')
    if (el) el.textContent = m3State.building + '构件'
  }

  /* ---------- 渲染：SVG 标签层（带箭头和简介） ---------- */
  function renderLabels() {
    const layer = $('#component-labels')
    if (!layer) return
    const data = MODULE3_DATA[m3State.building]
    if (!data || !m3State.isExploded) {
      layer.innerHTML = ''
      return
    }

    const svg = document.querySelector('#component-svg-host svg')
    const svgRect = svg ? svg.getBoundingClientRect() : null

    layer.innerHTML = data.components.map(c => {
      const comp = m3State.componentPaths.find(p => p.id === c.id)
      const ex = comp && comp.el ? getExplodeEndX(comp.el) : c.explode.x
      const ey = comp && comp.el ? getExplodeEndY(comp.el) : c.explode.y
      const isActive = c.id === m3State.componentId

      // 获取构件简介
      const desc = c.brief || c.name
      const svgScale = svgRect ? (svgRect.width / (svg.viewBox?.baseVal?.width || 1)) : 1

      return `<div class="component-label${isActive ? ' is-visible' : ''}"
        style="left:${ex * svgScale}px;top:${ey * svgScale}px">
        <span class="component-label__name">${escape(c.name)}</span>
        ${desc !== c.name ? `<span class="component-label-desc">${escape(desc)}</span>` : ''}
      </div>`
    }).join('')
  }

  /* 获取构件爆炸后的最终X位置 */
  function getExplodeEndX(el) {
    const bbox = el.getBBox()
    const svg = el.closest('svg')
    const vb = svg?.viewBox?.baseVal
    if (!vb || !vb.width) return bbox.x + bbox.width / 2
    return (bbox.x + bbox.width / 2) * 1.15 + vb.width * 0.1
  }

  /* 获取构件爆炸后的最终Y位置 */
  function getExplodeEndY(el) {
    const bbox = el.getBBox()
    const svg = el.closest('svg')
    const vb = svg?.viewBox?.baseVal
    if (!vb || !vb.height) return bbox.y + bbox.height / 2
    return (bbox.y + bbox.height / 2) * 1.15 + vb.height * 0.1
  }

  /* ---------- 加载全景 PNG ---------- */
  function loadPng(name) {
    const data = MODULE3_DATA[name]
    if (!data) return
    const img = $('#component-png')
    if (!img) return
    img.src = data.panoramaPng
    img.onerror = () => { img.style.display = 'none' }
    img.style.display = ''
    // 点击 PNG 弹出灯箱（is-exploded 状态时）
    img.onclick = null
    if (typeof window.openLightbox === 'function') {
      img.style.cursor = 'zoom-in'
      img.addEventListener('click', () => {
        if (m3State.isExploded) {
          window.openLightbox(img.src)
        }
      })
    }
  }

  /* ---------- 加载 SVG 热区 ---------- */
  async function loadSvg(name) {
    const data = MODULE3_DATA[name]
    if (!data) return
    const host = $('#component-svg-host')
    if (!host) return

    host.innerHTML = '<div class="m3-svg-loading">加载中…</div>'

    try {
      const resp = await fetch(data.panoramaSvg)
      if (!resp.ok) throw new Error(resp.status)
      const markup = await resp.text()
      host.innerHTML = markup

      const svg = host.querySelector('svg')
      if (svg) {
        svg.style.width = '100%'
        svg.style.height = '100%'
      }

      bindSvgPaths()
    } catch (e) {
      host.innerHTML = `<div class="m3-svg-loading">SVG 热区加载失败（${escape(name)}）</div>`
    }
  }

  /* ---------- 绑定 SVG 路径事件（核心） ---------- */
  function bindSvgPaths() {
    const host = $('#component-svg-host')
    if (!host) return
    m3State.componentPaths = []

    const data = MODULE3_DATA[m3State.building]
    if (!data) return
    const svgNameMap = data.svgNameMap || {}
    const comps = data.components

    // 遍历所有 <g>（SVG group），通过 svgNameMap 中文 ID 匹配构件
    const groups = host.querySelectorAll('g[id]')

    groups.forEach(g => {
      const gId = g.id.trim()
      // 1. 用 nameMap 映射中文 SVG group id → 英文构件 id
      const compId = svgNameMap[gId] || gId
      // 2. 再���英文 id 从 components 里找对应构件
      const comp = comps.find(c => c.id === compId)
      if (!comp) return

      // 注册
      m3State.componentPaths.push({
        el: g,
        id: comp.id,
        name: comp.name,
        explode: comp.explode,
      })

      // 交互样式
      g.style.cursor = 'pointer'
      g.style.transition = 'filter 0.22s ease'

      g.addEventListener('mouseenter', () => {
        if (!g.classList.contains('is-selected')) {
          g.style.filter = 'drop-shadow(0 0 5px rgba(180,130,60,0.75))'
        }
      })
      g.addEventListener('mouseleave', () => {
        if (!g.classList.contains('is-selected')) {
          g.style.filter = ''
        }
      })
      g.addEventListener('click', () => {
        showComponent(comp.id, true)
        pullPath(comp.id)
      })
    })
  }

/* ---------- 拉出单个构件路径 ---------- */
function pullPath(id) {
  const path = m3State.componentPaths.find(p => p.id === id)
  if (!path) return

  const { el, explode } = path
  el.style.transition = 'filter 0.22s ease, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)'

  // 根据 explode 方向决定爆炸方式
  const direction = explode.direction || 'right' // 默认向右爆炸

  // 计算SVG视图框大小（用于缩放和定位）
  const svg = el.closest('svg')
  if (!svg) return

  let viewBox = svg.getAttribute('viewBox')
  if (!viewBox) {
    const vb = svg.viewBox.baseVal
    if (vb && vb.width && vb.height) {
      viewBox = `0 0 ${vb.width} ${vb.height}`
    }
  }
  if (!viewBox) return

  const [, , vw, vh] = viewBox.split(/\s+/).map(Number)

  // 根据方向设置爆炸变换
  let translateX = 0, translateY = 0, scale = 1.08
  let rotation = 0

  switch (direction) {
    case 'up':      // 向上拆解
      translateY = -(vh * 0.25)
      break
    case 'down':    // 向下拆解
      translateY = (vh * 0.25)
      break
    case 'left':    // 向左拆解
      translateX = -(vw * 0.25)
      break
    case 'right':   // 向右拆解
      translateX = (vw * 0.25)
      break
    case 'explode-v': // 垂直爆炸（上下交错）
      translateY = el !== m3State.componentPaths[0].el ?
        (Math.random() > 0.5 ? -(vh * 0.2) : (vh * 0.2)) : 0
      translateX = (Math.random() - 0.5) * vw * 0.15
      break
    case 'explode-h': // 水平爆炸（左右交错）
      translateX = el !== m3State.componentPaths[0].el ?
        (Math.random() > 0.5 ? -(vw * 0.2) : (vw * 0.2)) : 0
      translateY = (Math.random() - 0.5) * vh * 0.15
      break
    case 'explode':  // 散射爆炸
      const idx = m3State.componentPaths.indexOf(path)
      const angle = (idx / m3State.componentPaths.length) * Math.PI * 2
      translateX = Math.cos(angle) * vw * 0.2
      translateY = Math.sin(angle) * vh * 0.2
      break
  }

  // 应用变换（优先使用 transform 属性）
  el.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`
  el.style.transformOrigin = 'center center'
  el.classList.add('is-selected')
}

/* ---------- 重置单个构件路径 ---------- */
function resetPath(id) {
  const path = m3State.componentPaths.find(p => p.id === id)
  if (!path) return
  path.el.style.transition = 'filter 0.22s ease, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)'
  path.el.style.transform = ''
  path.el.style.transformOrigin = ''
  path.el.style.filter = ''
  path.el.classList.remove('is-selected')
}

  /* ---------- 切换建筑 ---------- */
  async function loadBuilding(name) {
    if (!MODULE3_DATA[name]) return

    m3State.building = name
    m3State.isExploded = false
    m3State.autoPlay = true

    const comps = MODULE3_DATA[name].components
    m3State.componentId = comps.length > 0 ? comps[0].id : null
    m3State.tab = 'craft'
    m3State.galleryIndex = 0
    clearAutoPlay()

    const stage = $('#component-stage')
    const explodeBtn = $('#component-explode-btn')
    if (stage) stage.classList.remove('is-exploded')
    if (explodeBtn) {
      explodeBtn.classList.remove('is-exploded')
      const label = explodeBtn.querySelector('.component-explode-btn__label')
      if (label) label.textContent = '一键拆分'
    }

    loadPng(name)
    await loadSvg(name)

    renderBuildingButtons()
    renderSidebarTitle()
    renderComponentButtons()
    renderGallery(true)
    renderCard()
    renderLabels()
  }

  /* ---------- 切换构件 ---------- */
  function showComponent(id, fromUser) {
    const data = MODULE3_DATA[m3State.building]
    if (!data) return
    const comp = data.components.find(c => c.id === id)
    if (!comp) return

    const prevId = m3State.componentId
    m3State.componentId = id
    m3State.tab = 'craft'
    if (fromUser) clearAutoPlay()

    renderComponentButtons()
    renderCard()
    renderLabels()

    // 更新图片轮播：显示选中构件的图片
    if (comp.image) {
      const track = $('#component-gallery-track')
      if (track) {
        track.innerHTML = `<img src="${comp.image}" alt="${escape(comp.name)}" loading="lazy" />`
      }
      // 清除轮播定时器，避免自动切换覆盖选中图片
      clearAutoPlay()
    }

    m3State.componentPaths.forEach(p => {
      if (p.id === id) {
        p.el.classList.add('is-selected')
        if (m3State.isExploded) pullPath(p.id)
      } else {
        p.el.classList.remove('is-selected')
        if (prevId && p.id === prevId && !m3State.isExploded) {
          resetPath(p.id)
        }
      }
    })
  }

  /* ---------- 一键拆分 ---------- */
  function toggleExplode() {
    const data = MODULE3_DATA[m3State.building]
    if (!data) return

    m3State.isExploded = !m3State.isExploded
    const stage = $('#component-stage')
    const btn = $('#component-explode-btn')

    if (m3State.isExploded) {
      if (stage) stage.classList.add('is-exploded')
      if (btn) {
        btn.classList.add('is-exploded')
        const label = btn.querySelector('.component-explode-btn__label')
        if (label) label.textContent = '还原结构'
      }
      m3State.componentPaths.forEach(p => pullPath(p.id))
      renderLabels()
    } else {
      if (stage) stage.classList.remove('is-exploded')
      if (btn) {
        btn.classList.remove('is-exploded')
        const label = btn.querySelector('.component-explode-btn__label')
        if (label) label.textContent = '一键拆分'
      }
      m3State.componentPaths.forEach(p => resetPath(p.id))
      renderLabels()
    }
  }

  /* ---------- 切换标签 ---------- */
  function switchTab(tab) {
    m3State.tab = tab
    renderCard()
  }

  /* ---------- 初始化 ---------- */
  function init() {
    if (initialized) return
    initialized = true

    $$('.component-building-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.dataset.building
        if (name && name !== m3State.building) loadBuilding(name)
      })
    })

    const explodeBtn = $('#component-explode-btn')
    if (explodeBtn) explodeBtn.addEventListener('click', toggleExplode)

    const btn3d = $('#component-btn-3d')
    if (btn3d) btn3d.addEventListener('click', () => {
      const activeBtn = document.querySelector('.component-building-btn.is-active')
      const modelKey = activeBtn && activeBtn.dataset.game
      if (modelKey && typeof window.openModelViewer === 'function') {
        window.openModelViewer(modelKey)
      }
    })
    const btnWs = $('#component-btn-workshop')
    if (btnWs) btnWs.addEventListener('click', () => {
      const activeBtn = document.querySelector('.component-building-btn.is-active')
      const gameKey = activeBtn && activeBtn.dataset.game
      if (gameKey && typeof openWorkshopGame === 'function') {
        openWorkshopGame(gameKey)
      }
    })

    $$('.component-card-tab').forEach(t => {
      t.addEventListener('click', () => switchTab(t.dataset.tab))
    })

    loadBuilding(m3State.building)
  }

  /* ---------- 公开接口 ---------- */
  window.initComponentModule = init

})()
