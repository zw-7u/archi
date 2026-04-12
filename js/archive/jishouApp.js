/* ============================================
   第二章 宫阙清赏 - 脊兽章节应用逻辑
   ============================================ */

(() => {
  'use strict';

    // 十小兽数据
  const TEN_BEASTS = [
    { id: 'xianren', name: '走兽仙人', file: '走兽仙人.png', desc: '骑凤仙人，殿脊最前端，相传为齐闵王，寓意逢凶化吉。' },
    { id: 'long', name: '龙', file: '龙.png', desc: '鳞虫之长，能兴云雨、利万物，象征皇权与祥瑞。' },
    { id: 'feng', name: '凤', file: '凤.png', desc: '百鸟之王，象征明君圣德、天下太平。' },
    { id: 'shi', name: '狮子', file: '狮子.png', desc: '勇猛威严，代表威严与震慑之力。' },
    { id: 'tianma', name: '天马', file: '天马.png', desc: '腾云驾雾，象征忠勇威猛、追求卓越。' },
    { id: 'haima', name: '海马', file: '海马.png', desc: '入海临渊，象征忠勇吉祥、可威服四方。' },
    { id: 'suanni', name: '狻猊', file: '狻猊.png', desc: '形似狮子，喜烟好坐，象征护佑平安。' },
    { id: 'yayu', name: '狎鱼', file: '狎鱼.png', desc: '海中异兽，能兴云作雨，防火压邪。' },
    { id: 'xiezhi', name: '獬豸', file: '獬豸.png', desc: '独角神兽，能辨是非曲直，象征公正。' },
    { id: 'douniu', name: '斗牛', file: '斗牛.png', desc: '虬龙之属，可兴云雨、镇压水患。' },
    { id: 'hangshi', name: '行什', file: '行什.png', desc: '猴面人身，举金刚杵，专克雷击，太和殿独有。' }
  ];

  // 宫殿脊兽配置
  const PALACE_BEASTS = [
    { palace: '太和殿', count: 10, beasts: ['xianren', 'long', 'feng', 'shi', 'tianma', 'haima', 'suanni', 'yayu', 'xiezhi', 'douniu', 'hangshi'] },
    { palace: '乾清宫', count: 9, beasts: ['xianren', 'long', 'feng', 'shi', 'tianma', 'haima', 'suanni', 'yayu', 'xiezhi'] },
    { palace: '坤宁宫', count: 7, beasts: ['xianren', 'long', 'feng', 'shi', 'tianma', 'haima', 'suanni'] },
    { palace: '东西六宫', count: 5, beasts: ['xianren', 'long', 'feng', 'shi', 'tianma'] }
  ];

  // 脊兽代表意义
  const BEAST_MEANINGS = [
    { id: 'huangquan', name: '皇权象征', desc: '龙、凤代表至高皇权，天子化身' },
    { id: 'xiangrui', name: '吉祥瑞兽', desc: '龙、凤、狮等象征太平盛世' },
    { id: 'fengshui', name: '风水守护', desc: '镇宅、辟邪、防火、避雷' },
    { id: 'yuzhou', name: '宇宙隐喻', desc: '十天干、八方位、统御八方' },
    { id: 'gongwu', name: '建筑功能', desc: '保护屋脊瓦件、固定檐角' }
  ];

  // 脊兽与意义的关联
  const BEAST_MEANING_LINKS = {
    'long': ['huangquan', 'xiangrui', 'fengshui'],
    'feng': ['huangquan', 'xiangrui'],
    'shi': ['xiangrui', 'fengshui'],
    'tianma': ['xiangrui'],
    'haima': ['xiangrui', 'fengshui'],
    'suanni': ['fengshui'],
    'yayu': ['fengshui'],
    'xiezhi': ['xiangrui'],
    'douniu': ['fengshui', 'yuzhou'],
    'hangshi': ['yuzhou', 'gongwu'],
    'xianren': ['xiangrui']
  };

  class JishouChapter {
    constructor(options) {
      this.root = options.root;
      this.state = {
        activeBeast: null,
        activePalace: null,
        activeMeaning: null
      };
      this.elements = {};
      this.tooltip = null;
      this.detailPanel = null;
    }

    async init() {
      this.createTooltip();
      this.createDetailPanel();
      this.renderFiveRidges();
      this.renderTenBeasts();
      this.renderSankey();
      this.bindGlobalEvents();

      // 等待DOM渲染完成后绘制连接线
      requestAnimationFrame(() => {
        this.redrawLinks();
      });
    }

    // 重绘连接线（用于窗口调整）
    redrawLinks() {
      const container = this.root.querySelector('.jishou-sankey-container');
      if (!container) return;

      // 移除旧链接
      container.querySelectorAll('.sankey-link').forEach(l => l.remove());

      const palaceCol = container.querySelector('.sankey-column--palace');
      const beastCol = container.querySelector('.sankey-column--beast');
      const meaningCol = container.querySelector('.sankey-column--meaning');

      if (palaceCol && beastCol && meaningCol) {
        this.drawSankeyLinks(container, palaceCol, beastCol, meaningCol);
      }
    }

    // 应用motion效果
    applyMotion(focus) {
      const zones = [
        this.root.querySelector('.jishou-left'),
        this.root.querySelector('.jishou-right')
      ];

      zones.forEach((zone, i) => {
        if (!zone) return;
        const x = i === 0 ? -20 : 20;
        const y = 12 * (1 - focus);
        const opacity = 0.18 + focus * 0.82;
        const scale = 0.88 + focus * 0.12;

        gsap.to(zone, {
          x: x * (1 - focus),
          y: y,
          scale: scale,
          opacity: opacity,
          duration: 0.4,
          ease: 'power2.out'
        });
      });
    }

    // 创建提示框
    createTooltip() {
      this.tooltip = document.createElement('div');
      this.tooltip.className = 'jishou-tooltip';
      document.body.appendChild(this.tooltip);
    }

    showTooltip(content, x, y) {
      this.tooltip.innerHTML = `
        <p class="jishou-tooltip__title">${content.title}</p>
        <p class="jishou-tooltip__desc">${content.desc}</p>
      `;
      this.tooltip.classList.add('is-visible');

      // 位置调整
      const rect = this.tooltip.getBoundingClientRect();
      let left = x + 16;
      let top = y - 10;

      if (left + rect.width > window.innerWidth - 20) {
        left = x - rect.width - 16;
      }
      if (top + rect.height > window.innerHeight - 20) {
        top = window.innerHeight - rect.height - 20;
      }

      this.tooltip.style.left = `${left}px`;
      this.tooltip.style.top = `${top}px`;
    }

    hideTooltip() {
      this.tooltip.classList.remove('is-visible');
    }

    // 创建详情面板
    createDetailPanel() {
      this.detailPanel = document.createElement('div');
      this.detailPanel.className = 'jishou-detail-panel';
      this.detailPanel.innerHTML = `
        <button class="jishou-detail-panel__close" aria-label="关闭">×</button>
        <h3 class="jishou-detail-panel__title"></h3>
        <p class="jishou-detail-panel__content"></p>
      `;
      document.body.appendChild(this.detailPanel);

      this.detailPanel.querySelector('.jishou-detail-panel__close')
        .addEventListener('click', () => this.hideDetailPanel());
    }

    showDetailPanel(beast) {
      const panel = this.detailPanel;
      panel.querySelector('.jishou-detail-panel__title').textContent = beast.name;
      panel.querySelector('.jishou-detail-panel__content').textContent = beast.desc;
      panel.classList.add('is-visible');
    }

    hideDetailPanel() {
      this.detailPanel.classList.remove('is-visible');
    }

    // 渲染五脊
    renderFiveRidges() {
      const ridgeZone = this.root.querySelector('.jishou-ridge-zone');
      if (!ridgeZone) return;

      const svgNS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('class', 'jishou-ridge-svg');
      svg.setAttribute('viewBox', '0 0 360 110');
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

      // 建筑屋顶轮廓 - 庑殿顶形式
      const roofPath = `
        M 15 95
        L 50 55 L 70 55
        L 90 75 L 90 55
        L 120 30 L 240 30
        L 270 55 L 270 75
        L 290 55 L 310 55
        L 345 95
        L 345 105 L 15 105 Z
      `;

      const roof = document.createElementNS(svgNS, 'path');
      roof.setAttribute('d', roofPath);
      roof.setAttribute('fill', 'rgba(180, 140, 100, 0.22)');
      roof.setAttribute('stroke', 'rgba(139, 90, 60, 0.55)');
      roof.setAttribute('stroke-width', '2');
      svg.appendChild(roof);

      // 正脊（顶部横梁）
      const zhengji = document.createElementNS(svgNS, 'rect');
      zhengji.setAttribute('x', '120');
      zhengji.setAttribute('y', '28');
      zhengji.setAttribute('width', '120');
      zhengji.setAttribute('height', '6');
      zhengji.setAttribute('fill', 'rgba(139, 90, 60, 0.45)');
      zhengji.setAttribute('rx', '2');
      svg.appendChild(zhengji);

      // 鸱吻装饰（左）
      const chiwenLeft = document.createElementNS(svgNS, 'path');
      chiwenLeft.setAttribute('d', 'M 108 22 Q 96 12 90 24 Q 96 38 112 34 Z');
      chiwenLeft.setAttribute('fill', 'rgba(139, 90, 60, 0.55)');
      chiwenLeft.setAttribute('stroke', 'rgba(139, 90, 60, 0.7)');
      chiwenLeft.setAttribute('stroke-width', '1.5');
      svg.appendChild(chiwenLeft);

      // 鸱吻装饰（右）
      const chiwenRight = document.createElementNS(svgNS, 'path');
      chiwenRight.setAttribute('d', 'M 252 22 Q 264 12 270 24 Q 264 38 248 34 Z');
      chiwenRight.setAttribute('fill', 'rgba(139, 90, 60, 0.55)');
      chiwenRight.setAttribute('stroke', 'rgba(139, 90, 60, 0.7)');
      chiwenRight.setAttribute('stroke-width', '1.5');
      svg.appendChild(chiwenRight);

      // 四条垂脊
      const chuiLines = [
        { x1: 58, y1: 52, x2: 42, y2: 78 },   // 左前
        { x1: 302, y1: 52, x2: 318, y2: 78 }, // 右前
        { x1: 78, y1: 72, x2: 58, y2: 95 },   // 左后
        { x1: 282, y1: 72, x2: 302, y2: 95 }  // 右后
      ];

      chuiLines.forEach(line => {
        const chui = document.createElementNS(svgNS, 'line');
        chui.setAttribute('x1', line.x1);
        chui.setAttribute('y1', line.y1);
        chui.setAttribute('x2', line.x2);
        chui.setAttribute('y2', line.y2);
        chui.setAttribute('stroke', 'rgba(139, 90, 60, 0.5)');
        chui.setAttribute('stroke-width', '3');
        chui.setAttribute('stroke-linecap', 'round');
        svg.appendChild(chui);

        // 垂兽
        const chuishou = document.createElementNS(svgNS, 'ellipse');
        chuishou.setAttribute('cx', line.x2);
        chuishou.setAttribute('cy', line.y2 + 3);
        chuishou.setAttribute('rx', '8');
        chuishou.setAttribute('ry', '10');
        chuishou.setAttribute('fill', 'rgba(139, 90, 60, 0.5)');
        chuishou.setAttribute('stroke', 'rgba(139, 90, 60, 0.65)');
        chuishou.setAttribute('stroke-width', '1.5');
        svg.appendChild(chuishou);
      });

      ridgeZone.appendChild(svg);

      // 为五脊按钮创建圆形虚线按钮
      this.renderRidgeButtons(ridgeZone);
    }

    renderRidgeButtons(zone) {
      // 五脊区域的圆形按钮（鸱吻和垂兽）
      const ridgeButtons = [
        { pos: { top: '8px', left: '8%' }, img: '鸱吻.png', label: '鸱吻', type: 'chiwen' },
        { pos: { top: '8px', right: '8%' }, img: '鸱吻.png', label: '鸱吻', type: 'chiwen' },
        { pos: { top: '32%', left: '4%' }, img: '垂兽.png', label: '垂兽', type: 'chuishou' },
        { pos: { top: '32%', right: '4%' }, img: '垂兽.png', label: '垂兽', type: 'chuishou' },
        { pos: { top: '58%', left: '12%' }, img: '垂兽.png', label: '垂兽', type: 'chuishou' },
        { pos: { top: '58%', right: '12%' }, img: '垂兽.png', label: '垂兽', type: 'chuishou' }
      ];

      ridgeButtons.forEach((btnData, i) => {
        const btn = document.createElement('button');
        btn.className = 'jishou-circle-btn';
        btn.setAttribute('data-ridge-index', i);
        btn.setAttribute('data-ridge-type', btnData.type);
        btn.setAttribute('aria-label', btnData.label);

        const img = document.createElement('img');
        img.className = 'jishou-circle-btn__img';
        img.src = `assets/images/beauty/jishou/button/${btnData.img}`;
        img.alt = btnData.label;
        img.onerror = () => {
          img.style.display = 'none';
        };

        btn.appendChild(img);
        Object.assign(btn.style, btnData.pos);

        btn.addEventListener('mouseenter', (e) => {
          const desc = btnData.type === 'chiwen'
            ? '鸱吻，龙之九子之一，好吞，用于正脊两端，寓意防火镇宅。'
            : '垂兽，用于垂脊端部，稳固屋脊，防御风雨。';
          this.showTooltip({ title: btnData.label, desc }, e.clientX, e.clientY);
        });

        btn.addEventListener('mouseleave', () => this.hideTooltip());

        btn.addEventListener('click', () => {
          const nameEn = btnData.type === 'chiwen' ? 'Chiwen' : 'Chuishou';
          const desc = btnData.type === 'chiwen'
            ? '鸱吻，龙之九子之一，好吞，用于正脊两端，寓意防火镇宅。'
            : '垂兽，用于垂脊端部，稳固屋脊，防御风雨。';
          this.showDetailPanel({ name: btnData.label, nameEn, desc });
        });

        zone.appendChild(btn);
      });
    }

    // 渲染十小兽
    renderTenBeasts() {
      const beastsZone = this.root.querySelector('.jishou-beasts-zone');
      if (!beastsZone) return;

      // 添加展示图
      const img = document.createElement('img');
      img.className = 'jishou-beasts-image';
      img.src = 'assets/images/beauty/jishou/show/脊兽.png';
      img.alt = '十小兽展示图';
      img.onerror = () => {
        img.style.display = 'none';
      };
      beastsZone.appendChild(img);

      // 添加十小兽按钮
      const buttonPositions = [
        { top: '18%', left: '12%' },
        { top: '22%', left: '35%' },
        { top: '26%', left: '58%' },
        { top: '50%', left: '20%' },
        { top: '55%', left: '42%' },
        { top: '60%', left: '64%' },
        { top: '78%', left: '28%' },
        { top: '82%', left: '50%' },
        { top: '85%', left: '72%' },
        { top: '40%', left: '78%' }
      ];

      TEN_BEASTS.slice(0, 10).forEach((beast, i) => {
        const btn = document.createElement('button');
        btn.className = 'jishou-circle-btn';
        btn.setAttribute('data-beast-id', beast.id);
        btn.setAttribute('aria-label', beast.name);

        const img = document.createElement('img');
        img.className = 'jishou-circle-btn__img';
        img.src = `assets/images/beauty/jishou/button/${beast.file}`;
        img.alt = beast.name;
        img.onerror = () => {
          img.style.display = 'none';
        };

        const label = document.createElement('span');
        label.className = 'jishou-circle-btn__label';
        label.textContent = beast.name;

        btn.appendChild(img);
        btn.appendChild(label);
        Object.assign(btn.style, buttonPositions[i]);

        btn.addEventListener('mouseenter', (e) => {
          this.showTooltip({ title: beast.name, desc: beast.desc }, e.clientX, e.clientY);
        });

        btn.addEventListener('mouseleave', () => this.hideTooltip());

        btn.addEventListener('click', () => {
          this.state.activeBeast = beast.id;
          this.highlightSankeyBeast(beast.id);
          this.showDetailPanel(beast);
        });

        beastsZone.appendChild(btn);
      });
    }

    // 渲染桑基图
    renderSankey() {
      const container = this.root.querySelector('.jishou-sankey-container');
      if (!container) return;

      container.innerHTML = '';

      // 创建三列布局
      const palaceCol = this.createSankeyColumn('palace', '宫殿等级', PALACE_BEASTS.map(p => ({
        id: p.palace,
        name: p.palace,
        count: p.count,
        data: p
      })));

      const beastCol = this.createSankeyColumn('beast', '脊兽序列', TEN_BEASTS.map(b => ({
        id: b.id,
        name: b.name,
        count: 1,
        data: b
      })));

      const meaningCol = this.createSankeyColumn('meaning', '文化意义', BEAST_MEANINGS.map(m => ({
        id: m.id,
        name: m.name,
        count: 1,
        data: m
      })));

      container.appendChild(palaceCol);
      container.appendChild(beastCol);
      container.appendChild(meaningCol);

      // 绘制连接线
      this.drawSankeyLinks(container, palaceCol, beastCol, meaningCol);
    }

    createSankeyColumn(type, title, items) {
      const col = document.createElement('div');
      col.className = `sankey-column sankey-column--${type}`;

      const titleEl = document.createElement('div');
      titleEl.className = 'sankey-column__title';
      titleEl.textContent = title;
      titleEl.style.cssText = `
        font-size: 10px;
        letter-spacing: 0.16em;
        color: rgba(110, 75, 43, 0.48);
        text-transform: uppercase;
        text-align: center;
        margin-bottom: 8px;
      `;
      col.appendChild(titleEl);

      items.forEach(item => {
        const node = document.createElement('div');
        node.className = 'sankey-node';
        node.setAttribute('data-sankey-id', item.id);
        node.setAttribute('data-sankey-type', type);
        node.textContent = item.name;

        if (item.count > 1) {
          const countBadge = document.createElement('span');
          countBadge.className = 'sankey-node__count';
          countBadge.textContent = item.count;
          node.appendChild(countBadge);
        }

        // 绑定事件
        node.addEventListener('mouseenter', (e) => {
          const content = this.getSankeyNodeContent(type, item);
          this.showTooltip(content, e.clientX, e.clientY);
        });

        node.addEventListener('mouseleave', () => this.hideTooltip());

        node.addEventListener('click', () => {
          this.handleSankeyClick(type, item);
        });

        col.appendChild(node);
      });

      return col;
    }

    getSankeyNodeContent(type, item) {
      if (type === 'palace') {
        const p = item.data;
        return {
          title: item.name,
          desc: `共 ${p.count} 只脊兽（含骑凤仙人），${this.getBeastNames(p.beasts)}。`
        };
      } else if (type === 'beast') {
        return {
          title: item.name,
          desc: item.data.desc
        };
      } else {
        return {
          title: item.name,
          desc: item.data.desc
        };
      }
    }

    getBeastNames(beastIds) {
      return beastIds.slice(1).map(id => {
        const b = TEN_BEASTS.find(tb => tb.id === id);
        return b ? b.name : id;
      }).join('、');
    }

    handleSankeyClick(type, item) {
      // 清除所有高亮
      this.clearSankeyHighlight();

      if (type === 'palace') {
        this.state.activePalace = item.id;
        this.highlightPalaceConnections(item.data);
      } else if (type === 'beast') {
        this.state.activeBeast = item.id;
        this.highlightBeastConnections(item.id);
      } else {
        this.state.activeMeaning = item.id;
        this.highlightMeaningConnections(item.id);
      }
    }

    highlightSankeyBeast(beastId) {
      this.clearSankeyHighlight();
      this.highlightBeastConnections(beastId);
    }

    clearSankeyHighlight() {
      document.querySelectorAll('.sankey-node').forEach(n => {
        n.classList.remove('is-highlighted', 'is-dimmed');
      });
      document.querySelectorAll('.sankey-link').forEach(l => {
        l.classList.remove('is-highlighted', 'is-dimmed');
      });
    }

    highlightPalaceConnections(palaceData) {
      const allNodes = document.querySelectorAll('.sankey-node');
      const highlightedBeasts = new Set(palaceData.beasts);

      allNodes.forEach(node => {
        const id = node.dataset.sankeyId;
        const nodeType = node.dataset.sankeyType;

        if (id === palaceData.palace) {
          node.classList.add('is-highlighted');
        } else if (nodeType === 'beast' && highlightedBeasts.has(id)) {
          node.classList.add('is-highlighted');
        } else if (nodeType === 'meaning') {
          // 检查这个宫殿的脊兽是否关联这个意义
          const linkedMeanings = new Set();
          palaceData.beasts.forEach(bid => {
            const meanings = BEAST_MEANING_LINKS[bid] || [];
            meanings.forEach(m => linkedMeanings.add(m));
          });
          if (linkedMeanings.has(id)) {
            node.classList.add('is-highlighted');
          } else {
            node.classList.add('is-dimmed');
          }
        } else if (nodeType === 'palace') {
          node.classList.add('is-dimmed');
        }
      });

      // 高亮连接线
      this.highlightLinks();
    }

    highlightBeastConnections(beastId) {
      const allNodes = document.querySelectorAll('.sankey-node');
      const meanings = BEAST_MEANING_LINKS[beastId] || [];

      allNodes.forEach(node => {
        const id = node.dataset.sankeyId;
        const nodeType = node.dataset.sankeyType;

        if (id === beastId) {
          node.classList.add('is-highlighted');
        } else if (nodeType === 'meaning' && meanings.includes(id)) {
          node.classList.add('is-highlighted');
        } else if (nodeType === 'palace') {
          // 检查哪个宫殿有这个脊兽
          const hasBeast = PALACE_BEASTS.some(p => p.beasts.includes(beastId) && p.palace === id);
          if (hasBeast) {
            node.classList.add('is-highlighted');
          } else {
            node.classList.add('is-dimmed');
          }
        } else {
          node.classList.add('is-dimmed');
        }
      });

      this.highlightLinks();
    }

    highlightMeaningConnections(meaningId) {
      const allNodes = document.querySelectorAll('.sankey-node');
      const linkedBeasts = Object.entries(BEAST_MEANING_LINKS)
        .filter(([_, meanings]) => meanings.includes(meaningId))
        .map(([beastId, _]) => beastId);

      allNodes.forEach(node => {
        const id = node.dataset.sankeyId;
        const nodeType = node.dataset.sankeyType;

        if (id === meaningId) {
          node.classList.add('is-highlighted');
        } else if (nodeType === 'beast' && linkedBeasts.includes(id)) {
          node.classList.add('is-highlighted');
        } else if (nodeType === 'palace') {
          // 检查哪个宫殿有这些脊兽
          const hasLinkedBeast = PALACE_BEASTS.some(p =>
            p.beasts.some(b => linkedBeasts.includes(b)) && p.palace === id
          );
          if (hasLinkedBeast) {
            node.classList.add('is-highlighted');
          } else {
            node.classList.add('is-dimmed');
          }
        } else {
          node.classList.add('is-dimmed');
        }
      });

      this.highlightLinks();
    }

    highlightLinks() {
      const links = document.querySelectorAll('.sankey-link');
      const highlightedNodes = document.querySelectorAll('.sankey-node.is-highlighted');
      const highlightedIds = new Set([...highlightedNodes].map(n => n.dataset.sankeyId));

      links.forEach(link => {
        const from = link.dataset.from;
        const to = link.dataset.to;
        if (highlightedIds.has(from) && highlightedIds.has(to)) {
          link.classList.add('is-highlighted');
        } else {
          link.classList.add('is-dimmed');
        }
      });
    }

    drawSankeyLinks(container, palaceCol, beastCol, meaningCol) {
      // 简化：使用绝对定位的线条
      const palaceNodes = palaceCol.querySelectorAll('.sankey-node');
      const beastNodes = beastCol.querySelectorAll('.sankey-node');
      const meaningNodes = meaningCol.querySelectorAll('.sankey-node');

      // 宫殿到脊兽的连接
      PALACE_BEASTS.forEach(palace => {
        const palaceNode = [...palaceNodes].find(n => n.dataset.sankeyId === palace.palace);
        if (!palaceNode) return;

        const pRect = palaceNode.getBoundingClientRect();
        const cRect = container.getBoundingClientRect();

        palace.beasts.forEach(beastId => {
          const beastNode = [...beastNodes].find(n => n.dataset.sankeyId === beastId);
          if (!beastNode) return;

          const bRect = beastNode.getBoundingClientRect();

          const link = document.createElement('div');
          link.className = 'sankey-link';
          link.setAttribute('data-from', palace.palace);
          link.setAttribute('data-to', beastId);

          const x1 = pRect.right - cRect.left;
          const y1 = pRect.top + pRect.height / 2 - cRect.top;
          const x2 = bRect.left - cRect.left;
          const y2 = bRect.top + bRect.height / 2 - cRect.top;

          link.style.left = `${x1}px`;
          link.style.top = `${y1}px`;
          link.style.width = `${Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))}px`;
          link.style.transform = `rotate(${Math.atan2(y2 - y1, x2 - x1)}rad)`;

          container.appendChild(link);
        });
      });

      // 脊兽到意义的连接
      Object.entries(BEAST_MEANING_LINKS).forEach(([beastId, meaningIds]) => {
        const beastNode = [...beastNodes].find(n => n.dataset.sankeyId === beastId);
        if (!beastNode) return;

        const bRect = beastNode.getBoundingClientRect();
        const cRect = container.getBoundingClientRect();

        meaningIds.forEach(meaningId => {
          const meaningNode = [...meaningNodes].find(n => n.dataset.sankeyId === meaningId);
          if (!meaningNode) return;

          const mRect = meaningNode.getBoundingClientRect();

          const link = document.createElement('div');
          link.className = 'sankey-link';
          link.setAttribute('data-from', beastId);
          link.setAttribute('data-to', meaningId);

          const x1 = bRect.right - cRect.left;
          const y1 = bRect.top + bRect.height / 2 - cRect.top;
          const x2 = mRect.left - cRect.left;
          const y2 = mRect.top + mRect.height / 2 - cRect.top;

          link.style.left = `${x1}px`;
          link.style.top = `${y1}px`;
          link.style.width = `${Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))}px`;
          link.style.transform = `rotate(${Math.atan2(y2 - y1, x2 - x1)}rad)`;

          container.appendChild(link);
        });
      });
    }

    bindGlobalEvents() {
      // 点击空白处关闭详情面板
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.jishou-detail-panel') &&
            !e.target.closest('.jishou-circle-btn') &&
            !e.target.closest('.sankey-node')) {
          this.hideDetailPanel();
        }
      });

      // ESC关闭详情面板
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.hideDetailPanel();
          this.clearSankeyHighlight();
        }
      });
    }
  }

  // 暴露到全局
  window.JishouChapter = JishouChapter;
})();
