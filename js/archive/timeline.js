/**
 * =====================================================
 *  js/home-timeline.js
 *  明清时间线数据与渲染
 *  宫阙云览·故宫可视化平台
 *  =====================================================
 */

class HomeTimeline {
  constructor(options = {}) {
    this.container = options.container || document.getElementById('home-timeline')
    this.titleElement = options.titleElement || document.getElementById('home-timeline-section')?.querySelector('.home-info__timeline-title')

    this.gsap = window.gsap
    this._bindLanguageEvents()
  }

  /**
   * 初始化
   */
  init() {
    this._render()
  }

  /**
   * 明清时间线数据（详细版）
   */
  _getTimelineData() {
    const zh = {
      sectionTitle: '发展史',
      buildingLabel: '故宫太和殿',
      summary: '以太和殿为线索，梳理这座外朝主殿从永乐营建、数度焚毁、改名，到康熙重建成今日形制的关键节点。',
      eras: [
        {
          key: 'ming',
          label: '明',
          events: [
            { year: '1406', reign: '明永乐四年', desc: '紫禁城开始营建，太和殿作为外朝核心殿宇进入整体规划。' },
            { year: '1420', reign: '明永乐十八年', desc: '太和殿建成，初名"奉天殿"，成为前三殿之首。' },
            { year: '1421', reign: '明永乐十九年', desc: '奉天殿遭雷火焚毁，前三殿受损，外朝礼制空间被迫重整。' },
            { year: '1440', reign: '明正统五年', desc: '前三殿与乾清宫重建完成，中轴核心秩序恢复。' },
            { year: '1557', reign: '明嘉靖三十六年', desc: '紫禁城大火再次波及前三殿与午门一带，太和殿前身再度损毁。' },
            { year: '1562', reign: '明嘉靖四十一年', desc: '重建完成，并由"奉天殿"改称"皇极殿"。' },
            { year: '1597', reign: '明万历二十五年', desc: '宫城再次遭火灾，前三殿与后三宫多处焚毁。' },
            { year: '1627', reign: '明天启七年', desc: '复建工程完成，明末时期的皇极殿形制基本恢复。' }
          ]
        },
        {
          key: 'qing',
          label: '清',
          events: [
            { year: '1645', reign: '清顺治二年', desc: '皇极殿改称"太和殿"，三大殿名称体系沿用至今。' },
            { year: '1646', reign: '清顺治三年', desc: '清廷着手修缮外朝建筑，太和殿重新承担朝会与大典功能。' },
            { year: '1679', reign: '清康熙十八年', desc: '太和殿再次遭雷击焚毁，重建计划因国政与备料而延后。' },
            { year: '1695', reign: '清康熙三十四年', desc: '重建工程正式兴工，确立今天所见太和殿的体量与形制。' },
            { year: '1697', reign: '清康熙三十六年', desc: '太和殿重建竣工，重新成为清代最高等级的礼仪中心。' },
            { year: '1889', reign: '清光绪十五年', desc: '太和门于前一年失火后重建完成，外朝前部格局得到修复。' },
            { year: '1911', reign: '清宣统三年', desc: '清廷走向终局，太和殿作为皇家礼制中心的历史使命逐渐结束。' }
          ]
        }
      ]
    }

    const en = {
      sectionTitle: 'Development History',
      buildingLabel: 'Hall of Supreme Harmony',
      summary: 'A concise chronology of the hall\'s planning, fires, renaming, and Qing reconstruction, following how the core ceremonial hall evolved from the early Ming to the late imperial era.',
      eras: [
        {
          key: 'ming',
          label: 'Ming',
          events: [
            { year: '1406', reign: 'Yongle 4', desc: 'Construction of the Forbidden City began, with the hall planned as the ceremonial core of the Outer Court.' },
            { year: '1420', reign: 'Yongle 18', desc: 'The hall was completed under the original name Fengtian Dian and became the first of the Three Front Halls.' },
            { year: '1421', reign: 'Yongle 19', desc: 'A lightning fire destroyed Fengtian Dian, damaging the Three Front Halls.' },
            { year: '1440', reign: 'Zhengtong 5', desc: 'The Three Front Halls and Qianqing Palace were rebuilt, restoring the central-axis ceremonial order.' },
            { year: '1557', reign: 'Jiajing 36', desc: 'A major palace fire again damaged the front ceremonial halls and the Meridian Gate precinct.' },
            { year: '1562', reign: 'Jiajing 41', desc: 'After reconstruction, the hall was renamed Huangji Dian.' },
            { year: '1597', reign: 'Wanli 25', desc: 'Another large fire damaged multiple palace structures, including the front halls.' },
            { year: '1627', reign: 'Tianqi 7', desc: 'Reconstruction was completed, restoring the late-Ming ceremonial complex.' }
          ]
        },
        {
          key: 'qing',
          label: 'Qing',
          events: [
            { year: '1645', reign: 'Shunzhi 2', desc: 'Huangji Dian was officially renamed Taihe Dian, the name still used today.' },
            { year: '1646', reign: 'Shunzhi 3', desc: 'The Qing court resumed repairs to the Outer Court, restoring its ceremonial role.' },
            { year: '1679', reign: 'Kangxi 18', desc: 'The hall was struck by lightning and burned again, delaying reconstruction for years.' },
            { year: '1695', reign: 'Kangxi 34', desc: 'Major reconstruction began, establishing the scale and form seen today.' },
            { year: '1697', reign: 'Kangxi 36', desc: 'Reconstruction was completed and the hall resumed its role as the highest imperial ceremonial space.' },
            { year: '1889', reign: 'Guangxu 15', desc: 'Taihe Gate was rebuilt after the previous year\'s fire, repairing the front-court setting.' },
            { year: '1911', reign: 'Xuantong 3', desc: 'As the Qing court came to an end, the hall\'s imperial ceremonial role gradually faded out.' }
          ]
        }
      ]
    }

    return (window.state?.lang === 'en') ? en : zh
  }

  /**
   * 渲染时间线
   */
  _render() {
    if (!this.container) return

    const data = this._getTimelineData()
    const yearSuffix = (window.state?.lang === 'en') ? '' : '年'

    if (this.titleElement) {
      this.titleElement.textContent = data.sectionTitle
    }

    const erasMarkup = data.eras.map((era) => `
      <section class="timeline__era timeline__era--${era.key}">
        <div class="timeline__era-badge">${era.label}</div>
        <div class="timeline__events">
          ${era.events.map((event, index) => `
            <article class="timeline__item" data-era="${era.key}" data-index="${index}">
              <div class="timeline__node">
                <div class="timeline__dot"></div>
                <div class="timeline__line"></div>
              </div>
              <div class="timeline__content">
                <div class="timeline__year">(${event.year}${yearSuffix})</div>
                <div class="timeline__reign">${event.reign}</div>
                <div class="timeline__desc">${event.desc}</div>
              </div>
            </article>
          `).join('')}
        </div>
      </section>
    `).join('')

    this.container.innerHTML = `
      <div class="timeline__header">
        <div class="timeline__building-label">${data.buildingLabel}</div>
        <p class="timeline__summary">${data.summary}</p>
      </div>
      <div class="timeline__grid">
        ${erasMarkup}
      </div>
    `
  }

  /**
   * 入场动画
   */
  animateEntrance() {
    if (!this.gsap || !this.container) return

    const eras = this.container.querySelectorAll('.timeline__era')
    const items = this.container.querySelectorAll('.timeline__item')
    if (!eras.length && !items.length) return

    const tl = this.gsap.timeline()

    if (eras.length) {
      tl.fromTo(eras, {
        y: 24,
        autoAlpha: 0
      }, {
        y: 0,
        autoAlpha: 1,
        stagger: 0.12,
        duration: 0.42,
        ease: 'power2.out'
      })
    }

    if (items.length) {
      tl.fromTo(items, {
        x: 18,
        autoAlpha: 0
      }, {
        x: 0,
        autoAlpha: 1,
        stagger: 0.035,
        duration: 0.28,
        ease: 'power2.out'
      }, '-=0.2')
    }
  }

  /**
   * 绑定语言切换事件
   */
  _bindLanguageEvents() {
    window.addEventListener('archi:languagechange', () => {
      this._render()
      setTimeout(() => this.animateEntrance(), 80)
    })
  }

  /**
   * 销毁
   */
  destroy() {
    this.container.innerHTML = ''
  }
}

window.HomeTimeline = HomeTimeline
