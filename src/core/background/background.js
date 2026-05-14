import * as THREE from 'three';
import { items } from './../../data/items.js';

export function createBackground(renderer) {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const backgroundColor = new THREE.Color(items[0].mood.bg);
  const blob1Color = new THREE.Color(items[0].mood.blob1);
  const blob2Color = new THREE.Color(items[0].mood.blob2);
  const nextBgColor = new THREE.Color();
  const nextBlob1Color = new THREE.Color();
  const nextBlob2Color = new THREE.Color();

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    uniform vec3 uBackgroundColor;
    uniform vec3 uBlob1Color;
    uniform vec3 uBlob2Color;
    uniform float uNoiseStrength;
    uniform float uBlobRadius;
    uniform float uBlobRadiusSecondary;
    uniform float uBlobStrength;
    uniform float uTime;
    uniform float uVelocityIntensity;

    float random(vec2 coord) {
      return fract(sin(dot(coord, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    void main() {
      vec3 color = uBackgroundColor;

      float animTime = uTime * 0.00028;
      vec2 blob1Center = vec2(
        0.50 + sin(animTime * 1.000) * 0.13 + sin(animTime * 1.618) * 0.05,
        0.48 + cos(animTime * 0.794) * 0.09 + cos(animTime * 1.272) * 0.03
      );
      vec2 blob2Center = vec2(
        0.35 + cos(animTime * 0.927) * 0.11 + cos(animTime * 1.414) * 0.04,
        0.55 + sin(animTime * 1.175) * 0.07 + sin(animTime * 0.618) * 0.03
      );

      float blob1 = smoothstep(uBlobRadius, 0.0, distance(vUv, blob1Center));
      float blob2 = smoothstep(uBlobRadiusSecondary, 0.0, distance(vUv, blob2Center));

      vec3 blob1SoftColor = mix(uBlob1Color, uBackgroundColor, 0.35);
      vec3 blob2SoftColor = mix(uBlob2Color, uBackgroundColor, 0.35);
      color = mix(color, blob1SoftColor, blob1 * uBlobStrength);
      color = mix(color, blob2SoftColor, blob2 * uBlobStrength);

      color += uVelocityIntensity * 0.10;

      float grain = random(vUv * vec2(1387.13, 947.91)) - 0.5;
      color += grain * uNoiseStrength;
      color = clamp(color, 0.0, 1.0);

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    depthWrite: false,
    depthTest: false,
    uniforms: {
      uBackgroundColor: { value: backgroundColor },
      uBlob1Color: { value: blob1Color },
      uBlob2Color: { value: blob2Color },
      uNoiseStrength: { value: 0.04 },
      uBlobRadius: { value: 0.65 },
      uBlobRadiusSecondary: { value: 0.65 * 0.78 },
      uBlobStrength: { value: 0.9 },
      uTime: { value: 0 },
      uVelocityIntensity: { value: 0 },
    },
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(mesh);

  function update(cameraZ, scroll) {
    const planeGap = 5;
    const moodSampleOffset = 1;
    const firstZ = 0;
    const lastIndex = items.length - 1;

    const sampledZ = cameraZ - planeGap * moodSampleOffset;
    const normalizedDepth = THREE.MathUtils.clamp(
      (firstZ - sampledZ) / planeGap,
      0,
      lastIndex
    );
    const currentIndex = Math.floor(normalizedDepth);
    const nextIndex = Math.min(currentIndex + 1, lastIndex);
    const blend = normalizedDepth - currentIndex;

    const current = items[currentIndex].mood;
    const next = items[nextIndex].mood;

    backgroundColor.set(current.bg).lerp(nextBgColor.set(next.bg), blend);
    blob1Color.set(current.blob1).lerp(nextBlob1Color.set(next.blob1), blend);
    blob2Color.set(current.blob2).lerp(nextBlob2Color.set(next.blob2), blend);

    material.uniforms.uBackgroundColor.value.copy(backgroundColor);
    material.uniforms.uBlob1Color.value.copy(blob1Color);
    material.uniforms.uBlob2Color.value.copy(blob2Color);
    material.uniforms.uTime.value = performance.now();

    const velocity = scroll?.getVelocity() || 0;
    const velocityMax = scroll?.velocityMax || 1.5;
    material.uniforms.uVelocityIntensity.value = THREE.MathUtils.clamp(
      Math.abs(velocity) / velocityMax, 0, 1
    );
  }

  function render() {
    renderer.render(scene, camera);
  }

  return { update, render };
}