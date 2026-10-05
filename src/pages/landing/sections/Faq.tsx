import { Ransom } from '../../../components/Ransom';
import { useLocale } from '../../../state/locale';

export function Faq() {
  const { t } = useLocale();
  return (
    <section id="dudas">
      <div className="sec-head"><Ransom as="h2" es="DUDAS" en="FAQ" seed={9} /></div>
      <div className="faq">
        {([1, 2, 3, 4] as const).map(n => (
          <details key={n} open={n === 1}><summary>{t(`faq.q${n}`)}</summary><p>{t(`faq.a${n}`)}</p></details>
        ))}
      </div>
    </section>
  );
}
