/* =====================================================
   js/panorama.js - 全景模式
   ===================================================== */

let currentCompTab = 'craft'
let currentCompId = null

/* ---------- 初始化全景模式 ---------- */
function initPanorama() {
  const building = BUILDINGS[state.panoramaBuilding]
  if (!building) return

  const lang = state.language

  // 顶部构件按钮
  const btnContainer = $('#component-buttons')
  btnContainer.innerHTML = ''

  if (building.components && building.components.length > 0) {
    building.components.forEach((comp, i) => {
      const btn = document.createElement('button')
      btn.className = 'comp-btn'
      btn.textContent = lang === 'zh' ? comp.name : comp.nameEn
      btn.style.borderColor = comp.highlightColor
      btn.style.color = comp.highlightColor
      btn.dataset.compId = comp.id
      btn.onclick = () => selectComponent(comp.id)
      btnContainer.appendChild(btn)
    })
    selectComponent(building.components[0].id)
  }

  // 右侧详情
  renderComponentDetail(building, lang)

  // 游戏按钮
  const btnGame = $('#btn-game')
  btnGame.style.display = building.game ? 'inline-block' : 'none'
  btnGame.textContent = lang === 'zh' ? '开始游戏 🎮' : 'Play Game 🎮'

  // 画布占位
  renderPanoramaPlaceholder(building)
}

/* ---------- 构件按钮点击 ---------- */
function selectComponent(compId) {
  currentCompId = compId
  $$('.comp-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.compId === compId)
  })

  const building = BUILDINGS[state.panoramaBuilding]
  if (!building) return

  const comp = building.components.find(c => c.id === compId)
  if (!comp) return

  const lang = state.language
  const content = $('#component-detail-content')

  if (currentCompTab === 'craft') {
    content.innerHTML = `
      <div class="section-title" style="font-size:14px;color:${comp.highlightColor};">${lang === 'zh' ? comp.name : comp.nameEn}</div>
      <p style="font-size:13px;line-height:1.8;color:var(--text);margin-top:8px;">${comp.craft || '// TODO'}</p>
    `
  } else if (currentCompTab === 'physics') {
    content.innerHTML = `
      <div class="section-title" style="font-size:14px;color:${comp.highlightColor};">${lang === 'zh' ? comp.name : comp.nameEn}</div>
      <p style="font-size:13px;line-height:1.8;color:var(--text);margin-top:8px;">${comp.physics || '// TODO'}</p>
    `
  } else {
    content.innerHTML = `
      <div class="section-title" style="font-size:14px;color:${comp.highlightColor};">${lang === 'zh' ? comp.name : comp.nameEn}</div>
      <p style="font-size:13px;line-height:1.8;color:var(--text);margin-top:8px;">${comp.culture || '// TODO'}</p>
    `
  }

  // 画布高亮
  highlightComponentOnCanvas(comp)
}

/* ---------- 构件详情面板 ---------- */
function renderComponentDetail(building, lang) {
  // 标题
  const titleEl = document.createElement('div')
  titleEl.style.cssText = 'text-align:center;padding-bottom:8px;'
  titleEl.innerHTML = `
    <div style="font-family:'Noto Serif SC',serif;font-size:15px;color:var(--text);">${lang === 'zh' ? building.name : building.nameEn}</div>
    <div style="font-size:11px;color:var(--text-light);margin-top:2px;">${building.pinyin || ''}</div>
  `

  // 标签切换
  $$('#component-tabs .card-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === currentCompTab)
  })
}

/* ---------- 标签切换 ---------- */
function switchComponentTab(tab) {
  currentCompTab = tab
  $$('#component-tabs .card-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab)
  })

  if (currentCompId) {
    selectComponent(currentCompId)
  }
}

/* ---------- 画布占位（剖面图） ---------- */
function renderPanoramaPlaceholder(building) {
  const canvas = $('#panorama-canvas')
  canvas.width = canvas.parentElement.clientWidth
  canvas.height = canvas.parentElement.clientHeight

  const ctx = canvas.getContext('2d')
  const W = canvas.width
  const H = canvas.height

  ctx.fillStyle = '#EDE7D9'
  ctx.fillRect(0, 0, W, H)

  ctx.strokeStyle = 'rgba(184,134,11,0.2)'
  ctx.lineWidth = 1
  ctx.setLineDash([4, 4])

  // 画网格
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
  }
  for (let y = 0; y < H; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
  }

  ctx.setLineDash([])

  // 标注
  ctx.fillStyle = 'rgba(44,36,24,0.3)'
  ctx.font = '14px "Noto Serif SC", serif'
  ctx.textAlign = 'center'
  ctx.fillText(lang => (state.language === 'zh' ? building.name : building.nameEn) + ' ' + (state.language === 'zh' ? '剖面图占位' : 'Section Placeholder'), W / 2, H / 2 - 10)
  ctx.fillStyle = 'rgba(44,36,24,0.2)'
  ctx.font = '12px "Noto Sans SC", sans-serif'
  ctx.fillText(state.language === 'zh' ? '点击构件按钮查看详情' : 'Click component buttons to view details', W / 2, H / 2 + 14)
}

/* ---------- 高亮构件（画布占位） ---------- */
function highlightComponentOnCanvas(comp) {
  const canvas = $('#panorama-canvas')
  const ctx = canvas.getContext('2d')
  const W = canvas.width
  const H = canvas.height

  ctx.fillStyle = '#EDE7D9'
  ctx.fillRect(0, 0, W, H)

  ctx.strokeStyle = 'rgba(184,134,11,0.2)'
  ctx.lineWidth = 1
  ctx.setLineDash([4, 4])
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
  }
  for (let y = 0; y < H; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
  }
  ctx.setLineDash([])

  // 标注
  ctx.fillStyle = comp.highlightColor || '#8B2500'
  ctx.font = 'bold 20px "Noto Serif SC", serif'
  ctx.textAlign = 'center'
  ctx.fillText(state.language === 'zh' ? comp.name : comp.nameEn, W / 2, H / 2 - 20)

  ctx.fillStyle = 'rgba(44,36,24,0.3)'
  ctx.font = '12px "Noto Sans SC", sans-serif'
  ctx.fillText(state.language === 'zh' ? '点击查看构件详情 →' : 'View component details →', W / 2, H / 2 + 10)
}

/* ---------- 游戏入口 ---------- */
function openGame(buildingId) {
  const building = BUILDINGS[buildingId]
  if (!building || !building.game) return
  if (typeof openGameModal === 'function') {
    openGameModal(building)
  }
}
