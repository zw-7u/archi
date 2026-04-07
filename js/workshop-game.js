/* =====================================================
   js/workshop-game.js - 巧筑工坊核心逻辑
   ===================================================== */

;(function () {
  'use strict'

  /* ---------- 全局入口 ---------- */
  function openWorkshopGame(buildingKey) {
    WORKSHOP_GAME.init(buildingKey)
  }

  /* ---------- 工具函数 ---------- */
  function escape(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  function rnd(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
  }

  function rect(el) {
    return el.getBoundingClientRect()
  }

  /* ---------- 游戏控制器 ---------- */
  const WORKSHOP_GAME = {
    _key: null,
    _data: null,
    _state: null,
    _root: null,

    init(key) {
      const data = WORKSHOP_GAME_DATA[key]
      if (!data) return

      this._key = key
      this._data = data
      this._state = {
        phase: 'quiz',          // 'quiz' | 'puzzle' | 'wumen' | 'complete'
        quizIndex: 0,
        rewards: [],            // 收集的碎片图片名 或 身份名
        pendingRewards: [],     // 当前题答对后要发放的奖励
        wumenIdentity: null,
        wumenScene: null,
        wumenResult: null,
        placedPieces: new Set(), // 已放入槽位的碎片索引
        pendingCorrectGate: null, // 午门通行正确答案
      }

      this._render()
      document.body.style.overflow = 'hidden'
    },

    _render() {
      this._removeRoot()

      /* backdrop + modal */
      const backdrop = document.createElement('div')
      backdrop.className = 'wg-backdrop'
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) this.close()
      })

      const modal = document.createElement('div')
      modal.className = 'wg-modal'
      modal.id = 'wg-modal'
      modal.setAttribute('role', 'dialog')
      modal.setAttribute('aria-modal', 'true')
      modal.setAttribute('aria-label', '巧筑工坊')

      this._root = backdrop
      backdrop.appendChild(modal)
      document.body.appendChild(backdrop)

      /* 关闭按钮 */
      const closeBtn = document.createElement('button')
      closeBtn.className = 'wg-close'
      closeBtn.type = 'button'
      closeBtn.setAttribute('aria-label', '关闭')
      closeBtn.textContent = '×'
      closeBtn.addEventListener('click', () => this.close())
      modal.appendChild(closeBtn)

      /* 内容 */
      this._renderContent(modal)
    },

    _removeRoot() {
      if (this._root && this._root.parentNode) {
        this._root.parentNode.removeChild(this._root)
      }
      document.body.style.overflow = ''
    },

    close() {
      this._removeRoot()
    },

    /* ========== 内容渲染 ========== */
    _renderContent(modal) {
      const d = this._data
      const s = this._state

      /* 头部 */
      const header = document.createElement('div')
      header.className = 'wg-header'

      const eyebrow = document.createElement('span')
      eyebrow.className = 'wg-header__eyebrow'
      eyebrow.textContent = '巧筑工坊 · 汉学游园'
      header.appendChild(eyebrow)

      const title = document.createElement('h2')
      title.className = 'wg-header__title'
      title.textContent = d.title
      header.appendChild(title)

      const subtitle = document.createElement('div')
      subtitle.className = 'wg-header__subtitle'
      subtitle.textContent = d.subtitle + ' · ' + d.subtitleEn
      header.appendChild(subtitle)

      /* 进度条 */
      const prog = this._buildProgress()
      header.appendChild(prog)

      modal.appendChild(header)

      /* 主体 */
      const body = document.createElement('div')
      body.className = 'wg-body'

      if (s.phase === 'quiz') {
        this._renderQuiz(body)
      } else if (s.phase === 'puzzle') {
        this._renderPuzzle(body)
      } else if (s.phase === 'wumen') {
        this._renderWumen(body)
      } else if (s.phase === 'complete') {
        this._renderComplete(body)
      }

      modal.appendChild(body)
    },

    _buildProgress() {
      const d = this._data
      const s = this._state
      const el = document.createElement('div')
      el.className = 'wg-progress'

      const label = document.createElement('span')
      label.className = 'wg-progress__label'
      label.textContent = '答题进度'
      el.appendChild(label)

      const track = document.createElement('div')
      track.className = 'wg-progress__track'
      const fill = document.createElement('div')
      fill.className = 'wg-progress__fill'

      if (s.phase === 'puzzle' || s.phase === 'wumen') {
        fill.style.width = '100%'
      } else {
        fill.style.width = ((s.quizIndex) / d.quizzes.length * 100) + '%'
      }
      track.appendChild(fill)
      el.appendChild(track)

      const count = document.createElement('span')
      count.className = 'wg-progress__count'
      if (s.phase === 'puzzle' || s.phase === 'wumen') {
        count.textContent = d.quizzes.length + '/' + d.quizzes.length
      } else {
        count.textContent = (s.quizIndex) + '/' + d.quizzes.length
      }
      el.appendChild(count)

      return el
    },

    /* ========== 答题阶段 ========== */
    _renderQuiz(container) {
      const d = this._data
      const s = this._state
      const quiz = d.quizzes[s.quizIndex]

      /* 题目 */
      const qEl = document.createElement('p')
      qEl.className = 'wg-quiz-question'
      qEl.textContent = quiz.question
      container.appendChild(qEl)

      /* 选项 */
      const optsEl = document.createElement('div')
      optsEl.className = 'wg-options'

      quiz.options.forEach(opt => {
        const btn = document.createElement('button')
        btn.className = 'wg-option'
        btn.type = 'button'
        btn.dataset.key = opt.key

        const keyEl = document.createElement('span')
        keyEl.className = 'wg-option__key'
        keyEl.textContent = opt.key

        const txtEl = document.createElement('span')
        txtEl.className = 'wg-option__text'
        txtEl.textContent = opt.label

        btn.appendChild(keyEl)
        btn.appendChild(txtEl)
        btn.addEventListener('click', () => this._onOptionClick(opt))
        optsEl.appendChild(btn)
      })

      container.appendChild(optsEl)

      /* 奖励托盘 */
      const tray = this._buildRewardTray()
      container.appendChild(tray)
    },

    _onOptionClick(opt) {
      this._showSinology(opt)
    },

    _showSinology(opt) {
      const d = this._data
      const s = this._state
      const isCorrect = opt.isCorrect
      const card = opt.card

      /* 遮罩 */
      const overlay = document.createElement('div')
      overlay.className = 'wg-sinology-overlay'
      overlay.id = 'wg-sinology-overlay'

      const cardEl = document.createElement('div')
      cardEl.className = 'wg-sinology'

      /* 汉学卡头部 */
      const head = document.createElement('div')
      head.className = 'wg-sinology__head'
      const kicker = document.createElement('span')
      kicker.className = 'wg-sinology__kicker'
      kicker.textContent = '汉学小注 · Sinology Note'
      const cardTitle = document.createElement('h3')
      cardTitle.className = 'wg-sinology__title'
      cardTitle.textContent = d.title
      head.appendChild(kicker)
      head.appendChild(cardTitle)
      cardEl.appendChild(head)

      /* 汉学卡内容 */
      const body = document.createElement('div')
      body.className = 'wg-sinology__body'

      body.appendChild(this._sinSection('直觉理解', card.intuitive))
      body.appendChild(this._sinSection('汉学转译', card.sinology))

      const quoteWrap = document.createElement('div')
      quoteWrap.className = 'wg-sinology__quote'
      quoteWrap.textContent = card.quote
      body.appendChild(quoteWrap)

      cardEl.appendChild(body)

      /* 状态提示 */
      const status = document.createElement('div')
      status.className = 'wg-sinology__status ' + (isCorrect ? 'wg-sinology__status--correct' : 'wg-sinology__status--wrong')
      status.innerHTML = '<span class="wg-sinology__status-dot"></span>' + escape(
        isCorrect ? '理解正确，获得奖励。' : '这还不是最合适的解释，请再想想。'
      )
      cardEl.appendChild(status)

      /* 关闭按钮 */
      const closeBtn = document.createElement('button')
      closeBtn.className = 'wg-sinology__close'
      closeBtn.type = 'button'
      closeBtn.textContent = isCorrect ? '收取奖励' : '继续思考'
      closeBtn.addEventListener('click', () => {
        this._closeSinology(overlay)
        if (isCorrect) {
          this._grantReward(opt)
        }
      })
      cardEl.appendChild(closeBtn)

      overlay.appendChild(cardEl)
      document.body.appendChild(overlay)

      /* 点击遮罩也可关闭（错误时回到题目） */
      if (!isCorrect) {
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) {
            this._closeSinology(overlay)
          }
        })
      }
    },

    _sinSection(label, text) {
      const section = document.createElement('div')
      section.className = 'wg-sinology__section'
      const lbl = document.createElement('span')
      lbl.className = 'wg-sinology__label'
      lbl.textContent = label
      const txt = document.createElement('p')
      txt.className = 'wg-sinology__text'
      txt.textContent = text
      section.appendChild(lbl)
      section.appendChild(txt)
      return section
    },

    _closeSinology(overlay) {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
    },

    _grantReward(opt) {
      const d = this._data
      const s = this._state
      const quiz = d.quizzes[s.quizIndex]

      /* 收集奖励 */
      s.rewards.push(...quiz.reward)

      /* 检查是否还有待发奖励 */
      if (s.quizIndex < d.quizzes.length) {
        s.quizIndex++
      }

      /* 判断下一阶段 */
      if (s.quizIndex >= d.quizzes.length) {
        if (d.wumenRules) {
          /* 午门 → 通行阶段 */
          s.phase = 'wumen'
          const identities = s.rewards
          s.wumenIdentity = rnd(identities)
          const rule = d.wumenRules[s.wumenIdentity]
          s.wumenScene = rule.scene
          s.pendingCorrectGate = rule.correctGate
          s.wumenResult = null
        } else {
          /* 拼图阶段 */
          s.phase = 'puzzle'
        }
      }

      /* 刷新内容 */
      const modal = document.getElementById('wg-modal')
      if (modal) {
        /* 更新进度条 */
        const oldProgress = modal.querySelector('.wg-progress')
        if (oldProgress) {
          const newProgress = this._buildProgress()
          oldProgress.replaceWith(newProgress)
        }
        /* 更新 body */
        const oldBody = modal.querySelector('.wg-body')
        if (oldBody) {
          const newBody = document.createElement('div')
          newBody.className = 'wg-body'
          if (s.phase === 'puzzle') {
            this._renderPuzzle(newBody)
          } else if (s.phase === 'wumen') {
            this._renderWumen(newBody)
          } else if (s.phase === 'complete') {
            this._renderComplete(newBody)
          }
          oldBody.replaceWith(newBody)
        }
      }
    },

    /* ========== 奖励托盘 ========== */
    _buildRewardTray() {
      const d = this._data
      const s = this._state
      const tray = document.createElement('div')
      tray.className = 'wg-reward-tray'

      const lbl = document.createElement('div')
      lbl.className = 'wg-reward-tray__label'
      lbl.textContent = d.wumenRules ? '身份册' : '碎片收集'
      tray.appendChild(lbl)

      const items = document.createElement('div')
      items.className = 'wg-reward-tray__items'
      items.id = 'wg-reward-items'

      if (d.wumenRules) {
        /* 身份卡 */
        s.rewards.forEach(name => {
          const chip = document.createElement('span')
          chip.className = 'wg-reward-identity'
          chip.textContent = name
          items.appendChild(chip)
        })
      } else {
        /* 碎片图片 */
        s.rewards.forEach(imgName => {
          const img = document.createElement('img')
          img.className = 'wg-reward-piece'
          img.src = d.imageBase + imgName
          img.alt = imgName
          img.onerror = (e) => { e.target.style.display = 'none' }
          items.appendChild(img)
        })
      }

      tray.appendChild(items)
      return tray
    },

    /* ========== 拼图阶段 ========== */
    _renderPuzzle(container) {
      const d = this._data
      const s = this._state

      const instr = document.createElement('p')
      instr.className = 'wg-puzzle__instruction'
      instr.textContent = '将下方碎片拖入轮廓区域，拼出完整的建筑图像。'
      container.appendChild(instr)

      /* 拼图板 */
      const boardClass = d.totalPieces === 7 ? 'wg-puzzle__board wg-puzzle__board--7'
                 : d.totalPieces === 5 ? 'wg-puzzle__board wg-puzzle__board--5'
                 : 'wg-puzzle__board'
      const board = document.createElement('div')
      board.className = boardClass
      board.id = 'wg-puzzle-board'

      /* 槽位 */
      d.pieceImages.forEach((imgName, i) => {
        const slot = document.createElement('div')
        slot.className = 'wg-puzzle__slot'
        slot.dataset.slot = i

        slot.addEventListener('dragover', e => {
          e.preventDefault()
          slot.classList.add('is-over')
        })
        slot.addEventListener('dragleave', () => slot.classList.remove('is-over'))
        slot.addEventListener('drop', e => {
          e.preventDefault()
          slot.classList.remove('is-over')
          const pieceIdx = e.dataTransfer.getData('text/plain')
          this._onPieceDrop(parseInt(pieceIdx), i, slot)
        })

        board.appendChild(slot)
      })

      container.appendChild(board)

      /* 碎片托盘 */
      const piecesEl = document.createElement('div')
      piecesEl.className = 'wg-puzzle__pieces'
      piecesEl.id = 'wg-puzzle-pieces'

      s.rewards.forEach((imgName, i) => {
        const piece = document.createElement('img')
        piece.className = 'wg-puzzle__piece'
        piece.src = d.imageBase + imgName
        piece.alt = imgName
        piece.draggable = true
        piece.dataset.pieceIdx = i
        piece.id = 'wg-piece-' + i

        piece.addEventListener('dragstart', e => {
          e.dataTransfer.setData('text/plain', String(i))
          piece.classList.add('is-dragging')
        })
        piece.addEventListener('dragend', () => piece.classList.remove('is-dragging'))

        /* 触摸支持 */
        piece.addEventListener('touchstart', (e) => this._onTouchStart(e, i), { passive: false })
        piece.addEventListener('touchmove', (e) => this._onTouchMove(e), { passive: false })
        piece.addEventListener('touchend', (e) => this._onTouchEnd(e, i), { passive: false })

        piecesEl.appendChild(piece)
      })

      container.appendChild(piecesEl)
    },

    _onPieceDrop(pieceIdx, slotIdx, slotEl) {
      const d = this._data
      const s = this._state

      /* 如果该槽已有图片则忽略 */
      if (slotEl.querySelector('img')) return

      /* 找到对应碎片图片 */
      const imgName = s.rewards[pieceIdx]
      if (!imgName) return

      /* 放入槽位 */
      const img = document.createElement('img')
      img.src = d.imageBase + imgName
      img.alt = imgName
      img.style.width = '100%'
      img.style.height = '100%'
      img.style.objectFit = 'cover'
      img.style.borderRadius = '3px'
      slotEl.appendChild(img)
      slotEl.classList.add('is-filled')

      /* 从托盘移除碎片 */
      const pieceEl = document.getElementById('wg-piece-' + pieceIdx)
      if (pieceEl) pieceEl.remove()

      s.placedPieces.add(pieceIdx)

      /* 检查是否全部完成 */
      if (s.placedPieces.size === d.pieceImages.length) {
        setTimeout(() => this._onPuzzleComplete(), 500)
      }
    },

    /* 触摸拖拽支持 */
    _touchDragData: null,

    _onTouchStart(e, pieceIdx) {
      e.preventDefault()
      const touch = e.touches[0]
      const el = e.currentTarget
      this._touchDragData = {
        pieceIdx,
        startX: touch.clientX,
        startY: touch.clientY,
        el,
        clone: el.cloneNode(true),
      }
      const rect = el.getBoundingClientRect()
      this._touchDragData.offsetX = touch.clientX - rect.left
      this._touchDragData.offsetY = touch.clientY - rect.top
      this._touchDragData.clone.style.position = 'fixed'
      this._touchDragData.clone.style.left = rect.left + 'px'
      this._touchDragData.clone.style.top = rect.top + 'px'
      this._touchDragData.clone.style.pointerEvents = 'none'
      this._touchDragData.clone.style.opacity = '0.8'
      this._touchDragData.clone.style.zIndex = '9999'
      this._touchDragData.clone.style.transform = 'scale(1.08)'
      document.body.appendChild(this._touchDragData.clone)
    },

    _onTouchMove(e, pieceIdx) {
      if (!this._touchDragData) return
      e.preventDefault()
      const touch = e.touches[0]
      const clone = this._touchDragData.clone
      clone.style.left = (touch.clientX - this._touchDragData.offsetX) + 'px'
      clone.style.top = (touch.clientY - this._touchDragData.offsetY) + 'px'
    },

    _onTouchEnd(e, pieceIdx) {
      if (!this._touchDragData) return
      const touch = e.changedTouches[0]
      const clone = this._touchDragData.clone
      if (clone.parentNode) clone.parentNode.removeChild(clone)

      /* 查找落在哪个槽位 */
      const slots = document.querySelectorAll('.wg-puzzle__slot')
      let targetSlot = null
      slots.forEach(slot => {
        const r = slot.getBoundingClientRect()
        if (touch.clientX >= r.left && touch.clientX <= r.right &&
            touch.clientY >= r.top  && touch.clientY <= r.bottom) {
          targetSlot = slot
        }
      })

      if (targetSlot) {
        this._onPieceDrop(pieceIdx, parseInt(targetSlot.dataset.slot), targetSlot)
      }

      this._touchDragData = null
    },

    _onPuzzleComplete() {
      this._state.phase = 'complete'
      const modal = document.getElementById('wg-modal')
      if (!modal) return
      const oldBody = modal.querySelector('.wg-body')
      if (oldBody) {
        const newBody = document.createElement('div')
        newBody.className = 'wg-body'
        this._renderComplete(newBody)
        oldBody.replaceWith(newBody)
      }
    },

    /* ========== 午门通行阶段 ========== */
    _renderWumen(container) {
      const d = this._data
      const s = this._state
      const rule = d.wumenRules[s.wumenIdentity]

      /* 身份场景条 */
      const sceneBar = document.createElement('div')
      sceneBar.className = 'wg-wumen__scene-bar'
      const identityEl = document.createElement('span')
      identityEl.className = 'wg-wumen__identity'
      identityEl.textContent = s.wumenIdentity
      const sceneEl = document.createElement('span')
      sceneEl.className = 'wg-wumen__scene'
      sceneEl.textContent = s.wumenScene
      sceneBar.appendChild(identityEl)
      sceneBar.appendChild(sceneEl)
      container.appendChild(sceneBar)

      const hint = document.createElement('p')
      hint.className = 'wg-wumen__hint'
      hint.textContent = '根据身份与场景，选择正确的门洞进入午门。'
      container.appendChild(hint)

      /* 通行结果 */
      if (s.wumenResult) {
        const result = document.createElement('div')
        result.className = 'wg-pass-result ' + (s.wumenResult.correct ? 'wg-pass-result--correct' : 'wg-pass-result--wrong')
        result.innerHTML = '<strong>' + escape(s.wumenResult.msg) + '</strong><br>' + escape(s.wumenResult.explain)
        container.appendChild(result)
      }

      /* 午门图 */
      const stage = document.createElement('div')
      stage.className = 'wg-wumen__stage'

      const img = document.createElement('img')
      img.src = d.imageBase + d.wumenImage
      img.alt = '午门'
      img.style.maxWidth = '480px'
      img.onerror = () => { img.style.display = 'none' }
      stage.appendChild(img)

      /* 左掖门 */
      const leftGate = document.createElement('div')
      leftGate.className = 'wg-wumen__gate wg-wumen__gate--left'
      leftGate.innerHTML = '<span class="wg-wumen__gate-label">左掖门</span>'
      leftGate.addEventListener('click', () => this._onGateClick('left'))
      stage.appendChild(leftGate)

      /* 中门（御门） */
      const centerGate = document.createElement('div')
      centerGate.className = 'wg-wumen__gate wg-wumen__gate--center'
      centerGate.innerHTML = '<span class="wg-wumen__gate-label">中门</span>'
      centerGate.addEventListener('click', () => this._onGateClick('center'))
      stage.appendChild(centerGate)

      /* 右掖门 */
      const rightGate = document.createElement('div')
      rightGate.className = 'wg-wumen__gate wg-wumen__gate--right'
      rightGate.innerHTML = '<span class="wg-wumen__gate-label">右掖门</span>'
      rightGate.addEventListener('click', () => this._onGateClick('right'))
      stage.appendChild(rightGate)

      container.appendChild(stage)

      /* 身份册 */
      const tray = this._buildRewardTray()
      container.appendChild(tray)
    },

    _onGateClick(gate) {
      const d = this._data
      const s = this._state
      const correct = gate === s.pendingCorrectGate

      if (correct) {
        s.wumenResult = {
          correct: true,
          msg: '此门合礼，可通行。',
          explain: '在紫禁城里，空间不是中性的。门洞会根据身份、礼仪和时机，将不同的人引向不同的秩序路径。',
        }
      } else {
        s.wumenResult = {
          correct: false,
          msg: '此门不属汝位。',
          explain: '但紫禁城不是按最短路径组织人流，而是按礼制组织空间。选错门，不是走错路，而是进入了不属于该身份的位置。',
        }
      }

      /* 刷新内容 */
      const body = document.querySelector('#wg-modal .wg-body')
      if (body) {
        const newBody = document.createElement('div')
        newBody.className = 'wg-body'
        this._renderWumen(newBody)
        body.replaceWith(newBody)
      }
    },

    /* ========== 完结阶段 ========== */
    _renderComplete(container) {
      const d = this._data
      const complete = document.createElement('div')
      complete.className = 'wg-complete'

      const icon = document.createElement('div')
      icon.className = 'wg-complete__icon'
      icon.textContent = '✦'
      complete.appendChild(icon)

      const title = document.createElement('h3')
      title.className = 'wg-complete__title'
      title.textContent = d.title + ' · 完成'
      complete.appendChild(title)

      const msg = document.createElement('p')
      msg.className = 'wg-complete__msg'
      msg.textContent = d.completeMsg
      complete.appendChild(msg)

      /* 显示完整建筑图（午门用午门图，前三个用第一块碎片） */
      const firstReward = d.wumenRules ? '身份已集齐' : d.pieceImages[0]
      const bldImg = document.createElement('img')
      bldImg.className = 'wg-complete__building'
      if (d.wumenRules) {
        bldImg.src = d.imageBase + d.wumenImage
        bldImg.alt = '午门'
      } else {
        bldImg.src = d.imageBase + firstReward
        bldImg.alt = d.subtitle
      }
      bldImg.onerror = () => { bldImg.style.display = 'none' }
      complete.appendChild(bldImg)

      const btn = document.createElement('button')
      btn.className = 'wg-complete__btn'
      btn.type = 'button'
      btn.textContent = '关闭'
      btn.addEventListener('click', () => this.close())
      complete.appendChild(btn)

      container.appendChild(complete)
    },
  }

  /* 暴露全局入口 */
  window.openWorkshopGame = openWorkshopGame
})()
