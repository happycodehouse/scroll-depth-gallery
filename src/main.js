import * as THREE from 'three';
import { createRenderer } from './core/renderer.js';
import { createGallery } from './core/gallery.js';
import { createScroll } from './core/scroll.js';
import { createBackground } from './core/background.js';

const { scene, camera, render } = createRenderer();
const gallery = createGallery(scene);
const scroll = createScroll(camera);
const background = createBackground(scene);

function loop() {
  scroll.update();
  background.update(camera.position.z);
  gallery.updateCamera(camera.position.z);
  gallery.update(scroll);
  render();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
