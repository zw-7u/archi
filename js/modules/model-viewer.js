/**
 * 巧物精工 — 3D 模型弹层（Three.js + GLTFLoader + OrbitControls）
 * window.openModelViewer(gameKey) 由 module3.js 调用
 */
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const THREE_BASE = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r161/examples/models/gltf'

/** 演示用 CDN 模型（r161 示例目录为根级 *.glb；仓库内可放 assets/models/<key>.glb 覆盖） */
const MODEL_URLS = {
  taihedian: `${THREE_BASE}/Horse.glb`,
  jiaolou: `${THREE_BASE}/Flamingo.glb`,
  wumen: `${THREE_BASE}/Parrot.glb`,
  jiulongbi: `${THREE_BASE}/Stork.glb`,
}

const TITLES = {
  taihedian: '太和殿',
  jiaolou: '角楼',
  wumen: '午门',
  jiulongbi: '九龙壁',
}

let renderer = null
let scene = null
let camera = null
let controls = null
let animationId = null
let currentRoot = null
let resizeObserver = null

function $(id) {
  return document.getElementById(id)
}

function disposeScene() {
  if (animationId != null) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
  if (controls) {
    controls.dispose()
    controls = null
  }
  if (currentRoot) {
    currentRoot.traverse((obj) => {
      if (obj.isMesh) {
        obj.geometry?.dispose()
        const mat = obj.material
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
        else mat?.dispose()
      }
    })
    scene?.remove(currentRoot)
    currentRoot = null
  }
  if (renderer) {
    const wrap = $('m3d-canvas-wrap')
    if (wrap && renderer.domElement.parentNode === wrap) {
      wrap.removeChild(renderer.domElement)
    }
    renderer.dispose()
    renderer = null
  }
  scene = null
  camera = null
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
}

function fitCameraToObject(object) {
  const box = new THREE.Box3().setFromObject(object)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  object.position.sub(center)

  const maxDim = Math.max(size.x, size.y, size.z, 0.001)
  const dist = maxDim * 1.8
  camera.near = Math.max(0.01, dist / 100)
  camera.far = dist * 100
  camera.updateProjectionMatrix()
  camera.position.set(dist * 0.55, dist * 0.35, dist * 0.65)
  controls.target.set(0, 0, 0)
  camera.lookAt(0, 0, 0)
  controls.update()
}

function animate() {
  animationId = requestAnimationFrame(animate)
  controls?.update()
  renderer?.render(scene, camera)
}

function setLoading(show) {
  const el = $('m3d-loading')
  if (el) el.hidden = !show
}

function setError(show, msg) {
  const el = $('m3d-error')
  if (!el) return
  if (msg) el.textContent = msg
  el.hidden = !show
  if (show) {
    el.style.display = 'flex'
  } else {
    el.style.display = 'none'
  }
}

function closeViewer() {
  const overlay = $('model-viewer-overlay')
  if (!overlay) return
  overlay.classList.remove('is-open')
  overlay.setAttribute('hidden', '')
  disposeScene()
}

function getCandidateModelUrls(key) {
  const local = `assets/models/${key}.glb`
  const fallback = MODEL_URLS[key] || MODEL_URLS.taihedian
  return fallback && fallback !== local ? [local, fallback] : [local]
}

function loadModelSequence(loader, urls, onLoad, onError) {
  const [current, ...rest] = urls
  if (!current) {
    onError?.(new Error('No model url available'))
    return
  }

  loader.load(
    current,
    onLoad,
    undefined,
    (err) => {
      if (rest.length) {
        loadModelSequence(loader, rest, onLoad, onError)
        return
      }
      onError?.(err)
    }
  )
}

function openModelViewer(gameKey) {
  const overlay = $('model-viewer-overlay')
  const wrap = $('m3d-canvas-wrap')
  const titleEl = $('m3d-title')
  if (!overlay || !wrap) return

  titleEl.textContent = TITLES[gameKey] || gameKey || '三维模型'
  overlay.removeAttribute('hidden')
  overlay.classList.add('is-open')

  setLoading(true)
  setError(false, '')

  disposeScene()

  const width = wrap.clientWidth || 800
  const height = wrap.clientHeight || 480

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 5000)
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(width, height)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1
  wrap.appendChild(renderer.domElement)

  scene.add(new THREE.AmbientLight(0xffffff, 0.65))
  const dir = new THREE.DirectionalLight(0xfff4e0, 1.1)
  dir.position.set(4, 8, 6)
  scene.add(dir)
  const fill = new THREE.DirectionalLight(0xa8c8ff, 0.35)
  fill.position.set(-5, 2, -4)
  scene.add(fill)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.06
  controls.minDistance = 0.1
  controls.maxDistance = 500

  resizeObserver = new ResizeObserver(() => {
    if (!renderer || !camera || !wrap) return
    const w = wrap.clientWidth
    const h = wrap.clientHeight
    if (w < 2 || h < 2) return
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  })
  resizeObserver.observe(wrap)

  const loader = new GLTFLoader()
  ;(async () => {
    const url = await tryLoadLocalFirst(gameKey)
    loader.load(
      url,
      (gltf) => {
        currentRoot = gltf.scene
        scene.add(currentRoot)
        fitCameraToObject(currentRoot)
        setLoading(false)
        animate()
      },
      undefined,
      (err) => {
        console.error('[model-viewer]', err)
        setLoading(false)
        setError(true, '模型加载失败，请检查网络或 assets/models 路径')
      }
    )
  })()
}

function openModelViewer(gameKey) {
  const overlay = $('model-viewer-overlay')
  const wrap = $('m3d-canvas-wrap')
  const titleEl = $('m3d-title')
  if (!overlay || !wrap) return

  titleEl.textContent = TITLES[gameKey] || gameKey || '涓夌淮妯″瀷'
  overlay.removeAttribute('hidden')
  overlay.classList.add('is-open')

  setLoading(true)
  setError(false, '')

  disposeScene()

  const width = wrap.clientWidth || 800
  const height = wrap.clientHeight || 480

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 5000)
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(width, height)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1
  wrap.appendChild(renderer.domElement)

  scene.add(new THREE.AmbientLight(0xffffff, 0.65))
  const dir = new THREE.DirectionalLight(0xfff4e0, 1.1)
  dir.position.set(4, 8, 6)
  scene.add(dir)
  const fill = new THREE.DirectionalLight(0xa8c8ff, 0.35)
  fill.position.set(-5, 2, -4)
  scene.add(fill)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.06
  controls.minDistance = 0.1
  controls.maxDistance = 500

  resizeObserver = new ResizeObserver(() => {
    if (!renderer || !camera || !wrap) return
    const w = wrap.clientWidth
    const h = wrap.clientHeight
    if (w < 2 || h < 2) return
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  })
  resizeObserver.observe(wrap)

  const loader = new GLTFLoader()
  loadModelSequence(
    loader,
    getCandidateModelUrls(gameKey),
    (gltf) => {
      currentRoot = gltf.scene
      scene.add(currentRoot)
      fitCameraToObject(currentRoot)
      setLoading(false)
      animate()
    },
    (err) => {
      console.error('[model-viewer]', err)
      setLoading(false)
      setError(true, '妯″瀷鍔犺浇澶辫触锛岃妫€鏌ョ綉缁滄垨 assets/models 璺緞')
    }
  )
}

function initModelViewerUi() {
  const closeBtn = $('m3d-close')
  const backdrop = $('m3d-backdrop')
  closeBtn?.addEventListener('click', closeViewer)
  backdrop?.addEventListener('click', closeViewer)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const overlay = $('model-viewer-overlay')
      if (overlay?.classList.contains('is-open')) closeViewer()
    }
  })
}

initModelViewerUi()
window.openModelViewer = openModelViewer
window.closeModelViewer = closeViewer
export { openModelViewer, closeViewer, initModelViewerUi }
