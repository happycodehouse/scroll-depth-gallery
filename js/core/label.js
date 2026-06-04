import { items, BRAND, PRICE, VOLUME } from '../../data/items.js';

export function createLabel(getPlaneBlendData) {
  let overlayElement = null;
  let indexElement = null;
  let brandElement = null;
  let nameElement = null;
  let volumeElement = null;
  let priceElement = null;
  let descElement = null;
  let activePlaneIndex = -1;

  function init() {
    const el = document.createElement('section');
    el.className = 'tea-label';
    el.innerHTML = `
      <div class="tea-label__left">
        <p class="tea-label__index"></p>
        <p class="tea-label__brand"></p>
        <p class="tea-label__name"></p>
      </div>
      <div class="tea-label__right">
        <p class="tea-label__volume"></p>
        <p class="tea-label__desc"></p>
        <p class="tea-label__price"></p>
      </div>
    `;

    overlayElement = el;
    indexElement = el.querySelector('.tea-label__index');
    brandElement = el.querySelector('.tea-label__brand');
    nameElement = el.querySelector('.tea-label__name');
    volumeElement = el.querySelector('.tea-label__volume');
    descElement = el.querySelector('.tea-label__desc');
    priceElement = el.querySelector('.tea-label__price');
    overlayElement.style.opacity = '0';

    document.body.appendChild(overlayElement);
  }

  function getTargetIndex(cameraZ) {
    const blendData = getPlaneBlendData(cameraZ);
    if (!blendData) return -1;
    return blendData.blend >= 0.5 ? blendData.nextPlaneIndex : blendData.currentPlaneIndex;
  }

  function applyContent(index) {
    if (activePlaneIndex === index) return;
    const item = items[index];
    if (!item) return;

    const label = item.label || {};

    indexElement.textContent = String(index + 1).padStart(2, '0');
    brandElement.textContent = BRAND;
    nameElement.textContent = label.name || '';
    volumeElement.textContent = VOLUME;
    descElement.textContent = label.desc || '';
    priceElement.textContent = PRICE;
    overlayElement.style.color = label.color || '';

    activePlaneIndex = index;
  }

  function update(cameraZ) {
    if (!overlayElement) return;
    const index = getTargetIndex(cameraZ);
    if (index < 0) {
      overlayElement.style.opacity = '0';
      return;
    }
    applyContent(index);
    overlayElement.style.opacity = '1';
  }

  init();
  return { update };
}
