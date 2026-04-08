/* =====================================================
   js/module2-data.js — 中轴礼序 模块数据
   依赖：data.js (BUILDINGS)
   ===================================================== */

/** 中轴礼序三种视角 */
const AXIS_MODES = {
  ritual: {
    id: 'ritual',
    labelZh: '礼制秩序',
    labelEn: 'Ritual Order',
    descZh: '突出外朝礼制核心建筑',
    descEn: 'Highlight the outer court ritual core',
    defaultRegion: 'taihedian',
    /** 高亮的建筑 id */
    highlightIds: ['wumen', 'taiheimen', 'taihedian', 'zhonghedian', 'baohedian'],
    /** 弱化区域 */
    dimIds: ['qianqingmen', 'qianqinggong', 'kunninggong', 'yuhuayuan'],
  },
  progression: {
    id: 'progression',
    labelZh: '由外入内',
    labelEn: 'Outside → Inside',
    descZh: '从午门到御花园的递进路径',
    descEn: 'A progressive path from the Meridian Gate to the Imperial Garden',
    defaultRegion: 'wumen',
    highlightIds: ['wumen', 'taiheimen', 'taihedian', 'zhonghedian', 'baohedian', 'qianqingmen', 'qianqinggong', 'kunninggong', 'yuhuayuan'],
    dimIds: [],
  },
  courtLiving: {
    id: 'courtLiving',
    labelZh: '前朝后寝',
    labelEn: 'Court & Living',
    descZh: '突出前朝与后寝的分区关系',
    descEn: 'Highlight the division between the outer court and inner quarters',
    defaultRegion: 'qianqingmen',
    highlightIds: ['wumen', 'taiheimen', 'taihedian', 'zhonghedian', 'baohedian', 'qianqingmen', 'qianqinggong', 'kunninggong', 'yuhuayuan'],
    dimIds: [],
    /** 前朝 */
    outerIds: ['wumen', 'taiheimen', 'taihedian', 'zhonghedian', 'baohedian'],
    /** 分界 */
    dividerId: 'qianqingmen',
    /** 后寝 */
    innerIds: ['qianqinggong', 'kunninggong', 'yuhuayuan'],
  },
}

const AXIS_MODE_ORDER = ['ritual', 'progression', 'courtLiving']

/** 中轴 9 大热区序列（从南向北） */
const AXIS_SEQUENCE = [
  'wumen',
  'taiheimen',
  'taihedian',
  'zhonghedian',
  'baohedian',
  'qianqingmen',
  'qianqinggong',
  'kunninggong',
  'yuhuayuan',
]

/** 脉络盘 8 节点（不含中和殿，因 SVG 无独立分组） */
const AXIS_TRACK_NODES = [
  'wumen',
  'taiheimen',
  'taihedian',
  'baohedian',
  'qianqingmen',
  'qianqinggong',
  'kunninggong',
  'yuhuayuan',
]

/** 礼意盘外圈五个概念 */
const RITUAL_CONCEPTS = [
  { id: 'hierarchy',    labelZh: '尊卑有序', labelEn: 'Ranked Order' },
  { id: 'progression',  labelZh: '由外入内', labelEn: 'Outside In' },
  { id: 'courtLiving',  labelZh: '前朝后寝', labelEn: 'Court & Living' },
  { id: 'centrality',   labelZh: '居中而治', labelEn: 'Central Rule' },
  { id: 'separation',   labelZh: '礼居分途', labelEn: 'Rite & Dwelling' },
]

/** 每个热区的详细信息 */
const AXIS_REGION_DATA = {
  wumen: {
    nameZh: '午门', nameEn: 'Meridian Gate',
    roleZh: '礼制入口', roleEn: 'Ritual Threshold',
    subtitleZh: '凹字迎客，威仪始此', subtitleEn: 'The concave embrace marks the first rite of entry',
    descZh: '午门为紫禁城正南门，呈"凹"字形，三面合围形成收束空间。朝会、典礼、献俘等重要仪式均从午门开始，它不是一扇普通的门，而是礼制秩序的起始界面。五凤楼居中，左右掖门分文武百官，空间分流即等级分流。',
    descEn: 'The Meridian Gate is the formal southern entrance of the Forbidden City. Its U-shaped plan compresses visitors into a threshold of ceremony. Major rites began here; spatial channeling mirrors rank.',
    concepts: ['hierarchy', 'progression'],
    trackIndex: 0,
  },
  taiheimen: {
    nameZh: '太和门', nameEn: 'Gate of Supreme Harmony',
    roleZh: '朝序展开', roleEn: 'Ceremonial Unfolding',
    subtitleZh: '金水桥横，前朝序幕', subtitleEn: 'The Golden Water bridge signals the outer court overture',
    descZh: '太和门前五座金水桥依次排列，是进入外朝三大殿的空间序幕。明代御门听政即在此进行，其广场的开阔与午门的收束形成强烈对比，预示前方的权力高潮。',
    descEn: 'Five Golden Water bridges precede the Gate of Supreme Harmony, opening the ceremonial sequence. The contrast with the compressed Meridian Gate foreshadows the climax ahead.',
    concepts: ['hierarchy', 'progression'],
    trackIndex: 1,
  },
  taihedian: {
    nameZh: '太和殿', nameEn: 'Hall of Supreme Harmony',
    roleZh: '朝仪核心', roleEn: 'Ceremonial Core',
    subtitleZh: '至尊之殿，权力汇聚', subtitleEn: 'The supreme hall where imperial power converges',
    descZh: '太和殿是故宫乃至中国古建筑的最高等级殿宇，登基、大婚、册封、殿试等核心典礼在此举行。三层汉白玉须弥座将大殿托至最高点，"居中为尊"在此达到极致。',
    descEn: 'The Hall of Supreme Harmony is the highest-ranked building in the Forbidden City. Enthronement and major ceremonies took place here atop a three-tier marble platform — centrality as supremacy.',
    concepts: ['hierarchy', 'centrality'],
    trackIndex: 2,
  },
  zhonghedian: {
    nameZh: '中和殿', nameEn: 'Hall of Central Harmony',
    roleZh: '礼仪调节', roleEn: 'Ritual Modulation',
    subtitleZh: '于中取和，张弛有度', subtitleEn: 'A pause for balance between the grand halls',
    descZh: '中和殿位于太和殿与保和殿之间，是皇帝前往太和殿前更衣休憩、阅览奏折之处。它在空间节奏上形成缓冲，"中"与"和"的命名直接呼应儒家中庸之道。',
    descEn: 'The Hall of Central Harmony sits between the two major halls, providing a spatial and ceremonial pause. Its name directly invokes Confucian balance.',
    concepts: ['hierarchy', 'centrality'],
    trackIndex: -1, // 脉络盘中不单独列出
  },
  baohedian: {
    nameZh: '保和殿', nameEn: 'Hall of Preserving Harmony',
    roleZh: '外朝收束', roleEn: 'Outer Court Closure',
    subtitleZh: '殿试之所，外朝终章', subtitleEn: 'The hall of imperial exams closes the outer court',
    descZh: '保和殿为外朝三大殿的最后一座，清代殿试在此举行。它标志着外朝礼制空间的收束，也是即将跨入内廷前的最后一道空间节点。',
    descEn: 'The Hall of Preserving Harmony closes the outer court sequence. The Qing imperial examination was held here, marking the transition point toward the inner quarters.',
    concepts: ['hierarchy', 'progression'],
    trackIndex: 3,
  },
  qianqingmen: {
    nameZh: '乾清门', nameEn: 'Gate of Heavenly Purity',
    roleZh: '前后分界', roleEn: 'Court-Living Divide',
    subtitleZh: '一门之隔，乾坤二分', subtitleEn: 'A single gate separates the public court from the private quarters',
    descZh: '乾清门是外朝与内廷的分界标志。门前为公开礼制空间，门后转为皇帝日常起居。清代"御门听政"从太和门移至此处，使其成为兼具政治与空间双重分界意义的关键节点。',
    descEn: 'The Gate of Heavenly Purity divides the outer court from the inner palace. Qing-era audiences were held here, doubling its role as both spatial and political threshold.',
    concepts: ['progression', 'courtLiving', 'separation'],
    trackIndex: 4,
  },
  qianqinggong: {
    nameZh: '乾清宫', nameEn: 'Palace of Heavenly Purity',
    roleZh: '内廷中枢', roleEn: 'Inner Court Core',
    subtitleZh: '帝王寝殿，日常机枢', subtitleEn: 'The emperor\'s residence and center of daily governance',
    descZh: '乾清宫为后三宫之首，明代和清初皇帝的寝宫和日常理政之所。"正大光明"匾悬于殿内，秘密立储制度即始于此。空间尺度相比外朝显著收敛，转为内敛、私密。',
    descEn: 'The Palace of Heavenly Purity heads the rear three palaces, serving as the emperor\'s bedroom and daily office. Its scale contracts markedly from the outer court.',
    concepts: ['courtLiving', 'separation', 'centrality'],
    trackIndex: 5,
  },
  kunninggong: {
    nameZh: '坤宁宫', nameEn: 'Palace of Earthly Tranquility',
    roleZh: '后寝秩序', roleEn: 'Inner Court Order',
    subtitleZh: '皇后正宫，阴位之极', subtitleEn: 'The queen\'s palace at the pinnacle of yin',
    descZh: '坤宁宫为皇后正宫，在阴阳体系中对应"坤"与"地"，是后寝空间的核心。清代改为祭祀场所与帝后大婚洞房，功能虽变，礼制位格不改。',
    descEn: 'The Palace of Earthly Tranquility is the queen\'s formal residence, corresponding to the "earth" position in cosmic symbolism. In the Qing dynasty it became a ritual space.',
    concepts: ['courtLiving', 'separation'],
    trackIndex: 6,
  },
  yuhuayuan: {
    nameZh: '御花园', nameEn: 'Imperial Garden',
    roleZh: '礼序收束', roleEn: 'Axial Closure',
    subtitleZh: '花木收官，轴线终止', subtitleEn: 'Gardens close the axis in verdant repose',
    descZh: '御花园是中轴线在内廷的最终节点，以自然园林收束整条礼制序列。园中钦安殿供奉真武大帝，承担"以水克火"的风水寓意。空间由建筑秩序回归山石花木，形成礼序的柔性终章。',
    descEn: 'The Imperial Garden terminates the central axis with a shift from architecture to landscape. The Qin\'an Hall within invokes water to restrain fire — a feng shui safeguard.',
    concepts: ['progression', 'separation'],
    trackIndex: 7,
  },
}

/** 中轴礼序模式下的视频路径 */
const AXIS_VIDEO_PATH = 'assets/videos/culture/中轴礼序'

/** 前朝后寝模式的色彩 */
const COURT_COLORS = {
  outer: 'rgba(193, 138, 59, 0.22)',    // 暖金色
  outerStroke: 'rgba(193, 138, 59, 0.6)',
  inner: 'rgba(94, 128, 102, 0.20)',     // 青绿色
  innerStroke: 'rgba(94, 128, 102, 0.55)',
  divider: 'rgba(184, 90, 60, 0.7)',     // 朱红分界
}
