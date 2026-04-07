/* =====================================================
   js/games/game-modal.js - 游戏弹窗（通用）
   ===================================================== */

/* ---------- 打开游戏弹窗 ---------- */
function openGameModal(building) {
  const modal = $('#game-modal')
  const title = $('#game-title')
  const canvas = $('#game-canvas')

  const lang = state.language
  title.textContent = lang === 'zh' ? building.game.title : building.game.titleEn

  modal.style.display = 'flex'

  // 根据游戏类型启动
  const gameType = building.game.type
  if (gameType === 'stack-hall' && typeof startStackHall === 'function') {
    startStackHall(canvas, building)
  } else if (gameType === 'tower-puzzle' && typeof startTowerPuzzle === 'function') {
    startTowerPuzzle(canvas, building)
  } else if (gameType === 'imperial-passage' && typeof startImperialPassage === 'function') {
    startImperialPassage(canvas, building)
  } else if (gameType === 'dragon-mosaic' && typeof startDragonMosaic === 'function') {
    startDragonMosaic(canvas, building)
  } else {
    // 默认占位
    const ctx = canvas.getContext('2d')
    canvas.width = canvas.parentElement.clientWidth
    canvas.height = canvas.parentElement.clientHeight
    ctx.fillStyle = '#EDE7D9'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'rgba(44,36,24,0.3)'
    ctx.font = '16px "Noto Serif SC", serif'
    ctx.textAlign = 'center'
    ctx.fillText(lang === 'zh' ? '游戏开发中...' : 'Game under development...', canvas.width / 2, canvas.height / 2)
  }
}

/* ---------- 关闭游戏弹窗 ---------- */
function closeGameModal() {
  const modal = $('#game-modal')
  modal.style.display = 'none'
  // 停止游戏逻辑（各游戏自行清理）
  $('#game-canvas').getContext('2d').clearRect(0, 0, 1, 1)
}

$('#game-close').addEventListener('click', closeGameModal)
$('#game-overlay').addEventListener('click', closeGameModal)

/* ---------- 音效辅助 ---------- */
function playSound(soundType) {
  // Howler.js 已通过 CDN 引入，若有音效文件则播放
  // 暂无音效文件时静默跳过
}
