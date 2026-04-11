/**
 * =====================================================
 *  js/home-overview.js
 *  中间区域内容加载与热区交互
 *  宫阙云览·故宫可视化平台
 *  =====================================================
 */

class HomeOverview {
  constructor(options = {}) {
    this.container = options.container || document.getElementById('home-overview')
    this.svgContainer = options.svgContainer || document.getElementById('home-svg-container')
    this.placeholder = options.placeholder || document.getElementById('home-overview-placeholder')
    this.svgPath = options.svgPath || 'assets/images/map/overview.svg'

    this.svg = null
    this.hotspots = []
    this.tooltip = null
    this.activeHotspot = null
    this.gsap = window.gsap
    this.loadTimeout = null
    this.isLoading = false
  }

  /**
   * 初始化
   */
  init() {
    this._createTooltip()
    this._bindLanguageEvents()
  }

  /**
   * 加载 SVG 并初始化热区
   */
  async loadSVG() {
    if (!this.svgContainer) return false
    if (this.isLoading) return false
    this.isLoading = true

    this._showLoading()

    // 设置加载超时（15秒）
    const timeoutPromise = new Promise((_, reject) => {
      this.loadTimeout = setTimeout(() => {
        reject(new Error('SVG加载超时（15秒），文件可能过大'))
      }, 15000)
    })

    try {
      const response = await Promise.race([
        fetch(this.svgPath),
        timeoutPromise
      ])

      clearTimeout(this.loadTimeout)

      if (!response.ok) {
        throw new Error(`SVG加载失败: HTTP ${response.status}`)
      }

      const svgText = await response.text()

      // 验证SVG内容
      if (!svgText.includes('<svg') || !svgText.includes('</svg>')) {
        throw new Error('SVG内容无效')
      }

      this.svgContainer.innerHTML = svgText

      this.svg = this.svgContainer.querySelector('svg')
      if (!this.svg) throw new Error('无法解析SVG结构')

      this._setupSVG()
      await this._scanHotspots()
      this._toggleVisibility(true)
      this._animateEntrance()
      this.isLoading = false
      return true
    } catch (error) {
      clearTimeout(this.loadTimeout)
      this.isLoading = false
      console.error('HomeOverview: SVG加载失败', error)
      this._showError(error.message || '加载失败')
      return false
    }
  }

  /**
   * 设置 SVG 样式
   */
  _setupSVG() {
    if (!this.svg) return

    this.svg.classList.add('home-overview__svg')
    this.svg.setAttribute('role', 'img')
    this.svg.setAttribute('aria-label', '故宫总览图')

    // 确保SVG可交互
    this.svg.style.maxWidth = '100%'
    this.svg.style.maxHeight = '100%'
    this.svg.style.display = 'block'

    // 移除或降低内嵌样式中的pointer-events限制
    const styleElements = this.svg.querySelectorAll('style')
    styleElements.forEach(styleEl => {
      let cssText = styleEl.textContent
      // 移除任何限制pointer-events的规则
      cssText = cssText.replace(/pointer-events\s*:\s*none\s*;/gi, 'pointer-events: auto;')
      styleEl.textContent = cssText
    })

    // 设置SVG根元素为可交互
    this.svg.style.pointerEvents = 'auto'

    // 降低图片透明度以突出热区
    const images = this.svg.querySelectorAll('image')
    images.forEach(img => {
      img.style.opacity = '0.95'
    })

    this._scaleSVG()
  }

  /**
   * 缩放 SVG 以适应容器
   */
  _scaleSVG() {
    const containerRect = this.svgContainer.getBoundingClientRect()
    const svgWidth = parseFloat(this.svg.getAttribute('width')) || 987.436
    const svgHeight = parseFloat(this.svg.getAttribute('height')) || 1398.857

    const scaleX = (containerRect.width * 0.9) / svgWidth
    const scaleY = (containerRect.height * 0.9) / svgHeight
    const scale = Math.min(scaleX, scaleY, 1)

    this.svg.style.width = `${svgWidth * scale}px`
    this.svg.style.height = `${svgHeight * scale}px`
  }

  /**
   * 扫描热区
   */
  async _scanHotspots() {
    if (!this.svg) {
      console.warn('HomeOverview: SVG未初始化，无法扫描热区')
      return
    }

    // 尝试使用 svgScanner.js 中的函数
    if (typeof scanSVGHotspots === 'function') {
      try {
        this.hotspots = scanSVGHotspots(this.svg)
        console.log('HomeOverview: 使用svgScanner扫描到热区', this.hotspots?.length)
      } catch (e) {
        console.warn('HomeOverview: svgScanner扫描失败', e)
      }
    }

    // 备用：直接扫描 SVG 中的 g 元素作为热区
    if (!this.hotspots || !this.hotspots.length) {
      console.log('HomeOverview: 使用备用方式扫描热区')
      this.hotspots = []
      const groups = this.svg.querySelectorAll('g[id]')

      groups.forEach(group => {
        const paths = group.querySelectorAll('path')
        if (paths.length) {
          this.hotspots.push({
            svgId: group.id,
            buildingId: group.id,
            labelZh: group.dataset.labelZh || group.id,
            labelEn: group.dataset.labelEn || group.id,
            paths: Array.from(paths)
          })
        }
      })
      console.log('HomeOverview: 备用扫描到热区', this.hotspots.length)
    }

    if (this.hotspots && this.hotspots.length > 0) {
      this._bindHotspotEvents()
    } else {
      console.warn('HomeOverview: 未扫描到任何热区')
    }
  }

  /**
   * 绑定热区事件
   */
  _bindHotspotEvents() {
    if (!this.hotspots || !this.hotspots.length) {
      console.log('HomeOverview: 没有找到热区')
      return
    }

    console.log('HomeOverview: 绑定热区事件', this.hotspots.length)

    this.hotspots.forEach((hotspot, index) => {
      const paths = hotspot.paths || []

      if (!paths.length) {
        console.log(`HomeOverview: 热区 ${index} (${hotspot.labelZh || hotspot.svgId}) 没有path元素`)
        return
      }

      paths.forEach(path => {
        // 确保路径可交互
        path.style.pointerEvents = 'visiblePainted'
        path.style.fill = 'rgba(255,255,255,0.01)'
        path.style.cursor = 'pointer'
        path.style.stroke = 'transparent'
        path.style.strokeWidth = '0'
        path.style.strokeLinejoin = 'round'
        path.style.strokeLinecap = 'round'
        path.style.transition = 'fill 0.18s ease, stroke 0.18s ease, stroke-width 0.18s ease, filter 0.18s ease'

        // 移除可能阻止交互的属性
        path.removeAttribute('pointer-events')

        // 添加热区类（使 building-detail.css 分类筛选样式生效）
        path.classList.add('home-overview__hotspot')

        // 绑定事件
        path.addEventListener('mouseenter', (e) => this._onHotspotHover(hotspot, e))
        path.addEventListener('mousemove', (e) => this._onHotspotMove(hotspot, e))
        path.addEventListener('mouseleave', () => this._onHotspotLeave(hotspot))
        path.addEventListener('click', (e) => {
          e.stopPropagation()
          this._onHotspotClick(hotspot)
        })

        // 触屏支持
        path.addEventListener('touchstart', (e) => {
          e.preventDefault()
          this._onHotspotHover(hotspot, e.touches[0])
        }, { passive: false })

        path.addEventListener('touchend', (e) => {
          e.preventDefault()
          this._onHotspotClick(hotspot)
        }, { passive: false })
      })

      console.log(`HomeOverview: 热区 ${index} (${hotspot.labelZh || hotspot.svgId}) 绑定完成, ${paths.length} 个路径`)
    })
  }

  /**
   * 热区悬停
   */
  _onHotspotHover(hotspot, event) {
    this.activeHotspot = hotspot

    if (hotspot.paths && hotspot.paths.length) {
      hotspot.paths.forEach(path => {
        // 使用CSS filter实现高亮效果
        path.style.fill = 'rgba(232, 188, 92, 0.22)'
        path.style.filter = 'brightness(1.28) saturate(1.18) drop-shadow(0 0 10px rgba(214, 169, 77, 0.46))'
        path.style.stroke = 'rgba(224, 184, 92, 0.96)'
        path.style.strokeWidth = '2.4'
      })
    }

    this._showTooltip(hotspot, event)
    this._dispatchEvent('home:hotspot:hover', { hotspot })
  }

  /**
   * 热区移动
   */
  _onHotspotMove(hotspot, event) {
    this._updateTooltipPosition(event)
  }

  /**
   * 热区离开
   */
  _onHotspotLeave(hotspot) {
    this.activeHotspot = null

    if (hotspot.paths && hotspot.paths.length) {
      hotspot.paths.forEach(path => {
        // 移除高亮效果
        path.style.fill = 'rgba(255,255,255,0.01)'
        path.style.filter = ''
        path.style.stroke = 'transparent'
        path.style.strokeWidth = '0'
      })
    }

    this._hideTooltip()
  }

  /**
   * 热区点击
   */
  _onHotspotClick(hotspot) {
    this._dispatchEvent('home:hotspot:click', { hotspot })

    if (hotspot.paths && hotspot.paths.length) {
      hotspot.paths.forEach(path => {
        path.style.fill = 'rgba(232, 188, 92, 0.3)'
        path.style.filter = 'brightness(1.34) saturate(1.2) drop-shadow(0 0 12px rgba(214, 169, 77, 0.52))'
        path.style.stroke = 'rgba(235, 197, 108, 0.98)'
        path.style.strokeWidth = '2.8'
      })

      // 3秒后恢复
      setTimeout(() => {
        if (this.activeHotspot === hotspot) return
        hotspot.paths.forEach(path => {
          path.style.fill = 'rgba(255,255,255,0.01)'
          path.style.filter = ''
          path.style.stroke = 'transparent'
          path.style.strokeWidth = '0'
        })
      }, 3000)
    }
  }

  /**
   * 创建 Tooltip
   */
  _createTooltip() {
    this.tooltip = document.createElement('div')
    this.tooltip.className = 'home-overview__tooltip'
    this.tooltip.innerHTML = `
      <span class="home-overview__tooltip-zh"></span>
      <span class="home-overview__tooltip-en"></span>
    `
    document.body.appendChild(this.tooltip)
  }

  /**
   * 显示 Tooltip
   */
  _showTooltip(hotspot, event) {
    const zhEl = this.tooltip.querySelector('.home-overview__tooltip-zh')
    const enEl = this.tooltip.querySelector('.home-overview__tooltip-en')

    const lang = window.state?.lang || 'zh'
    zhEl.textContent = hotspot.labelZh || hotspot.svgId
    enEl.textContent = hotspot.labelEn || hotspot.svgId

    if (lang === 'en') {
      zhEl.style.display = 'none'
      enEl.style.display = 'block'
    } else {
      zhEl.style.display = 'block'
      enEl.style.display = 'none'
    }

    this._updateTooltipPosition(event)
    this.tooltip.classList.add('is-visible')
  }

  /**
   * 更新 Tooltip 位置
   */
  _updateTooltipPosition(event) {
    const offset = 15
    const x = event.clientX + offset
    const y = event.clientY + offset

    const tooltipRect = this.tooltip.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let finalX = x
    let finalY = y

    if (x + tooltipRect.width > viewportWidth) {
      finalX = event.clientX - tooltipRect.width - offset
    }

    if (y + tooltipRect.height > viewportHeight) {
      finalY = event.clientY - tooltipRect.height - offset
    }

    this.tooltip.style.left = `${finalX}px`
    this.tooltip.style.top = `${finalY}px`
  }

  /**
   * 隐藏 Tooltip
   */
  _hideTooltip() {
    this.tooltip.classList.remove('is-visible')
  }

  /**
   * 显示加载状态
   */
  _showLoading() {
    this.svgContainer.innerHTML = `
      <div class="home-overview__loading">
        <div class="home-overview__loading-spinner"></div>
        <span class="home-overview__loading-text">加载中...</span>
      </div>
    `
  }

  /**
   * 显示错误状态
   */
  _showError() {
    this.svgContainer.innerHTML = `
      <div class="home-overview__placeholder">
        <span class="home-overview__placeholder-text">加载失败</span>
      </div>
    `
  }

  /**
   * 入场动画
   */
  _animateEntrance() {
    if (!this.gsap || !this.svg) return

    this.gsap.fromTo(this.svg,
      { scale: 0.85, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 1.2,
        ease: 'power3.out'
      }
    )
  }

  /**
   * 切换模块内容
   */
  showModule(moduleName) {
    if (!this.gsap) {
      this._toggleVisibility(moduleName === 'archive')
      return
    }

    const tl = this.gsap.timeline()
    tl.to(this.svgContainer, {
      opacity: 0,
      duration: 0.35,
      ease: 'power2.in',
      onComplete: () => {
        this._toggleVisibility(moduleName === 'archive')
      }
    })
    .to(this.svgContainer, {
      opacity: 1,
      duration: 0.45,
      ease: 'power2.out'
    })
  }

  /**
   * 切换可见性
   */
  _toggleVisibility(show) {
    if (show) {
      this.svgContainer.hidden = false
      this.placeholder.hidden = true
    } else {
      this.svgContainer.hidden = true
      this.placeholder.hidden = false
    }
  }

  /**
   * 绑定语言切换事件
   */
  _bindLanguageEvents() {
    window.addEventListener('archi:languagechange', (e) => {
      const lang = e.detail?.lang || 'zh'

      if (lang === 'en') {
        this.tooltip.querySelector('.home-overview__tooltip-zh').style.display = 'none'
        this.tooltip.querySelector('.home-overview__tooltip-en').style.display = 'block'
      } else {
        this.tooltip.querySelector('.home-overview__tooltip-zh').style.display = 'block'
        this.tooltip.querySelector('.home-overview__tooltip-en').style.display = 'none'
      }
    })
  }

  /**
   * 派发事件
   */
  _dispatchEvent(eventName, detail = {}) {
    window.dispatchEvent(new CustomEvent(eventName, { detail }))
  }

  /**
   * 销毁
   */
  destroy() {
    if (this.tooltip && this.tooltip.parentNode) {
      this.tooltip.parentNode.removeChild(this.tooltip)
    }
  }
}

window.HomeOverview = HomeOverview
