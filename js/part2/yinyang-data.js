/* =====================================================
   js/yinyang-data.js — 阴阳五行 模块数据（重构版）
   汉学深度解读 + 完整交互数据
   ===================================================== */

/* ---------- 按钮分组（可折叠 accordion） ---------- */
const YY_BTN_GROUPS = [
  { id: 'yinyang',  groupZh: '阴阳格局', groupEn: 'Yin-Yang Pattern', ids: ['yang', 'yin'] },
  { id: 'wuxing',   groupZh: '五行方位', groupEn: 'Five Elements',    ids: ['wood', 'fire', 'earth', 'metal', 'water'] },
  { id: 'relation', groupZh: '生克关系', groupEn: 'Cycle & Restraint', ids: ['shengke', 'xiangke', 'waterfire'] },
]

/* ---------- 每个按钮的完整数据 ---------- */
const YY_ITEMS = {
  yang: {
    id: 'yang', mode: 'yinyang',
    labelZh: '外朝阳区', labelEn: 'Outer Court · Yang',
    zoneId: 'zone-yang',
    zoneColor: 'rgba(193,120,50,0.22)', zoneStroke: 'rgba(220,160,70,0.55)', zoneGlow: 'rgba(220,160,70,0.18)',
    dotColor: '35,60%,50%',
    dialYinyang: { centerZh: '阳', centerEn: 'Yáng', descZh: '外朝开阔，主礼制', descEn: 'Open court, governing ritual' },
    dialWuxing:  { centerZh: '火·土', centerEn: 'Fire·Earth', descZh: '礼制彰显，皇权居中', descEn: 'Ritual & centrality' },
    card: {
      titleZh: '外朝属阳', titleEn: 'The Outer Court as Yang',
      briefZh: '南部外朝空间开阔，气势宏大，承载朝会、典礼与皇权展示——紫禁城"阳"的极致表达。',
      briefEn: 'The open southern court hosts ritual and authority — the fullest expression of yang.',
      bodyZh: '《周易·系辞上》曰："一阴一阳之谓道。"紫禁城的空间布局正体现了这一哲学原则。外朝区域位于宫城南部（午门至乾清门之间），以太和殿、中和殿、保和殿三大殿为核心，广场开阔、台基高耸、飞檐重叠，处处彰显"阳刚"与"昭示"。\n\n在传统堪舆学中，南方为阳位，与"火""明""动"对应。外朝正是宫城中最具"公共性"的空间——大朝会、登基、册封、殿试等国家重典皆在此举行。太和殿前的广场可容纳数万人列阵跪拜，空间尺度本身就构成一种权力叙事：越开阔、越崇高，越能体现"天子居中"的宇宙秩序。\n\n外朝的"阳"并非仅指采光或方位，更指向一种空间精神：公开、刚健、通达、威严——这与内廷的"阴"形成互补与平衡。',
      bodyEn: 'The Book of Changes states: "The alternation of yin and yang is called the Way." The Outer Court — spanning from the Meridian Gate to the Gate of Heavenly Purity — centers on three grand halls upon towering terraces, flanked by vast ceremonial plazas.\n\nIn traditional geomancy, the south is the seat of yang: brightness, fire, movement. The Outer Court is the most public domain — hosting grand audiences, enthronements, and imperial examinations. The plaza could hold tens of thousands; its sheer scale forms a spatial narrative of cosmic order.\n\nThe "yang" here signifies more than sunlight; it points to a spatial ethos of openness, strength, and majesty — complementing and balancing the inner court\'s yin.',
      tagsZh: ['外朝','阳','太和殿','礼制','天子居中'], tagsEn: ['Outer Court','Yang','Taihe Hall','Ritual','Centrality'],
    },
  },
  yin: {
    id: 'yin', mode: 'yinyang',
    labelZh: '内廷阴区', labelEn: 'Inner Court · Yin',
    zoneId: 'zone-yin',
    zoneColor: 'rgba(90,130,160,0.18)', zoneStroke: 'rgba(120,165,200,0.45)', zoneGlow: 'rgba(120,165,200,0.14)',
    dotColor: '210,40%,55%',
    dialYinyang: { centerZh: '阴', centerEn: 'Yīn', descZh: '内廷收敛，主起居', descEn: 'Compact and private' },
    dialWuxing:  { centerZh: '水·木·金', centerEn: 'Wa·W·M', descZh: '静气内敛，起居和合', descEn: 'Quiet, harmonious living' },
    card: {
      titleZh: '内廷属阴', titleEn: 'The Inner Court as Yin',
      briefZh: '北部内廷空间收敛，尺度亲切，是帝后起居与家庭和合的场所——紫禁城"阴"之所聚。',
      briefEn: 'The compact northern court hosts daily life and harmony — where yin gathers.',
      bodyZh: '《老子》曰："万物负阴而抱阳，冲气以为和。"内廷区域（乾清宫以北至神武门）是"阴"的空间表达。与外朝的宏大开阔不同，内廷建筑尺度收敛、院落紧凑、回廊曲折，营造出"藏风聚气"的私密氛围。\n\n内廷以"后三宫"（乾清宫、交泰殿、坤宁宫）为核心，两翼为东六宫、西六宫。乾清宫名取"乾天清朗"，坤宁宫名取"坤地安宁"，二者对仗正是"天地""阴阳""帝后"三层象征的叠合。\n\n在堪舆学中，北方为阴位，与"水""暗""静"相对应。内廷花园、假山、内庭等"柔性"空间元素明显增多，空间精神转向内敛、滋养与休止——与外朝刚健之"阳"互为表里。',
      bodyEn: 'The Daodejing states: "All things carry yin and embrace yang, achieving harmony through blending." The Inner Court — from Qianqing Palace to the Gate of Divine Might — embodies yin.\n\nUnlike the outer court\'s grandeur, inner court buildings are smaller, courtyards intimate, corridors winding — creating the geomantic ideal of "sheltering wind and gathering qi." The Three Rear Palaces (Qianqing, Jiaotai, Kunning) house emperor and empress; their names pair Heaven and Earth.\n\nIn geomancy the north is yin: water, stillness, depth. Gardens, rockeries, and intimate halls proliferate — the spatial spirit turns inward, completing the cosmic structure.',
      tagsZh: ['内廷','阴','乾清宫','坤宁宫','藏风聚气'], tagsEn: ['Inner Court','Yin','Qianqing','Kunning','Qi Gathering'],
    },
  },
  wood: {
    id: 'wood', mode: 'wuxing',
    labelZh: '木 · 东', labelEn: 'Wood · East',
    zoneId: 'zone-wood',
    zoneColor: 'rgba(80,140,90,0.20)', zoneStroke: 'rgba(100,170,110,0.55)', zoneGlow: 'rgba(100,170,110,0.15)',
    dotColor: '130,40%,45%', anchorId: 'anchor-wood',
    dialYinyang: { centerZh: '偏阳', centerEn: 'Lean Yang', descZh: '东方生发', descEn: 'East rises' },
    dialWuxing:  { centerZh: '木', centerEn: 'Wood', descZh: '主文运与生长', descEn: 'Culture & growth' },
    card: {
      titleZh: '东方属木 · 文治与生发', titleEn: 'East — Wood: Culture and Growth',
      briefZh: '东方属木，象征春生、文教与礼乐——故宫东区以文华殿为核心，承担经筵讲学与文治教化之职。',
      briefEn: 'Wood symbolises spring, culture and education — the eastern zone houses the Hall of Literary Glory.',
      bodyZh: '《礼记·月令》载："孟春之月……其帝太皞，其神句芒。"东方配木，主春、主生、主仁——五行中最具"生长"意象的方位。\n\n故宫东区以文华殿为核心，是明清"经筵"（皇帝读经讲学）的主要场所。文华殿位于东方，正与"木主文运"呼应：木生于春，春主萌发与教化。\n\n东六宫（景仁宫、承乾宫等）也位于此区，被赋予"生气方"属性。东方对应"青龙"，青色为木之色，代表蓬勃向上的生命力。从文华殿的书卷气到东六宫的生活气，东区传递出"文质彬彬""生生不息"的空间意象。',
      bodyEn: 'The Record of Rites notes spring\'s first month belongs to the east, associated with wood and benevolence — the most generative direction.\n\nThe eastern zone centers on Wenhua Hall, venue for the jingyan lecture system. Its eastern placement echoes "wood governs literary fortune."\n\nThe Six Eastern Palaces also occupy this zone, assigned the geomantic "vital qi direction." East corresponds to the Azure Dragon; green signals ascending vitality — cultural refinement and ceaseless renewal.',
      tagsZh: ['东方','木','文华殿','经筵','青龙','春生'], tagsEn: ['East','Wood','Wenhua Hall','Jingyan','Azure Dragon','Spring'],
    },
  },
  fire: {
    id: 'fire', mode: 'wuxing',
    labelZh: '火 · 南', labelEn: 'Fire · South',
    zoneId: 'zone-fire',
    zoneColor: 'rgba(200,100,50,0.20)', zoneStroke: 'rgba(220,130,60,0.55)', zoneGlow: 'rgba(220,130,60,0.15)',
    dotColor: '18,65%,52%', anchorId: 'anchor-fire',
    dialYinyang: { centerZh: '阳盛', centerEn: 'Full Yang', descZh: '南方光明', descEn: 'Southern brilliance' },
    dialWuxing:  { centerZh: '火', centerEn: 'Fire', descZh: '主光明与威严', descEn: 'Brilliance & authority' },
    card: {
      titleZh: '南方属火 · 光明与礼制', titleEn: 'South — Fire: Brilliance and Ritual',
      briefZh: '南方属火，象征光明与王朝盛势——午门、太和门与前三殿的宏大序列正是"火"之空间化身。',
      briefEn: 'Fire signifies brilliance and ceremony — the grand progression from Meridian Gate embodies it.',
      bodyZh: '《说文解字》释"火"为"燬也，南方之行"。南方配火，主夏、主明、主礼——最具仪式感的元素，与"阳"的空间精神高度重合。\n\n紫禁城南部从午门经太和门至太和殿，构成从入口到权力中心的"升腾"轴线。午门五凤楼形制对应"南方朱雀"；太和广场白石铺面日照辉映，呼应"火"之光明意象。三大殿层层升高的台基与重檐庑殿顶，都是"火"在建筑语言中的转译。\n\n"面南而王"是历代帝王的格局原则——帝王坐北朝南，正面迎接南方之"火"与"光"，既是采光考量，更是"以明临天下"的政治隐喻。',
      bodyEn: 'The Shuowen defines fire as "the action of the south." Fire is the most ceremonially potent element, overlapping with yang.\n\nThe southern axis — from Meridian Gate to Taihe Hall — forms an ascending power progression. The Gate\'s five-phoenix form evokes the Vermilion Bird; the white granite plaza blazes under sunlight.\n\n"Facing south to rule" is a foundational principle: the emperor faces south, receiving fire and light — both practical and a metaphor for governance by brightness.',
      tagsZh: ['南方','火','午门','朱雀','面南而王'], tagsEn: ['South','Fire','Meridian Gate','Vermilion Bird','Facing South'],
    },
  },
  earth: {
    id: 'earth', mode: 'wuxing',
    labelZh: '土 · 中', labelEn: 'Earth · Center',
    zoneId: 'zone-earth',
    zoneColor: 'rgba(184,138,53,0.22)', zoneStroke: 'rgba(200,165,75,0.55)', zoneGlow: 'rgba(200,165,75,0.15)',
    dotColor: '42,55%,48%', anchorId: 'anchor-earth',
    dialYinyang: { centerZh: '中和', centerEn: 'Balance', descZh: '中央统摄四方', descEn: 'Center commands all' },
    dialWuxing:  { centerZh: '土', centerEn: 'Earth', descZh: '主中正稳固', descEn: 'Centrality & stability' },
    card: {
      titleZh: '中央属土 · 皇权之枢', titleEn: 'Center — Earth: The Imperial Pivot',
      briefZh: '中央属土，统摄四方——太和殿居于宫城核心，是"土居中央"的终极建筑表达。',
      briefEn: 'Earth at the center governs all — the Hall of Supreme Harmony is the ultimate expression of central earth.',
      bodyZh: '《白虎通·五行》曰："中央者，土。土主含万物而化之……王者居中。"土居中央，不偏不倚，是五行的"主持者"与"调和者"。\n\n太和殿坐落于三层汉白玉须弥座之上，总高超35米，是中国现存最大木构殿堂。殿名取自《周易·乾卦》"保合大和，乃利贞"，寓意天地和谐。\n\n太和殿之"居中"是"土居中央以统四方"的宇宙观在建筑上的直接投射。在五行理论中，土"寄旺于四季之末"（每季末18日属土），象征"承上启下""化育万物"的调和力量。太和殿在宫城空间中的位置，恰如"土"在五行结构中的角色——不偏向任何一方，却是所有秩序的原点。',
      bodyEn: 'The Baihu Tong states: "The center is earth. Earth contains and transforms all things… the king dwells in the center." Earth sits at the pivot, impartial mediator of the five elements.\n\nThe Hall of Supreme Harmony — atop three tiers of white marble, over 35 metres tall — is China\'s largest surviving timber hall. Its name from the Book of Changes means "preserving great harmony."\n\nThe hall\'s centrality projects the cosmological principle "earth at the center governs the four directions." Earth belongs to no single season but resides in each season\'s final eighteen days — the origin of all order.',
      tagsZh: ['中央','土','太和殿','居中为尊','保合大和'], tagsEn: ['Center','Earth','Taihe Hall','Central Supremacy','Great Harmony'],
    },
  },
  metal: {
    id: 'metal', mode: 'wuxing',
    labelZh: '金 · 西', labelEn: 'Metal · West',
    zoneId: 'zone-metal',
    zoneColor: 'rgba(180,170,150,0.18)', zoneStroke: 'rgba(200,190,170,0.50)', zoneGlow: 'rgba(200,190,170,0.12)',
    dotColor: '45,15%,60%', anchorId: 'anchor-metal',
    dialYinyang: { centerZh: '偏阴', centerEn: 'Lean Yin', descZh: '西方肃整', descEn: 'Western austerity' },
    dialWuxing:  { centerZh: '金', centerEn: 'Metal', descZh: '主肃整秩序', descEn: 'Discipline & order' },
    card: {
      titleZh: '西方属金 · 秩序与武备', titleEn: 'West — Metal: Discipline and Defence',
      briefZh: '西方属金，象征肃杀、收敛与秩序——故宫西区以武英殿为核心，承担武备与行政之职。',
      briefEn: 'Metal signifies austerity and discipline — the western zone centers on the Hall of Martial Valor.',
      bodyZh: '《礼记·月令》载："孟秋之月……其帝少皞，其神蓐收。"西方配金，主秋、主收、主义。"金"正是"肃整""收敛"在五行中的表达。\n\n故宫西区以武英殿为核心。明代曾为皇帝临幸处，清代成为官方刻书中心——著名的"武英殿聚珍版"即出于此。殿名含"武"字，与"金主兵革"相呼应。西六宫较东六宫更显沉稳肃穆。\n\n西方对应"白虎"，白色为金之色，虎为肃杀之象。西区院落相对封闭、回廊幽深，空间不似东区舒展，而更趋严整内敛——恰如秋日况味。',
      bodyEn: 'The Record of Rites assigns autumn\'s first month to the west: metal, righteousness, gathering in.\n\nThe western zone centers on Wuying Hall. Under the Qing it became the court printing house — the "Wuying Movable-Type Editions" were produced here. The word "martial" echoes metal\'s association with arms.\n\nWest corresponds to the White Tiger — white being metal\'s colour. Western courtyards are enclosed, corridors deep, spaces less expansive — evoking autumn\'s texture.',
      tagsZh: ['西方','金','武英殿','白虎','秋收'], tagsEn: ['West','Metal','Wuying Hall','White Tiger','Autumn'],
    },
  },
  water: {
    id: 'water', mode: 'wuxing',
    labelZh: '水 · 北', labelEn: 'Water · North',
    zoneId: 'zone-water',
    zoneColor: 'rgba(60,100,140,0.20)', zoneStroke: 'rgba(80,130,180,0.50)', zoneGlow: 'rgba(80,130,180,0.14)',
    dotColor: '215,40%,48%', anchorId: 'anchor-water',
    dialYinyang: { centerZh: '阴盛', centerEn: 'Full Yin', descZh: '北方润下', descEn: 'Northern depth' },
    dialWuxing:  { centerZh: '水', centerEn: 'Water', descZh: '主镇火守静', descEn: 'Fire-quench & stillness' },
    card: {
      titleZh: '北方属水 · 镇火与守静', titleEn: 'North — Water: Fire-Quenching and Stillness',
      briefZh: '北方属水，象征润下与防灾——御花园、钦安殿与神武门构成紫禁城"水"之守护。',
      briefEn: 'Water signifies depth and fire protection — the Imperial Garden forms the watery guardian.',
      bodyZh: '《尚书·洪范》曰："水曰润下。"北方配水，主冬、主藏、主智。水之性趋下、就湿、润泽万物——最具"守护"意味的元素。\n\n紫禁城北部以御花园为核心。钦安殿供奉真武大帝（玄武），"玄武"是北方守护神兽，龟蛇合体，暗合"水"之属性。钦安殿铜鎏金顶，是宫中唯一道教祭祀场所——道教重"水火既济"之理，安置于北方正是"以水镇火"的堪舆实践。\n\n故宫为全木结构，火灾是最大威胁。宫中铜缸308口、金水河贯穿南部，北部"水"性意象与防火体系相互呼应——"象征逻辑"与"实用功能"的融合，正是中国古建筑最深层的智慧。',
      bodyEn: 'The Book of Documents: "Water means moistening downward." North equals water: winter, storage, wisdom — the most protective element.\n\nThe northern zone centers on the Imperial Garden. The Hall of Imperial Peace enshrines Zhenwu, the Dark Warrior — guardian of the north, turtle-and-serpent, embodying water. It\'s the only Daoist shrine in the palace, placed north for geomantic fire suppression.\n\nThe all-timber palace makes fire the greatest threat. 308 bronze water vats, the Golden Water River, and the northern water symbolism form an integrated system — symbolic logic and practical function as two faces of one worldview.',
      tagsZh: ['北方','水','御花园','钦安殿','玄武','以水镇火'], tagsEn: ['North','Water','Imperial Garden','Qinan Hall','Zhenwu','Fire-quench'],
    },
  },
  shengke: {
    id: 'shengke', mode: 'relation',
    labelZh: '相生流转', labelEn: 'Generating Cycle',
    zoneId: null, dotColor: '42,55%,48%',
    dialYinyang: { centerZh: '循环', centerEn: 'Cycle', descZh: '五行相生不息', descEn: 'Endless generation' },
    dialWuxing:  { centerZh: '生', centerEn: 'Gen.', descZh: '木→火→土→金→水→木', descEn: 'W→F→E→M→Wa→W' },
    card: {
      titleZh: '五行相生 · 宇宙的流转秩序', titleEn: 'The Generating Cycle: Cosmic Flow',
      briefZh: '木生火、火生土、土生金、金生水、水生木——连续相生，体现"循环不息"的宇宙观。',
      briefEn: 'Wood feeds fire, fire creates earth, earth bears metal, metal collects water, water nourishes wood.',
      bodyZh: '《春秋繁露》曰："木，五行之始也。"相生序列构成永不中断的循环——中国自然哲学最核心的动态模型。\n\n在故宫空间中，相生关系可"行走"：从东区文华殿（木），沿中轴南至午门（火），经太和殿（土/中央）转西至武英殿（金），北上御花园（水），再折回东区——完成"五行巡礼"。\n\n这暗示权力运作的内在逻辑：文治（木）激发礼制（火），礼制沉淀为制度（土），制度约束为秩序（金），秩序滋养智慧（水），智慧反哺文化生长——一套活的宇宙秩序。',
      bodyEn: 'The generating sequence forms an unbroken loop — the most fundamental dynamic model in Chinese natural philosophy.\n\nWithin the palace, the cycle can be walked: east Wenhua Hall (wood) → south Meridian Gate (fire) → central Taihe Hall (earth) → west Wuying Hall (metal) → north Imperial Garden (water) → east again.\n\nThis implies governance logic: culture (wood) ignites ritual (fire), ritual settles into institution (earth), institution enforces order (metal), order nurtures wisdom (water), wisdom renews cultural growth — a living cosmic order.',
      tagsZh: ['相生','循环','流转','宇宙秩序'], tagsEn: ['Generating','Cycle','Flow','Cosmic Order'],
    },
    relLines: [['anchor-wood','anchor-fire'],['anchor-fire','anchor-earth'],['anchor-earth','anchor-metal'],['anchor-metal','anchor-water'],['anchor-water','anchor-wood']],
    relColor: 'rgba(180,140,60,0.7)',
  },
  xiangke: {
    id: 'xiangke', mode: 'relation',
    labelZh: '相克制衡', labelEn: 'Restraining Cycle',
    zoneId: null, dotColor: '0,45%,48%',
    dialYinyang: { centerZh: '制衡', centerEn: 'Restrain', descZh: '相克维持平衡', descEn: 'Restraint keeps balance' },
    dialWuxing:  { centerZh: '克', centerEn: 'Check', descZh: '木土水火金相克', descEn: 'Five checks' },
    card: {
      titleZh: '五行相克 · 动态的平衡智慧', titleEn: 'The Restraining Cycle: Dynamic Equilibrium',
      briefZh: '相克不是破坏，而是制衡——维持宫城空间秩序的长期稳定。',
      briefEn: 'Restraint is not destruction but balance — maintaining long-term spatial stability.',
      bodyZh: '《素问》曰："木得金而伐，火得水而灭。"相克序列是五行的"制衡"机制——若只有相生无相克，系统将失衡。\n\n在紫禁城中，相克表现为隐性"互相节制"：北方水区克制南方火区，使"火性"不至过盛——实际体现为"北水镇南火"的防灾逻辑；东方木区克制中央土区，象征文治对集权的柔性约束。\n\n中国"相克"观念远非"相互毁灭"，而是《周易》所说的"刚柔相推而生变化"——有张力的平衡状态。紫禁城正是这种动态平衡在空间中的实体呈现。',
      bodyEn: 'The Huangdi Neijing states: "Wood is felled by metal, fire quenched by water." The restraining sequence is the system\'s check and balance.\n\nIn the palace, restraint manifests as subtle mutual moderation: the northern water zone restrains southern fire (practical fire prevention); eastern wood restrains central earth (culture checks concentrated power).\n\nThe Chinese concept of restraint is what the Book of Changes calls "the yielding and the firm push each other, and change is born" — dynamic tension made spatial.',
      tagsZh: ['相克','制衡','动态平衡','刚柔相推'], tagsEn: ['Restraint','Balance','Dynamic','Yielding and Firm'],
    },
    relLines: [['anchor-wood','anchor-earth'],['anchor-earth','anchor-water'],['anchor-water','anchor-fire'],['anchor-fire','anchor-metal'],['anchor-metal','anchor-wood']],
    relColor: 'rgba(160,80,80,0.65)',
  },
  waterfire: {
    id: 'waterfire', mode: 'relation',
    labelZh: '北水镇火', labelEn: 'Water Quenches Fire',
    zoneId: null, dotColor: '215,40%,48%',
    highlightZones: ['zone-water', 'zone-fire'],
    dialYinyang: { centerZh: '调衡', centerEn: 'Adjust', descZh: '以水制火', descEn: 'Water restrains fire' },
    dialWuxing:  { centerZh: '水克火', centerEn: 'Wa↔F', descZh: '北水制南火', descEn: 'North subdues south' },
    card: {
      titleZh: '北水镇火 · 象征与实用的统一', titleEn: 'Water Quenches Fire: Symbol Meets Function',
      briefZh: '故宫多木构建筑，火灾风险极高——"以水镇火"既是五行相克的象征，也是防灾体系的实际运作。',
      briefEn: 'The all-timber palace faces extreme fire risk — "water quenches fire" is both symbolic and operational.',
      bodyZh: '故宫自建成以来，重大火灾不下二十余次，太和殿至少被焚毁重建三次。"防火"是宫城最重要的课题。\n\n五行体系中"水克火"最为人知。紫禁城融合了象征与实用：\n· 象征：北方属水，钦安殿供奉真武大帝（水神），脊兽被赋予镇火寓意\n· 实用：铜缸（"太平缸"）308口，冬季炭火加热防冻；金水河提供消防水源；各殿设"水龙"（手动灭火器）\n\n这种"天人合一"——象征秩序与实用功能不是两套系统，而是同一世界观的两个面向——正是中国古建筑最深层的智慧特征。',
      bodyEn: 'Over twenty major fires since completion; Taihe Hall was rebuilt at least three times. Fire prevention was paramount.\n\nThe palace fuses symbolic and practical:\n· Symbolic: North = water; Qin\'an Hall enshrines the water deity Zhenwu; ridge beasts ward fire\n· Practical: 308 bronze vats heated in winter; Golden Water River for firefighting; hand-pump "water dragons"\n\nThis unity of symbolic order and practical function — two faces of one worldview — is the deepest hallmark of Chinese architectural wisdom.',
      tagsZh: ['水克火','太平缸','真武大帝','天人合一'], tagsEn: ['Water-Fire','Peace Vats','Zhenwu','Heaven-Human Unity'],
    },
    relLines: [['anchor-water','anchor-fire']],
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

const YY_SHENG_ORDER = ['wood','fire','earth','metal','water']

/* 五行 anchor 坐标（在 overlay SVG viewBox 987.436×1398.857 内） */
const YY_ANCHORS = {
  'anchor-wood':  { cx: 918, cy: 620 },
  'anchor-fire':  { cx: 494, cy: 1160 },
  'anchor-earth': { cx: 494, cy: 620 },
  'anchor-metal': { cx: 69,  cy: 620 },
  'anchor-water': { cx: 494, cy: 164 },
}

const YY_VIDEO_PATH = 'assets/videos/culture/阴阳五行'

/* ---------- 左侧新卡片数据源 ---------- */
const LEFT_PANEL_DATA = {
  meta: {
    defaultYinYangState: 'default',
    defaultWuXingElement: 'earth',
    defaultRelationMode: 'special',
    metricLabels: {
      openness: '开放度',
      rituality: '礼制性',
      privacy: '私密性',
      growth: '生发性',
      order: '秩序性',
      restraint: '收束性',
      balance: '平衡性',
      nourishment: '涵养性',
      radiance: '昭示性',
      centrality: '统摄性',
      regulation: '规制性',
      circulation: '流转性',
    },
  },

  yinyang: {
    default: {
      id: 'default',
      panelLabel: '阴阳表盘',
      title: '中和',
      subtitle: '阴阳交融',
      shortText: '中轴居中，统摄内外而成中和秩序。',
      desc: '故宫的空间不是简单地分成阴与阳，而是在外朝与内廷之间，通过中轴与核心节点形成一种兼具开敞、秩序与收束的平衡状态。这种“中和”并非平均折中，而是对不同空间功能的有机调度。',
      sceneSentence: '当前画面默认展示整体平衡视角，强调阴阳不是对立，而是交融。',
      metrics: {
        openness: 58,
        rituality: 78,
        privacy: 55,
      },
      tags: ['中和', '平衡', '中轴', '统摄', '融合', '秩序'],
      relatedBuildings: ['太和殿', '中和殿', '保和殿', '中轴主序列'],
      visualState: {
        mode: 'blend',
        highlightRegion: 'center',
        overlayHint: '中心圆核轻微呼吸，阴阳两侧均衡发光，外圈刻度整体柔和脉冲。',
      },
      imageLogic: {
        mainImageKey: 'yinyang-default',
        secondaryImageKey: 'yinyang-balance-detail',
        caption: '阴阳交融，中和统序',
      },
    },

    yang: {
      id: 'yang',
      panelLabel: '阴阳表盘',
      title: '阳',
      subtitle: '外朝属阳',
      shortText: '外朝空间开敞，重礼制、朝会与皇权昭示。',
      desc: '外朝位于故宫南部及前部区域，承担朝会、典礼与国家礼制运行等功能，整体气质更趋于开敞、明朗、外显。其空间秩序强调轴线展示、体量昭示与礼仪威严，因此在阴阳关系中更偏“阳”。',
      sceneSentence: '当视角聚焦前朝礼制区域时，空间表达会明显偏向阳性秩序。',
      metrics: {
        openness: 88,
        rituality: 94,
        privacy: 26,
      },
      tags: ['外朝', '阳', '礼制', '开敞', '昭示', '权威'],
      relatedBuildings: ['午门', '太和门', '太和殿', '中和殿', '保和殿'],
      visualState: {
        mode: 'yang-dominant',
        highlightRegion: 'outer-court',
        overlayHint: '暖金与浅赭区域增强高亮，刻度右侧偏亮，粒子向外扩散。',
      },
      imageLogic: {
        mainImageKey: 'yinyang-yang',
        secondaryImageKey: 'yinyang-yang-detail',
        caption: '外朝属阳，礼制外显',
      },
    },

    yin: {
      id: 'yin',
      panelLabel: '阴阳表盘',
      title: '阴',
      subtitle: '内朝属阴',
      shortText: '内廷空间围合收束，重居住秩序、私密边界与静观气质。',
      desc: '内廷位于故宫北部及后部区域，主要承担帝后起居、生活休憩与内向管理功能。其空间组织更强调围合、内聚、层层递进与边界控制，因此在阴阳关系中更偏“阴”。这种阴性并非消极，而是一种静敛、有度、内在稳定的秩序。',
      sceneSentence: '当视角进入后部生活区域时，空间节奏转向静观、内敛与私密。',
      metrics: {
        openness: 35,
        rituality: 57,
        privacy: 89,
      },
      tags: ['内廷', '阴', '居住', '围合', '静观', '私密'],
      relatedBuildings: ['乾清宫', '交泰殿', '坤宁宫', '御花园', '宁寿宫区'],
      visualState: {
        mode: 'yin-dominant',
        highlightRegion: 'inner-court',
        overlayHint: '灰青与雾蓝一侧增强，流线向内收束，外圈左侧轻微发亮。',
      },
      imageLogic: {
        mainImageKey: 'yinyang-yin',
        secondaryImageKey: 'yinyang-yin-detail',
        caption: '内廷属阴，围合内敛',
      },
    },

    hintsByElement: {
      wood: {
        title: '阴阳视角',
        subtitle: '木性偏阳',
        text: '木主生发与舒展，整体更接近阳性表达，但这种“阳”并不炽烈，而是一种向外展开的生长性秩序。',
      },
      fire: {
        title: '阴阳视角',
        subtitle: '火性偏阳',
        text: '火主昭示与外显，礼仪感最强，因而在阴阳关系中明显偏向阳性。',
      },
      earth: {
        title: '阴阳视角',
        subtitle: '土性中和',
        text: '土居中央，重承载与统摄，更接近阴阳调和后的中和状态。',
      },
      metal: {
        title: '阴阳视角',
        subtitle: '金性偏阴',
        text: '金主收敛与规制，强调边界和成形，整体气质更接近偏阴但不封闭的秩序。',
      },
      water: {
        title: '阴阳视角',
        subtitle: '水性偏阴',
        text: '水主涵养、静气与调和，在阴阳关系中更偏向阴性表达。',
      },
    },
  },

  wuxing: {
    elements: {
      wood: {
        id: 'wood',
        panelLabel: '五行表盘',
        title: '木',
        subtitle: '东木生发',
        shortText: '木主生长与舒展，象征空间展开、文教气质与东方生机。',
        desc: '木对应生发、向上与舒展。在故宫空间叙事中，木性适合用来解释东方区域的展开感、文教意味与生机逻辑。它不是最强的礼制中心，却承担了延展空间层次、引导秩序外展的重要作用。',
        direction: '东方',
        role: '延展与启发',
        temperament: '生发',
        imagery: '舒展 / 文教 / 生机',
        relationLabel: '相生流转',
        yinyangHint: '木性偏阳，更强调生长、舒展与向外展开的秩序。',
        metrics: {
          growth: 91,
          order: 58,
          openness: 72,
        },
        tags: ['木', '东方', '生发', '舒展', '文教', '延展'],
        relatedBuildings: ['文华殿', '东六宫', '东路建筑群'],
        visualState: {
          activeNode: 'wood',
          highlightType: 'node-focus',
          overlayHint: '顶部木节点高亮，枝状细线向外舒展，轻弧缓慢扩散。',
        },
        imageLogic: {
          mainImageKey: 'wuxing-wood',
          secondaryImageKey: 'wuxing-wood-detail',
          caption: '东木生发，空间舒展',
        },
        narrativeModes: {
          primary: 'sheng',
          secondary: 'special-wood',
        },
      },

      fire: {
        id: 'fire',
        panelLabel: '五行表盘',
        title: '火',
        subtitle: '南火昭礼',
        shortText: '火主光明与昭示，对应礼仪开场、秩序外显与前朝气势。',
        desc: '火对应光明、显赫、外放与礼仪昭示。在故宫空间叙事中，火性适合用来解释南向前场区域的礼制开场、视觉引导与典礼氛围。它是最具外显性的元素之一，强调“被看见”的空间力量。',
        direction: '南方',
        role: '开场与外显',
        temperament: '昭示',
        imagery: '礼仪 / 光明 / 显赫',
        relationLabel: '相生流转',
        yinyangHint: '火性明显偏阳，重礼仪、昭示与空间外显。',
        metrics: {
          radiance: 95,
          rituality: 92,
          openness: 84,
        },
        tags: ['火', '南方', '礼仪', '昭示', '显赫', '外显'],
        relatedBuildings: ['午门', '太和门', '前朝入口区'],
        visualState: {
          activeNode: 'fire',
          highlightType: 'node-focus',
          overlayHint: '右侧火节点高亮，向上微辐射，暖色流线外展。',
        },
        imageLogic: {
          mainImageKey: 'wuxing-fire',
          secondaryImageKey: 'wuxing-fire-detail',
          caption: '南火昭礼，秩序外显',
        },
        narrativeModes: {
          primary: 'sheng',
          secondary: 'special-fire',
        },
      },

      earth: {
        id: 'earth',
        panelLabel: '五行表盘',
        title: '土',
        subtitle: '土居中央',
        shortText: '土主承载与统摄，是故宫空间结构中的中轴核心与稳定中枢。',
        desc: '土对应中央、稳定、承载与中枢。它在五行中不是普通一环，而是最适合解释故宫中轴、台基与核心秩序的关键属性。土性的意义在于将不同区域统摄起来，使空间既有层次，又有中心。',
        direction: '中央',
        role: '统摄与中枢',
        temperament: '稳定',
        imagery: '台基 / 核心 / 承载',
        relationLabel: '相互制衡',
        yinyangHint: '土性偏中和，强调平衡、承载与中心组织力。',
        metrics: {
          centrality: 94,
          balance: 90,
          openness: 61,
        },
        tags: ['土', '中央', '承载', '稳定', '统摄', '中枢'],
        relatedBuildings: ['太和殿', '中和殿', '保和殿', '中轴核心区'],
        visualState: {
          activeNode: 'earth',
          highlightType: 'center-focus',
          overlayHint: '中心圆核与左下土节点同步加强，向中心汇聚的金色线条变亮。',
        },
        imageLogic: {
          mainImageKey: 'wuxing-earth',
          secondaryImageKey: 'wuxing-earth-detail',
          caption: '土居中央，统摄诸方',
        },
        narrativeModes: {
          primary: 'ke',
          secondary: 'special-earth',
        },
      },

      metal: {
        id: 'metal',
        panelLabel: '五行表盘',
        title: '金',
        subtitle: '西金肃整',
        shortText: '金性主收敛、规制与成形，强调边界感、秩序感与结构定型。',
        desc: '金对应收束、定型、规整与边界感。在故宫空间叙事中，金性适合解释西向空间的肃整气质与礼法约束。它不是僵硬封闭，而是一种经由规范与边界所建立起来的稳固秩序。',
        direction: '西方',
        role: '约束与定型',
        temperament: '肃整',
        imagery: '规制 / 收敛 / 边界',
        relationLabel: '相互制衡',
        yinyangHint: '金性略偏阴，重收束、规整与边界控制。',
        metrics: {
          regulation: 90,
          restraint: 88,
          openness: 42,
        },
        tags: ['金', '西方', '肃整', '规制', '收敛', '边界'],
        relatedBuildings: ['武英殿', '西六宫', '慈宁宫系'],
        visualState: {
          activeNode: 'metal',
          highlightType: 'node-focus',
          overlayHint: '右下金节点高亮，线条更规整，交叉制衡线微亮。',
        },
        imageLogic: {
          mainImageKey: 'wuxing-metal',
          secondaryImageKey: 'wuxing-metal-detail',
          caption: '西金肃整，规制成形',
        },
        narrativeModes: {
          primary: 'ke',
          secondary: 'special-metal',
        },
      },

      water: {
        id: 'water',
        panelLabel: '五行表盘',
        title: '水',
        subtitle: '北水镇火',
        shortText: '水性主流动、涵养与调和，既可润泽空间，也能形成镇火与制燥的象征。',
        desc: '水对应流动、静气、涵养与调和。在故宫空间叙事中，水性既能解释北部后场、园林与空间缓冲，也可延伸为防御火势、调和燥烈的象征逻辑。因此，“北水镇火”不仅是五行关系，更是一种空间文化叙事。',
        direction: '北方',
        role: '调和与缓冲',
        temperament: '涵养',
        imagery: '流动 / 静气 / 润泽',
        relationLabel: '特殊叙事',
        yinyangHint: '水性偏阴，重在静气、涵养与平衡火势。',
        metrics: {
          nourishment: 93,
          balance: 90,
          openness: 49,
        },
        tags: ['水', '北方', '涵养', '调和', '镇火', '静气'],
        relatedBuildings: ['御花园', '钦安殿', '宁寿宫花园'],
        visualState: {
          activeNode: 'water',
          highlightType: 'special-focus',
          overlayHint: '左侧水节点高亮，蓝灰流线朝火节点方向缓慢包裹，中心圆核微亮。',
        },
        imageLogic: {
          mainImageKey: 'wuxing-water',
          secondaryImageKey: 'wuxing-water-detail',
          caption: '北水镇火，以静制燥',
        },
        narrativeModes: {
          primary: 'special',
          secondary: 'sheng',
        },
      },
    },

    relationModes: {
      sheng: {
        id: 'sheng',
        panelLabel: '五行关系',
        title: '相生流转',
        subtitle: '生成有序',
        shortText: '木生火，火生土，土生金，金生水，水生木。',
        desc: '五行并非彼此孤立，而是在持续生成中维持整体空间的流动平衡。相生关系强调一种顺势而行、层层推进的秩序感，使不同空间属性能够从一个状态自然过渡到下一个状态，形成连续而不割裂的空间叙事。',
        sceneSentence: '当前强调五行之间的生成逻辑，适合表现空间的展开、延续与循环。',
        tags: ['相生', '流转', '生成', '循环', '平衡'],
        visualState: {
          mode: 'sheng-flow',
          overlayHint: '五个节点按顺序轻亮，外环出现顺时针淡金流线，路径循环发光。',
        },
        imageLogic: {
          mainImageKey: 'wuxing-sheng',
          secondaryImageKey: 'wuxing-sheng-detail',
          caption: '相生流转，生成有序',
        },
      },

      ke: {
        id: 'ke',
        panelLabel: '五行关系',
        title: '相互制衡',
        subtitle: '约束有度',
        shortText: '木克土，土克水，水克火，火克金，金克木。',
        desc: '五行还通过相互制约维持边界和稳定。相克并不意味着对抗和破坏，而是一种防止单一属性无限扩张的动态约束机制。正是这种制衡关系，使空间秩序能够保持分寸、节制与层次。',
        sceneSentence: '当前强调五行之间的约束逻辑，适合表现边界、规制与稳定。',
        tags: ['相克', '制衡', '约束', '边界', '秩序'],
        visualState: {
          mode: 'ke-balance',
          overlayHint: '外环弱化，中部穿插制衡线加强，交叉节点短暂亮起。',
        },
        imageLogic: {
          mainImageKey: 'wuxing-ke',
          secondaryImageKey: 'wuxing-ke-detail',
          caption: '相互制衡，约束有度',
        },
      },

      special: {
        id: 'special',
        panelLabel: '五行叙事',
        title: '北水镇火',
        subtitle: '以静制燥',
        shortText: '北方属水，水可调和火势，也可象征空间中的防御与平衡机制。',
        desc: '在五行空间叙事中，水与火的关系尤其富有象征意味。北方属水，具有涵养、调和与镇定燥烈之意，因此“北水镇火”既可以解释五行关系，也可以延伸为空间安全、防御意识和整体平衡机制的文化表达。',
        sceneSentence: '当前强调特殊叙事逻辑，适合在北部区域、水元素或防火象征说明时使用。',
        tags: ['北水镇火', '水火关系', '调和', '防御', '平衡'],
        visualState: {
          mode: 'special-water-fire',
          overlayHint: '水节点与火节点同时亮起，蓝灰流线缓慢压制暖色火线，中心核微亮。',
        },
        imageLogic: {
          mainImageKey: 'wuxing-special',
          secondaryImageKey: 'wuxing-special-detail',
          caption: '北水镇火，调和有度',
        },
      },

      'special-wood': {
        id: 'special-wood',
        panelLabel: '五行叙事',
        title: '东木生发',
        subtitle: '以生启序',
        shortText: '东方属木，木主生长与舒展，象征空间向外展开的生机逻辑。',
        desc: '“东木生发”强调的是空间秩序从内核向外生长的展开感。它适合用于解释东方区域的文教意味、舒展结构与生机气质。',
        sceneSentence: '当前强调木的生发叙事，适合东方区域或文教属性内容。',
        tags: ['东木生发', '生长', '舒展', '文教', '生机'],
        visualState: {
          mode: 'special-wood',
          overlayHint: '木节点与顶部连线增强，细弧向外舒展。',
        },
        imageLogic: {
          mainImageKey: 'wuxing-special-wood',
          secondaryImageKey: 'wuxing-special-wood-detail',
          caption: '东木生发，舒展有序',
        },
      },

      'special-fire': {
        id: 'special-fire',
        panelLabel: '五行叙事',
        title: '南火昭礼',
        subtitle: '以明显序',
        shortText: '南方属火，火主礼仪昭示与秩序外显，是前朝气势的重要视觉表达。',
        desc: '“南火昭礼”强调前朝礼制空间的明亮、显赫与可见性。它适合解释入口、正面展示与礼仪开场的空间逻辑。',
        sceneSentence: '当前强调火的礼仪叙事，适合前朝区域和外显空间说明。',
        tags: ['南火昭礼', '礼仪', '外显', '显赫', '开场'],
        visualState: {
          mode: 'special-fire',
          overlayHint: '火节点增强，暖色辐射线柔和扩散。',
        },
        imageLogic: {
          mainImageKey: 'wuxing-special-fire',
          secondaryImageKey: 'wuxing-special-fire-detail',
          caption: '南火昭礼，明序在前',
        },
      },

      'special-earth': {
        id: 'special-earth',
        panelLabel: '五行叙事',
        title: '土居中央',
        subtitle: '以中定序',
        shortText: '中央属土，土主承载与统摄，是故宫中轴与中心结构的稳定来源。',
        desc: '“土居中央”最适合用来解释故宫中轴与核心大殿的秩序地位。土不是静止的背景，而是承托各方、统摄整体的中心力量。',
        sceneSentence: '当前强调土的中央叙事，适合核心区域与中轴逻辑说明。',
        tags: ['土居中央', '中轴', '承载', '统摄', '稳定'],
        visualState: {
          mode: 'special-earth',
          overlayHint: '中心核加强，外围细线向中心汇聚。',
        },
        imageLogic: {
          mainImageKey: 'wuxing-special-earth',
          secondaryImageKey: 'wuxing-special-earth-detail',
          caption: '土居中央，统摄诸方',
        },
      },

      'special-metal': {
        id: 'special-metal',
        panelLabel: '五行叙事',
        title: '西金肃整',
        subtitle: '以规成序',
        shortText: '西方属金，金主规整、边界与成形，是空间秩序定型的重要象征。',
        desc: '“西金肃整”强调的是空间在规范与边界中的稳定成形。它适合用于解释西向区域的收束感、规制感与肃整气质。',
        sceneSentence: '当前强调金的规制叙事，适合边界、礼法和定型逻辑说明。',
        tags: ['西金肃整', '规制', '边界', '收敛', '成形'],
        visualState: {
          mode: 'special-metal',
          overlayHint: '金节点与交叉线增强，几何线条更规整。',
        },
        imageLogic: {
          mainImageKey: 'wuxing-special-metal',
          secondaryImageKey: 'wuxing-special-metal-detail',
          caption: '西金肃整，规制成形',
        },
      },
    },
  },
}
