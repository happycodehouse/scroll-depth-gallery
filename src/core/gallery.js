import * as THREE from 'three';
import { items } from '../data/items.js';

export function createGallery(scene) {
  const planeGap = 3;

  items.forEach((item, index) => {
    const geo  = new THREE.PlaneGeometry(2, 2.5);
    const mat = new THREE.MeshBasicMaterial({color: item.color});
    const plane = new THREE.Mesh(geo, mat);

    plane.position.set(item.x, 0, -index * planeGap);
    scene.add(plane);
  });
}