import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MODEL_URL } from '../data/config';
import { MATS, panels } from './paint';

/* The Palio is downloaded and prepared once per visit, then cloned into each viewer
   (clones share geometry and materials, so the second viewer costs almost nothing). */
let pending: Promise<THREE.Group> | null = null;

export function loadPalio(): Promise<THREE.Group> {
  pending ??= new GLTFLoader().loadAsync(MODEL_URL).then(gltf => {
    const template = gltf.scene;
    template.traverse(o => {
      if (!(o instanceof THREE.Mesh)) return;
      o.geometry.computeVertexNormals();
      const key = Object.keys(panels).find(k => o.name === k) || Object.keys(MATS).find(k => o.name === k) || o.name.replace(/[_.]\d+$/, '');
      if (panels[key]) { o.material = panels[key].mat; o.userData.id = key; } else o.material = MATS[key] || MATS.body;
      o.castShadow = true; o.receiveShadow = true;
    });
    return template;
  }).catch(err => { pending = null; throw err; });
  return pending;
}

/** start the download early (e.g. when the showroom is about to scroll into view) */
export const prefetchPalio = () => { loadPalio().catch(() => {}); };
