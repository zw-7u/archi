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
    tips: '中国古建筑遵循严格的礼制秩序，以中轴线为中心对称布局。色彩、屋顶形制、脊兽数量都反映了建筑等级。'
  },
  wumen: {
    name: '午门',
    nameEn: 'Meridian Gate (Wumen)',
    description: '紫禁城正门，五座门楼呈"凹"字形排列，中央门楼重檐歇山顶，两侧夹庭各三间。午门是皇帝举行重大典礼的地方，也是清代献俘仪式的场所。',
    descriptionEn: 'The main southern gate of the Forbidden City, with five towers in a "concave" arrangement. The central tower has a double-eaved Xieshan roof. Major ceremonies and prisoner-presenting rituals were held here.',
    tips: '午门的"凹"字形设计源于古代"阙"制，中间开门为皇帝专用，文武官员走两侧掖门。这种不对称中求对称的布局体现了皇权的绝对中心地位。'
  },
  taihedian: {
    name: '太和殿',
    nameEn: 'Hall of Supreme Harmony (Taihedian)',
    description: '紫禁城外朝三大殿核心，明清皇帝举行登基、大婚、册封等重大典礼之所。殿身高8.13米，为全国古建筑之最。屋顶为重檐庑殿顶（最高等级），脊兽10只（古建筑最高数量）。',
    descriptionEn: 'The core of the Outer Court, where major ceremonies like enthronement were held. At 8.13m high, it is the tallest ancient building in China. It has the highest-ranked double-eaved hip roof and 10 roof ridge beasts (the maximum allowed).',
    tips: '太和殿前的广场没有一棵树，是为了烘托皇权的威严和"普天之下"的至高无上感。金砖（高质量细料砖）敲击有金属声，故名"金砖"。殿内宝座后的屏风绘有"锦绣山河"图，象征江山永固。'
  },
  dongliugong: {
    name: '东六宫',
    nameEn: 'Six Eastern Palaces (Dongliugong)',
    description: '紫禁城后廷主体建筑群，位于中轴线东侧，由六座独立的宫殿组成：景仁宫、承乾宫、钟粹宫、景阳宫、永和宫、延禧宫。明清时期为后妃居所。',
    descriptionEn: 'Six independent palace buildings on the eastern side of the Inner Court, used as living quarters for imperial consorts during the Ming and Qing dynasties.',
    tips: '东六宫的布局采用了"东西六宫，乾五巽一"的方位理念，与八卦方位相关。每座宫殿前殿后寝的格局，体现了中国传统院落式建筑的空间秩序。'
  },
  xiliugong: {
    name: '西六宫',
    nameEn: 'Six Western Palaces (Xiliugong)',
    description: '与东六宫对称的宫殿群，位于中轴线西侧，包括永寿宫、太极殿（未建）、长春宫、咸福宫、储秀宫、咸安宫（后改建）。同样为后妃居所。',
    descriptionEn: 'The symmetrical counterpart to the Six Eastern Palaces on the western side, also serving as imperial consort residences with the same architectural layout.',
    tips: '清代慈禧太后曾长期居住在储秀宫，她对宫殿进行了大规模改造。咸福宫则是恭亲王奕訢的起居之所，是清代亲王中唯一入住西六宫的特例。'
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

// ===================================================
//  System Prompt 生成器
// ===================================================
function buildSystemPrompt(buildingId, language) {
  const ctx = BUILDING_CONTEXT[buildingId] || BUILDING_CONTEXT['general']

  const roleDescription = language === 'en'
    ? `You are "筑灵" (Zhù Líng) — a friendly, knowledgeable AI guide specializing in Chinese ancient architecture, specifically the Forbidden City (故宫/Zǐjincheng). You speak primarily in English, with a warm and approachable tone. You are an expert at cross-cultural explanation, making Chinese architectural concepts accessible and engaging for international students and overseas visitors.

Your speaking style:
- Be concise and conversational — avoid dry encyclopedia entries
- Use comparisons to familiar Western architecture/culture when helpful
- Highlight cultural symbolism (colors, numbers, positioning) and explain why it matters to Chinese imperial thinking
- Share interesting stories and little-known facts, not just official history
- Always be welcoming and patient with cultural differences
- When mentioning specific building names, give the Chinese characters in parentheses
- End responses naturally without formal summaries

When responding in English, you may add one brief Chinese annotation (a key term or cultural note) in brackets if especially relevant — but keep it short.`
    : `你是"筑灵"（Zhù Líng）——一位友好、博学的中国古建筑AI导览助手，专精故宫（紫禁城）建筑文化。你以中文为主要回答语言，但保留英文建筑名称。

你的回答风格：
- 简洁、亲切、口语化，避免干巴巴的百科条目
- 善用跨文化对比（与西方建筑/文化类比），让外国游客更易理解
- 重点解释色彩、数字、方位等象征含义，说明其在皇权礼制中的意义
- 分享有趣的小故事和冷知识，而非仅仅陈述官方历史
- 对文化差异保持开放和耐心
- 提及建筑名称时同时给出中英文（如"太和殿 / Hall of Supreme Harmony"）
- 回答自然收尾，不做正式总结

语言约定：language=zh 时以中文回答为主，保留英文名称；language=en 时以英文回答为主，可附简短中文注释。`

  const contextBlock = language === 'en'
    ? `Current context: ${ctx.name} (${ctx.nameEn})

Key facts:
${ctx.descriptionEn}

Cultural insight:
${ctx.tips}

If the user asks about a different building, you may draw general knowledge about the Forbidden City to enrich your answer. If they ask about something unrelated to architecture, gently steer the conversation back to the Forbidden City.`
    : `当前上下文：${ctx.name}（${ctx.nameEn}）

核心信息：
${ctx.description}

文化解读：
${ctx.tips}

如果用户问到其他建筑，可以用故宫的一般知识丰富回答。如果用户问到与建筑无关的内容，请友好地将话题引回故宫建筑。`

  return `${roleDescription}

${contextBlock}

Remember: You represent 筑灵, a scholarly-yet-warm guide companion. Be enthusiastic but not overwhelming. Make every visitor feel like they have a knowledgeable friend walking alongside them through the Forbidden City.`
}

// ===================================================
//  GET /api/suggestions
// ===================================================
app.get('/api/suggestions', (req, res) => {
  const { buildingId = 'general' } = req.query
  const suggestions = SUGGESTIONS_MAP[buildingId] || SUGGESTIONS_MAP['general']

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
      error: 'ARK_API_KEY 未配置，请检查 .env 文件'
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

    const reply = response.data.choices?.[0]?.message?.content?.trim() || '抱歉，暂时无法回答这个问题。'

    // 获取下一组推荐问题
    const suggestions = SUGGESTIONS_MAP[buildingId] || SUGGESTIONS_MAP['general']

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
      reply: '抱歉，服务暂时遇到问题，请稍后再试。'
    })
  }
})

// 火山语音鉴权头：文档要求 "Bearer;${token}"，分号后不要空格
function volcSpeechAuthHeader() {
  const token = process.env.VOLC_SPEECH_API_KEY || ''
  return token ? `Bearer;${token}` : ''
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
    error: '语音识别暂未接入，请使用文字输入。'
  })
})

// ===================================================
//  豆包语音合成 (TTS) — POST /api/tts
//  使用官方 HTTP 一次性合成：https://openspeech.bytedance.com/api/v1/tts
//  请求体为 { "json": "<内层 JSON 字符串>" }，见火山文档与开源示例。
// ===================================================
app.post('/api/tts', async (req, res) => {
  const {
    VOLC_SPEECH_API_KEY,
    DOUBAO_APP_ID,
    DOUBAO_VOICE_TYPE,
    DOUBAO_TTS_CLUSTER,
    DOUBAO_TTS_SPEED,
    DOUBAO_TTS_PITCH
  } = process.env
  const { text } = req.body

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ success: false, error: 'text 参数无效' })
  }

  if (!VOLC_SPEECH_API_KEY || !DOUBAO_APP_ID) {
    return res.status(500).json({ success: false, error: 'VOLC_SPEECH_API_KEY 或 DOUBAO_APP_ID 未配置' })
  }

  // 短文本接口建议单段不超过约 1024 字节
  const textTrim = text.trim().slice(0, 1024)
  const reqid = uuidv4()
  const cluster = DOUBAO_TTS_CLUSTER || 'volcano_tts'
  const voiceType = DOUBAO_VOICE_TYPE || 'BV001_streaming'

  const inner = {
    app: {
      appid: String(DOUBAO_APP_ID),
      token: 'access_token',
      cluster
    },
    user: { uid: 'archiweb-zhuling' },
    audio: {
      voice_type: voiceType,
      encoding: 'mp3',
      speed_ratio: parseFloat(DOUBAO_TTS_SPEED) || 1.0,
      volume_ratio: 1.0,
      pitch_ratio: parseFloat(DOUBAO_TTS_PITCH) || 1.0
    },
    request: {
      reqid,
      text: textTrim,
      text_type: 'plain',
      operation: 'query'
    }
  }

  try {
    const response = await axios.post(
      'https://openspeech.bytedance.com/api/v1/tts',
      { json: JSON.stringify(inner) },
      {
        headers: {
          Authorization: volcSpeechAuthHeader(),
          'Content-Type': 'application/json'
        },
        timeout: 60000,
        validateStatus: () => true
      }
    )

    if (response.status !== 200) {
      console.error('[TTS HTTP]', response.status, response.data)
      return res.status(502).json({
        success: false,
        error: 'TTS 网关异常，请检查密钥与网络'
      })
    }

    const body = response.data
    const code = body && typeof body.code === 'number' ? body.code : -1
    const audioB64 = body && body.data

    if (code !== 3000 || !audioB64) {
      const msg = (body && (body.message || body.Message)) || `合成失败 code=${code}`
      console.error('[TTS API]', body)
      return res.status(500).json({ success: false, error: msg })
    }

    return res.json({
      success: true,
      audio: audioB64,
      reqid,
      format: 'mp3'
    })
  } catch (err) {
    console.error('[TTS Error]', err.response?.data || err.message)
    return res.status(500).json({
      success: false,
      error: err.response?.data?.message || err.message || 'TTS 请求失败'
    })
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
