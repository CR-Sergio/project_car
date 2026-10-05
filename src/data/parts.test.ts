import { describe, expect, it } from 'vitest';
import { BRAND_PARTS, EXAMPLE_SOLD, NAMES_CAPACITY, NAMES_PART_ID, NAME_RE, ORDER, PALIO_ASPECT, PARTS, PART_BY_ID, cleanName } from './parts';
import { en, es } from '../i18n/strings';
import { GOAL_MXN } from './config';

describe('parts catalog', () => {
  it('has 15 unique parts, all reachable from the garage menu', () => {
    expect(PARTS).toHaveLength(15);
    expect(new Set(PARTS.map(p => p.id)).size).toBe(15);
    expect(ORDER).toHaveLength(15);
  });
  it('has a logo aspect ratio for every part and valid example sales', () => {
    for (const p of PARTS) expect(PALIO_ASPECT[p.id]).toBeGreaterThan(0);
    for (const id of Object.keys(EXAMPLE_SOLD)) expect(PART_BY_ID[id]).toBeDefined();
  });
  it('has every text in English too', () => {
    expect(Object.keys(es).filter(k => en[k as keyof typeof es] == null)).toEqual([]);
  });
  it('reaches the 150,000 MXN goal with the 14 brand parts plus a full roof of names', () => {
    expect(GOAL_MXN).toBe(150000);
    expect(BRAND_PARTS).toHaveLength(14);
    const roof = PART_BY_ID[NAMES_PART_ID];
    expect(roof.kind).toBe('names');
    expect(roof.price).toBe(100);
    expect(BRAND_PARTS.reduce((a, p) => a + p.price, 0) + NAMES_CAPACITY * roof.price).toBeGreaterThanOrEqual(GOAL_MXN);
    expect(EXAMPLE_SOLD[NAMES_PART_ID]).toBeUndefined();
  });
  it('accepts people’s names and handles, not junk', () => {
    for (const ok of ['Doña Lupe', '@mau.mty', 'Fer y Caro', "O'Brien", 'Chuy_81', 'Memo & Ana']) expect(NAME_RE.test(ok)).toBe(true);
    for (const bad of ['<script>', 'hola 😀', 'a/b', 'x=1']) expect(NAME_RE.test(bad)).toBe(false);
    expect(cleanName('  Tío   Beto ')).toBe('Tío Beto');
  });
});
