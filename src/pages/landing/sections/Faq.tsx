import { Ransom } from '../../../components/Ransom';
import { LEGAL, RESTRICTED } from '../../../data/legal';
import { NAMES_CAPACITY, NAMES_PART_ID, PART_BY_ID } from '../../../data/parts';
import { useLocale } from '../../../state/locale';

const QUESTIONS = [1, 8, 2, 3, 4, 5, 6, 7] as const;

export function Faq() {
  const { t, lang, money, priceOf } = useLocale();
  // answers take their numbers from the same config as the Terms, so they never disagree
  const vars = { months: LEGAL.vigenciaMeses, videos: LEGAL.videosMinimos, list: RESTRICTED[lang].join(', '), p: money(priceOf(PART_BY_ID[NAMES_PART_ID])), cap: NAMES_CAPACITY };
  return (
    <section id="dudas">
      <div className="sec-head"><Ransom as="h2" es="DUDAS" en="FAQ" seed={9} /></div>
      <div className="faq">
        {QUESTIONS.map(n => (
          <details key={n} open={n === 1}>
            <summary>{t(`faq.q${n}`)}</summary>
            <p>{t(`faq.a${n}`, vars)}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
