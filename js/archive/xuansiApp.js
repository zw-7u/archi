/* ============================================
   第三章 宫阙玄思 - 应用逻辑
   ============================================ */

(() => {
  'use strict';

  // 三个内容节点数据
  const XUANSI_NODES = [
    {
      id: 0,
      key: 'yinyang',
      name: '阴阳五行',
      title: '阴阳五行',
      timeStart: 0,
      timeEnd: 0.33,
      content: `阴阳五行是中国古代哲学的核心框架，贯穿于故宫建筑的每一个细节。
阴阳象征天地、日夜、男女的对立统一，故宫以乾清宫为阳轴、坤宁宫为阴翼，形成阴阳相济的空间格局。
五行对应木火土金水五种基本元素，在故宫中体现为：
• 五行色彩：青、红、黄、白、黑分别对应东、南、中、西、北五方
• 五行布局：太和殿属土，位居中央，统御四方
• 五行相生：木生火→火生土→土生金→金生水→水生木，循环不息
故宫的阴阳五行思想体现了中国古人"天人合一"的宇宙观，将天道运行法则映射到人间宫殿的营建之中。`
    },
    {
      id: 1,
      key: 'zhongzhou',
      name: '中轴定序',
      title: '中轴定序',
      timeStart: 0.33,
      timeEnd: 0.66,
      content: `中轴线是故宫建筑群的组织骨架，全长约3公里，纵贯南北，将这座世界最大的宫殿建筑群串联为一个有机整体。
这条中轴线的规划蕴含着深刻的政治哲学思想：
• 至高无上：皇帝位居中轴，象征"居中而治"、"执中御宇"
• 左右对称：中轴东西两侧建筑严格对称，体现"正"与"序"的儒家理念
• 起承转合：从永定门至钟鼓楼，中轴依次展开"千步廊→天安门→午门→太和殿→神武门→景山→钟鼓楼"的空间序列
中轴线上最核心的建筑是太和殿，殿前广场形成的"T"字形空间，通过建筑体量的层层递进，塑造出庄严隆重的仪式感。`
    },
    {
      id: 2,
      key: 'fushan',
      name: '负山抱水',
      title: '负山抱水',
      timeStart: 0.66,
      timeEnd: 1,
      content: `负山抱水是故宫选址与布局的风水智慧，体现了中国古代"天人合一"的生态宜居理念。
"负山"——故宫北倚景山（万岁山），形成"背山"之势：
• 景山海拔89米，如一道天然屏障，阻挡冬季北风
• 站在景山之巅俯瞰，整座故宫尽收眼底，格局完满
"抱水"——故宫前方内金水河蜿蜒流过：
• 河水从天而降（引入西山水源），经内金水桥汇入护城河
• 河道走势呈"冠带"形，环绕宫城，寓意财富与吉祥
• 河水的曲流动感打破中轴的刚硬，增添灵动之气
负山抱水的格局使故宫背山面水、负阴抱阳，既满足军事防御需求，又符合风水堪舆学说，是中国古代都城选址的典范。`
    }
  ];

  class XuansiChapter {
    constructor(options) {
      this.root = options.root;
      this.state = {
        currentNode: 0,
        isPlaying: false,
        isDragging: false
      };
      this.elements = {};
    }

    async init() {
      this.cacheElements();
      this.bindEvents();
      this.loadContent();
      this.setNodeActive(0, false);
    }

    loadContent() {
      const { contentItems } = this.elements;
      contentItems.forEach((item, i) => {
        const node = XUANSI_NODES[i];
        if (node) {
          const textEl = item.querySelector('.xuansi-content-item__text');
          if (textEl) {
            textEl.textContent = node.content;
          }
        }
      });
    }

    cacheElements() {
      this.elements = {
        video: this.root.querySelector('#xuansi-video'),
        playBtn: this.root.querySelector('.xuansi-play-btn'),
        scrubberTrack: this.root.querySelector('.xuansi-scrubber-track'),
        scrubberProgress: this.root.querySelector('.xuansi-scrubber-progress'),
        scrubberThumb: this.root.querySelector('.xuansi-scrubber-thumb'),
        scrubberInput: this.root.querySelector('.xuansi-scrubber-input'),
        nodes: [...this.root.querySelectorAll('.xuansi-node')],
        contentItems: [...this.root.querySelectorAll('.xuansi-content-item')]
      };
    }

    bindEvents() {
      const { video, playBtn, scrubberTrack, scrubberInput, nodes } = this.elements;

      // 播放按钮点击
      if (playBtn) {
        playBtn.addEventListener('click', () => this.handlePlay());
      }

      // 视频点击也可以播放
      if (video) {
        video.addEventListener('click', () => {
          if (!this.state.isPlaying) {
            this.handlePlay();
          }
        });

        // 视频播放/暂停事件
        video.addEventListener('play', () => {
          this.state.isPlaying = true;
          playBtn.classList.add('is-hidden');
        });

        video.addEventListener('pause', () => {
          this.state.isPlaying = false;
          playBtn.classList.remove('is-hidden');
        });

        video.addEventListener('ended', () => {
          this.state.isPlaying = false;
          playBtn.classList.remove('is-hidden');
        });

        // 视频时间更新 - 同步滑动条和内容
        video.addEventListener('timeupdate', () => this.handleTimeUpdate());

        // 视频加载元数据后设置滑块范围
        video.addEventListener('loadedmetadata', () => {
          if (scrubberInput) {
            scrubberInput.max = Math.floor(video.duration);
          }
        });
      }

      // 滑动条拖动 - 使用 input 事件
      if (scrubberInput) {
        scrubberInput.addEventListener('input', (e) => {
          this.handleScrubberInput(e.target.value);
        });

        scrubberInput.addEventListener('change', (e) => {
          this.handleScrubberChange(e.target.value);
        });
      }

      // 轨道点击跳转
      if (scrubberTrack) {
        scrubberTrack.addEventListener('click', (e) => {
          if (e.target === scrubberTrack || e.target.classList.contains('xuansi-scrubber-progress')) {
            const rect = scrubberTrack.getBoundingClientRect();
            const progress = (e.clientX - rect.left) / rect.width;
            this.jumpToProgress(progress);
          }
        });
      }

      // 节点按钮点击
      nodes.forEach((node) => {
        node.addEventListener('click', () => {
          const nodeIndex = Number(node.dataset.node);
          this.jumpToNode(nodeIndex);
        });
      });
    }

    handlePlay() {
      const { video } = this.elements;
      if (!video) return;

      if (video.paused) {
        video.play().catch(() => {
          // 自动播放被阻止，静默处理
        });
      } else {
        video.pause();
      }
    }

    handleTimeUpdate() {
      const { video, scrubberProgress, scrubberThumb, scrubberInput } = this.elements;
      if (!video || video.duration === 0) return;

      const progress = video.currentTime / video.duration;

      // 更新滑动条显示（只在不拖动时更新）
      if (!this.state.isDragging) {
        if (scrubberInput) {
          scrubberInput.value = video.currentTime;
        }
      }

      if (scrubberProgress) {
        scrubberProgress.style.width = `${progress * 100}%`;
      }
      if (scrubberThumb) {
        scrubberThumb.style.left = `${progress * 100}%`;
      }

      // 根据当前时间确定节点
      let nodeIndex = 0;
      if (progress >= XUANSI_NODES[1].timeStart) nodeIndex = 1;
      if (progress >= XUANSI_NODES[2].timeStart) nodeIndex = 2;

      if (nodeIndex !== this.state.currentNode) {
        this.setNodeActive(nodeIndex, true);
      }
    }

    handleScrubberInput(value) {
      const { video, scrubberProgress, scrubberThumb } = this.elements;
      if (!video) return;

      // 拖动中：实时更新视频时间和进度条
      this.state.isDragging = true;
      video.currentTime = Number(value);

      const progress = video.currentTime / video.duration;
      if (scrubberProgress) {
        scrubberProgress.style.width = `${progress * 100}%`;
      }
      if (scrubberThumb) {
        scrubberThumb.style.left = `${progress * 100}%`;
      }
    }

    handleScrubberChange(value) {
      const { video } = this.elements;
      if (!video) return;

      // 拖动结束：根据当前进度设置节点
      this.state.isDragging = false;
      const progress = video.currentTime / video.duration;

      let nodeIndex = 0;
      if (progress >= XUANSI_NODES[1].timeStart) nodeIndex = 1;
      if (progress >= XUANSI_NODES[2].timeStart) nodeIndex = 2;
      this.setNodeActive(nodeIndex, false);
    }

    jumpToProgress(progress) {
      const { video, scrubberProgress, scrubberThumb, scrubberInput } = this.elements;
      progress = Math.max(0, Math.min(1, progress));

      if (video && video.duration > 0) {
        video.currentTime = progress * video.duration;
      }

      if (scrubberProgress) {
        scrubberProgress.style.width = `${progress * 100}%`;
      }
      if (scrubberThumb) {
        scrubberThumb.style.left = `${progress * 100}%`;
      }
      if (scrubberInput) {
        scrubberInput.value = progress * scrubberInput.max;
      }

      // 设置对应节点
      let nodeIndex = 0;
      if (progress >= XUANSI_NODES[1].timeStart) nodeIndex = 1;
      if (progress >= XUANSI_NODES[2].timeStart) nodeIndex = 2;
      this.setNodeActive(nodeIndex, false);
    }

    jumpToNode(nodeIndex) {
      const { video } = this.elements;
      const node = XUANSI_NODES[nodeIndex];
      if (!node) return;

      // 跳转到对应时间点
      this.jumpToProgress(node.timeStart);
    }

    setNodeActive(nodeIndex, animate = true) {
      const { nodes, contentItems } = this.elements;

      this.state.currentNode = nodeIndex;

      // 更新节点按钮状态
      nodes.forEach((node, i) => {
        node.classList.toggle('is-active', i === nodeIndex);
      });

      // 更新内容显示
      contentItems.forEach((item, i) => {
        if (animate) {
          if (i === nodeIndex) {
            item.classList.add('is-active');
          } else {
            item.classList.remove('is-active');
          }
        } else {
          // 初始状态不使用动画
          item.classList.toggle('is-active', i === nodeIndex);
        }
      });
    }

    applyMotion(focus) {
      const zones = [
        this.root.querySelector('.xuansi-left'),
        this.root.querySelector('.xuansi-right')
      ];

      zones.forEach((zone, i) => {
        if (!zone) return;
        const x = i === 0 ? -20 : 20;
        const opacity = 0.18 + focus * 0.82;
        const scale = 0.88 + focus * 0.12;

        gsap.to(zone, {
          x: x * (1 - focus),
          scale: scale,
          opacity: opacity,
          duration: 0.4,
          ease: 'power2.out'
        });
      });
    }
  }

  // 暴露到全局
  window.XuansiChapter = XuansiChapter;
})();
