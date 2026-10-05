import { Ransom } from '../../../components/Ransom';
import { LEGAL, RESTRICTED } from '../../../data/legal';
import { useLocale } from '../../../state/locale';

const QUESTIONS = [1, 2, 3, 4, 5, 6, 7] as const;

export function Faq() {
  const { t, lang } = useLocale();
  // answers take their numbers from the same config as the Terms, so they never disagree
  const vars = { months: LEGAL.vigenciaMeses, videos: LEGAL.videosMinimos, days: LEGAL.diasInstalacion, list: RESTRICTED[lang].join(', ') };
  return (
    <section id="dudas">
      <div className="sec-head"><Ransom as="h2" es="DUDAS" en="FAQ" seed={9} /></div>
      <div className="faq">
        {QUESTIONS.map(n => (
          <details key={n} open={n === 1}>
            <summary>{t(`faq.q${n}`)}</summary>
            <p>{t(`faq.a${n}`, n === 7 ? { ...vars, days: LEGAL.diasCancelacion } : vars)}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
