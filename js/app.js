const SVG_WIDTH = 987.436
const SVG_HEIGHT = 1398.857

const $ = (selector) => document.querySelector(selector)

const MODULES = {
  archive: {
    titleZh: '宫阙载史',
    titleEn: 'Palace Archive',
    subtitleZh: '从总览图进入故宫建筑的礼制、形制与事件叙事。',
    subtitleEn: 'Read the Forbidden City through overview hotspots, typologies, and event narratives.',
    kickerZh: '紫禁城建筑图谱',
    kickerEn: 'Forbidden City Atlas',
  },
  component: {
    titleZh: '巧物精工',
    titleEn: 'Craft & Ingenuity',
    subtitleZh: '从形制分类切入，理解殿堂、楼阁、城门与景观的构造气质。',
    subtitleEn: 'Read hall, tower, gate, and landscape typologies through their crafted architectural logic.',
    kickerZh: '形制与工艺',
    kickerEn: 'Typology & Craft',
  },
}

const FUNCTION_COLORS = {
  ritual: '#ba8743',
  living: '#b85a3c',
  culture: '#5e8066',
  worship: '#756285',
  decor: '#8a7453',
}

const TYPE_COLORS = {
  hall: '#9a512b',
  tower: '#836033',
  gate: '#556f5f',
  landscape: '#7b6850',
}

const TYPE_GROUP_META = {
  hall: { labelZh: '殿堂类', labelEn: 'Hall Type', source: 'hall' },
  tower: { labelZh: '楼阁类', labelEn: 'Tower Type', source: 'tower' },
  gate: { labelZh: '城门类', labelEn: 'Gate Type', source: 'gate' },
  landscape: { labelZh: '景观类', labelEn: 'Landscape Type', source: 'screen' },
}

const BUILDING_MEDIA = {
  jiaolou: [
    { src: 'images/buildings/角楼.jpg', titleZh: '角楼', titleEn: 'Corner Tower' },
  ],
  dongliugong: [
    { src: 'images/buildings/东六宫.jpg', titleZh: '东六宫', titleEn: 'Eastern Six Palaces' },
    { src: 'images/buildings/西六宫.jpg', titleZh: '西六宫', titleEn: 'Western Six Palaces' },
  ],
  wumen: [{ src: 'images/buildings/午门.jpg', titleZh: '午门', titleEn: 'Meridian Gate' }],
  taihedian: [{ src: 'images/buildings/太和殿.jpg', titleZh: '太和殿', titleEn: 'Hall of Supreme Harmony' }],
  taiheimen: [{ src: 'images/buildings/太和门.jpg', titleZh: '太和门', titleEn: 'Gate of Supreme Harmony' }],
  baohedian: [{ src: 'images/buildings/保和殿.jpg', titleZh: '保和殿', titleEn: 'Hall of Preserving Harmony' }],
  zhonghedian: [{ src: 'images/buildings/中和殿.jpg', titleZh: '中和殿', titleEn: 'Hall of Central Harmony' }],
  qianqinggong: [{ src: 'images/buildings/乾清宫.jpg', titleZh: '乾清宫', titleEn: 'Palace of Heavenly Purity' }],
  kunninggong: [{ src: 'images/buildings/坤宁宫.jpg', titleZh: '坤宁宫', titleEn: 'Palace of Earthly Tranquility' }],
  qianqingmen: [{ src: 'images/buildings/乾清门.jpg', titleZh: '乾清门', titleEn: 'Gate of Heavenly Purity' }],
  wenhuadian: [{ src: 'images/buildings/文华殿.jpg', titleZh: '文华殿', titleEn: 'Hall of Literary Brilliance' }],
  wuyingdian: [{ src: 'images/buildings/武英殿.jpg', titleZh: '武英殿', titleEn: 'Hall of Martial Valor' }],
  shenwumen: [{ src: 'images/buildings/神武门.jpg', titleZh: '神武门', titleEn: 'Gate of Divine Might' }],
  jiulongbi: [{ src: 'images/buildings/九龙壁.jpg', titleZh: '九龙壁', titleEn: 'Nine Dragon Wall' }],
  yangxindian: [{ src: 'images/buildings/养心殿.jpg', titleZh: '养心殿', titleEn: 'Hall of Mental Cultivation' }],
  yuhuayuan: [{ src: 'images/buildings/御花园.jpg', titleZh: '御花园', titleEn: 'Imperial Garden' }],
  shufangzhai: [{ src: 'images/buildings/漱芳斋.jpg', titleZh: '漱芳斋', titleEn: 'Shufang Zhai' }],
  changyinge: [{ src: 'images/buildings/畅音阁.jpg', titleZh: '畅音阁', titleEn: 'Changyin Pavilion' }],
  qianlonghuayuan: [{ src: 'images/buildings/乾隆花园.jpg', titleZh: '乾隆花园', titleEn: 'Qianlong Garden' }],
  cininggong: [{ src: 'images/buildings/慈宁宫.jpg', titleZh: '慈宁宫', titleEn: 'Cining Palace' }],
  cininggonghuayuan: [{ src: 'images/buildings/慈宁宫花园.jpg', titleZh: '慈宁宫花园', titleEn: 'Cining Palace Garden' }],
  shoukanggong: [{ src: 'images/buildings/寿康宫.jpg', titleZh: '寿康宫', titleEn: 'Shoukang Palace' }],
  huangjidian: [{ src: 'images/buildings/皇极殿.jpg', titleZh: '皇极殿', titleEn: 'Huangji Hall' }],
  jianting: [{ src: 'images/buildings/箭亭.jpg', titleZh: '箭亭', titleEn: 'Arrow Pavilion' }],
  qinandian: [{ src: 'images/buildings/钦安殿.jpg', titleZh: '钦安殿', titleEn: "Qin'an Hall" }],
}

const state = {
  module: 'archive',
  lang: 'zh',
  openPanels: { function: false, type: false },
  selectedFunction: null,
  selectedType: null,
  selectedBuilding: null,
  selectedHotspotId: null,
  hoveredHotspotId: null,
  infoTab: 'archive',
}

window.state = state

const els = {}
let functionChart = null
let typeChart = null

const BUILDING_INDEX = Object.fromEntries(Object.values(BUILDINGS).map((item) => [item.id, item]))

/** 不参与轮播 / 建筑图像展示的建筑 id（宁寿门、东华门、西华门） */
const GALLERY_EXCLUDED_BUILDING_IDS = new Set(['ningshoumen', 'donghuamen', 'xihhuamen'])

function uniqueIds(ids) {
  return [...new Set(ids)].filter((id) => BUILDING_INDEX[id])
}

const FUNCTION_GROUPS = FUNCTION_CATEGORIES.map((item) => ({
  id: item.id,
  labelZh: item.labelZh,
  labelEn: item.labelEn,
  color: FUNCTION_COLORS[item.id],
  ids: uniqueIds(CATEGORY_INTROS[item.id]?.buildingIds || []),
  descZh: CATEGORY_INTROS[item.id]?.desc || '',
  descEn: CATEGORY_INTROS[item.id]?.descEn || item.labelEn,
}))

const TYPE_GROUPS = Object.entries(TYPE_GROUP_META).map(([id, meta]) => ({
  id,
  labelZh: meta.labelZh,
  labelEn: meta.labelEn,
  color: TYPE_COLORS[id],
  ids: uniqueIds(COMPONENT_TYPE_INTROS[meta.source]?.buildingIds || []),
  descZh: COMPONENT_TYPE_INTROS[meta.source]?.desc || '',
  descEn: COMPONENT_TYPE_INTROS[meta.source]?.descEn || meta.labelEn,
}))

function isZh() {
  return state.lang === 'zh'
}

function pick(zh, en) {
  return isZh() ? zh : en
}

function escapeHTML(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

/** 对路径最后一段编码，避免中文/空格文件名在部分环境下无法加载 */
function encodeAssetPath(path) {
  if (!path || path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) return path
  const i = path.lastIndexOf('/')
  const dir = i >= 0 ? path.slice(0, i + 1) : ''
  const file = i >= 0 ? path.slice(i + 1) : path
  return dir + encodeURIComponent(file)
}

function getFunctionGroup(id) {
  return FUNCTION_GROUPS.find((item) => item.id === id) || null
}

function getTypeGroup(id) {
  return TYPE_GROUPS.find((item) => item.id === id) || null
}

function getFunctionOfBuilding(buildingId) {
  return FUNCTION_GROUPS.find((group) => group.ids.includes(buildingId)) || null
}

function getTypeOfBuilding(buildingId) {
  return TYPE_GROUPS.find((group) => group.ids.includes(buildingId)) || null
}

function getBuilding(buildingId) {
  return BUILDING_INDEX[buildingId] || null
}

function getBuildingLabel(buildingId) {
  const building = getBuilding(buildingId)
  if (!building) return ''
  return isZh() ? building.name : (building.nameEn || building.name)
}

function getHotspotLabel(hotspot) {
  if (!hotspot) return ''
  if (isZh()) return hotspot.labelZh || getBuilding(hotspot.buildingId)?.name || ''
  return hotspot.labelEn || getBuilding(hotspot.buildingId)?.nameEn || getBuilding(hotspot.buildingId)?.name || ''
}

function getBuildingMedia(buildingId) {
  if (GALLERY_EXCLUDED_BUILDING_IDS.has(buildingId)) return []
  const building = getBuilding(buildingId)
  if (!building) return []

  const manual = BUILDING_MEDIA[buildingId]
  if (manual?.length) {
    return manual.map((item) => ({
      src: encodeAssetPath(item.src),
      titleZh: item.titleZh || building.name,
      titleEn: item.titleEn || building.nameEn || building.name,
      buildingId,
    }))
  }

  return [{
    src: encodeAssetPath(`images/buildings/${building.name}.jpg`),
    titleZh: building.name,
    titleEn: building.nameEn || building.name,
    buildingId,
  }]
}

/** 按建筑 id 收集轮播图（含东六宫/西六宫等多图条目，宁寿门等无图 id 自动跳过） */
function collectCarouselUrlsFromBuildingIds(ids) {
  const out = []
  const seen = new Set()
  for (const id of ids || []) {
    if (!BUILDING_INDEX[id]) continue
    const media = getBuildingMedia(id)
    for (const m of media) {
      const s = m.src
      if (s && !seen.has(s)) {
        seen.add(s)
        out.push(s)
      }
    }
  }
  return out
}

let categoryCarouselTimer = null
let categoryCarouselIndex = 0
let categoryCarouselUrls = []

function stopCategoryCarousel() {
  if (categoryCarouselTimer) {
    clearInterval(categoryCarouselTimer)
    categoryCarouselTimer = null
  }
}

function armCategoryCarouselTimer() {
  if (categoryCarouselTimer) clearInterval(categoryCarouselTimer)
  categoryCarouselTimer = null
  if (categoryCarouselUrls.length <= 1) return
  categoryCarouselTimer = setInterval(() => {
    renderCategoryCarouselSlide(categoryCarouselIndex + 1)
  }, 4000)
}

function renderCategoryCarouselSlide(nextIdx) {
  const track = els.carouselTrack
  const indicator = els.carouselIndicator
  const prevBtn = els.carouselPrev
  const nextBtn = els.carouselNext
  const n = categoryCarouselUrls.length
  if (!track || n === 0) return

  categoryCarouselIndex = ((nextIdx % n) + n) % n
  const idx = categoryCarouselIndex
  const url = categoryCarouselUrls[idx]

  track.innerHTML = ''
  const wrap = document.createElement('button')
  wrap.type = 'button'
  wrap.className = 'carousel-slide-btn'
  wrap.setAttribute('data-lightbox-src', url)
  wrap.setAttribute('aria-label', pick('点击放大', 'Click to enlarge'))
  const img = document.createElement('img')
  img.src = url
  img.alt = pick('配图', 'Illustration')
  img.loading = 'lazy'
  img.addEventListener('error', () => {
    const fallback = document.createElement('div')
    fallback.className = 'overview-empty'
    fallback.style.cssText = 'min-height:160px;display:flex;align-items:center;justify-content:center;font-size:13px;padding:12px;'
    fallback.textContent = pick('图片加载失败', 'Image failed to load')
    wrap.replaceWith(fallback)
  })
  wrap.appendChild(img)
  track.appendChild(wrap)

  if (indicator) {
    indicator.innerHTML = ''
    categoryCarouselUrls.forEach((_, i) => {
      const dot = document.createElement('button')
      dot.type = 'button'
      dot.className = `category-carousel__dot${i === idx ? ' is-active' : ''}`
      dot.setAttribute('aria-label', `${i + 1} / ${n}`)
      dot.addEventListener('click', () => {
        renderCategoryCarouselSlide(i)
        armCategoryCarouselTimer()
      })
      indicator.appendChild(dot)
    })
  }

  const multi = n > 1
  if (prevBtn) {
    prevBtn.hidden = !multi
    prevBtn.onclick = () => {
      renderCategoryCarouselSlide(idx - 1)
      armCategoryCarouselTimer()
    }
  }
  if (nextBtn) {
    nextBtn.hidden = !multi
    nextBtn.onclick = () => {
      renderCategoryCarouselSlide(idx + 1)
      armCategoryCarouselTimer()
    }
  }
}

function startCategoryCarousel(urls) {
  stopCategoryCarousel()
  categoryCarouselUrls = Array.isArray(urls) ? urls.slice() : []
  categoryCarouselIndex = 0
  if (!els.categoryCarousel) return
  if (categoryCarouselUrls.length === 0) {
    els.categoryCarousel.hidden = true
    return
  }
  els.categoryCarousel.hidden = false
  renderCategoryCarouselSlide(0)
  armCategoryCarouselTimer()
}

function renderCategoryIntroHeader(scope) {
  const box = els.categoryIntroBox
  if (!box) return
  const title = pick(scope.item.labelZh, scope.item.labelEn)
  const sub = scope.kind === 'function'
    ? pick('功能分类', 'Functional Category')
    : pick('形制分类', 'Typological Group')
  const body = pick(scope.item.descZh, scope.item.descEn)
  box.innerHTML = `
    <div class="info-title">${escapeHTML(title)}</div>
    <div class="info-subtitle">${escapeHTML(sub)}</div>
    <div class="info-body" style="margin-top:10px;line-height:1.75;">${escapeHTML(body)}</div>
  `
}

function renderCategoryBuildingList(buildingIds, accentColor) {
  const listEl = els.categoryBuildingList
  if (!listEl) return
  const color = accentColor || 'var(--gold)'
  const rows = (buildingIds || []).filter((id) => BUILDING_INDEX[id]).map((id) => `
    <button type="button" class="category-building-item" data-building-id="${escapeHTML(id)}">
      <span class="category-building-item__dot" style="background:${escapeHTML(color)};"></span>
      <span>${escapeHTML(getBuildingLabel(id))}</span>
    </button>
  `).join('')
  listEl.innerHTML = rows || `<p class="overview-empty" style="padding:12px;font-size:13px;">${escapeHTML(pick('暂无关联建筑', 'No linked buildings'))}</p>`
  listEl.querySelectorAll('.category-building-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.buildingId
      if (id) selectBuilding(id)
    })
  })
}

function getCurrentScope() {
  if (state.selectedBuilding) return { kind: 'building', item: getBuilding(state.selectedBuilding) }
  if (state.selectedFunction) return { kind: 'function', item: getFunctionGroup(state.selectedFunction) }
  if (state.selectedType) return { kind: 'type', item: getTypeGroup(state.selectedType) }
  return { kind: 'module', item: MODULES[state.module] }
}

function getModuleIntro() {
  if (state.module === 'archive') {
    return {
      title: pick('故宫整体介绍', 'Forbidden City Overview'),
      subtitle: pick('总览', 'Overview'),
      body: pick(
        CATEGORY_INTROS.all?.desc || '故宫以中轴为骨，以礼制为空间秩序，形成了政治、生活、祭祀与审美共同构成的完整宫城系统。',
        'Use the overview map to move between ceremonial, residential, devotional, and scenic layers of the Forbidden City.',
      ),
      badges: [
        pick('29 处建筑条目', '29 mapped records'),
        pick('功能与形制双维度检索', 'Function + typology filters'),
        pick('点击热区查看档案卡', 'Click hotspots for archive cards'),
      ],
    }
  }

  return {
    title: pick('巧物精工', 'Craft & Ingenuity'),
    subtitle: pick('形制视角', 'Typology Lens'),
    body: pick(
      '这一视角更适合从殿堂、楼阁、城门与景观的构造逻辑理解故宫。点击右侧形制分类时，总览图会出现对应脉冲热区。',
      'This mode favors reading the palace through hall, tower, gate, and landscape typologies. Type filters will pulse the matching zones on the overview map.',
    ),
    badges: [
      pick('形制分类联动总览图', 'Typology-linked overview'),
      pick('查看对应建筑档案', 'Browse matching archive records'),
      pick('可切换到单体档案', 'Jump to single-building archive'),
    ],
  }
}

function getOverviewHint() {
  return pick('悬停查看建筑名称，点击切换档案卡。', 'Hover to read the name, click to open archive cards.')
}

function getFunctionChartCaption() {
  return pick(
    '礼仪政治与起居生活共同构成故宫最稳定的空间骨架，其余类型则补足祭祀、游赏与景观层次。',
    'Ceremonial and residential buildings form the palace backbone, while worship, culture, and scenic spaces complete its layered experience.',
  )
}

function getTypeChartCaption() {
  return pick(
    '殿堂与景观共同塑造了故宫的礼制核心与游观层次，楼阁与城门承担垂直眺望与秩序转换。',
    'Halls and landscapes define the palace core and atmosphere, while towers and gates handle lookout and spatial transition.',
  )
}

function bindElements() {
  els.btnLang = $('#btn-lang')
  els.navPlates = [...document.querySelectorAll('.wood-plate')]
  els.functionChart = $('#function-chart')
  els.typeChart = $('#type-chart')
  els.functionChartEyebrow = $('#function-chart-eyebrow')
  els.functionChartTitle = $('#function-chart-title')
  els.functionChartCaption = $('#function-chart-caption')
  els.typeChartEyebrow = $('#type-chart-eyebrow')
  els.typeChartTitle = $('#type-chart-title')
  els.typeChartCaption = $('#type-chart-caption')
  els.overviewEyebrow = $('#overview-eyebrow')
  els.overviewTitle = $('#overview-title')
  els.overviewHint = $('#overview-hint')
  els.overviewStage = $('#overview-stage')
  els.overviewSvgHost = $('#overview-svg-host')
  els.overviewSvg = null
  els.overviewTooltip = $('#overview-tooltip')
  els.functionFoldToggle = $('#function-fold-toggle')
  els.typeFoldToggle = $('#type-fold-toggle')
  els.functionFoldPanel = $('#function-fold-panel')
  els.typeFoldPanel = $('#type-fold-panel')
  els.functionFoldLabel = $('#function-fold-label')
  els.typeFoldLabel = $('#type-fold-label')
  els.panelPlaceholder = $('#panel-placeholder')
  els.archiveCard = $('#archive-card')
  els.cardContentArchive = $('#card-content-archive')
  els.cardContentEvent = $('#card-content-event')
  els.categoryCarousel = $('#category-carousel')
  els.carouselTrack = $('#carousel-track')
  els.carouselPrev = $('#carousel-prev')
  els.carouselNext = $('#carousel-next')
  els.carouselIndicator = $('#carousel-indicator')
  els.categoryIntroCard = $('#category-intro-card')
  els.categoryIntroBox = $('#category-intro-box')
  els.categoryBuildingList = $('#category-building-list')
}

function bindEvents() {
  els.btnLang.addEventListener('click', () => {
    state.lang = isZh() ? 'en' : 'zh'
    renderAll()
  })

  els.navPlates.forEach((button) => {
    button.addEventListener('click', () => {
      const nextModule = button.dataset.module
      if (!nextModule || nextModule === state.module) return
      state.module = nextModule
      state.selectedFunction = null
      state.selectedType = null
      state.selectedBuilding = null
      state.selectedHotspotId = null
      state.hoveredHotspotId = null
      state.openPanels = { function: false, type: false }
      state.infoTab = 'archive'
      renderAll()
    })
  })

  els.functionFoldToggle.addEventListener('click', () => togglePanel('function'))
  els.typeFoldToggle.addEventListener('click', () => togglePanel('type'))
  els.overviewStage.addEventListener('click', (event) => {
    if (event.target.closest('[data-hotspot-id]')) return
    state.selectedBuilding = null
    state.selectedHotspotId = null
    state.infoTab = 'archive'
    document.body.dataset.buildingId = ''
    window.currentBuilding = null
    renderOverview()
    renderInfo()
  })
  window.addEventListener('resize', () => {
    functionChart?.resize()
    typeChart?.resize()
  })
}

function togglePanel(kind) {
  state.openPanels[kind] = !state.openPanels[kind]
  renderFilterPanels()
}

function selectFunction(id) {
  state.selectedFunction = state.selectedFunction === id ? null : id
  state.selectedType = null
  state.selectedBuilding = null
  state.selectedHotspotId = null
  state.infoTab = 'archive'
  state.openPanels.function = true
  renderOverview()
  renderFilterPanels()
  renderInfo()
  renderCharts()
}

function selectType(id) {
  state.selectedType = state.selectedType === id ? null : id
  state.selectedFunction = null
  state.selectedBuilding = null
  state.selectedHotspotId = null
  state.infoTab = 'archive'
  state.openPanels.type = true
  renderOverview()
  renderFilterPanels()
  renderInfo()
  renderCharts()
}

function selectBuilding(buildingId, hotspotId = null) {
  state.selectedBuilding = buildingId
  state.selectedHotspotId = hotspotId
  state.infoTab = 'archive'
  document.body.dataset.buildingId = buildingId || ''
  window.currentBuilding = buildingId || null
  renderOverview()
  renderInfo()
}

function initOverview() {
  // 加载 SVG，自动扫描热区
  const hotspots = scanSVGHotspots(els.overviewSvg)

  hotspots.forEach((hotspot) => {
    hotspot.overlayEl = createHotspotOverlay(els.overviewSvg, hotspot)

    // 为手动热区创建 sourceEl
    if (hotspot.customPath) {
      const sourceEl = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      sourceEl.setAttribute('d', hotspot.customPath)
      sourceEl.classList.add('overview-region-source')
      sourceEl.style.fill = 'rgba(255,255,255,0.002)'
      hotspot.sourceEl = sourceEl
      els.overviewSvg.querySelector('[data-layer="hotspot-interaction"]').appendChild(sourceEl)
    }

    bindHotspotEvents(hotspot, {
      onHover: (h, e) => {
        state.hoveredHotspotId = h.hotspotId
        renderOverview()
        showTooltip(h, e)
      },
      onLeave: (h) => {
        if (state.hoveredHotspotId === h.hotspotId) state.hoveredHotspotId = null
        renderOverview()
        hideTooltip()
      },
      onClick: (h) => {
        selectBuilding(h.buildingId, h.hotspotId)
        hideTooltip()
      },
    })
  })
}

async function createHotspots() {
  try {
    const response = await fetch(new URL('images/map/overview.svg', window.location.href))
    if (!response.ok) throw new Error(`SVG load failed: ${response.status}`)

    const markup = await response.text()
    els.overviewSvgHost.innerHTML = markup

    const svg = els.overviewSvgHost.querySelector('svg')
    if (!svg) throw new Error('SVG root not found')

    svg.removeAttribute('width')
    svg.removeAttribute('height')
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')

    const interactionLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    interactionLayer.setAttribute('data-layer', 'hotspot-interaction')
    const overlayLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    overlayLayer.setAttribute('data-layer', 'hotspot-overlay')
    svg.appendChild(interactionLayer)
    svg.appendChild(overlayLayer)

    els.overviewSvg = svg
    initOverview()
    renderOverview()
  } catch (error) {
    console.error(error)
    els.overviewSvgHost.innerHTML = '<p class="overview-svg-fallback">总览图加载失败，请刷新页面后重试。</p>'
    els.overviewSvg = null
  }
}

function showTooltip(hotspot, event = null) {
  const text = isZh() ? hotspot.labelZh : hotspot.labelEn
  if (!text) return
  els.overviewTooltip.textContent = text
  els.overviewTooltip.hidden = false

  let x = 0
  let y = 0
  if (event) {
    x = event.clientX
    y = event.clientY
  } else {
    const node = hotspot.sourceEl || hotspot.group
    if (node) {
      const rect = node.getBoundingClientRect()
      x = rect.left + rect.width / 2
      y = rect.top
    }
  }

  const tooltipRect = els.overviewTooltip.getBoundingClientRect()
  els.overviewTooltip.style.left = `${x - tooltipRect.width / 2}px`
  els.overviewTooltip.style.top = `${y - tooltipRect.height - 16}px`
}

function hideTooltip() {
  els.overviewTooltip.hidden = true
}

function renderHeader() {
  els.btnLang.textContent = isZh() ? '中 / EN' : 'EN / 中'

  els.functionChartEyebrow.textContent = pick('功能分类', 'Function')
  els.functionChartTitle.textContent = pick('故宫建筑的功能分类', 'Functional Distribution of Palace Buildings')
  els.functionChartCaption.textContent = getFunctionChartCaption()

  els.typeChartEyebrow.textContent = pick('形制分类', 'Typology')
  els.typeChartTitle.textContent = pick('故宫建筑的形制分类', 'Typological Distribution of Palace Buildings')
  els.typeChartCaption.textContent = getTypeChartCaption()

  els.overviewEyebrow.textContent = 'Overview'
  els.overviewTitle.textContent = pick('故宫总览图', 'Forbidden City Overview')
  els.overviewHint.textContent = getOverviewHint()
  els.functionFoldLabel.textContent = pick('功能分类', 'Function')
  els.typeFoldLabel.textContent = pick('形制分类', 'Typology')
}

function renderNav() {
  els.navPlates.forEach((button) => {
    button.classList.toggle('active', button.dataset.module === state.module)
  })
}

function renderFilterPanels() {
  const functionOpen = state.openPanels.function
  const typeOpen = state.openPanels.type

  els.functionFoldToggle.classList.toggle('is-open', functionOpen)
  els.functionFoldToggle.setAttribute('aria-expanded', String(functionOpen))
  els.functionFoldPanel.hidden = !functionOpen

  els.typeFoldToggle.classList.toggle('is-open', typeOpen)
  els.typeFoldToggle.setAttribute('aria-expanded', String(typeOpen))
  els.typeFoldPanel.hidden = !typeOpen

  els.functionFoldPanel.innerHTML = `
    <div class="filter-chip-list">
      ${FUNCTION_GROUPS.map((group) => `
        <button class="filter-chip${state.selectedFunction === group.id ? ' active' : ''}" type="button" data-role="function-filter" data-id="${group.id}" style="--chip-color:${group.color};">${escapeHTML(isZh() ? group.labelZh : group.labelEn)}</button>
      `).join('')}
    </div>
  `

  els.typeFoldPanel.innerHTML = `
    <div class="filter-chip-list">
      ${TYPE_GROUPS.map((group) => `
        <button class="filter-chip${state.selectedType === group.id ? ' active' : ''}" type="button" data-role="type-filter" data-id="${group.id}" style="--chip-color:${group.color};">${escapeHTML(isZh() ? group.labelZh : group.labelEn)}</button>
      `).join('')}
    </div>
  `

  els.functionFoldPanel.querySelectorAll('[data-role="function-filter"]').forEach((button) => {
    button.addEventListener('click', () => selectFunction(button.dataset.id))
  })

  els.typeFoldPanel.querySelectorAll('[data-role="type-filter"]').forEach((button) => {
    button.addEventListener('click', () => selectType(button.dataset.id))
  })
}

function renderOverview() {
  const activeFunction = getFunctionGroup(state.selectedFunction)
  const activeType = getTypeGroup(state.selectedType)
  const hotspots = getHotspots()

  hotspots.forEach((hotspot) => {
    const node = hotspot.overlayEl
    if (!node) return

    const selected = state.selectedHotspotId
      ? hotspot.hotspotId === state.selectedHotspotId
      : state.selectedBuilding && hotspot.buildingId === state.selectedBuilding

    node.classList.toggle('is-selected', Boolean(selected))
    node.classList.toggle('is-hovered', state.hoveredHotspotId === hotspot.hotspotId)

    const functionHighlight = activeFunction?.ids.includes(hotspot.buildingId)
    const typeHighlight = activeType?.ids.includes(hotspot.buildingId)

    node.classList.toggle('function-highlight', Boolean(functionHighlight))
    node.classList.toggle('type-highlight', Boolean(typeHighlight))

    const color = functionHighlight ? activeFunction.color : activeType?.color || ''
    if (color) node.style.setProperty('--highlight-color', color)
    else node.style.removeProperty('--highlight-color')
  })
}

function buildOverviewCardHTML({ title, subtitle, body, badges = [] }) {
  return `
    <div class="info-title">${escapeHTML(title)}</div>
    <div class="info-subtitle">${escapeHTML(subtitle)}</div>
    <div class="info-body">${escapeHTML(body)}</div>
    ${badges.length ? `<div class="info-badges">${badges.map((badge) => `<span class="info-badge">${escapeHTML(badge)}</span>`).join('')}</div>` : ''}
  `
}

function buildFallbackStyle(building) {
  const parts = []
  if (building.roofType) parts.push(isZh() ? `屋顶：${building.roofType}` : `Roof: ${building.roofTypeEn || building.roofType}`)
  if (building.bays) parts.push(isZh() ? `开间：${building.bays}` : `Bays: ${building.bays}`)
  if (building.baseHeight) parts.push(isZh() ? `台基：${building.baseHeight}` : `Platform: ${building.baseHeight}`)
  return parts.join('；') || pick('暂无资料', 'No data')
}

function buildBuildingArchiveHTML(building) {
  const kapian = BUILDING_KAPIAN_DATA[building.id] || {}
  const functionGroup = getFunctionOfBuilding(building.id)
  const typeGroup = getTypeOfBuilding(building.id)
  const timeline = kapian.timeline || [building.built, building.rebuilt].filter(Boolean).join(' / ')
  const materials = kapian.materials || building.materials || pick('暂无资料', 'No data')
  const style = kapian.style || buildFallbackStyle(building)
  const functionText = kapian.functionCat || (functionGroup ? pick(functionGroup.labelZh, functionGroup.labelEn) : pick('待补充', 'Pending'))
  const identity = kapian.identity || (isZh() ? building.archive : (building.archiveEn || building.archive || ''))

  const blocks = [
    { label: pick('建筑身份', 'Identity'), value: identity },
    { label: pick('建造时间线', 'Timeline'), value: timeline || pick('暂无资料', 'No data') },
    { label: pick('材料与结构', 'Material & Structure'), value: materials },
    { label: pick('建筑样式', 'Architectural Style'), value: style },
    { label: pick('功能归属', 'Function'), value: functionText },
  ]

  const media = getBuildingMedia(building.id)
  const photo = media[0]
  const photoHtml = photo ? (
    `<button class="info-building-photo" type="button" data-lightbox-src="${photo.src || photo}" title="${pick('点击放大查看', 'Click to enlarge')}">
      <img class="info-building-photo__img" src="${photo.src || photo}" alt="${escapeHTML(isZh() ? (photo.titleZh || building.name) : (photo.titleEn || building.nameEn || building.name))}" loading="lazy">
      <span class="info-building-photo__hint">${pick('点击放大', 'Click to enlarge')}</span>
    </button>`
  ) : ''

  return `
    <div class="info-title">${escapeHTML(isZh() ? building.name : (building.nameEn || building.name))}</div>
    <div class="info-subtitle">${escapeHTML(building.pinyin || '')}${typeGroup ? ` · ${escapeHTML(isZh() ? typeGroup.labelZh : typeGroup.labelEn)}` : ''}</div>
    ${photoHtml}
    <div class="info-meta">
      ${blocks.map((block) => `
        <article class="info-block">
          <div class="info-block__label">${escapeHTML(block.label)}</div>
          <div class="info-block__value">${escapeHTML(block.value)}</div>
        </article>
      `).join('')}
    </div>
  `
}

function buildBuildingEventHTML(building) {
  const kapian = BUILDING_KAPIAN_DATA[building.id] || {}
  const historicalEvents = kapian.historicalEvents?.length ? kapian.historicalEvents : (building.events || []).map((item) => {
    const desc = isZh() ? item.desc : (item.descEn || item.desc)
    return item.year ? `${item.year} · ${desc}` : desc
  })
  const festivals = kapian.festivals || []
  const anecdotes = kapian.anecdotes || building.anecdotes || []

  const sections = [
    { title: pick('历史事件', 'Historical Events'), items: historicalEvents },
    { title: pick('节庆与礼制', 'Festivals & Rituals'), items: festivals },
    { title: pick('逸闻掌故', 'Anecdotes'), items: anecdotes },
  ].filter((section) => section.items?.length)

  if (!sections.length) {
    return `<div class="overview-empty">${escapeHTML(pick('该建筑暂未整理事件资料。', 'No event record has been compiled for this building yet.'))}</div>`
  }

  return `
    <div class="info-title">${escapeHTML(isZh() ? building.name : (building.nameEn || building.name))}</div>
    <div class="info-subtitle">${escapeHTML(pick('时间与故事', 'Timeline & Stories'))}</div>
    ${sections.map((section) => `
      <section class="info-list">
        <article class="info-block"><div class="info-block__label">${escapeHTML(section.title)}</div></article>
        ${section.items.map((item) => `<div class="info-list__item">${escapeHTML(item)}</div>`).join('')}
      </section>
    `).join('')}
  `
}

function renderInfo() {
  const scope = getCurrentScope()
  stopCategoryCarousel()

  const ph = els.panelPlaceholder
  const ac = els.archiveCard
  const ca = els.cardContentArchive
  const ce = els.cardContentEvent
  const carousel = els.categoryCarousel
  const introCard = els.categoryIntroCard
  if (!ph || !ac || !ca || !ce) return

  if (scope.kind === 'building') {
    if (carousel) carousel.hidden = true
    if (introCard) introCard.hidden = true
    ph.hidden = true
    ac.hidden = false
    const tabEls = ac.querySelectorAll('.card-tab')
    tabEls.forEach((button) => {
      button.classList.toggle('active', button.dataset.tab === state.infoTab)
    })
    if (tabEls[0]) tabEls[0].textContent = pick('档案卡', 'Archive Card')
    if (tabEls[1]) tabEls[1].textContent = pick('事件卡', 'Event Card')
    ac.querySelectorAll('.card-tab').forEach((button) => {
      button.onclick = () => {
        state.infoTab = button.dataset.tab
        renderInfo()
      }
    })
    const isEvent = state.infoTab === 'event'
    ca.hidden = isEvent
    ce.hidden = !isEvent
    ca.innerHTML = buildBuildingArchiveHTML(scope.item)
    ce.innerHTML = buildBuildingEventHTML(scope.item)
    return
  }

  if (scope.kind === 'function') {
    ph.hidden = true
    ac.hidden = true
    if (introCard) introCard.hidden = false
    const intro = CATEGORY_INTROS[scope.item.id]
    const ids = intro?.buildingIds || scope.item.ids
    renderCategoryIntroHeader(scope)
    renderCategoryBuildingList(ids, scope.item.color)
    startCategoryCarousel(collectCarouselUrlsFromBuildingIds(ids))
    return
  }

  if (scope.kind === 'type') {
    ph.hidden = true
    ac.hidden = true
    if (introCard) introCard.hidden = false
    const source = TYPE_GROUP_META[scope.item.id]?.source
    const intro = source ? COMPONENT_TYPE_INTROS[source] : null
    const ids = intro?.buildingIds || scope.item.ids
    renderCategoryIntroHeader(scope)
    renderCategoryBuildingList(ids, scope.item.color)
    startCategoryCarousel(collectCarouselUrlsFromBuildingIds(ids))
    return
  }

  if (carousel) carousel.hidden = true
  if (introCard) introCard.hidden = true
  ph.hidden = false
  ac.hidden = true
  ph.innerHTML = buildOverviewCardHTML(getModuleIntro())
}

function initCharts() {
  if (!window.echarts) {
    els.functionChart.innerHTML = `<div class="overview-empty">${escapeHTML(pick('ECharts 加载失败。', 'ECharts failed to load.'))}</div>`
    els.typeChart.innerHTML = `<div class="overview-empty">${escapeHTML(pick('ECharts 加载失败。', 'ECharts failed to load.'))}</div>`
    return
  }

  functionChart = echarts.init(els.functionChart)
  typeChart = echarts.init(els.typeChart)

  functionChart.on('click', (params) => {
    if (params?.data?.groupId) selectFunction(params.data.groupId)
  })

  typeChart.on('click', (params) => {
    if (params?.data?.groupId) selectType(params.data.groupId)
  })

  renderCharts()
}

function renderCharts() {
  if (!functionChart || !typeChart) return

  functionChart.setOption({
    animationDuration: 700,
    grid: { left: 48, right: 14, top: 24, bottom: 48 },
    xAxis: {
      type: 'category',
      axisLine: { lineStyle: { color: 'rgba(92,61,35,0.18)' } },
      axisLabel: { color: '#5c4734', interval: 0, fontSize: 11, rotate: isZh() ? 0 : 12 },
      data: FUNCTION_GROUPS.map((group) => isZh() ? group.labelZh : group.labelEn),
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(92,61,35,0.08)' } },
      axisLabel: { color: '#6d5744' },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(40,24,15,0.9)',
      borderColor: 'rgba(255,231,173,0.18)',
      textStyle: { color: '#fff4d8' },
      formatter: (params) => {
        const current = params?.[0]?.data
        if (!current) return ''
        return `${isZh() ? current.labelZh : current.labelEn}<br>${pick('建筑数量', 'Count')}: ${current.value}`
      },
    },
    series: [{
      type: 'bar',
      barWidth: '52%',
      data: FUNCTION_GROUPS.map((group) => ({
        value: group.ids.length,
        labelZh: group.labelZh,
        labelEn: group.labelEn,
        groupId: group.id,
        itemStyle: {
          color: group.color,
          shadowBlur: state.selectedFunction === group.id ? 18 : 10,
          shadowColor: `${group.color}66`,
          borderRadius: [12, 12, 2, 2],
          opacity: state.selectedFunction && state.selectedFunction !== group.id ? 0.58 : 1,
        },
      })),
    }],
  })

  typeChart.setOption({
    animationDuration: 700,
    grid: { left: 48, right: 14, top: 24, bottom: 48 },
    xAxis: {
      type: 'category',
      axisLine: { lineStyle: { color: 'rgba(92,61,35,0.18)' } },
      axisLabel: { color: '#5c4734', interval: 0, fontSize: 11, rotate: isZh() ? 0 : 12 },
      data: TYPE_GROUPS.map((group) => isZh() ? group.labelZh : group.labelEn),
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(92,61,35,0.08)' } },
      axisLabel: { color: '#6d5744' },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(40,24,15,0.9)',
      borderColor: 'rgba(255,231,173,0.18)',
      textStyle: { color: '#fff4d8' },
      formatter: (params) => {
        const current = params?.[0]?.data
        if (!current) return ''
        return `${isZh() ? current.labelZh : current.labelEn}<br>${pick('建筑数量', 'Count')}: ${current.value}`
      },
    },
    series: [{
      type: 'bar',
      barWidth: '52%',
      data: TYPE_GROUPS.map((group) => ({
        value: group.ids.length,
        labelZh: group.labelZh,
        labelEn: group.labelEn,
        groupId: group.id,
        itemStyle: {
          color: group.color,
          shadowBlur: state.selectedType === group.id ? 18 : 10,
          shadowColor: `${group.color}66`,
          borderRadius: [12, 12, 2, 2],
          opacity: state.selectedType && state.selectedType !== group.id ? 0.58 : 1,
        },
      })),
    }],
  })
}

function openLightbox(src) {
  const root = document.getElementById('image-lightbox')
  const img = document.getElementById('lightbox-img')
  if (!root || !img || !src) return
  img.src = src
  img.alt = pick('图片放大', 'Image preview')
  root.hidden = false
  document.body.style.overflow = 'hidden'
  root.querySelector('.image-lightbox__close')?.focus()
}

function closeLightbox() {
  const root = document.getElementById('image-lightbox')
  const img = document.getElementById('lightbox-img')
  if (!root) return
  root.hidden = true
  if (img) img.removeAttribute('src')
  document.body.style.overflow = ''
}

function bindLightboxEvents() {
  const root = document.getElementById('image-lightbox')
  if (!root) return
  root.querySelectorAll('[data-lightbox-close]').forEach(function(el) {
    el.addEventListener('click', closeLightbox)
  })
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !root.hidden) closeLightbox()
  })
  document.addEventListener('click', function(e) {
    const trigger = e.target.closest('[data-lightbox-src]')
    if (!trigger) return
    e.preventDefault()
    const src = trigger.getAttribute('data-lightbox-src')
    if (src) openLightbox(src)
  })
}

function renderAll() {
  renderHeader()
  renderNav()
  renderLayoutVisibility()
  if (state.module === 'archive') {
    renderFilterPanels()
    renderOverview()
    renderInfo()
    renderCharts()
    requestAnimationFrame(() => {
      functionChart?.resize()
      typeChart?.resize()
    })
  } else {
    stopCategoryCarousel()
  }
}

function renderLayoutVisibility() {
  document.querySelectorAll('.module-layout').forEach((el) => {
    el.hidden = el.dataset.layout !== state.module
  })
}

async function initApp() {
  bindElements()
  bindLightboxEvents()
  bindEvents()
  await createHotspots()
  initCharts()
  renderAll()
}

document.addEventListener('DOMContentLoaded', initApp)
