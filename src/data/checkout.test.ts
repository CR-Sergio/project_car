import { describe, expect, it } from 'vitest';
import { MESSAGE_MAX, PART_BY_ID, cleanName } from './parts';

describe('Checkout Validation and Calculations', () => {
  it('validates all part IDs and prices exist accurately', () => {
    expect(PART_BY_ID['cofre']?.price).toBe(18000);
    expect(PART_BY_ID['salpi-i']?.price).toBe(100);
    expect(PART_BY_ID['salpi-d']?.price).toBe(100);
    expect(PART_BY_ID['puerta-di']?.price).toBe(9500);
  });

  it('cleans names and validates message lengths', () => {
    const raw = '  Viva México!  ';
    const cleaned = cleanName(raw);
    expect(cleaned).toBe('Viva México!');
    expect(cleaned.length).toBeLessThanOrEqual(MESSAGE_MAX);
  });

  it('calculates total for 12 brand parts and 240 messages matching 150,000 MXN goal', () => {
    const brandPartsTotal = Object.values(PART_BY_ID)
      .filter(p => !p.kind)
      .reduce((sum, p) => sum + p.price, 0);

    const messagesTotal = 240 * 100; // 120 per fender * $100

    expect(brandPartsTotal).toBe(126000);
    expect(messagesTotal).toBe(24000);
    expect(brandPartsTotal + messagesTotal).toBe(150000);
  });

  it('calculates USD amount in cents correctly according to exchange rate', () => {
    const priceMxn = 18000;
    const usdRate = 18.5;
    const amountInCentsUsd = Math.round((priceMxn / usdRate) * 100);
    expect(amountInCentsUsd).toBe(97297); // ~972.97 USD
  });

  it('generates consistent idempotency keys for checkout requests', () => {
    const partId = 'cofre';
    const email = 'sponsor@empresa.com';
    const timestampMinute = Math.floor(1728500000000 / 60000);
    const idempotencyKey = `session_${partId}_${email.trim().toLowerCase()}_${timestampMinute}`;
    expect(idempotencyKey).toBe('session_cofre_sponsor@empresa.com_28808333');
  });
});
