/* =====================================================
   js/svgScanner.js - SVG 热区自动扫描模块
   自动扫描 overview.svg 中所有含 <path> 的 <g> 分组，
   生成热区数据，无需维护硬编码列表。
   依赖：data.js（BUILDINGS）
   ===================================================== */

const SVG_SCANNER_NS = 'http://www.w3.org/2000/svg'

// SVG id → buildingId 多对一别名映射
const SVG_ID_ALIAS = {
  // 角楼四角 → 都指向 jiaolou
  '角楼-2':    'jiaolou',
  '角楼-3':    'jiaolou',
  '角楼-4':    'jiaolou',
  // SVG中拼写错误 → 正确ID
  'cinning-huayuan': 'cininggonghuayuan',
}

/**
 * 解析 SVG 分组 id → BUILDINGS 英文 key。
 * 优先级：别名 → 直接英文key → 按 name 匹配 → 显式特例 → 回退 svgId
 */
function resolveBuildingId(svgId) {
  if (SVG_ID_ALIAS[svgId]) return SVG_ID_ALIAS[svgId]
  if (BUILDINGS[svgId]) return svgId
  const byName = Object.values(BUILDINGS).find(b => b.name === svgId)
  if (byName) return byName.id
  if (svgId === '宁寿宫花园') return 'qianlonghuayuan'
  if (svgId === '西六宫' || svgId === '东六宫') return 'dongliugong'
  return svgId
}

// 中和殿：SVG overview.svg 中暂无 <g id="中和殿"> 分组，
// 待 SVG 源文件补全后，在此声明（或改为走自动扫描）即可。
const MANUAL_HOTSPOTS = []

let _hotspots = []
let _svgEl = null

function _getBuildingData(buildingId) {
  return BUILDINGS[buildingId] || null
}

/**
 * 扫描 SVG 中所有含 <path> 的 <g> 分组，生成热区数组。
 * @param {SVGElement} svg - SVG 根元素
 * @returns {Array} 热区对象数组
 */
function scanSVGHotspots(svg) {
  if (!svg) return []
  _svgEl = svg
  _hotspots = []

  const groups = svg.querySelectorAll('g[id]')
  groups.forEach(group => {
    const paths = group.querySelectorAll('path')
    if (!paths.length) return

    const svgId = group.id
    const buildingId = resolveBuildingId(svgId)
    const building = _getBuildingData(buildingId)

    _hotspots.push({
      svgId,
      buildingId,
      hotspotId: svgId,
      labelZh: building?.name || svgId,
      labelEn: building?.nameEn || svgId,
      group,
      paths: Array.from(paths),
    })
  })

  // 追加手动热区（中和殿等）
  MANUAL_HOTSPOTS.forEach(manual => {
    if (_hotspots.some(h => h.buildingId === manual.buildingId)) return
    const building = _getBuildingData(manual.buildingId)
    _hotspots.push({
      svgId: manual.svgId,
      buildingId: manual.buildingId,
      hotspotId: manual.hotspotId,
      labelZh: manual.labelZh || building?.name || manual.hotspotId,
      labelEn: manual.labelEn || building?.nameEn || manual.hotspotId,
      group: null,
      paths: [],
      customPath: manual.customPath,
    })
  })

  return _hotspots
}

/**
 * 获取最近一次 scanSVGHotspots 返回的热区数组。
 */
function getHotspots() {
  return _hotspots
}

/**
 * 递归删除节点及其所有子元素的 id 属性（用于 overlay 克隆）。
 */
function stripElementIds(node) {
  if (!node || node.nodeType !== 1) return
  node.removeAttribute('id')
  for (const child of node.children) {
    stripElementIds(child)
  }
}

/**
 * 为热区创建叠加层（overlay group），追加到 svg 并返回。
 */
function createHotspotOverlay(svg, hotspot) {
  const overlayGroup = document.createElementNS(SVG_SCANNER_NS, 'g')
  overlayGroup.classList.add('overview-region-overlay')
  overlayGroup.setAttribute('aria-hidden', 'true')
  overlayGroup.style.pointerEvents = 'none'

  if (hotspot.customPath) {
    const overlay = document.createElementNS(SVG_SCANNER_NS, 'path')
    overlay.setAttribute('d', hotspot.customPath)
    overlay.setAttribute('fill', 'rgba(233,187,80,0.16)')
    overlay.setAttribute('stroke', 'rgba(246,218,146,0.92)')
    overlay.setAttribute('stroke-width', '4')
    overlay.setAttribute('stroke-linejoin', 'round')
    overlayGroup.appendChild(overlay)
  } else if (hotspot.paths.length) {
    hotspot.paths.forEach(sourcePath => {
      const overlay = sourcePath.cloneNode(true)
      stripElementIds(overlay)
      overlay.classList.add('overview-region-overlay-path')
      overlayGroup.appendChild(overlay)
    })
  }

  svg.appendChild(overlayGroup)
  return overlayGroup
}

/**
 * 为热区绑定鼠标交互事件。
 * @param {Object} hotspot
 * @param {Object} callbacks - { onHover, onLeave, onClick }
 */
function bindHotspotEvents(hotspot, callbacks) {
  const { onHover, onLeave, onClick } = callbacks
  const targetEls = hotspot.paths.length ? hotspot.paths : []

  targetEls.forEach(path => {
    path.style.pointerEvents = 'all'
    path.style.fill = 'rgba(255,255,255,0.002)'
    path.addEventListener('mouseenter', (e) => onHover(hotspot, e))
    path.addEventListener('mousemove', (e) => onHover(hotspot, e))
    path.addEventListener('mouseleave', () => onLeave(hotspot))
    path.addEventListener('click', (e) => {
      e.stopPropagation()
      onClick(hotspot)
    })
  })

  if (hotspot.customPath && hotspot.sourceEl) {
    hotspot.sourceEl.addEventListener('mouseenter', (e) => onHover(hotspot, e))
    hotspot.sourceEl.addEventListener('mousemove', (e) => onHover(hotspot, e))
    hotspot.sourceEl.addEventListener('mouseleave', () => onLeave(hotspot))
    hotspot.sourceEl.addEventListener('click', (e) => {
      e.stopPropagation()
      onClick(hotspot)
    })
  }
}