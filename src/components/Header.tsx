import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router';
import { Ransom } from './Ransom';
import { useLocale } from '../state/locale';
import type { Currency, Lang } from '../lib/format';

const LINKS = [['como', 'nav.como'], ['garage', 'nav.garage'], ['donde', 'nav.donde'], ['nota', 'nav.nota'], ['dudas', 'nav.dudas']] as const;

/** Sticky header: shrinks after scrolling, underlines the current section, and a little car drives along the road. */
export function Header() {
  const { t, lang, cur, setLang, setCur } = useLocale();
  const ref = useRef<HTMLElement>(null);
  // on the landing the links scroll behind the garage door; on other pages they go back to the landing
  const home = useLocation().pathname === '/';
  useEffect(() => {
    const h = ref.current!, links = [...h.querySelectorAll<HTMLAnchorElement>('nav.links a')];
    let ticking = false;
    const upd = () => {
      ticking = false; const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
      h.classList.toggle('scrolled', y > 40); h.style.setProperty('--p', max > 0 ? Math.min(1, y / max).toFixed(4) : '0');
      let current: HTMLAnchorElement | null = null;
      for (const a of links) { const sec = home ? document.getElementById(a.hash.slice(1)) : null; if (sec && sec.getBoundingClientRect().top < innerHeight * .35) current = a; }
      links.forEach(a => a.classList.toggle('on', a === current));
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(upd); } };
    addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', upd); upd();
    return () => { removeEventListener('scroll', onScroll); removeEventListener('resize', upd); };
  }, [home]);
  return (
    <header className="top" ref={ref}>
      <div className="wrap">
        {home
          ? <a className="logo" href="#inicio" aria-label="Proyect Car, inicio"><Ransom es="PROYECT CAR" en="PROYECT CAR" seed={7} bold /></a>
          : <Link className="logo" to="/" aria-label="Proyect Car, inicio"><Ransom es="PROYECT CAR" en="PROYECT CAR" seed={7} bold /></Link>}
        <nav className="links" aria-label="Secciones">
          {LINKS.map(([id, k]) => home ? <a key={id} href={'#' + id}>{t(k)}</a> : <Link key={id} to={'/#' + id}>{t(k)}</Link>)}
        </nav>
        <div className="toggles" role="group" aria-label="Idioma y moneda / Language and currency">
          <div className="seg" data-kind="lang">
            {(['es', 'en'] as Lang[]).map(v => <button key={v} type="button" aria-pressed={lang === v} onClick={() => setLang(v)}>{v.toUpperCase()}</button>)}
          </div>
          <div className="seg" data-kind="cur">
            {(['MXN', 'USD'] as Currency[]).map(v => <button key={v} type="button" aria-pressed={cur === v} onClick={() => setCur(v)}>{v}</button>)}
          </div>
        </div>
      </div>
      <div className="road" aria-hidden="true"><span className="mini">🏎️</span></div>
    </header>
  );
}
