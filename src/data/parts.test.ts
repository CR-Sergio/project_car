import { describe, expect, it } from 'vitest';
import { EXAMPLE_SOLD, ORDER, PALIO_ASPECT, PARTS, PART_BY_ID } from './parts';
import { en, es } from '../i18n/strings';

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
});
