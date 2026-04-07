/* =====================================================
   js/archive.js - 模块一：建筑档案
   ===================================================== */

/* ---------- 当前档案卡标签页 ---------- */
let currentArchiveTab = 'archive'
let currentBuildingIndex = 0
let currentBuildingList = []


const BUILDING_IMAGE_OVERRIDES = {
  dongliugong: 'images/buildings/东西六宫.jpg',
}

function getBuildingImagePath(buildingId) {
  const building = BUILDINGS[buildingId]
  if (!building) return ''
  return BUILDING_IMAGE_OVERRIDES[buildingId] || `images/buildings/${building.name}.jpg`
}

function setBuildingPreview(buildingId) {
  const lang = state.language
  const placeholder = $('#building-image-placeholder')
  const imagePath = getBuildingImagePath(buildingId)
  if (!placeholder) return

  $('#category-carousel').style.display = 'none'
  placeholder.style.display = 'block'
  placeholder.style.background = 'var(--bg-pattern)'
  placeholder.style.border = '1px solid var(--border-gold)'
  placeholder.style.padding = '0'
  placeholder.style.cursor = imagePath ? 'pointer' : 'default'
  placeholder.onclick = imagePath ? () => openImageViewer(imagePath) : null
  placeholder.innerHTML = imagePath ? `
    <img src="${imagePath}" alt="${BUILDINGS[buildingId]?.name || ''}"
      style="width:100%;height:180px;object-fit:cover;display:block;cursor:pointer;"
      onerror="this.onerror=null;this.parentElement.innerHTML='<div style=&quot;width:100%;height:180px;background:var(--bg-pattern);display:flex;align-items:center;justify-content:center;color:var(--text-light);font-size:13px;&quot;>${lang === 'zh' ? '暂无图片' : 'No image'}</div>';this.parentElement.style.cursor='default';this.parentElement.onclick=null;">
  ` : `<div style="width:100%;height:180px;background:var(--bg-pattern);display:flex;align-items:center;justify-content:center;color:var(--text-light);font-size:13px;">${lang === 'zh' ? '暂无图片' : 'No image'}</div>`
}

/* ---------- 建筑选择回调（由 map.js 调用） ---------- */
function onBuildingSelect(buildingId) {
  const building = BUILDINGS[buildingId]
  if (!building) return

  // 隐藏分类简介卡和构件类型简介卡
  stopCarousel()
  $('#category-carousel').style.display = 'none'
  $('#building-image-placeholder').style.display = 'block'
  $('#category-intro-card').style.display = 'none'
  $('#component-intro-card').style.display = 'none'

  // 更新索引列表（用于左右切换）
  if (state.selectedCategory === 'all') {
    currentBuildingList = Object.values(BUILDINGS)
  } else {
    currentBuildingList = Object.values(BUILDINGS).filter(b => b.category === state.selectedCategory)
  }

  const idx = currentBuildingList.findIndex(b => b.id === buildingId)
  if (idx >= 0) currentBuildingIndex = idx

  // 判断是否有 kapian 详细数据
  if (BUILDING_KAPIAN_DATA[buildingId]) {
    renderKapianArchiveCard(buildingId)
  } else {
    renderNoArchiveCard(building)
  }

  setBuildingPreview(buildingId)
}

/* ---------- 渲染无档案占位卡（无 kapian 数据时使用） ---------- */
function renderNoArchiveCard(building) {
  const lang = state.language

  $('#panel-placeholder').style.display = 'none'
  $('#culture-card').style.display = 'none'
  $('#component-type-card').style.display = 'none'
  $('#category-intro-card').style.display = 'none'
  $('#component-intro-card').style.display = 'none'
  $('#simple-building-card')?.remove()
  $('#archive-card').style.display = 'block'

  // 标签切换
  $$('#archive-card .card-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === currentArchiveTab)
  })
  $('#card-content-archive').style.display = currentArchiveTab === 'archive' ? 'block' : 'none'
  $('#card-content-event').style.display = currentArchiveTab === 'event' ? 'block' : 'none'

  // 无档案内容
  if (currentArchiveTab === 'archive') {
    const el = $('#card-content-archive')
    el.innerHTML = `
      <div style="text-align:center;padding:40px 16px 20px;">
        <div style="font-size:16px;color:var(--text);font-weight:600;margin-bottom:4px;">
          ${lang === 'zh' ? building.name : building.nameEn}
        </div>
        <div style="font-size:12px;color:var(--text-light);margin-bottom:16px;">
          ${building.pinyin || ''}
        </div>
        <div style="font-size:13px;color:var(--text-light);line-height:1.8;padding:12px 8px;
          border:1px dashed var(--border);border-radius:6px;background:rgba(245,242,235,0.3);">
          ${lang === 'zh' ? '暂无详细建筑档案' : 'No detailed archive available'}
        </div>
      </div>
    `
  } else {
    const el = $('#card-content-event')
    el.innerHTML = `
      <div style="text-align:center;padding:40px 16px;">
        <div style="font-size:13px;color:var(--text-light);">
          ${lang === 'zh' ? '暂无历史事件记录' : 'No historical events recorded'}
        </div>
      </div>
    `
  }

  // 隐藏探索按钮（无档案的建筑不显示）
  const wisdomBtn = $('#btn-explore-wisdom')
  wisdomBtn.style.display = 'none'
}

/* ---------- 标签切换 ---------- */
$$('#archive-card .card-tab').forEach(el => {
  el.addEventListener('click', () => {
    currentArchiveTab = el.dataset.tab
    const buildingId = state.selectedBuilding
    if (buildingId) {
      onBuildingSelect(buildingId)
      renderMap()
      if (typeof syncSVGCategoryHighlight === 'function') syncSVGCategoryHighlight()
      if (typeof syncSVGTypeHighlight === 'function') syncSVGTypeHighlight()
    }
  })
})

/* ---------- 左右切换建筑 ---------- */
function navigateBuildings(dir) {
  if (currentBuildingList.length === 0) return
  currentBuildingIndex = (currentBuildingIndex + dir + currentBuildingList.length) % currentBuildingList.length
  const building = currentBuildingList[currentBuildingIndex]
  if (building) {
    state.selectedBuilding = building.id
    if (typeof onBuildingSelect === 'function') {
      onBuildingSelect(building.id)
    }
    renderMap()
  }
}

/* =====================================================
   模块一：分类轮播 + 简介面板
   ===================================================== */

/* ---------- 轮播状态 ---------- */
let carouselInterval = null
let carouselIndex = 0
let currentCarouselImages = []

function startCarousel(images) {
  currentCarouselImages = images.filter(img => img)
  carouselIndex = 0
  if (carouselInterval) clearInterval(carouselInterval)
  renderCarouselSlide(0)
  carouselInterval = setInterval(() => {
    if (currentCarouselImages.length === 0) return
    carouselIndex = (carouselIndex + 1) % currentCarouselImages.length
    renderCarouselSlide(carouselIndex)
  }, 3000)

  $('#carousel-prev').onclick = () => {
    if (currentCarouselImages.length === 0) return
    carouselIndex = (carouselIndex - 1 + currentCarouselImages.length) % currentCarouselImages.length
    renderCarouselSlide(carouselIndex)
  }
  $('#carousel-next').onclick = () => {
    if (currentCarouselImages.length === 0) return
    carouselIndex = (carouselIndex + 1) % currentCarouselImages.length
    renderCarouselSlide(carouselIndex)
  }
}

function renderCarouselSlide(idx) {
  const track = $('#carousel-track')
  if (!track) return
  const img = currentCarouselImages[idx] || ''
  track.innerHTML = `<img src="${img}" style="width:100%;height:180px;object-fit:cover;display:block;"
    onerror="this.style.display='none';this.parentElement.innerHTML='<div style=width:100%;height:180px;background:var(--bg-pattern);display:flex;align-items:center;justify-content:center;color:var(--text-light);font-size:13px;>${state.language === 'zh' ? '图片加载中...' : 'Loading image...'}</div>'">`

  const indicator = $('#carousel-indicator')
  if (!indicator) return
  indicator.innerHTML = currentCarouselImages.map((_, i) =>
    `<span class="carousel-dot${i === idx ? ' active-dot' : ''}"
      style="display:inline-block;width:6px;height:6px;border-radius:50%;
      background:${i === idx ? 'var(--gold)' : 'var(--border)'};
      margin:0 2px;cursor:pointer;transition:background 0.3s;"
      data-idx="${i}"
      onclick="if(window.carouselJump)window.carouselJump(${i})"></span>`
  ).join('')
  window.carouselJump = (i) => {
    carouselIndex = i
    renderCarouselSlide(carouselIndex)
  }
}

function stopCarousel() {
  if (carouselInterval) {
    clearInterval(carouselInterval)
    carouselInterval = null
  }
}

/* ---------- 渲染模块一分类简介面板 ---------- */
function renderCategoryPanel(category) {
  const lang = state.language
  const intro = CATEGORY_INTROS[category]
  if (!intro) return

  stopCarousel()

  // 隐藏其他面板
  $('#panel-placeholder').style.display = 'none'
  $('#archive-card').style.display = 'none'
  $('#culture-card').style.display = 'none'
  $('#component-type-card').style.display = 'none'
  $('#category-intro-card').style.display = 'none'
  $('#component-intro-card').style.display = 'none'
  $('#simple-building-card')?.remove()

  // 隐藏建筑图片占位，显示轮播
  $('#building-image-placeholder').style.display = 'none'
  $('#category-carousel').style.display = 'block'
  $('#category-intro-card').style.display = 'block'
  startCarousel(intro.images)

  // 分类简介框
  const introEl = $('#category-intro-box')
  if (introEl) {
    introEl.innerHTML = `
      <div class="section-title" style="font-size:13px;color:var(--gold);margin-bottom:6px;letter-spacing:1px;">
        ${category === 'all'
          ? (lang === 'zh' ? '— 故宫总览 —' : '— Forbidden City Overview —')
          : (lang === 'zh' ? '— 分类介绍 —' : '— Category Overview —')}
      </div>
      <p style="font-size:12px;line-height:1.75;color:var(--text-light);text-align:justify;">
        ${intro.desc}
      </p>
    `
  }

  // 建筑列表
  const listEl = $('#category-building-list')
  if (listEl) {
    const catColor = getCategoryColor(category)
    listEl.innerHTML = `
      <div class="section-title" style="font-size:13px;color:var(--text);margin-bottom:6px;">
        ${category === 'all'
          ? (lang === 'zh' ? '总览建筑' : 'All Buildings')
          : (lang === 'zh' ? '本类建筑' : 'Buildings in Category')}
        <span style="font-size:11px;color:var(--text-muted);font-weight:normal;margin-left:4px;">
          (${intro.buildings.length})
        </span>
      </div>
      ${intro.buildings.map((bName, i) => {
        const bId = intro.buildingIds[i]
        return `<div class="category-building-item" data-id="${bId}"
          style="display:flex;align-items:center;gap:8px;padding:5px 4px;
          border-bottom:1px solid var(--border);cursor:pointer;color:var(--text);
          font-size:13px;border-radius:3px;transition:background 0.2s;">
          <span style="width:6px;height:6px;border-radius:50%;background:${catColor};flex-shrink:0;"></span>
          <span>${bName}</span>
          <span style="margin-left:auto;font-size:11px;color:var(--text-light);">&#8250;</span>
        </div>`
      }).join('')}
    `
    listEl.querySelectorAll('.category-building-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id
        if (id && BUILDINGS[id]) {
          stopPulse()
          stopCarousel()
          state.selectedBuilding = id
          if (typeof clearMapSelection === 'function') clearMapSelection(true)
          onBuildingSelect(id)
          renderMap()
        }
      })
      item.addEventListener('mouseenter', () => {
        item.style.background = 'var(--gold-pale)'
      })
      item.addEventListener('mouseleave', () => {
        item.style.background = ''
      })
    })
  }

  renderMap()
}

/* ---------- 渲染模块三构件类型简介面板 ---------- */
function renderComponentTypeIntroPanel(type) {
  const lang = state.language
  if (!type || type === 'all') {
    if (typeof renderComponentTypeAllPanel === 'function') {
      renderComponentTypeAllPanel()
    }
    return
  }

  const intro = COMPONENT_TYPE_INTROS[type]
  if (!intro) return

  const typeColor = (typeof getComponentTypeColor === 'function') ? getComponentTypeColor(type) : 'var(--red)'

  stopCarousel()

  $('#panel-placeholder').style.display = 'none'
  $('#archive-card').style.display = 'none'
  $('#culture-card').style.display = 'none'
  $('#component-type-card').style.display = 'none'
  $('#category-intro-card').style.display = 'none'
  $('#component-intro-card').style.display = 'none'
  $('#simple-building-card')?.remove()

  $('#building-image-placeholder').style.display = 'none'
  $('#category-carousel').style.display = 'block'
  $('#component-intro-card').style.display = 'block'
  startCarousel(intro.images)

  const introEl = $('#component-intro-box')
  if (introEl) {
    introEl.innerHTML = `
      <div class="section-title" style="font-size:13px;color:${typeColor};margin-bottom:6px;letter-spacing:1px;">
        ${lang === 'zh' ? '— 类型简介 —' : '— Type Overview —'}
      </div>
      <p style="font-size:12px;line-height:1.75;color:var(--text-light);text-align:justify;">
        ${intro.desc}
      </p>
    `
  }

  const listEl = $('#component-building-list')
  if (listEl) {
    listEl.innerHTML = `
      <div class="section-title" style="font-size:13px;color:var(--text);margin-bottom:6px;">
        ${lang === 'zh' ? '本类建筑' : 'Buildings in Type'}
        <span style="font-size:11px;color:var(--text-muted);font-weight:normal;margin-left:4px;">
          (${intro.buildings.length})
        </span>
      </div>
      ${intro.buildings.map((bName, i) => {
        const bId = intro.buildingIds[i]
        return `<div class="category-building-item" data-id="${bId}"
          style="display:flex;align-items:center;gap:8px;padding:5px 4px;
          border-bottom:1px solid var(--border);cursor:pointer;color:var(--text);
          font-size:13px;border-radius:3px;transition:background 0.2s;">
          <span style="width:6px;height:6px;border-radius:50%;background:${typeColor};flex-shrink:0;"></span>
          <span>${bName}</span>
          <span style="margin-left:auto;font-size:11px;color:var(--text-light);">&#8250;</span>
        </div>`
      }).join('')}
    `
    listEl.querySelectorAll('.category-building-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id
        if (id && BUILDINGS[id]) {
          stopPulse()
          stopCarousel()
          state.selectedBuilding = id
          if (typeof clearMapSelection === 'function') clearMapSelection(true)
          onBuildingSelect(id)
          renderMap()
        }
      })
      item.addEventListener('mouseenter', () => {
        item.style.background = `${typeColor}14`
      })
      item.addEventListener('mouseleave', () => {
        item.style.background = ''
      })
    })
  }

  const btn = $('#btn-enter-panorama')
  if (btn) btn.style.display = 'none'
}

/* =====================================================
   模块一：增强档案卡（使用 kapian.md 数据）
   ===================================================== */

/* ---------- 增强渲染档案卡（kapian 数据） ---------- */
function renderKapianArchiveCard(buildingId) {
  const lang = state.language
  const building = BUILDINGS[buildingId]
  const kData = BUILDING_KAPIAN_DATA[buildingId]
  if (!building) return

  $('#panel-placeholder').style.display = 'none'
  $('#culture-card').style.display = 'none'
  $('#component-type-card').style.display = 'none'
  $('#category-intro-card').style.display = 'none'
  $('#component-intro-card').style.display = 'none'
  $('#simple-building-card')?.remove()
  $('#archive-card').style.display = 'block'

  // 标签切换
  $$('#archive-card .card-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === currentArchiveTab)
  })
  $('#card-content-archive').style.display = currentArchiveTab === 'archive' ? 'block' : 'none'
  $('#card-content-event').style.display = currentArchiveTab === 'event' ? 'block' : 'none'

  // 档案内容
  if (currentArchiveTab === 'archive') {
    renderKapianArchiveContent(buildingId, lang)
  } else {
    renderKapianEventContent(buildingId, lang)
  }

  // 探索构建智慧按钮：只要有详细档案的建筑就显示
  const wisdomBtn = $('#btn-explore-wisdom')
  const hasKapianData = !!(BUILDING_KAPIAN_DATA && Object.keys(BUILDING_KAPIAN_DATA).length)
  wisdomBtn.style.display = hasKapianData ? 'inline-block' : 'none'
}

function renderKapianArchiveContent(buildingId, lang) {
  const building = BUILDINGS[buildingId]
  const kData = BUILDING_KAPIAN_DATA[buildingId]
  const cat = FUNCTION_CATEGORIES.find(c => c.id === building.category)
  const catColor = cat ? cat.color : ''
  const el = $('#card-content-archive')

  const idLabel = lang === 'zh' ? '建筑身份' : 'Building Identity'
  const idText = kData ? (lang === 'zh' ? kData.identity : kData.identityEn) : (lang === 'zh' ? building.archive : building.archiveEn)
  const timeline = kData ? kData.timeline : ''
  const materials = kData ? kData.materials : ''
  const style = kData ? kData.style : ''
  const funcCat = kData ? kData.functionCat : ''

  el.innerHTML = `
    <div style="text-align:center;padding-bottom:10px;">
      <div class="section-title" style="font-size:16px;font-weight:600;color:var(--text);">
        ${lang === 'zh' ? building.name : building.nameEn}
      </div>
      <div style="color:var(--text-light);font-size:12px;margin-top:2px;">
        ${building.pinyin || ''} · ${lang === 'zh' ? building.nameEn : building.name}
      </div>
      ${building.alias ? `<div style="color:var(--gold);font-size:12px;margin-top:2px;">${lang === 'zh' ? '别名：' : 'Alias: '}${lang === 'zh' ? building.alias : building.aliasEn}</div>` : ''}
    </div>
    <div class="divider"></div>

    <!-- 建筑身份 -->
    <div style="margin-bottom:10px;">
      <div class="section-title" style="font-size:12px;color:var(--gold);margin-bottom:4px;letter-spacing:1px;">
        ${lang === 'zh' ? '◆ 建筑身份' : '◆ Building Identity'}
      </div>
      <p style="font-size:12px;color:var(--text);line-height:1.7;padding-left:8px;border-left:2px solid var(--gold);">
        ${idText}
      </p>
    </div>

    <!-- 建造时间线 -->
    ${timeline ? `
    <div style="margin-bottom:10px;">
      <div class="section-title" style="font-size:12px;color:var(--text-light);margin-bottom:4px;">
        ${lang === 'zh' ? '◆ 建造时间线' : '◆ Timeline'}
      </div>
      <p style="font-size:12px;color:var(--text-light);line-height:1.7;padding-left:8px;">
        ${timeline}
      </p>
    </div>
    ` : ''}

    <!-- 材料来源 -->
    ${materials ? `
    <div style="margin-bottom:10px;">
      <div class="section-title" style="font-size:12px;color:var(--text-light);margin-bottom:4px;">
        ${lang === 'zh' ? '◆ 材料来源' : '◆ Materials'}
      </div>
      <p style="font-size:12px;color:var(--text-light);line-height:1.7;padding-left:8px;">
        ${materials}
      </p>
    </div>
    ` : ''}

    <!-- 建筑样式组成 -->
    ${style ? `
    <div style="margin-bottom:10px;">
      <div class="section-title" style="font-size:12px;color:var(--text-light);margin-bottom:4px;">
        ${lang === 'zh' ? '◆ 建筑样式' : '◆ Architectural Style'}
      </div>
      <p style="font-size:12px;color:var(--text-light);line-height:1.7;padding-left:8px;">
        ${style}
      </p>
    </div>
    ` : ''}

    <!-- 功能分类 -->
    ${funcCat ? `
    <div style="margin-bottom:10px;">
      <div class="section-title" style="font-size:12px;color:var(--text-light);margin-bottom:4px;">
        ${lang === 'zh' ? '◆ 功能分类' : '◆ Function'}
      </div>
      <p style="font-size:12px;color:var(--text-light);padding-left:8px;font-weight:500;">
        ${funcCat}
      </p>
    </div>
    ` : ''}
  `
}

function renderKapianEventContent(buildingId, lang) {
  const building = BUILDINGS[buildingId]
  const kData = BUILDING_KAPIAN_DATA[buildingId]
  const el = $('#card-content-event')

  if (!kData) {
    // fallback to basic events (no content without kapian data)
    const el = $('#card-content-event')
    el.innerHTML = `
      <div style="text-align:center;padding:40px 16px;">
        <div style="font-size:13px;color:var(--text-light);">
          ${lang === 'zh' ? '暂无历史事件记录' : 'No historical events recorded'}
        </div>
      </div>
    `
    return
  }

  const historicalEvents = kData.historicalEvents || []
  const festivals = kData.festivals || []
  const anecdotes = kData.anecdotes || []

  el.innerHTML = `
    <div class="divider"></div>
    <!-- 历史事件 -->
    ${historicalEvents.length > 0 ? `
    <div style="margin-bottom:10px;">
      <div class="section-title" style="font-size:12px;color:var(--red);margin-bottom:6px;">
        ${lang === 'zh' ? '◆ 历史事件' : '◆ Historical Events'}
      </div>
      ${historicalEvents.map(ev => `
        <div style="display:flex;gap:10px;padding:6px 0;border-bottom:1px solid var(--border);">
          <span style="color:var(--gold);font-family:'Noto Serif SC',serif;font-size:12px;flex-shrink:0;">&#9670;</span>
          <span style="color:var(--text);font-size:12px;line-height:1.6;">${ev}</span>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <!-- 节庆日 -->
    ${festivals.length > 0 ? `
    <div style="margin-bottom:10px;">
      <div class="section-title" style="font-size:12px;color:var(--gold);margin-bottom:6px;">
        ${lang === 'zh' ? '◆ 节庆日' : '◆ Festivals'}
      </div>
      ${festivals.map(f => `
        <div style="display:flex;gap:10px;padding:4px 0;border-bottom:1px solid var(--border);">
          <span style="color:var(--gold);font-size:11px;flex-shrink:0;">&#9670;</span>
          <span style="color:var(--text-light);font-size:12px;line-height:1.6;">${f}</span>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <!-- 趣闻轶事 -->
    <div>
      <div class="section-title" style="font-size:12px;color:var(--fn-culture);margin-bottom:6px;">
        ${lang === 'zh' ? '◆ 趣闻轶事' : '◆ Anecdotes'}
      </div>
      ${anecdotes.length > 0 ? anecdotes.map(a => `
        <div style="display:flex;gap:8px;padding:4px 0;">
          <span style="color:var(--fn-culture);font-size:10px;line-height:20px;flex-shrink:0;">&#9670;</span>
          <span style="color:var(--text-light);font-size:12px;line-height:1.65;">${a}</span>
        </div>
      `).join('') : `<p style="color:var(--text-light);font-size:12px;">${lang === 'zh' ? '暂无趣闻' : 'No anecdotes'}</p>`}
    </div>
  `
}

/* ---------- 分类标签点击时显示分类简介卡（已由 app.js 统一处理，此处不再重复监听） ---------- */

/* ---------- 构件类型标签点击时显示类型简介卡（已由 app.js 统一处理，此处不再重复监听） ---------- */
