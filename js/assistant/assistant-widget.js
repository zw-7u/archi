/**
 * =====================================================
 *  js/assistant/assistant-widget.js
 *  筑灵语音助手主组件 — ZhulingWidget 类
 *
 *  使用方式：
 *    const widget = new ZhulingWidget({ apiBase: 'http://localhost:3000' })
 *    widget.init()
 *
 *  挂载点：
 *    收起状态：#zhuling-launcher（自动创建）
 *    展开状态：#zhuling-panel（自动创建）
 * =====================================================
 */

class ZhulingWidget {

  /**
   * @param {Object} options
   * @param {string}  options.apiBase      - API 服务地址，默认 http://localhost:3000
   * @param {string}  options.ipImage      - IP 形象全身图片路径（左下角小人），默认 images/assistant/assistant.png
   * @param {string}  options.profileImage - IP 头像图片路径（面板头像+消息头像），默认 images/assistant/profile.png
   */
  constructor(options = {}) {
    this.apiBase      = options.apiBase      || 'http://localhost:3000'
    this.ipImage      = options.ipImage      || 'images/assistant/assistant.png'
    this.profileImage = options.profileImage || 'images/assistant/profile.png'
    this._api      = null
    this._speech   = null
    this._isOpen   = false
    this._history  = []    // { role: 'user'|'assistant', content: string }
    this._root     = null  // shadow root
    this._el       = {}    // 缓存 DOM 引用
  }

  // ================================================================
  //  公开：初始化 — 创建 DOM、绑定事件
  // ================================================================
  init() {
    // 初始化 API 和语音模块
    this._api    = new AssistantAPI({ apiBase: this.apiBase })
    this._speech = new SpeechManager({
      apiBase: this.apiBase,
      onAsrLoading: (loading) => this._onAsrLoading(loading),
      onFinal:   (text) => this._onMicResult(text),
      onError:   (err)  => this._onSpeechError(err),
      onTTSStart: () => this._onTTSStart(),
      onTTSEnd:   () => this._onTTSEnd()
    })

    // 创建 Shadow DOM 容器（隔离样式）
    this._root = document.createElement('div')
    this._root.id = 'zhuling-root'
    this._root.style.cssText = 'position:fixed;bottom:5px;left:5px;z-index:9999;'
    document.body.appendChild(this._root)

    // 注入样式
    this._injectStyles()

    // 创建 DOM 结构
    this._buildDOM()

    // 绑定事件
    this._bindEvents()
  }

  // ================================================================
  //  公开：销毁
  // ================================================================
  destroy() {
    this._speech?.stopListening()
    this._speech?.stopSpeaking()
    if (this._root) {
      this._root.remove()
      this._root = null
    }
  }

  // ================================================================
  //  私有：获取建筑上下文 ID
  // ================================================================
  _getContext() {
    // 优先顺序：window.currentBuilding > body[data-building-id] > state.selectedBuilding > 'general'
    if (window.currentBuilding)    return window.currentBuilding
    if (document.body.dataset.buildingId) return document.body.dataset.buildingId
    if (window.state?.selectedBuilding)   return window.state.selectedBuilding
    return 'general'
  }

  // ================================================================
  //  私有：获取当前语言
  // ================================================================
  _getLanguage() {
    return (window.state?.language === 'en') ? 'en' : 'zh'
  }

  // ================================================================
  //  私有：注入 CSS
  // ================================================================
  _injectStyles() {
    // 通过 link 标签加载外部 CSS（可访问相对路径）
    const link = document.createElement('link')
    link.rel   = 'stylesheet'
    link.href  = 'css/assistant-widget.css'
    this._root.appendChild(link)
  }

  // ================================================================
  //  私有：构建 DOM
  // ================================================================
  _buildDOM() {
    const isRecordingSupported = SpeechManager.isRecordingSupported()

    const html = `
      <!-- ========== 收起态悬浮入口 ========== -->
      <div id="zhuling-launcher" class="zl-launcher" title="筑灵 — 古建筑导览助手">
        <img
          id="zl-launcher-img"
          src="${this.ipImage}"
          alt="筑灵"
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
        >
        <!-- 图片加载失败时的 SVG fallback -->
        <svg class="zl-launcher-fallback" style="display:none" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="28" cy="28" r="27" stroke="rgba(184,134,11,0.6)" stroke-width="1.5" fill="rgba(44,36,24,0.75)"/>
          <path d="M28 10 L28 18 M28 38 L28 46 M10 28 L18 28 M38 28 L46 28" stroke="rgba(184,134,11,0.5)" stroke-width="1" stroke-linecap="round"/>
          <circle cx="28" cy="28" r="8" stroke="rgba(184,134,11,0.8)" stroke-width="1.2"/>
          <path d="M28 20 L31 27 L28 34 L25 27 Z" fill="rgba(184,134,11,0.6)"/>
          <text x="28" y="52" text-anchor="middle" font-size="7" fill="rgba(184,134,11,0.7)" font-family="'Noto Serif SC', serif">筑灵</text>
        </svg>
        <div class="zl-launcher-badge" id="zl-launcher-badge">1</div>
      </div>

      <!-- ========== 展开态面板 ========== -->
      <div id="zhuling-panel" class="zl-panel" role="dialog" aria-label="筑灵智能导览助手" aria-modal="true">

        <!-- 顶部标题栏 -->
        <div class="zl-header">
          <div class="zl-header-left">
            <div class="zl-avatar-wrap">
              <img
                id="zl-panel-avatar"
                src="${this.profileImage}"
                alt="筑灵"
                onerror="this.style.display='none';this.nextElementSibling.style.display='block'"
              >
              <!-- 头像加载失败时的圆形图标 -->
              <div class="zl-avatar-fallback" style="display:none">
                <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
                  <circle cx="18" cy="18" r="17" fill="rgba(139,37,0,0.9)"/>
                  <path d="M18 8 L18 14 M18 22 L18 28 M8 18 L14 18 M22 18 L28 18" stroke="rgba(184,134,11,0.7)" stroke-width="1" stroke-linecap="round"/>
                  <circle cx="18" cy="18" r="5" stroke="rgba(184,134,11,0.9)" stroke-width="1"/>
                  <path d="M18 13 L20 17.5 L18 22 L16 17.5 Z" fill="rgba(184,134,11,0.7)"/>
                </svg>
              </div>
            </div>
            <div class="zl-header-info">
              <span class="zl-name">筑灵</span>
              <span class="zl-subtitle" data-zh="古建筑智能导览" data-en="Ancient Architecture Guide">古建筑智能导览</span>
            </div>
          </div>
          <div class="zl-header-right">
            <button class="zl-btn-icon zl-mute-btn" id="zl-mute-btn" title="静音切换" aria-label="静音切换">
              <!-- 喇叭图标 SVG -->
              <svg class="icon-speak" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                <path d="M3 7H6L11 4V16L6 13H3V7Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
                <path d="M14 7C15.5 8.1 16.5 9.5 16.5 11C16.5 12.5 15.5 13.9 14 15" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                <path d="M16 4C18.5 6 19.5 8.5 19.5 11C19.5 13.5 18.5 16 16 18" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
              </svg>
              <!-- 静音 SVG -->
              <svg class="icon-muted" style="display:none" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                <path d="M3 7H6L11 4V16L6 13H3V7Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
                <path d="M14 7L19 13M19 7L14 13" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
              </svg>
            </button>
            <button class="zl-btn-icon zl-close-btn" id="zl-close-btn" title="收起" aria-label="收起助手">&#10005;</button>
          </div>
        </div>

        <!-- 对话区域 -->
        <div class="zl-messages" id="zl-messages">
          <!-- 欢迎消息 -->
          <div class="zl-msg zl-msg-assistant zl-msg-welcome">
            <div class="zl-msg-content">
              <div class="zl-msg-avatar">
                <img class="zl-msg-avatar-img" src="${this.profileImage}" alt="筑灵" onerror="this.style.display='none'">
              </div>
              <div class="zl-msg-bubble">
                <span class="zl-msg-welcome-text" data-zh="您好！我是筑灵，专为探索故宫建筑之美而生。无论是礼制含义、空间秩序，还是色彩象征、历史用途，都可以问我 😊" data-en="Hi! I'm 筑灵 (Zhù Líng), your friendly guide to the Forbidden City's architecture. Ask me anything about ritual symbolism, spatial design, colors, history — I'm here to help! 😊">
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="zl-input-area">
          <div class="zl-input-row">
            <div class="zl-input-wrap">
              <input
                type="text"
                id="zl-input"
                class="zl-input"
                placeholder="问我关于故宫建筑的问题…"
                autocomplete="off"
                autocorrect="off"
                spellcheck="false"
              >
            </div>
            <button class="zl-btn-icon zl-send-btn" id="zl-send-btn" title="发送" aria-label="发送消息">
              <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                <path d="M4 10L16 10M11 5L16 10L11 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <div class="zl-tool-row">
            <button
              class="zl-btn-icon zl-mic-btn"
              id="zl-mic-btn"
              title="${isRecordingSupported ? '按住说话' : '录音不可用'}"
              aria-label="语音输入"
              ${!isRecordingSupported ? 'disabled' : ''}
            >
              <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                <rect x="7" y="3" width="6" height="10" rx="3" stroke="currentColor" stroke-width="1.3"/>
                <path d="M4 10C4 13.3 6.7 16 10 16C13.3 16 16 13.3 16 10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                <path d="M10 16V18M7 18H13" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
              </svg>
            </button>
            <div class="zl-hint" data-zh="按 Enter 发送，Shift+Enter 换行" data-en="Enter to send, Shift+Enter for new line">按 Enter 发送，Shift+Enter 换行</div>
          </div>
        </div>

      </div>
    `

    this._root.insertAdjacentHTML('beforeend', html)

    // 缓存 DOM 引用
    this._el = {
      launcher:       this._root.querySelector('#zhuling-launcher'),
      launcherBadge:  this._root.querySelector('#zl-launcher-badge'),
      panel:          this._root.querySelector('#zhuling-panel'),
      header:         this._root.querySelector('.zl-header'),
      messages:       this._root.querySelector('#zl-messages'),
      input:          this._root.querySelector('#zl-input'),
      sendBtn:        this._root.querySelector('#zl-send-btn'),
      micBtn:         this._root.querySelector('#zl-mic-btn'),
      muteBtn:        this._root.querySelector('#zl-mute-btn'),
      closeBtn:       this._root.querySelector('#zl-close-btn'),
    }

    // 隐藏 badge
    this._el.launcherBadge.style.display = 'none'

    // 初始隐藏面板
    this._el.panel.style.display = 'none'

    // 同步语言文字
    this._syncLanguageUI()
  }

  // ================================================================
  //  私有：麦克风按钮 — 录音识别（按住说话 → 松开发送）
  // ================================================================
  _bindMicEvents() {
    const { micBtn } = this._el
    if (!micBtn) return

    const isRecordingSupported = SpeechManager.isRecordingSupported()

    // 如果不支持录音识别，禁用按钮
    if (!isRecordingSupported) {
      micBtn.disabled = true
      micBtn.title = '录音不可用'
      return
    }

    // 按下 → 开始录音
    micBtn.addEventListener('mousedown', async (e) => {
      e.preventDefault()
      if (this._speech.isRecording || this._speech.isSpeaking) return
      const lang = this._getLanguage() === 'en' ? 'en-US' : 'zh-CN'
      const ok = await this._speech.startRecording(lang)
      if (ok) {
        micBtn.classList.add('zl-mic-active')
      }
    })

    // 松开 → 停止录音 → ASR 识别
    const stopAndRecognize = async () => {
      if (!this._speech.isRecording) return
      const lang = this._getLanguage() === 'en' ? 'en-US' : 'zh-CN'
      micBtn.classList.remove('zl-mic-active')
      await this._speech.stopRecording(lang)
      // 识别结果通过 onFinal 回调处理
    }

    micBtn.addEventListener('mouseup', stopAndRecognize)
    micBtn.addEventListener('mouseleave', stopAndRecognize)

    // 移动端 touch
    micBtn.addEventListener('touchstart', async (e) => {
      e.preventDefault()
      if (this._speech.isRecording || this._speech.isSpeaking) return
      const lang = this._getLanguage() === 'en' ? 'en-US' : 'zh-CN'
      const ok = await this._speech.startRecording(lang)
      if (ok) {
        micBtn.classList.add('zl-mic-active')
      }
    })
    micBtn.addEventListener('touchend', (e) => {
      e.preventDefault()
      stopAndRecognize()
    })
  }

  // ================================================================
  //  私有：绑定事件
  // ================================================================
  _bindEvents() {
    const { launcher, sendBtn, input, muteBtn, closeBtn } = this._el

    // 点击悬浮入口 → 展开
    launcher.addEventListener('click', (e) => {
      if (e.target.closest('.zl-launcher-badge')) return
      this._open()
    })

    // 关闭按钮 → 收起
    closeBtn.addEventListener('click', () => this._close())

    // 发送按钮
    sendBtn.addEventListener('click', () => this._onSend())

    // 输入框 Enter
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        this._onSend()
      }
    })

    // 麦克风按钮（录音识别）
    this._bindMicEvents()

    // 静音按钮
    muteBtn.addEventListener('click', () => {
      const muted = this._speech.toggleMute()
      this._updateMuteUI(muted)
    })

    // 推荐问题点击（事件委托，在消息区域内）
    this._el.messages.addEventListener('click', (e) => {
      const btn = e.target.closest('.zl-suggestion-btn')
      if (btn) {
        this._sendMessage(btn.textContent.trim())
      }
    })

    // ESC 键关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this._isOpen) {
        this._close()
      }
    })
  }

  // ================================================================
  //  私有：展开面板
  // ================================================================
  _open() {
    if (this._isOpen) return
    this._isOpen = true

    this._el.launcher.style.display   = 'none'
    this._el.panel.style.display      = 'flex'
    this._el.panel.classList.add('zl-panel-enter')
    this._el.panel.setAttribute('aria-hidden', 'false')

    // 聚焦输入框
    setTimeout(() => this._el.input.focus(), 350)

    // 隐藏 badge
    this._el.launcherBadge.style.display = 'none'
  }

  // ================================================================
  //  私有：收起面板
  // ================================================================
  _close() {
    if (!this._isOpen) return
    this._isOpen = false

    this._el.panel.style.display      = 'none'
    this._el.panel.classList.remove('zl-panel-enter')
    this._el.panel.setAttribute('aria-hidden', 'true')

    this._el.launcher.style.display   = 'flex'

    // 停止语音和录音
    this._speech?.stopSpeaking()
    if (this._speech?.isRecording) {
      this._speech?.stopRecording()
    }
    this._el.micBtn?.classList.remove('zl-mic-active')
  }

  // ================================================================
  //  私有：渲染推荐问题按钮
  // ================================================================
  _renderSuggestionBtns(suggestions) {
    if (!suggestions || suggestions.length === 0) return ''
    return `
      <div class="zl-suggestion-btns">
        ${suggestions.map(s => `<button class="zl-suggestion-btn" title="${this._escapeHtml(s)}">${this._escapeHtml(s)}</button>`).join('')}
      </div>
    `
  }

  // ================================================================
  //  私有：发送按钮点击
  // ================================================================
  _onSend() {
    const text = this._el.input.value.trim()
    if (!text) return
    this._sendMessage(text)
    this._el.input.value = ''
  }

  // ================================================================
  //  私有：语音识别结果（麦克风录音识别完成后）
  // ================================================================
  _onMicResult(text) {
    this._el.micBtn?.classList.remove('zl-mic-active')
    if (!text) return
    // 自动发送识别出的文字
    this._sendMessage(text)
  }

  // ================================================================
  //  私有：ASR 识别中状态（显示加载动画）
  // ================================================================
  _onAsrLoading(loading) {
    const { micBtn } = this._el
    if (!micBtn) return
    if (loading) {
      micBtn.classList.add('zl-mic-loading')
    } else {
      micBtn.classList.remove('zl-mic-loading')
    }
  }

  // ================================================================
  //  私有：TTS 开始播报
  // ================================================================
  _onTTSStart() {
    const { muteBtn } = this._el
    if (muteBtn) {
      muteBtn.classList.add('zl-tts-playing')
    }
  }

  // ================================================================
  //  私有：TTS 播报结束
  // ================================================================
  _onTTSEnd() {
    const { muteBtn } = this._el
    if (muteBtn) {
      muteBtn.classList.remove('zl-tts-playing')
    }
  }

  // ================================================================
  //  私有：麦克风按下时的临时输入更新（用于浏览器原生 ASR）
  // ================================================================
  _updateMicInput(text) {
    this._el.input.value = text
  }

  // ================================================================
  //  私有：语音识别错误处理
  // ================================================================
  _onSpeechError(err) {
    this._el.micBtn?.classList.remove('zl-mic-active')
    this._el.micBtn?.classList.remove('zl-mic-loading')
    if (err === 'not-supported') {
      this._el.micBtn.disabled = true
      return
    }
    // 服务端返回的 ASR 说明（如暂未接入）直接展示在对话区
    if (typeof err === 'string' && err.length > 12 && !err.includes('asr-failed')) {
      this._appendErrorMessage(err)
      this._scrollToBottom()
    }
  }

  // ================================================================
  //  私有：发送消息（核心）
  // ================================================================
  async _sendMessage(text) {
    if (!text.trim()) return

    const lang = this._getLanguage()

    // 追加用户消息
    this._history.push({ role: 'user', content: text })
    this._appendUserMessage(text)

    // 追加加载指示器
    const loadingEl = this._appendLoadingMessage()

    try {
      const result = await this._api.sendMessage({
        message:   text,
        buildingId: this._getContext(),
        language:  lang,
        history:   this._history.slice(0, -1) // 不含本次用户消息
      })

      // 移除 loading
      loadingEl.remove()

      // 追加助手回复（包含推荐问题）
      this._history.push({ role: 'assistant', content: result.reply })
      this._appendAssistantMessage(result.reply, result.suggestions || [])

      // 豆包 TTS 语音播报（未静音时自动播报）
      if (!this._speech.isMuted) {
        const speakLang = lang === 'en' ? 'en' : 'zh'
        this._speech.speakWithDoubao(result.reply, speakLang)
      }

    } catch (err) {
      loadingEl.remove()
      this._appendErrorMessage(err.message || '服务暂时不可用，请稍后再试。')
    }

    // 滚动到底
    this._scrollToBottom()
  }

  // ================================================================
  //  私有：追加用户消息到对话区
  // ================================================================
  _appendUserMessage(text) {
    const div = document.createElement('div')
    div.className = 'zl-msg zl-msg-user'
    div.innerHTML = `
      <div class="zl-msg-content">
        <div class="zl-msg-bubble"><span>${this._escapeHtml(text)}</span></div>
      </div>
      <div class="zl-msg-avatar zl-msg-avatar-user">
        <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
          <circle cx="10" cy="10" r="9" fill="rgba(44,36,24,0.8)"/>
          <circle cx="10" cy="8" r="3" fill="rgba(245,240,230,0.9)"/>
          <path d="M4 16C4 13.2 6.7 11 10 11C13.3 11 16 13.2 16 16" stroke="rgba(245,240,230,0.9)" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
      </div>
    `
    this._el.messages.appendChild(div)
    this._scrollToBottom()
  }

  // ================================================================
  //  私有：追加助手消息到对话区
  // ================================================================
  _appendAssistantMessage(text, suggestions) {
    const div = document.createElement('div')
    div.className = 'zl-msg zl-msg-assistant'
    div.innerHTML = `
      <div class="zl-msg-content">
        ${this._assistantAvatarHtml()}
        <div class="zl-msg-bubble">
          <span>${this._formatMessage(text)}</span>
          ${this._renderSuggestionBtns(suggestions)}
        </div>
      </div>
    `
    this._el.messages.appendChild(div)
    this._scrollToBottom()
  }

  // ================================================================
  //  私有：追加加载指示器
  // ================================================================
  _appendLoadingMessage() {
    const div = document.createElement('div')
    div.className = 'zl-msg zl-msg-assistant zl-msg-loading'
    div.innerHTML = `
      <div class="zl-msg-content">
        ${this._assistantAvatarHtml()}
        <div class="zl-msg-bubble zl-loading-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    `
    this._el.messages.appendChild(div)
    this._scrollToBottom()
    return div
  }

  // ================================================================
  //  私有：追加错误消息
  // ================================================================
  _appendErrorMessage(text) {
    const div = document.createElement('div')
    div.className = 'zl-msg zl-msg-assistant zl-msg-error'
    div.innerHTML = `
      <div class="zl-msg-content">
        ${this._assistantAvatarHtml()}
        <div class="zl-msg-bubble zl-error-bubble">
          <span>${this._escapeHtml(text)}</span>
        </div>
      </div>
    `
    this._el.messages.appendChild(div)
    this._scrollToBottom()
  }

  // ================================================================
  //  私有：更新静音 UI
  // ================================================================
  _updateMuteUI(muted) {
    const { muteBtn } = this._el
    const iconSpeak = muteBtn.querySelector('.icon-speak')
    const iconMuted = muteBtn.querySelector('.icon-muted')

    if (muted) {
      iconSpeak.style.display = 'none'
      iconMuted.style.display = 'block'
      muteBtn.title = '取消静音'
    } else {
      iconSpeak.style.display = 'block'
      iconMuted.style.display = 'none'
      muteBtn.title = '静音切换'
    }
  }

  // ================================================================
  //  私有：同步语言 UI（双语标签）
  // ================================================================
  _syncLanguageUI() {
    const lang = this._getLanguage()
    this._root.querySelectorAll('[data-zh]').forEach(el => {
      el.textContent = el.getAttribute(`data-${lang}`)
    })
    this._el.input.placeholder = lang === 'en'
      ? 'Ask about the Forbidden City…'
      : '问我关于故宫建筑的问题…'
  }

  // ================================================================
  //  私有：滚动到底部
  // ================================================================
  _scrollToBottom() {
    const msgs = this._el.messages
    msgs.scrollTop = msgs.scrollHeight
  }

  // ================================================================
  //  私有：生成助手头像 HTML
  // ================================================================
  _assistantAvatarHtml() {
    return `<div class="zl-msg-avatar"><img class="zl-msg-avatar-img" src="${this.profileImage}" alt="筑灵" onerror="this.style.display='none'"></div>`
  }

  // ================================================================
  //  私有：HTML 转义
  // ================================================================
  _escapeHtml(str) {
    const div = document.createElement('div')
    div.textContent = str
    return div.innerHTML
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  }

  // ================================================================
  //  私有：格式化消息（支持 Markdown 风格）
  // ================================================================
  _formatMessage(text) {
    return this._escapeHtml(text)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
  }

}