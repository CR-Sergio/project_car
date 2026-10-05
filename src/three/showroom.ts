import * as THREE from 'three';
import { REDUCED } from '../lib/motion';
import { loadPalio } from './model';
import { paintAll, pulseSelected, setNames, setSold } from './paint';
import { Viewer, checkerTexture, studioLights } from './viewer';
import type { SoldMap } from '../data/parts';

export interface ShowroomHandle { setSold: (s: SoldMap) => void; setNames: (n: string[]) => void; dispose: () => void }
interface Opts {
  onPart: (id: string) => void;
  tip: { el: HTMLElement; describe: (id: string) => { name: string; detail: string } };
  onLoaded: () => void;
  onError: () => void;
}

/** The turntable on the landing page. Only draws while it is on screen and the tab is visible. */
export function createShowroom(host: HTMLElement, sold: SoldMap, names: string[], { onPart, tip, onLoaded, onError }: Opts): ShowroomHandle {
  setSold(sold); setNames(names);
  const show = new Viewer(host);
  studioLights(show.scene, 1024);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(4.2, 48), new THREE.MeshStandardMaterial({ color: 0x1d1b21, roughness: 1 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; show.scene.add(floor);
  const ring = new THREE.Mesh(new THREE.RingGeometry(4.05, 4.2, 64), new THREE.MeshBasicMaterial({ color: 0xf1c232 }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = .002; show.scene.add(ring);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(3.2, .4), new THREE.MeshBasicMaterial({ map: checkerTexture(), transparent: true, opacity: .55 }));
  m.rotation.x = -Math.PI / 2; m.rotation.z = Math.PI / 2; m.position.set(2.9, .003, 0); show.scene.add(m);
  show.controls.autoRotate = !REDUCED; show.controls.autoRotateSpeed = .9;
  show.controls.enableZoom = false;
  // let a finger swipe up/down scroll the page; sideways drags still spin the car, taps still pick a part
  show.renderer.domElement.style.touchAction = 'pan-y';
  show.onPart(onPart, tip);
  let tick = 0; show.onFrame = () => { tick += .05; pulseSelected(tick); };

  let disposed = false;
  loadPalio().then(t => { if (disposed) return; show.addModel(t); paintAll(); onLoaded(); }, () => { if (!disposed) onError(); });
  document.fonts?.ready.then(() => { if (!disposed) paintAll(); });

  // draw only while visible
  let onScreen = false;
  const sync = () => show.setRunning(onScreen && document.visibilityState === 'visible');
  const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; sync(); }); io.observe(host);
  document.addEventListener('visibilitychange', sync);

  return {
    setSold, setNames,
    dispose() { disposed = true; io.disconnect(); document.removeEventListener('visibilitychange', sync); show.dispose(); },
  };
}

export { prefetchPalio as prefetch } from './model';
