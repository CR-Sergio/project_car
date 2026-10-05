import { describe, expect, it } from 'vitest';
import { BRAND_PARTS, EXAMPLE_MESSAGES, EXAMPLE_SOLD, MESSAGES_CAPACITY, MESSAGE_MAX, MESSAGE_PARTS, MESSAGE_RE, NAMES_PART_ID, NAME_RE, ORDER, PALIO_ASPECT, PARTS, PART_BY_ID, cleanName, messagesStock, MESSAGES_PER_PART, roofNames, roomiestMessagePart } from './parts';
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
  it('sells 12 parts to brands, messages on the two front fenders and gives the roof away', () => {
    expect(GOAL_MXN).toBe(150000);
    expect(BRAND_PARTS).toHaveLength(12);
    expect(MESSAGE_PARTS.map(p => p.id)).toEqual(['salpi-i', 'salpi-d']);
    expect(MESSAGE_PARTS.every(p => p.price === 100)).toBe(true);
    expect(MESSAGES_CAPACITY).toBe(170);
    expect(PART_BY_ID[NAMES_PART_ID]).toMatchObject({ kind: 'names', price: 0 });
    for (const id of Object.keys(EXAMPLE_SOLD)) expect(PART_BY_ID[id].kind).toBeUndefined();
  });
  it('validates 24-character messages', () => {
    expect(MESSAGE_MAX).toBe(24);
    for (const ok of ['¡Arre con el project!', 'Te queremos, Palio', 'Vamos por el 2.0', '¿Y el 13? #MTY']) expect(MESSAGE_RE.test(ok)).toBe(true);
    for (const bad of ['<b>hola</b>', 'arre 🚗', 'a/b=c']) expect(MESSAGE_RE.test(bad)).toBe(false);
    for (const m of EXAMPLE_MESSAGES) { expect(m.text.length).toBeLessThanOrEqual(MESSAGE_MAX); expect(MESSAGE_RE.test(m.text)).toBe(true); }
  });
  it('puts each message’s gift name on the roof and fills both fenders evenly', () => {
    expect(roofNames([{ text: 'a', part: 'salpi-i', name: 'Lupe' }, { text: 'b', part: 'salpi-d' }])).toEqual(['Lupe']);
    expect(roomiestMessagePart([{ text: 'a', part: 'salpi-i' }])).toBe('salpi-d');
  });
  it('accepts people’s names and handles, not junk', () => {
    for (const ok of ['Doña Lupe', '@mau.mty', 'Fer y Caro', "O'Brien", 'Chuy_81', 'Memo & Ana']) expect(NAME_RE.test(ok)).toBe(true);
    for (const bad of ['<script>', 'hola 😀', 'a/b', 'x=1']) expect(NAME_RE.test(bad)).toBe(false);
    expect(cleanName('  Tío   Beto ')).toBe('Tío Beto');
  });
  it('sells messages while they last and warns when few spots are left', () => {
    const fill = (n: number, part = 'salpi-i') => Array.from({ length: n }, () => ({ text: 'x', part }));
    expect(messagesStock([])).toEqual({ left: MESSAGES_CAPACITY, low: false });
    expect(messagesStock(fill(MESSAGES_CAPACITY - 5)).low).toBe(true);
    expect(messagesStock(fill(MESSAGES_PER_PART), 'salpi-i')).toEqual({ left: 0, low: false });
    expect(messagesStock(fill(MESSAGES_PER_PART - 3), 'salpi-i').low).toBe(true);
  });
});
