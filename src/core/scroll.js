import * as THREE from 'three'

export function createScroll(camera) {
  let scrollTarget = 0
  let scrollCurrent = 0
  const smoothing = 0.08

  window.addEventListener('wheel', (e) => {
    scrollTarget += e.deltaY * 0.003
  })

  function update() {
    scrollCurrent = THREE.MathUtils.lerp(
      scrollCurrent,
      scrollTarget,
      smoothing
    )
    camera.position.z = 5 - scrollCurrent
  }

  return { update };
}