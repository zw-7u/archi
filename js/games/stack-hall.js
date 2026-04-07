/* =====================================================
   js/games/stack-hall.js - 堆叠太和殿
   ===================================================== */
// 太和殿构件拖拽堆叠游戏（占位实现）
function startStackHall(canvas, building) {
  const ctx = canvas.getContext('2d')
  canvas.width = canvas.parentElement.clientWidth
  canvas.height = canvas.parentElement.clientHeight
  const W = canvas.width
  const H = canvas.height

  const lang = state.language
  const components = [
    { name: '三层须弥座', nameEn: 'Three-tier Sumeru Platform', color: '#EDE7D9' },
    { name: '金砖地面', nameEn: 'Gold Brick Floor', color: '#C9A84C' },
    { name: '柱网与墙体', nameEn: 'Columns & Walls', color: '#8B2500' },
    { name: '斗拱层', nameEn: 'Dougong Layer', color: '#5B7F5E' },
    { name: '屋顶框架', nameEn: 'Roof Frame', color: '#B8860B' },
    { name: '黄琉璃瓦', nameEn: 'Yellow Glazed Tiles', color: '#D4A84B' },
    { name: '脊兽', nameEn: 'Ridge Beasts', color: '#C04000' },
  ]

  const itemH = 40
  const gap = 10
  const startY = 40
  const colW = 200

  // 左列：可拖拽构件
  const leftItems = components.map((c, i) => ({
    ...c,
    x: 40,
    y: startY + i * (itemH + gap),
    w: colW,
    h: itemH,
    placed: false,
    origX: 40,
    origY: startY + i * (itemH + gap),
  }))

  // 右列：目标位置（从上到下依次对齐）
  const rightTargets = components.map((c, i) => ({
    ...c,
    x: W - colW - 40,
    y: startY + i * (itemH + gap),
    w: colW,
    h: itemH,
    filled: false,
  }))

  let dragging = null

  function draw() {
    ctx.clearRect(0, 0, W, H)

    // 背景
    ctx.fillStyle = '#FAF7F0'
    ctx.fillRect(0, 0, W, H)

    // 标题
    ctx.fillStyle = '#8B2500'
    ctx.font = 'bold 18px "Noto Serif SC", serif'
    ctx.textAlign = 'center'
    ctx.fillText(lang === 'zh' ? '堆叠太和殿' : 'Stack the Hall of Supreme Harmony', W / 2, 28)

    // 左列标签
    ctx.fillStyle = '#6B5D4F'
    ctx.font = '12px "Noto Sans SC", sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(lang === 'zh' ? '拖拽以下构件到右侧' : 'Drag components to the right', 40, startY - 12)

    // 绘制目标区
    rightTargets.forEach((t, i) => {
      ctx.fillStyle = t.filled ? 'rgba(91,127,94,0.2)' : 'rgba(139,37,0,0.08)'
      ctx.strokeStyle = t.filled ? '#5B7F5E' : 'rgba(184,134,11,0.3)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(t.x, t.y, t.w, t.h, 4)
      ctx.fill()
      ctx.setLineDash([4, 4])
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = t.filled ? '#5B7F5E' : 'rgba(44,36,24,0.3)'
      ctx.font = '13px "Noto Serif SC", serif'
      ctx.textAlign = 'center'
      ctx.fillText(t.filled ? (lang === 'zh' ? '✓ ' : '✓ ') + (lang === 'zh' ? t.name : t.nameEn) : (lang === 'zh' ? t.name : t.nameEn), t.x + t.w / 2, t.y + t.h / 2 + 5)
    })

    // 绘制可拖拽构件
    leftItems.forEach(item => {
      if (item.placed) return
      ctx.fillStyle = item.color
      ctx.strokeStyle = '#8B2500'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.roundRect(item.x, item.y, item.w, item.h, 4)
      ctx.fill()
      ctx.stroke()
      ctx.fillStyle = '#2C2418'
      ctx.font = '13px "Noto Serif SC", serif'
      ctx.textAlign = 'center'
      ctx.fillText(lang === 'zh' ? item.name : item.nameEn, item.x + item.w / 2, item.y + item.h / 2 + 5)
    })

    // 成功提示
    if (leftItems.every(i => i.placed)) {
      ctx.fillStyle = 'rgba(91,127,94,0.9)'
      ctx.beginPath()
      ctx.roundRect(W / 2 - 160, H - 80, 320, 50, 8)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 16px "Noto Serif SC", serif'
      ctx.textAlign = 'center'
      ctx.fillText(lang === 'zh' ? '太和殿组装完成！' : 'Hall of Supreme Harmony Complete!', W / 2, H - 52)
    }
  }

  function hitTest(x, y) {
    return leftItems.find(i => !i.placed && x >= i.x && x <= i.x + i.w && y >= i.y && y <= i.y + i.h)
  }

  function snapToTarget(item) {
    for (const t of rightTargets) {
      if (t.filled) continue
      if (Math.abs(item.x + item.w / 2 - (t.x + t.w / 2)) < 40 &&
          Math.abs(item.y + item.h / 2 - (t.y + t.h / 2)) < 40) {
        t.filled = true
        item.placed = true
        return true
      }
    }
    return false
  }

  canvas.onpointerdown = e => {
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    dragging = hitTest(x, y)
    if (dragging) canvas.setPointerCapture(e.pointerId)
  }

  canvas.onpointermove = e => {
    if (!dragging) return
    const rect = canvas.getBoundingClientRect()
    dragging.x = e.clientX - rect.left - dragging.w / 2
    dragging.y = e.clientY - rect.top - dragging.h / 2
    draw()
  }

  canvas.onpointerup = e => {
    if (!dragging) return
    if (!snapToTarget(dragging)) {
      dragging.x = dragging.origX
      dragging.y = dragging.origY
    }
    dragging = null
    draw()
  }

  draw()
}
