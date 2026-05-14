import * as THREE from 'three';

export function createScroll(camera, gallery) {
  const scrollSmoothing = 0.08;
  const scrollToWorldFactor = 0.01;
  const velocityDamping = 0.12;
  const velocityMax = 1.5;
  const velocityStopThreshold = 0.0001;
  const firstPlaneViewOffset = 5;
  const lastPlaneViewOffset = 5;

  let scrollTarget = 0;
  let scrollCurrent = 0;
  let previousScrollCurrent = 0;
  let velocity = 0;
  let minCameraZ = -Infinity;
  let maxCameraZ = Infinity;
  let cameraStartZ = 0;
  let isInitialized = false;

  window.addEventListener('wheel', (e) => {
    e.preventDefault();
    scrollTarget += e.deltaY;
  }, { passive: false });

  function updateCameraBounds() {
    const { nearestZ, deepestZ } = gallery.getDepthRange();
    maxCameraZ = nearestZ + firstPlaneViewOffset;
    minCameraZ = deepestZ + lastPlaneViewOffset;
    if (minCameraZ > maxCameraZ) minCameraZ = maxCameraZ;
  }

  function cameraZFromScroll(amount) {
    return cameraStartZ - amount * scrollToWorldFactor;
  }

  function scrollFromCameraZ(cameraZ) {
    if (scrollToWorldFactor === 0) return 0;
    return (cameraStartZ - cameraZ) / scrollToWorldFactor;
  }

  function init() {
    updateCameraBounds();
    cameraStartZ = maxCameraZ;
    camera.position.z = cameraStartZ;
    scrollTarget = 0;
    scrollCurrent = 0;
    previousScrollCurrent = 0;
    isInitialized = true;
  }

  function update() {
    if (!isInitialized) init();

    updateCameraBounds();

    scrollCurrent = THREE.MathUtils.lerp(scrollCurrent, scrollTarget, scrollSmoothing);

    const minScroll = scrollFromCameraZ(maxCameraZ);
    const maxScroll = scrollFromCameraZ(minCameraZ);
    scrollTarget = THREE.MathUtils.clamp(scrollTarget, minScroll, maxScroll);
    scrollCurrent = THREE.MathUtils.clamp(scrollCurrent, minScroll, maxScroll);

    const rawVelocity = scrollCurrent - previousScrollCurrent;
    velocity = THREE.MathUtils.lerp(velocity, rawVelocity, velocityDamping);
    velocity = THREE.MathUtils.clamp(velocity, -velocityMax, velocityMax);
    if (Math.abs(velocity) < velocityStopThreshold) velocity = 0;
    previousScrollCurrent = scrollCurrent;

    const nextCameraZ = cameraZFromScroll(scrollCurrent);
    camera.position.z = THREE.MathUtils.clamp(nextCameraZ, minCameraZ, maxCameraZ);
  }

  return { update, getVelocity: () => velocity, init };
}