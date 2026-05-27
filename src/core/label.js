import { items } from '../data/items.js';

export function createLabel(getPlaneBlendData) {
  let overlayElement = null;
  let leftIndexElement = null;
  let wordElement = null;
  let chipElement = null;
  let cmykValueElement = null;
  let rgbValueElement = null;
  let hexValueElement = null;
  let pmsValueElement = null;
  let activePlaneIndex = -1;

  function init() {
    const el = document.createElement('section');
    el.className = 'plane-label-overlay';
    el.innerHTML = `
      <div class="plane-label-overlay__left">
        <p class="plane-label-overlay__index"></p>
        <p class="plane-label-card__word"></p>
        <span class="plane-label-overlay__chip"></span>
      </div>
      <article class="plane-label-card plane-label-overlay__right">
        <dl class="plane-label-card__specs">
          <div class="plane-label-card__row">
            <dt>CMYK</dt>
            <dd class="plane-label-card__value plane-label-card__value--cmyk"></dd>
          </div>
          <div class="plane-label-card__row">
            <dt>RGB</dt>
            <dd class="plane-label-card__value plane-label-card__value--rgb"></dd>
          </div>
          <div class="plane-label-card__row">
            <dt>HEX</dt>
            <dd class="plane-label-card__value plane-label-card__value--hex"></dd>
          </div>
          <div class="plane-label-card__row">
            <dt>PMS</dt>
            <dd class="plane-label-card__value plane-label-card__value--pms"></dd>
          </div>
        </dl>
      </article>
    `;

    overlayElement = el;
    leftIndexElement = el.querySelector('.plane-label-overlay__index');
    wordElement = el.querySelector('.plane-label-card__word');
    chipElement = el.querySelector('.plane-label-overlay__chip');
    cmykValueElement = el.querySelector('.plane-label-card__value--cmyk');
    rgbValueElement = el.querySelector('.plane-label-card__value--rgb');
    hexValueElement = el.querySelector('.plane-label-card__value--hex');
    pmsValueElement = el.querySelector('.plane-label-card__value--pms');
    overlayElement.style.opacity = '0';

    document.body.appendChild(overlayElement);
  }

  function normalizeHex(raw) {
    if (typeof raw !== 'string') return '#ffffff';
    let hex = raw.trim();
    if (!hex.startsWith('#')) hex = `#${hex}`;
    if (/^#[0-9a-fA-F]{3}$/.test(hex)) {
      hex = `#${hex.slice(1).split('').map((c) => c + c).join('')}`;
    }
    return /^#[0-9a-fA-F]{6}$/.test(hex) ? hex.toLowerCase() : '#ffffff';
  }

  function hexToRgb(hex) {
    const h = normalizeHex(hex).slice(1);
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }

  function rgbToCmyk({ r, g, b }) {
    const R = r / 255, G = g / 255, B = b / 255;
    const k = 1 - Math.max(R, G, B);
    if (k >= 0.999) return { c: 0, m: 0, y: 0, k: 100 };
    return {
      c: Math.round(((1 - R - k) / (1 - k)) * 100),
      m: Math.round(((1 - G - k) / (1 - k)) * 100),
      y: Math.round(((1 - B - k) / (1 - k)) * 100),
      k: Math.round(k * 100),
    };
  }

  function buildColorSpecs(accentColor, pms) {
    const hex = normalizeHex(accentColor);
    const rgb = hexToRgb(hex);
    const cmyk = rgbToCmyk(rgb);
    return {
      chipHex: hex,
      cmyk: `${cmyk.c}, ${cmyk.m}, ${cmyk.y}, ${cmyk.k}`,
      rgb: `${rgb.r}, ${rgb.g}, ${rgb.b}`,
      hex: hex.slice(1).toUpperCase(),
      pms: pms || 'N/A',
    };
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
    const specs = buildColorSpecs(item.mood.blob1, label.pms);

    leftIndexElement.textContent = String(index + 1).padStart(2, '0');
    wordElement.textContent = label.word || 'tone';
    chipElement.style.backgroundColor = specs.chipHex;
    cmykValueElement.textContent = specs.cmyk;
    rgbValueElement.textContent = specs.rgb;
    hexValueElement.textContent = specs.hex;
    pmsValueElement.textContent = specs.pms;
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