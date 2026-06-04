import { createRenderer } from './core/renderer.js';
import { createBackground } from './core/background.js';
import { createGallery } from './core/gallery.js';
import { createScroll } from './core/scroll.js';
import { createLabel } from './core/label.js';

const { scene, camera, render, renderer } = createRenderer();
const background = createBackground(renderer);
const gallery = createGallery(scene);
const scroll = createScroll(camera, gallery);
const label = createLabel(gallery.getPlaneBlendData);

gallery.setOnReady(() => {
  scroll.init();
  setTimeout(() => {
    document.body.classList.remove('loading');
  }, 500);

  function tick() {
    requestAnimationFrame(tick);

    scroll.update();

    const cameraZ = camera.position.z;

    background.update(cameraZ, scroll);
    gallery.update(scroll, cameraZ);
    label.update(cameraZ);

    renderer.clear();
    background.render();
    render();
  }

  tick();
});
