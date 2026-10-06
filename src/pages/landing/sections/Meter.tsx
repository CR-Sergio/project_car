import { useEffect, useRef } from 'react';
import { BRAND_PARTS } from '../../../data/parts';
import { REDUCED } from '../../../lib/motion';
import { useLocale } from '../../../state/locale';
import { useSales } from '../../../state/sales';

/* last amount shown, so coming back from the garage after a purchase counts up from where it was */
let shown = 0, shownCur: string | null = null;

export function Meter() {
  const { t, money, goal, cur } = useLocale();
  const { sold, messages, raisedIn } = useSales();
  const raised = raisedIn(cur), pct = Math.min(100, raised / goal * 100), n = Object.keys(sold).length, N = BRAND_PARTS.length;
  const num = useRef<HTMLSpanElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (shownCur !== cur) { shown = 0; shownCur = cur; }
    const from = shown, t0 = performance.now(), dur = REDUCED ? 0 : 1300; let raf = 0;
    const stp = (now: number) => {
      const k = dur ? Math.min(1, (now - t0) / dur) : 1, e = 1 - Math.pow(1 - k, 3), v = Math.round(from + (raised - from) * e);
      if (num.current) num.current.textContent = money(v); shown = v;
      if (k < 1) raf = requestAnimationFrame(stp);
    };
    raf = requestAnimationFrame(stp);
    // the bar grows from 0 on first paint (CSS transition on width)
    const f = requestAnimationFrame(() => { if (fill.current) fill.current.style.width = pct + '%'; });
    return () => { cancelAnimationFrame(raf); cancelAnimationFrame(f); };
  }, [raised, cur, money, pct]);
  return (
    <div className="meter paper" role="group" aria-label="Avance de la meta">
      <div className="meter-head">
        <div className="big"><span ref={num}>{money(shown)}</span> <small>/ {money(goal)} {cur}</small></div>
        <div className="meta"><span>{pct.toFixed(0)}%</span> · <span>{t('soldOf', { n, N })}</span> · <span>{t('msgCount', { k: messages.length })}</span></div>
      </div>
      <div className="track"><div className="fill" ref={fill}><span className="car" aria-hidden="true">🏎️</span></div><div className="flag" aria-hidden="true" /></div>
      <div className="ticks" aria-hidden="true">
        {[0, .25, .5, .75, 1].map(f => <span key={f}>{f ? (Math.round(goal * f / 100) / 10).toLocaleString('en-US') + 'k' : money(0)}</span>)}
      </div>
    </div>
  );
}
