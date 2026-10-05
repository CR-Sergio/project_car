import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useDoor } from '../../app/door';
import { Ransom } from '../../components/Ransom';
import { BRAND_PARTS, NAMES_CAPACITY, ORDER, PART_BY_ID, PARTS, ZONES } from '../../data/parts';
import { REDUCED } from '../../lib/motion';
import { useLocale } from '../../state/locale';
import { useSales } from '../../state/sales';
import { createGarage, type GarageHandle } from '../../three/garage';
import { CheckoutModal } from './CheckoutModal';
import '../../styles/garage.css';

const STATS = ['vis', 'tam', 'cuadro'] as const;
/* the last part looked at, so "Entrar al garage" opens where you left off */
let lastPart: string | null = null;

/** /garage and /garage/:partId — the full-screen, game-style garage. */
export default function GaragePage() {
  const { partId } = useParams();
  const navigate = useNavigate();
  const door = useDoor();
  const { t, cur, money, goal, nameOf, zoneOf, priceOf } = useLocale();
  const { sold, supporters, raisedIn } = useSales();
  const names = useMemo(() => supporters.map(x => x.name), [supporters]);
  const roofFull = names.length >= NAMES_CAPACITY;
  const selected = partId && PART_BY_ID[partId] ? partId : (lastPart ?? ORDER[0].id);
  const [buying, setBuying] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const stage = useRef<HTMLDivElement>(null), stats = useRef<HTMLElement>(null), menu = useRef<HTMLElement>(null);
  const handle = useRef<GarageHandle | null>(null);
  const selectRef = useRef<(id: string) => void>(() => {});

  const select = useCallback((id: string) => { navigate(`/garage/${id}`, { replace: true }); }, [navigate]);
  selectRef.current = select;
  const step = (d: number) => { const i = ORDER.findIndex(p => p.id === selected); select(ORDER[(i + d + ORDER.length) % ORDER.length].id); };
  const leave = () => door(t('doorOut'), () => navigate({ pathname: '/', hash: '#garage' }));

  // page chrome: no page scroll behind the garage
  useEffect(() => {
    document.documentElement.classList.add('in-garage');
    setTimeout(() => menu.current?.querySelector<HTMLElement>('.g-item[aria-current="true"]')?.focus({ preventScroll: true }), 50);
    return () => document.documentElement.classList.remove('in-garage');
  }, []);

  // the 3D scene lives as long as the page (layout effect: it must exist before the first part is picked below)
  useLayoutEffect(() => {
    handle.current = createGarage(stage.current!, sold, names, {
      onPart: id => selectRef.current(id),
      onLoaded: () => setStatus('ready'),
      onError: () => setStatus('error'),
    });
    return () => { handle.current?.dispose(); handle.current = null; };
    // sold changes are pushed by the effect below
  }, []);
  useEffect(() => { handle.current?.setSold(sold); }, [sold]);
  useEffect(() => { handle.current?.setNames(names); }, [names]);

  // picking a part: camera flies there, card swaps in, bars fill up
  useLayoutEffect(() => {
    lastPart = selected; handle.current?.select(selected);
    const el = stats.current; if (!el) return;
    if (!REDUCED) { el.classList.remove('swap'); void el.offsetWidth; el.classList.add('swap'); }
    el.querySelectorAll('.segs i').forEach(d => d.classList.remove('on'));
    let r2 = 0; const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => el.querySelectorAll<HTMLElement>('.segs').forEach(sg => {
      const v = +sg.dataset.v!; sg.querySelectorAll('i').forEach((d, k) => d.classList.toggle('on', k < v));
    })); });
    menu.current?.querySelector('.g-item[aria-current="true"]')?.scrollIntoView({ block: 'nearest' });
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); };
  }, [selected]);

  // keyboard: arrows change part, Enter buys, Esc leaves
  const keys = useRef<(e: KeyboardEvent) => void>(() => {});
  keys.current = e => {
    if (buying) return;
    const focusCurrent = () => requestAnimationFrame(() => menu.current?.querySelector<HTMLElement>('.g-item[aria-current="true"]')?.focus({ preventScroll: true }));
    if (e.key === 'Escape') { e.preventDefault(); leave(); }
    else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); step(1); focusCurrent(); }
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); step(-1); focusCurrent(); }
    else if (e.key === 'Enter' && (e.target as Element).closest?.('.g-item')) { e.preventDefault(); if (canBuy) setBuying(selected); }
  };
  useEffect(() => {
    const on = (e: KeyboardEvent) => keys.current(e);
    addEventListener('keydown', on); return () => removeEventListener('keydown', on);
  }, []);

  const p = PART_BY_ID[selected], isNames = p.kind === 'names', s = isNames ? undefined : sold[selected], idx = ORDER.indexOf(p);
  const canBuy = isNames ? !roofFull : !s;
  const raised = raisedIn(cur), pct = Math.min(100, raised / goal * 100), n = Object.keys(sold).length;
  const closeCheckout = useCallback(() => setBuying(null), []);

  return (
    <div id="taller" aria-label="Garage de piezas">
      <div className="g-stage" ref={stage}>
        {status !== 'ready' && <div className="g-loading">{status === 'error' ? t('loadErr') : t('loading')}</div>}
      </div>
      <div className="g-shade" aria-hidden="true" />
      <header className="g-top">
        <button className="g-back" onClick={leave}><span className="key">Esc</span> <span>{t('g.back')}</span></button>
        <Ransom as="h2" es="EL GARAGE" en="THE GARAGE" seed={31} bold />
        <div className="g-meta">
          <div><b>{money(raised)}</b> <span>{t('ofGoal', { g: money(goal) })}</span></div>
          <div className="g-track"><div style={{ width: pct + '%' }} /></div>
          <div className="g-sub">{t('soldOf', { n, N: BRAND_PARTS.length })} · {t('namesCount', { k: names.length })}</div>
        </div>
      </header>
      <nav className="g-menu" ref={menu} aria-label="Piezas del carro">
        {ZONES.map(z => (
          <div className="g-zone" key={z}>
            <div className="g-zlabel">{zoneOf(z)}</div>
            {PARTS.filter(q => q.zone === z).map(q => {
              const qn = q.kind === 'names', qs = qn ? undefined : sold[q.id];
              return (
                <button key={q.id} className={'g-item' + (qs ? ' sold' : '') + (qn ? ' names' : '')} aria-current={q.id === selected} onClick={() => select(q.id)}>
                  <span className="in">
                    <i className="chip" style={{ background: qn ? '#f1c232' : qs ? qs.color : '#ddd6c6' }} />
                    <span className="nm">{nameOf(q)}</span><span className="pr">{qn ? t('perName', { p: money(priceOf(q)) }) : qs ? t('soldL') : money(priceOf(q))}</span>
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>
      <aside className="g-stats" ref={stats} aria-live="polite">
        <span className="tape" aria-hidden="true" />
        <div className="g-eyebrow">{t('piece', { z: zoneOf(p.zone), i: idx + 1, N: ORDER.length })}</div>
        <h3>{nameOf(p)}</h3>
        <div className="g-price">{money(priceOf(p))} <small>{cur}{isNames ? ' ' + t('eachName') : ''}</small></div>
        {isNames
          ? <div className="g-status free">{t('namesOf', { k: names.length, cap: NAMES_CAPACITY })}</div>
          : <div className={'g-status ' + (s ? 'sold' : 'free')}>{s ? t('soldTo', { b: s.brand }) : t('free')}</div>}
        {isNames && <p className="g-names">{t('namesPitch')} {names.length > 0 && <><br /><b>{t('namesLast')}</b> {names.slice(-5).reverse().join(' · ')}</>}</p>}
        <div className="g-statlist">
          {STATS.map(k => (
            <div className="stat" key={k}><span>{t(k)}</span><div className="segs" data-v={p[k]}>{Array.from({ length: 10 }, (_, i) => <i key={i} />)}</div><b>{p[k]}</b></div>
          ))}
        </div>
        <dl className="g-spec"><dt>{t('area')}</dt><dd>{p.size}</dd><dt>{t('incl')}</dt><dd>{isNames ? t('namesIncl') : t('inclTxt')}</dd></dl>
        <div className="g-actions">
          <button className="g-arrow" aria-label={t('prev')} onClick={() => step(-1)}>◀</button>
          <button className="btn" disabled={!canBuy} onClick={() => setBuying(selected)}>{isNames ? (roofFull ? t('namesFull') : t('addName')) : s ? t('taken') : t('buy')}</button>
          <button className="g-arrow" aria-label={t('next')} onClick={() => step(1)}>▶</button>
        </div>
        <p className="g-fine">{t('fine')}</p>
      </aside>
      <div className="g-keys" aria-hidden="true">
        <span><span className="key">↑</span><span className="key">↓</span><span>{t('g.k1')}</span></span>
        <span><span className="key">Enter</span><span>{t('g.k2')}</span></span>
        <span><span className="key">Arrastra</span><span>{t('g.k3')}</span></span>
        <span><span className="key">Esc</span><span>{t('g.k4')}</span></span>
      </div>
      {buying && <CheckoutModal partId={buying} onClose={closeCheckout} />}
    </div>
  );
}
