import { createRenderer } from './core/renderer.js';
import { createGallery } from './core/gallery.js';
import { createScroll } from './core/scroll.js';
import { createBackground } from './core/background/background.js';

const { scene, camera, render: renderScene, renderer } = createRenderer();
const gallery = createGallery(scene);
const scroll = createScroll(camera, gallery);
const background = createBackground(renderer);

function loop() {
  renderer.clear();
  scroll.update();
  background.update(camera.position.z, scroll);
  background.render();
  gallery.update(scroll, camera.position.z);
  renderScene();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);