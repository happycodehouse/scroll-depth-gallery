import * as THREE from 'three';

export function createScroll(camera) {
  let scrollTarget = 0;
  let scrollCurrent = 0;
  let previousScroll = 0;
  let velocity = 0;
  const smoothing = 0.08;
  const velocityDamping = 0.1;

  window.addEventListener('wheel', (e) => {
    scrollTarget += e.deltaY * 0.003;
  });

  function update() {
    scrollCurrent = THREE.MathUtils.lerp(
      scrollCurrent,
      scrollTarget,
      smoothing,
    );

    // velocity = 이번 프레임과 지난 프레임의 차이
    velocity = THREE.MathUtils.lerp(
      velocity,
      scrollCurrent - previousScroll,
      velocityDamping,
    );

    // 너무 작은 값은 0으로 처리
    if (Math.abs(velocity) < 0.0001) velocity = 0;

    previousScroll = scrollCurrent;
    camera.position.z = 5 - scrollCurrent;
  }

  function getVelocity() {
    return velocity;
  }

  return { update, getVelocity };
}
