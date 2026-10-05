import { useEffect, useRef } from 'react';
import { Ransom } from '../../../components/Ransom';
import { useLocale } from '../../../state/locale';

export function Hero() {
  const { t, money, goal, cur } = useLocale();
  const video = useRef<HTMLVideoElement>(null);
  // the teaser only downloads and plays while it is on screen
  useEffect(() => {
    const v = video.current!;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); });
    io.observe(v); return () => io.disconnect();
  }, []);
  return (
    <section className="hero">
      <div className="halftone-bg" aria-hidden="true" />
      <div>
        <Ransom as="h1" className="slap" es="VENDO MI CARRO EN PEDAZOS" en="SELLING MY CAR IN PIECES" seed={3} bold />
        <p className="lede" dangerouslySetInnerHTML={{ __html: t('hero.lede', { goal: money(goal) + ' ' + cur }) }} />
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
        <video ref={video} src="/teaser.mp4" poster="/teaser.jpg" muted playsInline loop controls preload="none" aria-label="Video teaser del proyecto" />
        <figcaption>{t('teaser.cap')}</figcaption>
      </figure>
    </section>
  );
}
