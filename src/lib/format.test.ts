import { describe, expect, it } from 'vitest';
import { detectCurrency, detectLang, fill, formatMoney, goalIn } from './format';
import { GOAL_MXN, GOAL_USD } from '../data/config';

describe('money and goal', () => {
  it('formats pesos and dollars like the original page', () => {
    expect(formatMoney(14000, 'MXN')).toBe('$14,000');
    expect(formatMoney(750, 'USD')).toBe('US$750');
  });
  it('uses the budget goal in pesos and its dollar conversion', () => {
    expect(goalIn('MXN')).toBe(GOAL_MXN);
    expect(goalIn('USD')).toBe(GOAL_USD);
  });
  it('fills {placeholders}', () => {
    expect(fill('{n} de {N} piezas', { n: 3, N: 15 })).toBe('3 de 15 piezas');
    expect(fill('hola {x}')).toBe('hola ');
  });
});

describe('locale detection', () => {
  it('prefers what the visitor picked before', () => {
    expect(detectLang('en', 'es-MX')).toBe('en');
    expect(detectCurrency('USD', 'America/Monterrey', 'es')).toBe('USD');
  });
  it('falls back to browser language and Mexican time zones', () => {
    expect(detectLang(null, 'es-MX')).toBe('es');
    expect(detectLang(null, 'en-US')).toBe('en');
    expect(detectCurrency(null, 'America/Monterrey', 'en')).toBe('MXN');
    expect(detectCurrency(null, 'America/New_York', 'en')).toBe('USD');
  });
});
