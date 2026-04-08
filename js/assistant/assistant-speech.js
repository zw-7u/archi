/**
 * =====================================================
 *  js/assistant/assistant-speech.js
 *  语音识别 / 语音播报封装 — SpeechManager 类
 *
 *  功能：
 *    - 录音识别：startRecording() / stopRecording()
 *      → 使用浏览器原生 SpeechRecognition
 *    - 语音播报：speakWithDoubao(text, lang)
 *      → 调用后端 /api/tts 获取音频并播放
 *    - 保留浏览器原生 speak() 作为降级
 * =====================================================
 */
class SpeechManager {
  /**
   * @param {Object} options
   * @param {string}  options.apiBase       - API 服务地址，默认 http://localhost:3000
   * @param {Function} options.onInterim     - 实时识别结果回调（可选）
   * @param {Function} options.onFinal       - 最终识别结果回调
   * @param {Function} options.onError       - 错误回调
   * @param {Function} options.onAsrLoading   - ASR 识别中回调（可选）
   * @param {Function} options.onTTSStart    - TTS 开始播放回调（可选）
   * @param {Function} options.onTTSEnd      - TTS 播放结束回调（可选）
   */
  constructor(options = {}) {
    this.apiBase = options.apiBase || 'http://localhost:3000'
    this.onInterim    = options.onInterim    || null
    this.onFinal      = options.onFinal      || null
    this.onError      = options.onError      || null
    this.onAsrLoading = options.onAsrLoading || null
    this.onTTSStart   = options.onTTSStart   || null
    this.onTTSEnd     = options.onTTSEnd     || null
    // 优先使用浏览器原生语音识别（兼容移动端）
    this._useNativeRecognition = true
    // 内部状态
    this._recognition  = null
    this._isListening  = false
    this._isMuted      = false
    this._speaking     = false
    // TTS 音频播放
    this._audioElement  = null
    this._initRecognition()
    this._initAudioPlayer()
  }

  // ---------------------------------------------------
  //  私有：初始化浏览器原生 SpeechRecognition（主要识别方式，兼容移动端）
  // ---------------------------------------------------
  _initRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      console.warn('[SpeechManager] 浏览器不支持 SpeechRecognition')
      this._useNativeRecognition = false
      return
    }

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
    }

    // SpeechRecognition 初始化成功
    this._useNativeRecognition = true
  }

  // ---------------------------------------------------
  //  私有：初始化音频播放器
  // ---------------------------------------------------
  _initAudioPlayer() {
    this._audioElement = new Audio()
    this._audioElement.addEventListener('ended', () => {
      this._speaking = false
      if (this.onTTSEnd) this.onTTSEnd()
    })
    this._audioElement.addEventListener('error', (e) => {
      console.warn('[TTS Audio Error]', e)
      this._speaking = false
      if (this.onTTSEnd) this.onTTSEnd()
    })
  }

  // ================================================================
  //  公开：录音识别
  //  仅使用浏览器原生 SpeechRecognition（兼容支持该能力的移动端）
  // ================================================================
  /**
   * 开始录音
   * @param {string} lang - 语言，默认 'zh-CN'
   * @returns {Promise<boolean>} 是否成功开始录音
   */
  async startRecording(lang = 'zh-CN') {
    if (this._isListening) return false

    if (!this._useNativeRecognition || !this._recognition) {
      if (this.onError) this.onError('browser-recognition-unavailable')
      return false
    }

    try {
      this._recognition.lang = lang
      this._recognition.start()
      this._isListening = true
      return true
    } catch (err) {
      console.warn('[SpeechManager] SpeechRecognition 启动失败，准备重试:', err)
      try {
        this._recognition.abort?.()
      } catch (abortErr) {
        // ignore
      }
      await new Promise((resolve) => setTimeout(resolve, 120))
      try {
        this._recognition.lang = lang
        this._recognition.start()
        this._isListening = true
        return true
      } catch (retryErr) {
        console.warn('[SpeechManager] SpeechRecognition 重试失败:', retryErr)
        if (this.onError) this.onError('recognition-start-failed')
        return false
      }
    }
  }

  /**
   * 停止录音，发送给识别服务
   * @param {string} lang - 语言，默认 'zh-CN'
   * @returns {Promise<string>} 识别后的文字
   */
  async stopRecording(lang = 'zh-CN') {
    if (this._isListening && this._useNativeRecognition && this._recognition) {
      try {
        this._recognition.lang = lang
        this._recognition.stop()
      } catch (err) {
        console.warn('[SpeechManager] SpeechRecognition stop 失败:', err)
      }
      this._isListening = false
      return ''
    }
    return ''
  }

  // ================================================================
  //  公开：豆包 TTS 语音播报
  // ================================================================
  /**
   * 使用豆包 TTS 播报文字
   * @param {string} text - 要播报的文本
   * @param {string} lang - 语言 'zh' | 'en'
   * @returns {Promise<void>}
   */
  async speakWithDoubao(text, lang = 'zh') {
    if (!text || this._isMuted) return

    // 中断当前播报
    this.stopSpeaking()

    try {
      const response = await fetch(`${this.apiBase}/api/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, lang })
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        const detail = err.upstreamMessage ? `（${err.upstreamMessage}）` : ''
        throw new Error((err.error || `TTS 请求失败: ${response.status}`) + detail)
      }

      const data = await response.json()

      if (!data.success || !data.audio) {
        throw new Error(data.error || 'TTS 未返回音频')
      }

      // 播放音频
      const audioSrc = `data:audio/mp3;base64,${data.audio}`
      this._audioElement.src = audioSrc
      this._speaking = true

      if (this.onTTSStart) this.onTTSStart()
      this._audioElement.play()

    } catch (err) {
      console.error('[speakWithDoubao] TTS 播放失败:', err)
      // 降级：尝试浏览器原生 TTS
      this.speak(text, lang)
    }
  }

  // ================================================================
  //  公开：浏览器原生 TTS 播报（降级方案）
  // ================================================================
  speak(text, lang = 'zh') {
    if (!window.speechSynthesis || this._isMuted) return

    this._cancelSpeaking()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang  = lang === 'en' ? 'en-US' : 'zh-CN'
    utterance.rate  = 0.95
    utterance.pitch = 1.0

    utterance.onstart = () => { this._speaking = true }
    utterance.onend   = () => { this._speaking = false }
    utterance.onerror = () => { this._speaking = false }

    window.speechSynthesis.speak(utterance)
  }

  // ================================================================
  //  公开：停止当前播报
  // ================================================================
  _cancelSpeaking() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    if (this._audioElement) {
      this._audioElement.pause()
      this._audioElement.currentTime = 0
    }
    this._speaking = false
  }

  stopSpeaking() {
    this._cancelSpeaking()
  }

  // ================================================================
  //  公开：开始浏览器原生语音识别（备选方法）
  // ================================================================
  startListening(lang = 'zh-CN') {
    if (!this._recognition) {
      if (this.onError) this.onError('not-supported')
      return false
    }
    if (this._isListening) return false

    this._recognition.lang = lang
    this._isListening      = true

    try {
      this._recognition.start()
      return true
    } catch (e) {
      this._isListening = false
      if (this.onError) this.onError('start-failed')
      return false
    }
  }

  stopListening() {
    if (!this._recognition || !this._isListening) return
    try {
      this._recognition.stop()
    } catch (e) {
      // ignore
    }
    this._isListening = false
  }

  // ================================================================
  //  公开：切换静音状态
  // ================================================================
  toggleMute() {
    this._isMuted = !this._isMuted
    if (this._isMuted) {
      this._cancelSpeaking()
    }
    return this._isMuted
  }

  setMuted(muted) {
    this._isMuted = !!muted
    if (this._isMuted) this._cancelSpeaking()
  }

  get isMuted() {
    return this._isMuted
  }

  get isSpeaking() {
    return this._speaking
  }

  get isListening() {
    return this._isListening
  }

  get isRecording() {
    return this._isListening
  }

  // ================================================================
  //  公开：浏览器是否支持录音识别
  // ================================================================
  static isRecordingSupported() {
    return SpeechManager.isRecognitionSupported()
  }

  static isRecognitionSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  }

  static isSynthesisSupported() {
    return !!window.speechSynthesis
  }
}
