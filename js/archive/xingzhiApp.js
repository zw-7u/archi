/* ============================================
   第四章 宫阙形制 - 应用逻辑
   ============================================ */

(() => {
  'use strict';

  // 视频配置
  const VIDEO_BASE = '../../assets/videos/panorama/角楼/';
  const VIDEOS = [
    '角楼1.mp4',
    '角楼2.mp4',
    '角楼3.mp4',
    '角楼4.mp4',
    '角楼5.mp4'
  ];

  // 6个节点配置
  const NODES = [
    { id: 0, label: '起始', videoIndex: 0, progressStart: 0, progressEnd: 0.1667 },
    { id: 1, label: '构件', videoIndex: 0, progressStart: 0.1667, progressEnd: 0.3333 },
    { id: 2, label: '组装', videoIndex: 1, progressStart: 0.3333, progressEnd: 0.5 },
    { id: 3, label: '结构', videoIndex: 2, progressStart: 0.5, progressEnd: 0.6667 },
    { id: 4, label: '完善', videoIndex: 3, progressStart: 0.6667, progressEnd: 0.8333 },
    { id: 5, label: '完成', videoIndex: 4, progressStart: 0.8333, progressEnd: 1.0 }
  ];

  class XingzhiChapter {
    constructor(options) {
      this.root = options.root;
      this.state = {
        currentNode: 0,
        currentVideoIndex: 0,
        isDragging: false,
        videosReady: {}
      };
      this.elements = {};
      this.videoElements = {};
    }

    async init() {
      this.cacheElements();
      this.preloadVideos();
      this.bindEvents();
      this.setNodeActive(0);
    }

    cacheElements() {
      this.elements = {
        videoContainer: this.root.querySelector('.xingzhi-video-wrap'),
        scrubberTrack: this.root.querySelector('.xingzhi-scrubber-track'),
        scrubberProgress: this.root.querySelector('.xingzhi-scrubber-progress'),
        scrubberThumb: this.root.querySelector('.xingzhi-scrubber-thumb'),
        scrubberInput: this.root.querySelector('.xingzhi-scrubber-input'),
        nodes: [...this.root.querySelectorAll('.xingzhi-node')],
        infoValue: this.root.querySelector('.xingzhi-info__value')
      };
    }

    preloadVideos() {
      // 创建5个video元素
      const container = this.elements.videoContainer;
      if (!container) return;

      VIDEOS.forEach((videoFile, index) => {
        const video = document.createElement('video');
        video.className = 'xingzhi-video';
        video.setAttribute('preload', 'auto');
        video.setAttribute('playsinline', '');
        video.src = VIDEO_BASE + videoFile;
        video.muted = true;

        if (index === 0) {
          video.classList.add('is-active');
        }

        container.appendChild(video);
        this.videoElements[index] = video;

        // 视频加载完成
        video.addEventListener('loadeddata', () => {
          this.state.videosReady[index] = true;
        });
      });
    }

    bindEvents() {
      const { scrubberTrack, scrubberInput, nodes } = this.elements;

      // 滑动条拖动
      if (scrubberInput) {
        scrubberInput.addEventListener('input', (e) => {
          this.handleScrubberInput(e.target.value);
        });

        scrubberInput.addEventListener('change', (e) => {
          this.handleScrubberChange(e.target.value);
        });
      }

      // 轨道点击
      if (scrubberTrack) {
        scrubberTrack.addEventListener('click', (e) => {
          if (e.target === scrubberTrack || e.target.classList.contains('xingzhi-scrubber-progress')) {
            const rect = scrubberTrack.getBoundingClientRect();
            const progress = (e.clientX - rect.left) / rect.width;
            this.jumpToProgress(progress);
          }
        });
      }

      // 节点按钮点击
      nodes.forEach((node) => {
        node.addEventListener('click', () => {
          const nodeId = Number(node.dataset.nodeId);
          this.jumpToNode(nodeId);
        });
      });
    }

    handleScrubberInput(value) {
      const { scrubberInput } = this.elements;
      if (!scrubberInput) return;

      this.state.isDragging = true;

      const progress = Number(value) / 1000;
      const node = this.getNodeForProgress(progress);

      // 更新视觉
      this.updateScrubberVisual(progress);
      this.setNodeActive(node.id, false);

      // 切换视频并设置时间
      this.switchToNode(node, progress);
    }

    handleScrubberChange(value) {
      this.state.isDragging = false;

      const progress = Number(value) / 1000;
      const node = this.getNodeForProgress(progress);
      this.setNodeActive(node.id, false);
    }

    jumpToProgress(progress) {
      progress = Math.max(0, Math.min(1, progress));
      const node = this.getNodeForProgress(progress);

      // 更新滑动条
      this.updateScrubberVisual(progress);
      this.updateScrubberInput(progress);
      this.setNodeActive(node.id, false);

      // 切换视频
      this.switchToNode(node, progress);
    }

    jumpToNode(nodeId) {
      const node = NODES[nodeId];
      if (!node) return;

      // 计算节点起始进度
      const progress = node.progressStart;

      // 更新视觉
      this.updateScrubberVisual(progress);
      this.updateScrubberInput(progress);
      this.setNodeActive(node.id, false);

      // 切换视频
      this.switchToNode(node, progress);
    }

    getNodeForProgress(progress) {
      for (let i = NODES.length - 1; i >= 0; i--) {
        if (progress >= NODES[i].progressStart) {
          return NODES[i];
        }
      }
      return NODES[0];
    }

    updateScrubberVisual(progress) {
      const { scrubberProgress, scrubberThumb } = this.elements;
      const percent = progress * 100;

      if (scrubberProgress) {
        scrubberProgress.style.width = `${percent}%`;
      }
      if (scrubberThumb) {
        scrubberThumb.style.left = `${percent}%`;
      }
    }

    updateScrubberInput(progress) {
      const { scrubberInput } = this.elements;
      if (scrubberInput) {
        scrubberInput.value = progress * 1000;
      }
    }

    switchToNode(node, progress) {
      const videoIndex = node.videoIndex;
      const currentVideo = this.videoElements[this.state.currentVideoIndex];
      const targetVideo = this.videoElements[videoIndex];

      // 如果视频不同，切换视频
      if (videoIndex !== this.state.currentVideoIndex && targetVideo) {
        // 隐藏当前视频
        if (currentVideo) {
          currentVideo.classList.remove('is-active');
          currentVideo.pause();
        }

        // 显示目标视频
        targetVideo.classList.add('is-active');
        targetVideo.muted = false;
        this.state.currentVideoIndex = videoIndex;
      }

      // 设置视频时间
      if (targetVideo && targetVideo.duration > 0) {
        // 计算视频内的时间位置
        const nodeProgress = (progress - node.progressStart) / (node.progressEnd - node.progressStart);
        const videoTime = nodeProgress * targetVideo.duration;
        targetVideo.currentTime = videoTime;

        // 更新信息显示
        this.updateInfo(node);
      }
    }

    setNodeActive(nodeId, animate = true) {
      const { nodes } = this.elements;
      this.state.currentNode = nodeId;

      nodes.forEach((node) => {
        const id = Number(node.dataset.nodeId);
        node.classList.toggle('is-active', id === nodeId);
      });
    }

    updateInfo(node) {
      const { infoValue } = this.elements;
      if (infoValue) {
        infoValue.textContent = `角楼 · ${node.label}`;
      }
    }

    applyMotion(focus) {
      const zones = [
        this.root.querySelector('.xingzhi-left'),
        this.root.querySelector('.xingzhi-right')
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
  window.XingzhiChapter = XingzhiChapter;
})();
