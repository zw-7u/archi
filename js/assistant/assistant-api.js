/**
 * =====================================================
 *  js/assistant/assistant-api.js
 *  API 调用封装 — AssistantAPI 类
 *
 *  使用方式：
 *    const api = new AssistantAPI({ apiBase: 'http://localhost:3000' })
 *    const { reply, suggestions } = await api.sendMessage(...)
 * =====================================================
 */

class AssistantAPI {

  /**
   * @param {Object} options
   * @param {string}  options.apiBase  - API 基础地址，如 'http://localhost:3000'
   */
  constructor(options = {}) {
    this.apiBase = (options.apiBase || 'http://localhost:3000').replace(/\/$/, '')
    this._timeout = 30000
    this._available = null  // null=未检测, true=可用, false=不可用
  }

  // ---------------------------------------------------
  //  公开：检查 API 是否可用
  // ---------------------------------------------------
  async checkAvailability() {
    if (this._available !== null) return this._available

    try {
      const resp = await fetch(`${this.apiBase}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      })
      this._available = resp.ok
    } catch (err) {
      console.warn('[AssistantAPI] API 健康检查失败:', err.message)
      this._available = false
    }
    return this._available
  }

  // ---------------------------------------------------
  //  私有：统一 fetch 封装
  // ---------------------------------------------------
  async _fetch(path, options = {}) {
    const url    = `${this.apiBase}${path}`
    const method = options.method || 'GET'
    const body   = options.body   ? JSON.stringify(options.body) : undefined

    const controller = new AbortController()
    const timer      = setTimeout(() => controller.abort(), this._timeout)

    try {
      console.log('[AssistantAPI] 发送请求:', method, url)

      const resp = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body,
        signal: controller.signal
      })

      clearTimeout(timer)
      console.log('[AssistantAPI] 收到响应:', resp.status)

      const data = await resp.json()

      if (!resp.ok && !data.success) {
        throw new Error(data.error || `HTTP ${resp.status}`)
      }

      return data

    } catch (err) {
      clearTimeout(timer)
      console.error('[AssistantAPI] 请求失败:', err.message)

      if (err.name === 'AbortError') {
        throw new Error('请求超时，请检查网络或 API 服务是否运行')
      }
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        throw new Error('无法连接到 API 服务，请确保后端服务已启动')
      }
      throw err
    }
  }

  // ---------------------------------------------------
  //  公开：获取推荐问题
  //  @param {string} buildingId
  //  @returns {Promise<string[]>}
  // ---------------------------------------------------
  async getSuggestions(buildingId) {
    const data = await this._fetch(
      `/api/suggestions?buildingId=${encodeURIComponent(buildingId || 'general')}`
    )
    return data.suggestions || []
  }

  // ---------------------------------------------------
  //  公开：发送聊天消息
  //
  //  @param {Object} params
  //  @param {string}   params.message    - 用户消息
  //  @param {string}   params.buildingId - 建筑上下文 ID
  //  @param {string}   params.language   - 'zh' | 'en'
  //  @param {Array}    params.history     - 对话历史 [{role:'user'|'assistant', content:'...'}]
  //  @returns {Promise<{reply: string, suggestions: string[]}>}
  // ---------------------------------------------------
  async sendMessage({ message, buildingId = 'general', language = 'zh', history = [] }) {
    const data = await this._fetch('/api/chat', {
      method: 'POST',
      body: { message, buildingId, language, history }
    })

    return {
      reply:       data.reply       || '抱歉，暂时无法回答。',
      suggestions: data.suggestions || [],
      buildingId:  data.buildingId || buildingId
    }
  }

  // ---------------------------------------------------
  //  公开：健康检查
  //  @returns {Promise<{status: string, hasApiKey: boolean}>}
  // ---------------------------------------------------
  async healthCheck() {
    return this._fetch('/api/health')
  }
}
