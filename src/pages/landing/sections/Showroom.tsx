import { useEffect, useRef, useState } from 'react';
import { Ransom } from '../../../components/Ransom';
import { MESSAGE_PARTS, PART_BY_ID, messagesStock, roomiestMessagePart } from '../../../data/parts';
import { useLocale } from '../../../state/locale';
import { useSales } from '../../../state/sales';
import type { ShowroomHandle } from '../../../three/showroom';

/* three.js and the model are only downloaded when the turntable is close to the screen (or the browser is idle) */
const loadShowroom = () => import('../../../three/showroom');
export const prefetchShowroom = () => loadShowroom().then(m => m.prefetch());

export function Showroom({ onEnter }: { onEnter: (id?: string) => void }) {
  const { t, nameOf, money, priceOf } = useLocale();
  const { sold, messages, wall } = useSales();
  const stage = useRef<HTMLDivElement>(null);
  const tip = useRef<HTMLDivElement>(null);
  const handle = useRef<ShowroomHandle | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  // latest values for callbacks living inside the 3D module
  const live = useRef({ sold, wall, onEnter, t, nameOf, money, priceOf });
  live.current = { sold, wall, onEnter, t, nameOf, money, priceOf };

  useEffect(() => {
    const host = stage.current!; let cancelled = false;
    const start = () => {
      io.disconnect();
      loadShowroom().then(({ createShowroom }) => {
        if (cancelled) return;
        handle.current = createShowroom(host, live.current.sold, live.current.wall, {
          onPart: id => live.current.onEnter(id),
          tip: {
            el: tip.current!,
            describe: id => {
              const { sold, t, nameOf, money, priceOf } = live.current, p = PART_BY_ID[id];
              if (p.kind === 'names') return { name: nameOf(p), detail: `${t('roofFree')} ${t('roofWith')}` };
              if (p.kind === 'messages') return { name: nameOf(p), detail: t('perName', { p: money(priceOf(p)) }) };
              return { name: nameOf(p), detail: sold[id] ? t('soldL') : money(priceOf(p)) };
            },
          },
          onLoaded: () => setStatus('ready'),
          onError: () => setStatus('error'),
        });
      }, () => !cancelled && setStatus('error'));
    };
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) start(); }, { rootMargin: '900px 0px' });
    io.observe(host);
    return () => { cancelled = true; io.disconnect(); handle.current?.dispose(); handle.current = null; };
  }, []);

  useEffect(() => { handle.current?.setSold(sold); }, [sold]);
  useEffect(() => { handle.current?.setWall(wall); }, [wall]);

  return (
    <section id="garage">
      <div className="tracks" style={{ left: -40 }} aria-hidden="true" />
      <div className="sec-head">
        <Ransom as="h2" es="EL GARAGE" en="THE GARAGE" seed={11} />
        <p>{t('gar.p')}</p>
      </div>
      <div className="showroom">
        <div className="stage" ref={stage}>
          {status !== 'ready' && <div className="loading">{status === 'error' ? t('loadErr') : t('loading')}</div>}
          <span className="badge">Fiat Palio 2013</span>
          <span className="hint">{t('gar.hint')}</span>
          <div className="tip" ref={tip} hidden />
        </div>
        <div className="show-bar">
          <div className="legend">
            <span><i style={{ background: '#ddd6c6' }} /><span>{t('gar.free')}</span></span>
            <span><i style={{ background: 'linear-gradient(90deg,#2f6fe0,#e2252e)' }} /><span>{t('gar.sold')}</span></span>
          </div>
          <button className="btn" type="button" onClick={() => onEnter()}>{t('gar.enter')}</button>
        </div>
      </div>
      <div className="roof-wall paper">
        <span className="tape" aria-hidden="true" />
        <div className="rw-head">
          <h3>{t('rw.title')}</h3>
          <span>{t('msgOf', { k: messages.length })}{messagesStock(messages).low && <b className="rw-low"> · {t('msgLow')}</b>}</span>
        </div>
        <p className="rw-names">{messages.length ? messages.map(m => `“${m.text}”${m.name ? ' — ' + m.name : ''}`).join(' · ') : t('rw.empty')}</p>
        {wall.names.length > 0 && <p className="rw-roof"><b>{t('rw.roof')}</b> {t('namesCount', { k: wall.names.length })}</p>}
        {messagesStock(messages).left > 0
          ? <button className="btn" type="button" onClick={() => onEnter(roomiestMessagePart(messages))}>{t('rw.cta', { p: money(priceOf(MESSAGE_PARTS[0])) })}</button>
          : <button className="btn" type="button" disabled>{t('msgSoldOut')}</button>}
      </div>
    </section>
  );
}
