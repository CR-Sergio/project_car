import { Ransom } from '../../../components/Ransom';
import { IVA, MXN_PER_USD, OPERATING, PAYMENT_FEE, ISR_RESICO } from '../../../data/budget';
import { ORDER } from '../../../data/parts';
import { goalBreakdown, vinylCost } from '../../../lib/budget';
import { useLocale } from '../../../state/locale';

const COLORS = { car: '#e2252e', vinyl: '#f1c232', fees: '#2f6fe0', isr: '#c4a273', ops: '#3fb36b', buffer: '#9a94a0' } as const;
const pct = (v: number) => (v * 100).toFixed(1).replace(/\.0$/, '');

/** "¿A dónde va el dinero?": the goal, line by line, as a store receipt. */
export function Budget() {
  const { t, lang, cur, money, goal, nameOf } = useLocale();
  const b = goalBreakdown();
  // amounts are kept in MXN; in dollars they are converted for reference
  const show = (mxn: number) => money(cur === 'USD' ? Math.round(mxn / MXN_PER_USD) : mxn);
  const label: Record<string, string> = {
    car: t('bud.car'), vinyl: t('bud.vinyl', { n: ORDER.length }),
    fees: t('bud.fees', { p: pct(PAYMENT_FEE.pct * (1 + IVA)) }), isr: t('bud.isr', { p: pct(ISR_RESICO) }), ops: t('bud.ops'),
  };
  const rows = [...b.lines.map(l => ({ key: l.key as keyof typeof COLORS, amount: l.amount, label: label[l.key] })),
    ...(b.buffer > 0 ? [{ key: 'buffer' as const, amount: b.buffer, label: t('bud.buffer') }] : [])];
  return (
    <section id="presupuesto">
      <div className="sec-head">
        <Ransom as="h2" es="¿A DÓNDE VA EL DINERO?" en="WHERE DOES THE MONEY GO?" seed={27} bold />
        <p>{t('bud.p')}</p>
      </div>
      <div className="budget">
        <div className="receipt" role="table" aria-label={t('bud.title')}>
          <span className="tape" aria-hidden="true" />
          <div className="r-head"><b>PROYECT CAR</b><span>{t('bud.title')}</span><span>MONTERREY, N.L.</span></div>
          {rows.map(r => (
            <div className="r-line" role="row" key={r.key}>
              <span role="cell"><i style={{ background: COLORS[r.key] }} />{r.label}</span><span role="cell">{show(r.amount)}</span>
            </div>
          ))}
          <div className="r-total" role="row"><span role="cell">{t('bud.total')}</span><span role="cell">{money(goal)} {cur}</span></div>
          <p className="r-foot">{t('bud.iva', { p: Math.round(IVA * 100) })}</p>
          <div className="r-bar" aria-hidden="true">
            {rows.map(r => <span key={r.key} style={{ flexGrow: r.amount, background: COLORS[r.key] }} />)}
          </div>
          <p className="r-thanks">*** {t('bud.thanks')} ***</p>
        </div>
        <div className="budget-side">
          <div className="b-note paper">
            <span className="tape" aria-hidden="true" />
            <h3>{t('bud.h1')}</h3>
            <p>{t('bud.n1', { car: show(b.lines[0].amount), goal: money(goal) + ' ' + cur })}</p>
          </div>
          <details className="b-detail">
            <summary>{t('bud.perPart')}</summary>
            <table>
              <thead><tr><th>{t('bud.part')}</th><th>{t('bud.vinylCol')}</th></tr></thead>
              <tbody>{ORDER.map(p => <tr key={p.id}><td>{nameOf(p)}</td><td>{show(vinylCost(p))}</td></tr>)}</tbody>
            </table>
            <p>{t('bud.vinylHow')}</p>
          </details>
          <details className="b-detail">
            <summary>{t('bud.opsTitle')}</summary>
            <ul>{OPERATING.map(o => <li key={o.es}>{lang === 'en' ? o.en : o.es}: {show(o.amount)}</li>)}</ul>
          </details>
        </div>
      </div>
    </section>
  );
}
