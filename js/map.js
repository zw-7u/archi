/* =====================================================
   js/map.js - 地图画布（基于 overview.svg 图片 + SVG 热区叠加）
   ===================================================== */

const $ = (selector) => document.querySelector(selector)

/* ---------- 全局变量 ---------- */
let mapScale = 1
let mapPosition = { x: 0, y: 0 }
let isDragging = false
let dragStart = { x: 0, y: 0 }
let pointerMoved = false   // 区分拖拽和点击
let hoveredBuildingId = null
let highlightedCategory = null   // 当前分类高亮
let highlightedType = null      // 当前构件类型高亮
let pendingCategoryHighlight = null  // 待 SVG 加载后应用的分类高亮
let pendingTypeHighlight = null     // 待 SVG 加载后应用的构件类型高亮
let cultureOverlayType = null   // 当前文化主题叠加

/* ---------- 脉冲动画状态 ---------- */
let pulseType = null       // 'category' | 'type' | null
let pulsePhase = 0         // 0~1 循环
let pulseAnimationId = null

function startPulse(type) {
  pulseType = type
  pulsePhase = 0
  if (!pulseAnimationId) {
    function tick() {
      pulsePhase = (pulsePhase + 0.008) % 1
      renderMap()
      pulseAnimationId = requestAnimationFrame(tick)
    }
    pulseAnimationId = requestAnimationFrame(tick)
  }
}

function stopPulse() {
  pulseType = null
  if (pulseAnimationId) {
    cancelAnimationFrame(pulseAnimationId)
    pulseAnimationId = null
  }
}

const SVG_W = 987.43
const SVG_H = 1398.86

/* ---------- DOM ---------- */
const mapCanvas = $('#map-canvas')
let mapCtx = null

/* ---------- SVG 内联加载 + 热点交互 ---------- */
let svgDoc = null        // SVG DOM 文档
let svgHotspotInitialized = false
let svgHoveredId = null
let svgActiveId = null

// 加载 SVG 并初始化热点（使用 svgScanner 自动扫描）
async function loadSVGHotspots() {
  const container = document.getElementById('svg-map-container')
  if (!container) {
    console.error('[SVG] #svg-map-container not found')
    return
  }

  const rect = container.getBoundingClientRect()
  console.log('[SVG] Container size:', rect.width, 'x', rect.height)

  try {
    let svgText = null
    const paths = [
      'images/map/overview.svg',
      '../images/map/overview.svg',
      '/images/map/overview.svg',
    ]

    for (const path of paths) {
      try {
        const res = await fetch(path)
        if (res.ok) {
          svgText = await res.text()
          console.log('[SVG] Loaded from:', path, '| Size:', svgText.length, 'bytes')
          break
        } else {
          console.warn('[SVG] Failed to load from', path, '| Status:', res.status)
        }
      } catch (e) {
        console.warn('[SVG] Error fetching', path, ':', e.message)
      }
    }

    if (!svgText) {
      console.error('[SVG] Could not load overview.svg from any path')
      return
    }

    container.innerHTML = svgText

    const svg = container.querySelector('svg')
    if (!svg) {
      console.warn('[SVG] No <svg> element found after injection')
      return
    }

    svg.setAttribute('width', '100%')
    svg.setAttribute('height', '100%')
    svg.style.width = '100%'
    svg.style.height = '100%'
    svg.style.display = 'block'
    svg.style.position = 'absolute'
    svg.style.top = '0'
    svg.style.left = '0'

    svgDoc = svg

    // 创建叠加层
    const interactionLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    interactionLayer.setAttribute('data-layer', 'hotspot-interaction')
    const overlayLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    overlayLayer.setAttribute('data-layer', 'hotspot-overlay')
    svg.appendChild(interactionLayer)
    svg.appendChild(overlayLayer)

    // 扫描热区并绑定事件
    const hotspots = scanSVGHotspots(svg)

    hotspots.forEach((hotspot) => {
      hotspot.group?.classList.add('building-hotspot')

      hotspot.overlayEl = createHotspotOverlay(svg, hotspot)

      if (hotspot.customPath) {
        const sourceEl = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        sourceEl.setAttribute('d', hotspot.customPath)
        sourceEl.style.fill = 'rgba(255,255,255,0.002)'
        hotspot.sourceEl = sourceEl
        interactionLayer.appendChild(sourceEl)
      }

      bindHotspotEvents(hotspot, {
        onHover: (h, e) => {
          if (svgActiveId === h.svgId) return
          svgHoveredId = h.svgId
          hoveredBuildingId = h.buildingId
          h.group?.classList.add('is-hovered')
          if (mapCanvas) mapCanvas.style.cursor = 'pointer'
          const displayName = state.lang === 'zh' ? h.labelZh : h.labelEn
          showBuildingTooltipAtMouse(h, displayName, displayName, e)
          renderMap()
        },
        onLeave: (h) => {
          if (svgActiveId === h.svgId) return
          svgHoveredId = null
          hoveredBuildingId = null
          h.group?.classList.remove('is-hovered')
          if (mapCanvas) mapCanvas.style.cursor = 'grab'
          hideBuildingTooltip()
          renderMap()
        },
        onClick: (h) => {
          const buildingId = h.buildingId
          if (svgActiveId && svgActiveId !== h.svgId) {
            const oldGroup = svgDoc?.getElementById(svgActiveId)
            if (oldGroup) oldGroup.classList.remove('is-active')
          }
          const wasActive = svgActiveId === h.svgId
          if (wasActive) {
            const group = svgDoc?.getElementById(h.svgId)
            if (group) group.classList.remove('is-active')
            hideBuildingTooltip()
            svgActiveId = null
            state.selectedBuilding = null
            $('#panel-placeholder').style.display = 'flex'
            $('#archive-card').style.display = 'none'
          } else {
            svgActiveId = h.svgId
            state.selectedBuilding = buildingId
            const group = svgDoc?.getElementById(h.svgId)
            if (group) group.classList.add('is-active')
            hideBuildingTooltip()
            if (typeof onBuildingSelect === 'function') {
              onBuildingSelect(buildingId)
            }
          }
          renderMap()
        },
      })
    })

    const img = svg.querySelector('image')
    if (img) {
      img.addEventListener('load', () => {
        setTimeout(() => {
          if (mapCanvas) {
            mapCanvas.width = mapCanvas.clientWidth
            mapCanvas.height = mapCanvas.clientHeight
            renderMap()
          }
        }, 100)
      })
    } else {
      setTimeout(() => {
        if (mapCanvas) {
          mapCanvas.width = mapCanvas.clientWidth
          mapCanvas.height = mapCanvas.clientHeight
          renderMap()
        }
      }, 100)
    }

    svgHotspotInitialized = true
    syncSVGCategoryHighlight()
    syncSVGTypeHighlight()

    if (pendingCategoryHighlight !== null && pendingCategoryHighlight !== highlightedCategory) {
      const saved = highlightedCategory
      highlightedCategory = pendingCategoryHighlight
      pendingCategoryHighlight = null
      syncSVGCategoryHighlight()
      highlightedCategory = saved
    }

    if (pendingTypeHighlight !== null && pendingTypeHighlight !== highlightedType) {
      const saved = highlightedType
      highlightedType = pendingTypeHighlight
      pendingTypeHighlight = null
      syncSVGTypeHighlight()
      highlightedType = saved
    }

    if (mapCanvas && mapCanvas.width > 0) {
      renderMap()
    }
  } catch (err) {
    console.warn('[SVG] 热点加载失败，使用 Canvas 纯图片模式:', err)
  }
}

// 初始化 SVG 热点（使用 svgScanner，替代旧版 initSVGHotspots）
// 注意：loadSVGHotspots 已内嵌扫描逻辑，此函数保留为兼容旧调用
function initSVGHotspots(svg) {
  if (!svg) return
  const hotspots = scanSVGHotspots(svg)
  hotspots.forEach((hotspot) => {
    hotspot.group?.classList.add('building-hotspot')
    hotspot.overlayEl = createHotspotOverlay(svg, hotspot)
    bindHotspotEvents(hotspot, {
      onHover: (h, e) => { onSVGHover(h, e) },
      onLeave: (h) => { onSVGHoverEnd(h) },
      onClick: (h) => { onSVGClick(h) },
    })
  })
}

// SVG 悬停处理
function onSVGHover(hotspot, e) {
  if (svgActiveId === hotspot.svgId) return
  svgHoveredId = hotspot.svgId
  hoveredBuildingId = hotspot.buildingId
  hotspot.group?.classList.add('is-hovered')
  if (mapCanvas) mapCanvas.style.cursor = 'pointer'
  const displayName = state.lang === 'zh' ? hotspot.labelZh : hotspot.labelEn
  showBuildingTooltipAtMouse(hotspot, displayName, displayName, e)
  renderMap()
}

// SVG 悬停结束
function onSVGHoverEnd(hotspot) {
  if (svgActiveId === hotspot.svgId) return
  svgHoveredId = null
  hoveredBuildingId = null
  hotspot.group?.classList.remove('is-hovered')
  if (mapCanvas) mapCanvas.style.cursor = 'grab'
  hideBuildingTooltip()
  renderMap()
}

// SVG 点击处理
function onSVGClick(hotspot) {
  const buildingId = hotspot.buildingId
  if (svgActiveId && svgActiveId !== hotspot.svgId) {
    const oldGroup = svgDoc?.getElementById(svgActiveId)
    if (oldGroup) oldGroup.classList.remove('is-active')
  }
  const wasActive = svgActiveId === hotspot.svgId
  if (wasActive) {
    const group = svgDoc?.getElementById(hotspot.svgId)
    if (group) group.classList.remove('is-active')
    hideBuildingTooltip()
    svgActiveId = null
    state.selectedBuilding = null
    $('#panel-placeholder').style.display = 'flex'
    $('#archive-card').style.display = 'none'
  } else {
    svgActiveId = hotspot.svgId
    state.selectedBuilding = buildingId
    const group = svgDoc?.getElementById(hotspot.svgId)
    if (group) group.classList.add('is-active')
    hideBuildingTooltip()
    if (typeof onBuildingSelect === 'function') {
      onBuildingSelect(buildingId)
    }
  }
  renderMap()
}

/* ---------- SVG 悬停 tooltip ---------- */
let tooltipEl = null

function getTooltipEl() {
  if (!tooltipEl) {
    tooltipEl = document.createElement('div')
    tooltipEl.id = 'building-tooltip'
    tooltipEl.style.cssText = 'position:fixed;z-index:9999;background:rgba(44,36,24,0.92);color:#FAF7F0;padding:5px 10px;border-radius:4px;font-size:13px;font-family:"Noto Sans SC",sans-serif;pointer-events:none;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:1px solid rgba(184,134,11,0.4);display:none;'
    document.body.appendChild(tooltipEl)
  }
  return tooltipEl
}

// tooltip 定位：基于鼠标事件（mousemove 中实时更新）
function showBuildingTooltipAtMouse(hotspot, name, nameEn, e) {
  const el = getTooltipEl()
  const lang = state.lang
  el.textContent = lang === 'zh' ? name : nameEn
  el.style.display = 'block'
  const cx = e.clientX
  const cy = e.clientY
  el.style.left = (cx - el.offsetWidth / 2) + 'px'
  el.style.top = (cy - el.offsetHeight - 14) + 'px'
}

function hideBuildingTooltip() {
  const el = getTooltipEl()
  el.style.display = 'none'
}

function clearMapSelection(keepPanel = false) {
  if (svgActiveId) {
    const group = svgDoc?.getElementById(svgActiveId)
    if (group) group.classList.remove('is-active')
  }
  svgActiveId = null
  svgHoveredId = null
  hoveredBuildingId = null
  state.selectedBuilding = null
  hideBuildingTooltip()
  if (!keepPanel) {
    $('#panel-placeholder').style.display = 'flex'
    $('#archive-card').style.display = 'none'
    $('#culture-card').style.display = 'none'
    $('#component-type-card').style.display = 'none'
    $('#category-intro-card').style.display = 'none'
    $('#component-intro-card').style.display = 'none'
    $('#category-carousel').style.display = 'none'
    $('#building-image-placeholder').style.display = 'block'
    $('#simple-building-card')?.remove()
  }
  renderMap()
}

/* ---------- 热区数据（SVG viewBox 坐标）---------- */
// 覆盖 24 个有效建筑 + 4 个角楼热点
const hotspots = [
  // === 中轴线（北→南）===
  { id: 'shenwumen',    label: '神武门',   hitbox: { x: 392, y: 52,  width: 210, height: 88  } },
  { id: 'yuhuayuan',   label: '御花园',   hitbox: { x: 318, y: 152, width: 358, height: 188 }, type: 'area' },
  { id: 'qinandian',   label: '钦安殿',   hitbox: { x: 358, y: 240, width: 270, height: 100 }, type: 'area' },
  { id: 'kunninggong', label: '坤宁宫',   hitbox: { x: 372, y: 352, width: 248, height: 82  } },
  { id: 'qianqinggong',label: '乾清宫',   hitbox: { x: 362, y: 502, width: 268, height: 88  } },
  { id: 'qianqingmen', label: '乾清门',   hitbox: { x: 382, y: 598, width: 228, height: 52  } },
  { id: 'baohedian',  label: '保和殿',   hitbox: { x: 338, y: 662, width: 318, height: 92  } },
  { id: 'zhonghedian',label: '中和殿',   hitbox: { x: 408, y: 768, width: 178, height: 62  } },
  { id: 'taihedian',  label: '太和殿',   hitbox: { x: 298, y: 842, width: 398, height: 118 } },
  { id: 'taiheimen',  label: '太和门',   hitbox: { x: 378, y: 972, width: 238, height: 68  } },
  { id: 'wumen',      label: '午门',     hitbox: { x: 368, y: 1058, width: 258, height: 128 } },
  // === 西侧 ===
  { id: 'shoukanggong',label: '寿康宫',   hitbox: { x: 108, y: 778, width: 118, height: 72  } },
  { id: 'cininggong',label: '慈宁宫',   hitbox: { x: 228, y: 778, width: 118, height: 72  } },
  { id: 'cininggonghuayuan', label: '慈宁宫花园', hitbox: { x: 98, y: 858, width: 248, height: 128 }, type: 'area' },
  { id: 'yangxindian', label: '养心殿',   hitbox: { x: 132, y: 658, width: 212, height: 98  }, type: 'area' },
  { id: 'shufangzhai', label: '漱芳斋',   hitbox: { x: 118, y: 268, width: 168, height: 88  } },
  { id: 'dongliugong', label: '东西六宫', hitbox: { x: 128, y: 360, width: 834, height: 290 }, type: 'area' },
  // === 东侧 ===
  { id: 'wenhuadian', label: '文华殿',   hitbox: { x: 678, y: 1008, width: 228, height: 132 }, type: 'area' },
  { id: 'wuyingdian', label: '武英殿',   hitbox: { x: 88, y: 1008, width: 228, height: 132 }, type: 'area' },
  { id: 'jiulongbi',  label: '九龙壁',   hitbox: { x: 688, y: 938, width: 288, height: 68  } },
  { id: 'huangjidian', label: '皇极殿',   hitbox: { x: 708, y: 748, width: 252, height: 198 }, type: 'area' },
  { id: 'ningshoumen', label: '宁寿门',   hitbox: { x: 708, y: 700, width: 100, height: 50  } },
  { id: 'qianlonghuayuan', label: '乾隆花园', hitbox: { x: 758, y: 648, width: 192, height: 98  }, type: 'area' },
  { id: 'changyinge', label: '畅音阁',   hitbox: { x: 802, y: 158, width: 158, height: 222 }, type: 'area' },
  { id: 'jianting',   label: '箭亭',     hitbox: { x: 792, y: 1074, width: 100, height: 80  } },
  // === 角楼（四角）===
  { id: 'jiaolou',    label: '西北角楼', hitbox: { x: 48,  y: 42,  width: 108, height: 108 } },
  { id: 'jiaolou',    label: '东北角楼', hitbox: { x: 838, y: 42,  width: 108, height: 108 } },
  { id: 'jiaolou',    label: '西南角楼', hitbox: { x: 48,  y: 1152, width: 108, height: 108 } },
  { id: 'jiaolou',    label: '东南角楼', hitbox: { x: 838, y: 1152, width: 108, height: 108 } },
]

/* ---------- 初始化地图 ---------- */
function initMap() {
  const container = mapCanvas.parentElement

  // 异步加载 SVG 热点（不阻塞 Canvas 初始化）
  loadSVGHotspots()

  // Canvas 尺寸跟随容器
  const resizeObserver = new ResizeObserver(() => {
    mapCanvas.width = container.clientWidth
    mapCanvas.height = container.clientHeight
    renderMap()
  })
  resizeObserver.observe(container)

  // 鼠标拖拽（绑定在容器上，canvas 已设置 pointer-events:none）
  container.addEventListener('pointerdown', onPointerDown)
  container.addEventListener('pointermove', onPointerMove)
  container.addEventListener('pointerup', onPointerUp)
  container.addEventListener('pointerleave', onPointerUp)
  // 点击热点（通过 SVG 交互，由 initSVGHotspots 处理）
  // 滚轮缩放
  container.addEventListener('wheel', onWheel, { passive: false })
  // 触摸
  container.addEventListener('touchstart', onTouchStart, { passive: false })
  container.addEventListener('touchmove', onTouchMove, { passive: false })
  container.addEventListener('touchend', onTouchEnd)

  mapCanvas.width = container.clientWidth || 800
  mapCanvas.height = container.clientHeight || 600

  renderMap()
}

/* ---------- 渲染地图（底层 Canvas 绘制底图 + SVG 热区） ---------- */
function renderMap() {
  const ctx = mapCanvas.getContext('2d')
  const W = mapCanvas.width
  const H = mapCanvas.height

  ctx.clearRect(0, 0, W, H)

  // 绘制底图（等比缩放居中）
  const img = new Image()
  img.onload = () => {
    // 计算填充方式（类似 object-fit: contain）
    const imgRatio = SVG_W / SVG_H
    const canvasRatio = W / H
    let drawW, drawH, drawX, drawY

    if (canvasRatio > imgRatio) {
      drawH = H
      drawW = H * imgRatio
      drawX = (W - drawW) / 2
      drawY = 0
    } else {
      drawW = W
      drawH = W / imgRatio
      drawX = 0
      drawY = (H - drawH) / 2
    }

    // 应用相机变换（拖拽+缩放）
    ctx.save()
    ctx.translate(mapPosition.x, mapPosition.y)
    ctx.scale(mapScale, mapScale)

    ctx.drawImage(img, drawX, drawY, drawW, drawH)

    // 未加载 SVG 时，才使用 Canvas 兜底高亮
    if (!svgDoc) {
      if (highlightedCategory && highlightedCategory !== 'all') {
        drawCategoryOverlay(ctx, highlightedCategory, drawX, drawY, drawW, drawH)
      }

      if (highlightedType && state.currentModule === 'component') {
        drawTypeOverlay(ctx, highlightedType, drawX, drawY, drawW, drawH)
      }

      if (svgActiveId && state.selectedBuilding) {
        drawSVGSelectedOverlay(ctx, state.selectedBuilding, drawX, drawY, drawW, drawH)
      } else if (state.selectedBuilding) {
        drawSelectedOverlay(ctx, state.selectedBuilding, drawX, drawY, drawW, drawH)
      }

      if (svgHoveredId && svgHoveredId !== svgActiveId) {
        const hoveredSpot = hotspots.find(s => s.id === hoveredBuildingId)
        if (hoveredSpot) {
          drawHoverOverlay(ctx, hoveredSpot.id, drawX, drawY, drawW, drawH)
        }
      } else if (hoveredBuildingId && hoveredBuildingId !== state.selectedBuilding) {
        drawHoverOverlay(ctx, hoveredBuildingId, drawX, drawY, drawW, drawH)
      }
    }

    ctx.restore()
  }
  img.src = 'images/map/overview.svg'
}

/* ---------- 分类高亮 ---------- */
function drawCategoryOverlay(ctx, category, ox, oy, ow, oh) {
  const scaleX = ow / SVG_W
  const scaleY = oh / SVG_H
  const isAnimating = pulseType === 'category' && pulsePhase !== undefined
  const pulseVal = isAnimating ? (0.5 + 0.5 * Math.sin(pulsePhase * Math.PI * 2)) : 1

  hotspots.forEach(spot => {
    const building = BUILDINGS[spot.id]
    if (!building || building.category !== category) return

    const x = ox + spot.hitbox.x * scaleX
    const y = oy + spot.hitbox.y * scaleY
    const w = spot.hitbox.width * scaleX
    const h = spot.hitbox.height * scaleY

    ctx.save()
    ctx.globalAlpha = 0.15 + 0.2 * pulseVal
    ctx.fillStyle = getCategoryColor(category)
    ctx.strokeStyle = getCategoryColor(category)
    ctx.lineWidth = 1.5 + 2 * pulseVal
    ctx.setLineDash([4, 4])
    ctx.shadowColor = getCategoryColor(category)
    ctx.shadowBlur = 5 + 15 * pulseVal
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, spot.type === 'area' ? 12 : 6)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  })
}

/* ---------- 构件类型颜色 ---------- */
function getComponentTypeColor(type) {
  const map = {
    hall:   '#8B2500',
    tower:  '#5B3A8C',
    gate:   '#2B6B4A',
    screen: '#8B6914',
  }
  return map[type] || '#8B2500'
}

/* ---------- 构件类型高亮 ---------- */
function drawTypeOverlay(ctx, type, ox, oy, ow, oh) {
  const scaleX = ow / SVG_W
  const scaleY = oh / SVG_H
  const isAnimating = pulseType === 'type' && pulsePhase !== undefined
  const pulseVal = isAnimating ? (0.5 + 0.5 * Math.sin(pulsePhase * Math.PI * 2)) : 1
  const color = getComponentTypeColor(type)

  hotspots.forEach(spot => {
    const building = BUILDINGS[spot.id]
    if (!building || building.buildingType !== type) return

    const x = ox + spot.hitbox.x * scaleX
    const y = oy + spot.hitbox.y * scaleY
    const w = spot.hitbox.width * scaleX
    const h = spot.hitbox.height * scaleY

    ctx.save()
    ctx.globalAlpha = 0.12 + 0.15 * pulseVal
    ctx.fillStyle = color
    ctx.strokeStyle = color
    ctx.lineWidth = 1.5 + 2 * pulseVal
    ctx.setLineDash([])
    ctx.shadowColor = color
    ctx.shadowBlur = 5 + 15 * pulseVal
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, 8)
    ctx.fill()
    ctx.stroke()

    // 重点建筑画光圈
    if (building.isKey) {
      const cx = x + w / 2
      const cy = y + h / 2
      const r = Math.min(w, h) * 0.7
      ctx.globalAlpha = 0.1 + 0.1 * pulseVal
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.restore()
  })
}

/* ---------- 选中高亮 ---------- */
function drawSelectedOverlay(ctx, buildingId, ox, oy, ow, oh) {
  const spot = hotspots.find(s => s.id === buildingId)
  if (!spot) return

  const scaleX = ow / SVG_W
  const scaleY = oh / SVG_H
  const x = ox + spot.hitbox.x * scaleX
  const y = oy + spot.hitbox.y * scaleY
  const w = spot.hitbox.width * scaleX
  const h = spot.hitbox.height * scaleY
  const cx = x + w / 2
  const cy = y + h / 2

  ctx.save()
  ctx.globalAlpha = 0.18
  ctx.fillStyle = '#8B2500'
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, spot.type === 'area' ? 12 : 6)
  ctx.fill()

  ctx.globalAlpha = 1
  ctx.strokeStyle = '#8B2500'
  ctx.lineWidth = 2.5
  ctx.setLineDash([])
  ctx.shadowColor = 'rgba(139,37,0,0.4)'
  ctx.shadowBlur = 8
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, spot.type === 'area' ? 12 : 6)
  ctx.stroke()
  ctx.restore()
}

/* ---------- SVG 选中高亮（Canvas 叠加） ---------- */
function drawSVGSelectedOverlay(ctx, buildingId, ox, oy, ow, oh) {
  const spot = hotspots.find(s => s.id === buildingId)
  if (!spot) return

  const scaleX = ow / SVG_W
  const scaleY = oh / SVG_H
  const x = ox + spot.hitbox.x * scaleX
  const y = oy + spot.hitbox.y * scaleY
  const w = spot.hitbox.width * scaleX
  const h = spot.hitbox.height * scaleY

  ctx.save()
  ctx.globalAlpha = 0.15
  ctx.fillStyle = '#C5A258'
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, spot.type === 'area' ? 12 : 6)
  ctx.fill()

  ctx.globalAlpha = 1
  ctx.strokeStyle = '#C5A258'
  ctx.lineWidth = 2.5
  ctx.setLineDash([])
  ctx.shadowColor = 'rgba(197,162,88,0.5)'
  ctx.shadowBlur = 10
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, spot.type === 'area' ? 12 : 6)
  ctx.stroke()
  ctx.restore()
}

/* ---------- 悬停高亮 ---------- */
function drawHoverOverlay(ctx, buildingId, ox, oy, ow, oh) {
  const spot = hotspots.find(s => s.id === buildingId)
  if (!spot) return

  const scaleX = ow / SVG_W
  const scaleY = oh / SVG_H
  const x = ox + spot.hitbox.x * scaleX
  const y = oy + spot.hitbox.y * scaleY
  const w = spot.hitbox.width * scaleX
  const h = spot.hitbox.height * scaleY

  ctx.save()
  ctx.globalAlpha = 0.12
  ctx.fillStyle = '#C5A258'
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, spot.type === 'area' ? 12 : 6)
  ctx.fill()
  ctx.globalAlpha = 1
  ctx.strokeStyle = '#C5A258'
  ctx.lineWidth = 1.5
  ctx.setLineDash([])
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, spot.type === 'area' ? 12 : 6)
  ctx.stroke()
  ctx.restore()
}

/* ---------- 分类颜色 ---------- */
function getCategoryColor(cat) {
  const map = {
    ritual: '#B8860B',
    living: '#A63D2B',
    culture: '#5B7F5E',
    worship: '#6B5B7B',
    decor: '#8A8070',
  }
  return map[cat] || '#B8860B'
}

/* ---------- 命中检测（将画布坐标转为 SVG 坐标）---------- */
function getSVGCoords(e) {
  const rect = mapCanvas.getBoundingClientRect()
  const cx = (e.clientX - rect.left - mapPosition.x) / mapScale
  const cy = (e.clientY - rect.top - mapPosition.y) / mapScale

  // 反算图片在画布中的实际偏移
  const W = mapCanvas.width
  const H = mapCanvas.height
  const imgRatio = SVG_W / SVG_H
  const canvasRatio = W / H
  let imgX, imgY, imgW, imgH

  if (canvasRatio > imgRatio) {
    imgH = H
    imgW = H * imgRatio
    imgX = (W - imgW) / 2
    imgY = 0
  } else {
    imgW = W
    imgH = W / imgRatio
    imgX = 0
    imgY = (H - imgH) / 2
  }

  const svgX = ((cx - imgX) / imgW) * SVG_W
  const svgY = ((cy - imgY) / imgH) * SVG_H

  return { x: svgX, y: svgY }
}

function hitTest(svgX, svgY) {
  // 从后往前（后渲染的在上面）
  for (let i = hotspots.length - 1; i >= 0; i--) {
    const spot = hotspots[i]
    const hb = spot.hitbox
    if (svgX >= hb.x && svgX <= hb.x + hb.width &&
        svgY >= hb.y && svgY <= hb.y + hb.height) {
      return spot.id
    }
  }
  return null
}

/* ---------- 鼠标事件 ---------- */
function onPointerDown(e) {
  isDragging = true
  pointerMoved = false
  dragStart = { x: e.clientX - mapPosition.x, y: e.clientY - mapPosition.y }
  mapCanvas.style.cursor = 'grabbing'
}

function onPointerMove(e) {
  const coords = getSVGCoords(e)
  const hitId = hitTest(coords.x, coords.y)

  if (isDragging) {
    const dx = e.clientX - dragStart.x - mapPosition.x
    const dy = e.clientY - dragStart.y - mapPosition.y
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) pointerMoved = true
    mapPosition.x = e.clientX - dragStart.x
    mapPosition.y = e.clientY - dragStart.y
    renderMap()
  } else {
    if (hitId !== hoveredBuildingId) {
      hoveredBuildingId = hitId
      mapCanvas.style.cursor = hitId ? 'pointer' : 'grab'
      renderMap()
    }
  }
}

function onPointerUp(e) {
  if (isDragging && !pointerMoved && hoveredBuildingId) {
    selectBuildingOnMap(hoveredBuildingId)
  }
  isDragging = false
  pointerMoved = false
  mapCanvas.style.cursor = hoveredBuildingId ? 'pointer' : 'grab'
}

function onWheel(e) {
  e.preventDefault()
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  mapScale = Math.max(0.5, Math.min(3, mapScale + delta))
  renderMap()
}

/* ---------- 触摸双指缩放 ---------- */
let lastTouchDist = 0
function onTouchStart(e) {
  if (e.touches.length === 2) {
    e.preventDefault()
    lastTouchDist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    )
  }
}
function onTouchMove(e) {
  if (e.touches.length === 2) {
    e.preventDefault()
    const dist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    )
    const delta = (dist - lastTouchDist) / 500
    mapScale = Math.max(0.5, Math.min(3, mapScale + delta))
    lastTouchDist = dist
    renderMap()
  }
}
function onTouchEnd() {
  lastTouchDist = 0
}

/* ---------- 地图上点击选中建筑 ---------- */
function selectBuildingOnMap(buildingId) {
  state.selectedBuilding = buildingId
  if (typeof onBuildingSelect === 'function') {
    onBuildingSelect(buildingId)
  }
  renderMap()
}

/* ---------- 外部调用：更新叠加层 ---------- */
function updateMapOverlay() {
  highlightedCategory = state.currentModule === 'archive' ? state.selectedCategory : null
  highlightedType = state.currentModule === 'component' ? state.selectedComponentType : null
  if (!highlightedCategory || highlightedCategory === 'all') {
    if (!highlightedType) stopPulse()
  }
  renderMap()
  syncSVGCategoryHighlight()
  syncSVGTypeHighlight()
}

/* ---------- 外部调用：按分类筛选高亮 ---------- */
function filterBuildingsByCategory(category) {
  state.selectedCategory = category
  state.selectedBuilding = null
  highlightedCategory = category
  highlightedType = null
  clearMapSelection(true)
  if (category && category !== 'all') {
    startPulse('category')
  } else {
    stopPulse()
  }
  renderMap()
  syncSVGCategoryHighlight()
  if (typeof renderCategoryPanel === 'function') renderCategoryPanel(category)
}

/* ---------- 外部调用：按构件类型筛选高亮 ---------- */
function filterComponentsByType(type) {
  state.selectedComponentType = type || 'all'
  state.selectedBuilding = null
  highlightedCategory = null

  if (typeof clearMapSelection === 'function') {
    clearMapSelection(true)
  }

  if (!type || type === 'all') {
    highlightedType = null
    stopPulse()
    renderMap()
    syncSVGTypeHighlight()
    if (typeof renderComponentTypeAllPanel === 'function') renderComponentTypeAllPanel()
    return
  }

  highlightedType = type
  startPulse('type')
  renderMap()
  syncSVGTypeHighlight()
  if (typeof renderComponentTypeIntroPanel === 'function') renderComponentTypeIntroPanel(type)
}

/* ---------- 外部调用：选中文化主题叠加 ---------- */
function selectCultureTheme(themeId) {
  cultureOverlayType = themeId
  state.selectedCultureTheme = themeId
  // 文化主题叠加后续由 culture.js 处理
  renderMap()
}

/* ---------- SVG 分类高亮同步 ---------- */
function syncSVGCategoryHighlight() {
  if (!svgDoc) {
    pendingCategoryHighlight = highlightedCategory
    return
  }
  svgDoc.querySelectorAll('.is-category-highlight').forEach(g => {
    g.classList.remove('is-category-highlight')
    g.style.removeProperty('--highlight-color')
    g.style.removeProperty('--highlight-fill')
    g.querySelectorAll('path').forEach(p => {
      p.style.fill = ''
      p.style.stroke = ''
      p.style.strokeWidth = ''
      p.style.strokeDasharray = ''
      p.style.filter = ''
    })
  })
  if (!highlightedCategory || highlightedCategory === 'all') {
    pendingCategoryHighlight = null
    return
  }
  const catColor = getCategoryColor(highlightedCategory)
  getHotspots().forEach(hotspot => {
    const building = BUILDINGS[hotspot.buildingId]
    if (building && building.category === highlightedCategory) {
      const group = svgDoc.getElementById(hotspot.svgId)
      if (group) {
        group.classList.add('is-category-highlight')
        group.style.setProperty('--highlight-color', catColor)
        group.style.setProperty('--highlight-fill', catColor + '33')
      }
    }
  })
  pendingCategoryHighlight = null
}

/* ---------- SVG 构件类型高亮同步 ---------- */
function syncSVGTypeHighlight() {
  if (!svgDoc) {
    pendingTypeHighlight = highlightedType
    return
  }
  svgDoc.querySelectorAll('.is-type-highlight').forEach(g => {
    g.classList.remove('is-type-highlight')
    g.style.removeProperty('--type-highlight-color')
  })
  if (!highlightedType || highlightedType === 'all') {
    pendingTypeHighlight = null
    return
  }
  const typeColor = getComponentTypeColor(highlightedType)
  getHotspots().forEach(hotspot => {
    const building = BUILDINGS[hotspot.buildingId]
    if (building && building.buildingType === highlightedType) {
      const group = svgDoc.getElementById(hotspot.svgId)
      if (group) {
        group.classList.add('is-type-highlight')
        group.style.setProperty('--type-highlight-color', typeColor)
      }
    }
  })
  pendingTypeHighlight = null
}

/* ---------- SVG 高亮清除（通用） ---------- */
function clearSVGSyncHighlight() {
  if (!svgDoc) return
  svgDoc.querySelectorAll('.is-category-highlight').forEach(g => {
    g.classList.remove('is-category-highlight')
  })
  svgDoc.querySelectorAll('.is-type-highlight').forEach(g => {
    g.classList.remove('is-type-highlight')
  })
}

/* ---------- 左侧扇形导航展开/收起 ---------- */
function initFanNav() {
  const sidebar = document.getElementById('left-sidebar')
  const toggle = document.getElementById('fan-toggle')
  if (!sidebar || !toggle) return

  // 初始展开
  sidebar.classList.add('expanded')
  sidebar.classList.remove('collapsed')

  // 中央按钮点击：展开/收起
  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('expanded')
    sidebar.classList.toggle('collapsed')
  })

  // 点击扇形节点 → 切换模块 + 收起导航
  document.querySelectorAll('.fan-item').forEach(item => {
    item.addEventListener('click', () => {
      const module = item.dataset.module
      if (typeof switchModule === 'function') switchModule(module)
      sidebar.classList.remove('expanded')
      sidebar.classList.add('collapsed')
    })
  })
}

/* ---------- 初始化时自动加载地图 ---------- */
document.addEventListener('DOMContentLoaded', initMap)
document.addEventListener('DOMContentLoaded', initFanNav)
