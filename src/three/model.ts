import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MODEL_URL } from '../data/config';
import { MATS, panels } from './paint';
import { ALIASES, rearWindowOf, sideUVs, splitByTriangle } from './remap';

/* The Palio is downloaded and prepared once per visit, then cloned into each viewer
   (clones share geometry and materials, so the second viewer costs almost nothing). */
let pending: Promise<THREE.Group> | null = null;

function adapt(template: THREE.Group) {
  const meshes: THREE.Mesh[] = [];
  template.traverse(o => { if (o instanceof THREE.Mesh) meshes.push(o); });

  // cut the rear door windows out of the glass
  const glass = meshes.find(m => m.name === 'glass');
  if (glass) {
    const parts = splitByTriangle(glass.geometry, rearWindowOf);
    glass.geometry.dispose(); glass.geometry = parts.get('') ?? new THREE.BufferGeometry();
    for (const [id, geo] of parts) {
      if (!id) continue;
      const m = new THREE.Mesh(geo); m.name = id; glass.parent!.add(m); meshes.push(m);
    }
  }

  // tag every mesh with the part it belongs to
  for (const o of meshes) {
    o.geometry.computeVertexNormals();
    const name = ALIASES[o.name] ?? o.name;
    const key = Object.keys(panels).find(k => name === k) || Object.keys(MATS).find(k => name === k) || name.replace(/[_.]\d+$/, '');
    if (panels[key]) { o.material = panels[key].mat; o.userData.id = key; } else o.material = MATS[key] || MATS.body;
    o.castShadow = true; o.receiveShadow = true;
  }

  // parts made of several meshes (door + quarter panel) or cut from the glass get one shared logo projection
  for (const id of ['puerta-ti', 'puerta-td', 'vidrio-ti', 'vidrio-td']) {
    const geos = meshes.filter(m => m.userData.id === id).map(m => m.geometry);
    if (geos.length && panels[id]) panels[id].aspect = sideUVs(geos);
  }
}

export function loadPalio(): Promise<THREE.Group> {
  pending ??= new GLTFLoader().loadAsync(MODEL_URL).then(gltf => { adapt(gltf.scene); return gltf.scene; })
    .catch(err => { pending = null; throw err; });
  return pending;
}

/** start the download early (e.g. when the showroom is about to scroll into view) */
export const prefetchPalio = () => { loadPalio().catch(() => {}); };
