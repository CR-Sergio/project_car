import { useEffect, useRef, useState, type FormEvent } from 'react';
import { IVA } from '../../data/budget';
import { PAY_MODE } from '../../data/config';
import { REGIMENES, RFC_RE } from '../../data/legal';
import { PART_BY_ID } from '../../data/parts';
import { brandCanvas } from '../../lib/brandCanvas';
import { escapeHtml } from '../../lib/format';
import { confetti } from '../../lib/confetti';
import { useToast } from '../../app/toast';
import { useLocale } from '../../state/locale';
import { useSales } from '../../state/sales';
import '../../styles/checkout.css';

type Step = { kind: 'form' } | { kind: 'redirect'; url: string; via: string } | { kind: 'done'; brand: string; via: string };

/** Buy a part: brand, color, email, optional logo, payment method. In test mode the payment is simulated. */
export function CheckoutModal({ partId, onClose }: { partId: string; onClose: () => void }) {
  const { t, cur, nameOf, money, priceOf } = useLocale();
  const { markSold } = useSales();
  const toast = useToast();
  const p = PART_BY_ID[partId], usd = cur === 'USD';
  const [step, setStep] = useState<Step>({ kind: 'form' });
  const [brand, setBrand] = useState(''), [color, setColor] = useState('#2f6fe0'), [email, setEmail] = useState(''), [link, setLink] = useState('');
  const [logo, setLogo] = useState<HTMLImageElement | null>(null);
  const [method, setMethod] = useState<'mp' | 'stripe'>(usd ? 'stripe' : 'mp');
  const [err, setErr] = useState(''), [processing, setProcessing] = useState(false);
  const [wantsInvoice, setWantsInvoice] = useState(false);
  const [inv, setInv] = useState({ rfc: '', razon: '', regimen: '601', cp: '' });
  const [accepted, setAccepted] = useState(false), [noNews, setNoNews] = useState(false);
  const subtotal = priceOf(p), iva = Math.round(subtotal * IVA), total = subtotal + iva;
  const modal = useRef<HTMLDivElement>(null), pv = useRef<HTMLCanvasElement>(null), first = useRef<HTMLInputElement>(null), ok = useRef<HTMLButtonElement>(null);

  const closeRef = useRef(onClose); closeRef.current = onClose;
  // focus goes into the sheet, stays there (Tab wraps), and returns where it was on close
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null; first.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopImmediatePropagation(); closeRef.current(); return; }
      if (e.key !== 'Tab') return;
      const f = [...modal.current!.querySelectorAll<HTMLElement>('button,input,a[href]')].filter(el => !(el as HTMLButtonElement).disabled);
      if (!f.length) return; const a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    };
    addEventListener('keydown', onKey, true);
    return () => { removeEventListener('keydown', onKey, true); before?.focus?.({ preventScroll: true }); };
  }, []);

  useEffect(() => {
    const c = pv.current; if (!c) return;
    c.getContext('2d')!.drawImage(brandCanvas({ brand: brand || t('yourBrand'), color, img: logo }, 320, 160), 0, 0);
  }, [brand, color, logo, t, step]);
  useEffect(() => { if (step.kind === 'done') ok.current?.focus(); }, [step]);

  function pickLogo(f: File | undefined) {
    if (!f) return; const url = URL.createObjectURL(f), im = new Image();
    im.onload = () => { setLogo(im); URL.revokeObjectURL(url); }; im.src = url;
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const b = brand.trim(), m = email.trim();
    if (!b) return setErr(t('errBrand'));
    if (!/^\S+@\S+\.\S+$/.test(m)) return setErr(t('errEmail'));
    const rfc = inv.rfc.trim().toUpperCase();
    if (wantsInvoice && !RFC_RE.test(rfc)) return setErr(t('errRfc'));
    if (wantsInvoice && (!inv.razon.trim() || !/^\d{5}$/.test(inv.cp.trim()))) return setErr(t('errInvoice'));
    if (!accepted) return setErr(t('errAccept'));
    const invoice = wantsInvoice ? { rfc, razon: inv.razon.trim().toUpperCase(), regimen: inv.regimen, cp: inv.cp.trim(), uso: 'G03' } : null;
    const via = method === 'mp' ? 'Mercado Pago' : 'Stripe';
    if (PAY_MODE === 'live') {
      const url = usd && p.stripeUsd ? p.stripeUsd : p[method];
      if (!url) return setErr(t('errLink'));
      setStep({ kind: 'redirect', url, via }); return;
    }
    setProcessing(true);
    setTimeout(() => {
      markSold(partId, { brand: b, color, img: logo, email: m, link: link.trim(), invoice, news: !noNews, acceptedAt: new Date().toISOString() });
      setStep({ kind: 'done', brand: b, via }); confetti(color); toast(t('toast'));
    }, 1100);
  }

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="mTitle" ref={modal} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet paper">
        {step.kind === 'redirect' && (
          <div className="done"><p>{t('opens', { x: step.via })}</p><a className="btn" href={step.url} target="_blank" rel="noopener">{t('goPay')}</a></div>
        )}
        {step.kind === 'done' && (
          <div className="done">
            <div className="big">{t('yours')}</div>
            <p><span dangerouslySetInnerHTML={{ __html: t('nowHas', { part: escapeHtml(nameOf(p)), b: escapeHtml(step.brand) }) }} /><br />{t('simulated', { x: step.via })}</p>
            <button className="btn" ref={ok} onClick={onClose}>{t('seeMine')}</button>
          </div>
        )}
        {step.kind === 'form' && <>
          <h3 id="mTitle">{nameOf(p)}</h3><p className="sub">{money(subtotal)} {cur} {t('plusIva')} · {p.size}</p>
          {PAY_MODE === 'test' && <p className="testbar">{t('test')}</p>}
          <form noValidate onSubmit={submit}>
            <div className="row2">
              <div className="field"><label htmlFor="f-brand">{t('brand')}</label><input ref={first} type="text" id="f-brand" maxLength={40} required placeholder={t('brandPh')} value={brand} onChange={e => setBrand(e.target.value)} /></div>
              <div className="field"><label htmlFor="f-color">{t('color')}</label><input type="color" id="f-color" value={color} onChange={e => setColor(e.target.value)} /></div>
            </div>
            <div className="field"><label htmlFor="f-email">{t('email')}</label><input type="email" id="f-email" required placeholder="tu@correo.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div className="field"><label htmlFor="f-link">{t('link')}</label><input type="url" id="f-link" placeholder="https://" value={link} onChange={e => setLink(e.target.value)} /></div>
            <div className="field"><label htmlFor="f-logo">{t('logo')}</label><input type="file" id="f-logo" accept="image/png,image/jpeg,image/webp" onChange={e => pickLogo(e.target.files?.[0])} /></div>
            <div className="preview"><canvas ref={pv} width={320} height={160} /><span>{t('preview')}</span></div>
            <span className="legend-label">{t('payWith')}</span>
            <div className="pay">
              {!usd && <label><input type="radio" name="pm" value="mp" checked={method === 'mp'} onChange={() => setMethod('mp')} /> Mercado Pago</label>}
              <label><input type="radio" name="pm" value="stripe" checked={method === 'stripe'} onChange={() => setMethod('stripe')} /> Stripe</label>
            </div>
            {usd && <p className="sub">{t('usdNote')}</p>}
            <label className="check"><input type="checkbox" checked={wantsInvoice} onChange={e => setWantsInvoice(e.target.checked)} /> {t('invoice')}</label>
            {wantsInvoice && (
              <fieldset className="invoice">
                <div className="row2">
                  <div className="field"><label htmlFor="f-rfc">{t('rfc')}</label><input type="text" id="f-rfc" maxLength={13} autoCapitalize="characters" value={inv.rfc} onChange={e => setInv({ ...inv, rfc: e.target.value })} /></div>
                  <div className="field"><label htmlFor="f-cp">{t('cp')}</label><input type="text" id="f-cp" inputMode="numeric" maxLength={5} value={inv.cp} onChange={e => setInv({ ...inv, cp: e.target.value })} /></div>
                </div>
                <div className="field"><label htmlFor="f-razon">{t('razon')}</label><input type="text" id="f-razon" value={inv.razon} onChange={e => setInv({ ...inv, razon: e.target.value })} /></div>
                <div className="field"><label htmlFor="f-reg">{t('regimen')}</label>
                  <select id="f-reg" value={inv.regimen} onChange={e => setInv({ ...inv, regimen: e.target.value })}>{REGIMENES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
                <p className="fine">{t('usoCfdi')}</p>
              </fieldset>
            )}
            <dl className="totals">
              <dt>{t('subtotal')}</dt><dd>{money(subtotal)}</dd>
              <dt>{t('ivaLine', { p: Math.round(IVA * 100) })}</dt><dd>{money(iva)}</dd>
              <dt>{t('total')}</dt><dd>{money(total)} {cur}</dd>
            </dl>
            <label className="check"><input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} /> <span dangerouslySetInnerHTML={{ __html: t('accept') }} /></label>
            <label className="check"><input type="checkbox" checked={noNews} onChange={e => setNoNews(e.target.checked)} /> {t('noNews')}</label>
            <p className="fine">{t('privacyShort', { who: 'Proyect Car' })} {t('restrictedNote')}</p>
            <p className="err">{err}</p>
            <div className="actions">
              <button type="button" className="linkbtn" onClick={onClose}>{t('cancel')}</button>
              <button className="btn" disabled={processing}>{processing ? t('processing') : t('pay', { p: money(total) })}</button>
            </div>
          </form>
        </>}
      </div>
    </div>
  );
}

