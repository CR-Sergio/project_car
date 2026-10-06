import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { es, en, type TextKey } from '../i18n/strings';
import { ZONE_EN, type Part, type Zone } from '../data/parts';
import { detectCurrency, detectLang, fill, formatMoney, goalIn, priceIn, type Currency, type Lang } from '../lib/format';
import { readPref, writePref } from '../lib/storage';

export interface Locale {
  lang: Lang;
  cur: Currency;
  setLang: (l: Lang) => void;
  setCur: (c: Currency) => void;
  t: (key: TextKey, vars?: Record<string, string | number>) => string;
  nameOf: (p: Part) => string;
  zoneOf: (z: Zone) => string;
  priceOf: (p: Part) => number;
  money: (v: number) => string;
  goal: number;
}

const Ctx = createContext<Locale | null>(null);

function initial() {
  const lang = detectLang(readPref('pc-lang'), typeof navigator !== 'undefined' ? navigator.language : 'es');
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  return { lang, cur: detectCurrency(readPref('pc-cur'), tz, lang) };
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initial);
  const { lang, cur } = state;
  const setLang = useCallback((l: Lang) => { writePref('pc-lang', l); setState(s => ({ ...s, lang: l })); }, []);
  const setCur = useCallback((c: Currency) => { writePref('pc-cur', c); setState(s => ({ ...s, cur: c })); }, []);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const value = useMemo<Locale>(() => {
    const t: Locale['t'] = (key, vars) => fill((lang === 'en' && en[key] != null ? en[key]! : es[key]) as string, vars);
    const money = (v: number) => formatMoney(v, cur);
    return {
      lang, cur, setLang, setCur, t, money,
      nameOf: p => (lang === 'en' ? p.en : p.name),
      zoneOf: z => (lang === 'en' ? ZONE_EN[z] : z),
      priceOf: p => priceIn(p, cur),
      goal: goalIn(cur),
    };
  }, [lang, cur, setLang, setCur]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLocale() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useLocale needs <LocaleProvider>');
  return v;
}
