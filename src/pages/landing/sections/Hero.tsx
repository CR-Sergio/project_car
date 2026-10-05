import { Ransom } from '../../../components/Ransom';
import { NAMES_PART_ID, PART_BY_ID } from '../../../data/parts';
import { useLocale } from '../../../state/locale';

export function Hero() {
  const { t, money, goal, cur, priceOf } = useLocale();
  return (
    <section className="hero">
      <div className="halftone-bg" aria-hidden="true" />
      <div>
        <Ransom as="h1" className="slap" es="VENDO MI CARRO EN PEDAZOS" en="SELLING MY CAR IN PIECES" seed={3} bold />
        <p className="lede" dangerouslySetInnerHTML={{ __html: t('hero.lede', { goal: money(goal) + ' ' + cur, roof: money(priceOf(PART_BY_ID[NAMES_PART_ID])) }) }} />
        <div className="chips">
          <span className="sticker paper">{t('chip.parts')}</span><span className="sticker paper">Fiat Palio '13</span><span className="sticker paper">{t('chip.secure')}</span>
        </div>
        <div className="cta-row">
          <a className="btn paper" href="#garage">{t('cta.pick')}</a>
          <a className="btn ghost paper" href="#como">{t('cta.how')}</a>
        </div>
      </div>
      <figure className="teaser paper">
        <span className="tape" aria-hidden="true" />
        <span className="roundel paper" aria-hidden="true">13</span>
        {/* foto de la portada: public/img/palio-foto.webp, horizontal 13:9 (650 × 450 o más grande) */}
        <img src="/img/palio-foto.webp" width={650} height={450} alt={t('teaser.alt')} fetchPriority="high" decoding="async" />
        <figcaption>{t('teaser.cap')}</figcaption>
      </figure>
    </section>
  );
}
