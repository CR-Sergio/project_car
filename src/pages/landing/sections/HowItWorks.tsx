import { Ransom } from '../../../components/Ransom';
import { useLocale } from '../../../state/locale';

export function HowItWorks() {
  const { t } = useLocale();
  return (
    <section id="como">
      <div className="sec-head"><Ransom as="h2" es="COMO FUNCIONA" en="HOW IT WORKS" seed={5} /></div>
      <div className="how">
        {([1, 2, 3] as const).map(n => (
          <div className="step paper" key={n}><div className="n">{n}</div><h3>{t(`how.h${n}`)}</h3><p>{t(`how.p${n}`)}</p></div>
        ))}
      </div>
    </section>
  );
}
