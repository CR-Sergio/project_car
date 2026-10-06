import { useEffect, useRef, useState, type FormEvent } from 'react';
import { PAY_MODE } from '../../data/config';
import { MESSAGES_PER_PART, MESSAGE_MAX, MESSAGE_RE, NAME_MAX, NAME_RE, PART_BY_ID, cleanName } from '../../data/parts';
import { brandCanvas } from '../../lib/brandCanvas';
import { namesCanvas } from '../../lib/namesCanvas';
import { escapeHtml } from '../../lib/format';
import { confetti } from '../../lib/confetti';
import { useToast } from '../../app/toast';
import { useLocale } from '../../state/locale';
import { useSales } from '../../state/sales';
import '../../styles/checkout.css';

type Step = { kind: 'form' } | { kind: 'redirect'; url: string; via: string } | { kind: 'done'; brand: string; via: string };

/** Buy a part (brand, color, email, optional logo) or a message on a fender (message, optional free name
    for the roof, email). In test mode the payment is simulated. */
export function CheckoutModal({ partId, onClose }: { partId: string; onClose: () => void }) {
  const { t, cur, nameOf, money, priceOf } = useLocale();
  const { markSold, addMessage, wall } = useSales();
  const toast = useToast();
  const p = PART_BY_ID[partId], usd = cur === 'USD', isMsg = p.kind === 'messages';
  const [msg, setMsg] = useState(''), [roof, setRoof] = useState(true), [who, setWho] = useState(''), [consent, setConsent] = useState(false);
  const [step, setStep] = useState<Step>({ kind: 'form' });
  const [brand, setBrand] = useState(''), [color, setColor] = useState('#2f6fe0'), [email, setEmail] = useState(''), [link, setLink] = useState('');
  const [logo, setLogo] = useState<HTMLImageElement | null>(null);
  const [method, setMethod] = useState<'mp' | 'stripe'>(usd ? 'stripe' : 'mp');
  const [err, setErr] = useState(''), [processing, setProcessing] = useState(false);
  const [accepted, setAccepted] = useState(false), [finalSale, setFinalSale] = useState(false), [noNews, setNoNews] = useState(false);
  const total = priceOf(p);
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
    const g = c.getContext('2d')!;
    if (isMsg) {
      const mine = cleanName(msg) || t('msgPh').replace(/^\S+\s/, '');
      g.drawImage(namesCanvas([...(wall.byPart[partId] ?? []).slice(-7), mine], 8, 320, 160, 'MENSAJES DE LA RAZA', mine, 5), 0, 0);
    } else g.drawImage(brandCanvas({ brand: brand || t('yourBrand'), color, img: logo }, 320, 160), 0, 0);
  }, [brand, color, logo, t, step, isMsg, msg, wall, partId]);
  useEffect(() => { if (step.kind === 'done') ok.current?.focus(); }, [step]);

  function pickLogo(f: File | undefined) {
    if (!f) return; const url = URL.createObjectURL(f), im = new Image();
    im.onload = () => { setLogo(im); URL.revokeObjectURL(url); }; im.src = url;
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const b = isMsg ? cleanName(msg) : brand.trim(), m = email.trim(), name = cleanName(who);
    if (isMsg && (!b || b.length > MESSAGE_MAX || !MESSAGE_RE.test(b))) return setErr(t('errMsg', { max: MESSAGE_MAX }));
    if (isMsg && roof && (!name || name.length > NAME_MAX || !NAME_RE.test(name))) return setErr(t('errName', { max: NAME_MAX }));
    if (!isMsg && !b) return setErr(t('errBrand'));
    if (!/^\S+@\S+\.\S+$/.test(m)) return setErr(t('errEmail'));
    if (!accepted) return setErr(t('errAccept'));
    if (!finalSale) return setErr(t('errRefund'));
    if (isMsg && roof && !consent) return setErr(t('errNameConsent'));
    if (isMsg && (wall.byPart[partId]?.length ?? 0) >= MESSAGES_PER_PART) return setErr(t('msgFull'));
    const via = method === 'mp' ? 'Mercado Pago' : 'Stripe';
    if (PAY_MODE === 'live') {
      const url = usd && p.stripeUsd ? p.stripeUsd : p[method];
      if (!url) return setErr(t('errLink'));
      setStep({ kind: 'redirect', url, via }); return;
    }
    setProcessing(true);
    setTimeout(() => {
      const acceptedAt = new Date().toISOString();
      if (isMsg) addMessage({ text: b, part: partId, name: roof ? name : undefined, email: m, news: !noNews, acceptedAt });
      else markSold(partId, { brand: b, color, img: logo, email: m, link: link.trim(), news: !noNews, acceptedAt });
      setStep({ kind: 'done', brand: isMsg ? (roof ? name : '') : b, via }); confetti(isMsg ? '#f1c232' : color); if (!isMsg) toast(t('toast'));
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
            <div className="big">{isMsg ? t('yoursMsg') : t('yours')}</div>
            <p><span dangerouslySetInnerHTML={{ __html: isMsg ? (step.brand ? t('nowMsgRoof', { b: escapeHtml(step.brand) }) : t('nowMsg')) : t('nowHas', { part: escapeHtml(nameOf(p)), b: escapeHtml(step.brand) }) }} /><br />{t('simulated', { x: step.via })}</p>
            <button className="btn" ref={ok} onClick={onClose}>{t('seeMine')}</button>
          </div>
        )}
        {step.kind === 'form' && <>
          <h3 id="mTitle">{nameOf(p)}</h3><p className="sub">{money(total)} {cur}{isMsg ? ' ' + t('eachMsg') : ''} · {t('priceFinal')}{isMsg ? '' : ' · ' + p.size}</p>
          {PAY_MODE === 'test' && <p className="testbar">{t('test')}</p>}
          <form noValidate onSubmit={submit}>
            {isMsg ? <>
            <div className="field"><label htmlFor="f-msg">{t('msgLabel')}</label><input ref={first} type="text" id="f-msg" maxLength={MESSAGE_MAX} required placeholder={t('msgPh')} value={msg} onChange={e => setMsg(e.target.value)} /></div>
            <p className="fine">{t('msgHelp', { n: msg.length, max: MESSAGE_MAX })}</p>
            <div className="preview"><canvas ref={pv} width={320} height={160} /><span>{t('msgPreview')}</span></div>
            <label className="check"><input type="checkbox" checked={roof} onChange={e => setRoof(e.target.checked)} /> <b>{t('roofOpt')}</b></label>
            {roof && <>
              <div className="field"><label htmlFor="f-name">{t('nameLabel')}</label><input type="text" id="f-name" maxLength={NAME_MAX} placeholder={t('namePh')} value={who} onChange={e => setWho(e.target.value)} /></div>
              <p className="fine">{t('nameHelp', { max: NAME_MAX })}</p>
            </>}
            <div className="field"><label htmlFor="f-email">{t('email')}</label><input type="email" id="f-email" required placeholder="tu@correo.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
            </> : <>
            <div className="row2">
              <div className="field"><label htmlFor="f-brand">{t('brand')}</label><input ref={first} type="text" id="f-brand" maxLength={40} required placeholder={t('brandPh')} value={brand} onChange={e => setBrand(e.target.value)} /></div>
              <div className="field"><label htmlFor="f-color">{t('color')}</label><input type="color" id="f-color" value={color} onChange={e => setColor(e.target.value)} /></div>
            </div>
            <div className="field"><label htmlFor="f-email">{t('email')}</label><input type="email" id="f-email" required placeholder="tu@correo.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div className="field"><label htmlFor="f-link">{t('link')}</label><input type="url" id="f-link" placeholder="https://" value={link} onChange={e => setLink(e.target.value)} /></div>
            <div className="field"><label htmlFor="f-logo">{t('logo')}</label><input type="file" id="f-logo" accept="image/png,image/jpeg,image/webp" onChange={e => pickLogo(e.target.files?.[0])} /></div>
            <div className="preview"><canvas ref={pv} width={320} height={160} /><span>{t('preview')}</span></div>
            </>}
            <span className="legend-label">{t('payWith')}</span>
            <div className="pay">
              {!usd && <label><input type="radio" name="pm" value="mp" checked={method === 'mp'} onChange={() => setMethod('mp')} /> Mercado Pago</label>}
              <label><input type="radio" name="pm" value="stripe" checked={method === 'stripe'} onChange={() => setMethod('stripe')} /> Stripe</label>
            </div>
            {usd && <p className="sub">{t('usdNote')}</p>}
            <label className="check"><input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} /> <span dangerouslySetInnerHTML={{ __html: t(isMsg ? 'acceptName' : 'accept') }} /></label>
            <label className="check"><input type="checkbox" checked={finalSale} onChange={e => setFinalSale(e.target.checked)} /> <span dangerouslySetInnerHTML={{ __html: t(isMsg ? 'noRefundName' : 'noRefund') }} /></label>
            {isMsg && roof && <label className="check"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} /> {t('nameConsent')}</label>}
            <label className="check"><input type="checkbox" checked={noNews} onChange={e => setNoNews(e.target.checked)} /> {t('noNews')}</label>
            <p className="fine">{t('privacyShort', { who: 'Proyect Car' })}{isMsg ? '' : ' ' + t('restrictedNote')}</p>
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

