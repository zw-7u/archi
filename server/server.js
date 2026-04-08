/**
 * =====================================================
 *  筑灵 - 古建筑智能导览助手 API 服务
 *  server/server.js
 * =====================================================
 *
 *  功能：
 *    GET  /api/suggestions?buildingId=xxx  返回推荐问题
 *   POST /api/chat                       接收问题，返回 AI 回复 + 推荐问题
 *
 *  依赖：npm install
 *  运行：node server.js
 * =====================================================
 */

require('dotenv').config()
const express = require('express')
const cors    = require('cors')
const axios   = require('axios')
const { v4: uuidv4 } = require('uuid')

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.raw({ limit: '10mb', type: 'audio/*' }))

const PORT    = process.env.PORT    || 3000
const API_KEY = process.env.ARK_API_KEY || ''
const ARK_BASE_URL = process.env.ARK_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
const DOUBAO_MODEL = process.env.DOUBAO_MODEL || 'doubao-seed-character-251128'

// ===================================================
//  建筑上下文数据（与前端 BUILDINGS 保持同步关键字段）
// ===================================================
const BUILDING_CONTEXT = {
  general: {
    name: '紫禁城（故宫）',
    nameEn: 'The Forbidden City (Zijincheng)',
    description: '世界现存规模最大、保存最完整的木质结构古建筑群，始建于明永乐四年（1406年），历时14年建成。占地72万平方米，建筑面积约15万平方米，有大小宫殿70多座，房屋9000余间。',
    descriptionEn: 'The world\'s largest and best-preserved ancient wooden architectural complex. Built from 1406-1420 during the Ming Dynasty, it covers 720,000 sq meters with about 15,000 buildings and 9,000+ rooms.',
    tips: '中国古建筑遵循严格的礼制秩序，以中轴线为中心对称布局。色彩、屋顶形制、脊兽数量都反映了建筑等级。',
    tipsEn: 'Chinese palace architecture follows a strict ritual hierarchy centered on a symmetrical north-south axis. Colors, roof types, and ridge-beast counts all signal rank.'
  },
  wumen: {
    name: '午门',
    nameEn: 'Meridian Gate (Wumen)',
    description: '紫禁城正门，五座门楼呈"凹"字形排列，中央门楼重檐歇山顶，两侧夹庭各三间。午门是皇帝举行重大典礼的地方，也是清代献俘仪式的场所。',
    descriptionEn: 'The main southern gate of the Forbidden City, with five towers in a "concave" arrangement. The central tower has a double-eaved Xieshan roof. Major ceremonies and prisoner-presenting rituals were held here.',
    tips: '午门的"凹"字形设计源于古代"阙"制，中间开门为皇帝专用，文武官员走两侧掖门。这种不对称中求对称的布局体现了皇权的绝对中心地位。',
    tipsEn: 'The concave layout grew from the ancient que gate tradition. The central passage was reserved for the emperor, while officials used the side passages, reinforcing imperial centrality.'
  },
  taihedian: {
    name: '太和殿',
    nameEn: 'Hall of Supreme Harmony (Taihedian)',
    description: '紫禁城外朝三大殿核心，明清皇帝举行登基、大婚、册封等重大典礼之所。殿身高8.13米，为全国古建筑之最。屋顶为重檐庑殿顶（最高等级），脊兽10只（古建筑最高数量）。',
    descriptionEn: 'The core of the Outer Court, where major ceremonies like enthronement were held. At 8.13m high, it is the tallest ancient building in China. It has the highest-ranked double-eaved hip roof and 10 roof ridge beasts (the maximum allowed).',
    tips: '太和殿前的广场没有一棵树，是为了烘托皇权的威严和"普天之下"的至高无上感。金砖（高质量细料砖）敲击有金属声，故名"金砖"。殿内宝座后的屏风绘有"锦绣山河"图，象征江山永固。',
    tipsEn: 'The open forecourt heightens imperial majesty. The famous “golden bricks” ring like metal when struck, and the screen behind the throne symbolizes a realm meant to endure.'
  },
  dongliugong: {
    name: '东六宫',
    nameEn: 'Six Eastern Palaces (Dongliugong)',
    description: '紫禁城后廷主体建筑群，位于中轴线东侧，由六座独立的宫殿组成：景仁宫、承乾宫、钟粹宫、景阳宫、永和宫、延禧宫。明清时期为后妃居所。',
    descriptionEn: 'Six independent palace buildings on the eastern side of the Inner Court, used as living quarters for imperial consorts during the Ming and Qing dynasties.',
    tips: '东六宫的布局采用了"东西六宫，乾五巽一"的方位理念，与八卦方位相关。每座宫殿前殿后寝的格局，体现了中国传统院落式建筑的空间秩序。',
    tipsEn: 'The Six Eastern Palaces reflect directional thinking linked to the Bagua system. Their front-hall and rear-residence sequence shows the ordered logic of traditional Chinese courtyard planning.'
  },
  xiliugong: {
    name: '西六宫',
    nameEn: 'Six Western Palaces (Xiliugong)',
    description: '与东六宫对称的宫殿群，位于中轴线西侧，包括永寿宫、太极殿（未建）、长春宫、咸福宫、储秀宫、咸安宫（后改建）。同样为后妃居所。',
    descriptionEn: 'The symmetrical counterpart to the Six Eastern Palaces on the western side, also serving as imperial consort residences with the same architectural layout.',
    tips: '清代慈禧太后曾长期居住在储秀宫，她对宫殿进行了大规模改造。咸福宫则是恭亲王奕訢的起居之所，是清代亲王中唯一入住西六宫的特例。',
    tipsEn: 'Cixi lived for a long period in Chuxiu Palace and reshaped it extensively. Xianfu Palace was also unusual because a Qing prince once used it as a residence.'
  }
}

// ===================================================
//  猜你想问数据（按 buildingId 分组）
// ===================================================
const SUGGESTIONS_MAP = {
  general: [
    '紫禁城的整体布局有什么讲究？',
    '为什么宫殿屋顶多用黄色琉璃瓦？',
    '脊兽的数量代表什么含义？',
    '古建筑中的斗拱有什么作用？',
    '外国人参观故宫有什么特别建议？',
    '古代皇帝上朝是在哪个殿？'
  ],
  wumen: [
    '午门的"午"是什么意思？',
    '为什么午门要做成"凹"字形？',
    '电视剧里"推出午门斩首"是真的吗？',
    '午门两侧的小门叫什么？',
    '午门的脊兽和其他宫殿有什么不同？'
  ],
  taihedian: [
    '太和殿为什么被叫做"金銮殿"？',
    '太和殿前的广场为什么不种树？',
    '10只脊兽各自代表什么？',
    '太和殿宝座后面的屏风画的是什么？',
    '为什么太和殿的门槛这么高？',
    '皇帝登基大典的具体流程是什么？'
  ],
  dongliugong: [
    '后妃住在东六宫有什么规矩？',
    '景仁宫和承乾宫有什么区别？',
    '东六宫的建筑等级比西六宫高吗？',
    '现在东六宫对游客开放吗？'
  ],
  xiliugong: [
    '西六宫里最有名的是哪个？',
    '慈溪太后为什么住在储秀宫？',
    '东六宫和西六宫的名称有什么对称关系？',
    '古代宫女住在六宫里吗？'
  ]
}

const SUGGESTIONS_MAP_EN = {
  general: [
    'What is special about the Forbidden City’s overall layout?',
    'Why are so many palace roofs covered with yellow glazed tiles?',
    'What does the number of ridge beasts mean?',
    'What exactly does dougong do in ancient Chinese buildings?',
    'What should international visitors pay attention to in the palace?',
    'Which hall was used for imperial court ceremonies?'
  ],
  wumen: [
    'What does “Wumen” mean?',
    'Why is the Meridian Gate designed in a concave plan?',
    'Is the saying “dragged out to Wumen for execution” historically true?',
    'What are the side openings of Wumen called?',
    'How is Wumen different from other palace gates?'
  ],
  taihedian: [
    'Why is Taihedian often called the Golden Throne Hall?',
    'Why are there no trees in front of Taihedian?',
    'What do the ten ridge beasts symbolize?',
    'What is shown on the screen behind the imperial throne?',
    'Why is the threshold so high in Taihedian?',
    'What happened during an imperial enthronement ceremony?'
  ],
  dongliugong: [
    'What rules governed life in the Six Eastern Palaces?',
    'How were Jingren Palace and Chengqian Palace different?',
    'Were the Six Eastern Palaces ranked above the western side?',
    'Are the Six Eastern Palaces open to visitors today?'
  ],
  xiliugong: [
    'Which palace in the Six Western Palaces is the most famous?',
    'Why did Empress Dowager Cixi live in Chuxiu Palace?',
    'How do the names of the eastern and western palaces mirror each other?',
    'Did palace maids also live inside the Six Western Palaces?'
  ]
}

function getSuggestionsFor(buildingId, language = 'zh') {
  const source = language === 'en' ? SUGGESTIONS_MAP_EN : SUGGESTIONS_MAP
  return source[buildingId] || source.general
}

// ===================================================
//  System Prompt 生成器
// ===================================================
function buildSystemPrompt(buildingId, language) {
  const ctx = BUILDING_CONTEXT[buildingId] || BUILDING_CONTEXT['general']

  const roleDescription = language === 'en'
    ? `You are "Zhuling" — a friendly, knowledgeable AI guide specializing in Chinese ancient architecture, especially the Forbidden City. You speak in clear, natural English with a warm and approachable tone. You are especially good at cross-cultural explanation for international students and overseas visitors.

Your speaking style:
- Be concise and conversational — avoid dry encyclopedia entries
- Use comparisons to familiar Western architecture/culture when helpful
- Highlight cultural symbolism (colors, numbers, positioning) and explain why it matters to Chinese imperial thinking
- Share interesting stories and little-known facts, not just official history
- Always be welcoming and patient with cultural differences
- End responses naturally without formal summaries

Language rules:
- Respond only in English
- Do not output Chinese characters
- When a culture-specific Chinese term is important, give the English term first and add pinyin in parentheses on first mention, for example Meridian Gate (Wumen / Wǔmén) or yin-yang (yīn-yáng)
- Keep pinyin brief and only use it for key terms, building names, and technical concepts`
    : `你是"筑灵"（Zhù Líng）——一位友好、博学的中国古建筑AI导览助手，专精故宫（紫禁城）建筑文化。你以中文为主要回答语言。

你的回答风格：
- 简洁、亲切、口语化，避免干巴巴的百科条目
- 善用跨文化对比（与西方建筑/文化类比），让外国游客更易理解
- 重点解释色彩、数字、方位等象征含义，说明其在皇权礼制中的意义
- 分享有趣的小故事和冷知识，而非仅仅陈述官方历史
- 对文化差异保持开放和耐心
- 回答自然收尾，不做正式总结

语言规则：
- 只使用中文回答
- 不要夹杂英文整句、英文列表或中英混排句式
- 如需解释专业术语，请直接用中文解释，不附英文翻译`

  const contextBlock = language === 'en'
    ? `Current context: ${ctx.nameEn}

Key facts:
${ctx.descriptionEn}

Cultural insight:
${ctx.tipsEn || ctx.descriptionEn}

If the user asks about a different building, you may draw general knowledge about the Forbidden City to enrich your answer. If they ask about something unrelated to architecture, gently steer the conversation back to the Forbidden City.`
    : `当前上下文：${ctx.name}

核心信息：
${ctx.description}

文化解读：
${ctx.tips}

如果用户问到其他建筑，可以用故宫的一般知识丰富回答。如果用户问到与建筑无关的内容，请友好地将话题引回故宫建筑。`

  const closingReminder = language === 'en'
    ? 'Remember: you are Zhuling, a scholarly yet warm companion who makes the Forbidden City understandable and welcoming.'
    : '记住：你是筑灵，一位既有学识又亲切自然的陪伴式导览助手。'

  return `${roleDescription}

${contextBlock}

${closingReminder}`
}

// ===================================================
//  GET /api/suggestions
// ===================================================
app.get('/api/suggestions', (req, res) => {
  const { buildingId = 'general', language = 'zh' } = req.query
  const suggestions = getSuggestionsFor(buildingId, language)

  res.json({
    success: true,
    buildingId,
    suggestions
  })
})

// ===================================================
//  POST /api/chat
// ===================================================
app.post('/api/chat', async (req, res) => {
  const { message, buildingId = 'general', language = 'zh', history = [] } = req.body

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ success: false, error: 'message is required' })
  }

  if (!API_KEY) {
    return res.status(500).json({
      success: false,
      error: language === 'en' ? 'ARK_API_KEY is missing. Please check the .env file.' : 'ARK_API_KEY 未配置，请检查 .env 文件'
    })
  }

  const systemPrompt = buildSystemPrompt(buildingId, language)

  // 组装消息历史（保留最近 6 轮）
  const recentHistory = Array.isArray(history) ? history.slice(-6) : []
  const messages = [
    { role: 'system', content: systemPrompt },
    ...recentHistory.map(h => ({
      role: h.role === 'user' ? 'user' : 'assistant',
      content: h.content || h.text || ''
    })),
    { role: 'user', content: message }
  ]

  try {
    // 火山引擎 ARK API（豆包大模型）
    const response = await axios.post(
      ARK_BASE_URL,
      {
        model: DOUBAO_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 800
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    )

    const reply = response.data.choices?.[0]?.message?.content?.trim() || (language === 'en' ? 'Sorry, I cannot answer that right now.' : '抱歉，暂时无法回答这个问题。')

    const suggestions = getSuggestionsFor(buildingId, language)

    res.json({
      success: true,
      reply,
      suggestions,
      buildingId
    })

  } catch (err) {
    console.error('[API Error]', err.response?.data || err.message)

    const statusCode = err.response?.status || 500
    const errorMessage = err.response?.data?.error?.message ||
                         err.response?.data?.message ||
                         'API request failed'

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      reply: language === 'en' ? 'Sorry, the service is temporarily unavailable. Please try again later.' : '抱歉，服务暂时遇到问题，请稍后再试。'
    })
  }
})

// 火山语音鉴权头：文档要求 "Bearer;${token}"，分号后不要空格
function volcSpeechAuthHeader() {
  const token = process.env.VOLC_SPEECH_API_KEY || ''
  return token ? `Bearer;${token}` : ''
}

/**
 * V3 HTTP Chunked 响应体为 JSON 流：每段形如
 * {"code":0,"message":"","data":"<base64 音频片段>"}，data 为 null 时表示非音频元数据。
 * 不能直接当 MP3 二进制拼接。参考：语音合成大模型 HTTP Chunked/SSE 单向流式-V3。
 */
function extractJsonObjectsFromTtsStream(raw) {
  const s = typeof raw === 'string' ? raw : raw.toString('utf8')
  const trimmed = s.trim()
  if (!trimmed) return []
  const byLine = trimmed.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  const out = []
  for (const line of byLine) {
    try {
      out.push(JSON.parse(line))
    } catch {
      // 非逐行 JSON，下面整体解析
    }
  }
  if (out.length) return out
  try {
    return [JSON.parse(trimmed)]
  } catch {
    // 无换行拼接的多个 JSON 对象
    return extractTopLevelJsonObjects(trimmed)
  }
}

function extractTopLevelJsonObjects(s) {
  const objs = []
  let i = 0
  const n = s.length
  while (i < n) {
    while (i < n && /\s/.test(s[i])) i++
    if (i >= n || s[i] !== '{') break
    let depth = 0
    let inString = false
    let escape = false
    const start = i
    for (; i < n; i++) {
      const c = s[i]
      if (escape) {
        escape = false
        continue
      }
      if (c === '\\' && inString) {
        escape = true
        continue
      }
      if (c === '"') {
        inString = !inString
        continue
      }
      if (!inString) {
        if (c === '{') depth++
        else if (c === '}') {
          depth--
          if (depth === 0) {
            try {
              objs.push(JSON.parse(s.slice(start, i + 1)))
            } catch {
              /* skip */
            }
            i++
            break
          }
        }
      }
    }
  }
  return objs
}

function volcV3ChunkedBodyToAudioBuffer(rawBuf) {
  const buf = rawBuf
  const textProbe = buf.slice(0, 64).toString('utf8')
  if (textProbe.trimStart().startsWith('<') || textProbe.includes('301 Moved')) {
    return {
      error: '上游返回了 HTML（多为 HTTP/HTTPS 或地址错误），非 TTS JSON',
      preview: buf.toString('utf8').slice(0, 200)
    }
  }
  let objects
  try {
    objects = extractJsonObjectsFromTtsStream(buf)
  } catch (e) {
    return { error: '解析 TTS 响应 JSON 失败: ' + e.message }
  }
  if (!objects.length) {
    return { error: 'TTS 响应中未解析到任何 JSON 对象', preview: buf.toString('utf8').slice(0, 200) }
  }
  const flat = []
  for (const o of objects) {
    if (Array.isArray(o)) {
      for (const x of o) flat.push(x)
    } else {
      flat.push(o)
    }
  }
  const pcmChunks = []
  let upstreamMsg = ''
  for (const obj of flat) {
    if (obj == null || typeof obj !== 'object') continue
    if (obj.code != null && obj.code !== 0) {
      upstreamMsg = obj.message || String(obj.code)
    }
    if (obj.data && typeof obj.data === 'string' && obj.data.length > 0) {
      try {
        pcmChunks.push(Buffer.from(obj.data, 'base64'))
      } catch {
        /* ignore bad chunk */
      }
    }
  }
  const audioBuffer = Buffer.concat(pcmChunks)
  if (audioBuffer.length < 64) {
    return {
      error: upstreamMsg || '解析后音频数据过短（可能仍按二进制处理响应，或上游仅返回元数据）',
      preview: buf.toString('utf8').slice(0, 300)
    }
  }
  return { audioBuffer }
}

// ===================================================
//  豆包语音识别 (ASR) — POST /api/asr
//  说明：浏览器 WebM/Opus 与流式 ASR 二进制协议需单独对接；此处先返回占位，
//  避免错误 WebSocket 导致进程双写响应崩溃。后续可接大模型录音文件识别 HTTP API。
// ===================================================
app.post('/api/asr', async (req, res) => {
  if (!req.body || req.body.length === 0) {
    return res.status(400).json({ success: false, error: '音频数据为空' })
  }

  console.warn('[ASR] 当前未对接火山 ASR（浏览器 WebM 需转码或走录音文件识别 HTTP API）')
  return res.json({
    success: false,
    text: '',
    error: '当前项目已改为浏览器原生语音识别，请直接在前端调用浏览器识别能力。'
  })
})

// ===================================================
//  豆包语音合成 (TTS) — POST /api/tts
//  使用 V3 HTTP Chunked 一次性合成：https://openspeech.bytedance.com/api/v3/tts/unidirectional
//  适用于：语音合成大模型 2.0（seed-tts-2.0）、声音复刻 2.0（seed-icl-2.0）
//  响应为 HTTP Chunked：每段为 JSON，data 字段为 base64 音频片段，需解码后拼接（非原始 MP3 流）
// ===================================================
app.post('/api/tts', async (req, res) => {
  const {
    VOLC_SPEECH_API_KEY,
    DOUBAO_APP_ID,
    DOUBAO_VOICE_TYPE,
    DOUBAO_VOICE_TYPE_EN,
    DOUBAO_TTS_CLUSTER,
    DOUBAO_TTS_SPEED,
    DOUBAO_TTS_PITCH,
    DOUBAO_TTS_RESOURCE_ID,
    DOUBAO_TTS_SATURN_MODEL,
    DOUBAO_TTS_RESOURCE_ID_SATURN
  } = process.env
  const { text, lang, voice_type: bodyVoiceType, resource_id: bodyResourceId, model: bodyModel } = req.body || {}

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ success: false, error: 'text 参数无效' })
  }

  if (!VOLC_SPEECH_API_KEY || !DOUBAO_APP_ID) {
    return res.status(500).json({ success: false, error: 'VOLC_SPEECH_API_KEY 或 DOUBAO_APP_ID 未配置' })
  }

  // 文本长度限制 1024 字节
  const textTrim = text.trim().slice(0, 1024)
  const reqid = uuidv4()
  const cluster = DOUBAO_TTS_CLUSTER || 'volcano_tts'
  // 默认音色须与 DOUBAO_TTS_RESOURCE_ID（seed-tts-2.0）在控制台「语音合成模型 2.0」列表中一致
  const defaultZh = 'saturn_zh_female_cancan_tob'
  const defaultEn = 'en_male_tim_uranus_bigtts'
  const voiceType = bodyVoiceType || ((lang === 'en')
    ? (DOUBAO_VOICE_TYPE_EN || defaultEn)
    : (DOUBAO_VOICE_TYPE || defaultZh))
  const isSaturnVoice = /^saturn_/i.test(String(voiceType))

  // saturn_ 前缀 = 声音复刻 2.0 音色，配 seed-icl-2.0；其余用环境变量指定的 resource
  const defaultResource = DOUBAO_TTS_RESOURCE_ID || 'seed-tts-2.0'
  const saturnResource = DOUBAO_TTS_RESOURCE_ID_SATURN || 'seed-icl-2.0'
  let resourceId = bodyResourceId || (isSaturnVoice ? saturnResource : defaultResource)

  // saturn_ 音色须带 model（expressive 表现力强 / standard 更稳）；其余不带
  const saturnModel = bodyModel || DOUBAO_TTS_SATURN_MODEL || 'seed-tts-2.0-expressive'
  const speakerInReqParams = isSaturnVoice
    ? voiceType
    : voiceType  // 非 saturn 也放 req_params（V3 HTTP 推荐用法）

  // V3 HTTP 请求体结构（参考官方 docs.byteplus.com/en/docs/byteplusvoice/unidirectional_tts_http）
  const payload = {
    app: {
      appid: String(DOUBAO_APP_ID),
      token: VOLC_SPEECH_API_KEY,
      cluster
    },
    user: { uid: 'archiweb-zhuling' },
    req_params: {
      reqid,
      text: textTrim,
      text_type: 'plain',
      operation: 'submit',
      speaker: voiceType,          // V3 用 speaker 而非 audio.voice_type
      ...(isSaturnVoice ? { model: saturnModel } : {})
    },
    audio: {
      encoding: 'mp3',
      speed_ratio: parseFloat(DOUBAO_TTS_SPEED) || 1.0,
      volume_ratio: 1.0,
      pitch_ratio: parseFloat(DOUBAO_TTS_PITCH) || 1.0
    }
  }

  try {
    // V3 使用 HTTPS + Chunked；必须用 https 模块（用 http 会打到 80 端口拿到 301 HTML，导致 502）
    const { URL } = require('url')
    const parsedUrl = new URL('https://openspeech.bytedance.com/api/v3/tts/unidirectional')
    const https = require('https')

    const bodyStr = JSON.stringify(payload)

    // ========== 调试日志：打印实际发往上流的完整请求内容 ==========
    console.log('========== TTS 调试信息 ==========')
    console.log('[header] X-Api-Resource-Id:', resourceId)
    console.log('[header] X-Api-App-Id:', DOUBAO_APP_ID)
    console.log('[header] X-Api-Access-Key:', VOLC_SPEECH_API_KEY ? VOLC_SPEECH_API_KEY.slice(0, 8) + '...' : '(空)')
    console.log('[body]   req_params.speaker:', payload.req_params.speaker)
    console.log('[body]   req_params.model:', payload.req_params.model || '(无)')
    console.log('[body]   audio.encoding:', payload.audio.encoding)
    console.log('[body]   app.cluster:', payload.app.cluster)
    console.log('完整请求体:', JSON.stringify(payload, null, 2))
    console.log('===================================')
    console.log('===================================')

    const httpOptions = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        'Authorization': `Bearer;${VOLC_SPEECH_API_KEY}`,
        'X-Api-App-Id': String(DOUBAO_APP_ID),
        'X-Api-Access-Key': VOLC_SPEECH_API_KEY,
        'X-Api-Resource-Id': resourceId,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
        'Accept-Encoding': 'identity'
      },
      timeout: 60000
    }

    const audioChunks = []
    const zlib = require('zlib')

    const result = await new Promise((resolve, reject) => {
      const req = https.request(httpOptions, ( upstreamRes ) => {
        if (upstreamRes.statusCode !== 200) {
          let bodyText = ''
          upstreamRes.on('data', (chunk) => { bodyText += chunk.toString() })
          upstreamRes.on('end', () => {
            resolve({ status: upstreamRes.statusCode, body: bodyText, isBinary: false })
          })
          return
        }

        upstreamRes.on('data', (chunk) => {
          audioChunks.push(chunk)
        })

        upstreamRes.on('end', () => {
          let raw = Buffer.concat(audioChunks)
          const enc = (upstreamRes.headers['content-encoding'] || '').toLowerCase()
          if (enc.includes('gzip')) {
            try {
              raw = zlib.gunzipSync(raw)
            } catch (e) {
              resolve({
                status: 200,
                isBinary: false,
                parseError: 'TTS 响应 gzip 解压失败：' + e.message
              })
              return
            }
          }
          const parsed = volcV3ChunkedBodyToAudioBuffer(raw)
          if (parsed.error) {
            resolve({
              status: 200,
              isBinary: false,
              parseError: parsed.error,
              preview: parsed.preview
            })
            return
          }
          resolve({ status: 200, audioBuffer: parsed.audioBuffer, isBinary: true })
        })
      })

      req.on('error', reject)
      req.on('timeout', () => { req.destroy(); reject(new Error('TTS 请求超时')) })
      req.write(bodyStr)
      req.end()
    })

    if (!result.isBinary) {
      if (result.parseError) {
        console.error('[TTS V3 解析]', result.parseError, (result.preview || '').slice(0, 300))
        const pe = result.parseError || ''
        const mismatch = /mismatched|55000000|resource ID/i.test(pe)
        return res.status(502).json({
          success: false,
          error: 'TTS 响应解析失败：' + pe.slice(0, 200),
          upstreamMessage: (result.preview || '').slice(0, 500),
          ...(mismatch
            ? {
                hint: '① voice_type 以 saturn_ 开头时，请求体必须带 model（本服务已自动加 seed-tts-2.0-expressive，可通过 DOUBAO_TTS_SATURN_MODEL 或 POST body.model 调整）。② X-Api-Resource-Id 须为控制台已开通的大模型2.0（默认 seed-tts-2.0）；复刻音色用 seed-icl-2.0。③ 若仍失败可设 DOUBAO_TTS_RESOURCE_ID_SATURN=seed-tts-2.0-expressive 仅作用于 saturn_ 音色。'
              }
            : {})
        })
      }
      let errMsg = result.body
      try { errMsg = JSON.parse(result.body)?.message || result.body } catch {}
      console.error('[TTS V3 HTTP]', result.status, errMsg.slice(0, 300))
      return res.status(502).json({
        success: false,
        error: 'TTS 请求失败：' + errMsg.slice(0, 200),
        upstreamStatus: result.status,
        upstreamMessage: errMsg.slice(0, 500)
      })
    }

    if (!result.audioBuffer || result.audioBuffer.length === 0) {
      return res.status(500).json({ success: false, error: 'TTS 返回了空音频' })
    }

    const audioB64 = result.audioBuffer.toString('base64')
    console.log(`[TTS] 合成成功 reqid=${reqid} audio_bytes=${result.audioBuffer.length}`)
    return res.json({
      success: true,
      audio: audioB64,
      reqid,
      format: 'mp3'
    })
  } catch (err) {
    console.error('[TTS Error]', err.message)
    return res.status(500).json({ success: false, error: err.message || 'TTS 请求失败' })
  }
})

// ===================================================
//  健康检查
// ===================================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!(process.env.ARK_API_KEY),
    hasSpeechKey: !!process.env.VOLC_SPEECH_API_KEY,
    hasAppId: !!process.env.DOUBAO_APP_ID,
    timestamp: new Date().toISOString()
  })
})

// ===================================================
//  启动
// ===================================================
app.listen(PORT, () => {
  console.log(`\n  ==============================================`)
  console.log(`  筑灵 API 服务已启动`)
  console.log(`  端口: http://localhost:${PORT}`)
  console.log(`  API Key: ${API_KEY ? '已配置 ✓' : '未配置 ✗'}`)
  console.log(`  ==============================================`)
  console.log(`  GET  /api/suggestions?buildingId=xxx`)
  console.log(`  POST /api/chat`)
  console.log(`  GET  /api/health`)
  console.log(`  ==============================================\n`)
})
