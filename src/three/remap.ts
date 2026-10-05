import * as THREE from 'three';

/* The Palio .glb was cut for the first price list. These tweaks adapt it to the current one without
   re-exporting the model:
   - the rear quarter panels (costado-i / costado-d) are sold together with the rear doors;
   - the rear door windows live inside the single "glass" mesh and are cut out as their own parts. */

/** mesh name in the .glb → part it belongs to */
export const ALIASES: Record<string, string> = { 'costado-i': 'puerta-ti', 'costado-d': 'puerta-td' };

/** which glass triangles are the rear door windows (incl. the small fixed glass at the back of each door);
    the car points to +x, its left side is −z */
export function rearWindowOf(cx: number, cy: number, cz: number): 'vidrio-ti' | 'vidrio-td' | null {
  if (cx < -1.35 || cx > -0.38 || cy < 1.0 || Math.abs(cz) < 0.55) return null;
  return cz < 0 ? 'vidrio-ti' : 'vidrio-td';
}

/** split an indexed geometry by triangle; each group gets its own compact geometry */
export function splitByTriangle(geo: THREE.BufferGeometry, classify: (cx: number, cy: number, cz: number) => string | null) {
  const pos = geo.getAttribute('position'), index = geo.getIndex();
  const n = index ? index.count : pos.count, at = (k: number) => (index ? index.getX(k) : k);
  const groups = new Map<string, number[]>();
  for (let k = 0; k < n; k += 3) {
    const a = at(k), b = at(k + 1), c = at(k + 2);
    const key = classify((pos.getX(a) + pos.getX(b) + pos.getX(c)) / 3, (pos.getY(a) + pos.getY(b) + pos.getY(c)) / 3, (pos.getZ(a) + pos.getZ(b) + pos.getZ(c)) / 3) ?? '';
    (groups.get(key) ?? groups.set(key, []).get(key)!).push(a, b, c);
  }
  const out = new Map<string, THREE.BufferGeometry>();
  for (const [key, tri] of groups) {
    const remap = new Map<number, number>(), xyz: number[] = [];
    const idx = tri.map(v => {
      let w = remap.get(v);
      if (w === undefined) { w = remap.size; remap.set(v, w); xyz.push(pos.getX(v), pos.getY(v), pos.getZ(v)); }
      return w;
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(xyz, 3)); g.setIndex(idx);
    out.set(key, g);
  }
  return out;
}

/** one flat UV projection over several side meshes, so a logo spans all of them as a single surface.
    Same orientation as the model's own side panels: reads front→back from outside, top of logo up.
    Returns the width/height ratio of the projected area. */
export function sideUVs(geos: THREE.BufferGeometry[]) {
  const box = new THREE.Box3(); geos.forEach(g => { g.computeBoundingBox(); box.union(g.boundingBox!); });
  const w = box.max.x - box.min.x || 1, h = box.max.y - box.min.y || 1, left = box.max.z + box.min.z < 0;
  for (const g of geos) {
    const pos = g.getAttribute('position'), uv = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i);
      uv[i * 2] = left ? (box.max.x - x) / w : (x - box.min.x) / w;
      uv[i * 2 + 1] = (box.max.y - y) / h;
    }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  }
  return w / h;
}
