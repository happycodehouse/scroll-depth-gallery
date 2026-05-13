import * as THREE from 'three';
import { createRenderer } from './core/renderer.js';
import { createGallery } from './core/gallery.js';
import { createScroll } from './core/scroll.js';

const { scene, camera, render } = createRenderer();
createGallery(scene);
const scroll = createScroll(camera);

function loop() {
  scroll.update();
  render();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);