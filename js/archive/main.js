/**
 * =====================================================
 *  js/home.js
 *  首页主入口与GSAP动画
 *  宫阙云览·故宫可视化平台
 *  =====================================================
 */

class HomePage {
  constructor() {
    this.currentModule = 'archive'
    this.modules = ['archive', 'thought', 'appreciation', 'typology']

    this.elements = {
      page: document.getElementById('home-page'),
      navBtns: document.querySelectorAll('.home-nav__btn'),
      overview: document.getElementById('home-overview'),
      assistantBtn: document.getElementById('home-assistant-btn'),
      langBtn: document.getElementById('home-lang-btn'),
      statsContainer: document.getElementById('home-stats'),
      introContainer: document.getElementById('home-intro'),
      timelineContainer: document.getElementById('home-timeline')
    }

    this.homeOverview = null
    this.homeTimeline = null
    this.zhulingWidget = null
    this.buildingDetail = null
    this.gsap = window.gsap
  }

  /**
   * 初始化
   */
  async init() {
    this._renderStats()
    this._renderIntro()
    this._updateNavState(this.currentModule)
    this._bindNavEvents()
    this._bindAssistantEvents()
    this._bindLangEvents()

    await this._initOverview()
    this._initTimeline()
    this._initBuildingDetail()

    this._initZhuling()
    this._animateEntrance()
  }

  /**
   * 渲染关键数据
   */
  _renderStats() {
    if (!this.elements.statsContainer) return

    const stats = [
      { label: '南北纵长', value: '960', unit: '米' },
      { label: '东西横宽', value: '750', unit: '米' },
      { label: '占地面积', value: '72', unit: '公顷' },
      { label: '房屋总数', value: '8700+', unit: '间' }
    ]

    const lang = window.state?.lang || 'zh'
    if (lang === 'en') {
      stats[0].label = 'North-South Length'
      stats[1].label = 'East-West Width'
      stats[2].label = 'Area'
      stats[3].label = 'Buildings'
    }

    this.elements.statsContainer.innerHTML = stats.map(stat => `
      <div class="home-info__stat-card">
        <span class="home-info__stat-value">
          ${stat.value}<span class="home-info__stat-unit">${stat.unit}</span>
        </span>
        <span class="home-info__stat-label">${stat.label}</span>
      </div>
    `).join('')
  }

  /**
   * 渲染整体介绍
   */
  _renderIntro() {
    if (!this.elements.introContainer) return

    const lang = window.state?.lang || 'zh'
    const intro = lang === 'en'
      ? 'The Forbidden City, also known as the Palace Museum, stands as the largest collection of preserved ancient wooden structures in the world. As the imperial palace of the Ming and Qing dynasties for nearly 500 years, it witnessed the zenith of Chinese imperial power and now serves as a cultural treasure trove, housing over 1.86 million cultural relics within its red walls and yellow tiles.'
      : '故宫，又称紫禁城，是世界上规模最大、保存最完整的木质结构古建筑群。作为明清两代的皇家宫殿，近五百年的风云变幻在这红墙黄瓦间上演，如今这里已成为中华文化的宝库，收藏文物一百八十六万余件。'

    this.elements.introContainer.innerHTML = `<p>${intro}</p>`
  }

  /**
   * 初始化中间区域
   */
  async _initOverview() {
    this.homeOverview = new HomeOverview({
      container: this.elements.overview,
      svgContainer: document.getElementById('home-svg-container'),
      placeholder: document.getElementById('home-overview-placeholder'),
      svgPath: 'assets/images/map/overview.svg'
    })
    this.homeOverview.init()
    await this.homeOverview.loadSVG()
  }

  /**
   * 初始化时间线
   */
  _initTimeline() {
    this.homeTimeline = new HomeTimeline({
      container: this.elements.timelineContainer
    })
    this.homeTimeline.init()
  }

  /**
   * 初始化建筑详情弹层
   */
  _initBuildingDetail() {
    this.buildingDetail = new BuildingDetail()
    this.buildingDetail.init()

    // 监听热区点击事件，打开建筑详情
    window.addEventListener('home:hotspot:click', (e) => {
      const hotspot = e.detail?.hotspot
      if (hotspot?.buildingId) {
        this.buildingDetail.open(hotspot.buildingId)
      }
    })

    // 建筑详情关闭后恢复总览
    window.addEventListener('building-detail:closed', () => {
      // 可选：执行其他清理动作
    })
  }

  /**
   * 绑定导航按钮事件
   */
  _bindNavEvents() {
    this.elements.navBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const module = btn.dataset.module
        if (module) {
          this.switchModule(module)
        }
      })
    })
  }

  /**
   * 切换模块
   */
  switchModule(moduleName) {
    if (moduleName === this.currentModule) return
    if (!this.modules.includes(moduleName)) return

    this._updateNavState(moduleName)

    if (this.homeOverview) {
      this.homeOverview.showModule(moduleName)
    }

    if (this.homeTimeline) {
      if (moduleName === 'archive') {
        this._restoreArchivePanels()
      } else {
        this._animateModuleChange()
      }
    }

    this.currentModule = moduleName

    window.dispatchEvent(new CustomEvent('home:modulechange', {
      detail: { module: moduleName }
    }))
  }

  /**
   * 更新导航状态
   */
  _updateNavState(activeModule) {
    this.elements.navBtns.forEach(btn => {
      if (btn.dataset.module === activeModule) {
        btn.classList.add('active')
      } else {
        btn.classList.remove('active')
      }
    })
  }

  /**
   * 模块切换动画
   */
  _animateModuleChange() {
    if (!this.gsap) return

    const tl = this.gsap.timeline()

    tl.to(this.elements.statsContainer, {
      opacity: 0,
      y: -10,
      duration: 0.25,
      ease: 'power2.in'
    })
    .to(this.elements.introContainer, {
      opacity: 0,
      y: -10,
      duration: 0.25,
      ease: 'power2.in'
    }, '-=0.15')
    .to(this.elements.timelineContainer, {
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in'
    }, '-=0.15')
  }

  /**
   * 鎭㈠ archive 妯″潡鐨勪俊鎭潰鏉?
   */
  _restoreArchivePanels() {
    if (!this.gsap) return

    const panels = [
      this.elements.statsContainer,
      this.elements.introContainer,
      this.elements.timelineContainer
    ].filter(Boolean)

    if (!panels.length) return

    this.gsap.to(panels, {
      y: 0,
      opacity: 1,
      stagger: 0.05,
      duration: 0.35,
      ease: 'power2.out',
      clearProps: 'transform'
    })
  }

  /**
   * 绑定筑灵助手事件
   */
  _bindAssistantEvents() {
    if (!this.elements.assistantBtn) return

    this.elements.assistantBtn.addEventListener('click', () => {
      if (this.zhulingWidget) {
        this.zhulingWidget._open()
      }
    })
  }

  /**
   * 绑定语言切换事件
   */
  _bindLangEvents() {
    if (!this.elements.langBtn) return

    this.elements.langBtn.addEventListener('click', () => {
      const currentLang = window.state?.lang || 'zh'
      const newLang = currentLang === 'zh' ? 'en' : 'zh'

      if (window.state) {
        window.state.lang = newLang
      }

      window.dispatchEvent(new CustomEvent('archi:languagechange', {
        detail: { lang: newLang }
      }))

      this._updateLangBtn(newLang)
      this._renderStats()
      this._renderIntro()
    })
  }

  /**
   * 更新语言按钮状态
   */
  _updateLangBtn(lang) {
    if (!this.elements.langBtn) return

    this.elements.langBtn.textContent = lang === 'zh' ? '简/EN' : 'EN/简'
    this.elements.langBtn.classList.toggle('active', lang === 'en')
  }

  /**
   * 初始化筑灵助手
   */
  _initZhuling() {
    if (typeof ZhulingWidget !== 'undefined') {
      this.zhulingWidget = new ZhulingWidget({
        apiBase: 'http://localhost:3000',
        ipImage: 'assets/images/assistant/assistant.png',
        profileImage: 'assets/images/assistant/profile.png'
      })
      this.zhulingWidget.init()

      const root = document.getElementById('zhuling-root')
      if (root) {
        root.style.cssText = 'position:fixed;bottom:80px;left:14px;z-index:9999;'
      }
    }
  }

  /**
   * 入场动画
   */
  _animateEntrance() {
    if (!this.gsap) return

    const navButtons = Array.from(this.elements.navBtns || [])
    const tl = this.gsap.timeline({ delay: 0.3 })

    if (navButtons.length) {
      tl.fromTo(navButtons, {
        x: -96,
        autoAlpha: 0
      }, {
        x: 0,
        autoAlpha: 1,
        stagger: 0.16,
        duration: 0.62,
        ease: 'back.out(1.45)',
        clearProps: 'transform,opacity,visibility'
      })
    }

    tl.from('.home-nav__assistant-btn', {
      y: 30,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out'
    }, '-=0.3')
    .from('.home-nav__lang-btn', {
      y: 20,
      opacity: 0,
      duration: 0.4,
      ease: 'power2.out'
    }, '-=0.3')
    .from('.home-info__title', {
      y: 30,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out'
    }, '-=0.5')
    .from('.home-info__stat-card', {
      y: 20,
      opacity: 0,
      stagger: 0.1,
      duration: 0.5,
      ease: 'power2.out'
    }, '-=0.4')
    .from('.home-info__intro', {
      y: 20,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out'
    }, '-=0.3')
    .call(() => {
      if (this.homeTimeline) {
        this.homeTimeline.animateEntrance()
      }
    })
  }

  /**
   * 销毁
   */
  destroy() {
    if (this.homeOverview) {
      this.homeOverview.destroy()
    }
    if (this.homeTimeline) {
      this.homeTimeline.destroy()
    }
    if (this.zhulingWidget) {
      this.zhulingWidget.destroy()
    }
  }
}

window.HomePage = HomePage
