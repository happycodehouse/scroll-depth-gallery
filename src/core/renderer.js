import * as THREE from 'three'

export function createRenderer() {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(
    75, // 시야각 (낮을수록 (30~45) → 망원렌즈, 멀리서 당겨보는 느낌, 높을수록 (90~120) → 광각렌즈, 왜곡 심해짐 75 → 무난한 기본값)
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  camera.position.z = 5

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  })

  function render() {
    renderer.render(scene, camera)
  }

  return { scene, camera, render }
}