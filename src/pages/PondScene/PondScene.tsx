import { useEffect, useRef } from 'react';

import { Box, Paper, Typography } from '@mui/material';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { useLanguage } from '@/i18n/useLanguage';

// ---------------------------------------------------------------------------
// PondScene — a calm, kid-friendly pond built with Three.js.
//
// This is a scene-only page: it sets up the environment (water, grass bank,
// lily pads, rocks, cattails, clouds, fish, a butterfly and a resting fishing
// rod) so the future fishing game can drop its game logic on top. Nothing here
// is a finished game; it's a living, animated backdrop.
// ---------------------------------------------------------------------------

// The pond's surface radius. Most scenery is placed relative to this.
const POND_RADIUS = 6;

// Build a big, softly-graded sky dome so the scene has a pleasant horizon.
function createSky(): THREE.Mesh {
  const uniforms = {
    uTop: { value: new THREE.Color('#7fc4ff') },
    uHorizon: { value: new THREE.Color('#eafcff') },
  };
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms,
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      void main() {
        vWorld = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uTop;
      uniform vec3 uHorizon;
      varying vec3 vWorld;
      void main() {
        float h = clamp(normalize(vWorld).y * 0.5 + 0.5, 0.0, 1.0);
        vec3 col = mix(uHorizon, uTop, pow(h, 0.8));
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  return new THREE.Mesh(new THREE.SphereGeometry(80, 32, 16), material);
}

// Realistic animated water: multi-octave ripples, a perturbated normal for
// reflections, Fresnel (see more depth when looking straight down), and a
// specular sun highlight.
function createWater() {
  const uniforms = {
    uTime: { value: 0 },
    uRadius: { value: POND_RADIUS },
    uSunDir: { value: new THREE.Vector3(12, 18, 8).normalize() },
    uShallow: { value: new THREE.Color('#4fa8bd') },
    uDeep: { value: new THREE.Color('#173a52') },
    uSky: { value: new THREE.Color('#bfe6f2') },
  };
  const material = new THREE.ShaderMaterial({
    transparent: true,
    fog: false,
    uniforms,
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uRadius;
      varying vec3 vWorld;
      varying vec3 vNormal;
      varying float vDist;
      void main() {
        vec3 p = position;
        // Stack a few sine "waves" to get a plausible ripple field.
        float w = 0.0;
        w += sin(p.x * 1.4 + uTime * 1.1) * 0.05;
        w += sin(p.y * 1.9 + uTime * 1.4) * 0.04;
        w += sin((p.x + p.y) * 2.6 + uTime * 0.9) * 0.025;
        w += sin((p.x - p.y) * 3.3 - uTime * 1.2) * 0.015;
        p.z += w;

        // Approximate the surface normal from the analytic slope of the waves.
        float e = 0.08;
        float dx = (cos(p.x * 1.4 + uTime * 1.1) * 1.4 * 0.05
                  + cos((p.x + p.y) * 2.6 + uTime * 0.9) * 2.6 * 0.025
                  + cos((p.x - p.y) * 3.3 - uTime * 1.2) * 3.3 * 0.015) * e;
        float dy = (cos(p.y * 1.9 + uTime * 1.4) * 1.9 * 0.04
                  + cos((p.x + p.y) * 2.6 + uTime * 0.9) * 2.6 * 0.025
                  - cos((p.x - p.y) * 3.3 - uTime * 1.2) * 3.3 * 0.015) * e;
        // CircleGeometry lies in the XY plane, +Z is up.
        vNormal = normalize(vec3(-dx, -dy, 1.0));
        vDist = length(position.xy) / uRadius;
        vec4 world = modelMatrix * vec4(p, 1.0);
        vWorld = world.xyz;
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uSunDir;
      uniform vec3 uShallow;
      uniform vec3 uDeep;
      uniform vec3 uSky;
      varying vec3 vWorld;
      varying vec3 vNormal;
      varying float vDist;
      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(cameraPosition - vWorld);

        // Base water colour: shallow near the centre, deep toward the rim.
        vec3 base = mix(uShallow, uDeep, smoothstep(0.1, 1.0, vDist));

        // Fresnel: grazing angles reflect the sky, straight-down shows the base.
        float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
        vec3 col = mix(base, uSky, clamp(fresnel, 0.0, 0.85));

        // Specular sun highlight (Blinn-Phong).
        vec3 halfVec = normalize(uSunDir + viewDir);
        float spec = pow(max(dot(normal, halfVec), 0.0), 120.0);
        col += vec3(1.0, 0.98, 0.9) * spec * 1.4;

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  // Use a dense circle (not a triangle fan) so the ripple normal field is smooth.
  const mesh = new THREE.Mesh(new THREE.CircleGeometry(POND_RADIUS, 128), material);
  mesh.rotation.x = -Math.PI / 2;
  // Sit the water just above the ground (which is at y = -0.05) so the ripples
  // never dip below it and reveal the ground's triangle fan.
  mesh.position.y = 0.05;
  mesh.receiveShadow = true;
  return { mesh, material, uniforms };
}

// A leaf/pac-man shape lily pad with a little thickness.
function createLilyPad(radius: number, color: number): THREE.Mesh {
  const notch = 0.5; // half-angle (rad) of the cut
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.absarc(0, 0, radius, notch, Math.PI * 2 - notch, false);
  shape.lineTo(0, 0);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.06,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.03,
    bevelSegments: 2,
    steps: 1,
  });
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// A little cattail / reed cluster.
function createCattail(): THREE.Group {
  const group = new THREE.Group();
  const stemMat = new THREE.MeshStandardMaterial({ color: '#4f9d4f', roughness: 0.9 });
  const headMat = new THREE.MeshStandardMaterial({ color: '#7a4a25', roughness: 0.9 });
  for (let i = 0; i < 4; i++) {
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 1.6 + i * 0.15, 6), stemMat);
    const h = 1.6 + i * 0.15;
    stem.position.y = h / 2;
    stem.position.x = (i - 1.5) * 0.09;
    stem.rotation.z = (i - 1.5) * 0.06;
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.34, 8), headMat);
    head.position.set(stem.position.x, h - 0.12, 0);
    head.rotation.z = stem.rotation.z;
    group.add(stem, head);
  }
  return group;
}

// A rounded, faceted rock.
function createRock(size: number): THREE.Mesh {
  const geometry = new THREE.DodecahedronGeometry(size, 0);
  // Randomly perturb vertices for an organic look.
  const pos = geometry.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).multiplyScalar(0.8 + Math.random() * 0.4);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({ color: '#9aa0a6', roughness: 1, flatShading: true }),
  );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// A realistic fish: tapered body, a flicking tail, and soft fins.
function createFish(color: number): { group: THREE.Group; tail: THREE.Object3D } {
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.35,
    metalness: 0.15,
  });
  const finMat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.6,
    metalness: 0.05,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
  });

  // Body: a stretched sphere, tapered toward the head.
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 24), bodyMat);
  body.scale.set(1.7, 0.72, 0.5);
  body.position.x = 0.12;
  group.add(body);

  // Head snout.
  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), bodyMat);
  snout.position.set(0.62, 0.02, 0);
  group.add(snout);

  // Eye.
  const eye = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 12, 12),
    new THREE.MeshStandardMaterial({ color: '#101418', roughness: 0.2, metalness: 0.3 }),
  );
  eye.position.set(0.52, 0.08, 0.13);
  group.add(eye);

  // Tail (pivots at the back so we can flick it).
  const tail = new THREE.Group();
  tail.position.set(-0.5, 0, 0);
  const tailFin = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.5, 3), finMat);
  tailFin.rotation.z = Math.PI / 2;
  tailFin.scale.z = 0.4;
  tail.add(tailFin);
  group.add(tail);

  // Dorsal fin.
  const dorsal = new THREE.Mesh(new THREE.CircleGeometry(0.18, 16, 0, Math.PI), finMat);
  dorsal.position.set(0.05, 0.2, 0);
  dorsal.rotation.x = -Math.PI / 2;
  group.add(dorsal);

  // Pectoral fins.
  for (const side of [-1, 1]) {
    const pectoral = new THREE.Mesh(new THREE.CircleGeometry(0.14, 12, 0, Math.PI * 1.4), finMat);
    pectoral.position.set(0.34, -0.08, 0.12 * side);
    pectoral.rotation.set(-Math.PI / 2.4, 0, side * 0.5);
    pectoral.scale.set(1, 1, 1);
    group.add(pectoral);
  }
  return { group, tail };
}

// A soft radial glow sprite (used for the sun halo).
function createGlowSprite(innerColor: string, outerColor: string, scale: number): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, innerColor);
  g.addColorStop(0.25, innerColor);
  g.addColorStop(1, outerColor);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }),
  );
  sprite.scale.setScalar(scale);
  return sprite;
}

// A simple, believable tree: trunk + layered foliage.
function createTree(height: number, foliageColor: number): THREE.Group {
  const group = new THREE.Group();
  const trunkMat = new THREE.MeshStandardMaterial({ color: '#5a3d29', roughness: 0.9 });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.26, height * 0.4, 8), trunkMat);
  trunk.position.y = height * 0.2;
  trunk.castShadow = true;
  group.add(trunk);

  const leafMat = new THREE.MeshStandardMaterial({
    color: foliageColor,
    roughness: 1,
    flatShading: true,
  });
  const layers = 3;
  for (let i = 0; i < layers; i++) {
    const r = height * (0.34 - i * 0.06);
    const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), leafMat);
    blob.position.y = height * (0.42 + i * 0.22);
    blob.scale.y = 0.85;
    blob.castShadow = true;
    group.add(blob);
  }
  return group;
}

// A field of instanced grass blades for the bank.
function createGrassField(count: number, innerR: number, outerR: number): THREE.InstancedMesh {
  const bladeGeo = new THREE.ConeGeometry(0.03, 0.5, 4);
  bladeGeo.translate(0, 0.25, 0); // pivot at the base
  const bladeMat = new THREE.MeshStandardMaterial({
    color: '#5f9e4a',
    roughness: 0.9,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.InstancedMesh(bladeGeo, bladeMat, count);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3();
  const p = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = innerR + Math.random() * (outerR - innerR);
    p.set(Math.cos(a) * r, -0.05, Math.sin(a) * r);
    q.setFromEuler(
      new THREE.Euler(
        (Math.random() - 0.5) * 0.4,
        Math.random() * Math.PI,
        (Math.random() - 0.5) * 0.4,
      ),
    );
    const h = 0.7 + Math.random() * 0.7;
    s.set(0.8 + Math.random() * 0.6, h, 0.8 + Math.random() * 0.6);
    m.compose(p, q, s);
    mesh.setMatrixAt(i, m);
  }
  mesh.instanceMatrix.needsUpdate = true;
  mesh.receiveShadow = true;
  return mesh;
}

// A pink lotus lily flower.
function createLilyFlower(): THREE.Group {
  const group = new THREE.Group();
  const petalMat = new THREE.MeshStandardMaterial({
    color: '#ffd1e0',
    roughness: 0.6,
    side: THREE.DoubleSide,
  });
  const coreMat = new THREE.MeshStandardMaterial({ color: '#ffe680', roughness: 0.5 });
  for (let i = 0; i < 8; i++) {
    const petal = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), petalMat);
    petal.scale.set(0.4, 1.0, 0.18);
    const angle = (i / 8) * Math.PI * 2;
    petal.position.set(Math.cos(angle) * 0.14, 0.16, Math.sin(angle) * 0.14);
    petal.rotation.set(Math.PI / 2 - 0.5, -angle, 0);
    group.add(petal);
  }
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), coreMat);
  core.position.y = 0.22;
  group.add(core);
  return group;
}

// A soft, puffy cloud.
function createCloud(): THREE.Group {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 1,
    transparent: true,
    opacity: 0.95,
  });
  const puffs = [
    { p: [0, 0, 0], r: 1.0 },
    { p: [1.0, 0.1, 0], r: 0.8 },
    { p: [-1.0, 0, 0.2], r: 0.75 },
    { p: [0.4, 0.4, -0.2], r: 0.7 },
    { p: [-0.4, 0.35, 0.1], r: 0.6 },
  ];
  for (const puff of puffs) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(puff.r, 16, 16), mat);
    m.position.set(puff.p[0], puff.p[1], puff.p[2]);
    group.add(m);
  }
  return group;
}

// A fluttering butterfly.
function createButterfly() {
  const group = new THREE.Group();
  const wingMat = new THREE.MeshStandardMaterial({
    color: '#ff8fb1',
    roughness: 0.6,
    side: THREE.DoubleSide,
  });
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.05, 0.25, 4, 8),
    new THREE.MeshStandardMaterial({ color: '#4a3728', roughness: 0.8 }),
  );
  const wingGeo = new THREE.CircleGeometry(0.28, 16, Math.PI * 0.15, Math.PI * 0.7);
  const leftWing = new THREE.Mesh(wingGeo, wingMat);
  leftWing.position.set(-0.18, 0, 0);
  leftWing.rotation.y = Math.PI / 2;
  const rightWing = new THREE.Mesh(wingGeo, wingMat);
  rightWing.position.set(0.18, 0, 0);
  rightWing.rotation.y = Math.PI / 2;
  group.add(body, leftWing, rightWing);
  return { group, leftWing, rightWing };
}

// A resting fishing rod + line + bobber: a hint of the game to come.
function createFishingRig(x: number, z: number) {
  const group = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: '#8a5a2b', roughness: 0.7 });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.05, 2.6, 8), woodMat);
  pole.position.y = 1.3;
  pole.castShadow = true;
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.5, 8), woodMat);
  handle.position.y = 0.25;
  group.add(pole, handle);
  group.rotation.z = -0.28; // lean the rod toward the water
  group.position.set(x, 0, z);

  const tipWorld = new THREE.Vector3();
  pole.getWorldPosition(tipWorld);

  const bobber = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 16, 16),
    new THREE.MeshStandardMaterial({ color: '#e74c3c', roughness: 0.4 }),
  );
  bobber.position.set(x + 2.2, 0.02, z - 1.6);

  const lineGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(2.5, 2.4, 0).add(new THREE.Vector3(x, 0, z)),
    bobber.position.clone(),
  ]);
  const line = new THREE.Line(
    lineGeo,
    new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.7 }),
  );
  group.add(bobber, line);
  return { group, bobber };
}

export default function PondScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog('#d5eefb', 22, 55);

    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      200,
    );
    camera.position.set(0, 4.5, 11);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Physically-based look: filmic tone mapping + sRGB output.
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    const disposables: Array<{ dispose: () => void }> = [];
    const track = <T extends { dispose: () => void }>(d: T): T => {
      disposables.push(d);
      return d;
    };
    const trackObject = (obj: THREE.Object3D) => {
      obj.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (mesh.isMesh) {
          if (mesh.geometry) track(mesh.geometry);
          if (Array.isArray(mesh.material)) mesh.material.forEach((m) => track(m));
          else if (mesh.material) track(mesh.material);
        }
      });
    };

    // --- Sky, sun, clouds ---------------------------------------------------
    scene.add(createSky());
    const sunPos = new THREE.Vector3(18, 20, -30);
    const sun = new THREE.Mesh(
      track(new THREE.SphereGeometry(2.2, 24, 24)),
      track(new THREE.MeshBasicMaterial({ color: '#fff6d8' })),
    );
    sun.position.copy(sunPos);
    scene.add(sun);
    const sunGlow = createGlowSprite('rgba(255,244,200,0.9)', 'rgba(255,244,200,0)', 26);
    sunGlow.position.copy(sunPos);
    scene.add(sunGlow);

    // --- Lighting -----------------------------------------------------------
    const hemi = new THREE.HemisphereLight('#cdeeff', '#7bc96a', 0.85);
    scene.add(hemi);
    const sunLight = new THREE.DirectionalLight('#fff2cc', 1.4);
    sunLight.position.set(12, 18, 8);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(1024, 1024);
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 60;
    const shadowExtent = 16;
    sunLight.shadow.camera.left = -shadowExtent;
    sunLight.shadow.camera.right = shadowExtent;
    sunLight.shadow.camera.top = shadowExtent;
    sunLight.shadow.camera.bottom = -shadowExtent;
    scene.add(sunLight);

    // --- Ground / grass bank ------------------------------------------------
    const grass = new THREE.Mesh(
      track(new THREE.CircleGeometry(16, 64)),
      track(new THREE.MeshStandardMaterial({ color: '#7bc96a', roughness: 1 })),
    );
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = -0.05;
    grass.receiveShadow = true;
    scene.add(grass);

    const sand = new THREE.Mesh(
      track(new THREE.RingGeometry(POND_RADIUS - 0.2, POND_RADIUS + 1.1, 64)),
      track(new THREE.MeshStandardMaterial({ color: '#e0c98f', roughness: 1 })),
    );
    sand.rotation.x = -Math.PI / 2;
    sand.position.y = -0.04;
    sand.receiveShadow = true;
    scene.add(sand);

    // --- Water --------------------------------------------------------------
    const water = createWater();
    trackObject(water.mesh);
    scene.add(water.mesh);

    // --- Grass field --------------------------------------------------------
    const grassField = createGrassField(700, POND_RADIUS + 0.6, POND_RADIUS + 4.5);
    scene.add(grassField);

    // --- Background trees ---------------------------------------------------
    const treeColors = [0x3f7d4a, 0x4a8a52, 0x356b42, 0x529a5a];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.5;
      const r = 12 + (i % 2) * 2.5;
      const tree = createTree(2.4 + (i % 3) * 0.6, treeColors[i % treeColors.length]);
      tree.position.set(Math.cos(a) * r, -0.05, Math.sin(a) * r);
      tree.rotation.y = Math.random() * Math.PI;
      scene.add(tree);
      trackObject(tree);
    }

    // --- Lily pads ----------------------------------------------------------
    const lilyPads: { mesh: THREE.Mesh; baseY: number; phase: number }[] = [];
    const padColors = ['#3fae5a', '#46b85f', '#379a50', '#4cbf63'];
    const padSpots = [
      { a: 0.4, r: 4.4, s: 0.9 },
      { a: 2.0, r: 3.2, s: 0.7 },
      { a: 3.4, r: 4.8, s: 1.0 },
      { a: 4.6, r: 3.6, s: 0.8 },
      { a: 5.5, r: 4.2, s: 0.75 },
    ];
    padSpots.forEach((spot, i) => {
      const pad = createLilyPad(spot.s, padColors[i % padColors.length]);
      pad.position.set(Math.cos(spot.a) * spot.r, 0.06, Math.sin(spot.a) * spot.r);
      scene.add(pad);
      trackObject(pad);
      lilyPads.push({ mesh: pad, baseY: 0.06, phase: Math.random() * Math.PI * 2 });
      // Sprinkle a lotus flower on a few of the pads.
      if (i % 2 === 0) {
        const flower = createLilyFlower();
        flower.position.set(0, spot.s * 0.4, 0);
        pad.add(flower);
        trackObject(flower);
      }
    });

    // --- Rocks around the bank ---------------------------------------------
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + 0.3;
      const rock = createRock(0.35 + Math.random() * 0.35);
      rock.position.set(Math.cos(a) * (POND_RADIUS + 1.3), 0.15, Math.sin(a) * (POND_RADIUS + 1.3));
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      scene.add(rock);
      trackObject(rock);
    }

    // --- Cattail clusters ---------------------------------------------------
    const cattails: { group: THREE.Group; phase: number }[] = [];
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 1.2;
      const c = createCattail();
      c.position.set(Math.cos(a) * (POND_RADIUS + 1.5), 0, Math.sin(a) * (POND_RADIUS + 1.5));
      c.rotation.y = -a;
      scene.add(c);
      trackObject(c);
      cattails.push({ group: c, phase: Math.random() * Math.PI * 2 });
    }

    // --- Fish (underwater) --------------------------------------------------
    const fish: {
      group: THREE.Group;
      tail: THREE.Object3D;
      angle: number;
      radius: number;
      speed: number;
      phase: number;
    }[] = [];
    const fishColors = [0xffb703, 0xfb8500, 0xffd166, 0xe0664a, 0x4cc9f0];
    for (let i = 0; i < 5; i++) {
      const { group, tail } = createFish(fishColors[i % fishColors.length]);
      const radius = 1.8 + i * 0.5;
      const angle = (i / 5) * Math.PI * 2;
      fish.push({
        group,
        tail,
        angle,
        radius,
        speed: 0.5 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
      });
      scene.add(group);
      trackObject(group);
    }

    // --- Clouds -------------------------------------------------------------
    const clouds: { group: THREE.Group; speed: number }[] = [];
    for (let i = 0; i < 4; i++) {
      const c = createCloud();
      c.position.set(-30 + i * 16, 9 + (i % 2) * 2, -18 - i * 3);
      c.scale.setScalar(1.1 + Math.random() * 0.8);
      scene.add(c);
      trackObject(c);
      clouds.push({ group: c, speed: 0.4 + Math.random() * 0.4 });
    }

    // --- Butterfly ----------------------------------------------------------
    const butterfly = createButterfly();
    scene.add(butterfly.group);
    trackObject(butterfly.group);

    // --- Fishing rig --------------------------------------------------------
    const rig = createFishingRig(POND_RADIUS + 1.2, -1.2);
    scene.add(rig.group);
    trackObject(rig.group);

    // --- Controls -----------------------------------------------------------
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 0.6, 0);
    controls.minDistance = 5;
    controls.maxDistance = 26;
    controls.maxPolarAngle = Math.PI / 2.05; // keep the camera above the ground
    controls.enablePan = false;

    // --- Animation loop -----------------------------------------------------
    const clock = new THREE.Clock();
    let frameId = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      water.uniforms.uTime.value = time;

      for (const pad of lilyPads) {
        pad.mesh.position.y = pad.baseY + Math.sin(time * 1.2 + pad.phase) * 0.05;
      }
      for (const { group, phase } of cattails) {
        group.rotation.z = Math.sin(time * 1.5 + phase) * 0.05;
      }
      for (const f of fish) {
        f.angle += f.speed * 0.01;
        const x = Math.cos(f.angle) * f.radius;
        const z = Math.sin(f.angle) * f.radius;
        // Fish "surface" at the water line: dip below (hidden) and rise above.
        f.group.position.set(x, Math.sin(time * 1.5 + f.angle) * 0.35, z);
        f.group.rotation.y = -f.angle + Math.PI / 2;
        f.tail.rotation.z = Math.sin(time * 8 + f.phase) * 0.5; // flick the tail
      }
      for (const c of clouds) {
        c.group.position.x += c.speed * 0.02;
        if (c.group.position.x > 34) c.group.position.x = -34;
      }

      // Butterfly: gentle figure-eight with flapping wings.
      butterfly.group.position.set(
        Math.cos(time * 0.6) * 3.5,
        1.6 + Math.sin(time * 1.3) * 0.4,
        Math.sin(time * 0.6) * 3.5,
      );
      const flap = Math.sin(time * 12) * 0.6;
      butterfly.leftWing.rotation.z = flap;
      butterfly.rightWing.rotation.z = -flap;

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // --- Resize handling ----------------------------------------------------
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // --- Cleanup ------------------------------------------------------------
    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      controls.dispose();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      scene.clear();
    };
  }, []);

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        '@supports (height: 100dvh)': { minHeight: '100dvh' },
        overflow: 'hidden',
      }}
    >
      <div
        ref={containerRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(92%, 460px)',
          pointerEvents: 'none',
          textAlign: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: { xs: 1.5, sm: 2 },
            borderRadius: '1.25rem',
            bgcolor: 'rgba(255, 255, 255, 0.72)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Fredoka', 'Comic Sans MS', cursive",
              fontSize: { xs: 22, sm: 28 },
              fontWeight: 700,
              color: '#2f7fae',
            }}
          >
            🐟 {t.pondTitle}
          </Typography>
          <Typography sx={{ mt: 0.5, color: '#4a5b68', fontSize: { xs: 13, sm: 15 } }}>
            {t.pondHint}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
