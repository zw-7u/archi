/* =====================================================
   js/workshop-game-data.js - 巧筑工坊游戏数据
   来源：游戏.md
   ===================================================== */

const WORKSHOP_GAME_DATA = {

  /* ---------- 太和殿：殿宇有序 ---------- */
  taihedian: {
    title: '殿宇有序',
    subtitle: '太和殿',
    subtitleEn: 'Hall of Supreme Harmony',
    totalPieces: 4,
    imageBase: 'assets/images/game/太和殿/',
    pieceImages: [
      '游戏太和殿1.png',
      '游戏太和殿2.png',
      '游戏太和殿3.png',
      '游戏太和殿4.png',
    ],
    completeMsg: '殿宇之大，不止在体量，更在礼制层层可见。',
    quizzes: [
      {
        id: 'q1',
        difficulty: 'easy',
        question: '为什么太和殿前要有高高的三层须弥座？',
        reward: ['游戏太和殿1.png'],
        options: [
          {
            key: 'A',
            label: '因为台基越高，建筑就只是显得越大。',
            isCorrect: false,
            card: {
              intuitive: '高台确实会让建筑看起来更宏伟。',
              sinology: '但在中国宫殿中，台基并不只是放大体量，它更重要的作用是把建筑从日常地面抬升出来，使其进入礼制与仪式的空间层级。',
              quote: '高，不只是高，而是尊。',
            },
          },
          {
            key: 'B',
            label: '因为高台基能够抬升礼制等级与庄严感。',
            isCorrect: true,
            card: {
              intuitive: '高台像是在给宫殿加一个"被托起"的舞台。',
              sinology: '这是最接近中国宫殿礼制逻辑的理解。须弥座不仅承担结构基础，也让建筑获得"高于常地"的仪式性，体现皇家建筑的尊崇地位。',
              quote: '台基，是礼制的起点。',
            },
          },
          {
            key: 'C',
            label: '因为这样主要是为了防雨和防积水。',
            isCorrect: false,
            card: {
              intuitive: '抬高地面确实有利于排水，这是建筑上的附带效果。',
              sinology: '但如果只把须弥座理解成排水装置，就忽略了太和殿最核心的礼制属性。对皇家宫殿而言，排水是功能，礼制表达才是主旨。',
              quote: '功能可以解释结构，不能替代礼制。',
            },
          },
        ],
      },
      {
        id: 'q2',
        difficulty: 'easy',
        question: '太和殿最能体现中国木构建筑特征的部分，更接近哪一个？',
        reward: ['游戏太和殿2.png'],
        options: [
          {
            key: 'A',
            label: '屋檐下的柱网与木构骨架。',
            isCorrect: true,
            card: {
              intuitive: '中国古建筑看起来像是"立柱撑起屋顶"。',
              sinology: '这正是中国木构建筑的重要特征。宫殿的核心不在厚重墙体，而在柱、梁、枋等骨架系统。墙更多起围合作用，骨架才是真正"立殿"的基础。',
              quote: '宫殿先立骨，再成屋。',
            },
          },
          {
            key: 'B',
            label: '四周的墙体，因为墙体决定建筑是否稳固。',
            isCorrect: false,
            card: {
              intuitive: '在很多现代建筑里，墙体似乎是最直观的支撑部分。',
              sinology: '但中国传统木构建筑并不以墙体作为主要承重系统。若只盯着墙，就会错过中国建筑最重要的"骨架逻辑"。',
              quote: '看见墙，不等于看见结构。',
            },
          },
          {
            key: 'C',
            label: '殿前空地，因为空地让建筑显得更宏大。',
            isCorrect: false,
            card: {
              intuitive: '开阔广场确实会增强太和殿的气势。',
              sinology: '但空地属于礼仪场所营造，不是木构建筑本体的关键特征。若要理解"中国木构"，应先看柱梁体系，而不是空间留白。',
              quote: '气势属于场域，骨架属于建筑。',
            },
          },
        ],
      },
      {
        id: 'q3',
        difficulty: 'medium',
        question: '为什么太和殿的檐下、屋顶、黄琉璃瓦和脊兽要一起看，而不能只说"屋顶很好看"？',
        reward: ['游戏太和殿3.png', '游戏太和殿4.png'],
        options: [
          {
            key: 'A',
            label: '因为这里同时体现了结构承接、皇家色彩、等级秩序与祥瑞象征。',
            isCorrect: true,
            card: {
              intuitive: '太和殿的屋顶最吸引人，很容易被当作"漂亮的外表"。',
              sinology: '但在中国宫殿中，檐下、斗拱、屋顶、瓦色、脊饰是一个整体系统。它们既服务结构，也表达礼制，还承载皇家象征和吉祥寓意。',
              quote: '屋顶不止是外表，而是秩序的顶层表达。',
            },
          },
          {
            key: 'B',
            label: '因为这些部分都集中在上面，方便工匠统一施工。',
            isCorrect: false,
            card: {
              intuitive: '从施工角度看，把上部构件看成一个整体似乎有道理。',
              sinology: '但如果只从施工便利出发，就无法解释为什么皇家屋顶会如此强调黄琉璃、脊兽、檐部层次。这里更重要的是象征与等级，而不是简单施工组织。',
              quote: '工艺能解释怎么做，不能解释为什么这样做。',
            },
          },
          {
            key: 'C',
            label: '因为这些都是装饰细节，主要作用是让建筑更华丽。',
            isCorrect: false,
            card: {
              intuitive: '它们确实提升了建筑的华丽感。',
              sinology: '但把它们统统理解为"装饰"会把中国宫殿看浅。太和殿的上部系统不是额外贴上的美化层，而是结构、色彩、等级与象征共同作用的结果。',
              quote: '华丽只是表面，制度才是内核。',
            },
          },
        ],
      },
    ],
  },

  /* ---------- 角楼：四隅归序 ---------- */
  jiaolou: {
    title: '四隅归序',
    subtitle: '角楼',
    subtitleEn: 'Corner Tower',
    totalPieces: 5,
    imageBase: 'assets/images/game/角楼/',
    pieceImages: [
      '游戏角楼1.png',
      '游戏角楼2.png',
      '游戏角楼3.png',
      '游戏角楼4.png',
      '游戏角楼5.png',
    ],
    completeMsg: '一角既立，不只成楼，更定宫城四隅之序。',
    quizzes: [
      {
        id: 'q1',
        difficulty: 'easy',
        question: '角楼最能说明它建筑身份的位置特征是什么？',
        reward: ['游戏角楼5.png'],
        options: [
          {
            key: 'A',
            label: '它位于故宫中轴线上，所以最重要。',
            isCorrect: false,
            card: {
              intuitive: '中轴线上的建筑通常最重要，所以很多人会自然联想到这一点。',
              sinology: '但角楼的价值不在"居中"，而在"守角"。它不属于中轴礼制建筑，而属于宫城边界体系的一部分。',
              quote: '角楼不以居中见重，而以守隅成义。',
            },
          },
          {
            key: 'B',
            label: '它位于宫城转角，体现边界、转折与四隅秩序。',
            isCorrect: true,
            card: {
              intuitive: '角楼一眼看上去就是"在角上"的建筑。',
              sinology: '这正是理解角楼的关键。角楼之所以特殊，不是因为它比别的楼高，而是因为它位于宫城转角，承担边界收束、空间转折与四隅守护的意义。',
              quote: '先懂它立在哪里，才懂它为何重要。',
            },
          },
          {
            key: 'C',
            label: '它在后宫深处，主要供皇帝日常休息。',
            isCorrect: false,
            card: {
              intuitive: '很多人会把故宫里的高等级建筑都想成居住建筑。',
              sinology: '但角楼并不属于皇帝起居核心。把角楼理解成"住的地方"，就会错过它最独特的城角建筑身份。',
              quote: '不是殿内生活之所，而是城角秩序之点。',
            },
          },
        ],
      },
      {
        id: 'q2',
        difficulty: 'medium',
        question: '为什么角楼会比一般楼阁看起来更复杂？',
        reward: ['游戏角楼2.png', '游戏角楼4.png'],
        options: [
          {
            key: 'A',
            label: '因为颜色更多，所以看起来更繁复。',
            isCorrect: false,
            card: {
              intuitive: '颜色确实会增强视觉上的丰富感。',
              sinology: '但角楼的复杂并不主要来自色彩，而来自建筑形体本身。即使去掉色彩，它的转角屋面、翼角和多重屋脊仍然非常复杂。',
              quote: '复杂首先来自形体，不只是来自颜色。',
            },
          },
          {
            key: 'B',
            label: '因为它要处理转角屋面、多层檐口和复合屋脊。',
            isCorrect: true,
            card: {
              intuitive: '角楼不像普通方正楼阁，它的屋顶关系明显更难处理。',
              sinology: '这正是角楼的建筑难点。它既要在转角处完成屋面组织，又要保持整体对称与庄重，因此比一般楼阁更复杂，也更能体现古代匠作智慧。',
              quote: '角楼之巧，在于转角成屋。',
            },
          },
          {
            key: 'C',
            label: '因为角楼比别的楼更高，楼层更多。',
            isCorrect: false,
            card: {
              intuitive: '高层建筑通常会让人觉得更复杂。',
              sinology: '但角楼的独特性不在简单"更高"，而在多方向屋面与檐角系统的协调。若只归因为高度，就会忽略其真正的营造难点。',
              quote: '不是高楼成巧，而是构形成巧。',
            },
          },
        ],
      },
      {
        id: 'q3',
        difficulty: 'medium',
        question: '从汉学角度看，角楼最值得理解的意义是什么？',
        reward: ['游戏角楼1.png', '游戏角楼3.png'],
        options: [
          {
            key: 'A',
            label: '它主要用于观景和休闲，是宫廷娱乐建筑。',
            isCorrect: false,
            card: {
              intuitive: '角楼造型优美，很容易被想成"赏景楼"。',
              sinology: '但如果只把角楼理解成观景建筑，就会把它降格成装饰性存在。角楼的深层意义在于宫城边界、四角秩序与守护象征。',
              quote: '好看只是表象，守城才是深义。',
            },
          },
          {
            key: 'B',
            label: '它体现了宫城四隅的秩序、边界与守护象征。',
            isCorrect: true,
            card: {
              intuitive: '角楼守在四角，让人自然联想到"看守"和"边界"。',
              sinology: '这是最接近汉学视角的理解。角楼不是孤立的楼，而是宫城整体秩序在四角的具象化，它将空间边界、对称秩序与皇家威仪统一起来。',
              quote: '一角既立，四隅有序。',
            },
          },
          {
            key: 'C',
            label: '它更接近市井商业空间，是故宫中最接近日常生活的建筑。',
            isCorrect: false,
            card: {
              intuitive: '角楼靠近边缘，容易被想成更接近外部社会。',
              sinology: '但故宫角楼并非商业空间，它属于皇家城阙系统。若按城市街市逻辑去理解它，就会误判它的宫城属性。',
              quote: '宫城之角，不属市井。',
            },
          },
        ],
      },
    ],
  },

  /* ---------- 九龙壁：壁上读龙 ---------- */
  jiulongbi: {
    title: '壁上读龙',
    subtitle: '九龙壁',
    subtitleEn: 'Nine Dragon Wall',
    totalPieces: 7,
    imageBase: 'assets/images/game/九龙壁/',
    pieceImages: [
      '游戏九龙壁1.png',
      '游戏九龙壁2.png',
      '游戏九龙壁3.png',
      '游戏九龙壁4.png',
      '游戏九龙壁5.png',
      '游戏九龙壁6.png',
      '游戏九龙壁7.png',
    ],
    completeMsg: '中国建筑中的图案，不止可看，更可读。',
    quizzes: [
      {
        id: 'q1',
        difficulty: 'easy',
        question: '九龙壁上的龙，首先不是在"写实动物"，更是在表达什么？',
        reward: ['游戏九龙壁1.png'],
        options: [
          {
            key: 'A',
            label: '在表达皇家吉祥、威严与瑞象。',
            isCorrect: true,
            card: {
              intuitive: '第一眼看去像是很多龙的图案集合。',
              sinology: '但在中国皇家建筑装饰中，龙并不只是动物形象，它更是权威、吉祥、瑞气和皇权气象的综合象征。',
              quote: '壁上之龙，重在象征，不在写实。',
            },
          },
          {
            key: 'B',
            label: '在记录古人想象中的真实生物。',
            isCorrect: false,
            card: {
              intuitive: '龙看起来像一种被反复描绘的"神兽"。',
              sinology: '但九龙壁并不是古代生物图鉴。这里的龙更像一种文化符号，用来承载皇家威仪和吉祥愿望。',
              quote: '龙不是标本，而是符号。',
            },
          },
          {
            key: 'C',
            label: '在讲述一段具体历史故事。',
            isCorrect: false,
            card: {
              intuitive: '看到大量图像时，容易把它理解成叙事画面。',
              sinology: '九龙壁并不像历史画卷那样讲故事，它更偏向象征性陈设，用整体图像来营造皇家审美和吉祥氛围。',
              quote: '它不是讲故事，而是造气象。',
            },
          },
        ],
      },
      {
        id: 'q2',
        difficulty: 'easy',
        question: '为什么九龙壁大量使用琉璃，而不是普通砖面？',
        reward: ['游戏九龙壁2.png'],
        options: [
          {
            key: 'A',
            label: '因为琉璃更鲜亮，也更适合皇家装饰与工艺表达。',
            isCorrect: true,
            card: {
              intuitive: '琉璃颜色明亮，远看就很华丽。',
              sinology: '这正是它的重要价值。皇家建筑偏爱琉璃，不只是为了"漂亮"，更是为了用光泽、色彩和工艺表现宫廷气度与尊贵身份。',
              quote: '琉璃，是工艺，也是身份。',
            },
          },
          {
            key: 'B',
            label: '因为普通砖太便宜，所以必须全部换成琉璃。',
            isCorrect: false,
            card: {
              intuitive: '贵重材料似乎总能体现等级。',
              sinology: '但若只从"贵"来理解琉璃，就会把它看成简单的消费升级。琉璃更重要的是工艺性、视觉性和皇家象征性，而不只是价格问题。',
              quote: '贵重不是答案，象征才是重点。',
            },
          },
          {
            key: 'C',
            label: '因为琉璃主要用于加厚墙体，提高承重能力。',
            isCorrect: false,
            card: {
              intuitive: '有些材料确实会让建筑显得更坚固。',
              sinology: '但九龙壁使用琉璃的重点不是承重，而是表面装饰与图像表达。这里更像一面"可阅读的文化表皮"。',
              quote: '这不是承重层，而是象征层。',
            },
          },
        ],
      },
      {
        id: 'q3',
        difficulty: 'medium',
        question: '龙、云、水纹同时出现，更接近哪一种理解？',
        reward: ['游戏九龙壁3.png', '游戏九龙壁4.png'],
        options: [
          {
            key: 'A',
            label: '只是为了让画面看起来更满、更热闹。',
            isCorrect: false,
            card: {
              intuitive: '装饰图案越多，画面通常会显得越丰富。',
              sinology: '但在中国装饰语境中，云、水、龙并非随意堆叠。它们往往共同构成一个完整的瑞象系统，彼此之间有明确的象征关系。',
              quote: '丰富不等于杂乱，图像自有秩序。',
            },
          },
          {
            key: 'B',
            label: '它们共同构成了一套完整的祥瑞图像系统。',
            isCorrect: true,
            card: {
              intuitive: '龙在云水之间显得更"活"。',
              sinology: '这是最接近汉学视角的理解。云、水、龙并不是背景和主体的简单区分，而是共同构成吉祥、气势与天命感的整体图像结构。',
              quote: '看龙，也要看它所处的世界。',
            },
          },
          {
            key: 'C',
            label: '这是为了方便工匠分区域施工。',
            isCorrect: false,
            card: {
              intuitive: '分块制作和施工确实是工艺上的现实问题。',
              sinology: '但九龙壁图案的组织逻辑首先是文化与象征，施工分区只是实现手段，不能解释其图像本义。',
              quote: '施工能解释方法，不能解释寓意。',
            },
          },
        ],
      },
      {
        id: 'q4',
        difficulty: 'hard',
        question: '从汉学视角看，九龙壁为什么"不是九条一样的龙排在墙上"这么简单？',
        reward: ['游戏九龙壁5.png', '游戏九龙壁6.png', '游戏九龙壁7.png'],
        options: [
          {
            key: 'A',
            label: '因为不同龙的姿态不一样，所以画家技巧更高。',
            isCorrect: false,
            card: {
              intuitive: '姿态变化确实能体现画面技巧。',
              sinology: '但若只把重点放在"画得好"，就仍然停留在形式欣赏层面。九龙壁更重要的是象征体系、皇家身份与工艺审美的综合表达。',
              quote: '技巧可见，文化更深。',
            },
          },
          {
            key: 'B',
            label: '因为它同时承载皇家象征、吉祥观念、图像秩序和工艺美学。',
            isCorrect: true,
            card: {
              intuitive: '整面墙看上去不像单纯装饰，而像一种"有意义的图像体系"。',
              sinology: '这正是九龙壁的关键。它不是九条龙的重复排列，而是一套融合皇家身份、瑞象观念、视觉秩序和琉璃工艺的综合文化表面。',
              quote: '九龙壁不是一幅图，而是一套文化系统。',
            },
          },
          {
            key: 'C',
            label: '因为九只是一个好听的数字，所以多画几条会更完整。',
            isCorrect: false,
            card: {
              intuitive: '数字在传统文化里确实常带有吉祥意味。',
              sinology: '但若只停留在"数字吉利"，仍然过于简单。九龙壁的意义并不只在数字，而在数字、龙纹、工艺、皇家身份共同构成的整体表达。',
              quote: '数字有意，但意义不止数字。',
            },
          },
        ],
      },
    ],
  },

  /* ---------- 午门：门以分礼 ---------- */
  wumen: {
    title: '门以分礼',
    subtitle: '午门',
    subtitleEn: 'Meridian Gate',
    totalIdentities: 6,
    imageBase: 'assets/images/game/午门/',
    wumenImage: '午门.png',
    completeMsg: '紫禁城先讲秩序，再讲通行。',
    quizzes: [
      {
        id: 'q1',
        difficulty: 'easy',
        question: '午门正中的门洞最重要的意义是什么？',
        reward: ['皇帝'],
        options: [
          {
            key: 'A',
            label: '因为中门最宽，走起来最方便。',
            isCorrect: false,
            card: {
              intuitive: '在现代空间里，中间往往意味着主要通道。',
              sinology: '但在紫禁城里，中门不是"最方便"的意思，而是"最尊贵"的象征。它首先属于礼制，不首先属于效率。',
              quote: '中央不等于公共，中央往往意味着至尊。',
            },
          },
          {
            key: 'B',
            label: '因为中门象征中央至尊。',
            isCorrect: true,
            card: {
              intuitive: '中间位置天然有"最核心"的感觉。',
              sinology: '这正是午门制度的核心之一。在帝制空间中，中央不仅是几何中心，更是权力和身份的象征中心。',
              quote: '门在中，不为方便，只为至尊。',
            },
          },
          {
            key: 'C',
            label: '因为中门通常留给游客和最多的人流通行。',
            isCorrect: false,
            card: {
              intuitive: '今天的大门往往对应最大的人流。',
              sinology: '但午门不是现代公共建筑，不能按"人流最大即中门"的逻辑理解。它表达的不是开放性，而是秩序性。',
              quote: '紫禁城先讲秩序，再讲通行。',
            },
          },
        ],
      },
      {
        id: 'q2',
        difficulty: 'medium',
        question: '为什么同一座门会分出不同门洞，而不是所有人都从中间走？',
        reward: ['文官', '武官'],
        options: [
          {
            key: 'A',
            label: '因为这样主要是为了疏散人流。',
            isCorrect: false,
            card: {
              intuitive: '从现代管理角度看，分流确实很合理。',
              sinology: '但午门门制的核心不是交通效率，而是身份区分。它用建筑空间直接把人群纳入礼制等级之中。',
              quote: '不是先分流，而是先分礼。',
            },
          },
          {
            key: 'B',
            label: '因为午门本身就是体现身份秩序的空间装置。',
            isCorrect: true,
            card: {
              intuitive: '不同的人走不同门，本身就在暗示等级差异。',
              sinology: '这是最接近汉学理解的答案。午门不是中性的入口，而是一种把制度和身份"建筑化"的空间形式。',
              quote: '门会说话，它说的是身份。',
            },
          },
          {
            key: 'C',
            label: '因为这样左右更对称，看起来更好看。',
            isCorrect: false,
            card: {
              intuitive: '故宫建筑确实非常强调对称。',
              sinology: '但这里只说"好看"还不够。对称在故宫里往往服务于秩序，形式美感只是秩序可见之后的结果。',
              quote: '对称是外表，分礼是内核。',
            },
          },
        ],
      },
      {
        id: 'q3',
        difficulty: 'hard',
        question: '从汉学角度看，午门的通行规则为什么不能只理解成"谁地位高谁走中间"这么简单？',
        reward: ['殿试考生', '传旨官', '外国使节'],
        options: [
          {
            key: 'A',
            label: '因为这里还涉及身份、场景、典礼制度与特殊时机。',
            isCorrect: true,
            card: {
              intuitive: '地位高低当然重要，但似乎还不够解释所有情况。',
              sinology: '这正是午门制度的复杂之处。它不仅区分身份，还要结合场景和礼仪时机，例如殿试、传旨等情境都会影响通行方式。',
              quote: '门制不是单线等级，而是制度网络。',
            },
          },
          {
            key: 'B',
            label: '因为实际上谁都可以临时借用中门，只要有需要。',
            isCorrect: false,
            card: {
              intuitive: '现代空间中，重要通道在特殊时候常常会临时开放。',
              sinology: '但午门所属的是礼制空间，不是临时调度空间。这里的门制不是弹性便利优先，而是规则优先。',
              quote: '临时便利，不能覆盖礼制边界。',
            },
          },
          {
            key: 'C',
            label: '因为门洞的区分只是后人附会，古代其实没有那么严格。',
            isCorrect: false,
            card: {
              intuitive: '很多制度看起来很复杂，容易让人怀疑是否被后世夸大。',
              sinology: '但午门门制恰恰说明，故宫空间并非随意使用，而是与礼仪制度紧密关联。若把它理解成"后来想多了"，就会错失空间与制度结合的本质。',
              quote: '故宫空间从来不是随意摆放的背景。',
            },
          },
        ],
      },
    ],
    /* 午门通行阶段：身份 → 正确门洞映射 */
    wumenRules: {
      '皇帝': { scene: '大典', correctGate: 'center', hint: '中门（御门）' },
      '文官': { scene: '常朝', correctGate: 'left', hint: '左掖门' },
      '武官': { scene: '常朝', correctGate: 'right', hint: '右掖门' },
      '殿试考生': { scene: '殿试日', correctGate: 'center', hint: '中门（专由皇帝特准入）' },
      '传旨官': { scene: '奉旨入宫', correctGate: 'left', hint: '左掖门（传旨由侧门入）' },
      '外国使节': { scene: '大典', correctGate: 'right', hint: '右掖门（使节由侧门入）' },
    },
  },

}
