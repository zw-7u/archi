/* =====================================================
   js/modules/model-viewer.js
   巧物精工 3D 模型查看器 - Three.js 核心模块
   ===================================================== */
import * as THREE from 'three'
import { GLTFLoader }    from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

/* ---- 模型配置表 ---- */
const MODEL_CONFIG = {
  jiaolou: {
    title:   '角楼三维模型',
    src:     './models/jiaolou.glb',
    camera:  { x: 0,  y: 2,  z: 8  },
    target:  { x: 0,  y: 1,  z: 0  },
    scale:   1,
  },
  wumen: {
    title:   '午门三维模型',
    src:     './models/wumen.glb',
    camera:  { x: 0,  y: 2,  z: 10 },
    target:  { x: 0,  y: 1.5,z: 0  },
    scale:   1,
  },
  taihedian: {
    title:   '太和殿三维模型',
    src:     './models/taihedian.glb',
    camera:  { x: 0,  y: 3,  z: 12 },
    target:  { x: 0,  y: 2,  z: 0  },
    scale:   1,
  },
  jiulongbi: {
    title:   '九龙壁三维模型',
    src:     './models/jiulongbi.glb',
    camera:  { x: 0,  y: 2,  z: 9  },
    target:  { x: 0,  y: 1.2,z: 0  },
    scale:   1,
  },
}

/* ---- Three.js 实例引用 ---- */
let scene    = null
let camera   = null
let renderer = null
let controls = null
let animId   = null
let loader   = null
let currentModel = null   // 当前加载的 glTF.scene 对象

/* ---- DOM 引用 ---- */
let overlayEl  = null
let titleEl    = null
let canvasWrap = null
let loadingEl  = null
let errorEl    = null
let closeBtn   = null
let backdropEl = null

/* ---- 工具函数：遍历 Mesh 清理 geometry / material ---- */
function disposeObject(obj) {
  if (obj.isMesh) {
    if (obj.geometry) {
      obj.geometry.dispose()
    }
    if (obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach(m => m.dispose())
      } else {
        obj.material.dispose()
      }
    }
  }
}

/* ---- 工具函数：递归清理场景中所有对象 ---- */
function disposeScene(sc) {
  if (!sc) return
  sc.traverse(disposeObject)
  // 从场景移除当前模型（防止残留）
  if (currentModel && sc.hasObject3D(currentModel)) {
    sc.remove(currentModel)
  }
}

/* ---- 显示 / 隐藏状态 ---- */
function showOverlay(cfg) {
  titleEl.textContent = cfg.title
  loadingEl.hidden = false
  errorEl.hidden   = true
  errorEl.textContent = '模型加载失败，请检查文件路径'
  canvasWrap.innerHTML = ''
  overlayEl.hidden = false
  document.body.style.overflow = 'hidden'
}

function hideOverlay() {
  overlayEl.hidden = true
  document.body.style.overflow = ''
}

/* ---- 窗口尺寸变化处理 ---- */
function handleResize() {
  if (!camera || !renderer || !canvasWrap) return
  const w = canvasWrap.clientWidth
  const h = canvasWrap.clientHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h, false)
}

/* ---- 渲染循环 ---- */
function animate() {
  animId = requestAnimationFrame(animate)
  if (controls) controls.update()
  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
}

/* ---- 初始化 Three.js 场景 ---- */
function initScene(cfg) {
  // 容器尺寸
  const w = canvasWrap.clientWidth  || 800
  const h = canvasWrap.clientHeight || 520

  // 1. Scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1a120a)

  // 2. Camera
  camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000)
  camera.position.set(cfg.camera.x, cfg.camera.y, cfg.camera.z)

  // 3. Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(w, h, false)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  canvasWrap.appendChild(renderer.domElement)

  // 4. Controls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(cfg.target.x, cfg.target.y, cfg.target.z)
  controls.enableDamping  = true
  controls.dampingFactor = 0.08
  controls.enablePan     = true
  controls.enableZoom    = true
  controls.enableRotate  = true
  controls.minDistance   = 0.5
  controls.maxDistance   = 50
  controls.update()

  // 5. 灯光
  const ambient = new THREE.AmbientLight(0xfff4e0, 0.6)
  scene.add(ambient)

  const dirLight = new THREE.DirectionalLight(0xffe8b0, 1.2)
  dirLight.position.set(8, 12, 6)
  dirLight.castShadow = true
  dirLight.shadow.mapSize.set(1024, 1024)
  dirLight.shadow.camera.near = 0.5
  dirLight.shadow.camera.far  = 50
  dirLight.shadow.camera.left   = -10
  dirLight.shadow.camera.right  =  10
  dirLight.shadow.camera.top    =  10
  dirLight.shadow.camera.bottom = -10
  scene.add(dirLight)

  // 补光
  const fillLight = new THREE.DirectionalLight(0xffe4c4, 0.35)
  fillLight.position.set(-6, 4, -4)
  scene.add(fillLight)

  // 6. Resize 监听
  window.addEventListener('resize', handleResize)

  // 7. 启动渲染
  animate()
}

/* ---- 加载 glb 模型 ---- */
function loadModel(cfg) {
  if (!loader) loader = new GLTFLoader()

  loader.load(
    cfg.src,
    (gltf) => {
      // 隐藏加载中提示
      loadingEl.hidden = true

      // 缩放处理
      const root = gltf.scene
      const s = cfg.scale || 1
      root.scale.set(s, s, s)

      // 自动居中（计算边界盒）
      const box = new THREE.Box3().setFromObject(root)
      const center = new THREE.Vector3()
      box.getCenter(center)
      root.position.sub(center)

      // 附加阴影
      root.traverse((child) => {
        if (child.isMesh) {
          child.castShadow    = true
          child.receiveShadow = true
        }
      })

      currentModel = root
      scene.add(currentModel)
    },
    (xhr) => {
      // onProgress（可选：实现加载进度条）
    },
    (err) => {
      loadingEl.hidden = true
      errorEl.hidden   = false
      console.error('[model-viewer] 模型加载失败:', cfg.src, err)
    }
  )
}

/* ---- 关闭：释放所有资源 ---- */
function disposeAll() {
  // 1. 停止渲染
  if (animId !== null) {
    cancelAnimationFrame(animId)
    animId = null
  }

  // 2. 销毁 controls
  if (controls) {
    controls.dispose()
    controls = null
  }

  // 3. 清理场景
  if (scene) {
    disposeScene(scene)
    // 移除渲染器 DOM 中的 canvas
    if (renderer) {
      renderer.domElement.parentNode?.removeChild(renderer.domElement)
    }
  }

  // 4. 销毁渲染器
  if (renderer) {
    renderer.dispose()
    renderer = null
  }

  // 5. 重置引用
  scene         = null
  camera        = null
  currentModel  = null

  // 6. 清空 canvas 容器（兜底）
  if (canvasWrap) canvasWrap.innerHTML = ''

  // 7. 移除 resize 监听
  window.removeEventListener('resize', handleResize)
}

/* ========================
   公开 API
   ======================== */

/* 打开指定模型的查看器 */
window.openModelViewer = function(key) {
  const cfg = MODEL_CONFIG[key]
  if (!cfg) {
    console.error('[model-viewer] 未知的模型 key:', key)
    return
  }

  // 初始化 DOM 引用
  overlayEl  = document.getElementById('model-viewer-overlay')
  titleEl    = document.getElementById('m3d-title')
  canvasWrap = document.getElementById('m3d-canvas-wrap')
  loadingEl  = document.getElementById('m3d-loading')
  errorEl    = document.getElementById('m3d-error')
  closeBtn   = document.getElementById('m3d-close')
  backdropEl = document.getElementById('m3d-backdrop')

  // 显示弹层
  showOverlay(cfg)

  // 初始化 Three.js 场景
  initScene(cfg)

  // 加载模型
  loadModel(cfg)
}

/* 关闭查看器，释放所有资源 */
window.closeModelViewer = function() {
  disposeAll()
  hideOverlay()
}

/* ---- 绑定关闭事件 ---- */
document.addEventListener('DOMContentLoaded', () => {
  // 关闭按钮
  document.addEventListener('click', (e) => {
    const overlay = document.getElementById('model-viewer-overlay')
    if (!overlay || overlay.hidden) return
    if (
      e.target.id === 'm3d-close' ||
      e.target.id === 'm3d-backdrop'
    ) {
      window.closeModelViewer()
    }
  })

  // ESC 键关闭
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const overlay = document.getElementById('model-viewer-overlay')
      if (overlay && !overlay.hidden) {
        window.closeModelViewer()
      }
    }
  })
})
