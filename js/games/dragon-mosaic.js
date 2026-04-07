/* =====================================================
   js/games/dragon-mosaic.js - 九龙拼图（占位）
   ===================================================== */
function startDragonMosaic(canvas, building) {
  const ctx = canvas.getContext('2d')
  canvas.width = canvas.parentElement.clientWidth
  canvas.height = canvas.parentElement.clientHeight
  const W = canvas.width
  const H = canvas.height

  const lang = state.language
  ctx.fillStyle = '#FAF7F0'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#8B2500'
  ctx.font = 'bold 18px "Noto Serif SC", serif'
  ctx.textAlign = 'center'
  ctx.fillText(lang === 'zh' ? '九龙拼图 — 开发中' : 'Dragon Mosaic — Under Development', W / 2, H / 2 - 20)
  ctx.fillStyle = '#6B5D4F'
  ctx.font = '13px "Noto Sans SC", sans-serif'
  ctx.fillText(lang === 'zh' ? '三关递进：4×4 → 5×5 → 6×6，拖拽旋转琉璃砖完成九龙壁' : 'Three levels: 4×4 → 5×5 → 6×6, drag and rotate tiles to complete the Nine Dragon Wall', W / 2, H / 2 + 10)
}
