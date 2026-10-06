import { describe, expect, it } from 'vitest';
import { layoutRansom } from './ransom';

describe('cut-paper letters', () => {
  it('is deterministic: same text and seed, same letters', () => {
    expect(layoutRansom('EL GARAGE', 11, false)).toEqual(layoutRansom('EL GARAGE', 11, false));
  });
  it('changes with the seed', () => {
    expect(layoutRansom('EL GARAGE', 11, false).tear).not.toBe(layoutRansom('EL GARAGE', 12, false).tear);
  });
  it('keeps every character and uses photo cut-outs for A', () => {
    const { words } = layoutRansom('VENDO MI CARRO', 3, true);
    expect(words.map(w => w.map(l => l.ch ?? 'A').join(''))).toEqual(['VENDO', 'MI', 'CARRO']);
    expect(words[2][1].img).toMatch(/^\/img\/a\d\.webp$/);
  });
});
