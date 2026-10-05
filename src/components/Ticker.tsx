import { PART_BY_ID, PARTS } from '../data/parts';
import { useLocale } from '../state/locale';
import { useSales } from '../state/sales';

export function Ticker() {
  const { t, nameOf, money, goal, cur } = useLocale();
  const { sold } = useSales();
  const free = PARTS.filter(p => !sold[p.id]).length;
  const items = [
    ...Object.entries(sold).map(([id, s]) => <span key={id}><b>{t('sold')}</b>{nameOf(PART_BY_ID[id])} → {s.brand}</span>),
    <span key="w"><b>{t('wanted')}</b>{t('wantedTxt', { n: free })}</span>,
    <span key="g"><b>{t('goal')}</b>{t('goalTxt', { g: money(goal) + ' ' + cur })}</span>,
    <span key="b"><b>{t('base')}</b>Tec de Monterrey · Garza Sada</span>,
  ];
  return (
    <div className="ticker" aria-label="Últimas noticias">
      <div className="run">{items}<span aria-hidden="true" style={{ margin: 0 }}>{items}</span></div>
    </div>
  );
}
