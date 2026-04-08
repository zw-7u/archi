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
      const englishLead = t.match(/^([A-Za-z][A-Za-z\s/&-]{2,30}:)\s+(.+)$/)
      if (englishLead) {
        return `<p><strong>${escape(englishLead[1])}</strong> ${escape(englishLead[2])}</p>`
      }
      if (/^[一二三四五六七]、/.test(t)) {
        return `<p class="m3-card-h">${escape(t)}</p>`
      }
      if (/^\([一二三四五六七]\)/.test(t) || /^[（(（]/.test(t)) {
        return `<p class="m3-card-sub">${escape(t)}</p>`
      }
      return `<p>${escape(t)}</p>`
    }).join('')
  }

  function isZhMode() {
    return window.state?.lang !== 'en'
  }

  function getBuildingMetaByName(name) {
    return Object.values(window.BUILDINGS || BUILDINGS || {}).find((item) => item.name === name) || null
  }

  function displayEnglish(label, pinyin = '') {
    return pinyin ? `${label} · ${pinyin}` : label
  }

  const COMPONENT_I18N = {
    jishou: {
      nameEn: 'Ridge Beasts',
      pinyin: 'Jíshòu',
      briefEn: 'Roof guardians that show rank and symbolic protection.',
      craftEn: `Appearance: A row of mythic beasts led by an immortal rider sits along the main ridge.

Materials: Yellow glazed ceramic with a kaolin-based body.

Technique: The pieces are molded, bisque-fired, glazed, and fixed to ridge nails with mortar.`,
      physicsEn: `Structure: Ridge nails help lock the tiles and beast figures in place.

Geometry: The spacing tightens and relaxes to match rhythm and drainage.

Material logic: Glaze keeps water absorption low and improves heat and weather resistance.`,
      cultureEn: `Rank: More ridge beasts meant a higher architectural rank, and Taihedian used the maximum set.

Meaning: Dragon, phoenix, xiezhi, and other beasts signal power, luck, justice, and protection.

Ritual code: Official building manuals strictly limited this feature to top imperial buildings.`,
    },
    dougong: {
      nameEn: 'Dougong Brackets',
      pinyin: 'Dǒugǒng',
      briefEn: 'Layered timber brackets that spread roof loads and express modular craft.',
      craftEn: `Appearance: Blocks, bow-shaped arms, and slanting members stack outward in layers.

Materials: Dense, resilient timber such as nanmu and pine.

Technique: Precision mortise-and-tenon joints let the bracket sets be assembled layer by layer without nails.`,
      physicsEn: `Structure: The bracket arms act like short cantilevers that disperse roof loads into the column grid.

Geometry: Repetition and symmetry create a clear modular order.

Material logic: Timber flexibility allows the joints to absorb movement during vibration and seasonal change.`,
      cultureEn: `Rank: More bracket steps meant higher status, and the nine-step set at Taihedian marked imperial supremacy.

Philosophy: Square blocks and curved arms echo the old idea of earth below and heaven above.

Aesthetics: The deep, repeated layers create rhythm, shadow, and a sense of lift under the eaves.`,
    },
    heixiyicaihua: {
      nameEn: 'Hexi Painted Decoration',
      pinyin: 'Héxǐ Cǎihuà',
      briefEn: 'Imperial painted ornament finished with raised paste and gilding.',
      craftEn: `Appearance: The painting is organized into structured bands filled with dragons, phoenixes, and scrollwork.

Materials: Mineral pigments, gold leaf, tung oil, and binding powders.

Technique: The timber base is prepared, colored, raised with paste lines, gilded, and sealed with a protective finish.`,
      physicsEn: `Protection: Painted layers help shield the timber from moisture, insects, and surface cracking.

Geometry: The composition follows strict bilateral symmetry and measured proportions.

Material logic: Mineral pigments and gold leaf are durable and visually stable over time.`,
      cultureEn: `Rank: Hexi painting was the highest class of decorative painting and belonged to major imperial halls.

Meaning: Dragons stand for imperial authority, phoenixes for auspicious order, and gold for dignity.

Ritual code: Different Hexi variants were carefully ranked, so decoration also broadcast hierarchy.`,
    },
    zhongyanyanwuding: {
      nameEn: 'Double-Eaved Hip Roof',
      pinyin: 'Chóngyán Wǔdiàn Dǐng',
      briefEn: 'The highest-ranking roof form, with two eave levels and commanding symmetry.',
      craftEn: `Appearance: A five-ridge roof rises on four slopes with two layers of eaves and lifted corners.

Materials: Timber framing paired with yellow glazed roof tiles.

Technique: Builders shape the roof curve through measured lifting, then reinforce key corners with angled members.`,
      physicsEn: `Structure: The roof transfers loads through a stable timber frame and performs well in earthquakes.

Geometry: Symmetry, measured pitch, and curved drainage lines keep the form balanced and dry.

Material logic: Timber lowers overall mass while glazed tiles improve waterproofing and durability.`,
      cultureEn: `Rank: This was the most prestigious roof form in the palace system.

Philosophy: The roof expresses centrality, four-direction order, and cosmic correspondence.

Ritual code: Its use was restricted to the most important imperial buildings.`,
    },
    sanwusanyu: {
      nameEn: 'Three-Tier White Marble Platform',
      pinyin: 'Sāncéng Hánbáiyù Xūmízuò',
      briefEn: 'A monumental stone terrace that lifts the hall above the ceremonial ground.',
      craftEn: `Appearance: The platform rises in three receding layers with carved rails, column bases, and drainage details.

Materials: White marble, pale stone, and compacted earth within.

Technique: Stone blocks are carved, jointed, and stacked in measured tiers before balustrades and waterspouts are installed.`,
      physicsEn: `Structure: The wide stone base improves stability, load-bearing performance, and resistance to ground moisture.

Geometry: Each tier steps inward to keep the mass visually stable and structurally clear.

Material logic: Marble handles compression well and also offers a refined carved surface.`,
      cultureEn: `Rank: A triple terrace signaled the highest ceremonial standing and was reserved for the grandest halls.

Meaning: The platform recalls Mount Sumeru, turning the building into a sacred and elevated center.

Ritual code: Elevation reinforced imperial distance, dignity, and procession.`,
    },
    huangliuliwa: {
      nameEn: 'Yellow Glazed Tiles',
      pinyin: 'Huáng Liúlí Wǎ',
      briefEn: 'Imperial yellow roof tiles that combine symbolism with weather protection.',
      craftEn: `Appearance: Tube tiles, flat tiles, and decorative eave pieces create a bright yellow roof surface.

Materials: Clay bodies with a yellow glaze formula based on mineral ingredients.

Technique: Tiles are fired twice and installed through layered bedding mortar, oil finishing, and tile nails.`,
      physicsEn: `Structure: Overlapping tiles interlock to resist wind and channel rainwater.

Geometry: Tile modules work with the roof pitch to keep drainage efficient.

Material logic: The glazed surface stays dense, weather-resistant, and low in water absorption.`,
      cultureEn: `Rank: Bright yellow tiles were reserved for the emperor and the highest palace architecture.

Meaning: Yellow connected the palace center to the earth element in the five-element system.

Ritual code: The glaze formula, production, and use were all tightly controlled.`,
    },
    duozhongyanyanwu: {
      nameEn: 'Multi-Eaved Composite Roof',
      pinyin: 'Duōchóng Yán Fùhé Wūmiàn',
      briefEn: 'A complex corner-tower roof that layers multiple eaves into one dramatic silhouette.',
      craftEn: `Appearance: The Corner Tower combines cross-shaped roof ridges, three eave levels, and many turning roof lines.

Materials: Timber framing, yellow glazed tiles, metal finials, and painted wooden members.

Technique: Prefabricated timber parts, ridge building, tile laying, and painted finishes are assembled in carefully staged lifts.`,
      physicsEn: `Structure: The layered roof spreads loads through many bracketed supports and balances the deep projecting corners.

Geometry: The form is highly symmetrical and uses repeated ridge lines to organize complexity.

Material logic: Timber keeps the structure lighter, while glazed ceramics protect the exposed roof surfaces.`,
      cultureEn: `Rank: The yellow tiles, gilded finial, and elaborate brackets identify the Corner Tower as a top imperial structure.

Meaning: The tower links earthly defense with celestial imagery, especially through its many corners and ridges.

Ritual code: It turns a military watch structure into a ceremonial symbol of dynastic order.`,
    },
    gongquanjiegou: {
      nameEn: 'Arch-Vault Structure',
      pinyin: 'Gǒngquàn Jiégòu',
      briefEn: 'A brick arch system that turns heavy gate openings into stable compressive forms.',
      craftEn: `Appearance: The gate openings look square outside but become barrel-like arches within.

Materials: Large bricks, sticky-lime mortar with glutinous rice, dressed stone, and heavy timber doors.

Technique: Builders used timber centering, precisely cut arch bricks, layered facing bricks, and dense grouting.`,
      physicsEn: `Structure: The arch redirects vertical load into side thrust, which the flanking masses help resist.

Geometry: Curved arch lines spread pressure evenly, while the square-and-round sequence expresses controlled transition.

Material logic: Brick and stone excel in compression, and sticky-rice mortar improves cohesion and water resistance.`,
      cultureEn: `Rank: The five-gate system reinforced imperial exclusivity and ceremonial privilege.

Meaning: Square outside and round inside echoes the old cosmological phrase “earth is square, heaven is round.”

Ritual code: Access through each opening followed strict political hierarchy and ritual protocol.`,
    },
    aoxingbuju: {
      nameEn: 'Concave Plan Layout',
      pinyin: 'Āoxíng Bùjú',
      briefEn: 'A U-shaped ceremonial layout that frames the court and intensifies the gate’s authority.',
      craftEn: `Appearance: The main tower, side wings, and corner pavilions wrap around a large court in a concave plan.

Technique: The layout relies on strict axis control, tiered roof composition, and carefully staged height transitions.

Visual order: Different roofs and volumes create variety while still reading as one unified front.`,
      physicsEn: `Structure: The three-sided enclosure increases overall stiffness and helps balance lateral forces.

Geometry: Strong bilateral symmetry keeps the composition centered and stable.

Material logic: Timber frames, tiled roofs, and stone bases combine light upper structure with a strong foundation.`,
      cultureEn: `Rank: This five-phoenix gate composition was reserved for the palace’s principal entrance.

Meaning: The spread form suggests a great bird unfolding its wings while keeping the emperor at the center.

Ritual code: The layout supported formal announcements, reviews, punishments, and major dynastic ceremonies.`,
    },
    liulipinjiegongyi: {
      nameEn: 'Glazed Tile Assembly',
      pinyin: 'Liúlí Pīnjiē Gōngyì',
      briefEn: 'A tiled screen-wall technique that joins sculpted glazed blocks into one continuous relief.',
      craftEn: `Appearance: The Nine Dragon Wall combines roof, wall, relief dragons, clouds, rocks, and waves in one long glazed surface.

Materials: High-fired glazed blocks, sticky-lime mortar, and a carved stone base.

Technique: Craftsmen sculpted dragons in sections, glazed them separately, then fitted the blocks with near-seamless precision.`,
      physicsEn: `Structure: Relief bodies project forward but keep their center of mass close to the wall.

Geometry: The wall is rigorously symmetrical and uses long horizontal proportion for calm grandeur.

Material logic: Dense glaze resists staining, weathering, and freeze-thaw damage.`,
      cultureEn: `Rank: Glazed screen walls of this quality belonged to the imperial realm.

Meaning: Color, dragon placement, and the screen form all support ideas of central authority and protective order.

Ritual code: The wall worked both as a ceremonial statement and as a screen that gathered auspicious energy.`,
    },
    longwenhuawen: {
      nameEn: 'Dragon Motif Symbolism',
      pinyin: 'Lóngwén Wénhuà',
      briefEn: 'Nine dragon images encode imperial identity, cosmic order, and ceremonial hierarchy.',
      craftEn: `Appearance: Nine dragons occupy five zones, with the central yellow dragon taking the most honored position.

Materials: Glazed ceramic bodies with layered color glazes for dragons, clouds, and water motifs.

Technique: Heads, bodies, claws, and tails were modeled in sections so the full dragon pattern could run smoothly across many blocks.`,
      physicsEn: `Structure: Relief forms are thicker near the wall and lighter at their edges to reduce detachment risk.

Geometry: The nine-dragon composition follows a strict axial symmetry and numerical order.

Material logic: Dense glazed ceramics hold color well and tolerate sun, moisture, and abrasion.`,
      cultureEn: `Rank: Nine dragons and five claws were exclusive imperial symbols.

Meaning: The composition presents the emperor as the centered ruler supported by the whole realm.

Ritual code: Numbers, colors, and claw counts all followed rules that commoners could not imitate.`,
    },
  }

  function getComponentLocale(comp) {
    return COMPONENT_I18N[comp?.id] || {}
  }

  function getComponentName(comp) {
    const locale = getComponentLocale(comp)
    return isZhMode()
      ? (comp?.name || '')
      : displayEnglish(locale.nameEn || comp?.name || '', locale.pinyin || '')
  }

  function getComponentBrief(comp) {
    const locale = getComponentLocale(comp)
    return isZhMode() ? (comp?.brief || comp?.name || '') : (locale.briefEn || locale.nameEn || comp?.name || '')
  }

  function getComponentCardText(comp, tab) {
    const locale = getComponentLocale(comp)
    if (isZhMode()) return comp?.[tab] || ''
    return locale[`${tab}En`] || locale.briefEn || comp?.brief || ''
  }

  function renderStaticCopy() {
    $$('.component-building-btn').forEach((button) => {
      const meta = getBuildingMetaByName(button.dataset.building)
      if (!meta) return
      button.textContent = isZhMode()
        ? meta.name
        : displayEnglish(meta.nameEn || meta.name, meta.pinyin || '')
    })

    const explodeLabel = $('#component-explode-btn .component-explode-btn__label')
    if (explodeLabel) {
      explodeLabel.textContent = isZhMode()
        ? (m3State.isExploded ? '还原结构' : '一键拆分')
        : (m3State.isExploded ? 'Restore Structure' : 'Explode Structure')
    }

    const btn3d = $('#component-btn-3d')
    if (btn3d) btn3d.textContent = isZhMode() ? '3D全景' : '3D Model'
    const workshopBtn = $('#component-btn-workshop')
    if (workshopBtn) workshopBtn.textContent = isZhMode() ? '巧筑工坊' : 'Craft Workshop'

    const cardTabs = $$('.component-card-tab')
    if (cardTabs[0]) cardTabs[0].textContent = isZhMode() ? '形制与工艺' : 'Craft & Form'
    if (cardTabs[1]) cardTabs[1].textContent = isZhMode() ? '物理与数学' : 'Physics & Math'
    if (cardTabs[2]) cardTabs[2].textContent = isZhMode() ? '文化与符号' : 'Culture & Symbol'

    const eyebrow = document.querySelector('.component-sidebar__head .panel-head__eyebrow')
    if (eyebrow) eyebrow.textContent = isZhMode() ? '重点构件' : 'Key Components'
    const cardEyebrow = document.querySelector('.component-card__head .panel-head__eyebrow')
    if (cardEyebrow) cardEyebrow.textContent = isZhMode() ? '重点构件解读' : 'Component Reading'
  }

  function safeSrc(path) {
    if (!path || /^https?:\/\//.test(path) || path.startsWith('data:')) return path
    const index = path.lastIndexOf('/')
    if (index < 0) return encodeURIComponent(path)
    return `${path.slice(0, index + 1)}${encodeURIComponent(path.slice(index + 1))}`
  }

  /* ---------- 渲染：建筑按钮选中态 ---------- */
  function renderBuildingButtons() {
    renderStaticCopy()
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
        <span class="component-btn__text">${escape(getComponentName(c))}</span>
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
    const images = data.components.filter(c => c.image).map(c => ({
      id: c.id,
      src: safeSrc(c.image),
      name: getComponentName(c),
    }))
    const n = images.length
    if (n === 0) return

    const track = $('#component-gallery-track')
    const dots = $('#component-gallery-dots')
    const prevBtn = $('#component-gallery-prev')
    const nextBtn = $('#component-gallery-next')
    if (!track) return

    if (n <= 1) {
      const only = images[0]
      track.innerHTML = `<button type="button" class="carousel-slide-btn" data-lightbox-src="${escape(only.src)}" aria-label="${escape(isZhMode() ? '放大查看构件图样' : 'Open component image')}"><img src="${escape(only.src)}" alt="${escape(only.name)}" loading="lazy" /></button>`
      if (dots) dots.innerHTML = ''
      if (prevBtn) prevBtn.hidden = true
      if (nextBtn) nextBtn.hidden = true
      m3State.componentId = only.id
      renderComponentButtons()
      renderCard()
      return
    }

    const show = (idx, syncComponent = false) => {
      m3State.galleryIndex = ((idx % n) + n) % n
      const active = images[m3State.galleryIndex]
      track.innerHTML = `<button type="button" class="carousel-slide-btn" data-lightbox-src="${escape(active.src)}" aria-label="${escape(isZhMode() ? '放大查看构件图样' : 'Open component image')}"><img src="${escape(active.src)}" alt="${escape(active.name)}" loading="lazy" /></button>`
      if (syncComponent && active?.id) {
        m3State.componentId = active.id
        renderComponentButtons()
        renderCard()
      }
      if (dots) {
        dots.innerHTML = images.map((_, i) =>
          `<button type="button" class="component-gallery__dot${i === m3State.galleryIndex ? ' is-active' : ''}" data-idx="${i}" aria-label="${i + 1}/${n}"></button>`
        ).join('')
        dots.querySelectorAll('.component-gallery__dot').forEach(d => {
          d.addEventListener('click', () => {
            clearAutoPlay(true)
            show(Number(d.dataset.idx), true)
          })
        })
      }
    }

    if (prevBtn) {
      prevBtn.hidden = false
      prevBtn.onclick = () => {
        clearAutoPlay(true)
        show(m3State.galleryIndex - 1, true)
      }
    }
    if (nextBtn) {
      nextBtn.hidden = false
      nextBtn.onclick = () => {
        clearAutoPlay(true)
        show(m3State.galleryIndex + 1, true)
      }
    }

    show(immediate ? m3State.galleryIndex : 0, true)
    if (m3State.autoPlay) armAutoPlay(images.length)
  }

  function armAutoPlay(n) {
    clearAutoPlay()
    if (n <= 1) return
    m3State.galleryTimer = setInterval(() => {
      m3State.galleryIndex = (m3State.galleryIndex + 1) % n
      renderGallery(true)
    }, 4000)
  }

  function clearAutoPlay(disableAuto = false) {
    if (m3State.galleryTimer) {
      clearInterval(m3State.galleryTimer)
      m3State.galleryTimer = null
    }
    if (disableAuto) {
      m3State.autoPlay = false
    }
  }

  /* ---------- 渲染：知识卡片 ---------- */
  function renderCard() {
    const data = MODULE3_DATA[m3State.building]
    if (!data) return
    const comp = data.components.find(c => c.id === m3State.componentId)
    if (!comp) return

    const nameEl = $('#component-card-name')
    const bodyEl = $('#component-card-body')
    if (nameEl) nameEl.textContent = getComponentName(comp)

    $$('.component-card-tab').forEach(t => {
      t.classList.toggle('is-active', t.dataset.tab === m3State.tab)
    })

    if (bodyEl) {
      bodyEl.innerHTML = formatCard(getComponentCardText(comp, m3State.tab))
    }
  }

  /* ---------- 渲染：侧边标题 ---------- */
  function renderSidebarTitle() {
    const el = $('#component-sidebar-title')
    if (!el) return
    const meta = getBuildingMetaByName(m3State.building)
    el.textContent = isZhMode()
      ? `${m3State.building}构件`
      : `${meta?.nameEn || m3State.building} · ${meta?.pinyin || ''}`
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
      const name = getComponentName(c)
      const desc = getComponentBrief(c)
      const svgScale = svgRect ? (svgRect.width / (svg.viewBox?.baseVal?.width || 1)) : 1

      return `<div class="component-label${isActive ? ' is-visible' : ''}"
        style="left:${ex * svgScale}px;top:${ey * svgScale}px">
        <span class="component-label__name">${escape(name)}</span>
        ${desc !== name ? `<span class="component-label-desc">${escape(desc)}</span>` : ''}
      </div>`
    }).join('')
  }

  /* 获取构件爆炸后的最终X位置 */
  function getExplodeEndX(el) {
    const bbox = el.getBBox()
    const svg = el.closest('svg')
    const vb = svg?.viewBox?.baseVal
    if (!vb || !vb.width) return bbox.x + bbox.width / 2
    const match = (el.style.transform || '').match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/)
    const dx = match ? Number(match[1]) : 0
    return bbox.x + bbox.width / 2 + dx
  }

  /* 获取构件爆炸后的最终Y位置 */
  function getExplodeEndY(el) {
    const bbox = el.getBBox()
    const svg = el.closest('svg')
    const vb = svg?.viewBox?.baseVal
    if (!vb || !vb.height) return bbox.y + bbox.height / 2
    const match = (el.style.transform || '').match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/)
    const dy = match ? Number(match[2]) : 0
    return bbox.y + bbox.height / 2 + dy
  }

  /* ---------- 加载全景 PNG ---------- */
  function loadPng(name) {
    const data = MODULE3_DATA[name]
    if (!data) return
    const img = $('#component-png')
    if (!img) return
    const meta = getBuildingMetaByName(name)
    img.src = safeSrc(data.panoramaPng)
    img.alt = isZhMode()
      ? `${name}全景图`
      : `${meta?.nameEn || name} panorama`
    img.onerror = () => { img.style.display = 'none' }
    img.style.display = ''
    img.onclick = null
    if (typeof window.openLightbox === 'function') {
      img.style.cursor = 'zoom-in'
      img.onclick = () => window.openLightbox(img.src)
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
      const resp = await fetch(safeSrc(data.panoramaSvg))
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

    const groups = host.querySelectorAll('[id]')
    const seen = new Set()

    groups.forEach(node => {
      const rawId = node.id.trim()
      if (!rawId) return
      // 1. 用 nameMap 映射中文 SVG group id → 英文构件 id
      const compId = svgNameMap[rawId] || rawId
      if (seen.has(compId)) return
      const comp = comps.find(c => c.id === compId)
      if (!comp) return
      const g = node.closest('g[id]') || node
      seen.add(compId)

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

  const direction = explode.direction || 'explode'
  const svg = el.closest('svg')
  if (!svg) return

  const vb = svg.viewBox.baseVal
  const bbox = el.getBBox()
  const centerX = vb.x + vb.width / 2
  const centerY = vb.y + vb.height / 2
  const selfX = bbox.x + bbox.width / 2
  const selfY = bbox.y + bbox.height / 2
  const baseX = Math.max(bbox.width * 0.9, vb.width * 0.08)
  const baseY = Math.max(bbox.height * 0.9, vb.height * 0.08)
  let translateX = 0
  let translateY = 0
  let scale = id === m3State.componentId ? 1.08 : 1.03

  switch (direction) {
    case 'up':
      translateY = -Math.max(baseY * 1.45, vb.height * 0.16)
      break
    case 'down':
      translateY = Math.max(baseY * 1.45, vb.height * 0.16)
      break
    case 'left':
      translateX = -Math.max(baseX * 1.45, vb.width * 0.16)
      break
    case 'right':
      translateX = Math.max(baseX * 1.45, vb.width * 0.16)
      break
    case 'explode-v':
      translateX = (m3State.componentPaths.indexOf(path) % 2 === 0 ? -1 : 1) * Math.max(bbox.width * 0.3, vb.width * 0.03)
      translateY = (selfY < centerY ? -1 : 1) * Math.max(baseY * 1.6, vb.height * 0.18)
      break
    case 'explode-h':
      translateX = (selfX < centerX ? -1 : 1) * Math.max(baseX * 1.6, vb.width * 0.18)
      translateY = (m3State.componentPaths.indexOf(path) % 2 === 0 ? -1 : 1) * Math.max(bbox.height * 0.3, vb.height * 0.03)
      break
    default: {
      const vectorX = selfX - centerX
      const vectorY = selfY - centerY
      const distance = Math.hypot(vectorX, vectorY) || 1
      translateX = (vectorX / distance) * Math.max(baseX * 1.5, vb.width * 0.12)
      translateY = (vectorY / distance) * Math.max(baseY * 1.5, vb.height * 0.12)
      break
    }
  }

  el.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`
  el.style.transformBox = 'fill-box'
  el.style.transformOrigin = 'center center'
  el.classList.add('is-selected')
}

/* ---------- 重置单个构件路径 ---------- */
function resetPath(id) {
  const path = m3State.componentPaths.find(p => p.id === id)
  if (!path) return
  path.el.style.transition = 'filter 0.22s ease, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)'
  path.el.style.transform = ''
  path.el.style.transformBox = ''
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
    if (fromUser) {
      clearAutoPlay(true)
      if (!m3State.isExploded) {
        m3State.isExploded = true
      }
    }

    renderComponentButtons()
    renderCard()
    if (comp.image) {
      const index = data.components.filter(item => item.image).findIndex(item => item.id === id)
      if (index >= 0) {
        m3State.galleryIndex = index
      }
    }
    renderGallery(true)

    const stage = $('#component-stage')
    const explodeBtn = $('#component-explode-btn')
    if (stage) stage.classList.toggle('is-exploded', m3State.isExploded)
    if (explodeBtn) {
      explodeBtn.classList.toggle('is-exploded', m3State.isExploded)
      const label = explodeBtn.querySelector('.component-explode-btn__label')
      if (label) label.textContent = isZhMode()
        ? (m3State.isExploded ? '还原结构' : '一键拆分')
        : (m3State.isExploded ? 'Restore Structure' : 'Explode Structure')
    }

    m3State.componentPaths.forEach(p => {
      if (p.id === id) {
        if (m3State.isExploded) pullPath(p.id)
        else {
          p.el.classList.add('is-selected')
          p.el.style.filter = 'drop-shadow(0 0 8px rgba(90, 122, 138, 0.8))'
        }
      } else {
        p.el.classList.remove('is-selected')
        if (!m3State.isExploded || prevId === p.id) resetPath(p.id)
      }
    })
    renderLabels()
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
        if (label) label.textContent = isZhMode() ? '还原结构' : 'Restore Structure'
      }
      m3State.componentPaths.forEach(p => pullPath(p.id))
      renderLabels()
    } else {
      if (stage) stage.classList.remove('is-exploded')
      if (btn) {
        btn.classList.remove('is-exploded')
        const label = btn.querySelector('.component-explode-btn__label')
        if (label) label.textContent = isZhMode() ? '一键拆分' : 'Explode Structure'
      }
      m3State.componentPaths.forEach(p => resetPath(p.id))
      const current = m3State.componentPaths.find(p => p.id === m3State.componentId)
      if (current) current.el.classList.add('is-selected')
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
    if (initialized) {
      renderStaticCopy()
      renderBuildingButtons()
      renderSidebarTitle()
      renderComponentButtons()
      renderGallery(true)
      renderCard()
      renderLabels()
      return
    }
    initialized = true
    renderStaticCopy()

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
