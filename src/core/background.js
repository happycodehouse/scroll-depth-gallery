import * as THREE from 'three';
import { items } from '../data/items.js';

export function createBackground(scene) {
  const bg = new THREE.Color();

  function update(cameraZ) {
    const planeGap = 3;
    const index = Math.abs(cameraZ - 5) / planeGap;
    const current = Math.min(Math.floor(index), items.length - 1);
    const next = Math.min(current + 1, items.length - 1);
    const blend = index - current;

    const currentColor = new THREE.Color(items[current].mood.bg);
    const nextColor = new THREE.Color(items[next].mood.bg);

    bg.copy(currentColor).lerp(nextColor, blend);
    scene.background = bg;
  }

  return { update };
}
