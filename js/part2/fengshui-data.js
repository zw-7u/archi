/* ============================================================
 *  fengshui-data.js  —  风水格局模块数据层
 *  四主题 · 13 热区 · 八卦联动 · 气脉五维 · 汉学解析
 * ============================================================ */

// ── 主题与 overlay / 热区映射 ──────────────────────────────

const FENGSHUI_THEME_ORDER = ['front', 'water', 'guard', 'back']

const FENGSHUI_THEMES = {
  front: {
    id: 'front',
    titleZh: '前场明堂',
    titleEn: 'Open Forecourt',
    subtitleZh: '开阔前场，纳势入宫',
    subtitleEn: 'A wide forecourt that gathers momentum into the palace',
    color: '#c9a84c',
    colorSoft: 'rgba(201,168,76,0.18)',
    /** 需要显示的 visual overlay id */
    overlays: ['overlay-front-fan', 'overlay-front-axis-guide', 'overlay-core-glow'],
    /** 弱显示 */
    overlaysDim: [],
    /** 需要隐藏的 visual overlay id */
    overlaysHide: ['overlay-left-guard', 'overlay-right-guard', 'overlay-back-support', 'overlay-inner-calm', 'overlay-water-curve', 'overlay-water-ripple', 'overlay-back-axis-band'],
    /** 当前主题可点击的热区 */
    hotspots: ['hit-front-outer', 'hit-front-middle', 'hit-front-core-link'],
    descZh: '前场明堂代表故宫南部的开阔纳势区域。从天安门到午门广场，空间由窄到宽逐步展开，形成"聚气纳势"的进入体验。明堂宽阔是帝王吉壤的首要条件——前方开阔，气势汇聚，才能承载宫城之重。',
    descEn: 'The Open Forecourt represents the southern approach where space broadens progressively from the gate toward the palace, gathering momentum and energy — a primary requirement for an auspicious imperial site.',
    statusItems: [
      { labelZh: '开阔纳势', labelEn: 'Broad & gathering', color: '#c9a84c' },
      { labelZh: '由外入内', labelEn: 'Outside inward', color: '#d6b16d' },
      { labelZh: '明堂聚气', labelEn: 'Forecourt energy', color: '#8a7453' },
    ],
  },
  water: {
    id: 'water',
    titleZh: '水脉导气',
    titleEn: 'Water Channels',
    subtitleZh: '借水导势，缓冲入宫',
    subtitleEn: 'Water guides energy inward with buffered momentum',
    color: '#4ca8c9',
    colorSoft: 'rgba(76,168,201,0.18)',
    overlays: ['overlay-water-curve', 'overlay-water-ripple', 'overlay-core-glow'],
    overlaysDim: ['overlay-front-fan'],
    overlaysHide: ['overlay-left-guard', 'overlay-right-guard', 'overlay-back-support', 'overlay-inner-calm', 'overlay-front-axis-guide', 'overlay-back-axis-band'],
    hotspots: ['hit-water-entry', 'hit-water-middle', 'hit-water-converge'],
    descZh: '金水河自西北蜿蜒入宫，横贯太和门前，再向东南流出。水脉不走直线，意在"曲水有情"——缓冲外来气势，使能量在宫城内部得到收束与转化，最终汇聚于核心殿宇区。',
    descEn: 'The Golden Water River winds from the northwest across the forecourt and exits southeast. Its curving path buffers incoming energy, allowing it to settle and converge within the palace core.',
    statusItems: [
      { labelZh: '曲水有情', labelEn: 'Winding water', color: '#4ca8c9' },
      { labelZh: '导流缓冲', labelEn: 'Flow buffering', color: '#7ec8d8' },
      { labelZh: '聚气转化', labelEn: 'Energy convergence', color: '#5aad6a' },
    ],
  },
  guard: {
    id: 'guard',
    titleZh: '左右护持',
    titleEn: 'Bilateral Guard',
    subtitleZh: '两翼拱卫，中枢得稳',
    subtitleEn: 'Flanking wings protect and stabilize the central axis',
    color: '#8b6ecf',
    colorSoft: 'rgba(139,110,207,0.18)',
    overlays: ['overlay-left-guard', 'overlay-right-guard', 'overlay-core-glow'],
    overlaysDim: [],
    overlaysHide: ['overlay-front-fan', 'overlay-front-axis-guide', 'overlay-water-curve', 'overlay-water-ripple', 'overlay-back-support', 'overlay-inner-calm', 'overlay-back-axis-band'],
    hotspots: ['hit-east-guard', 'hit-west-guard', 'hit-east-inner', 'hit-west-inner'],
    descZh: '故宫东西两侧的建筑群（东六宫、西六宫、文华殿、武英殿等）构成对中轴的"护持"格局。风水中称"左青龙、右白虎"，两翼须均衡拱卫，核心才能稳固不倾。',
    descEn: 'The eastern and western building clusters form a bilateral guard — the Azure Dragon on the left and the White Tiger on the right — whose balance stabilizes the central axis.',
    statusItems: [
      { labelZh: '青龙白虎', labelEn: 'Dragon & Tiger', color: '#8b6ecf' },
      { labelZh: '对称拱卫', labelEn: 'Symmetric guard', color: '#a78edb' },
      { labelZh: '中枢得稳', labelEn: 'Stable core', color: '#6a5aad' },
    ],
  },
  back: {
    id: 'back',
    titleZh: '后靠聚势',
    titleEn: 'Rear Mountain Support',
    subtitleZh: '后场收束，格局有靠',
    subtitleEn: 'The northern rear anchors and concludes the spatial pattern',
    color: '#5aad6a',
    colorSoft: 'rgba(90,173,106,0.18)',
    overlays: ['overlay-inner-calm', 'overlay-back-support', 'overlay-back-axis-band', 'overlay-core-glow'],
    overlaysDim: [],
    overlaysHide: ['overlay-front-fan', 'overlay-front-axis-guide', 'overlay-water-curve', 'overlay-water-ripple', 'overlay-left-guard', 'overlay-right-guard'],
    hotspots: ['hit-inner-calm', 'hit-rear-garden', 'hit-rear-gate'],
    descZh: '故宫北部以景山为靠、以御花园和钦安殿为收束，形成"有靠则稳"的后方格局。从内廷核心到神武门，空间逐步收敛，由动归静，是整个宫城气场的终点锚定。',
    descEn: 'Prospect Hill backs the northern end while the Imperial Garden and Gate of Divine Might close the sequence — the pattern concludes from motion to stillness, anchoring the palace energy.',
    statusItems: [
      { labelZh: '景山为靠', labelEn: 'Mountain backing', color: '#5aad6a' },
      { labelZh: '收束归静', labelEn: 'Gathering to rest', color: '#7bc48a' },
      { labelZh: '稳势锚定', labelEn: 'Anchor grounding', color: '#8a7453' },
    ],
  },
}

// ── 13 热区详情 ────────────────────────────────────────────

const FENGSHUI_HOTSPOTS = {
  'hit-front-outer': {
    theme: 'front',
    titleZh: '前场外缘区',
    titleEn: 'Outer Forecourt',
    roleZh: '进入宫城前的最外层纳势区域',
    roleEn: 'The outermost energy-gathering zone before entering the palace',
    descZh: '从天安门到午门之间的广阔空间，承担外势进入的第一层缓冲。开阔的尺度让来者感受到由小变大的空间放大，是"明堂宽阔"的直接体现。',
    descEn: 'The vast space from Tiananmen to the Meridian Gate serves as the first buffer, amplifying the visitor\'s sense of scale — a direct manifestation of the "wide forecourt" principle.',
    keywordsZh: ['外场', '纳势', '进入'],
    keywordsEn: ['Outer approach', 'Energy gathering', 'Entry'],
  },
  'hit-front-middle': {
    theme: 'front',
    titleZh: '前场中段区',
    titleEn: 'Middle Forecourt',
    roleZh: '午门广场到太和门之间的过渡带',
    roleEn: 'The transitional zone between the Meridian Gate plaza and the Gate of Supreme Harmony',
    descZh: '穿过午门后空间骤然开阔，金水桥横列其间。这一段是外场到内场的关键过渡，气势在此完成第一次转化——从开阔到收束。',
    descEn: 'After passing through the Meridian Gate, space suddenly opens up with the Golden Water Bridges stretching across — a critical transition where energy first transforms from expansion to focus.',
    keywordsZh: ['过渡', '转化', '金水桥'],
    keywordsEn: ['Transition', 'Transformation', 'Golden Water Bridge'],
  },
  'hit-front-core-link': {
    theme: 'front',
    titleZh: '前场核心连接区',
    titleEn: 'Forecourt Core Link',
    roleZh: '前场与宫城核心之间的气脉通道',
    roleEn: 'The energy channel linking the forecourt to the palace core',
    descZh: '太和门至太和殿之间的窄长院落，是前场开阔空间向核心殿宇过渡的最后一段。空间急剧收窄，把积聚的气势压缩送入三大殿区域。',
    descEn: 'The narrow court between the Gate and Hall of Supreme Harmony compresses the gathered momentum and channels it into the central hall complex.',
    keywordsZh: ['压缩', '连接', '通道'],
    keywordsEn: ['Compression', 'Link', 'Channel'],
  },
  'hit-water-entry': {
    theme: 'water',
    titleZh: '水脉入口区',
    titleEn: 'Water Entry Zone',
    roleZh: '金水河进入宫城的第一段',
    roleEn: 'The first stretch where the Golden Water River enters the palace',
    descZh: '金水河从宫城西北角引入，水脉在此段由开阔逐步收束。入口段的水量最大、流速最快，承担着"引气入宫"的角色。',
    descEn: 'The Golden Water River enters from the northwest corner with the greatest flow, serving as the initial energy conduit into the palace.',
    keywordsZh: ['引水', '入口', '导气'],
    keywordsEn: ['Water entry', 'Intake', 'Energy guide'],
  },
  'hit-water-middle': {
    theme: 'water',
    titleZh: '水脉中段区',
    titleEn: 'Water Middle Section',
    roleZh: '金水河横贯太和门前的弧形段',
    roleEn: 'The arcing stretch where the river crosses before the Gate of Supreme Harmony',
    descZh: '河道在太和门前呈玉带形弯曲，"曲水有情"的核心就在这段。弧形水道减缓流速、缓冲外来气势，使能量在此完成方向转化。',
    descEn: 'The jade-belt curve before the Gate of Supreme Harmony embodies the "winding water with feeling" principle — slowing flow and redirecting energy.',
    keywordsZh: ['曲水', '缓冲', '转向'],
    keywordsEn: ['Curved water', 'Buffer', 'Redirection'],
  },
  'hit-water-converge': {
    theme: 'water',
    titleZh: '水脉汇聚区',
    titleEn: 'Water Convergence',
    roleZh: '水脉收束汇入核心区的关键节点',
    roleEn: 'Where water energy converges and feeds into the palace core',
    descZh: '金水河在流经核心殿宇区后逐渐收束，水势从流动转为静聚。这一段代表"得水为上"的终极表达——水不外泄而向心汇聚。',
    descEn: 'After flowing past the core halls, the river gradually converges inward — the ultimate expression of "water retention as supreme" in feng shui.',
    keywordsZh: ['汇聚', '聚气', '得水'],
    keywordsEn: ['Convergence', 'Energy gathering', 'Water retention'],
  },
  'hit-east-guard': {
    theme: 'guard',
    titleZh: '东侧外护区',
    titleEn: 'Eastern Outer Guard',
    roleZh: '东六宫、文华殿等东侧建筑群',
    roleEn: 'The eastern building cluster including the Eastern Six Palaces and Wenhua Hall',
    descZh: '宫城东侧的大面积建筑群形成"青龙"拱卫。东方属木，主生长与文治，文华殿作为经筵之所恰好呼应了这一方位属性。',
    descEn: 'The eastern cluster forms the Azure Dragon guard. East corresponds to wood and civil learning — Wenhua Hall\'s scholarly function echoes this directional attribute.',
    keywordsZh: ['青龙', '东护', '文治'],
    keywordsEn: ['Azure Dragon', 'East guard', 'Civil order'],
  },
  'hit-west-guard': {
    theme: 'guard',
    titleZh: '西侧外护区',
    titleEn: 'Western Outer Guard',
    roleZh: '西六宫、武英殿等西侧建筑群',
    roleEn: 'The western building cluster including the Western Six Palaces and Wuying Hall',
    descZh: '宫城西侧的建筑群构成"白虎"拱卫。西方属金，主肃杀与武备，武英殿作为武事议政之所呼应了这一方位逻辑。',
    descEn: 'The western cluster forms the White Tiger guard. West corresponds to metal and martial discipline — Wuying Hall\'s function aligns with this directional logic.',
    keywordsZh: ['白虎', '西护', '武备'],
    keywordsEn: ['White Tiger', 'West guard', 'Martial order'],
  },
  'hit-east-inner': {
    theme: 'guard',
    titleZh: '东侧内护区',
    titleEn: 'Eastern Inner Guard',
    roleZh: '靠近中轴的东侧内层护卫区',
    roleEn: 'The inner eastern layer closer to the central axis',
    descZh: '东六宫内侧紧贴中轴区域的建筑，作为核心殿宇的贴身护卫层。内护区比外护区更紧密地包裹中轴，形成多重围合。',
    descEn: 'The inner eastern buildings wrap tightly around the axis, adding a second layer of enclosure beyond the outer guard.',
    keywordsZh: ['内护', '围合', '贴身'],
    keywordsEn: ['Inner guard', 'Enclosure', 'Close protection'],
  },
  'hit-west-inner': {
    theme: 'guard',
    titleZh: '西侧内护区',
    titleEn: 'Western Inner Guard',
    roleZh: '靠近中轴的西侧内层护卫区',
    roleEn: 'The inner western layer closer to the central axis',
    descZh: '西六宫内侧与养心殿周边区域，是核心殿宇西侧的贴身拱卫。与东侧内护对称呼应，共同完成对中枢的多层包裹。',
    descEn: 'The inner western buildings near the Hall of Mental Cultivation mirror the east, completing multi-layered wrapping of the core.',
    keywordsZh: ['内护', '对称', '多层'],
    keywordsEn: ['Inner guard', 'Symmetry', 'Multi-layer'],
  },
  'hit-inner-calm': {
    theme: 'back',
    titleZh: '内场安定区',
    titleEn: 'Inner Calm Zone',
    roleZh: '内廷核心区域的静定空间',
    roleEn: 'The stabilized space at the heart of the inner court',
    descZh: '乾清宫到坤宁宫之间的内廷核心，是宫城由动入静的转折点。空间尺度收敛、庭院围合加强，形成"内场安定"的气场特征。',
    descEn: 'The inner court between the Palace of Heavenly Purity and the Palace of Earthly Tranquility marks the shift from dynamic to still — enclosed courts create a settled energy field.',
    keywordsZh: ['安定', '收敛', '内静'],
    keywordsEn: ['Stability', 'Contraction', 'Inner stillness'],
  },
  'hit-rear-garden': {
    theme: 'back',
    titleZh: '后苑收束区',
    titleEn: 'Rear Garden Closure',
    roleZh: '御花园与钦安殿的终场空间',
    roleEn: 'The Imperial Garden and Qin\'an Hall area that concludes the palace sequence',
    descZh: '御花园不是休闲附属，而是宫城气脉的收束器。钦安殿供奉真武大帝（北方水神），以水镇火、以静收动，是风水格局由南到北的倒数第二个锚点。',
    descEn: 'The Imperial Garden is not mere recreation but an energy collector. Qin\'an Hall enshrines the Northern Water Deity — using water to temper fire and stillness to conclude motion.',
    keywordsZh: ['御花园', '收束', '水镇'],
    keywordsEn: ['Imperial Garden', 'Closure', 'Water grounding'],
  },
  'hit-rear-gate': {
    theme: 'back',
    titleZh: '后门终局区',
    titleEn: 'Northern Gate Terminus',
    roleZh: '神武门与景山连接的格局终点',
    roleEn: 'The Gate of Divine Might anchoring the pattern against Prospect Hill',
    descZh: '神武门作为宫城北端出口，与景山形成"靠山"关系。整个风水格局从南部明堂开始、经水脉导入、两翼护持，最终在北部景山处完成"有靠"的终极锚定。',
    descEn: 'The Gate of Divine Might and Prospect Hill form the final "backing mountain" anchor — completing the feng shui pattern from the southern forecourt through water and wings to the northern terminus.',
    keywordsZh: ['神武门', '景山', '终局'],
    keywordsEn: ['Divine Might Gate', 'Prospect Hill', 'Terminus'],
  },
}

// ── 八卦格局区联动数据 ────────────────────────────────────

const FENGSHUI_BAGUA_MAP = {
  // 主题级 bagua
  front: { active: ['south', 'center'], flow: 'southToCenter', labelZh: '南向纳势', labelEn: 'Southern gathering' },
  water: { active: ['south', 'center'], flow: 'curveToCenter', labelZh: '水脉导入', labelEn: 'Water guidance' },
  guard: { active: ['east', 'west', 'center'], flow: 'eastWestWrap', labelZh: '左右拱卫', labelEn: 'Bilateral guard' },
  back:  { active: ['north', 'center'], flow: 'northToCenter', labelZh: '北靠聚势', labelEn: 'Northern anchor' },
  // 热区级 bagua（覆盖主题级）
  'hit-front-outer':     { active: ['south'], flow: 'southToCenter', labelZh: '南外缘', labelEn: 'South outer' },
  'hit-front-middle':    { active: ['south', 'center'], flow: 'southToCenter', labelZh: '南中段', labelEn: 'South mid' },
  'hit-front-core-link': { active: ['south', 'center'], flow: 'southToCenter', labelZh: '南核心连接', labelEn: 'South core link' },
  'hit-water-entry':     { active: ['south'], flow: 'curveToCenter', labelZh: '水入口', labelEn: 'Water entry' },
  'hit-water-middle':    { active: ['south', 'center'], flow: 'curveToCenter', labelZh: '水中段', labelEn: 'Water mid' },
  'hit-water-converge':  { active: ['center'], flow: 'curveToCenter', labelZh: '水汇聚', labelEn: 'Water converge' },
  'hit-east-guard':      { active: ['east', 'center'], flow: 'eastWestWrap', labelZh: '东外护', labelEn: 'East outer' },
  'hit-west-guard':      { active: ['west', 'center'], flow: 'eastWestWrap', labelZh: '西外护', labelEn: 'West outer' },
  'hit-east-inner':      { active: ['east', 'center'], flow: 'eastWestWrap', labelZh: '东内护', labelEn: 'East inner' },
  'hit-west-inner':      { active: ['west', 'center'], flow: 'eastWestWrap', labelZh: '西内护', labelEn: 'West inner' },
  'hit-inner-calm':      { active: ['center'], flow: 'northToCenter', labelZh: '内场安定', labelEn: 'Inner calm' },
  'hit-rear-garden':     { active: ['north', 'center'], flow: 'northToCenter', labelZh: '后苑', labelEn: 'Rear garden' },
  'hit-rear-gate':       { active: ['north'], flow: 'northToCenter', labelZh: '后门终局', labelEn: 'Northern gate' },
}

// ── 气脉五维数据 [开阔度, 导流性, 围合度, 稳势值, 聚势值] ──

const FENGSHUI_QI_LABELS_ZH = ['开阔度', '导流性', '围合度', '稳势值', '聚势值']
const FENGSHUI_QI_LABELS_EN = ['Openness', 'Flow', 'Enclosure', 'Stability', 'Gathering']

/** 主题级五维均值 */
const FENGSHUI_QI_THEME = {
  front: [78, 53, 25, 35, 42],
  water: [42, 87, 27, 37, 57],
  guard: [23, 23, 83, 80, 53],
  back:  [20, 15, 55, 83, 72],
}

/** 热区级五维值 */
const FENGSHUI_QI_HOTSPOT = {
  'hit-front-outer':     [90, 45, 20, 30, 25],
  'hit-front-middle':    [80, 55, 25, 35, 40],
  'hit-front-core-link': [65, 60, 30, 40, 60],
  'hit-water-entry':     [50, 80, 20, 30, 35],
  'hit-water-middle':    [40, 95, 25, 35, 55],
  'hit-water-converge':  [35, 85, 35, 45, 80],
  'hit-east-guard':      [25, 20, 85, 75, 45],
  'hit-west-guard':      [25, 20, 85, 75, 45],
  'hit-east-inner':      [20, 25, 80, 85, 60],
  'hit-west-inner':      [20, 25, 80, 85, 60],
  'hit-inner-calm':      [20, 15, 50, 75, 70],
  'hit-rear-garden':     [25, 20, 55, 80, 65],
  'hit-rear-gate':       [15, 10, 60, 95, 80],
}

// ── 所有 visual / hit ID ──────────────────────────────────

const FENGSHUI_VISUAL_IDS = [
  'overlay-front-fan',
  'overlay-front-axis-guide',
  'overlay-water-curve',
  'overlay-water-ripple',
  'overlay-left-guard',
  'overlay-right-guard',
  'overlay-inner-calm',
  'overlay-back-support',
  'overlay-core-glow',
  'overlay-back-axis-band',
]

const FENGSHUI_HIT_IDS = [
  'hit-front-outer',
  'hit-front-middle',
  'hit-front-core-link',
  'hit-water-entry',
  'hit-water-middle',
  'hit-water-converge',
  'hit-east-guard',
  'hit-west-guard',
  'hit-east-inner',
  'hit-west-inner',
  'hit-inner-calm',
  'hit-rear-garden',
  'hit-rear-gate',
]
