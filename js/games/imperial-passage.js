/* =====================================================
   js/games/imperial-passage.js - 十万人朝圣（占位）
   ===================================================== */
function startImperialPassage(canvas, building) {
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
  ctx.fillText(lang === 'zh' ? '十万人朝圣 — 开发中' : 'Imperial Passage — Under Development', W / 2, H / 2 - 20)
  ctx.fillStyle = '#6B5D4F'
  ctx.font = '13px "Noto Sans SC", sans-serif'
  ctx.fillText(lang === 'zh' ? '抽取随机身份，选择正确门洞通过午门' : 'Draw a random identity and choose the correct gate passage', W / 2, H / 2 + 10)
}
