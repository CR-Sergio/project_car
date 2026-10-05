import { useEffect, useLayoutEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useDoor } from '../../app/door';
import { Footer } from '../../components/Footer';
import { Graffiti } from '../../components/Graffiti';
import { Header } from '../../components/Header';
import { Ticker } from '../../components/Ticker';
import { useLocale } from '../../state/locale';
import { Budget } from './sections/Budget';
import { Faq } from './sections/Faq';
import { Hero } from './sections/Hero';
import { HowItWorks } from './sections/HowItWorks';
import { Meter } from './sections/Meter';
import { News } from './sections/News';
import { Showroom, prefetchShowroom } from './sections/Showroom';
import { Where } from './sections/Where';
import '../../styles/landing.css';

const NAMES = {
  es: { inicio: 'La portada', nota: 'La nota', garage: 'El garage', donde: 'Dónde lo vas a ver', como: 'Cómo funciona', dudas: 'Dudas', presupuesto: 'El presupuesto' },
  en: { inicio: 'The front page', nota: 'The story', garage: 'The garage', donde: 'Where you’ll see it', como: 'How it works', dudas: 'FAQ', presupuesto: 'The budget' },
} as const;

/* the garage page is its own chunk: start fetching it while the visitor is still reading */
const prefetchGarage = () => import('../garage/GaragePage');

export function LandingPage() {
  const { lang, t } = useLocale();
  const door = useDoor();
  const navigate = useNavigate();
  const { hash } = useLocation();

  // arriving with #section (e.g. coming back from the garage): land on that section
  useLayoutEffect(() => {
    const el = hash ? document.getElementById(hash.slice(1)) : null;
    if (el) el.scrollIntoView({ block: 'start' }); else scrollTo(0, 0);
  }, []);

  // in-page links travel behind the garage door
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest?.('a[href^="#"]'); if (!a) return;
      const id = a.getAttribute('href')!.slice(1), target = id && document.getElementById(id); if (!target) return;
      e.preventDefault();
      door((NAMES[lang] as Record<string, string>)[id] || '', () => {
        if (id === 'inicio') scrollTo(0, 0); else target.scrollIntoView({ block: 'start' });
        history.replaceState(history.state, '', '#' + id);
      });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [door, lang]);

  // warm up the 3D bits when the browser has nothing better to do
  useEffect(() => {
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (saveData) return;
    const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 2500));
    const h = idle(() => { prefetchShowroom(); prefetchGarage(); });
    return () => (window.cancelIdleCallback ?? clearTimeout)(h as number);
  }, []);

  const enterGarage = (id?: string) => door(t('doorIn'), () => navigate(id ? `/garage/${id}` : '/garage'));

  return (
    <>
      <Graffiti />
      <Ticker />
      <Header />
      <main className="wrap" id="inicio">
        <Hero />
        <Meter />
        <HowItWorks />
        <div className="checker" aria-hidden="true" />
        <Showroom onEnter={enterGarage} />
        <div className="checker" aria-hidden="true" style={{ transform: 'rotate(.5deg)' }} />
        <Where />
        <News />
        <Budget />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
