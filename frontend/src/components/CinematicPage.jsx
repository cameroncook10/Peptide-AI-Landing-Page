import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import './CinematicPage.css';

const API_BASE = import.meta.env.VITE_API_URL || '';

/* ═══════════════════════════════════════════════════
   Nebula Background Shaders
   ═══════════════════════════════════════════════════ */
const NEBULA_VERT = `
varying vec2 vUv;
void main(){
  vUv=uv;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
}`;

const NEBULA_FRAG = `
uniform float uTime;
varying vec2 vUv;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){
  vec2 i=floor(p),f=fract(p);
  f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
             mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p){
  float s=0.0,a=0.5;
  for(int i=0;i<5;i++){s+=noise(p)*a;p*=2.0;a*=0.5;}
  return s;
}
void main(){
  float t=uTime*0.025;
  float n1=fbm(vUv*2.5+vec2(t,t*0.6));
  float n2=fbm(vUv*3.5-vec2(t*0.4,t*0.25));
  float n3=fbm(vUv*5.0+vec2(-t*0.2,t*0.4));
  float n4=fbm(vUv*1.8+vec2(t*0.15,-t*0.35));
  vec3 c=vec3(0.001,0.004,0.002);
  c+=vec3(0.0,0.03,0.012)*pow(n1,2.5);
  c+=vec3(0.0,0.02,0.008)*pow(n2,2.0);
  c+=vec3(0.0,0.04,0.015)*pow(max(n3-0.3,0.0),2.0)*0.9;
  c+=vec3(0.0,0.015,0.006)*n4*n1;
  gl_FragColor=vec4(c,1.0);
}`;

// Custom glow point shader — circular soft glow with per-particle size
const GLOW_POINT_VERT = `
attribute float aSize;
attribute float aBright;
varying float vBright;
void main(){
  vBright=aBright;
  vec4 mv=modelViewMatrix*vec4(position,1.0);
  gl_PointSize=aSize*(300.0/(-mv.z));
  gl_Position=projectionMatrix*mv;
}`;

const GLOW_POINT_FRAG = `
uniform vec3 uColor;
uniform float uOpacity;
varying float vBright;
void main(){
  float d=length(gl_PointCoord-0.5)*2.0;
  if(d>1.0) discard;
  float glow=exp(-d*d*2.0);
  float core=smoothstep(0.35,0.0,d);
  float outer=exp(-d*d*0.8)*0.3;
  float alpha=(glow*0.7+core*1.0+outer)*vBright*uOpacity;
  vec3 c=uColor*(0.6+core*0.6);
  gl_FragColor=vec4(c*alpha,alpha);
}`;

// Per-particle color shader for DNA rungs (gradient base-pair effect)
const RUNG_VERT = `
attribute float aSize;
attribute float aBright;
attribute vec3 aColor;
varying float vBright;
varying vec3 vColor;
void main(){
  vBright=aBright;
  vColor=aColor;
  vec4 mv=modelViewMatrix*vec4(position,1.0);
  gl_PointSize=aSize*(300.0/(-mv.z));
  gl_Position=projectionMatrix*mv;
}`;

const RUNG_FRAG = `
uniform float uOpacity;
varying float vBright;
varying vec3 vColor;
void main(){
  float d=length(gl_PointCoord-0.5)*2.0;
  if(d>1.0) discard;
  float glow=exp(-d*d*2.0);
  float core=smoothstep(0.35,0.0,d);
  float outer=exp(-d*d*0.8)*0.3;
  float alpha=(glow*0.7+core*1.0+outer)*vBright*uOpacity;
  vec3 c=vColor*(0.6+core*0.6);
  gl_FragColor=vec4(c*alpha,alpha);
}`;

// Animated flying star shader
const STAR_VERT = `
attribute float aSize;
attribute float aSpeed;
attribute float aPhase;
uniform float uTime;
varying float vAlpha;
void main(){
  vec3 p=position;
  // Orbit slowly
  float angle=uTime*aSpeed+aPhase;
  float ca=cos(angle),sa=sin(angle);
  p=vec3(p.x*ca-p.z*sa, p.y+sin(uTime*aSpeed*0.5+aPhase)*2.0, p.x*sa+p.z*ca);
  // Twinkle
  vAlpha=0.3+0.7*pow(sin(uTime*aSpeed*3.0+aPhase)*0.5+0.5,2.0);
  vec4 mv=modelViewMatrix*vec4(p,1.0);
  gl_PointSize=aSize*(200.0/(-mv.z));
  gl_Position=projectionMatrix*mv;
}`;

const STAR_FRAG = `
uniform vec3 uColor;
varying float vAlpha;
void main(){
  float d=length(gl_PointCoord-0.5)*2.0;
  if(d>1.0) discard;
  float glow=exp(-d*d*4.0);
  gl_FragColor=vec4(uColor*glow*vAlpha,glow*vAlpha);
}`;

/* ═══════════════════════════════════════════════════
   High-Quality DNA Helix Scene
   ═══════════════════════════════════════════════════ */
function createScene(canvas, THREE, postFx) {
  const mob = innerWidth < 780;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(mob ? 50 : 60, innerWidth / innerHeight, 0.1, 200);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mob, alpha: false });
  const dpr = Math.min(devicePixelRatio, mob ? 1.5 : 2);
  renderer.setPixelRatio(dpr);
  renderer.setSize(innerWidth, innerHeight);
  renderer.setClearColor(0x000800);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  // ── Nebula sky-dome ──
  const nebulaMat = new THREE.ShaderMaterial({
    vertexShader: NEBULA_VERT,
    fragmentShader: NEBULA_FRAG,
    uniforms: { uTime: { value: 0 } },
    side: THREE.BackSide,
    depthWrite: false,
  });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(160, mob ? 32 : 64, mob ? 16 : 32), nebulaMat));

  // ── DNA Group ──
  const dnaGroup = new THREE.Group();
  scene.add(dnaGroup);

  // ── Lights ──
  scene.add(new THREE.AmbientLight(0x001a08, 0.5));
  const keyLight = new THREE.PointLight(0x00ff88, 2.0, 40);
  const fillLight = new THREE.PointLight(0x00cc66, 1.0, 30);
  fillLight.position.set(-5, 0, -5);
  const rimLight = new THREE.PointLight(0x00ffaa, 0.8, 25);
  rimLight.position.set(0, -10, 5);
  scene.add(keyLight, fillLight, rimLight);

  // ── Camera path ──
  const cameraPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 10, mob ? 12 : 26),
    new THREE.Vector3(3, 7, mob ? 9 : 22),
    new THREE.Vector3(5, 4, mob ? 7 : 18),
    new THREE.Vector3(-3, 1, mob ? 5.5 : 12),
    new THREE.Vector3(-4, -2, mob ? 4.5 : 8),
    new THREE.Vector3(3, -5, mob ? 4 : 6),
    new THREE.Vector3(2, -8, mob ? 3 : 3),
    new THREE.Vector3(0, -12, mob ? 1.8 : 1),
    new THREE.Vector3(0, -15, mob ? 0.8 : 0.5),
  ]);

  // ── Bloom post-processing (desktop only) ──
  let composer = null;
  if (!mob && postFx) {
    composer = new postFx.EffectComposer(renderer);
    composer.addPass(new postFx.RenderPass(scene, camera));
    composer.addPass(new postFx.UnrealBloomPass(
      new THREE.Vector2(innerWidth, innerHeight), 2.5, 1.0, 0.05,
    ));
  }

  // ── Build queue: neon particle-cloud DNA + flying stars ──
  const TURNS = 8, HEIGHT = 50, RADIUS = 2.8;
  const SEGMENTS = mob ? 200 : 500;
  const RUNG_COUNT = mob ? 80 : 200;
  const STRAND_PTS = mob ? 2000 : 5000;
  const HALO_PTS = mob ? 1000 : 2000;
  const RUNG_INTERP = mob ? 28 : 40;

  const buildQueue = [];
  const ctx = { c1: null, c2: null, starMat: null };
  const hotspotMats = [];
  const hotspotYs = [];
  const connectorData = [];

  // Step 1: helix backbone strands
  buildQueue.push(() => {
    const pts1 = [], pts2 = [];
    for (let i = 0; i <= SEGMENTS; i++) {
      const t = i / SEGMENTS;
      const a = t * Math.PI * 2 * TURNS;
      const y = (t - 0.5) * HEIGHT;
      pts1.push(new THREE.Vector3(Math.cos(a) * RADIUS, y, Math.sin(a) * RADIUS));
      pts2.push(new THREE.Vector3(Math.cos(a + Math.PI) * RADIUS, y, Math.sin(a + Math.PI) * RADIUS));
    }
    ctx.c1 = new THREE.CatmullRomCurve3(pts1);
    ctx.c2 = new THREE.CatmullRomCurve3(pts2);

    function makeStrand(curve, count, noiseR, baseSize, sizeVar) {
      const pos = new Float32Array(count * 3);
      const sizes = new Float32Array(count);
      const brights = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        const t = i / count;
        const p = curve.getPoint(t);
        const u1 = Math.random() || 0.001, u2 = Math.random();
        const g = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) * noiseR;
        const angle = Math.random() * Math.PI * 2;
        pos[i * 3] = p.x + Math.cos(angle) * g;
        pos[i * 3 + 1] = p.y + (Math.random() - 0.5) * noiseR * 0.4;
        pos[i * 3 + 2] = p.z + Math.sin(angle) * g;
        sizes[i] = baseSize + Math.random() * sizeVar;
        brights[i] = 0.5 + Math.random() * 0.5;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
      geo.setAttribute('aBright', new THREE.BufferAttribute(brights, 1));
      return geo;
    }

    const coreMat = new THREE.ShaderMaterial({
      vertexShader: GLOW_POINT_VERT, fragmentShader: GLOW_POINT_FRAG,
      uniforms: { uColor: { value: new THREE.Color(0x00ffbb) }, uOpacity: { value: mob ? 1.4 : 1.0 } },
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    for (const c of [ctx.c1, ctx.c2]) {
      dnaGroup.add(new THREE.Points(makeStrand(c, STRAND_PTS, 0.12, mob ? 0.09 : 0.06, mob ? 0.12 : 0.08), coreMat));
    }

    const haloMat = new THREE.ShaderMaterial({
      vertexShader: GLOW_POINT_VERT, fragmentShader: GLOW_POINT_FRAG,
      uniforms: { uColor: { value: new THREE.Color(0x00ff99) }, uOpacity: { value: mob ? 0.7 : 0.4 } },
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    for (const c of [ctx.c1, ctx.c2]) {
      dnaGroup.add(new THREE.Points(makeStrand(c, HALO_PTS, 0.45, mob ? 0.2 : 0.15, mob ? 0.28 : 0.2), haloMat));
    }
  });

  // Step 2: rung connections + junction nodes (cyan-to-magenta gradient base pairs)
  buildQueue.push(() => {
    const rPos = [], rSizes = [], rBrights = [], rColors = [];
    const nPos = [], nSizes = [], nBrights = [], nColors = [];
    // Two color pairs that alternate per rung (like A-T vs G-C base pairs)
    const pairA = [new THREE.Color(0x00e5ff), new THREE.Color(0xff44cc)]; // cyan → magenta
    const pairB = [new THREE.Color(0x44ddff), new THREE.Color(0xcc66ff)]; // sky blue → violet
    const tmp = new THREE.Color();
    for (let i = 0; i < RUNG_COUNT; i++) {
      const t = i / RUNG_COUNT;
      const p1 = ctx.c1.getPoint(t), p2 = ctx.c2.getPoint(t);
      const pair = i % 2 === 0 ? pairA : pairB;
      for (let j = 0; j <= RUNG_INTERP; j++) {
        const f = j / RUNG_INTERP;
        rPos.push(
          p1.x + (p2.x - p1.x) * f + (Math.random() - 0.5) * 0.06,
          p1.y + (p2.y - p1.y) * f + (Math.random() - 0.5) * 0.06,
          p1.z + (p2.z - p1.z) * f + (Math.random() - 0.5) * 0.06,
        );
        // Center particles are larger for a "bulge" effect
        const centerDist = Math.abs(f - 0.5) * 2; // 0 at center, 1 at edges
        rSizes.push(0.06 + (1 - centerDist) * 0.05 + Math.random() * 0.04);
        rBrights.push(0.65 + (1 - centerDist) * 0.2 + Math.random() * 0.15);
        // Gradient color from one strand to the other
        tmp.copy(pair[0]).lerp(pair[1], f);
        rColors.push(tmp.r, tmp.g, tmp.b);
      }
      // Junction nodes at each backbone connection — match the pair color at that end
      for (let k = 0; k < 2; k++) {
        const p = k === 0 ? p1 : p2;
        nPos.push(p.x, p.y, p.z);
        nSizes.push(0.14 + Math.random() * 0.1);
        nBrights.push(0.9 + Math.random() * 0.1);
        const nc = pair[k];
        nColors.push(nc.r, nc.g, nc.b);
      }
    }

    const rungMat = new THREE.ShaderMaterial({
      vertexShader: RUNG_VERT, fragmentShader: RUNG_FRAG,
      uniforms: { uOpacity: { value: mob ? 1.3 : 0.95 } },
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const rGeo = new THREE.BufferGeometry();
    rGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(rPos), 3));
    rGeo.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array(rSizes), 1));
    rGeo.setAttribute('aBright', new THREE.BufferAttribute(new Float32Array(rBrights), 1));
    rGeo.setAttribute('aColor', new THREE.BufferAttribute(new Float32Array(rColors), 3));
    dnaGroup.add(new THREE.Points(rGeo, rungMat));

    const nodeMat = new THREE.ShaderMaterial({
      vertexShader: RUNG_VERT, fragmentShader: RUNG_FRAG,
      uniforms: { uOpacity: { value: mob ? 1.8 : 1.4 } },
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const nGeo = new THREE.BufferGeometry();
    nGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(nPos), 3));
    nGeo.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array(nSizes), 1));
    nGeo.setAttribute('aBright', new THREE.BufferAttribute(new Float32Array(nBrights), 1));
    nGeo.setAttribute('aColor', new THREE.BufferAttribute(new Float32Array(nColors), 3));
    dnaGroup.add(new THREE.Points(nGeo, nodeMat));
  });

  // Step 3: floating particles + flying stars
  buildQueue.push(() => {
    const P_COUNT = mob ? 1500 : 4000;
    const pPos = [], pSizes = [], pBrights = [];
    for (let i = 0; i < P_COUNT; i++) {
      const t = Math.random(), angle = Math.random() * Math.PI * 2;
      const y = (t - 0.5) * HEIGHT, r = RADIUS + (Math.random() - 0.5) * 6;
      pPos.push(Math.cos(angle) * r, y, Math.sin(angle) * r);
      pSizes.push(mob ? 0.05 + Math.random() * 0.1 : 0.03 + Math.random() * 0.06);
      pBrights.push(mob ? 0.4 + Math.random() * 0.6 : 0.2 + Math.random() * 0.5);
    }
    const mistMat = new THREE.ShaderMaterial({
      vertexShader: GLOW_POINT_VERT, fragmentShader: GLOW_POINT_FRAG,
      uniforms: { uColor: { value: new THREE.Color(0x00ff99) }, uOpacity: { value: mob ? 0.7 : 0.4 } },
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pPos), 3));
    pGeo.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array(pSizes), 1));
    pGeo.setAttribute('aBright', new THREE.BufferAttribute(new Float32Array(pBrights), 1));
    dnaGroup.add(new THREE.Points(pGeo, mistMat));

    const S_COUNT = mob ? 1500 : 5000;
    const sPos = new Float32Array(S_COUNT * 3);
    const sSizes = new Float32Array(S_COUNT);
    const sSpeeds = new Float32Array(S_COUNT);
    const sPhases = new Float32Array(S_COUNT);
    for (let i = 0; i < S_COUNT; i++) {
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      const r = 15 + Math.random() * 50;
      sPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      sPos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      sPos[i * 3 + 2] = r * Math.cos(ph);
      sSizes[i] = 0.04 + Math.random() * 0.12;
      sSpeeds[i] = 0.02 + Math.random() * 0.08;
      sPhases[i] = Math.random() * Math.PI * 2;
    }
    const starMat = new THREE.ShaderMaterial({
      vertexShader: STAR_VERT, fragmentShader: STAR_FRAG,
      uniforms: { uColor: { value: new THREE.Color(0x88ffcc) }, uTime: { value: 0 } },
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    ctx.starMat = starMat;
    const sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
    sGeo.setAttribute('aSize', new THREE.BufferAttribute(sSizes, 1));
    sGeo.setAttribute('aSpeed', new THREE.BufferAttribute(sSpeeds, 1));
    sGeo.setAttribute('aPhase', new THREE.BufferAttribute(sPhases, 1));
    scene.add(new THREE.Points(sGeo, starMat));
  });

  // Step 4: hotspot glow clusters at each panel's DNA section
  buildQueue.push(() => {
    // DNA t-values that place hotspots where the camera looks during each panel
    const HOTSPOT_T = [0.44, 0.38, 0.32, 0.25];
    for (let h = 0; h < HOTSPOT_T.length; h++) {
      const ht = HOTSPOT_T[h];
      const p1 = ctx.c1.getPoint(ht);
      const p2 = ctx.c2.getPoint(ht);
      const cx = (p1.x + p2.x) * 0.5;
      const cy = (p1.y + p2.y) * 0.5;
      const cz = (p1.z + p2.z) * 0.5;
      hotspotYs.push(cy);

      const CLUSTER = mob ? 28 : 45;
      const cPos = new Float32Array(CLUSTER * 3);
      const cSizes = new Float32Array(CLUSTER);
      const cBrights = new Float32Array(CLUSTER);

      for (let i = 0; i < CLUSTER; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * 1.2;
        cPos[i * 3] = cx + Math.cos(angle) * r;
        cPos[i * 3 + 1] = cy + (Math.random() - 0.5) * 0.8;
        cPos[i * 3 + 2] = cz + Math.sin(angle) * r;
        // Mix of large ring particles and tight core particles
        cSizes[i] = i < CLUSTER * 0.3
          ? 0.25 + Math.random() * 0.35   // large outer glow
          : 0.1 + Math.random() * 0.15;   // tight core
        cBrights[i] = 0.6 + Math.random() * 0.4;
      }

      const mat = new THREE.ShaderMaterial({
        vertexShader: GLOW_POINT_VERT,
        fragmentShader: GLOW_POINT_FRAG,
        uniforms: {
          uColor: { value: new THREE.Color(0x00ffdd) },
          uOpacity: { value: 0.0 },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      hotspotMats.push(mat);

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(cPos, 3));
      geo.setAttribute('aSize', new THREE.BufferAttribute(cSizes, 1));
      geo.setAttribute('aBright', new THREE.BufferAttribute(cBrights, 1));
      dnaGroup.add(new THREE.Points(geo, mat));
    }
  });

  // Step 5: connector particles — one per panel, floats freely then pulls to hotspot
  buildQueue.push(() => {
    const HOTSPOT_T = [0.44, 0.38, 0.32, 0.25];
    for (let h = 0; h < HOTSPOT_T.length; h++) {
      const ht = HOTSPOT_T[h];
      const p1 = ctx.c1.getPoint(ht);
      const p2 = ctx.c2.getPoint(ht);
      const targetPos = new THREE.Vector3(
        (p1.x + p2.x) * 0.5,
        (p1.y + p2.y) * 0.5,
        (p1.z + p2.z) * 0.5,
      );

      // Random rest position floating away from the DNA
      const restAngle = Math.random() * Math.PI * 2;
      const restR = RADIUS + 3 + Math.random() * 5;
      const restPos = new THREE.Vector3(
        Math.cos(restAngle) * restR,
        targetPos.y + (Math.random() - 0.5) * 10,
        Math.sin(restAngle) * restR,
      );

      // Small cluster of bright particles
      const N = mob ? 5 : 8;
      const offsets = new Float32Array(N * 3);
      const cPos = new Float32Array(N * 3);
      const cSizes = new Float32Array(N);
      const cBrights = new Float32Array(N);
      for (let i = 0; i < N; i++) {
        offsets[i * 3] = (Math.random() - 0.5) * 0.5;
        offsets[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
        offsets[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
        cPos[i * 3] = restPos.x + offsets[i * 3];
        cPos[i * 3 + 1] = restPos.y + offsets[i * 3 + 1];
        cPos[i * 3 + 2] = restPos.z + offsets[i * 3 + 2];
        cSizes[i] = i === 0 ? 0.4 : 0.15 + Math.random() * 0.2;
        cBrights[i] = 0.7 + Math.random() * 0.3;
      }

      const mat = new THREE.ShaderMaterial({
        vertexShader: GLOW_POINT_VERT,
        fragmentShader: GLOW_POINT_FRAG,
        uniforms: {
          uColor: { value: new THREE.Color(0x66ffee) },
          uOpacity: { value: 0.3 },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(cPos, 3));
      geo.setAttribute('aSize', new THREE.BufferAttribute(cSizes, 1));
      geo.setAttribute('aBright', new THREE.BufferAttribute(cBrights, 1));

      const points = new THREE.Points(geo, mat);
      dnaGroup.add(points);

      connectorData.push({
        points, mat, geo, offsets,
        restPos: restPos.clone(),
        targetPos: targetPos.clone(),
        currentPos: restPos.clone(),
      });
    }
  });

  return { scene, camera, renderer, composer, keyLight, fillLight, rimLight, cameraPath, dnaGroup, nebulaMat, buildQueue, ctx, hotspotMats, hotspotYs, connectorData };
}

/* ═══════════════════════════════════════════════════
   Ticker Data
   ═══════════════════════════════════════════════════ */
const TICKER1 = ['AI Insights', 'BPC-157', 'HRV Tracking', 'Sleep Analysis', 'Protocol Builder', 'Dose Schedules', 'TB-500', 'Biometric Data', 'Stack Optimizer', 'Smart Alerts', 'Semax', 'Progress Charts'];
const TICKER2 = ['Growth Hormone', 'CJC-1295', 'Recovery Metrics', 'Peptide Logs', 'Custom Protocols', 'IGF-1 Tracking', 'Daily Reports', 'PT-141', 'AOD-9604', 'Ipamorelin', 'DSIP', 'Epitalon'];
const ACCENTS = new Set(['AI Insights', 'Stack Optimizer', 'Custom Protocols', 'IGF-1 Tracking']);

/* ═══════════════════════════════════════════════════
   Stats
   ═══════════════════════════════════════════════════ */
const STATS = [
  { end: 1000, suffix: '+', label: 'Clinical studies referenced', icon: 'book' },
  { end: 50, suffix: '+', label: 'Peptides cataloged', icon: 'flask' },
  { end: 12, suffix: '+', label: 'Biomarkers tracked', icon: 'pulse' },
];

const STAT_ICONS = {
  book: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /><path d="M8 7h6" /><path d="M8 11h4" /></svg>,
  flask: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.14A1 1 0 0 0 5.598 22h12.804a1 1 0 0 0 .879-1.86l-5.07-9.716A2 2 0 0 1 14 9.527V2" /><path d="M8.5 2h7" /><path d="M7 16.5h10" /></svg>,
  pulse: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
};

function AnimatedNum({ end, suffix, decimal, star, trigger }) {
  const [val, setVal] = useState(0);
  const ran = useRef(false);
  useEffect(() => {
    if (!trigger || ran.current) return;
    ran.current = true;
    const dur = 1800, t0 = performance.now();
    (function tick(now) {
      const p = Math.min((now - t0) / dur, 1);
      setVal((1 - Math.pow(1 - p, 3)) * end);
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }, [trigger, end]);
  return (
    <span className="cine-stat-num">
      {decimal ? val.toFixed(1) : Math.round(val)}{suffix}
      {star && <span className="cine-stat-star">&#9733;</span>}
    </span>
  );
}

/* ═══════════════════════════════════════════════════
   Research Cards Data
   ═══════════════════════════════════════════════════ */
const RESEARCH = [
  {
    title: 'Peptide Database',
    desc: '50+ peptides cataloged with dosing protocols, half-lives, and synergy data sourced from peer-reviewed literature.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.14A1 1 0 0 0 5.598 22h12.804a1 1 0 0 0 .879-1.86l-5.07-9.716A2 2 0 0 1 14 9.527V2" />
        <path d="M8.5 2h7" /><path d="M7 16.5h10" />
      </svg>
    ),
  },
  {
    title: 'Biometric Integration',
    desc: 'Real-time HRV, sleep quality, and recovery data synced from Apple Health, Oura Ring, and compatible wearables.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    title: 'AI Analysis Engine',
    desc: 'Machine learning models analyze your protocol outcomes to surface personalized, data-backed optimization insights.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
      </svg>
    ),
  },
];

/* ═══════════════════════════════════════════════════
   How It Works Data
   ═══════════════════════════════════════════════════ */
const STEPS = [
  {
    num: '01',
    title: 'Create Your Protocol',
    desc: 'Select from 50+ peptides, set dosing schedules, and build a personalized stack tailored to your goals.',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>,
  },
  {
    num: '02',
    title: 'Log & Sync Data',
    desc: 'Track doses manually or sync biometrics from Apple Health, Oura, Whoop, and other wearables automatically.',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
  },
  {
    num: '03',
    title: 'Get AI Insights',
    desc: 'Our ML models analyze your data to surface correlations, suggest optimizations, and flag potential issues.',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>,
  },
  {
    num: '04',
    title: 'Optimize & Iterate',
    desc: 'Refine your protocol based on real results. See exactly what works for your unique biology.',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /></svg>,
  },
];

/* ═══════════════════════════════════════════════════
   FAQ Data
   ═══════════════════════════════════════════════════ */
const FAQS = [
  { q: 'What is Peptide AI?', a: 'Peptide AI is an all-in-one app for building peptide protocols, tracking doses, syncing biometric data from wearables, and getting AI-powered insights to optimize your stack.' },
  { q: 'Is it free to join the waitlist?', a: 'Absolutely. Joining the waitlist is 100% free and gives you early access when we launch, along with exclusive pricing and features.' },
  { q: 'What peptides does the app support?', a: 'We currently catalog 50+ peptides including BPC-157, TB-500, Semax, CJC-1295, Ipamorelin, PT-141, AOD-9604, DSIP, Epitalon, and many more. New peptides are added regularly.' },
  { q: 'How does the AI analysis work?', a: 'Our machine learning models analyze your biometric data (HRV, sleep, recovery) alongside your dosing logs to identify correlations, surface optimization opportunities, and provide personalized recommendations.' },
  { q: 'What wearables are supported?', a: 'We integrate with Apple Health, Oura Ring, Whoop, Garmin, and other popular health platforms. More integrations are being added before launch.' },
  { q: 'Is my data secure?', a: 'Yes. All data is encrypted end-to-end. We never sell your data. Your health information stays private and is only used to generate your personal insights.' },
];

/* ═══════════════════════════════════════════════════
   Testimonials Data
   ═══════════════════════════════════════════════════ */
const TESTIMONIALS = [
  { name: 'Dr. Michael R.', role: 'Sports Medicine', quote: 'Finally, a tool that brings data-driven precision to peptide protocols. The AI insights are genuinely impressive.', initials: 'MR' },
  { name: 'Sarah K.', role: 'Biohacker', quote: 'I\'ve been tracking my BPC-157 and TB-500 stack manually for months. This app is going to be a game changer.', initials: 'SK' },
  { name: 'James T.', role: 'Fitness Coach', quote: 'The biometric integration with Oura and Whoop is exactly what my clients need to optimize recovery protocols.', initials: 'JT' },
  { name: 'Dr. Lisa P.', role: 'Functional Medicine', quote: 'Correlating peptide dosing with HRV and sleep data? This is the future of personalized health optimization.', initials: 'LP' },
];

/* ═══════════════════════════════════════════════════
   Spotlight Card Component (mouse-tracking glow)
   ═══════════════════════════════════════════════════ */
function SpotlightCard({ children, className = '', as: Tag = 'div', ...props }) {
  const ref = useRef(null);
  const handleMouse = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
    el.style.setProperty('--spot-y', `${e.clientY - rect.top}px`);
  }, []);
  return (
    <Tag ref={ref} className={`spotlight-card ${className}`} onMouseMove={handleMouse} {...props}>
      <div className="spotlight-card-glow" />
      {children}
    </Tag>
  );
}

/* ═══════════════════════════════════════════════════
   3D Tilt Card Component
   ═══════════════════════════════════════════════════ */
function TiltCard({ children, className = '', intensity = 8 }) {
  const ref = useRef(null);
  const handleMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(600px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg) scale3d(1.02, 1.02, 1.02)`;
  }, [intensity]);
  const handleLeave = useCallback(() => {
    const el = ref.current;
    if (el) el.style.transform = '';
  }, []);
  return (
    <div ref={ref} className={`tilt-card ${className}`} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   FAQ Accordion Item
   ═══════════════════════════════════════════════════ */
function FaqItem({ q, a, isOpen, onToggle }) {
  return (
    <div className={`faq-item ${isOpen ? 'faq-item-open' : ''}`} onClick={onToggle}>
      <div className="faq-q">
        <span>{q}</span>
        <motion.span
          className="faq-chevron"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m6 9 6 6 6-6" /></svg>
        </motion.span>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="faq-a"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <p>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Floating Particles Component
   ═══════════════════════════════════════════════════ */
function FloatingParticles({ count = 20, color = 'rgba(0,229,160,0.15)' }) {
  const particles = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      dur: 15 + Math.random() * 25,
      delay: Math.random() * -20,
    }))
  ).current;

  return (
    <div className="floating-particles" aria-hidden="true">
      {particles.map(p => (
        <span
          key={p.id}
          className="fp"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: color,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Magnetic Button Component
   ═══════════════════════════════════════════════════ */
function MagneticBtn({ children, className = '', href, onClick, type, disabled }) {
  const ref = useRef(null);
  const handleMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
  }, []);
  const handleLeave = useCallback(() => {
    const el = ref.current;
    if (el) el.style.transform = '';
  }, []);
  const Tag = href ? 'a' : 'button';
  return (
    <Tag ref={ref} className={`magnetic-btn ${className}`} href={href} onClick={onClick} type={type} disabled={disabled} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      {children}
    </Tag>
  );
}

/* ═══════════════════════════════════════════════════
   Cursor Trail Effect (desktop only)
   ═══════════════════════════════════════════════════ */
function CursorTrail() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (innerWidth < 780) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = innerWidth, h = innerHeight;
    canvas.width = w;
    canvas.height = h;

    const trail = [];
    const MAX = 25;
    let mx = w / 2, my = h / 2;
    let fid;

    const onResize = () => {
      w = innerWidth; h = innerHeight;
      canvas.width = w; canvas.height = h;
    };
    const onMove = (e) => { mx = e.clientX; my = e.clientY; };
    addEventListener('resize', onResize);
    addEventListener('mousemove', onMove);

    function loop() {
      fid = requestAnimationFrame(loop);
      ctx.clearRect(0, 0, w, h);
      trail.unshift({ x: mx, y: my, life: 1 });
      if (trail.length > MAX) trail.pop();

      for (let i = 0; i < trail.length; i++) {
        const p = trail[i];
        p.life -= 0.035;
        if (p.life <= 0) { trail.splice(i, 1); i--; continue; }
        const r = p.life * 6;
        const alpha = p.life * 0.4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 229, 160, ${alpha})`;
        ctx.fill();

        // Add glow ring
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 229, 160, ${alpha * 0.15})`;
        ctx.fill();
      }
    }
    loop();

    return () => {
      cancelAnimationFrame(fid);
      removeEventListener('resize', onResize);
      removeEventListener('mousemove', onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="cursor-trail-canvas" />;
}

/* ═══════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════ */
export default function CinematicPage() {
  const canvasRef = useRef(null);
  const connectorCanvasRef = useRef(null);
  const spacerRef = useRef(null);
  const panelsRef = useRef([]);
  const heroRef = useRef(null);

  // Waitlist state
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [waitlistCount, setWaitlistCount] = useState(null);
  const [joinCount, setJoinCount] = useState(0);

  // FAQ state
  const [openFaq, setOpenFaq] = useState(null);

  // Testimonial auto-scroll
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => {
      setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  // InView refs for content sections
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-80px' });
  const researchRef = useRef(null);
  const researchInView = useInView(researchRef, { once: true, margin: '-80px' });
  const showcaseRef = useRef(null);
  const showcaseInView = useInView(showcaseRef, { once: true, margin: '-80px' });
  const stepsRef = useRef(null);
  const stepsInView = useInView(stepsRef, { once: true, margin: '-80px' });
  const faqRef = useRef(null);
  const faqInView = useInView(faqRef, { once: true, margin: '-80px' });
  const testimonialRef = useRef(null);
  const testimonialInView = useInView(testimonialRef, { once: true, margin: '-80px' });

  useEffect(() => {
    fetch(`${API_BASE}/api/waitlist/count`)
      .then(r => r.json())
      .then(d => { if (d.count != null) setWaitlistCount(d.count); })
      .catch(() => {});
  }, [joinCount]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch(`${API_BASE}/api/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone: phone || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || "You're on the waitlist!");
        setEmail(''); setPhone('');
        setJoinCount(c => c + 1);
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMessage('Could not connect. Please try again.');
    }
  }, [email, phone]);

  // ── Three.js + scroll-driven panels ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let fid, onScroll, onResize, renderer;
    let cancelled = false;
    const mob = innerWidth < 780;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Set up 2D connector canvas for particle-to-panel lines
    const connCanvas = connectorCanvasRef.current;
    let connCtx = null;
    if (connCanvas) {
      connCanvas.width = innerWidth;
      connCanvas.height = innerHeight;
      connCtx = connCanvas.getContext('2d');
    }

    let current = 0, target = 0, velocity = 0;
    onScroll = () => {
      const spacer = spacerRef.current;
      if (!spacer) return;
      const spacerBottom = spacer.offsetTop + spacer.offsetHeight;
      const scrollable = spacerBottom - innerHeight;
      target = scrollable > 0 ? Math.min(1, Math.max(0, scrollY / scrollable)) : 0;
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const milestones = [0.10, 0.30, 0.50, 0.72];
    const panels = panelsRef.current;

    function updatePanels(p) {
      for (let i = 0; i < panels.length; i++) {
        const el = panels[i];
        if (!el) continue;
        const start = milestones[i];
        const end = milestones[i + 1] || 0.94;
        el.classList.toggle('visible', p >= start && p < end);
      }
    }

    function updateHero(p) {
      const hero = heroRef.current;
      if (!hero) return;
      const o = Math.max(0, 1 - p * 7);
      hero.style.opacity = o;
      hero.style.pointerEvents = o > 0.1 ? 'auto' : 'none';
    }

    let lightFid;
    if (mob) {
      function lightLoop() {
        lightFid = requestAnimationFrame(lightLoop);
        if (reducedMotion) { current = 0; velocity = 0; }
        else {
          velocity += (target - current) * 0.025;
          velocity *= 0.80;
          current += velocity;
          current = Math.max(0, Math.min(1, current));
        }
        const t = current;
        updatePanels(t);
        updateHero(t);
      }
      lightLoop();
    }

    const deferMs = mob ? 1500 : 0;
    const deferTimer = setTimeout(() => {
      if (cancelled) return;

      const imports = mob
        ? [import('three')]
        : [
            import('three'),
            import('three/examples/jsm/postprocessing/EffectComposer.js'),
            import('three/examples/jsm/postprocessing/RenderPass.js'),
            import('three/examples/jsm/postprocessing/UnrealBloomPass.js'),
          ];

      Promise.all(imports).then(([THREE, ...postMods]) => {
        if (cancelled) return;

        if (lightFid) { cancelAnimationFrame(lightFid); lightFid = null; }

        const postFx = mob ? null : {
          EffectComposer: postMods[0].EffectComposer,
          RenderPass: postMods[1].RenderPass,
          UnrealBloomPass: postMods[2].UnrealBloomPass,
        };

        const { scene, camera, renderer: r, composer, keyLight, fillLight, rimLight, cameraPath, dnaGroup, nebulaMat, buildQueue, ctx: sceneCtx, hotspotMats, hotspotYs, connectorData } =
          createScene(canvas, THREE, postFx);
        renderer = r;

        if (mob) {
          canvas.style.opacity = '0';
          canvas.style.transition = 'opacity 0.8s ease';
          requestAnimationFrame(() => { canvas.style.opacity = '1'; });
        }

        onResize = () => {
          camera.aspect = innerWidth / innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(innerWidth, innerHeight);
          if (composer) composer.setSize(innerWidth, innerHeight);
          if (connCanvas) { connCanvas.width = innerWidth; connCanvas.height = innerHeight; }
        };
        addEventListener('resize', onResize);

        const lookAt = new THREE.Vector3();

        function animate() {
          fid = requestAnimationFrame(animate);

          if (buildQueue.length > 0) buildQueue.shift()();

          if (reducedMotion) { current = 0; velocity = 0; }
          else {
            velocity += (target - current) * (mob ? 0.025 : 0.015);
            velocity *= 0.80;
            current += velocity;
            current = Math.max(0, Math.min(1, current));
          }

          const t = current;
          const now = performance.now() * 0.001;

          camera.position.copy(cameraPath.getPoint(t));
          lookAt.set(0, t * -15, 0);

          // Detect active panel for hotspot + zoom effects
          let activePanel = -1;
          for (let i = 0; i < milestones.length; i++) {
            const end = milestones[i + 1] || 0.94;
            if (t >= milestones[i] && t < end) { activePanel = i; break; }
          }

          // Shift lookAt toward active hotspot Y for focused framing
          if (activePanel >= 0 && hotspotYs[activePanel] !== undefined) {
            const hy = hotspotYs[activePanel];
            lookAt.y = lookAt.y * 0.6 + hy * 0.4;
          }
          camera.lookAt(lookAt);

          // Dynamic FOV zoom when panel is active (cinematic close-up)
          const targetFov = activePanel >= 0 ? (mob ? 35 : 50) : (mob ? 50 : 60);
          camera.fov += (targetFov - camera.fov) * 0.04;
          camera.updateProjectionMatrix();

          keyLight.position.copy(camera.position).multiplyScalar(0.8);
          keyLight.intensity = 2.0 + Math.sin(now * 0.4) * 0.4;
          fillLight.intensity = 1.0 + Math.sin(now * 0.25 + 1) * 0.2;
          rimLight.intensity = 0.8 + Math.sin(now * 0.55 + 2) * 0.15;

          // Scroll-driven rotation — scrolling physically spins the helix
          dnaGroup.rotation.y = now * 0.025 + t * Math.PI * 1.5;
          nebulaMat.uniforms.uTime.value = now;

          if (sceneCtx.starMat) sceneCtx.starMat.uniforms.uTime.value = now;

          // Pulse hotspot glow clusters for the active panel
          for (let i = 0; i < hotspotMats.length; i++) {
            const isActive = i === activePanel;
            const targetOp = isActive ? 1.4 + Math.sin(now * 3.0) * 0.4 : 0.05;
            const mat = hotspotMats[i];
            mat.uniforms.uOpacity.value += (targetOp - mat.uniforms.uOpacity.value) * 0.08;
            mat.uniforms.uColor.value.setHex(isActive ? 0x00ffdd : 0x00ff99);
          }

          // ── Connector particles: pull toward hotspot when panel is active ──
          for (let h = 0; h < connectorData.length; h++) {
            const cd = connectorData[h];
            const isActive = h === activePanel;

            // Drifting rest position (gentle oscillation so it looks alive)
            const rx = cd.restPos.x + Math.sin(now * 0.3 + h * 2.0) * 1.5;
            const ry = cd.restPos.y + Math.cos(now * 0.2 + h * 1.5) * 1.0;
            const rz = cd.restPos.z + Math.sin(now * 0.25 + h * 3.0) * 1.5;

            // Lerp toward hotspot when active, back to floating rest when not
            const gx = isActive ? cd.targetPos.x : rx;
            const gy = isActive ? cd.targetPos.y : ry;
            const gz = isActive ? cd.targetPos.z : rz;
            const speed = isActive ? 0.035 : 0.018;
            cd.currentPos.x += (gx - cd.currentPos.x) * speed;
            cd.currentPos.y += (gy - cd.currentPos.y) * speed;
            cd.currentPos.z += (gz - cd.currentPos.z) * speed;

            // Update particle cluster positions
            const posAttr = cd.geo.getAttribute('position');
            for (let i = 0; i < posAttr.count; i++) {
              posAttr.setXYZ(i,
                cd.currentPos.x + cd.offsets[i * 3],
                cd.currentPos.y + cd.offsets[i * 3 + 1],
                cd.currentPos.z + cd.offsets[i * 3 + 2],
              );
            }
            posAttr.needsUpdate = true;

            // Brightness pulse
            const tOp = isActive ? 2.5 + Math.sin(now * 2.5) * 0.5 : 0.3;
            cd.mat.uniforms.uOpacity.value += (tOp - cd.mat.uniforms.uOpacity.value) * 0.06;
            cd.mat.uniforms.uColor.value.setHex(isActive ? 0x88ffee : 0x44ffbb);
          }

          updatePanels(t);
          updateHero(t);

          if (composer) composer.render();
          else renderer.render(scene, camera);

          // ── Draw 2D connector lines from particles to panels ──
          if (connCtx && connectorData.length > 0) {
            connCtx.clearRect(0, 0, innerWidth, innerHeight);
            scene.updateMatrixWorld();
            const _proj = new THREE.Vector3();

            for (let h = 0; h < connectorData.length; h++) {
              const cd = connectorData[h];
              const panel = panels[h];
              if (!panel || !panel.classList.contains('visible')) continue;

              const op = Math.max(0, (cd.mat.uniforms.uOpacity.value - 0.4) / 2.5);
              if (op < 0.01) continue;

              // Project 3D position → screen coords
              _proj.copy(cd.currentPos).applyMatrix4(dnaGroup.matrixWorld).project(camera);
              const sx = (_proj.x * 0.5 + 0.5) * innerWidth;
              const sy = (-_proj.y * 0.5 + 0.5) * innerHeight;

              // Panel edge position
              const rect = panel.getBoundingClientRect();
              const px = rect.left + 4;
              const py = rect.top + rect.height * 0.3;

              // Bezier control point for organic curve
              const cpx = sx + (px - sx) * 0.5;
              const cpy = Math.min(sy, py) - 40;

              // Outer glow
              connCtx.beginPath();
              connCtx.moveTo(sx, sy);
              connCtx.quadraticCurveTo(cpx, cpy, px, py);
              connCtx.strokeStyle = `rgba(0,255,221,${op * 0.06})`;
              connCtx.lineWidth = 20;
              connCtx.lineCap = 'round';
              connCtx.stroke();

              // Mid glow
              connCtx.beginPath();
              connCtx.moveTo(sx, sy);
              connCtx.quadraticCurveTo(cpx, cpy, px, py);
              connCtx.strokeStyle = `rgba(0,255,221,${op * 0.15})`;
              connCtx.lineWidth = 4;
              connCtx.stroke();

              // Core line with gradient
              const grad = connCtx.createLinearGradient(sx, sy, px, py);
              grad.addColorStop(0, `rgba(0,255,221,${op * 0.5})`);
              grad.addColorStop(0.6, `rgba(0,255,221,${op * 0.18})`);
              grad.addColorStop(1, `rgba(0,229,160,${op * 0.04})`);
              connCtx.beginPath();
              connCtx.moveTo(sx, sy);
              connCtx.quadraticCurveTo(cpx, cpy, px, py);
              connCtx.strokeStyle = grad;
              connCtx.lineWidth = 1.5;
              connCtx.stroke();

              // Bright pulsing dot at particle
              const pulseR = 4 + Math.sin(now * 3) * 2;
              connCtx.beginPath();
              connCtx.arc(sx, sy, pulseR, 0, Math.PI * 2);
              connCtx.fillStyle = `rgba(100,255,238,${op * 0.7})`;
              connCtx.fill();

              // Soft glow ring
              connCtx.beginPath();
              connCtx.arc(sx, sy, 14, 0, Math.PI * 2);
              connCtx.fillStyle = `rgba(0,255,221,${op * 0.08})`;
              connCtx.fill();
            }
          }
        }
        animate();
      });
    }, deferMs);

    return () => {
      cancelled = true;
      clearTimeout(deferTimer);
      if (lightFid) cancelAnimationFrame(lightFid);
      if (fid) cancelAnimationFrame(fid);
      if (onScroll) removeEventListener('scroll', onScroll);
      if (onResize) removeEventListener('resize', onResize);
      if (renderer) renderer.dispose();
    };
  }, []);

  return (
    <main className="cinematic-world">
      {/* Cursor trail effect */}
      <CursorTrail />

      {/* ═══ PHASE 1: Cinematic DNA Scroll ═══ */}
      <div className="cinematic-scroll-spacer" ref={spacerRef}>
        <div id="top" style={{ position: 'absolute', top: 0 }} />
        <div id="features" style={{ position: 'absolute', top: '10%' }} />
      </div>

      <div className="cinematic-canvas-wrap">
        <canvas ref={canvasRef} />
        <div className="cinematic-noise" />
      </div>
      <canvas ref={connectorCanvasRef} className="connector-canvas" />

      {/* ── Hero Overlay ── */}
      <div className="cinematic-hero" ref={heroRef}>
        <div className="hero-badge">AI-Powered Peptide Tracking</div>
        <h1 className="hero-headline">
          <span className="hw" style={{ animationDelay: '0.2s' }}>Optimize</span>{' '}
          <span className="hw" style={{ animationDelay: '0.35s' }}>Your</span>
          <br />
          <span className="hw accent" style={{ animationDelay: '0.5s' }}>Peptide</span>{' '}
          <span className="hw accent" style={{ animationDelay: '0.65s' }}>Stack</span>
        </h1>
        <p className="hero-sub">
          Build protocols, track doses, and let AI surface the insights
          that show exactly how your stack is performing.
        </p>
      </div>

      {/* ── Scroll cue (outside hero so position:fixed is relative to viewport, not transformed parent) ── */}
      <div className="hero-scroll-cue" style={{ opacity: heroRef.current ? undefined : 0 }}>
        <span>Scroll to explore</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>

      {/* ── Panel 1: Build ── */}
      <div className="cinematic-panel" ref={el => (panelsRef.current[0] = el)}>
        <span className="panel-step">01</span>
        <h2>Build your peptide stack</h2>
        <p>Design personalized protocols with precise dosing schedules. BPC-157, TB-500, Semax — all tracked in one place.</p>
        <img className="panel-preview" src="/assets/screen1.png" alt="Stack tracking" loading="lazy" />
      </div>

      {/* ── Panel 2: Monitor ── */}
      <div className="cinematic-panel" ref={el => (panelsRef.current[1] = el)}>
        <span className="panel-step">02</span>
        <h2>Monitor your optimization</h2>
        <p>Watch HRV trends, sleep quality, and recovery metrics evolve as your protocol progresses.</p>
        <img className="panel-preview" src="/assets/screen2.png" alt="Dashboard" loading="lazy" />
      </div>

      {/* ── Panel 3: Insights ── */}
      <div className="cinematic-panel" ref={el => (panelsRef.current[2] = el)}>
        <span className="panel-step">03</span>
        <h2>AI-powered insights</h2>
        <p>Get personalized analysis showing exactly how your stack performs — backed entirely by your own biometric data.</p>
        <img className="panel-preview" src="/assets/screen3.png" alt="AI Insights" loading="lazy" />
      </div>

      {/* ── Panel 4: Quick CTA ── */}
      <div className="cinematic-panel cinematic-panel-cta" ref={el => (panelsRef.current[3] = el)}>
        <span className="panel-step">04</span>
        <h2>Your biology is your data.</h2>
        <p>Be first in line when we launch.</p>
        <MagneticBtn className="panel-cta-btn" href="#waitlist">Join the Waitlist</MagneticBtn>
      </div>

      {/* ═══ PHASE 2: Rich Content (normal scroll) ═══ */}
      <div className="content-below">

        {/* ── Feature Ticker ── */}
        <div className="cine-ticker-wrap">
          <div className="cine-ticker-fade cine-ticker-fade-left" />
          <div className="cine-ticker-fade cine-ticker-fade-right" />
          <div className="cine-ticker-row">
            <div className="cine-ticker-track cine-ticker-left">
              {[...TICKER1, ...TICKER1].map((tag, i) => (
                <span key={i} className={`cine-ticker-tag${ACCENTS.has(tag) ? ' cine-ticker-accent' : ''}`}>{tag}</span>
              ))}
            </div>
          </div>
          <div className="cine-ticker-row">
            <div className="cine-ticker-track cine-ticker-right">
              {[...TICKER2, ...TICKER2].map((tag, i) => (
                <span key={i} className={`cine-ticker-tag${ACCENTS.has(tag) ? ' cine-ticker-accent' : ''}`}>{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── How It Works ── */}
        <section className="cine-steps" ref={stepsRef}>
          <FloatingParticles count={15} />
          <div className="cine-section-header">
            <div className="cine-eyebrow">How It Works</div>
            <h2>Four steps to a <span className="accent">smarter protocol.</span></h2>
          </div>
          <div className="cine-steps-grid">
            {STEPS.map((step, i) => (
              <motion.div
                key={i}
                className="cine-step-card"
                initial={{ opacity: 0, y: 40 }}
                animate={stepsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="cine-step-num">{step.num}</div>
                <div className="cine-step-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
                {i < STEPS.length - 1 && <div className="cine-step-connector" />}
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── App Showcase ── */}
        <section className="cine-showcase" ref={showcaseRef}>
          <FloatingParticles count={10} color="rgba(0,180,216,0.12)" />
          <div className="cine-section-header">
            <div className="cine-eyebrow">See It In Action</div>
            <h2>Track every metric. <span className="accent">See real results.</span></h2>
          </div>
          <motion.div
            className="cine-showcase-screens"
            initial={{ opacity: 0, y: 40 }}
            animate={showcaseInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="cine-phone">
              <img src="/assets/screen1.png" alt="Stack screen" loading="lazy" />
            </div>
            <div className="cine-phone cine-phone-center">
              <img src="/assets/screen2.png" alt="Dashboard screen" loading="lazy" />
            </div>
            <div className="cine-phone">
              <img src="/assets/screen3.png" alt="Insights screen" loading="lazy" />
            </div>
          </motion.div>
        </section>

        {/* ── Stats ── */}
        <section className="cine-stats" ref={statsRef}>
          <FloatingParticles count={12} />
          <div className="cine-section-header">
            <div className="cine-eyebrow">By The Numbers</div>
            <h2>Grounded in <span className="accent">real research.</span></h2>
          </div>
          <div className="cine-stats-grid">
            {STATS.map((s, i) => (
              <TiltCard key={i} className="cine-stat-card-wrap">
                <SpotlightCard className="cine-stat-card">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={statsInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="cine-stat-icon">{STAT_ICONS[s.icon]}</div>
                    <AnimatedNum end={s.end} suffix={s.suffix} decimal={s.decimal} star={s.star} trigger={statsInView} />
                    <div className="cine-stat-label">{s.label}</div>
                  </motion.div>
                </SpotlightCard>
              </TiltCard>
            ))}
          </div>
        </section>

        {/* ── Research / Science ── */}
        <section className="cine-research" ref={researchRef}>
          <FloatingParticles count={12} color="rgba(0,229,160,0.1)" />
          <div className="cine-section-header">
            <div className="cine-eyebrow">Backed By Science</div>
            <h2>Research-grade <span className="accent">protocol intelligence.</span></h2>
            <p className="cine-section-sub">Every recommendation is grounded in peer-reviewed literature and your own biometric data — never guesswork.</p>
          </div>
          <div className="cine-research-grid">
            {RESEARCH.map((item, i) => (
              <TiltCard key={i} className="cine-research-card-wrap">
                <SpotlightCard className="cine-research-card">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={researchInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="cine-research-icon">{item.icon}</div>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </motion.div>
                </SpotlightCard>
              </TiltCard>
            ))}
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="cine-testimonials" ref={testimonialRef}>
          <FloatingParticles count={10} color="rgba(0,229,160,0.08)" />
          <div className="cine-section-header">
            <div className="cine-eyebrow">What People Are Saying</div>
            <h2>Trusted by <span className="accent">health optimizers.</span></h2>
          </div>
          <div className="cine-testimonial-carousel">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                className="cine-testimonial-card"
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="cine-testimonial-quote">
                  <svg className="cine-quote-mark" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" opacity="0.2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" /><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" /></svg>
                  <p>{TESTIMONIALS[activeTestimonial].quote}</p>
                </div>
                <div className="cine-testimonial-author">
                  <div className="cine-testimonial-avatar">{TESTIMONIALS[activeTestimonial].initials}</div>
                  <div>
                    <div className="cine-testimonial-name">{TESTIMONIALS[activeTestimonial].name}</div>
                    <div className="cine-testimonial-role">{TESTIMONIALS[activeTestimonial].role}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="cine-testimonial-dots">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  className={`cine-testimonial-dot ${i === activeTestimonial ? 'active' : ''}`}
                  onClick={() => setActiveTestimonial(i)}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="cine-faq" ref={faqRef}>
          <div className="cine-section-header">
            <div className="cine-eyebrow">FAQ</div>
            <h2>Got <span className="accent">questions?</span></h2>
          </div>
          <motion.div
            className="cine-faq-list"
            initial={{ opacity: 0, y: 30 }}
            animate={faqInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {FAQS.map((faq, i) => (
              <FaqItem
                key={i}
                q={faq.q}
                a={faq.a}
                isOpen={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </motion.div>
        </section>

        {/* ── Final CTA / Waitlist ── */}
        <section className="cine-final" id="waitlist">
          <div className="cine-final-glow" />
          <FloatingParticles count={18} />
          <div className="cine-final-inner">
            <div className="cine-eyebrow">Launching Soon</div>
            <h2>The smarter way to run your <span className="accent">protocol.</span></h2>
            <p>Peptide AI combines protocol management, biometric tracking, and AI insights in one clean app. Join the waitlist to be first in.</p>

            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div
                  key="ok"
                  className="cine-final-success"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="cine-final-check">
                    <motion.svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <motion.path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8 }} />
                      <motion.polyline points="22 4 12 14.01 9 11.01" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.6 }} />
                    </motion.svg>
                  </div>
                  <p>{message}</p>
                </motion.div>
              ) : (
                <motion.form key="form" className="cine-final-form glow-border-wrap" onSubmit={handleSubmit} initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="glow-border" />
                  <div className="cine-final-form-inner">
                    <input className="cine-final-input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required disabled={status === 'loading'} />
                    <input className="cine-final-input" type="tel" placeholder="Phone (optional — for SMS)" value={phone} onChange={e => setPhone(e.target.value)} disabled={status === 'loading'} />
                    <MagneticBtn className="cine-final-btn" type="submit" disabled={status === 'loading'}>
                      {status === 'loading' ? 'Joining...' : 'Join the Waitlist'}
                    </MagneticBtn>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {status === 'error' && <p className="cine-final-error">{message}</p>}

            {waitlistCount > 0 && (
              <div className="cine-final-proof">
                Join <strong>{Math.max(500, waitlistCount).toLocaleString()}+</strong> on the waitlist
              </div>
            )}

            <div className="cine-trust-badges">
              <div className="cine-trust-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                <span>Data Encrypted</span>
              </div>
              <div className="cine-trust-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                <span>No Spam</span>
              </div>
              <div className="cine-trust-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                <span>Instant Alerts</span>
              </div>
            </div>

            <div className="cine-social-links">
              <a href="https://www.tiktok.com/@peptideai.co" target="_blank" rel="noopener" aria-label="TikTok">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.87a8.18 8.18 0 0 0 4.78 1.52V6.93a4.85 4.85 0 0 1-1.01-.24z" /></svg>
              </a>
              <a href="https://www.instagram.com/peptideai.co" target="_blank" rel="noopener" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" /></svg>
              </a>
              <a href="https://twitter.com/PeptideAI" target="_blank" rel="noopener" aria-label="Twitter / X">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.734-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" /></svg>
              </a>
            </div>

            <a className="cine-backtop" href="#top">&#8593; Back to top</a>
          </div>
        </section>
      </div>
    </main>
  );
}
