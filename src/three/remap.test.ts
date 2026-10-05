import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { ALIASES, rearWindowOf, sideUVs, splitByTriangle } from './remap';
import { PART_BY_ID } from '../data/parts';

describe('model remap for the current price list', () => {
  it('sells the quarter panels with the rear doors', () => {
    for (const id of Object.values(ALIASES)) expect(PART_BY_ID[id]).toBeDefined();
    expect(PART_BY_ID['costado-i']).toBeUndefined();
  });
  it('finds the rear door windows on each side, not the front ones or the windshield', () => {
    expect(rearWindowOf(-0.8, 1.2, -0.7)).toBe('vidrio-ti');
    expect(rearWindowOf(-1.15, 1.2, 0.7)).toBe('vidrio-td');
    expect(rearWindowOf(0.1, 1.2, 0.7)).toBeNull();   // front door window
    expect(rearWindowOf(0.7, 1.2, 0)).toBeNull();     // windshield
  });
  it('splits triangles into compact geometries', () => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([0,0,0, 1,0,0, 0,1,0,  5,0,0, 6,0,0, 5,1,0], 3));
    g.setIndex([0, 1, 2, 3, 4, 5]);
    const parts = splitByTriangle(g, cx => (cx > 3 ? 'far' : null));
    expect(parts.get('')!.getAttribute('position').count).toBe(3);
    expect(parts.get('far')!.getAttribute('position').count).toBe(3);
  });
  it('projects one logo across several side meshes, reading front→back on both sides', () => {
    const quad = (x0: number, x1: number, z: number) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute([x0,0,z, x1,0,z, x1,1,z, x0,1,z], 3)); return g;
    };
    const left = [quad(0, 1, -1), quad(-1, 0, -1)], aspect = sideUVs(left);
    expect(aspect).toBe(2);
    expect(left[0].getAttribute('uv').getX(1)).toBe(0);   // front edge (x = 1) starts the logo on the left side
    const right = [quad(0, 1, 1)]; sideUVs(right);
    expect(right[0].getAttribute('uv').getX(0)).toBe(0);  // right side: seen from outside the back is on the left, so the logo starts there
  });
});
