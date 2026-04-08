/* =====================================================
   js/yinyang-data.js — 阴阳五行 模块数据
   ===================================================== */

/* ---------- 10 个按钮对应的状态 key ---------- */
const YY_BTN_ORDER = [
  'yang', 'yin',                        // 阴阳格局
  'wood', 'fire', 'earth', 'metal', 'water', // 五行方位
  'shengke', 'xiangke', 'waterfire',    // 生克关系
]

const YY_BTN_GROUPS = [
  { groupZh: '阴阳格局', groupEn: 'Yin-Yang Pattern', ids: ['yang', 'yin'] },
  { groupZh: '五行方位', groupEn: 'Five Elements', ids: ['wood', 'fire', 'earth', 'metal', 'water'] },
  { groupZh: '生克关系', groupEn: 'Cycle & Restraint', ids: ['shengke', 'xiangke', 'waterfire'] },
]

/* ---------- 每个按钮的完整数据 ---------- */
const YY_ITEMS = {
  /* ===== 阴阳 ===== */
  yang: {
    id: 'yang',
    mode: 'yinyang',
    labelZh: '外朝阳区', labelEn: 'Outer Court · Yang',
    zoneId: 'zone-yang',                       // SVG path id
    zoneColor: 'rgba(193,120,50,0.22)',
    zoneStroke: 'rgba(220,160,70,0.55)',
    zoneGlow: 'rgba(220,160,70,0.18)',
    dialYinyang: { centerZh: '阳', centerEn: 'Yang', descZh: '外朝开阔，主礼制与朝仪', descEn: 'The outer court is open and bright, hosting ceremony and ritual' },
    dialWuxing:  { centerZh: '火 / 土', centerEn: 'Fire / Earth', descZh: '礼制彰显，皇权居中', descEn: 'Ritual manifest, imperial centrality' },
    card: {
      titleZh: '外朝属阳', titleEn: 'Outer Court — Yang',
      briefZh: '南部外朝空间开阔，主礼制与朝仪', briefEn: 'The open southern court hosts ritual and ceremony',
      bodyZh: '外朝区域位于宫城南部，承担朝会、典礼与礼制展示功能，整体呈现出庄严、光明、刚健的阳性气质。', bodyEn: 'Located in the south, the outer court conveys solemnity, brilliance, and assertive yang energy.',
      tagsZh: ['外朝','阳','礼制','朝仪','皇权'], tagsEn: ['Outer Court','Yang','Ritual','Ceremony','Imperial'],
    },
  },
  yin: {
    id: 'yin',
    mode: 'yinyang',
    labelZh: '内廷阴区', labelEn: 'Inner Court · Yin',
    zoneId: 'zone-yin',
    zoneColor: 'rgba(90,130,160,0.18)',
    zoneStroke: 'rgba(120,165,200,0.45)',
    zoneGlow: 'rgba(120,165,200,0.14)',
    dialYinyang: { centerZh: '阴', centerEn: 'Yin', descZh: '内廷收敛，主起居与和合', descEn: 'The inner court is compact and private' },
    dialWuxing:  { centerZh: '水 / 木 / 金', centerEn: 'Water / Wood / Metal', descZh: '静气内敛，起居和合', descEn: 'Quiet, restrained, harmonious living' },
    card: {
      titleZh: '内廷属阴', titleEn: 'Inner Court — Yin',
      briefZh: '北部内廷空间收敛，主起居与和合', briefEn: 'The compact northern court hosts daily life and harmony',
      bodyZh: '内廷区域位于宫城北部，承担帝后起居与生活功能，整体更偏静谧、内敛、和合，体现故宫空间中的阴性格局。', bodyEn: 'Located in the north, the inner court embodies privacy, gentleness, and yin energy.',
      tagsZh: ['内廷','阴','起居','和合','私密'], tagsEn: ['Inner Court','Yin','Living','Harmony','Private'],
    },
  },

  /* ===== 五行 ===== */
  wood: {
    id: 'wood',
    mode: 'wuxing',
    labelZh: '木', labelEn: 'Wood',
    zoneId: 'zone-wood',
    zoneColor: 'rgba(80,140,90,0.20)',
    zoneStroke: 'rgba(100,170,110,0.55)',
    zoneGlow: 'rgba(100,170,110,0.15)',
    anchorId: 'anchor-wood',
    dialYinyang: { centerZh: '偏阳', centerEn: 'Lean Yang', descZh: '东方生发，气趋向上', descEn: 'East rises, energy ascends' },
    dialWuxing:  { centerZh: '木', centerEn: 'Wood', descZh: '主生长与文运', descEn: 'Growth and literary fortune' },
    card: {
      titleZh: '东方属木', titleEn: 'East — Wood',
      briefZh: '东方主生长、文运与教化', briefEn: 'The east governs growth, culture, and education',
      bodyZh: '东方在五行中属木，象征生机、礼乐与文化气脉，体现出向上、生发的空间意象。', bodyEn: 'Wood in the east symbolises vitality, rites, music, and cultural current.',
      tagsZh: ['东方','木','生长','文运'], tagsEn: ['East','Wood','Growth','Culture'],
    },
  },
  fire: {
    id: 'fire',
    mode: 'wuxing',
    labelZh: '火', labelEn: 'Fire',
    zoneId: 'zone-fire',
    zoneColor: 'rgba(200,100,50,0.20)',
    zoneStroke: 'rgba(220,130,60,0.55)',
    zoneGlow: 'rgba(220,130,60,0.15)',
    anchorId: 'anchor-fire',
    dialYinyang: { centerZh: '阳盛', centerEn: 'Full Yang', descZh: '南方光明，礼序彰显', descEn: 'Southern brightness, ceremony manifest' },
    dialWuxing:  { centerZh: '火', centerEn: 'Fire', descZh: '主光明与威严', descEn: 'Brilliance and majesty' },
    card: {
      titleZh: '南方属火', titleEn: 'South — Fire',
      briefZh: '南方主光明、威严与礼序', briefEn: 'The south governs brilliance, majesty, and ceremony',
      bodyZh: '南方属火，对应外朝礼制空间，强调王朝显赫、光明庄严与皇权展示。', bodyEn: 'Fire in the south matches the outer court, emphasising dynastic power and ceremony.',
      tagsZh: ['南方','火','光明','威严'], tagsEn: ['South','Fire','Brilliance','Majesty'],
    },
  },
  earth: {
    id: 'earth',
    mode: 'wuxing',
    labelZh: '土', labelEn: 'Earth',
    zoneId: 'zone-earth',
    zoneColor: 'rgba(184,138,53,0.22)',
    zoneStroke: 'rgba(200,165,75,0.55)',
    zoneGlow: 'rgba(200,165,75,0.15)',
    anchorId: 'anchor-earth',
    dialYinyang: { centerZh: '中和', centerEn: 'Balance', descZh: '中央居中，统摄四方', descEn: 'The center commands all four directions' },
    dialWuxing:  { centerZh: '土', centerEn: 'Earth', descZh: '主中正与稳固', descEn: 'Centrality and stability' },
    card: {
      titleZh: '中央属土', titleEn: 'Center — Earth',
      briefZh: '中央居中统四方，是宫城核心', briefEn: 'The center governs all, the palace core',
      bodyZh: '中央属土，象征中正、稳定与统摄，是故宫整体空间秩序与皇权中心的核心表达。', bodyEn: 'Earth at the center symbolises balance and stability — the core of the palace order.',
      tagsZh: ['中央','土','中轴','核心','稳定'], tagsEn: ['Center','Earth','Axis','Core','Stability'],
    },
  },
  metal: {
    id: 'metal',
    mode: 'wuxing',
    labelZh: '金', labelEn: 'Metal',
    zoneId: 'zone-metal',
    zoneColor: 'rgba(180,170,150,0.18)',
    zoneStroke: 'rgba(200,190,170,0.50)',
    zoneGlow: 'rgba(200,190,170,0.12)',
    anchorId: 'anchor-metal',
    dialYinyang: { centerZh: '偏阴', centerEn: 'Lean Yin', descZh: '西方肃整，气势内敛', descEn: 'Western austerity, inward energy' },
    dialWuxing:  { centerZh: '金', centerEn: 'Metal', descZh: '主肃整与秩序', descEn: 'Discipline and order' },
    card: {
      titleZh: '西方属金', titleEn: 'West — Metal',
      briefZh: '西方主肃整、武备与秩序', briefEn: 'The west governs discipline, arms, and order',
      bodyZh: '西方在五行中属金，强调规则、收束、纪律与秩序感，体现宫城空间中的整肃气质。', bodyEn: 'Metal in the west emphasises rule, restraint, and orderly composure.',
      tagsZh: ['西方','金','肃整','秩序'], tagsEn: ['West','Metal','Discipline','Order'],
    },
  },
  water: {
    id: 'water',
    mode: 'wuxing',
    labelZh: '水', labelEn: 'Water',
    zoneId: 'zone-water',
    zoneColor: 'rgba(60,100,140,0.20)',
    zoneStroke: 'rgba(80,130,180,0.50)',
    zoneGlow: 'rgba(80,130,180,0.14)',
    anchorId: 'anchor-water',
    dialYinyang: { centerZh: '阴盛', centerEn: 'Full Yin', descZh: '北方润下，静而制火', descEn: 'Northern depth quenches fire' },
    dialWuxing:  { centerZh: '水', centerEn: 'Water', descZh: '主润下与镇火', descEn: 'Depth and fire-quenching' },
    card: {
      titleZh: '北方属水', titleEn: 'North — Water',
      briefZh: '北方主润下、静气与镇火', briefEn: 'The north governs depth, stillness, and fire-quenching',
      bodyZh: '北方属水，象征润下、沉静与防灾观念，在故宫布局中具有镇火、护城与调衡的重要意义。', bodyEn: 'Water in the north symbolises depth, calm, and the protective logic of quenching fire.',
      tagsZh: ['北方','水','镇火','防灾','静气'], tagsEn: ['North','Water','Fire-quench','Protection','Stillness'],
    },
  },

  /* ===== 生克关系 ===== */
  shengke: {
    id: 'shengke',
    mode: 'relation',
    labelZh: '相生流转', labelEn: 'Generating Cycle',
    zoneId: null,
    dialYinyang: { centerZh: '循环', centerEn: 'Cycle', descZh: '五行相生，流转不息', descEn: 'The five elements generate each other endlessly' },
    dialWuxing:  { centerZh: '木→火→土→金→水', centerEn: 'W→F→E→M→Wa', descZh: '相生循环', descEn: 'Generating cycle' },
    card: {
      titleZh: '五行相生', titleEn: 'Generating Cycle',
      briefZh: '木火土金水依次流转', briefEn: 'Wood, fire, earth, metal, water generate in sequence',
      bodyZh: '五行之间形成连续的相生关系，体现故宫空间背后循环、生发与整体秩序的宇宙观。', bodyEn: 'The generating cycle embodies a cosmological order of renewal and continuity.',
      tagsZh: ['相生','循环','流转','秩序'], tagsEn: ['Generating','Cycle','Flow','Order'],
    },
    /** 相生顺序 anchor ids */
    relLines: [
      ['anchor-wood','anchor-fire'],
      ['anchor-fire','anchor-earth'],
      ['anchor-earth','anchor-metal'],
      ['anchor-metal','anchor-water'],
      ['anchor-water','anchor-wood'],
    ],
    relColor: 'rgba(180,140,60,0.7)',
  },
  xiangke: {
    id: 'xiangke',
    mode: 'relation',
    labelZh: '相克制衡', labelEn: 'Restraining Cycle',
    zoneId: null,
    dialYinyang: { centerZh: '制衡', centerEn: 'Restrain', descZh: '相克相制，维持平衡', descEn: 'Restraint keeps equilibrium' },
    dialWuxing:  { centerZh: '木土水火金', centerEn: 'W-E-Wa-F-M', descZh: '相克制衡', descEn: 'Restraining balance' },
    card: {
      titleZh: '五行相克', titleEn: 'Restraining Cycle',
      briefZh: '相克不是冲突，而是制衡', briefEn: 'Restraint is not conflict but balance',
      bodyZh: '五行相克体现的是一种动态平衡机制，通过相互制约维持整体秩序，避免空间意义失衡。', bodyEn: 'The restraining cycle is a dynamic balance preventing any element from dominating.',
      tagsZh: ['相克','制衡','平衡','关系'], tagsEn: ['Restraint','Balance','Equilibrium','Relation'],
    },
    relLines: [
      ['anchor-wood','anchor-earth'],
      ['anchor-earth','anchor-water'],
      ['anchor-water','anchor-fire'],
      ['anchor-fire','anchor-metal'],
      ['anchor-metal','anchor-wood'],
    ],
    relColor: 'rgba(160,80,80,0.65)',
  },
  waterfire: {
    id: 'waterfire',
    mode: 'relation',
    labelZh: '北水镇火', labelEn: 'Water Quenches Fire',
    zoneId: null,
    highlightZones: ['zone-water', 'zone-fire'],
    dialYinyang: { centerZh: '调衡', centerEn: 'Adjust', descZh: '以水制火，寓防灾之智', descEn: 'Water restrains fire — disaster prevention wisdom' },
    dialWuxing:  { centerZh: '水 / 火', centerEn: 'Water / Fire', descZh: '北水制南火', descEn: 'North water subdues south fire' },
    card: {
      titleZh: '北水镇火', titleEn: 'Water Quenches Fire',
      briefZh: '以水制火，体现宫城防灾智慧', briefEn: 'Water subdues fire — palace fire-prevention wisdom',
      bodyZh: '故宫多木构建筑，火灾风险较高，北方水性空间意象与防火观念结合，形成"以水制火"的象征性布局逻辑。', bodyEn: 'The timber palace is fire-prone; the northern water symbolism doubles as protective logic.',
      tagsZh: ['水克火','镇火','防灾','布局智慧'], tagsEn: ['Water-Fire','Quench','Protection','Layout wisdom'],
    },
    relLines: [
      ['anchor-water','anchor-fire'],
    ],
    relColor: 'rgba(80,130,180,0.7)',
  },
}

/* ---------- 五行元素色 ---------- */
const YY_ELEMENT_COLORS = {
  wood:  { fill: 'rgba(80,140,90,0.22)',  stroke: '#5a9a60', text: '#3a6a40' },
  fire:  { fill: 'rgba(200,100,50,0.22)', stroke: '#c86a30', text: '#8a4020' },
  earth: { fill: 'rgba(184,138,53,0.22)', stroke: '#b88a35', text: '#7a5c20' },
  metal: { fill: 'rgba(180,170,150,0.20)',stroke: '#a09880', text: '#6a6050' },
  water: { fill: 'rgba(60,100,140,0.22)', stroke: '#5080b0', text: '#304870' },
}

/** 五行相生顺序（用于动画） */
const YY_SHENG_ORDER = ['wood','fire','earth','metal','water']

/* ---------- 视频 ---------- */
const YY_VIDEO_PATH = 'assets/videos/culture/阴阳五行'
