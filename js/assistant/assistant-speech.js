/**
 * =====================================================
 *  js/assistant/assistant-speech.js
 *  语音识别 / 语音播报封装
 *  SpeechManager 类
 * =====================================================
 */

class SpeechManager {
  /**
   * @param {Object} options
   * @param {Function} options.onInterim  - 实时识别结果回调（可选）
   * @param {Function} options.onFinal    - 最终识别结果回调
   * @param {Function} options.onError    - 错误回调
   * @param {Function} options.onEnd      - 识别结束回调
   */
  constructor(options = {}) {
    this.onInterim  = options.onInterim  || null
    this.onFinal    = options.onFinal    || null
    this.onError    = options.onError    || null
    this.onEnd      = options.onEnd      || null

    this._recognition  = null
    this._isListening  = false
    this._isMuted      = false
    this._speaking     = false

    this._initRecognition()
  }

  // ---------------------------------------------------
  //  私有：初始化 SpeechRecognition
  // ---------------------------------------------------
  _initRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return

    this._recognition = new SR()
    this._recognition.lang              = 'zh-CN'
    this._recognition.continuous        = false
    this._recognition.interimResults   = true
    this._recognition.maxAlternatives  = 1

    this._recognition.onresult = (event) => {
      let interim = ''
      let final   = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          final += transcript
        } else {
          interim += transcript
        }
      }

      if (interim && this.onInterim) {
        this.onInterim(interim)
      }
      if (final && this.onFinal) {
        this.onFinal(final.trim())
      }
    }

    this._recognition.onerror = (event) => {
      if (event.error === 'no-speech') return
      console.warn('[SpeechRecognition]', event.error)
      if (this.onError) this.onError(event.error)
    }

    this._recognition.onend = () => {
      this._isListening = false
      if (this.onEnd) this.onEnd()
    }
  }

  // ---------------------------------------------------
  //  公开：开始语音识别
  //  @returns {boolean} 是否成功启动
  // ---------------------------------------------------
  startListening(lang = 'zh-CN') {
    if (!this._recognition) {
      if (this.onError) this.onError('not-supported')
      return false
    }
    if (this._isListening) return false

    this._recognition.lang       = lang
    this._isListening            = true

    try {
      this._recognition.start()
      return true
    } catch (e) {
      this._isListening = false
      if (this.onError) this.onError('start-failed')
      return false
    }
  }

  // ---------------------------------------------------
  //  公开：停止语音识别
  // ---------------------------------------------------
  stopListening() {
    if (!this._recognition || !this._isListening) return
    try {
      this._recognition.stop()
    } catch (e) {
      // ignore
    }
    this._isListening = false
  }

  // ---------------------------------------------------
  //  公开：浏览器是否支持语音识别
  // ---------------------------------------------------
  static isRecognitionSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  }

  // ---------------------------------------------------
  //  公开：浏览器是否支持语音播报
  // ---------------------------------------------------
  static isSynthesisSupported() {
    return !!window.speechSynthesis
  }

  // ---------------------------------------------------
  //  公开：语音播报
  //  @param {string} text   - 要播报的文本
  //  @param {string} lang   - 语言 'zh' | 'en'
  // ---------------------------------------------------
  speak(text, lang = 'zh') {
    if (!window.speechSynthesis) return
    if (this._isMuted) return

    // 中断当前播报
    this._cancelSpeaking()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang  = lang === 'en' ? 'en-US' : 'zh-CN'
    utterance.rate  = 0.95
    utterance.pitch = 1.0

    utterance.onstart  = () => { this._speaking = true }
    utterance.onend    = () => { this._speaking = false }
    utterance.onerror  = () => { this._speaking = false }

    window.speechSynthesis.speak(utterance)
  }

  // ---------------------------------------------------
  //  公开：停止当前播报
  // ---------------------------------------------------
  _cancelSpeaking() {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    this._speaking = false
  }

  stopSpeaking() {
    this._cancelSpeaking()
  }

  // ---------------------------------------------------
  //  公开：切换静音状态
  //  @returns {boolean} 切换后的静音状态
  // ---------------------------------------------------
  toggleMute() {
    this._isMuted = !this._isMuted
    if (this._isMuted) {
      this._cancelSpeaking()
    }
    return this._isMuted
  }

  // ---------------------------------------------------
  //  公开：设置静音状态
  // ---------------------------------------------------
  setMuted(muted) {
    this._isMuted = !!muted
    if (this._isMuted) this._cancelSpeaking()
  }

  // ---------------------------------------------------
  //  公开：是否处于静音状态
  // ---------------------------------------------------
  get isMuted() {
    return this._isMuted
  }

  // ---------------------------------------------------
  //  公开：是否正在播报
  // ---------------------------------------------------
  get isSpeaking() {
    return this._speaking
  }

  // ---------------------------------------------------
  //  公开：是否正在监听
  // ---------------------------------------------------
  get isListening() {
    return this._isListening
  }
}
