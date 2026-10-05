import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { setHovered } from './paint';

export interface ViewerOptions { fov?: number; target?: [number, number, number]; pos?: [number, number, number]; minD?: number; maxD?: number }

/* One WebGL canvas with orbit controls, a car group, picking and a render loop that only runs while it is needed. */
export class Viewer {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  readonly controls: OrbitControls;
  readonly car = new THREE.Group();
  readonly parts: Record<string, THREE.Mesh[]> = {};
  liftOnNarrow = false;
  /** called every frame before rendering */
  onFrame: ((now: number) => void) | null = null;
  private pickables: THREE.Object3D[] = [];
  private raf = 0;
  private running = false;
  private ro: ResizeObserver;
  private cleanups: (() => void)[] = [];

  constructor(readonly host: HTMLElement, { fov = 35, target = [0, .68, 0], pos = [5.6, 3.1, 5.4], minD = 4.2, maxD = 11 }: ViewerOptions = {}) {
    const renderer = this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    // phones: 1.5x is visually the same and draws ~45% fewer pixels than 2x
    const maxDpr = matchMedia('(pointer: coarse)').matches ? 1.5 : 2;
    renderer.setPixelRatio(Math.min(devicePixelRatio, maxDpr)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // nothing in the scenes moves except the camera: shadows are rendered once, not every frame
    renderer.shadowMap.autoUpdate = false; renderer.shadowMap.needsUpdate = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    host.prepend(renderer.domElement);
    this.camera = new THREE.PerspectiveCamera(fov, 4 / 3, .1, 100); this.camera.position.set(...pos);
    const controls = this.controls = new OrbitControls(this.camera, renderer.domElement);
    controls.target.set(...target); controls.enableDamping = true; controls.enablePan = false;
    controls.minDistance = minD; controls.maxDistance = maxD; controls.maxPolarAngle = Math.PI * .48;
    this.scene.add(this.car);
    this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(host); this.resize();
  }

  resize() {
    const r = this.host.getBoundingClientRect(); if (!r.width || !r.height) return;
    const { renderer, camera } = this;
    renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height;
    if (this.liftOnNarrow && r.width < 860) { camera.fov = 50; camera.setViewOffset(r.width, r.height, 0, r.height * .2, r.width, r.height); }
    else { if (this.liftOnNarrow) camera.fov = 36; camera.clearViewOffset(); }
    camera.updateProjectionMatrix();
  }

  addModel(template: THREE.Object3D) {
    const m = template.clone(true); this.car.add(m);
    m.traverse(o => {
      if (!(o instanceof THREE.Mesh)) return; this.pickables.push(o);
      if (o.userData.id) (this.parts[o.userData.id] ||= []).push(o);
    });
    this.renderer.shadowMap.needsUpdate = true;
    return m;
  }

  pick(e: PointerEvent): string | null {
    const r = this.renderer.domElement.getBoundingClientRect(), ray = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), this.camera);
    const hit = ray.intersectObjects(this.pickables, false)[0];
    return hit && hit.object.userData.id ? hit.object.userData.id : null;
  }

  /** tap/click a part → cb(id); mouse hover highlights it and (optionally) describes it in a tooltip */
  onPart(cb: (id: string) => void, tip?: { el: HTMLElement; describe: (id: string) => { name: string; detail: string } }) {
    let downAt: [number, number] | null = null; const el = this.renderer.domElement;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return; const id = this.pick(e);
      setHovered(id); el.classList.toggle('hovering', !!id);
      if (tip) {
        if (id) {
          const d = tip.describe(id), r = this.host.getBoundingClientRect(), b = document.createElement('b'); b.textContent = d.name;
          tip.el.replaceChildren(b, ' · ' + d.detail); tip.el.hidden = false;
          tip.el.style.left = (e.clientX - r.left) + 'px'; tip.el.style.top = (e.clientY - r.top) + 'px';
        } else tip.el.hidden = true;
      }
    };
    const leave = () => { if (tip) tip.el.hidden = true; setHovered(null); };
    const down = (e: PointerEvent) => { downAt = [e.clientX, e.clientY]; };
    const up = (e: PointerEvent) => {
      if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 6) return;
      const id = this.pick(e); if (id) cb(id);
    };
    el.addEventListener('pointermove', move); el.addEventListener('pointerleave', leave);
    el.addEventListener('pointerdown', down); el.addEventListener('pointerup', up);
    this.cleanups.push(() => {
      el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave);
      el.removeEventListener('pointerdown', down); el.removeEventListener('pointerup', up);
    });
  }

  /** run or pause the render loop (paused = zero GPU work) */
  setRunning(on: boolean) {
    if (on === this.running) return; this.running = on;
    if (!on) { cancelAnimationFrame(this.raf); return; }
    const loop = (now: number) => {
      this.onFrame?.(now); this.controls.update(); this.renderer.render(this.scene, this.camera);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  dispose() {
    this.setRunning(false); this.ro.disconnect(); this.cleanups.forEach(f => f()); this.controls.dispose();
    setHovered(null);
    // the car's geometry and materials are shared with the cached template: only free what this scene created
    const shared = new Set<THREE.Object3D>(); this.car.traverse(o => shared.add(o));
    this.scene.traverse(o => {
      if (shared.has(o) || !(o instanceof THREE.Mesh)) return;
      o.geometry.dispose();
      for (const m of ([] as THREE.Material[]).concat(o.material)) {
        for (const v of Object.values(m)) if (v instanceof THREE.Texture) v.dispose();
        m.dispose();
      }
    });
    this.renderer.dispose(); this.renderer.forceContextLoss(); this.renderer.domElement.remove();
  }
}

export function studioLights(scene: THREE.Scene, shadowSize = 2048) {
  scene.add(new THREE.HemisphereLight(0xfff4e0, 0x2a2630, 1.1));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2); sun.position.set(4, 7, 3); sun.castShadow = true;
  sun.shadow.mapSize.set(shadowSize, shadowSize); sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.03;
  Object.assign(sun.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4 }); scene.add(sun);
  const rim = new THREE.DirectionalLight(0xff6a5a, .8); rim.position.set(-5, 2, -4); scene.add(rim);
}

export function checkerTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 32; const g = c.getContext('2d')!;
  for (let x = 0; x < 16; x++) for (let y = 0; y < 2; y++) { g.fillStyle = (x + y) % 2 ? '#ece6d6' : '#141214'; g.fillRect(x * 16, y * 16, 16, 16); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
