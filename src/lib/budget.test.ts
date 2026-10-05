import { describe, expect, it } from 'vitest';
import { PROJECT_CAR_MXN } from '../data/budget';
import { PARTS, PART_BY_ID } from '../data/parts';
import { COSTS, GOAL_MXN, VINYL_TOTAL, areaM2, deductions, goalBreakdown, vinylCost } from './budget';

describe('budget', () => {
  it('reads part sizes', () => {
    expect(areaM2('≈ 115 × 150 cm')).toBeCloseTo(1.725);
    expect(() => areaM2('grande')).toThrow();
  });
  it('prices vinyl per part (bigger parts cost more, windows use microperforated vinyl)', () => {
    expect(vinylCost(PART_BY_ID['cofre'])).toBeGreaterThan(vinylCost(PART_BY_ID['puerta-di']));
    expect(PART_BY_ID['medallon'].microperf).toBe(true);
    for (const p of PARTS) expect(vinylCost(p) % 50).toBe(0);
    expect(VINYL_TOTAL).toBe(PARTS.reduce((a, p) => a + vinylCost(p), 0));
  });
  it('sets a goal that still covers every cost after fees and ISR', () => {
    const { fees, isr } = deductions(GOAL_MXN);
    expect(GOAL_MXN - fees - isr).toBeGreaterThanOrEqual(COSTS);
    expect(GOAL_MXN % 1000).toBe(0);
    expect(GOAL_MXN).toBeGreaterThan(PROJECT_CAR_MXN);
  });
  it('lists every line of the goal and adds up', () => {
    const b = goalBreakdown();
    expect(b.lines.reduce((a, l) => a + l.amount, 0) + b.buffer).toBe(GOAL_MXN);
    expect(b.buffer).toBeGreaterThanOrEqual(0);
  });
  it('selling every part reaches the goal', () => {
    expect(PARTS.reduce((a, p) => a + p.price, 0)).toBeGreaterThanOrEqual(GOAL_MXN);
  });
});
