import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { REDUCED, wait } from '../../../lib/motion';
import { useLocale } from '../../../state/locale';

const EASE = 'cubic-bezier(.33,.08,.24,1)', UNROLL = 'cubic-bezier(.42,.02,.3,1)';

/** Folded newspaper: tap it, the band snaps off and the page unrolls (the view follows the roll down). */
export function News() {
  const { t, money, goal, cur } = useLocale();
  const [cls, setCls] = useState({ folded: true, lifting: false, unbanding: false });
  const set = (patch: Partial<typeof cls>) => flushSync(() => setCls(c => ({ ...c, ...patch })));
  const body = useRef<HTMLDivElement>(null), roll = useRef<HTMLSpanElement>(null), busy = useRef(false);

  async function open() {
    const b = body.current!, r = roll.current!;
    if (busy.current || !cls.folded) return; busy.current = true;
    if (REDUCED) { set({ folded: false }); busy.current = false; return; }
    set({ lifting: true }); await wait(150);
    set({ unbanding: true }); await wait(260);
    b.style.height = '0px'; set({ folded: false });          // paper flattens and widens
    await wait(460);
    const H = b.scrollHeight, dur = Math.min(2300, 1000 + H * 1.4);
    r.classList.add('on');
    r.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(.32)' }], { duration: dur, easing: UNROLL, fill: 'forwards' });
    // follow the roll down the page so the unrolling stays on screen
    let following = true;
    const follow = () => {
      if (!following) return; const rr = r.getBoundingClientRect(), lim = innerHeight - 70;
      if (rr.bottom > lim) scrollBy(0, rr.bottom - lim); requestAnimationFrame(follow);
    };
    requestAnimationFrame(follow);
    await b.animate([{ height: '0px' }, { height: H + 'px' }], { duration: dur, easing: UNROLL }).finished; following = false;
    b.style.height = ''; r.classList.remove('on'); set({ lifting: false, unbanding: false }); busy.current = false;
  }

  async function close() {
    const b = body.current!, r = roll.current!;
    if (busy.current) return; busy.current = true;
    document.getElementById('nota')!.scrollIntoView({ block: 'start', behavior: REDUCED ? 'auto' : 'smooth' });
    if (REDUCED) { set({ folded: true }); busy.current = false; return; }
    await wait(350);
    const H = b.scrollHeight, dur = Math.min(1300, 600 + H * .8);
    r.classList.add('on');
    r.animate([{ transform: 'scaleY(.32)' }, { transform: 'scaleY(1)' }], { duration: dur, easing: EASE, fill: 'forwards' });
    await b.animate([{ height: H + 'px' }, { height: '0px' }], { duration: dur, easing: EASE, fill: 'forwards' }).finished;
    r.classList.remove('on'); set({ unbanding: true, folded: true }); b.getAnimations().forEach(a => a.cancel());
    await wait(520); set({ unbanding: false }); busy.current = false;
  }

  const className = ['news', cls.folded && 'folded', cls.lifting && 'lifting', cls.unbanding && 'unbanding'].filter(Boolean).join(' ');
  return (
    <section id="nota">
      <div className="news-wrap">
        <article className={className} id="news">
          <div className="masthead"><div className="name">{t('news.mast')}</div></div>
          <div className="dateline"><span>Monterrey, N.L.</span><span>{t('news.ed')}</span><span>{t('news.price')}</span></div>
          <h2 className="headline">{t('news.head')}</h2>
          <div className="news-body" ref={body}><div className="news-lower">
            <p className="deck">{t('news.deck')}</p>
            <div className="news-grid">
              <div className="cols">
                <p>{t('news.p1')}</p><p>{t('news.p2')}</p><p>{t('news.p3')}</p><p>{t('news.p4', { goal: money(goal) + ' ' + cur })}</p>
              </div>
              <figure className="photo">
                <div className="img" role="img" aria-label="Foto en puntos de imprenta del Palio con el cofre vendido" />
                <figcaption>{t('news.cap')}</figcaption>
              </figure>
            </div>
            <button className="news-refold" type="button" onClick={close}>{t('news.refold')}</button>
          </div></div>
          <span className="stamp" aria-hidden="true">{t('news.stamp')}</span>
          <span className="crease" aria-hidden="true" />
          <span className="band" aria-hidden="true" />
          <button className="news-open" type="button" aria-expanded={!cls.folded} aria-controls="news" onClick={open}>
            <span className="sticker">{t('news.open')}</span>
          </button>
        </article>
        <span className="news-roll" ref={roll} aria-hidden="true" />
      </div>
    </section>
  );
}
