const SVG_WIDTH = 987.436
const SVG_HEIGHT = 1398.857

const $ = (selector) => document.querySelector(selector)

const MODULES = {
  archive: {
    titleZh: '宫阙载史',
    titleEn: 'Palace Archive',
    subtitleZh: '从总览图进入故宫建筑的礼制、形制与事件叙事。',
    subtitleEn: 'Read the Forbidden City through overview hotspots, typologies, and event narratives.',
    kickerZh: '紫禁城建筑图谱',
    kickerEn: 'Forbidden City Atlas',
  },
  thought: {
    titleZh: '堪舆哲思',
    titleEn: 'Spatial Thought',
    subtitleZh: '以中轴、阴阳五行与风水格局理解故宫的空间哲学。',
    subtitleEn: 'Read the palace through the central axis, yin-yang cosmology, and feng shui logic.',
    kickerZh: '空间秩序',
    kickerEn: 'Spatial Philosophy',
  },
  component: {
    titleZh: '巧物精工',
    titleEn: 'Craft & Ingenuity',
    subtitleZh: '拆解建筑构件，解读形制、物理与文化三维度。',
    subtitleEn: 'Disassemble building components, explore craft, physics, and culture.',
    kickerZh: '构件解构',
    kickerEn: 'Component Deconstruction',
  },
}

const FUNCTION_COLORS = {
  ritual: '#ba8743',
  living: '#b85a3c',
  culture: '#5e8066',
  worship: '#756285',
  decor: '#8a7453',
}

const TYPE_COLORS = {
  hall: '#9a512b',
  tower: '#836033',
  gate: '#556f5f',
  landscape: '#7b6850',
}

const TYPE_GROUP_META = {
  hall: { labelZh: '殿堂类', labelEn: 'Hall Type', source: 'hall' },
  tower: { labelZh: '楼阁类', labelEn: 'Tower Type', source: 'tower' },
  gate: { labelZh: '城门类', labelEn: 'Gate Type', source: 'gate' },
  landscape: { labelZh: '景观类', labelEn: 'Landscape Type', source: 'screen' },
}

const BUILDING_MEDIA = {
  jiaolou: [
    { src: 'assets/images/buildings/角楼.jpg', titleZh: '角楼', titleEn: 'Corner Tower' },
  ],
  dongliugong: [
    { src: 'assets/images/buildings/东六宫.jpg', titleZh: '东六宫', titleEn: 'Eastern Six Palaces' },
    { src: 'assets/images/buildings/西六宫.jpg', titleZh: '西六宫', titleEn: 'Western Six Palaces' },
  ],
  wumen: [{ src: 'assets/images/buildings/午门.jpg', titleZh: '午门', titleEn: 'Meridian Gate' }],
  taihedian: [{ src: 'assets/images/buildings/太和殿.jpg', titleZh: '太和殿', titleEn: 'Hall of Supreme Harmony' }],
  taiheimen: [{ src: 'assets/images/buildings/太和门.jpg', titleZh: '太和门', titleEn: 'Gate of Supreme Harmony' }],
  baohedian: [{ src: 'assets/images/buildings/保和殿.jpg', titleZh: '保和殿', titleEn: 'Hall of Preserving Harmony' }],
  zhonghedian: [{ src: 'assets/images/buildings/中和殿.jpg', titleZh: '中和殿', titleEn: 'Hall of Central Harmony' }],
  qianqinggong: [{ src: 'assets/images/buildings/乾清宫.jpg', titleZh: '乾清宫', titleEn: 'Palace of Heavenly Purity' }],
  kunninggong: [{ src: 'assets/images/buildings/坤宁宫.jpg', titleZh: '坤宁宫', titleEn: 'Palace of Earthly Tranquility' }],
  qianqingmen: [{ src: 'assets/images/buildings/乾清门.jpg', titleZh: '乾清门', titleEn: 'Gate of Heavenly Purity' }],
  wenhuadian: [{ src: 'assets/images/buildings/文华殿.jpg', titleZh: '文华殿', titleEn: 'Hall of Literary Brilliance' }],
  wuyingdian: [{ src: 'assets/images/buildings/武英殿.jpg', titleZh: '武英殿', titleEn: 'Hall of Martial Valor' }],
  shenwumen: [{ src: 'assets/images/buildings/神武门.jpg', titleZh: '神武门', titleEn: 'Gate of Divine Might' }],
  jiulongbi: [{ src: 'assets/images/buildings/九龙壁.jpg', titleZh: '九龙壁', titleEn: 'Nine Dragon Wall' }],
  yangxindian: [{ src: 'assets/images/buildings/养心殿.jpg', titleZh: '养心殿', titleEn: 'Hall of Mental Cultivation' }],
  yuhuayuan: [{ src: 'assets/images/buildings/御花园.jpg', titleZh: '御花园', titleEn: 'Imperial Garden' }],
  shufangzhai: [{ src: 'assets/images/buildings/漱芳斋.jpg', titleZh: '漱芳斋', titleEn: 'Shufang Zhai' }],
  changyinge: [{ src: 'assets/images/buildings/畅音阁.jpg', titleZh: '畅音阁', titleEn: 'Changyin Pavilion' }],
  qianlonghuayuan: [{ src: 'assets/images/buildings/乾隆花园.jpg', titleZh: '乾隆花园', titleEn: 'Qianlong Garden' }],
  cininggong: [{ src: 'assets/images/buildings/慈宁宫.jpg', titleZh: '慈宁宫', titleEn: 'Cining Palace' }],
  cininggonghuayuan: [{ src: 'assets/images/buildings/慈宁宫花园.jpg', titleZh: '慈宁宫花园', titleEn: 'Cining Palace Garden' }],
  shoukanggong: [{ src: 'assets/images/buildings/寿康宫.jpg', titleZh: '寿康宫', titleEn: 'Shoukang Palace' }],
  huangjidian: [{ src: 'assets/images/buildings/皇极殿.jpg', titleZh: '皇极殿', titleEn: 'Huangji Hall' }],
  jianting: [{ src: 'assets/images/buildings/箭亭.jpg', titleZh: '箭亭', titleEn: 'Arrow Pavilion' }],
  qinandian: [{ src: 'assets/images/buildings/钦安殿.jpg', titleZh: '钦安殿', titleEn: "Qin'an Hall" }],
}

const state = {
  module: 'archive',
  lang: 'zh',
  openPanels: { function: false, type: false },
  selectedFunction: null,
  selectedType: null,
  selectedBuilding: null,
  selectedHotspotId: null,
  hoveredHotspotId: null,
  infoTab: 'archive',
  archiveCardTab: 'archive', // 'archive' | 'event' | 'sinology'
  thoughtTab: 'axis',
  thoughtFocus: 'ritual-core',
  thoughtSelectedBuilding: null,
  thoughtHoveredHotspotId: null,
}

window.state = state

const els = {}
let relationChart = null
let archiveHotspots = []
let thoughtHotspots = []

const BUILDING_INDEX = Object.fromEntries(Object.values(BUILDINGS).map((item) => [item.id, item]))

const THOUGHT_TAB_PINYIN = {
  axis: 'Zhōng Zhóu Lǐ Xù',
  yinyang: 'Yīn Yáng Wǔ Xíng',
  fengshui: 'Fēng Shuǐ Gé Jú',
}

const THOUGHT_FOCUS_PINYIN = {
  'ritual-core': 'Jū Zhōng Wéi Zūn',
  'heaven-earth': 'Tiān Rén Hé Yī',
  'time-space': 'Shí Kōng Dì Jìn',
  'outer-inner': 'Wài Yáng Nèi Yīn',
  'five-elements': 'Wǔ Xíng Fāng Wèi',
  'cycle-flow': 'Shēng Kè Liú Zhuǎn',
  'mountain-water': 'Bèi Shān Miàn Shuǐ',
  'solar-order': 'Fù Yīn Bào Yáng',
  'symbolic-guard': 'Fǎ Tiān Xiàng Dì',
}

const THOUGHT_VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov']

/** 不参与轮播 / 建筑图像展示的建筑 id（宁寿门、东华门、西华门） */
const GALLERY_EXCLUDED_BUILDING_IDS = new Set(['ningshoumen', 'donghuamen', 'xihhuamen'])

function uniqueIds(ids) {
  return [...new Set(ids)].filter((id) => BUILDING_INDEX[id])
}

const FUNCTION_GROUPS = FUNCTION_CATEGORIES.map((item) => ({
  id: item.id,
  labelZh: item.labelZh,
  labelEn: item.labelEn,
  color: FUNCTION_COLORS[item.id],
  ids: uniqueIds(CATEGORY_INTROS[item.id]?.buildingIds || []),
  descZh: CATEGORY_INTROS[item.id]?.desc || '',
  descEn: CATEGORY_INTROS[item.id]?.descEn || item.labelEn,
}))

const TYPE_GROUPS = Object.entries(TYPE_GROUP_META).map(([id, meta]) => ({
  id,
  labelZh: meta.labelZh,
  labelEn: meta.labelEn,
  color: TYPE_COLORS[id],
  ids: uniqueIds(COMPONENT_TYPE_INTROS[meta.source]?.buildingIds || []),
  descZh: COMPONENT_TYPE_INTROS[meta.source]?.desc || '',
  descEn: COMPONENT_TYPE_INTROS[meta.source]?.descEn || meta.labelEn,
}))


const THOUGHT_TAB_ORDER = ['axis', 'yinyang', 'fengshui']

const THOUGHT_TABS = {
  axis: {
    id: 'axis',
    titleZh: '中轴礼序',
    titleEn: 'Central Axis Order',
    statusZh: '居中为尊 · 天人合一 · 序列递进',
    statusEn: 'Central dignity · cosmic order · spatial sequence',
    sideTitleZh: '礼序刻度轴',
    sideTitleEn: 'Axis Sequence',
    sideDescZh: '以南北中轴为主线，把礼制、权力与空间节奏压缩进一条可感知的路径中。',
    sideDescEn: 'A single north-south line condenses ritual hierarchy, imperial power, and spatial cadence.',
    stageTitleZh: '中轴强化视图',
    stageTitleEn: 'Axis Emphasis View',
    stageHintZh: '金线沿中轴推进，节点由午门向神武门递次亮起。',
    stageHintEn: 'A gold axis advances from the Meridian Gate toward the Gate of Divine Might.',
    mediaEyebrowZh: '礼序长卷',
    mediaEyebrowEn: 'Ritual Scroll',
    focuses: [
      {
        id: 'ritual-core',
        labelZh: '居中为尊',
        labelEn: 'Central Supremacy',
        color: '#c18a3b',
        buildingIds: ['wumen', 'taiheimen', 'taihedian', 'zhonghedian', 'baohedian', 'qianqingmen', 'qianqinggong', 'jiaotaidian', 'kunninggong', 'shenwumen'],
        sideItems: [
          { buildingId: 'wumen', titleZh: '午门', titleEn: 'Meridian Gate', metaZh: '礼序入口', metaEn: 'Ritual threshold' },
          { buildingId: 'taihedian', titleZh: '太和殿', titleEn: 'Hall of Supreme Harmony', metaZh: '权力中心', metaEn: 'Imperial center' },
          { buildingId: 'qianqinggong', titleZh: '乾清宫', titleEn: 'Palace of Heavenly Purity', metaZh: '内廷核心', metaEn: 'Inner court core' },
          { buildingId: 'shenwumen', titleZh: '神武门', titleEn: 'Gate of Divine Might', metaZh: '轴线收束', metaEn: 'Northern closure' },
        ],
        posterTitleZh: '礼制中轴',
        posterTitleEn: 'Ritual Axis',
        posterBodyZh: '核心建筑全部压在中轴线上，以“择中而立”塑造至高无上的皇权中心。',
        posterBodyEn: 'The core halls align on one axis to materialize central imperial authority.',
        statusItems: [
          { labelZh: '主链 10 节点', labelEn: '10 axial nodes', color: '#c18a3b' },
          { labelZh: '南北推进', labelEn: 'North-south sequence', color: '#d6b16d' },
          { labelZh: '左右对称', labelEn: 'Bilateral order', color: '#8a7453' },
        ],
        detailSections: [
          {
            titleZh: '居中为尊的礼制核心',
            titleEn: 'Ritual Core of Centrality',
            bodyZh: '中轴线将故宫划分为东西对称两部分，所有最重要的礼制建筑都压在这条线上。皇帝的座位、殿宇的等级、院落的展开方式都围绕“居中”组织，使建筑本身成为皇权合法性的空间证明。',
            bodyEn: 'The most important ritual halls sit on the axis, turning centrality into a spatial proof of imperial legitimacy.',
          },
          {
            titleZh: '空间推进的权力节奏',
            titleEn: 'Spatial Sequence of Power',
            bodyZh: '从午门的门禁与收束，到前三殿广场的开阔，再到内廷尺度的收敛，中轴不是一条静态直线，而是一条由开到合、由显到藏的权力叙事线。',
            bodyEn: 'The axis stages power through expansion and compression rather than through a static line.',
          },
        ],
      },
      {
        id: 'heaven-earth',
        labelZh: '天人合一',
        labelEn: 'Cosmic Alignment',
        color: '#9c7a43',
        buildingIds: ['taihedian', 'zhonghedian', 'baohedian', 'qianqinggong', 'jiaotaidian', 'kunninggong'],
        sideItems: [
          { buildingId: 'taihedian', titleZh: '太和殿', titleEn: 'Hall of Supreme Harmony', metaZh: '象征天极', metaEn: 'Heavenly center' },
          { buildingId: 'jiaotaidian', titleZh: '交泰殿', titleEn: 'Hall of Union', metaZh: '阴阳会通', metaEn: 'Union of forces' },
          { buildingId: 'kunninggong', titleZh: '坤宁宫', titleEn: 'Palace of Earthly Tranquility', metaZh: '地德承载', metaEn: 'Earthly grounding' },
        ],
        posterTitleZh: '天人对应',
        posterTitleEn: 'Heaven-Earth Order',
        posterBodyZh: '中轴不仅是空间轴线，也是象天法地的精神轴线。太和、中和、保和与后三宫形成一条由天至人的礼制秩序。',
        posterBodyEn: 'The axis links architecture to a cosmological order from heaven to the human realm.',
        statusItems: [
          { labelZh: '三大殿', labelEn: 'Three great halls', color: '#b88a35' },
          { labelZh: '后三宫', labelEn: 'Rear palaces', color: '#756285' },
          { labelZh: '中和中正', labelEn: 'Balance & rectitude', color: '#5e8066' },
        ],
        detailSections: [
          {
            titleZh: '天人合一的宇宙观',
            titleEn: 'Cosmology of Unity',
            bodyZh: '中轴正南正北，与古人理解中的天象秩序呼应。紫禁城以“紫微垣”在人间投影自居，太和殿作为礼制高点，承接“天命所归”的象征意义。',
            bodyEn: 'The axis mirrors the ancient celestial order and frames the palace as an earthly projection of the Purple Enclosure.',
          },
          {
            titleZh: '中庸、中和、中正',
            titleEn: 'Balance and Rectitude',
            bodyZh: '从中和殿到交泰殿，“中”不仅是位置，更是一种政治伦理和审美原则，强调不偏不倚、秩序均衡与上下有序。',
            bodyEn: '“Centrality” is both a location and an ethical-aesthetic principle of balance.',
          },
        ],
      },
      {
        id: 'time-space',
        labelZh: '时空递进',
        labelEn: 'Temporal Sequence',
        color: '#d0a55e',
        buildingIds: ['wumen', 'taihedian', 'baohedian', 'qianqinggong', 'shenwumen'],
        sideItems: [
          { buildingId: 'wumen', titleZh: '狭长门禁', titleEn: 'Compressed entry', metaZh: '从收束开始', metaEn: 'Begins with compression' },
          { buildingId: 'taihedian', titleZh: '广场开阔', titleEn: 'Expanding court', metaZh: '达到权力高潮', metaEn: 'Reaches ceremonial climax' },
          { buildingId: 'qianqinggong', titleZh: '内廷收敛', titleEn: 'Inner contraction', metaZh: '回到日常秩序', metaEn: 'Returns to daily order' },
        ],
        posterTitleZh: '时空融合',
        posterTitleEn: 'Temporal-Space Rhythm',
        posterBodyZh: '故宫沿中轴形成由外朝宏阔到内廷内敛的尺度转折，也顺应坐北朝南的采光、通风与季节经验。',
        posterBodyEn: 'The axis turns climate, procession, and ceremonial rhythm into one spatial sequence.',
        statusItems: [
          { labelZh: '先收后放', labelEn: 'Compress then open', color: '#b85a3c' },
          { labelZh: '坐北朝南', labelEn: 'South-facing', color: '#5e8066' },
          { labelZh: '季节适应', labelEn: 'Climate response', color: '#836033' },
        ],
        detailSections: [
          {
            titleZh: '时空融合的建筑智慧',
            titleEn: 'Architectural Intelligence of Time and Space',
            bodyZh: '故宫并非只追求对称，更把时间感嵌入了行进路线。进入、朝会、退朝、起居，都被院落尺度、门殿关系与朝向组织成可体验的节奏。',
            bodyEn: 'The palace embeds ritual time into spatial progression through scale, gateways, and orientation.',
          },
          {
            titleZh: '从外朝到内廷',
            titleEn: 'From Outer Court to Inner Court',
            bodyZh: '南部强调昭示、开阔与威严，北部转向居住、私密与内敛，这种层层推进让“皇权庄严”变成一条可被行走感知的路径。',
            bodyEn: 'The transition from outer spectacle to inner privacy turns imperial authority into a walked experience.',
          },
        ],
      },
    ],
  },
  yinyang: {
    id: 'yinyang',
    titleZh: '阴阳五行',
    titleEn: 'Yin-Yang & Five Elements',
    statusZh: '外阳内阴 · 五方定位 · 生克流转',
    statusEn: 'Outer yang · inner yin · five-direction order',
    sideTitleZh: '宇宙关系图',
    sideTitleEn: 'Cosmic Diagram',
    sideDescZh: '通过阴阳分区与五行定位，把故宫从建筑集合转为一套有内在关系的宇宙模型。',
    sideDescEn: 'The palace becomes a cosmological system through yin-yang zoning and five-element orientation.',
    stageTitleZh: '阴阳五行分区视图',
    stageTitleEn: 'Yin-Yang Structure View',
    stageHintZh: '先看南北阴阳，再看东西南北中的五行落位与流转关系。',
    stageHintEn: 'Read the palace first as yin-yang zoning, then as a five-direction elemental field.',
    mediaEyebrowZh: '系统结构图',
    mediaEyebrowEn: 'System Diagram',
    focuses: [
      {
        id: 'outer-inner',
        labelZh: '外阳内阴',
        labelEn: 'Outer Yang / Inner Yin',
        color: '#b85a3c',
        buildingIds: ['wumen', 'taiheimen', 'taihedian', 'zhonghedian', 'baohedian', 'qianqinggong', 'jiaotaidian', 'kunninggong', 'dongliugong', 'yangxindian'],
        sideItems: [
          { buildingId: 'taihedian', titleZh: '外朝 · 阳', titleEn: 'Outer Court · Yang', metaZh: '开阔、刚健、典礼空间', metaEn: 'Open, bright ceremonial space' },
          { buildingId: 'qianqinggong', titleZh: '内廷 · 阴', titleEn: 'Inner Court · Yin', metaZh: '内敛、私密、日常起居', metaEn: 'Compact, private residential zone' },
          { buildingId: 'jiaotaidian', titleZh: '交泰 · 阴阳交融', titleEn: 'Union Hall', metaZh: '天地交泰的核心节点', metaEn: 'Node of balance and union' },
        ],
        posterTitleZh: '阴阳分区',
        posterTitleEn: 'Yin-Yang Zoning',
        posterBodyZh: '故宫南部外朝属阳，北部内廷属阴，交泰殿处在天地交泰、帝后和合的关键位置。',
        posterBodyEn: 'The outer court embodies yang, the inner court embodies yin, and the Hall of Union mediates both.',
        statusItems: [
          { labelZh: '外朝属阳', labelEn: 'Outer court = yang', color: '#b85a3c' },
          { labelZh: '内廷属阴', labelEn: 'Inner court = yin', color: '#5e8066' },
          { labelZh: '交泰平衡', labelEn: 'Balanced at Union Hall', color: '#756285' },
        ],
        detailSections: [
          {
            titleZh: '阴阳划分：外阳内阴',
            titleEn: 'Outer Yang, Inner Yin',
            bodyZh: '外朝三大殿与前朝广场高敞开阔，适合大典与朝政，体现阳刚、公开与威严；内廷后三宫与东西六宫尺度更紧凑，强调居住、私密与和合，呈现阴性的空间气质。',
            bodyEn: 'The outer court manifests public strength, while the inner court leans toward privacy and harmony.',
          },
          {
            titleZh: '交泰殿的中介作用',
            titleEn: 'The Hall of Union as Mediator',
            bodyZh: '交泰殿夹在乾清宫与坤宁宫之间，使“天”“地”“君”“后”在空间上完成呼应，是阴阳平衡最具象的节点。',
            bodyEn: 'The Hall of Union is the spatial mediator where the palace balances paired cosmic roles.',
          },
        ],
      },
      {
        id: 'five-elements',
        labelZh: '五行方位',
        labelEn: 'Five Directions',
        color: '#5e8066',
        buildingIds: ['wenhuadian', 'dongliugong', 'wumen', 'taiheimen', 'taihedian', 'wuyingdian', 'qinandian', 'yuhuayuan', 'shenwumen'],
        sideItems: [
          { buildingId: 'wenhuadian', titleZh: '东方 · 木', titleEn: 'East · Wood', metaZh: '文华殿、东六宫', metaEn: 'Wenhua Hall, eastern palaces' },
          { buildingId: 'wumen', titleZh: '南方 · 火', titleEn: 'South · Fire', metaZh: '午门、太和门、前三殿', metaEn: 'Meridian Gate and southern court' },
          { buildingId: 'taihedian', titleZh: '中央 · 土', titleEn: 'Center · Earth', metaZh: '太和殿居中统领', metaEn: 'Supreme Harmony at the center' },
          { buildingId: 'wuyingdian', titleZh: '西方 · 金', titleEn: 'West · Metal', metaZh: '武英殿、西六宫', metaEn: 'Wuying Hall and western palaces' },
          { buildingId: 'qinandian', titleZh: '北方 · 水', titleEn: 'North · Water', metaZh: '御花园、钦安殿、神武门', metaEn: 'Imperial Garden and northern zone' },
        ],
        posterTitleZh: '五方宇宙盘',
        posterTitleEn: 'Five-Element Field',
        posterBodyZh: '木、火、土、金、水分别锚定故宫的东、南、中、西、北，使方位、功能、色彩与寓意被统一进同一套秩序。',
        posterBodyEn: 'Wood, fire, earth, metal, and water bind orientation, color, and function into one order.',
        statusItems: [
          { labelZh: '木东', labelEn: 'Wood East', color: '#5e8066' },
          { labelZh: '火南', labelEn: 'Fire South', color: '#b85a3c' },
          { labelZh: '土中', labelEn: 'Earth Center', color: '#b88a35' },
          { labelZh: '金西', labelEn: 'Metal West', color: '#836033' },
          { labelZh: '水北', labelEn: 'Water North', color: '#526d57' },
        ],
        detailSections: [
          {
            titleZh: '五行对应：方位、功能、色彩一体化',
            titleEn: 'Integrated Direction-Function-Color Mapping',
            bodyZh: '东方主木，对应文治与生长；南方主火，对应典礼与王朝盛势；中央主土，以太和殿为核心；西方主金，对应武备与秩序；北方主水，用于镇火、守静与护佑宫城。',
            bodyEn: 'Each direction is assigned an element, tying together function, symbolism, and color.',
          },
          {
            titleZh: '从方位走向意义',
            titleEn: 'From Direction to Meaning',
            bodyZh: '故宫并不是简单地把建筑放在地图上，而是把建筑变成可读的文化方位系统，观者可以从位置直接感知其角色与寓意。',
            bodyEn: 'Placement itself becomes legible meaning in the palace plan.',
          },
        ],
      },
      {
        id: 'cycle-flow',
        labelZh: '生克流转',
        labelEn: 'Generating Cycle',
        color: '#756285',
        buildingIds: ['wenhuadian', 'wumen', 'taihedian', 'wuyingdian', 'qinandian', 'yuhuayuan'],
        sideItems: [
          { buildingId: 'wenhuadian', titleZh: '木生火', titleEn: 'Wood → Fire', metaZh: '东方文运推向南向礼制', metaEn: 'East nurtures southern ritual' },
          { buildingId: 'taihedian', titleZh: '火生土', titleEn: 'Fire → Earth', metaZh: '南方典礼汇入中央权力', metaEn: 'Southern brilliance stabilizes the center' },
          { buildingId: 'wuyingdian', titleZh: '土生金', titleEn: 'Earth → Metal', metaZh: '中央秩序外化为西侧武备', metaEn: 'Central order radiates westward' },
          { buildingId: 'qinandian', titleZh: '金生水', titleEn: 'Metal → Water', metaZh: '北侧以水镇火', metaEn: 'Northern water tempers risk' },
          { buildingId: 'yuhuayuan', titleZh: '水生木', titleEn: 'Water → Wood', metaZh: '循环归于生长', metaEn: 'Cycle returns to renewal' },
        ],
        posterTitleZh: '相生相克',
        posterTitleEn: 'Generation & Restraint',
        posterBodyZh: '故宫将五行关系落实到具体空间中：既有木火土金水的循环，也有北方属水、以水克火的防灾智慧。',
        posterBodyEn: 'The palace spatializes both generating and restraining elemental relations.',
        statusItems: [
          { labelZh: '相生链路', labelEn: 'Generating cycle', color: '#756285' },
          { labelZh: '以水克火', labelEn: 'Water restrains fire', color: '#526d57' },
          { labelZh: '防灾寓意', labelEn: 'Protective meaning', color: '#b88a35' },
        ],
        detailSections: [
          {
            titleZh: '五行相生的循环智慧',
            titleEn: 'Generating Cycle',
            bodyZh: '木生火、火生土、土生金、金生水、水生木，让宫城成为一个可以循环运转的宇宙模型；这种逻辑不是抽象口号，而是通过建筑落位、材料与色彩被具体化。',
            bodyEn: 'The generating cycle turns the palace into a circulating cosmological model.',
          },
          {
            titleZh: '相克规则与现实功能',
            titleEn: 'Restraint and Practical Function',
            bodyZh: '北方属水，御花园与北部区域强调静与守，也承担防火辟邪的象征意义。风水观念与木构建筑的防灾需求在这里被叠合成同一套解释。',
            bodyEn: 'The restraining relation—especially water restraining fire—connects symbolism with real risk control.',
          },
        ],
      },
    ],
  },
  fengshui: {
    id: 'fengshui',
    titleZh: '风水格局',
    titleEn: 'Feng Shui Logic',
    statusZh: '背山面水 · 负阴抱阳 · 法天象地',
    statusEn: 'Mountain-water setting · south-facing order · celestial mapping',
    sideTitleZh: '堪舆关系图',
    sideTitleEn: 'Feng Shui Diagram',
    sideDescZh: '从环境、朝向与象征三层读取故宫，让“帝王吉壤”的格局变成可视化关系。',
    sideDescEn: 'Read the palace through environment, orientation, and symbolic correspondence.',
    stageTitleZh: '宫城环境关系图',
    stageTitleEn: 'Environmental Relation View',
    stageHintZh: '通过外围标签和主舞台高亮，理解背山、临水、向心与四象拱卫。',
    stageHintEn: 'Use outer labels and highlights to read mountain-water setting and directional protection.',
    mediaEyebrowZh: '环境关系图',
    mediaEyebrowEn: 'Environmental Diagram',
    focuses: [
      {
        id: 'mountain-water',
        labelZh: '背山面水',
        labelEn: 'Mountain & Water',
        color: '#8a7453',
        buildingIds: ['wumen', 'taihedian', 'qianqinggong', 'shenwumen'],
        sideItems: [
          { buildingId: 'shenwumen', titleZh: '北倚景山', titleEn: 'Backed by Jingshan', metaZh: '形成玄武靠山之势', metaEn: 'A northern mountain support' },
          { buildingId: 'wumen', titleZh: '南临金水', titleEn: 'Facing Golden Water', metaZh: '形成朱雀临水之局', metaEn: 'A southern water frontage' },
          { buildingId: 'taihedian', titleZh: '宫城居中', titleEn: 'Central palace body', metaZh: '山水之间聚气成局', metaEn: 'Energy gathered between mountain and water' },
        ],
        posterTitleZh: '藏风聚气',
        posterTitleEn: 'Capturing Wind & Energy',
        posterBodyZh: '景山作为北部镇山，金水河作为南部水脉，使故宫形成典型的“背山面水”与“藏风聚气”格局。',
        posterBodyEn: 'Jingshan and the Golden Water River frame the palace as a classic mountain-water site.',
        statusItems: [
          { labelZh: '景山靠北', labelEn: 'Jingshan to the north', color: '#8a7453' },
          { labelZh: '金水在前', labelEn: 'Golden Water in front', color: '#526d57' },
          { labelZh: '聚气成局', labelEn: 'Energy gathering', color: '#b88a35' },
        ],
        detailSections: [
          {
            titleZh: '背山面水：帝王吉壤的基本模型',
            titleEn: 'Backing Mountain, Facing Water',
            bodyZh: '景山为宫城挡住北风、稳住气场，金水河则在南侧形成玉带环抱之势。风水中的“得水为上，藏风次之”，在故宫里被落实为可辨识的地理关系。',
            bodyEn: 'Mountain and water cooperate to create both climatic shelter and symbolic prosperity.',
          },
          {
            titleZh: '从自然条件到政治象征',
            titleEn: 'From Environment to Politics',
            bodyZh: '山水不仅服务于排水、防风和消防，也被解释为皇权稳固、财气内聚、国运绵延的象征。',
            bodyEn: 'Practical environmental choices are elevated into signs of durable imperial authority.',
          },
        ],
      },
      {
        id: 'orientation-core',
        labelZh: '负阴抱阳',
        labelEn: 'South-Facing Order',
        color: '#b88a35',
        buildingIds: ['wumen', 'taiheimen', 'taihedian', 'qianqinggong', 'kunninggong', 'shenwumen'],
        sideItems: [
          { buildingId: 'taihedian', titleZh: '坐北朝南', titleEn: 'North-south orientation', metaZh: '顺应采光与气候', metaEn: 'Adapts to light and climate' },
          { buildingId: 'qianqinggong', titleZh: '向心拱卫', titleEn: 'Centripetal arrangement', metaZh: '次要建筑朝向核心宫殿', metaEn: 'Secondary structures protect the core' },
          { buildingId: 'wumen', titleZh: '面南而治', titleEn: 'Rule facing south', metaZh: '政治隐喻与现实功能统一', metaEn: 'Politics and climate align' },
        ],
        posterTitleZh: '向心格局',
        posterTitleEn: 'Centripetal Order',
        posterBodyZh: '所有核心建筑坐北朝南，既符合北京气候，又把“面南而治”的政治秩序和“向心拱卫”的空间格局结合起来。',
        posterBodyEn: 'South-facing buildings unite climatic adaptation with a centripetal political order.',
        statusItems: [
          { labelZh: '坐北朝南', labelEn: 'South-facing', color: '#b88a35' },
          { labelZh: '左右对称', labelEn: 'Left-right symmetry', color: '#9c7a43' },
          { labelZh: '向心拱卫', labelEn: 'Centripetal protection', color: '#756285' },
        ],
        detailSections: [
          {
            titleZh: '负阴抱阳：朝向中的气候与礼制',
            titleEn: 'Facing South for Climate and Ritual',
            bodyZh: '故宫核心建筑普遍坐北朝南，冬季利于采光，夏季有利通风。这一现实智慧被古人解释为“抱阳”，并进一步延展为帝王面南而治的政治隐喻。',
            bodyEn: 'South-facing orientation serves both thermal comfort and the symbolism of rulership.',
          },
          {
            titleZh: '向心拱卫的宫城组织',
            titleEn: 'A Palace Organized Around the Core',
            bodyZh: '次要建筑朝向主要宫殿，门、殿、院层层围拢中轴与核心殿宇，使空间呈现出持续收拢、朝向中央的向心性。',
            bodyEn: 'Buildings continuously turn and gather toward the palace core.',
          },
        ],
      },
      {
        id: 'heaven-pattern',
        labelZh: '天人感应',
        labelEn: 'Celestial Correspondence',
        color: '#756285',
        buildingIds: ['taihedian', 'qianqinggong', 'kunninggong', 'wenhuadian', 'wuyingdian'],
        sideItems: [
          { buildingId: 'taihedian', titleZh: '太和殿 · 紫微中心', titleEn: 'Supreme Harmony · Celestial center', metaZh: '象征天帝居所的人间投影', metaEn: 'Earthly projection of the heavenly seat' },
          { buildingId: 'wenhuadian', titleZh: '左青龙', titleEn: 'Left Azure Dragon', metaZh: '东侧文治与拱卫', metaEn: 'Eastern civil order' },
          { buildingId: 'wuyingdian', titleZh: '右白虎', titleEn: 'Right White Tiger', metaZh: '西侧武备与平衡', metaEn: 'Western martial balance' },
          { buildingId: 'kunninggong', titleZh: '地德承天', titleEn: 'Earthly complement', metaZh: '天地、阴阳在宫城会合', metaEn: 'Earth complements heaven' },
        ],
        posterTitleZh: '法天象地',
        posterTitleEn: 'Modeling Heaven on Earth',
        posterBodyZh: '紫禁城把紫微垣、九五之尊、四象拱卫等天象与数理观念转译为建筑数量、等级和空间组织。',
        posterBodyEn: 'Astronomy, numerology, and symbolism are translated into built form and hierarchy.',
        statusItems: [
          { labelZh: '紫微垣', labelEn: 'Purple Enclosure', color: '#756285' },
          { labelZh: '九五之尊', labelEn: 'Nine and five', color: '#b88a35' },
          { labelZh: '四象拱卫', labelEn: 'Directional guardians', color: '#5e8066' },
        ],
        detailSections: [
          {
            titleZh: '天人感应：皇宫作为宇宙模型',
            titleEn: 'The Palace as a Cosmic Model',
            bodyZh: '“紫禁城”本身就来自天文学，意味着皇宫是紫微垣在人间的投影。宫城中的中心、数量、等级、左右秩序，都试图对应天上秩序，从而证明皇权“受命于天”。',
            bodyEn: 'The palace mirrors celestial order to validate imperial rule as heaven-ordained.',
          },
          {
            titleZh: '数字、等级与象征系统',
            titleEn: 'Numbers, Rank, and Symbolism',
            bodyZh: '太和殿九五尺度、角楼九梁十八柱七十二脊、左右文武对置等做法，让风水不只是环境学，也成为等级制度与宇宙观的联合表达。',
            bodyEn: 'Numbers and formal hierarchy turn cosmology into an architectural language of rank.',
          },
        ],
      },
    ],
  },
}

function isZh() {
  return state.lang === 'zh'
}

function pick(zh, en) {
  return isZh() ? zh : en
}

function setLanguageMode() {
  document.body.dataset.lang = state.lang
  window.dispatchEvent(new CustomEvent('archi:languagechange', { detail: { lang: state.lang } }))
}

function withPinyin(label, pinyin) {
  if (isZh() || !pinyin) return label
  return `${label} · ${pinyin}`
}

function getThoughtTabPinyin(tabId) {
  return THOUGHT_TAB_PINYIN[tabId] || ''
}

function getThoughtFocusPinyin(focusId) {
  return THOUGHT_FOCUS_PINYIN[focusId] || ''
}

function getThoughtVideoCandidates(focus) {
  const tabVideoBase = {
    axis: '中轴礼序',
    yinyang: '阴阳五行',
    fengshui: '风水格局',
  }
  const baseName = tabVideoBase[state.thoughtTab] || focus?.labelZh || '文化视频'
  return THOUGHT_VIDEO_EXTENSIONS.map((ext) => encodeAssetPath(`assets/videos/culture/${baseName}.${ext}`))
}

function escapeHTML(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

/** 对路径最后一段编码，避免中文/空格文件名在部分环境下无法加载 */
function encodeAssetPath(path) {
  if (!path || path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) return path
  const i = path.lastIndexOf('/')
  const dir = i >= 0 ? path.slice(0, i + 1) : ''
  const file = i >= 0 ? path.slice(i + 1) : path
  return dir + encodeURIComponent(file)
}

function getFunctionGroup(id) {
  return FUNCTION_GROUPS.find((item) => item.id === id) || null
}

function getTypeGroup(id) {
  return TYPE_GROUPS.find((item) => item.id === id) || null
}

function getFunctionOfBuilding(buildingId) {
  return FUNCTION_GROUPS.find((group) => group.ids.includes(buildingId)) || null
}

function getTypeOfBuilding(buildingId) {
  return TYPE_GROUPS.find((group) => group.ids.includes(buildingId)) || null
}

function getBuilding(buildingId) {
  return BUILDING_INDEX[buildingId] || null
}

function getBuildingLabel(buildingId) {
  const building = getBuilding(buildingId)
  if (!building) return ''
  return isZh()
    ? building.name
    : withPinyin(building.nameEn || building.name, building.pinyin)
}

function getHotspotLabel(hotspot) {
  if (!hotspot) return ''
  if (isZh()) return hotspot.labelZh || getBuilding(hotspot.buildingId)?.name || ''
  return hotspot.labelEn || getBuilding(hotspot.buildingId)?.nameEn || getBuilding(hotspot.buildingId)?.name || ''
}

function getBuildingMedia(buildingId) {
  if (GALLERY_EXCLUDED_BUILDING_IDS.has(buildingId)) return []
  const building = getBuilding(buildingId)
  if (!building) return []

  const manual = BUILDING_MEDIA[buildingId]
  if (manual?.length) {
    return manual.map((item) => ({
      src: encodeAssetPath(item.src),
      titleZh: item.titleZh || building.name,
      titleEn: item.titleEn || building.nameEn || building.name,
      buildingId,
    }))
  }

  return [{
    src: encodeAssetPath(`assets/images/buildings/${building.name}.jpg`),
    titleZh: building.name,
    titleEn: building.nameEn || building.name,
    buildingId,
  }]
}

/** 按建筑 id 收集轮播图（含东六宫/西六宫等多图条目，宁寿门等无图 id 自动跳过） */
function collectCarouselUrlsFromBuildingIds(ids) {
  const out = []
  const seen = new Set()
  for (const id of ids || []) {
    if (!BUILDING_INDEX[id]) continue
    const media = getBuildingMedia(id)
    for (const m of media) {
      const s = m.src
      if (s && !seen.has(s)) {
        seen.add(s)
        out.push(s)
      }
    }
  }
  return out
}

let categoryCarouselTimer = null
let categoryCarouselIndex = 0
let categoryCarouselUrls = []

function stopCategoryCarousel() {
  if (categoryCarouselTimer) {
    clearInterval(categoryCarouselTimer)
    categoryCarouselTimer = null
  }
}

function armCategoryCarouselTimer() {
  if (categoryCarouselTimer) clearInterval(categoryCarouselTimer)
  categoryCarouselTimer = null
  if (categoryCarouselUrls.length <= 1) return
  categoryCarouselTimer = setInterval(() => {
    renderCategoryCarouselSlide(categoryCarouselIndex + 1)
  }, 4000)
}

function renderCategoryCarouselSlide(nextIdx) {
  const track = els.carouselTrack
  const indicator = els.carouselIndicator
  const prevBtn = els.carouselPrev
  const nextBtn = els.carouselNext
  const n = categoryCarouselUrls.length
  if (!track || n === 0) return

  categoryCarouselIndex = ((nextIdx % n) + n) % n
  const idx = categoryCarouselIndex
  const url = categoryCarouselUrls[idx]

  track.innerHTML = ''
  const wrap = document.createElement('button')
  wrap.type = 'button'
  wrap.className = 'carousel-slide-btn'
  wrap.setAttribute('data-lightbox-src', url)
  wrap.setAttribute('aria-label', pick('点击放大', 'Click to enlarge'))
  const img = document.createElement('img')
  img.src = url
  img.alt = pick('配图', 'Illustration')
  img.loading = 'lazy'
  img.addEventListener('error', () => {
    const fallback = document.createElement('div')
    fallback.className = 'overview-empty'
    fallback.style.cssText = 'min-height:160px;display:flex;align-items:center;justify-content:center;font-size:13px;padding:12px;'
    fallback.textContent = pick('图片加载失败', 'Image failed to load')
    wrap.replaceWith(fallback)
  })
  wrap.appendChild(img)
  track.appendChild(wrap)

  if (indicator) {
    indicator.innerHTML = ''
    categoryCarouselUrls.forEach((_, i) => {
      const dot = document.createElement('button')
      dot.type = 'button'
      dot.className = `category-carousel__dot${i === idx ? ' is-active' : ''}`
      dot.setAttribute('aria-label', `${i + 1} / ${n}`)
      dot.addEventListener('click', () => {
        renderCategoryCarouselSlide(i)
        armCategoryCarouselTimer()
      })
      indicator.appendChild(dot)
    })
  }

  const multi = n > 1
  if (prevBtn) {
    prevBtn.hidden = !multi
    prevBtn.onclick = () => {
      renderCategoryCarouselSlide(idx - 1)
      armCategoryCarouselTimer()
    }
  }
  if (nextBtn) {
    nextBtn.hidden = !multi
    nextBtn.onclick = () => {
      renderCategoryCarouselSlide(idx + 1)
      armCategoryCarouselTimer()
    }
  }
}

function startCategoryCarousel(urls) {
  stopCategoryCarousel()
  categoryCarouselUrls = Array.isArray(urls) ? urls.slice() : []
  categoryCarouselIndex = 0
  if (!els.categoryCarousel) return
  if (categoryCarouselUrls.length === 0) {
    els.categoryCarousel.hidden = true
    return
  }
  els.categoryCarousel.hidden = false
  renderCategoryCarouselSlide(0)
  armCategoryCarouselTimer()
}

function renderCategoryIntroHeader(scope) {
  const box = els.categoryIntroBox
  if (!box) return
  const title = pick(scope.item.labelZh, scope.item.labelEn)
  const sub = scope.kind === 'function'
    ? pick('功能分类', 'Functional Category')
    : pick('形制分类', 'Typological Group')
  const body = pick(scope.item.descZh, scope.item.descEn)
  box.innerHTML = `
    <div class="info-title">${escapeHTML(title)}</div>
    <div class="info-subtitle">${escapeHTML(sub)}</div>
    <div class="info-body" style="margin-top:10px;line-height:1.75;">${escapeHTML(body)}</div>
  `
}

function renderCategoryBuildingList(buildingIds, accentColor) {
  const listEl = els.categoryBuildingList
  if (!listEl) return
  const color = accentColor || 'var(--gold)'
  const rows = (buildingIds || []).filter((id) => BUILDING_INDEX[id]).map((id) => `
    <button type="button" class="category-building-item" data-building-id="${escapeHTML(id)}">
      <span class="category-building-item__dot" style="background:${escapeHTML(color)};"></span>
      <span>${escapeHTML(getBuildingLabel(id))}</span>
    </button>
  `).join('')
  listEl.innerHTML = rows || `<p class="overview-empty" style="padding:12px;font-size:13px;">${escapeHTML(pick('暂无关联建筑', 'No linked buildings'))}</p>`
  listEl.querySelectorAll('.category-building-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.buildingId
      if (id) selectBuilding(id)
    })
  })
}

function getCurrentScope() {
  if (state.selectedBuilding) return { kind: 'building', item: getBuilding(state.selectedBuilding) }
  if (state.selectedFunction) return { kind: 'function', item: getFunctionGroup(state.selectedFunction) }
  if (state.selectedType) return { kind: 'type', item: getTypeGroup(state.selectedType) }
  return { kind: 'module', item: MODULES[state.module] }
}

function getModuleIntro() {
  if (state.module === 'archive') {
    return {
      title: pick('宫阙载史', 'Palace Archive'),
      subtitle: pick('建筑档案联动系统', 'Building Archive System'),
      body: pick(
        '点击中间总览图中的任意建筑热区，左侧将同步显示该建筑的关系网络与关键词标签，右侧呈现完整档案。',
        'Click any building hotspot on the center overview map to sync the left relation network and keyword panel with the right building archive.',
      ),
      badges: [
        pick('建筑关联网络', 'Building Relation Network'),
        pick('关键词语义标签', 'Keyword Semantic Tags'),
        pick('总览与档案联动', 'Overview-Archive Sync'),
      ],
    }
  }

  return {
    title: pick('巧物精工', 'Craft & Ingenuity'),
    subtitle: pick('形制视角', 'Typology Lens'),
    body: pick(
      '这一视角更适合从殿堂、楼阁、城门与景观的构造逻辑理解故宫。点击右侧形制分类时，总览图会出现对应脉冲热区。',
      'This mode favors reading the palace through hall, tower, gate, and landscape typologies. Type filters will pulse the matching zones on the overview map.',
    ),
    badges: [
      pick('形制分类联动总览图', 'Typology-linked overview'),
      pick('构件与形制互相参照', 'Components linked to typology'),
      pick('切换建筑查看拆解关系', 'Switch buildings to compare assemblies'),
    ],
  }
}

function getOverviewHint() {
  return ''
}

function getFunctionChartCaption() {
  return pick(
    '礼仪政治与起居生活共同构成故宫最稳定的空间骨架，其余类型则补足祭祀、游赏与景观层次。',
    'Ceremonial and residential buildings form the palace backbone, while worship, culture, and scenic spaces complete its layered experience.',
  )
}

function getTypeChartCaption() {
  return pick(
    '殿堂与景观共同塑造了故宫的礼制核心与游观层次，楼阁与城门承担垂直眺望与秩序转换。',
    'Halls and landscapes define the palace core and atmosphere, while towers and gates handle lookout and spatial transition.',
  )
}

function bindElements() {
  els.btnLang = $('#btn-lang')
  els.navPlates = [...document.querySelectorAll('.wood-plate')]
  els.graphEyebrow = $('#graph-eyebrow')
  els.graphTitle = $('#graph-title')
  els.keywordEyebrow = $('#keyword-eyebrow')
  els.keywordTitle = $('#keyword-title')
  els.overviewEyebrow = $('#overview-eyebrow')
  els.overviewTitle = $('#overview-title')
  els.overviewHint = $('#overview-hint')
  els.overviewStage = $('#overview-stage')
  els.overviewSvgHost = $('#overview-svg-host')
  els.overviewSvg = null
  els.overviewTooltip = $('#overview-tooltip')
  els.functionFoldToggle = $('#function-fold-toggle')
  els.typeFoldToggle = $('#type-fold-toggle')
  els.functionFoldPanel = $('#function-fold-panel')
  els.typeFoldPanel = $('#type-fold-panel')
  els.functionFoldLabel = $('#function-fold-label')
  els.typeFoldLabel = $('#type-fold-label')
  els.panelPlaceholder = $('#panel-placeholder')
  els.archiveCard = $('#archive-card')
  els.archiveCardHero = $('#archive-card-hero')
  els.archiveCardTabs = document.querySelectorAll('.archive-card-tab')
  els.cardContentArchive = $('#card-content-archive')
  els.cardContentEvent = $('#card-content-event')
  els.cardContentSinology = $('#card-content-sinology')
  els.categoryCarousel = $('#category-carousel')
  els.carouselTrack = $('#carousel-track')
  els.carouselPrev = $('#carousel-prev')
  els.carouselNext = $('#carousel-next')
  els.carouselIndicator = $('#carousel-indicator')
  els.categoryIntroCard = $('#category-intro-card')
  els.categoryIntroBox = $('#category-intro-box')
  els.categoryBuildingList = $('#category-building-list')
  els.thoughtPrimaryTabs = $('#thought-primary-tabs')
  els.thoughtModuleKicker = $('#thought-module-kicker')
  els.thoughtModuleTitle = $('#thought-module-title')
  els.thoughtModuleStatus = $('#thought-module-status')
  els.thoughtSideTitle = $('#thought-side-title')
  els.thoughtSideDesc = $('#thought-side-desc')
  els.thoughtSideVisual = $('#thought-side-visual')
  els.thoughtSideFocus = $('#thought-side-focus')
  els.thoughtStageEyebrow = $('#thought-stage-eyebrow')
  els.thoughtStageTitle = $('#thought-stage-title')
  els.thoughtStageHint = $('#thought-stage-hint')
  els.thoughtSvgHost = $('#thought-svg-host')
  els.thoughtStageDecor = $('#thought-stage-decor')
  els.thoughtTooltip = $('#thought-tooltip')
  els.thoughtSecondaryTabs = $('#thought-secondary-tabs')
  els.thoughtStatusList = $('#thought-status-list')
  els.thoughtMediaEyebrow = $('#thought-media-eyebrow')
  els.thoughtMediaTitle = $('#thought-media-title')
  els.thoughtMediaBody = $('#thought-media-body')
  els.thoughtTextEyebrow = $('#thought-text-eyebrow')
  els.thoughtTextTitle = $('#thought-text-title')
  els.thoughtTextBody = $('#thought-text-body')
  els.componentShellEyebrow = $('#component-shell-eyebrow')
  els.componentShellTitle = $('#component-shell-title')
  els.componentShellHint = $('#component-shell-hint')
}

function bindEvents() {
  els.btnLang.addEventListener('click', () => {
    state.lang = isZh() ? 'en' : 'zh'
    setLanguageMode()
    renderAll()
  })

  els.navPlates.forEach((button) => {
    button.addEventListener('click', () => {
      const nextModule = button.dataset.module
      if (!nextModule || nextModule === state.module) return
      if (state.module === 'thought' && nextModule !== 'thought') {
        resetThoughtStageCache()
      }
      state.module = nextModule
      state.selectedFunction = null
      state.selectedType = null
      state.selectedBuilding = null
      state.selectedHotspotId = null
      state.hoveredHotspotId = null
      state.openPanels = { function: false, type: false }
      state.infoTab = 'archive'
      state.archiveCardTab = 'archive'
      state.thoughtSelectedBuilding = null
      state.thoughtHoveredHotspotId = null
      hideTooltip()
      hideThoughtTooltip()
      if (nextModule === 'thought' && !getThoughtFocus()) {
        state.thoughtTab = 'axis'
        state.thoughtFocus = 'ritual-core'
      }
      renderAll()
    })
  })

  if (els.functionFoldToggle) {
    els.functionFoldToggle.addEventListener('click', () => togglePanel('function'))
  }
  if (els.typeFoldToggle) {
    els.typeFoldToggle.addEventListener('click', () => togglePanel('type'))
  }

  // 档案卡 Tab 切换
  if (els.archiveCardTabs?.length) {
    els.archiveCardTabs.forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.archiveTab
        if (!tab || state.archiveCardTab === tab) return
        state.archiveCardTab = tab
        // 切换 active 类
        els.archiveCardTabs.forEach((b) => {
          b.classList.toggle('active', b === btn)
          b.setAttribute('aria-selected', String(b === btn))
        })
        // 切换内容可见性
        const ca = els.cardContentArchive
        const ce = els.cardContentEvent
        const cs = els.cardContentSinology
        if (ca) ca.classList.toggle('is-active', tab === 'archive')
        if (ce) ce.classList.toggle('is-active', tab === 'event')
        if (cs) cs.classList.toggle('is-active', tab === 'sinology')
        // 滚动回顶
        const body = document.querySelector('.archive-card-body')
        if (body) body.scrollTop = 0
      })
    })
  }

  els.overviewStage.addEventListener('click', (event) => {
    if (event.target.closest('[data-hotspot-id]')) return
    state.selectedBuilding = null
    state.selectedHotspotId = null
    state.infoTab = 'archive'
    document.body.dataset.buildingId = ''
    window.currentBuilding = null
    renderOverview()
    renderGraph()
    renderKeywordPanel()
    renderInfo()
  })
  window.addEventListener('resize', () => {
    relationChart?.resize()
  })

  // ===== 堪舆哲思：事件委托（避免每次 innerHTML 后重新绑定） =====
  // 一级 Tab
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-thought-tab]')
    if (btn) selectThoughtTab(btn.dataset.thoughtTab)
  })

  // 右侧二级按钮：自定义模块优先，再回退到默认 focus
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-m2-mode], [data-yy-btn], [data-thought-focus]')
    if (!target) return
    if (target.dataset.m2Mode && typeof Module2 !== 'undefined') {
      Module2.selectMode(target.dataset.m2Mode)
    } else if (target.dataset.yyBtn && typeof YinyangModule !== 'undefined') {
      YinyangModule.selectBtn(target.dataset.yyBtn)
    } else if (target.dataset.thoughtFocus) {
      selectThoughtFocus(target.dataset.thoughtFocus)
    }
  })

  // 左侧侧边栏建筑按钮
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-thought-building]')
    if (btn) selectThoughtBuilding(btn.dataset.thoughtBuilding)
  })
}

function togglePanel(kind) {
  if (!els.functionFoldToggle || !els.typeFoldToggle || !els.functionFoldPanel || !els.typeFoldPanel) return
  state.openPanels[kind] = !state.openPanels[kind]
  renderFilterPanels()
}

function selectFunction(id) {
  state.selectedFunction = state.selectedFunction === id ? null : id
  state.selectedType = null
  if (!state.selectedBuilding) {
    state.selectedBuilding = null
    state.selectedHotspotId = null
  }
  state.infoTab = 'archive'
  state.openPanels.function = true
  renderOverview()
  renderFilterPanels()
  if (!state.selectedBuilding) renderInfo()
  renderCharts()
}

function selectType(id) {
  state.selectedType = state.selectedType === id ? null : id
  state.selectedFunction = null
  if (!state.selectedBuilding) {
    state.selectedBuilding = null
    state.selectedHotspotId = null
  }
  state.infoTab = 'archive'
  state.openPanels.type = true
  renderOverview()
  renderFilterPanels()
  if (!state.selectedBuilding) renderInfo()
  renderCharts()
}

function selectBuilding(buildingId, hotspotId = null) {
  state.selectedBuilding = buildingId
  state.selectedHotspotId = hotspotId
  state.infoTab = 'archive'
  document.body.dataset.buildingId = buildingId || ''
  window.currentBuilding = buildingId || null
  renderOverview()
  renderGraph()
  renderKeywordPanel()
  renderInfo()
}

function initOverview() {
  // 加载 SVG，自动扫描热区
  archiveHotspots = scanSVGHotspots(els.overviewSvg)
  const hotspots = archiveHotspots

  hotspots.forEach((hotspot) => {
    hotspot.overlayEl = createHotspotOverlay(els.overviewSvg, hotspot)

    // 为手动热区创建 sourceEl
    if (hotspot.customPath) {
      const sourceEl = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      sourceEl.setAttribute('d', hotspot.customPath)
      sourceEl.classList.add('overview-region-source')
      sourceEl.style.fill = 'rgba(255,255,255,0.002)'
      hotspot.sourceEl = sourceEl
      els.overviewSvg.querySelector('[data-layer="hotspot-interaction"]').appendChild(sourceEl)
    }

    bindHotspotEvents(hotspot, {
      onHover: (h, e) => {
        state.hoveredHotspotId = h.hotspotId
        renderOverview()
        showTooltip(h, e)
      },
      onLeave: (h) => {
        if (state.hoveredHotspotId === h.hotspotId) state.hoveredHotspotId = null
        renderOverview()
        hideTooltip()
      },
      onClick: (h) => {
        selectBuilding(h.buildingId, h.hotspotId)
        hideTooltip()
      },
    })
  })
}

async function createHotspots() {
  try {
    const response = await fetch(new URL('assets/images/map/overview.svg', window.location.href))
    if (!response.ok) throw new Error(`SVG load failed: ${response.status}`)

    const markup = await response.text()
    els.overviewSvgHost.innerHTML = markup

    const svg = els.overviewSvgHost.querySelector('svg')
    if (!svg) throw new Error('SVG root not found')

    svg.removeAttribute('width')
    svg.removeAttribute('height')
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')

    const interactionLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    interactionLayer.setAttribute('data-layer', 'hotspot-interaction')
    const overlayLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    overlayLayer.setAttribute('data-layer', 'hotspot-overlay')
    svg.appendChild(interactionLayer)
    svg.appendChild(overlayLayer)

    els.overviewSvg = svg
    initOverview()
    renderOverview()
  } catch (error) {
    console.error(error)
    els.overviewSvgHost.innerHTML = '<p class="overview-svg-fallback">总览图加载失败，请刷新页面后重试。</p>'
    els.overviewSvg = null
  }
}

function showTooltip(hotspot, event = null) {
  const text = isZh() ? hotspot.labelZh : hotspot.labelEn
  if (!text) return
  els.overviewTooltip.textContent = text
  els.overviewTooltip.hidden = false

  let x = 0
  let y = 0
  if (event) {
    x = event.clientX
    y = event.clientY
  } else {
    const node = hotspot.sourceEl || hotspot.group
    if (node) {
      const rect = node.getBoundingClientRect()
      x = rect.left + rect.width / 2
      y = rect.top
    }
  }

  // rAF 保证 tooltip 已渲染出宽高，再读 rect 定位
  requestAnimationFrame(() => {
    if (els.overviewTooltip.hidden) return
    const tooltipRect = els.overviewTooltip.getBoundingClientRect()
    let left = x - tooltipRect.width / 2
    let top = y - tooltipRect.height - 16
    // 边界修正：左右不出视口
    if (left < 8) left = 8
    if (left + tooltipRect.width > window.innerWidth - 8) left = window.innerWidth - tooltipRect.width - 8
    if (top < 8) top = y + 20 // 下方放不下则改到鼠标下方
    els.overviewTooltip.style.left = `${left}px`
    els.overviewTooltip.style.top = `${top}px`
  })
}

function hideTooltip() {
  els.overviewTooltip.hidden = true
}

function renderHeader() {
  els.btnLang.textContent = isZh() ? '中 / EN' : 'EN / 中'

  if (els.graphEyebrow) els.graphEyebrow.textContent = pick('建筑关联网络', 'Building Network')
  if (els.graphTitle) els.graphTitle.textContent = pick('当前建筑在宫城空间中的关系位置', 'Relations of current building in palace space')
  if (els.keywordEyebrow) els.keywordEyebrow.textContent = pick('建筑关键词', 'Building Keywords')
  if (els.keywordTitle) els.keywordTitle.textContent = pick('类别 / 角色 / 形制 / 文化', 'Category / Role / Form / Culture')

  els.overviewEyebrow.textContent = 'Overview'
  els.overviewTitle.textContent = pick('故宫总览图', 'Forbidden City Overview')
  els.overviewHint.textContent = getOverviewHint()
  if (els.functionFoldLabel) els.functionFoldLabel.textContent = pick('功能分类', 'Function')
  if (els.typeFoldLabel) els.typeFoldLabel.textContent = pick('形制分类', 'Typology')
}

function renderNav() {
  els.navPlates.forEach((button) => {
    button.classList.toggle('active', button.dataset.module === state.module)
  })
}

function renderFilterPanels() {
  if (!els.functionFoldToggle || !els.typeFoldToggle || !els.functionFoldPanel || !els.typeFoldPanel) return

  const functionOpen = state.openPanels.function
  const typeOpen = state.openPanels.type

  els.functionFoldToggle.classList.toggle('is-open', functionOpen)
  els.functionFoldToggle.setAttribute('aria-expanded', String(functionOpen))
  els.functionFoldPanel.hidden = false
  els.functionFoldPanel.classList.toggle('is-open', functionOpen)
  els.functionFoldPanel.setAttribute('aria-hidden', String(!functionOpen))

  els.typeFoldToggle.classList.toggle('is-open', typeOpen)
  els.typeFoldToggle.setAttribute('aria-expanded', String(typeOpen))
  els.typeFoldPanel.hidden = false
  els.typeFoldPanel.classList.toggle('is-open', typeOpen)
  els.typeFoldPanel.setAttribute('aria-hidden', String(!typeOpen))

  els.functionFoldPanel.innerHTML = `
    <div class="filter-chip-list">
      ${FUNCTION_GROUPS.map((group) => `
        <button class="filter-chip${state.selectedFunction === group.id ? ' active' : ''}" type="button" data-role="function-filter" data-id="${group.id}" style="--chip-color:${group.color};">${escapeHTML(isZh() ? group.labelZh : group.labelEn)}</button>
      `).join('')}
    </div>
  `

  els.typeFoldPanel.innerHTML = `
    <div class="filter-chip-list">
      ${TYPE_GROUPS.map((group) => `
        <button class="filter-chip${state.selectedType === group.id ? ' active' : ''}" type="button" data-role="type-filter" data-id="${group.id}" style="--chip-color:${group.color};">${escapeHTML(isZh() ? group.labelZh : group.labelEn)}</button>
      `).join('')}
    </div>
  `

  els.functionFoldPanel.querySelectorAll('[data-role="function-filter"]').forEach((button) => {
    button.addEventListener('click', () => selectFunction(button.dataset.id))
  })

  els.typeFoldPanel.querySelectorAll('[data-role="type-filter"]').forEach((button) => {
    button.addEventListener('click', () => selectType(button.dataset.id))
  })
}

function renderOverview() {
  const activeFunction = getFunctionGroup(state.selectedFunction)
  const activeType = getTypeGroup(state.selectedType)
  const hotspots = archiveHotspots

  hotspots.forEach((hotspot) => {
    const node = hotspot.overlayEl
    if (!node) return

    const selected = state.selectedHotspotId
      ? hotspot.hotspotId === state.selectedHotspotId
      : state.selectedBuilding && hotspot.buildingId === state.selectedBuilding

    node.classList.toggle('is-selected', Boolean(selected))
    node.classList.toggle('is-hovered', state.hoveredHotspotId === hotspot.hotspotId)

    const functionHighlight = activeFunction?.ids.includes(hotspot.buildingId)
    const typeHighlight = activeType?.ids.includes(hotspot.buildingId)

    node.classList.toggle('function-highlight', Boolean(functionHighlight))
    node.classList.toggle('type-highlight', Boolean(typeHighlight))

    const color = functionHighlight ? activeFunction.color : activeType?.color || ''
    if (color) node.style.setProperty('--highlight-color', color)
    else node.style.removeProperty('--highlight-color')
  })
}

function buildOverviewCardHTML({ title, subtitle, body, badges = [] }) {
  return `
    <div class="info-title">${escapeHTML(title)}</div>
    <div class="info-subtitle">${escapeHTML(subtitle)}</div>
    <div class="info-body">${escapeHTML(body)}</div>
    ${badges.length ? `<div class="info-badges">${badges.map((badge) => `<span class="info-badge">${escapeHTML(badge)}</span>`).join('')}</div>` : ''}
  `
}

function buildFallbackStyle(building) {
  const parts = []
  if (building.roofType) parts.push(isZh() ? `屋顶：${building.roofType}` : `Roof: ${building.roofTypeEn || building.roofType}`)
  if (building.bays) parts.push(isZh() ? `开间：${building.bays}` : `Bays: ${building.bays}`)
  if (building.baseHeight) parts.push(isZh() ? `台基：${building.baseHeight}` : `Platform: ${building.baseHeight}`)
  return parts.join('；') || pick('暂无资料', 'No data')
}

function buildArchiveHeroHTML(building) {
  const typeGroup = getTypeOfBuilding(building.id)
  const media = getBuildingMedia(building.id)
  const photo = media[0]
  const photoSrc = photo?.src || photo || ''
  const photoAlt = escapeHTML(isZh() ? (photo?.titleZh || building.name) : (photo?.titleEn || building.nameEn || building.name))
  const missingText = pick('暂无影像', 'No image')
  const subtitleParts = [
    !isZh() ? building.pinyin || '' : '',
    typeGroup ? (isZh() ? typeGroup.labelZh : typeGroup.labelEn) : '',
  ].filter(Boolean)

  const photoHtml = photoSrc
    ? `<div class="archive-card-hero__photo">
         <img src="${photoSrc}" alt="${photoAlt}" loading="lazy" onerror="this.closest('.archive-card-hero__photo').classList.add('is-missing');this.remove();">
       </div>`
    : `<div class="archive-card-hero__photo is-missing" data-missing-text="${missingText}"></div>`

  return `
    ${photoHtml}
    <div class="archive-card-hero__name">
      <span class="archive-card-hero__eyebrow">${escapeHTML(pick('宫阙档案', 'Building Archive'))}</span>
      <div class="archive-card-hero__title">${escapeHTML(isZh() ? building.name : (building.nameEn || building.name))}</div>
      <div class="archive-card-hero__subtitle">${escapeHTML(subtitleParts.join(' · ')) || escapeHTML(pick('故宫建筑条目', 'Forbidden City record'))}</div>
    </div>
  `
}

function buildBuildingArchiveHTML(building) {
  const kapian = BUILDING_KAPIAN_DATA[building.id] || {}
  const functionGroup = getFunctionOfBuilding(building.id)
  const timeline = kapian.timeline || [building.built, building.rebuilt].filter(Boolean).join(' / ')
  const materials = kapian.materials || building.materials || pick('暂无资料', 'No data')
  const style = kapian.style || buildFallbackStyle(building)
  const functionText = kapian.functionCat || (functionGroup ? pick(functionGroup.labelZh, functionGroup.labelEn) : pick('待补充', 'Pending'))
  const identity = kapian.identity || (isZh() ? building.archive : (building.archiveEn || building.archive || ''))

  const blocks = [
    { label: pick('建造时间线', 'Timeline'), value: timeline || pick('暂无资料', 'No data') },
    { label: pick('材料与结构', 'Material & Structure'), value: materials },
    { label: pick('建筑样式', 'Architectural Style'), value: style },
    { label: pick('功能归属', 'Function'), value: functionText },
  ]

  return `
    <article class="building-record building-record--archive">
      <section class="building-record__summary">
        <div class="building-record__summary-label">${escapeHTML(pick('建筑身份', 'Identity'))}</div>
        <p class="building-record__summary-text">${escapeHTML(identity || pick('暂无资料', 'No data'))}</p>
      </section>
      <div class="info-meta building-record__grid">
        ${blocks.map((block) => `
          <article class="info-block">
            <div class="info-block__label">${escapeHTML(block.label)}</div>
            <div class="info-block__value">${escapeHTML(block.value)}</div>
          </article>
        `).join('')}
      </div>
    </article>
  `
}

function buildBuildingEventHTML(building) {
  const kapian = BUILDING_KAPIAN_DATA[building.id] || {}
  const historicalEvents = kapian.historicalEvents?.length ? kapian.historicalEvents : (building.events || []).map((item) => {
    const desc = isZh() ? item.desc : (item.descEn || item.desc)
    return item.year ? `${item.year} · ${desc}` : desc
  })
  const festivals = kapian.festivals || []
  const anecdotes = kapian.anecdotes || building.anecdotes || []

  const sections = [
    { title: pick('历史事件', 'Historical Events'), items: historicalEvents },
    { title: pick('节庆与礼制', 'Festivals & Rituals'), items: festivals },
    { title: pick('逸闻掌故', 'Anecdotes'), items: anecdotes },
  ].filter((section) => section.items?.length)

  if (!sections.length) {
    return `<div class="overview-empty">${escapeHTML(pick('该建筑暂未整理事件资料。', 'No event record has been compiled for this building yet.'))}</div>`
  }

  return `
    <article class="building-record building-record--event">
      ${sections.map((section) => `
        <section class="info-list info-list--event">
          <div class="info-list__title">${escapeHTML(section.title)}</div>
          ${section.items.map((item) => `<div class="info-list__item">${escapeHTML(item)}</div>`).join('')}
        </section>
      `).join('')}
    </article>
  `
}

/** 汉学卡：帮助留学生理解中国古建筑文化与智慧 */
function buildBuildingSinologyHTML(building) {
  const name = isZh() ? building.name : (building.nameEn || building.name)
  const pinyin = !isZh() ? (building.pinyin || '') : ''
  const functionGroup = getFunctionOfBuilding(building.id)
  const typeGroup = getTypeOfBuilding(building.id)
  const functionText = functionGroup ? (isZh() ? functionGroup.labelZh : functionGroup.labelEn) : ''
  const typeText = typeGroup ? (isZh() ? typeGroup.labelZh : typeGroup.labelEn) : ''

  // 汉学内容：针对留学生设计，用通俗易懂的语言解释建筑文化
  const sinologyData = {
    wumen: {
      zh: `【午门】是紫禁城的正门，俗称"五凤楼"。它位于城市中轴线的最南端，是皇帝举行重大仪式的地方。每逢宣战、献俘等盛典，皇帝会站在城楼上接受臣民的朝拜。这道门的设计体现了中国古代"居中为尊"的思想——最重要的人物站在中央最高处，象征着至高无上的权力。
      
      💡 给留学生的提示：想象一下，这就像一个国家的"国家大门"，但它是专门为皇帝建造的，比普通的城门更加庄严和精美。`,
      en: `The Meridian Gate (Wumen) is the main southern entrance to the Forbidden City, nicknamed "Five Phoenix Tower." It sits precisely on the palace's central axis and was where emperors held major ceremonies like declaring war or receiving prisoners of war.
      
      💡 For international students: Think of it as your country's main national gate, but specifically designed for the emperor—much more grand and ceremonial than ordinary city gates.`,
    },
    taihedian: {
      zh: `【太和殿】是紫禁城中最重要的建筑，也叫"金銮殿"。它是皇帝举行登基大典、婚礼、寿诞等重大仪式的地方。太和殿的屋顶使用了最高等级的"重檐庑殿顶"，显示出主人的尊贵身份。
      
      💡 给留学生的提示：太和殿就像一个大公司的"总部会议室"，但不是普通的会议室——它是用来举行公司最重要活动的地方，而且这家公司是整个国家的"老板"。
      
      🔑 关键词：重檐庑殿顶是中国古建筑中等级最高的屋顶形式，只有皇家建筑才能使用。`,
      en: `The Hall of Supreme Harmony (Taihe Dian) is the most important building in the Forbidden City, also known as the "Golden Throne Hall." It hosted the emperor's enthronement ceremonies, weddings, and birthday celebrations.
      
      💡 For international students: Imagine this as a company's main boardroom, but it's where the most critical company events happen, and this company is run by the emperor of an entire country.
      
      🔑 Key term: The "double-eaved hip roof" is the highest-rank roof style in Chinese architecture—only imperial buildings could use it.`,
    },
    jiulongbi: {
      zh: `【九龙壁】是一面用彩色琉璃砖拼砌成的墙壁，上面有九条形态各异的龙。九条龙象征着"九五之尊"，即皇帝是天下最尊贵的人。
      
      💡 给留学生的提示：在龙的中间有一条金色的龙（正面龙），它的爪子是五趾的，象征皇帝的身份；而其他八条龙是四趾的，代表贵族。这个设计是为了强调皇帝的独一无二。
      
      🎨 有趣的是，这条金色龙的龙腹处有一块砖是用木头做的！据说当年工匠不小心打碎了一块砖，害怕被处死，就用木头雕刻了一块冒充。`,
      en: `The Nine Dragon Wall is a magnificent wall made of colored glazed tiles, featuring nine uniquely shaped dragons. The nine dragons symbolize "the supreme ruler" - the emperor being the most honored person under heaven.
      
      💡 For international students: Interestingly, one tile in the golden dragon's belly is actually made of wood! Legend says a craftsman accidentally broke a tile, feared punishment, and secretly replaced it with a wooden carving.`,
    },
  }

  // 根据建筑ID获取汉学内容，没有则生成通用内容
  const content = sinologyData[building.id] || {
    zh: `【${name}】${pinyin ? `（${pinyin}）` : ''}是紫禁城中的一座重要建筑。${functionText ? `它的功能属于"${functionText}"，${typeText ? `形制属于"${typeText}"。` : ''}` : ''}
    
    💡 给留学生的提示：故宫的每座建筑都不只是房子，它们都是有故事的。这些建筑共同构成了一个巨大的"空间故事"，讲述着中国古代的政治制度、生活方式和审美观念。
    
    🔑 学习建议：当你参观故宫时，试着用"功能-形制-文化"三维度来观察每座建筑，你会惊讶地发现它们之间的联系竟然如此紧密。`,
    en: `${name}${pinyin ? ` (${pinyin})` : ''} is an important building in the Forbidden City. ${functionText ? `Its function falls under "${functionText}", ${typeText ? `and its typology belongs to "${typeText}".` : ''}` : ''}
    
    💡 For international students: Each building in the Forbidden City is more than just a structure—they all have stories to tell. Together, they form a grand "spatial narrative" about ancient Chinese politics, lifestyle, and aesthetics.
    
    🔑 Learning tip: When visiting the Forbidden City, try observing each building through three dimensions: function, typology, and culture. You'll be amazed at how interconnected they are!`,
  }

  return `
    <article class="building-record building-record--sinology">
      <section class="building-record__summary">
        <div class="info-body" style="white-space:pre-line;line-height:1.85;">${escapeHTML(isZh() ? content.zh : content.en)}</div>
      </section>
    </article>
  `
}

/* =====================================================
   建筑关系网（ECharts Graph）
   ===================================================== */

// 分类颜色映射（与 CATEGORIES 顺序对应）
const CATEGORY_COLORS = [
  '#556f5f',
  '#9a512b',
  '#7b6850',
  '#836033',
  '#b88a35',
  '#756285',
  '#5e8066',
]

function buildGraphData(centerName) {
  const relations = BUILDING_RELATIONS[centerName] || []
  const centerMeta = NODE_META[centerName] || { category: 0 }

  const nodes = [
    {
      name: centerName,
      category: centerMeta.category,
      symbolSize: 64,
      isCenter: true
    },
    ...relations.map(item => ({
      name: item.target,
      category: (NODE_META[item.target] || {}).category ?? 0,
      symbolSize: 38,
      isCenter: false
    }))
  ]

  const links = relations.map(item => ({
    source: centerName,
    target: item.target,
    value: item.value,
    relationType: item.type
  }))

  return { nodes, links }
}

function initGraphChart() {
  if (!window.echarts) return
  const container = $('#relation-graph')
  if (!container) return
  relationChart = echarts.init(container)
  relationChart.on('click', (params) => {
    if (params?.data?.name && params.dataType === 'node') {
      const clickedName = params.data.name
      const buildingEntry = Object.values(BUILDINGS).find(b => b.name === clickedName)
      if (buildingEntry) {
        selectBuilding(buildingEntry.id)
      }
    }
  })
  renderGraph()
}

function renderGraph() {
  if (!relationChart) return
  const centerName = state.selectedBuilding
    ? (BUILDINGS[state.selectedBuilding]?.name || '午门')
    : '午门'
  const { nodes, links } = buildGraphData(centerName)

  relationChart.setOption({
    animation: true,
    animationDuration: 600,
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(40,24,15,0.92)',
      borderColor: 'rgba(255,231,173,0.18)',
      textStyle: { color: '#fff4d8' },
      formatter: (params) => {
        if (params.dataType === 'node') return params.name
        if (params.dataType === 'edge') return params.data.relationType || ''
        return ''
      }
    },
    series: [{
      type: 'graph',
      layout: 'force',
      symbol: 'circle',
      categories: CATEGORIES.map(c => ({ name: c.name })),
      data: nodes.map(n => ({
        name: n.name,
        category: n.category,
        symbolSize: n.symbolSize,
        itemStyle: {
          color: n.isCenter ? '#c18a3b' : CATEGORY_COLORS[n.category] || '#8a7a6a',
          borderColor: n.isCenter ? '#e8c86a' : 'rgba(255,255,255,0.4)',
          borderWidth: n.isCenter ? 2.5 : 1.5,
          shadowBlur: n.isCenter ? 16 : 8,
          shadowColor: n.isCenter ? 'rgba(193,138,59,0.5)' : 'rgba(90,122,138,0.2)',
        },
        label: {
          show: true,
          position: 'bottom',
          formatter: n.name,
          fontSize: n.isCenter ? 12 : 10,
          fontWeight: n.isCenter ? 'bold' : 'normal',
          color: '#3d3d3d',
          backgroundColor: 'rgba(252,253,250,0.85)',
          borderRadius: 3,
          padding: [2, 4],
        }
      })),
      links: links.map(l => ({
        source: l.source,
        target: l.target,
        value: l.value,
        relationType: l.relationType,
        lineStyle: {
          color: '#b88a35',
          opacity: 0.55,
          width: l.value > 3 ? 2.5 : 1.5,
          curveness: 0.2,
        },
        label: { show: false }
      })),
      emphasis: {
        scale: true,
        focus: 'adjacency',
        lineStyle: { color: '#c18a3b', opacity: 1, width: 3 }
      },
      force: {
        repulsion: 90,
        gravity: 0.08,
        edgeLength: [70, 140],
        layoutAnimation: true,
      },
      roam: false,
      draggable: false,
      label: { show: false },
    }]
  }, true)
}

function renderKeywordPanel() {
  const container = $('#keyword-panel')
  if (!container) return

  const centerName = state.selectedBuilding
    ? (BUILDINGS[state.selectedBuilding]?.name || '午门')
    : '午门'
  const kw = BUILDING_KEYWORDS[centerName]

  if (!kw) {
    container.innerHTML = `<div class="overview-empty" style="padding:16px;font-size:13px;">${pick('暂无关键词数据', 'No keyword data')}</div>`
    return
  }

  const renderGroup = (label, items) => {
    if (!items || !items.length) return ''
    return `
      <div class="keyword-group">
        <div class="keyword-group__label">${label}</div>
        <div class="keyword-group__tags">
          ${items.map(t => `<span class="keyword-tag">${escapeHTML(t)}</span>`).join('')}
        </div>
      </div>
    `
  }

  container.innerHTML = `
    ${renderGroup(pick('建筑类别', 'Category'), kw.category)}
    ${renderGroup(pick('空间角色', 'Spatial Role'), kw.role)}
    ${renderGroup(pick('形制关键词', 'Form Keywords'), kw.form)}
    ${renderGroup(pick('文化关键词', 'Cultural Keywords'), kw.culture)}
  `
}

function renderInfo() {
  const scope = getCurrentScope()
  stopCategoryCarousel()

  const ac = els.archiveCard
  const ca = els.cardContentArchive
  const ce = els.cardContentEvent
  const cs = els.cardContentSinology
  const introCard = els.categoryIntroCard
  if (!ac || !ca || !ce) return

  if (scope.kind === 'building') {
    if (introCard) introCard.hidden = true
    ac.hidden = false

    // 顶栏：建筑图 + 名称（始终显示当前建筑）
    const heroEl = els.archiveCardHero
    if (heroEl) heroEl.innerHTML = buildArchiveHeroHTML(scope.item)

    // 写入三个内容槽（三个 builder 已去掉重复 header）
    ca.innerHTML = buildBuildingArchiveHTML(scope.item)
    ce.innerHTML = buildBuildingEventHTML(scope.item)
    if (cs) cs.innerHTML = buildBuildingSinologyHTML(scope.item)

    // Tab 切换：仅当前槽显示
    ca.classList.toggle('is-active', state.archiveCardTab === 'archive')
    ce.classList.toggle('is-active', state.archiveCardTab === 'event')
    if (cs) cs.classList.toggle('is-active', state.archiveCardTab === 'sinology')

    // 让滚动回到顶部
    const body = document.querySelector('.archive-card-body')
    if (body) body.scrollTop = 0
    return
  }

  if (scope.kind === 'function') {
    ac.hidden = true
    if (introCard) introCard.hidden = false
    const intro = CATEGORY_INTROS[scope.item.id]
    const ids = intro?.buildingIds || scope.item.ids
    renderCategoryIntroHeader(scope)
    renderCategoryBuildingList(ids, scope.item.color)
    startCategoryCarousel(collectCarouselUrlsFromBuildingIds(ids))
    return
  }

  if (scope.kind === 'type') {
    ac.hidden = true
    if (introCard) introCard.hidden = false
    const source = TYPE_GROUP_META[scope.item.id]?.source
    const intro = source ? COMPONENT_TYPE_INTROS[source] : null
    const ids = intro?.buildingIds || scope.item.ids
    renderCategoryIntroHeader(scope)
    renderCategoryBuildingList(ids, scope.item.color)
    startCategoryCarousel(collectCarouselUrlsFromBuildingIds(ids))
    return
  }

  // 无建筑：回退午门
  if (!state.selectedBuilding) selectBuilding('wumen', null)
}

function initGraph() {
  initGraphChart()
}

function renderCharts() {
  // 柱状图已移除，仅保留空函数保持兼容性
}


function getThoughtTab() {
  return THOUGHT_TABS[state.thoughtTab] || THOUGHT_TABS.axis
}

function getThoughtFocus() {
  const tab = getThoughtTab()
  return tab.focuses.find((item) => item.id === state.thoughtFocus) || tab.focuses[0]
}

function resetThoughtStageCache() {
  if (els.thoughtSvgHost) {
    els.thoughtSvgHost.innerHTML = ''
    delete els.thoughtSvgHost.dataset.currentFile
  }
  if (els.thoughtStageDecor) {
    els.thoughtStageDecor.innerHTML = ''
  }
  const yyMapContainer = document.getElementById('yy-map-container')
  if (yyMapContainer) yyMapContainer.remove()
  const thoughtStageCard = els.thoughtStage?.closest('.thought-stage-card')
  if (thoughtStageCard) {
    thoughtStageCard.classList.remove('yy-stage-override')
  }
  const thoughtSideColumn = document.querySelector('.thought-side-column')
  if (thoughtSideColumn) {
    thoughtSideColumn.classList.remove('yy-active', 'axis-active', 'fs-active')
  }
  if (els.thoughtSideVisual) els.thoughtSideVisual.classList.remove('fs-side-visual')
  if (els.thoughtSideFocus) els.thoughtSideFocus.classList.remove('fs-side-focus')
  if (els.thoughtSecondaryTabs) {
    els.thoughtSecondaryTabs.classList.remove('yy-tabs-active', 'axis-tabs-active', 'fs-tabs-active')
    const controlCard = els.thoughtSecondaryTabs.closest('.thought-control-card')
    if (controlCard) {
      controlCard.classList.remove('yy-control-active', 'axis-control-active', 'fs-control-active')
    }
    const detailColumn = els.thoughtSecondaryTabs.closest('.thought-detail-column')
    if (detailColumn) {
      detailColumn.classList.remove('yy-detail-active', 'axis-detail-active', 'fs-detail-active')
    }
  }
  thoughtHotspots = []
  hideThoughtTooltip()
}

function selectThoughtTab(tabId) {
  const tab = THOUGHT_TABS[tabId]
  if (!tab) return
  state.thoughtTab = tabId
  state.thoughtFocus = tab.focuses[0]?.id || null
  state.thoughtSelectedBuilding = null
  state.thoughtHoveredHotspotId = null
  resetThoughtStageCache()
  renderThoughtModule()
}

function selectThoughtFocus(focusId) {
  const tab = getThoughtTab()
  const next = tab.focuses.find((item) => item.id === focusId)
  if (!next) return
  state.thoughtFocus = focusId
  state.thoughtSelectedBuilding = null
  renderThoughtModule()
}

function selectThoughtBuilding(buildingId) {
  if (!buildingId) return
  state.thoughtSelectedBuilding = state.thoughtSelectedBuilding === buildingId ? null : buildingId
  renderThoughtModule()
}

function getThoughtBuildingNote(buildingId) {
  const building = getBuilding(buildingId)
  if (!building) return null
  const functionGroup = getFunctionOfBuilding(buildingId)
  const typeGroup = getTypeOfBuilding(buildingId)
  const title = isZh() ? building.name : (building.nameEn || building.name)
  const subtitle = [
    !isZh() ? (building.pinyin || '') : '',
    functionGroup ? pick(functionGroup.labelZh, functionGroup.labelEn) : '',
    typeGroup ? pick(typeGroup.labelZh, typeGroup.labelEn) : '',
  ].filter(Boolean).join(' · ')
  const body = isZh() ? (building.archive || '暂无建筑说明。') : (building.archiveEn || building.archive || 'No building note available.')
  return { title, subtitle, body }
}

function toStagePos(buildingId) {
  const building = getBuilding(buildingId)
  if (!building?.center) return { left: '50%', top: '50%' }
  return {
    left: `${(building.center.x / SVG_WIDTH) * 100}%`,
    top: `${(building.center.y / SVG_HEIGHT) * 100}%`,
  }
}

function buildThoughtPrimaryTabs(tab) {
  return THOUGHT_TAB_ORDER.map((id) => {
    const item = THOUGHT_TABS[id]
    const mainLabel = isZh() ? item.titleZh : (item.titleEn || item.titleZh)
    const subLabel = !isZh() ? getThoughtTabPinyin(id) : ''
    return `
      <button class="thought-primary-tab${tab.id === id ? ' active' : ''}" type="button" data-thought-tab="${id}" role="tab" aria-selected="${String(tab.id === id)}">
        <span class="thought-primary-tab__zh">${escapeHTML(mainLabel)}</span>
        ${subLabel ? `<span class="thought-primary-tab__en">${escapeHTML(subLabel)}</span>` : ''}
      </button>
    `
  }).join('')
}

function buildThoughtSecondaryTabs(tab, focus) {
  return tab.focuses.map((item) => `
    <button class="thought-secondary-tab${item.id === focus.id ? ' active' : ''}" type="button" data-thought-focus="${item.id}">
      <span class="thought-secondary-tab__main">${escapeHTML(isZh() ? item.labelZh : (item.labelEn || item.labelZh))}</span>
      ${!isZh() && getThoughtFocusPinyin(item.id) ? `<span class="thought-secondary-tab__sub">${escapeHTML(getThoughtFocusPinyin(item.id))}</span>` : ''}
    </button>
  `).join('')
}

function buildThoughtStatusItems(focus) {
  return (focus.statusItems || []).map((item) => `
    <span class="thought-status-item"><span class="thought-status-item__dot" style="--dot-color:${escapeHTML(item.color || '#b88a35')};"></span>${escapeHTML(pick(item.labelZh, item.labelEn || item.labelZh))}</span>
  `).join('')
}

function buildThoughtMediaBody(tab, focus) {
  const videoCandidates = getThoughtVideoCandidates(focus)
  const primaryVideo = videoCandidates[0]
  const posterLines = (focus.statusItems || []).slice(0, 3).map((item) => `
    <span class="thought-media-tag">
      <span class="thought-status-item__dot" style="--dot-color:${escapeHTML(item.color || '#b88a35')};"></span>
      ${escapeHTML(pick(item.labelZh, item.labelEn || item.labelZh))}
    </span>
  `).join('')
  return `
    <article class="thought-video-card">
      <div class="thought-video-frame" data-video-lightbox-src="${escapeHTML(primaryVideo)}" data-video-label="${escapeHTML(pick(focus.labelZh, focus.labelEn || focus.labelZh))}" role="button" tabindex="0" aria-label="${escapeHTML(pick('放大查看视频', 'Open video preview'))}">
        <video class="thought-video-frame__media" controls playsinline preload="metadata">
          ${videoCandidates.map((src) => {
            const ext = src.split('.').pop()?.toLowerCase()
            const mime = ext === 'webm' ? 'video/webm' : ext === 'mov' ? 'video/quicktime' : 'video/mp4'
            return `<source src="${escapeHTML(src)}" type="${mime}">`
          }).join('')}
        </video>
        <span class="thought-video-frame__overlay">
          <span class="thought-video-frame__play">${pick('放大查看', 'Expand')}</span>
        </span>
      </div>
      <div class="thought-video-meta">
        <div class="thought-video-meta__title">${escapeHTML(pick(focus.posterTitleZh, focus.posterTitleEn || focus.posterTitleZh))}</div>
        <p class="thought-video-meta__body">${escapeHTML(pick(focus.posterBodyZh, focus.posterBodyEn || focus.posterBodyZh))}</p>
        <code class="thought-video-meta__path">${escapeHTML(primaryVideo)}</code>
      </div>
    </article>
    <article class="thought-poster thought-poster--summary">
      <div class="thought-poster__title">${escapeHTML(pick(tab.stageTitleZh, tab.stageTitleEn || tab.stageTitleZh))}</div>
      <div class="thought-poster__body">${escapeHTML(pick(tab.stageHintZh, tab.stageHintEn || tab.stageHintZh))}</div>
      <div class="thought-media-tags">${posterLines}</div>
    </article>
  `
}

function buildThoughtSideVisual(tab, focus) {
  const items = focus.sideItems || []
  const classes = focus.id === 'outer-inner' ? 'thought-zone-grid' : (items.length >= 4 ? 'thought-chip-grid' : 'thought-axis-list')
  return `<div class="${classes}">${items.map((item) => `
    <button class="thought-side-btn${state.thoughtSelectedBuilding === item.buildingId ? ' is-selected' : ''}" type="button" data-thought-building="${escapeHTML(item.buildingId)}">
      <span class="thought-side-btn__title">${escapeHTML(pick(item.titleZh, item.titleEn || item.titleZh))}</span>
      <span class="thought-side-btn__meta">${escapeHTML(pick(item.metaZh, item.metaEn || item.metaZh || ''))}</span>
    </button>
  `).join('')}</div>`
}

function buildThoughtTextBody(tab, focus) {
  // 汉学解析内容：帮助留学生理解中国古建筑文化
  const sinologyIntro = {
    axis: {
      zh: `【中轴礼序】是紫禁城空间组织的核心法则。整座宫城以南北向的中轴线为脊，两侧建筑左右对称排列，形成庄严有序的空间序列。这条中轴不是简单的几何线，而是一条"权力叙事线"。
      
      从南到北，这条轴线依次经过：
      午门（礼仪入口）→ 太和门（过渡空间）→ 太和殿（权力中心）→ 中和殿（礼仪调节）→ 保和殿（盛大仪式）→ 乾清门（内外分界）→ 乾清宫（皇帝居所）→ 坤宁宫（皇后居所）→ 神武门（轴线终点）

      💡 留学生提示：想象这是从一个城市的最南端到最北端画一条直线，这条线上站满了最重要的"大Boss"和他们的办公场所。这种设计叫做"居中为尊"——最重要的位置永远在线的正中间。

      🔑 关键词解析：
      · 中轴线：从南到北贯穿紫禁城的中心线
      · 左右对称：建筑在轴线两边镜像排列
      · 礼序：礼仪秩序，即各种重要活动的顺序和位置安排`,
      en: `The Central Axis (Zhongzhou Lixu) is the core organizing principle of the Forbidden City. The entire palace complex is arranged symmetrically on either side of a north-south central axis, creating a solemn and orderly spatial sequence.
      
      From south to north, the axis passes through:
      Meridian Gate → Gate of Supreme Harmony → Hall of Supreme Harmony → Hall of Central Harmony → Hall of Preserving Harmony → Gate of Heavenly Purity → Palace of Heavenly Purity → Palace of Earthly Tranquility → Gate of Divine Might

      💡 For international students: Imagine drawing a straight line from the southernmost to the northernmost point of a city, and placing the most important "big bosses" and their offices along this line. This design principle is called "central supremacy" — the most important position is always exactly in the middle.
      
      🔑 Key terms:
      · Central Axis: The north-south line running through the center of the Forbidden City
      · Bilateral symmetry: Buildings arranged as mirror images on either side
      · Ritual order: The sequence and placement of important ceremonial activities`,
    },
    yinyang: {
      zh: `【阴阳五行】是中国古代理解世界的哲学框架，故宫的空间布局处处体现这一思想。

      阴阳观念：
      · 阴阳代表相对的两面：明/暗、外/内、刚/柔
      · 外朝（三大殿）是"阳"——开阔、宏大、对外展示皇权
      · 内廷（乾清宫等）是"阴"——私密、精致、皇帝日常生活
      · 两者通过乾清门分界，形成"外阳内阴"的格局

      五行观念：
      · 五行（木、火、土、金、水）对应五个方位
      · 木在东（青龙）、火在南（朱雀）
      · 土在中央、金在西（白虎）、水在北（玄武）
      · 故宫的布局暗合这一方位体系

      💡 留学生提示：阴阳就像是一个开关的开和关，五行就像是一个家庭的五个成员——每个都有自己的位置和角色，一起构成了一个完整的系统。

      🔑 趣味知识：阴阳鱼图（太极图）中的"鱼眼"代表阴中有阳、阳中有阴，这是中国古代的辩证思维。`,
      en: `The Yin-Yang and Five Elements (Wuxing) system is a philosophical framework ancient Chinese used to understand the world, and the Forbidden City's spatial layout reflects this thinking throughout.

      Yin-Yang concept:
      · Yin and Yang represent opposite aspects: bright/dark, outer/inner, rigid/flexible
      · The Outer Court (three main halls) is "Yang" — open, grand, displaying imperial power
      · The Inner Court (Palace of Heavenly Purity, etc.) is "Yin" — private, refined, for the emperor's daily life
      · They are divided by the Gate of Heavenly Purity, forming an "outer-Yang, inner-Yin" pattern

      Five Elements concept:
      · The five elements (Wood, Fire, Earth, Metal, Water) correspond to five directions
      · Wood is in the east (Azure Dragon), Fire is in the south (Vermilion Bird)
      · Earth is in the center, Metal is in the west (White Tiger), Water is in the north (Black Tortoise)
      · The Forbidden City's layout secretly follows this directional system

      💡 For international students: Think of Yin-Yang as a light switch's on and off, and the Five Elements as five family members — each has their own position and role, together forming a complete system.

      🔑 Fun fact: The "fish eye" in the Yin-Yang diagram (Taijitu) represents Yin within Yang and Yang within Yin — this is ancient Chinese dialectical thinking.`,
    },
    fengshui: {
      zh: `【风水格局】是中国古代选择和营造建筑环境的重要学问，故宫选址和布局充分运用了风水原理。

      风水要素：
      · 玄武（北）：景山作为背山，稳固可靠
      · 朱雀（南）：金水河蜿蜒前方，活水聚财
      · 青龙（东）：东向阳光充足，生机勃勃
      · 白虎（西）：西向相对平静，收敛气场
      · 中央：紫禁城核心，藏风聚气

      "背山面水"格局：
      故宫北依景山，南临金水河，形成"负阴抱阳"的理想格局——冬天阻挡北风，夏天迎纳南风，是生态智慧的体现。

      💡 留学生提示：风水简单来说就是"环境和人的关系学"。好的风水就是让建筑和环境互相配合，让人住得舒服、做事顺利。故宫的选址和布局就是古代的"最佳实践"。

      🔑 现代意义：虽然风水常被迷信化，但它本质上是一种考虑地形、气候、水源、光照的综合建筑规划智慧。`,
      en: `Feng Shui is an important knowledge system ancient Chinese used for selecting and creating building environments, and the Forbidden City's location and layout fully applied Feng Shui principles.

      Feng Shui elements:
      · Xuanwu (North): Prospect Hill as the backing mountain, stable and reliable
      · Zhuque (South): The Jinshui River winding in front, flowing water gathering wealth
      · Qinglong (East): Eastern sunlight, full of vitality
      · Baihu (West): Western side relatively peaceful, gathering energy
      · Center: The core of the Forbidden City, concealing wind and gathering energy

      "Backed by mountain, facing water" pattern:
      The Forbidden City is north-backed by Prospect Hill and south-facing the Jinshui River, forming an ideal "embracing Yin, holding Yang" pattern — blocking northern winds in winter and welcoming southern winds in summer, embodying ecological wisdom.

      💡 For international students: Simply put, Feng Shui is the "study of the relationship between environment and people." Good Feng Shui means buildings and environment mutually cooperate, making people comfortable and things go smoothly. The Forbidden City's location and layout is the ancient "best practice."

      🔑 Modern significance: Although Feng Shui is often mystified, at its core it's a comprehensive architectural planning wisdom considering terrain, climate, water sources, and lighting.`,
    },
  }

  const currentSinology = sinologyIntro[tab.id] || sinologyIntro.axis

  const intro = `
    <section class="thought-text-section">
      <h4 class="thought-text-section__title">${escapeHTML(isZh() ? tab.titleZh : withPinyin(tab.titleEn || tab.titleZh, getThoughtTabPinyin(tab.id)))}</h4>
      <p class="thought-text-section__body">${escapeHTML(pick(tab.statusZh, tab.statusEn || tab.statusZh))}</p>
    </section>
  `

  // 汉学解析段落
  const sinologySection = `
    <section class="thought-text-section thought-sinology-section">
      <h4 class="thought-text-section__title">${escapeHTML(pick('汉学解析', 'Sinology Insights'))}</h4>
      <p class="thought-text-section__body" style="white-space:pre-line;">${escapeHTML(isZh() ? currentSinology.zh : currentSinology.en)}</p>
    </section>
  `

  const sections = (focus.detailSections || []).map((section) => `
    <section class="thought-text-section">
      <h4 class="thought-text-section__title">${escapeHTML(pick(section.titleZh, section.titleEn || section.titleZh))}</h4>
      <p class="thought-text-section__body">${escapeHTML(pick(section.bodyZh, section.bodyEn || section.bodyZh))}</p>
    </section>
  `).join('')

  const note = state.thoughtSelectedBuilding ? getThoughtBuildingNote(state.thoughtSelectedBuilding) : null
  const noteHtml = note ? `
    <section class="thought-building-note">
      <h4 class="thought-building-note__title">${escapeHTML(note.title)}</h4>
      ${note.subtitle ? `<div class="info-subtitle" style="margin-bottom:8px;">${escapeHTML(note.subtitle)}</div>` : ''}
      <p class="thought-building-note__body">${escapeHTML(note.body)}</p>
    </section>
  ` : ''

  return intro + sinologySection + sections + noteHtml
}

function buildThoughtStageSummary(tab, focus, lines) {
  return `
    <article class="thought-stage-summary">
      <div class="thought-stage-summary__eyebrow">${escapeHTML(pick(tab.titleZh, tab.titleEn || tab.titleZh))}</div>
      <h4 class="thought-stage-summary__title">${escapeHTML(pick(focus.labelZh, focus.labelEn || focus.labelZh))}</h4>
      <p class="thought-stage-summary__body">${escapeHTML(pick(focus.posterBodyZh, focus.posterBodyEn || focus.posterBodyZh))}</p>
      <div class="thought-stage-summary__list">
        ${lines.map((line) => `<span class="thought-stage-summary__item">${escapeHTML(line)}</span>`).join('')}
      </div>
    </article>
  `
}

function buildThoughtStageDecor(tab, focus) {
  if (tab.id === 'axis') {
    return `
      <div class="thought-axis-line"></div>
      ${buildThoughtStageSummary(tab, focus, [
        pick('由南向北，礼序逐级抬升', 'The sequence rises from south to north'),
        pick('中轴强化，左右作为陪衬', 'The central axis leads while the sides recede'),
        pick('从城门到宫门再到殿宇，层层递进', 'Gates, courts, and halls advance in layers'),
      ])}
    `
  }

  if (tab.id === 'yinyang') {
    if (focus.id === 'outer-inner') {
      return `
        <div class="thought-yinyang-field"></div>
        <span class="thought-direction-chip" style="left:50%;top:26%;">${escapeHTML(isZh() ? '阳 · 外朝' : withPinyin('Yang · Outer Court', 'Yáng · Wài Cháo'))}</span>
        <span class="thought-direction-chip" style="left:50%;top:69%;">${escapeHTML(isZh() ? '阴 · 内廷' : withPinyin('Yin · Inner Court', 'Yīn · Nèi Tíng'))}</span>
        ${buildThoughtStageSummary(tab, focus, [
          pick('先分外朝与内廷，再读阴阳平衡', 'Read the outer-inner split before the balance'),
          pick('交泰殿承担阴阳会通的节点作用', 'The Hall of Union mediates both forces'),
          pick('空间尺度由公开走向私密', 'The scale shifts from public to private'),
        ])}
      `
    }
    return `
      <div class="thought-yinyang-field"></div>
      <span class="thought-direction-chip" style="left:78%;top:38%;">${escapeHTML(isZh() ? '木 · 东' : withPinyin('Wood · East', 'Mù · Dōng'))}</span>
      <span class="thought-direction-chip" style="left:50%;top:84%;">${escapeHTML(isZh() ? '火 · 南' : withPinyin('Fire · South', 'Huǒ · Nán'))}</span>
      <span class="thought-direction-chip" style="left:50%;top:49%;">${escapeHTML(isZh() ? '土 · 中' : withPinyin('Earth · Center', 'Tǔ · Zhōng'))}</span>
      <span class="thought-direction-chip" style="left:22%;top:38%;">${escapeHTML(isZh() ? '金 · 西' : withPinyin('Metal · West', 'Jīn · Xī'))}</span>
      <span class="thought-direction-chip" style="left:50%;top:17%;">${escapeHTML(isZh() ? '水 · 北' : withPinyin('Water · North', 'Shuǐ · Běi'))}</span>
      ${buildThoughtStageSummary(tab, focus, [
        pick('五行与五方同步落位', 'Five elements align with five directions'),
        pick('中央统摄，四方分工', 'The center governs while the four sides specialize'),
        pick('方位、色彩与功能被统一编码', 'Direction, color, and function form one code'),
      ])}
    `
  }

  return `
    <div class="thought-fengshui-field"></div>
    <span class="thought-guard-chip" style="left:50%;top:12%;">${escapeHTML(isZh() ? '景山 · 玄武' : withPinyin('Prospect Hill · North Guard', 'Jǐng Shān · Xuán Wǔ'))}</span>
    <span class="thought-guard-chip" style="left:50%;top:88%;">${escapeHTML(isZh() ? '金水河 · 朱雀' : withPinyin('Jinshui River · South Guard', 'Jīn Shuǐ Hé · Zhū Què'))}</span>
    <span class="thought-guard-chip" style="left:18%;top:50%;">${escapeHTML(isZh() ? '东 · 青龙' : withPinyin('East · Azure Dragon', 'Dōng · Qīng Lóng'))}</span>
    <span class="thought-guard-chip" style="left:82%;top:50%;">${escapeHTML(isZh() ? '西 · 白虎' : withPinyin('West · White Tiger', 'Xī · Bái Hǔ'))}</span>
    <span class="thought-guard-chip" style="left:50%;top:50%;">${escapeHTML(isZh() ? '紫禁城核心' : withPinyin('Forbidden City Core', 'Zǐ Jìn Chéng'))}</span>
    ${buildThoughtStageSummary(tab, focus, [
      pick('北有景山为靠，南有金水河为迎', 'Prospect Hill backs the north and the river greets the south'),
      pick('环境、朝向与礼制共同构成宫城格局', 'Environment, orientation, and ritual form one setting'),
      pick('风、水、光线被转化为空间秩序', 'Wind, water, and light become spatial order'),
    ])}
  `
}

function renderThoughtOverview() {
  if (state.thoughtTab === 'axis' && typeof Module2 !== 'undefined' && typeof Module2.refreshMapHighlights === 'function') {
    Module2.refreshMapHighlights()
    return
  }
  if (state.thoughtTab === 'yinyang' || state.thoughtTab === 'fengshui') {
    return
  }
  const focus = getThoughtFocus()
  const focusIds = new Set(focus.buildingIds || [])
  thoughtHotspots.forEach((hotspot) => {
    const node = hotspot.overlayEl
    if (!node) return
    const hovered = state.thoughtHoveredHotspotId === hotspot.hotspotId
    const selected = state.thoughtSelectedBuilding === hotspot.buildingId
    const active = focusIds.has(hotspot.buildingId)
    node.classList.toggle('is-hovered', hovered)
    node.classList.toggle('is-selected', selected)
    node.classList.toggle('thought-highlight', active)
    if (active) node.style.setProperty('--thought-highlight-color', focus.color || '#b88a35')
    else node.style.removeProperty('--thought-highlight-color')
  })
}

function renderThoughtModule() {
  const tab = getThoughtTab()
  const focus = getThoughtFocus()
  if (!tab || !focus) return

  // 公共顶栏信息（所有 tab 共享）
  if (els.thoughtModuleKicker) els.thoughtModuleKicker.textContent = pick(MODULES.thought.kickerZh, MODULES.thought.kickerEn)
  if (els.thoughtModuleTitle) els.thoughtModuleTitle.textContent = pick(tab.titleZh, tab.titleEn || tab.titleZh)
  if (els.thoughtModuleStatus) els.thoughtModuleStatus.textContent = pick('左辅 · 中主 · 右控', 'Left aid · center stage · right control')
  if (els.thoughtPrimaryTabs) els.thoughtPrimaryTabs.innerHTML = buildThoughtPrimaryTabs(tab)

  // === 阴阳五行：完全由 YinyangModule 接管渲染 ===
  if (state.thoughtTab === 'yinyang' && typeof YinyangModule !== 'undefined') {
    YinyangModule.render()
    return
  }

  // 以下为非 yinyang tab 的默认渲染流程
  if (els.thoughtSideTitle) els.thoughtSideTitle.textContent = pick(tab.sideTitleZh, tab.sideTitleEn || tab.sideTitleZh)
  if (els.thoughtSideDesc) els.thoughtSideDesc.textContent = pick(tab.sideDescZh, tab.sideDescEn || tab.sideDescZh)
  if (els.thoughtSideVisual) els.thoughtSideVisual.innerHTML = buildThoughtSideVisual(tab, focus)
  if (els.thoughtSideFocus) els.thoughtSideFocus.textContent = pick(focus.posterBodyZh, focus.posterBodyEn || focus.posterBodyZh)
  if (els.thoughtStageEyebrow) els.thoughtStageEyebrow.textContent = 'Overview'
  if (els.thoughtStageTitle) els.thoughtStageTitle.textContent = pick(tab.stageTitleZh, tab.stageTitleEn || tab.stageTitleZh)
  if (els.thoughtStageHint) els.thoughtStageHint.textContent = ''
  if (els.thoughtSecondaryTabs) els.thoughtSecondaryTabs.innerHTML = buildThoughtSecondaryTabs(tab, focus)
  if (els.thoughtStatusList) els.thoughtStatusList.innerHTML = buildThoughtStatusItems(focus)
  if (els.thoughtMediaEyebrow) els.thoughtMediaEyebrow.textContent = pick('文化视频', 'Culture Video')
  if (els.thoughtMediaTitle) els.thoughtMediaTitle.textContent = pick(focus.labelZh, focus.labelEn || focus.labelZh)
  if (els.thoughtMediaBody) els.thoughtMediaBody.innerHTML = buildThoughtMediaBody(tab, focus)
  if (els.thoughtTextEyebrow) els.thoughtTextEyebrow.textContent = pick('内容解释与汉学解析', 'Interpretation & Sinology')
  if (els.thoughtTextTitle) els.thoughtTextTitle.textContent = pick(focus.labelZh, focus.labelEn || focus.labelZh)
  if (els.thoughtTextBody) els.thoughtTextBody.innerHTML = buildThoughtTextBody(tab, focus)
  if (els.thoughtStageDecor) els.thoughtStageDecor.innerHTML = buildThoughtStageDecor(tab, focus)

  // 对中轴礼序模块的右侧按钮进行覆盖渲染
  if (state.thoughtTab === 'axis' && typeof Module2 !== 'undefined' && typeof Module2.render === 'function') {
    Module2.render()
  }
  // 风水格局模块的右侧按钮覆盖渲染
  if (state.thoughtTab === 'fengshui' && typeof FengshuiModule !== 'undefined' && typeof FengshuiModule.renderButtonsOnly === 'function') {
    FengshuiModule.renderButtonsOnly()
  }

  renderThoughtOverview()

  // 根据当前 tab 切换 SVG 文件
  if (state.thoughtTab === 'fengshui') {
    // 风水格局模块自己管理 SVG 加载与交互
    if (els.thoughtSvgHost && els.thoughtSvgHost.dataset.currentFile !== 'fengshui-overlay') {
      FengshuiModule.init().catch((err) => console.error(err))
    } else if (typeof FengshuiModule !== 'undefined') {
      FengshuiModule.renderAll()
    }
  } else {
    const svgFile = 'overview.svg'
    if (els.thoughtSvgHost && els.thoughtSvgHost.dataset.currentFile !== svgFile) {
      switchThoughtSvg(svgFile).catch((err) => console.error(err))
    }
  }
}

async function switchThoughtSvg(svgFile) {
  if (!els.thoughtSvgHost) return
  const svgPath = `assets/images/map/${svgFile}`
  try {
    const response = await fetch(new URL(svgPath, window.location.href))
    if (!response.ok) throw new Error(`SVG load failed: ${response.status}`)
    els.thoughtSvgHost.innerHTML = await response.text()
    const svg = els.thoughtSvgHost.querySelector('svg')
    if (!svg) throw new Error('SVG root not found')
    svg.removeAttribute('width')
    svg.removeAttribute('height')
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    bindThoughtHotspotsFromSvg(svg)
    els.thoughtSvgHost.dataset.currentFile = svgFile
  } catch (error) {
    console.error(error)
    els.thoughtSvgHost.innerHTML = '<p class="overview-svg-fallback">堪舆总览图加载失败，请检查路径。</p>'
    thoughtHotspots = []
    delete els.thoughtSvgHost.dataset.currentFile
  }
}

/** 在 #thought-svg-host 已注入 markup 后：图层 + 扫描热区 + 绑定（切换 tab 换图时须重新调用） */
function bindThoughtHotspotsFromSvg(svg) {
  const interactionLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  interactionLayer.setAttribute('data-layer', 'hotspot-interaction')
  const overlayLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  overlayLayer.setAttribute('data-layer', 'hotspot-overlay')
  svg.appendChild(interactionLayer)
  svg.appendChild(overlayLayer)

  thoughtHotspots = scanSVGHotspots(svg)
  thoughtHotspots.forEach((hotspot) => {
    hotspot.overlayEl = createHotspotOverlay(svg, hotspot)
    if (hotspot.customPath) {
      const sourceEl = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      sourceEl.setAttribute('d', hotspot.customPath)
      sourceEl.classList.add('overview-region-source')
      sourceEl.style.fill = 'rgba(255,255,255,0.002)'
      hotspot.sourceEl = sourceEl
      svg.querySelector('[data-layer="hotspot-interaction"]').appendChild(sourceEl)
    }
    bindHotspotEvents(hotspot, {
      onHover: (h, e) => {
        state.thoughtHoveredHotspotId = h.hotspotId
        renderThoughtOverview()
        showThoughtTooltip(h, e)
      },
      onLeave: (h) => {
        if (state.thoughtHoveredHotspotId === h.hotspotId) state.thoughtHoveredHotspotId = null
        renderThoughtOverview()
        hideThoughtTooltip()
      },
      onClick: (h) => {
        selectThoughtBuilding(h.buildingId)
        hideThoughtTooltip()
      },
    })
  })
  renderThoughtOverview()
}

function showThoughtTooltip(hotspot, event = null) {
  const tooltip = els.thoughtTooltip
  if (!tooltip) return
  const text = isZh() ? hotspot.labelZh : hotspot.labelEn
  if (!text) return
  tooltip.textContent = text
  tooltip.hidden = false
  let x = 0
  let y = 0
  if (event) {
    x = event.clientX
    y = event.clientY
  } else {
    const node = hotspot.sourceEl || hotspot.group
    if (node) {
      const rect = node.getBoundingClientRect()
      x = rect.left + rect.width / 2
      y = rect.top
    }
  }
  const tooltipRect = tooltip.getBoundingClientRect()
  tooltip.style.left = `${x - tooltipRect.width / 2}px`
  tooltip.style.top = `${y - tooltipRect.height - 16}px`
}

function hideThoughtTooltip() {
  if (els.thoughtTooltip) els.thoughtTooltip.hidden = true
}

async function createThoughtHotspots() {
  if (!els.thoughtSvgHost) return
  // 风水格局有自己的 SVG 加载逻辑
  if (state.thoughtTab === 'fengshui') {
    if (typeof FengshuiModule !== 'undefined') {
      await FengshuiModule.init()
    }
    return
  }
  // 阴阳五行由 YinyangModule 自行管理地图
  if (state.thoughtTab === 'yinyang') {
    if (typeof YinyangModule !== 'undefined') {
      YinyangModule.render()
    }
    return
  }
  const svgFile = 'overview.svg'
  const svgPath = `assets/images/map/${svgFile}`
  try {
    const response = await fetch(new URL(svgPath, window.location.href))
    if (!response.ok) throw new Error(`SVG load failed: ${response.status}`)
    const markup = await response.text()
    els.thoughtSvgHost.innerHTML = markup
    const svg = els.thoughtSvgHost.querySelector('svg')
    if (!svg) throw new Error('SVG root not found')

    svg.removeAttribute('width')
    svg.removeAttribute('height')
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')

    bindThoughtHotspotsFromSvg(svg)
    els.thoughtSvgHost.dataset.currentFile = svgFile
  } catch (error) {
    console.error(error)
    els.thoughtSvgHost.innerHTML = '<p class="overview-svg-fallback">堪舆总览图加载失败，请检查 overview.svg 路径。</p>'
    thoughtHotspots = []
    delete els.thoughtSvgHost.dataset.currentFile
  }
}

function renderComponentShell() {
  if (typeof window.initComponentModule === 'function') {
    window.initComponentModule()
  }
}

function openLightbox(src) {
  const root = document.getElementById('image-lightbox')
  const img = document.getElementById('lightbox-img')
  if (!root || !img || !src) return
  img.src = src
  img.alt = pick('图片放大', 'Image preview')
  root.hidden = false
  document.body.style.overflow = 'hidden'
  root.querySelector('.image-lightbox__close')?.focus()
}

function closeLightbox() {
  const root = document.getElementById('image-lightbox')
  const img = document.getElementById('lightbox-img')
  if (!root) return
  root.hidden = true
  if (img) img.removeAttribute('src')
  document.body.style.overflow = ''
}

function openVideoLightbox(src, label = '') {
  const root = document.getElementById('video-lightbox')
  const video = document.getElementById('lightbox-video')
  const path = document.getElementById('lightbox-video-path')
  if (!root || !video || !src) return
  video.src = src
  video.setAttribute('aria-label', label || pick('文化视频', 'Culture video'))
  if (path) path.textContent = src
  root.hidden = false
  document.body.style.overflow = 'hidden'
  video.play().catch(() => {})
}

function closeVideoLightbox() {
  const root = document.getElementById('video-lightbox')
  const video = document.getElementById('lightbox-video')
  const path = document.getElementById('lightbox-video-path')
  if (!root) return
  root.hidden = true
  if (video) {
    video.pause()
    video.removeAttribute('src')
    video.load()
  }
  if (path) path.textContent = ''
  document.body.style.overflow = ''
}

function bindLightboxEvents() {
  const root = document.getElementById('image-lightbox')
  const videoRoot = document.getElementById('video-lightbox')
  if (root) {
    root.querySelectorAll('[data-lightbox-close]').forEach(function(el) {
      el.addEventListener('click', closeLightbox)
    })
  }
  if (videoRoot) {
    videoRoot.querySelectorAll('[data-video-lightbox-close]').forEach(function(el) {
      el.addEventListener('click', closeVideoLightbox)
    })
  }
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      if (root && !root.hidden) closeLightbox()
      if (videoRoot && !videoRoot.hidden) closeVideoLightbox()
      return
    }
    const trigger = e.target?.closest?.('[data-video-lightbox-src]')
    if (!trigger) return
    if (e.key !== 'Enter' && e.key !== ' ') return
    e.preventDefault()
    const src = trigger.getAttribute('data-video-lightbox-src')
    const label = trigger.getAttribute('data-video-label') || ''
    if (src) openVideoLightbox(src, label)
  })
  document.addEventListener('click', function(e) {
    const trigger = e.target.closest('[data-lightbox-src]')
    if (trigger) {
      e.preventDefault()
      const src = trigger.getAttribute('data-lightbox-src')
      if (src) openLightbox(src)
      return
    }
    const videoTrigger = e.target.closest('[data-video-lightbox-src]')
    if (!videoTrigger) return
    e.preventDefault()
    const src = videoTrigger.getAttribute('data-video-lightbox-src')
    const label = videoTrigger.getAttribute('data-video-label') || ''
    if (src) openVideoLightbox(src, label)
  })
}

function renderAll() {
  setLanguageMode()
  renderHeader()
  renderNav()
  renderLayoutVisibility()
  if (state.module === 'archive') {
    renderGraph()
    renderKeywordPanel()
    renderFilterPanels()
    renderOverview()
    renderInfo()
    renderCharts()
    requestAnimationFrame(() => relationChart?.resize())
  } else if (state.module === 'thought') {
    stopCategoryCarousel()
    renderThoughtModule()
  } else {
    stopCategoryCarousel()
    renderComponentShell()
  }
}

function renderLayoutVisibility() {
  document.querySelectorAll('.module-layout').forEach((el) => {
    const active = el.dataset.layout === state.module
    el.hidden = !active
    el.classList.remove('module-layout--enter')
    if (active) {
      void el.offsetWidth
      el.classList.add('module-layout--enter')
    }
  })
}

async function initApp() {
  bindElements()
  setLanguageMode()
  bindLightboxEvents()
  bindEvents()
  await createHotspots()
  await createThoughtHotspots()
  initGraph()
  // 默认选中午门，首屏显示档案卡
  selectBuilding('wumen', null)
  renderAll()
}

document.addEventListener('DOMContentLoaded', initApp)
