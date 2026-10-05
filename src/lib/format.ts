import { GOAL_MXN } from '../data/config';
import { PARTS, type Part } from '../data/parts';

export type Lang = 'es' | 'en';
export type Currency = 'MXN' | 'USD';

export const priceIn = (p: Part, cur: Currency) => (cur === 'USD' ? p.usd : p.price);
export const formatMoney = (v: number, cur: Currency) =>
  cur === 'USD' ? 'US$' + v.toLocaleString('en-US') : '$' + v.toLocaleString('es-MX');
/** la meta en dólares es la suma de los precios en dólares */
export const goalIn = (cur: Currency) => (cur === 'USD' ? PARTS.reduce((a, p) => a + p.usd, 0) : GOAL_MXN);
export const escapeHtml = (s: string) =>
  String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
export const fill = (s: string, vars: Record<string, string | number> = {}) =>
  s.replace(/\{(\w+)\}/g, (_, x) => String(vars[x] ?? ''));

/* idioma y moneda: lo que la persona eligió antes; si no, su navegador y zona horaria */
const MX_TZ = /^America\/(Mexico_City|Monterrey|Cancun|Merida|Matamoros|Chihuahua|Hermosillo|Mazatlan|Tijuana|Ojinaga|Bahia_Banderas|Ciudad_Juarez)/;
export function detectLang(stored: string | null, navLang: string | undefined): Lang {
  if (stored === 'es' || stored === 'en') return stored;
  return /^es\b/i.test(navLang || 'es') ? 'es' : 'en';
}
export function detectCurrency(stored: string | null, timeZone: string, lang: Lang): Currency {
  if (stored === 'MXN' || stored === 'USD') return stored;
  return MX_TZ.test(timeZone) || lang === 'es' ? 'MXN' : 'USD';
}
