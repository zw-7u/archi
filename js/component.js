/* =====================================================
   js/component.js - 模块三：构件智慧（辅助逻辑）
   ===================================================== */

function renderComponentTypeAllPanel() {
  state.selectedBuilding = null
  stopPulse()
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

  const btn = $('#btn-enter-panorama')
  if (btn) btn.style.display = 'none'

  if (typeof renderCategoryPanel === 'function') {
    renderCategoryPanel('all')
  }
}

function enterPanorama(buildingId) {
  state.panoramaBuilding = buildingId
  switchPage('panorama')
}
