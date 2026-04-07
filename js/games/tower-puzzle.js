/* =====================================================
   js/games/tower-puzzle.js - 角楼解谜（占位）
   ===================================================== */
function startTowerPuzzle(canvas, building) {
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
  ctx.fillText(lang === 'zh' ? '角楼解谜 — 开发中' : 'Corner Tower Puzzle — Under Development', W / 2, H / 2 - 20)
  ctx.fillStyle = '#6B5D4F'
  ctx.font = '13px "Noto Sans SC", sans-serif'
  ctx.fillText(lang === 'zh' ? '将角楼构件旋转拼接，完成对称结构' : 'Rotate and assemble tower components to complete the symmetric structure', W / 2, H / 2 + 10)
}
