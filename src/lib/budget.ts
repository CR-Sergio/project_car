import { ISR_RESICO, IVA, MXN_PER_USD, OPERATING, PAYMENT_FEE, PROJECT_CAR_MXN, VINYL } from '../data/budget';
import { PARTS, type Part } from '../data/parts';

/** "≈ 115 × 150 cm" → 1.725 m² */
export function areaM2(size: string) {
  const m = size.match(/(\d+(?:\.\d+)?)\s*×\s*(\d+(?:\.\d+)?)/);
  if (!m) throw new Error(`size without "W × H": ${size}`);
  return (+m[1] * +m[2]) / 10000;
}

const up50 = (v: number) => Math.ceil(v / 50) * 50;

/** estimated vinyl + install + removal for one part, MXN without IVA, rounded up to $50 */
export function vinylCost(p: Part) {
  const a = areaM2(p.size), rate = p.microperf ? VINYL.microperfPerM2 : VINYL.printPerM2;
  return up50(a * (1 + VINYL.waste) * rate + VINYL.installBase + VINYL.installPerM2 * a + VINYL.removal);
}

export const VINYL_TOTAL = PARTS.reduce((a, p) => a + vinylCost(p), 0);
export const OPERATING_TOTAL = OPERATING.reduce((a, o) => a + o.amount, 0);
/** what has to be left after fees and taxes */
export const COSTS = PROJECT_CAR_MXN + VINYL_TOTAL + OPERATING_TOTAL;

/** fees and ISR when `subtotal` (MXN, before IVA) is collected over `sales` payments */
export function deductions(subtotal: number, sales = PARTS.length) {
  const fees = Math.round(subtotal * (1 + IVA) * PAYMENT_FEE.pct + PAYMENT_FEE.fixedPerSale * sales);
  const isr = Math.round(subtotal * ISR_RESICO);
  return { fees, isr };
}

/** smallest goal (rounded up to $1,000) that covers every cost once fees and ISR come out of it */
export const GOAL_MXN = (() => {
  const keep = 1 - (1 + IVA) * PAYMENT_FEE.pct - ISR_RESICO;
  return Math.ceil((COSTS + PAYMENT_FEE.fixedPerSale * PARTS.length) / keep / 1000) * 1000;
})();
export const GOAL_USD = Math.round(GOAL_MXN / MXN_PER_USD / 50) * 50;

/** the receipt shown on the landing: every line of the goal, MXN without IVA */
export function goalBreakdown() {
  const { fees, isr } = deductions(GOAL_MXN);
  const lines = [
    { key: 'car', amount: PROJECT_CAR_MXN },
    { key: 'vinyl', amount: VINYL_TOTAL },
    { key: 'fees', amount: fees },
    { key: 'isr', amount: isr },
    { key: 'ops', amount: OPERATING_TOTAL },
  ] as const;
  const used = lines.reduce((a, l) => a + l.amount, 0);
  return { lines, buffer: GOAL_MXN - used, total: GOAL_MXN };
}
