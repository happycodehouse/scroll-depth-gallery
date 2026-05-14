import * as THREE from 'three';
import { items } from '../data/items.js';

export function createGallery(scene) {
  const planeGap = 5;
  const planeFadeSmoothing = 0.14;
  const planeFadeSampleOffset = 1;
  const loader = new THREE.TextureLoader();
  const planes = [];

  const parallaxAmountX = 0.16;
  const parallaxAmountY = 0.08;
  const parallaxSmoothing = 0.08;
  const gestureAmountY = 0.05;
  const gestureSmoothing = 0.05;
  const breathTiltAmount = 0.045;
  const breathScaleAmount = 0.03;
  const breathSmoothing = 0.14;
  const breathGain = 1.1;

  const pointerTarget = new THREE.Vector2(0, 0);
  const pointerCurrent = new THREE.Vector2(0, 0);
  let driftTarget = 0;
  let driftCurrent = 0;
  let breathIntensity = 0;
  let loadedCount = 0;
  let onReadyCallback = null;

  window.addEventListener('pointermove', (e) => {
    pointerTarget.set(
      (e.clientX / window.innerWidth) * 2 - 1,
      -((e.clientY / window.innerHeight) * 2 - 1)
    );
  });

  window.addEventListener('pointerleave', () => {
    pointerTarget.set(0, 0);
  });

  items.forEach((item, index) => {
    loader.load(item.src, (texture) => {
      const aspect = texture.image.width / texture.image.height;
      const geo = new THREE.PlaneGeometry(3, 3);
      const mat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        opacity: index === 0 ? 1 : 0,
      });
      const plane = new THREE.Mesh(geo, mat);

      plane.userData.baseX = item.x;
      plane.userData.baseY = 0;
      plane.userData.aspectRatio = aspect;

      plane.scale.set(aspect, 1, 1);
      plane.position.set(item.x, 0, -index * planeGap);
      scene.add(plane);
      planes[index] = plane;

      loadedCount++;
      if (loadedCount === items.length) onReadyCallback?.();
    });
  });

  function getDepthRange() {
    const validPlanes = planes.filter(Boolean);
    if (!validPlanes.length) return { nearestZ: 0, deepestZ: 0 };
    const zPositions = validPlanes.map(p => p.position.z);
    return {
      nearestZ: Math.max(...zPositions),
      deepestZ: Math.min(...zPositions),
    };
  }

  function getPlaneBlendData(cameraZ) {
    if (!planes.length) return null;
    const firstPlaneZ = planes[0]?.position.z ?? 0;
    const lastPlaneIndex = planes.length - 1;
    const sampledCameraZ = cameraZ - planeGap * planeFadeSampleOffset;
    const normalizedDepth = THREE.MathUtils.clamp(
      (firstPlaneZ - sampledCameraZ) / planeGap,
      0,
      lastPlaneIndex
    );
    const currentPlaneIndex = Math.floor(normalizedDepth);
    const nextPlaneIndex = Math.min(currentPlaneIndex + 1, lastPlaneIndex);
    const blend = normalizedDepth - currentPlaneIndex;
    return { currentPlaneIndex, nextPlaneIndex, blend };
  }

  function updatePlaneVisibility(cameraZ) {
    const blendData = getPlaneBlendData(cameraZ);
    if (!blendData) return;
    const { currentPlaneIndex, nextPlaneIndex, blend } = blendData;

    planes.forEach((plane, index) => {
      if (!plane) return;
      let target = 0;
      if (index === currentPlaneIndex) target = 1 - blend;
      if (index === nextPlaneIndex) target = Math.max(target, blend);
      const current = Number.isFinite(plane.material.opacity) ? plane.material.opacity : 0;
      plane.material.opacity = THREE.MathUtils.lerp(current, target, planeFadeSmoothing);
    });
  }

  function update(scroll, cameraZ) {
    updatePlaneVisibility(cameraZ);

    const velocity = scroll?.getVelocity() || 0;
    const velocityMax = scroll?.velocityMax || 1.5;

    pointerCurrent.lerp(pointerTarget, parallaxSmoothing);

    const velocityNormalized = THREE.MathUtils.clamp(Math.abs(velocity) / velocityMax, 0, 1);
    const targetBreath = THREE.MathUtils.clamp(velocityNormalized * breathGain, 0, 1);
    breathIntensity = THREE.MathUtils.lerp(breathIntensity, targetBreath, breathSmoothing);

    const scrollDrift = THREE.MathUtils.clamp(velocity / velocityMax, -1, 1);
    driftTarget = scrollDrift;
    driftCurrent = THREE.MathUtils.lerp(driftCurrent, driftTarget, gestureSmoothing);

    planes.forEach((plane, index) => {
      if (!plane) return;
      const opacity = Number.isFinite(plane.material.opacity) ? plane.material.opacity : 0;
      const depthInfluence = 1 + index * 0.05;
      const parallaxInfluence = opacity * depthInfluence;

      const offsetX = pointerCurrent.x * parallaxAmountX * parallaxInfluence;
      const offsetY = pointerCurrent.y * parallaxAmountY * parallaxInfluence;
      const gestureY = driftCurrent * gestureAmountY;

      plane.position.x = plane.userData.baseX + offsetX;
      plane.position.y = plane.userData.baseY + offsetY + gestureY;

      const breathInfluence = breathIntensity * opacity;
      plane.rotation.x = -pointerCurrent.y * breathTiltAmount * breathInfluence;
      plane.rotation.y = pointerCurrent.x * breathTiltAmount * breathInfluence;

      const aspect = plane.userData.aspectRatio || 1;
      const scalePulse = 1 + breathScaleAmount * breathInfluence;
      plane.scale.set(aspect * scalePulse, scalePulse, 1);
    });
  }

  function setOnReady(fn) {
    onReadyCallback = fn;
    if (loadedCount === items.length) fn();
  }

  return { update, getDepthRange, setOnReady };
}