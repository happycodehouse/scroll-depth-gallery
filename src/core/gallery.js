import * as THREE from 'three';
import { items } from '../data/items.js';

export function createGallery(scene) {
  const planeGap = 3;
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
      const geo = new THREE.PlaneGeometry(2 * aspect, 2);
      const mat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: index === 0 ? 1 : 0,
        depthWrite: false,
      });
      const plane = new THREE.Mesh(geo, mat);

      plane.userData.baseX = item.x;
      plane.userData.baseY = 0;
      plane.userData.index = index;
      plane.userData.aspect = aspect;

      plane.position.set(item.x, 0, -index * planeGap);
      scene.add(plane);
      planes.push(plane);
    });
  });

  function updateVisibility(cameraZ) {
    const planeGap3 = planeGap;
    const firstZ = 0;
    const lastIndex = items.length - 1;
    const normalizedDepth = THREE.MathUtils.clamp(
      (firstZ - (cameraZ - planeGap3)) / planeGap3,
      0,
      lastIndex
    );
    const currentIndex = Math.floor(normalizedDepth);
    const nextIndex = Math.min(currentIndex + 1, lastIndex);
    const blend = normalizedDepth - currentIndex;

    planes.forEach((plane, i) => {
      let target = 0;
      if (i === currentIndex) target = 1 - blend;
      if (i === nextIndex) target = Math.max(target, blend);
      plane.material.opacity = THREE.MathUtils.lerp(plane.material.opacity, target, 0.14);
    });
  }

  function update(scroll) {
    const velocity = scroll?.getVelocity() || 0;
    const velocityMax = 0.02;

    // 포인터 스무딩
    pointerCurrent.lerp(pointerTarget, parallaxSmoothing);

    const velocityNormalized = THREE.MathUtils.clamp(Math.abs(velocity) / velocityMax, 0, 1);
    const targetBreath = THREE.MathUtils.clamp(velocityNormalized * breathGain, 0, 1);
    breathIntensity = THREE.MathUtils.lerp(breathIntensity, targetBreath, breathSmoothing);

    const scrollDrift = THREE.MathUtils.clamp(velocity / velocityMax, -1, 1);
    driftTarget = scrollDrift;
    driftCurrent = THREE.MathUtils.lerp(driftCurrent, driftTarget, gestureSmoothing);

    planes.forEach((plane, index) => {
      const opacity = plane.material.opacity;
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

      const aspect = plane.userData.aspect || 1;
      const scalePulse = 1 + breathScaleAmount * breathInfluence;
      plane.scale.set(aspect * scalePulse, scalePulse, 1);
    });
  }

  function updateCamera(cameraZ) {
    updateVisibility(cameraZ);
  }

  return { update, updateCamera };
}
