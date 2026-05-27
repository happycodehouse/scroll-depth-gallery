import { createRenderer } from './core/renderer.js';
import { createGallery } from './core/gallery.js';
import { createScroll } from './core/scroll.js';
import { createBackground } from './core/background/background.js';
import { createLabel } from './core/label.js';

const { scene, camera, render: renderScene, renderer } = createRenderer();
const gallery = createGallery(scene);
const scroll = createScroll(camera, gallery);
const background = createBackground(renderer);
const label = createLabel(gallery.getPlaneBlendData);

gallery.setOnReady(() => {
  scroll.init();
  setTimeout(() => {
    document.body.classList.remove('loading');
  }, 500);
});

function loop() {
  renderer.clear();
  scroll.update();
  background.update(camera.position.z, scroll);
  background.render();
  gallery.update(scroll, camera.position.z);
  label.update(camera.position.z);
  renderScene();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);