# 皇城·万象 Imperial City · Grand Panorama
故宫古建筑智慧交互可视化平台

赛道：国际生"AI+汉学"数智创作 · AI+信息可视化设计

主题：中国古代建筑成就——中华优秀传统文化系列之六

---

## 运行方式

直接用浏览器打开 `index.html` 即可，无需任何构建工具或服务器。

## 技术栈

纯原生 HTML5 + CSS3 + JavaScript（ES6+），无框架依赖。
地图交互用 Canvas 2D API。动画用 CSS animation + requestAnimationFrame。
字体：Google Fonts CDN（Noto Serif SC + Playfair Display + Noto Sans SC）。
音效库：Howler.js（通过 CDN 引入）。

## 模块说明

- **首页（Landing）**：水墨背景 + 入宫按钮 + 卷轴展开动画
- **建筑档案**：地图热区点击 + 五色分类标签 + 档案/事件双卡片
- **文化底蕴**：五个文化主题（中轴线/阴阳五行/风水/天象/礼制）
- **构件智慧**：重点建筑光圈 + 四类构件入口 + 全景模式
- **小游戏**：堆叠太和殿 / 角楼解谜 / 十万人朝圣 / 九龙拼图

## 目录结构

```
├── index.html
├── css/style.css
├── js/
│   ├── app.js         # 全局状态、页面切换、语言切换
│   ├── data.js        # 建筑档案、文化主题、构件数据
│   ├── map.js         # 地图画布、缩放平移、热区点击
│   ├── archive.js     # 建筑档案模块
│   ├── culture.js      # 文化底蕴模块
│   ├── component.js    # 构件智慧模块
│   ├── panorama.js    # 全景模式
│   ├── games/
│   │   ├── game-modal.js
│   │   ├── stack-hall.js
│   │   ├── tower-puzzle.js
│   │   ├── imperial-passage.js
│   │   └── dragon-mosaic.js
│   └── gesture.js      # 手势识别（可选）
└── images/
    ├── map/            # 故宫俯视总览图
    ├── landing/         # 首页背景
    ├── buildings/       # 建筑实物图
    ├── panorama/         # 全景剖面图
    ├── components/      # 构件细节图
    └── patterns/         # 云纹底纹等装饰
```
