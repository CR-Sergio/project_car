import { useEffect, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Graffiti } from '../../components/Graffiti';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { Ransom } from '../../components/Ransom';
import { LEGAL, isPending } from '../../data/legal';
import { useLocale } from '../../state/locale';
import '../../styles/landing.css';
import '../../styles/legal.css';

/** a value from src/data/legal.ts; highlighted while it is still a [PLACEHOLDER] */
export function V({ v }: { v: string | number }) {
  return isPending(v) ? <mark className="pending" title="Falta llenar en src/data/legal.ts">{v}</mark> : <>{v}</>;
}

export function LegalLayout({ title, titleEn, seed, stamp, children }: { title: string; titleEn: string; seed: number; stamp: string; children: ReactNode }) {
  const { lang, t } = useLocale();
  useEffect(() => { scrollTo(0, 0); }, []);
  return (
    <>
      <Graffiti />
      <Header />
      <main className="wrap legal">
        <div className="sec-head"><Ransom as="h1" es={title} en={titleEn} seed={seed} bold /></div>
        <article className="legal-doc">
          <span className="tape" aria-hidden="true" />
          <span className="stamp" aria-hidden="true">{stamp}</span>
          <div className="meta"><span>{LEGAL.sitio}</span><span>Última actualización: {LEGAL.actualizado}</span></div>
          {lang === 'en' && <p className="note">{t('legal.enNote')}</p>}
          {children}
        </article>
        <Link className="legal-back" to="/">← {t('legal.back')}</Link>
      </main>
      <Footer />
    </>
  );
}
