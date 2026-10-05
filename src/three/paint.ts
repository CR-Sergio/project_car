import * as THREE from 'three';
import { NAMES_CAPACITY, PALIO_ASPECT, PARTS, PART_BY_ID, type SoldMap } from '../data/parts';
import { brandCanvas } from '../lib/brandCanvas';
import { namesCanvas } from '../lib/namesCanvas';

/* Shared materials: the showroom and the garage paint the very same parts, so a sale shows up in both. */
export const MATS: Record<string, THREE.MeshStandardMaterial> = {
  body:      new THREE.MeshStandardMaterial({color:0x7a7680, roughness:.38, metalness:.45}),
  glass:     new THREE.MeshStandardMaterial({color:0x0d1016, roughness:.06, metalness:.85}),
  dark:      new THREE.MeshStandardMaterial({color:0x17161a, roughness:.85}),
  chrome:    new THREE.MeshStandardMaterial({color:0xc8c5cc, roughness:.25, metalness:.9}),
  headlight: new THREE.MeshStandardMaterial({color:0xfff4d6, emissive:0xfff0c0, emissiveIntensity:.6, roughness:.2}),
  taillight: new THREE.MeshStandardMaterial({color:0xc4141c, emissive:0xe2252e, emissiveIntensity:.55, roughness:.3}),
  trim:      new THREE.MeshStandardMaterial({color:0x56545a, roughness:.6}),
  signal:    new THREE.MeshStandardMaterial({color:0xf0a020, emissive:0xf0a020, emissiveIntensity:.35}),
  grille:    new THREE.MeshStandardMaterial({color:0x232226, roughness:.7, metalness:.3}),
};
Object.values(MATS).forEach(m => (m.side = THREE.DoubleSide));

const FREE = new THREE.Color(0xddd6c6), SEL = new THREE.Color(0xf1c232), GLASS_FREE = new THREE.Color(0x3b4250);
interface Panel { glass: boolean; free: THREE.Color; mat: THREE.MeshStandardMaterial; aspect: number }
export const panels: Record<string, Panel> = {};
for (const p of PARTS) panels[p.id] = {
  glass: !!p.glass, free: p.glass ? GLASS_FREE : FREE, aspect: PALIO_ASPECT[p.id] || 2,
  mat: new THREE.MeshStandardMaterial({color:(p.glass?GLASS_FREE:FREE).clone(), roughness:p.glass?.08:.42, metalness:p.glass?.75:.15, side:THREE.DoubleSide}),
};

/* what the parts show: sales, the part picked in the garage, the part under the mouse */
const state: { sold: SoldMap; names: string[]; selected: string | null; hovered: string | null } = { sold: {}, names: [], selected: null, hovered: null };
export const paintState = state as Readonly<typeof state>;

export function paint(id: string) {
  const P = panels[id]; if (!P) return; const m = P.mat, s = state.sold[id];
  if (m.map) { m.map.dispose(); m.map = null; }
  if (PART_BY_ID[id]?.kind === 'names') {
    // the supporters' roof always shows its sheet of names (hi-res: the letters are small)
    const a = Math.max(.5, Math.min(7, P.aspect)), tex = new THREE.CanvasTexture(namesCanvas(state.names, NAMES_CAPACITY, 1024, Math.round(1024 / a)));
    tex.colorSpace = THREE.SRGBColorSpace; tex.flipY = false; tex.anisotropy = 8; m.map = tex; m.color.set(0xffffff);
  } else if (s) {
    const a = Math.max(.5, Math.min(7, P.aspect)); const tex = new THREE.CanvasTexture(brandCanvas(s, 512, Math.round(512 / a)));
    tex.colorSpace = THREE.SRGBColorSpace; tex.flipY = false; m.map = tex; m.color.set(0xffffff);
  } else m.color.copy(id === state.selected ? SEL : P.free);
  if (P.glass) { m.metalness = s || id === state.selected ? .15 : .75; m.roughness = s || id === state.selected ? .45 : .08; }
  m.emissive.set(id === state.selected ? 0x5a4300 : (id === state.hovered ? 0x2a2a2a : 0x000000)); m.emissiveIntensity = 1; m.needsUpdate = true;
}
export const paintAll = () => PARTS.forEach(p => paint(p.id));

export function setSold(sold: SoldMap) {
  const changed = PARTS.filter(p => state.sold[p.id] !== sold[p.id]).map(p => p.id);
  state.sold = sold; changed.forEach(paint);
}
export function setNames(names: string[]) {
  if (names.length === state.names.length && names.every((n, i) => n === state.names[i])) return;
  state.names = names; PARTS.filter(p => p.kind === 'names').forEach(p => paint(p.id));
}
export function setSelected(id: string | null) {
  const prev = state.selected; if (prev === id) return;
  state.selected = id; if (prev) paint(prev); if (id) paint(id);
}
export function setHovered(id: string | null) {
  const prev = state.hovered; if (prev === id) return;
  state.hovered = id; if (prev) paint(prev); if (id) paint(id);
}
/** the picked part breathes while it is still for sale */
export function pulseSelected(tick: number) {
  const id = state.selected;
  if (id && !state.sold[id] && panels[id]) panels[id].mat.emissiveIntensity = .7 + .3 * Math.sin(tick * 2);
}
