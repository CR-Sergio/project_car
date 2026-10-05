import { useEffect, useRef } from 'react';
import { rng } from '../lib/rng';

/* The street wall behind the content: buffed-over patches, wheat-pasted posters half torn off, a stencil of the
   Palio, tags with paint drips and overspray, and sticker slaps on top. Placed once per layout (seeded, so it is
   always the same wall) and re-placed when the page height changes: fonts, language, the newspaper, resizes. */
const TAGS: [string, string][] = [['PROYECT', 'sedg throw'], ['palio 13', 'wet'], ['MTY', 'sedg'], ['FULL GAS', 'marker'], ['NL 81', 'sedg throw'], ['RÁPIDO', 'wet'], ['13', 'sedg throw'], ['SIN FRENOS', 'marker'], ['NO ESTACIONARSE', 'stencil'], ['VROOM', 'wet'], ['REGIO', 'sedg'], ['PIEZA X PIEZA', 'marker']];
const COLS = ['#a8343a', '#a88c3a', '#4a6a95', '#d6cfbf', '#6f6b75', '#3f8a5c', '#cfc8b8'];
const POSTERS: { lines: string[]; sub?: string; bg?: string; fg?: string }[] = [
  { lines: ['SE VENDE', 'POR', 'PEDAZOS'], sub: 'pregunte por el palio' },
  { lines: ['GRAN', 'PREMIO', 'REGIO'], sub: 'domingo · 10 am', bg: '#c9262e', fg: '#efe8d8' },
  { lines: ['TALLER', '13'], sub: 'hojalatería y pintura', bg: '#d8b23a' },
  { lines: ['FULL', 'GAS'], bg: '#141214', fg: '#e8c540' },
  { lines: ['PALIO', '2013'], sub: 'una pieza, una marca' },
  { lines: ['VROOM'], sub: 'mty · nl', bg: '#2f5fb8', fg: '#efe8d8' },
];
const HELLO = ['PALIO', 'el 13', 'regio', 'GAS!', 'MTY'];
const CAR = `url("data:image/svg+xml,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 80'><path fill-rule='evenodd' d='M6 60 L8 46 Q10 38 22 36 L54 31 L76 13 Q82 9 94 9 L142 9 Q154 9 162 17 L180 33 Q194 37 197 48 L197 60 L176 60 A22 22 0 0 0 132 60 L72 60 A22 22 0 0 0 28 60 Z M84 17 L64 31 L108 31 L108 17 Z M116 17 L116 31 L170 31 L156 19 Q152 17 146 17 Z'/><circle cx='50' cy='62' r='16'/><circle cx='154' cy='62' r='16'/></svg>")}")`;

type R = () => number;
function torn(r: R) {
  const pts: string[] = [], n = 7, j = (a: number) => (r() * a).toFixed(1);
  for (let i = 0; i <= n; i++) pts.push(`${(i / n * 100).toFixed(1)}% ${j(6)}%`);
  for (let i = 1; i <= 4; i++) pts.push(`${100 - +j(5)}% ${(i / 4 * 100).toFixed(1)}%`);
  // the bottom edge is ripped off unevenly, sometimes a big chunk is missing
  const chunk = r() < .5 ? Math.floor(r() * n) : -1;
  for (let i = n - 1; i >= 0; i--) pts.push(`${(i / n * 100).toFixed(1)}% ${100 - (i === chunk ? 18 + +j(20) : +j(8))}%`);
  for (let i = 3; i > 0; i--) pts.push(`${j(5)}% ${(i / 4 * 100).toFixed(1)}%`);
  return `polygon(${pts.join(',')})`;
}
function el(cls: string, css: Partial<CSSStyleDeclaration> & Record<string, string>, text?: string) {
  const d = document.createElement('div'); d.className = cls;
  for (const [k, v] of Object.entries(css)) if (k.startsWith('--')) d.style.setProperty(k, v as string); else (d.style as unknown as Record<string, string>)[k] = v as string;
  if (text) d.textContent = text; return d;
}

function place(g: HTMLDivElement) {
  g.style.height = '0px'; g.replaceChildren();
  const H = document.documentElement.scrollHeight, W = document.documentElement.clientWidth, r = rng(81), k = W < 640 ? .45 : 1;
  const n = Math.max(5, Math.round(H / 720)), band = H / n;
  const px = (v: number) => Math.round(v) + 'px', pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  const back = document.createDocumentFragment(), mid = document.createDocumentFragment(), front = document.createDocumentFragment(), top = document.createDocumentFragment();

  // buffed-over patches (old tags painted over in a slightly different grey)
  for (let i = 0; i < Math.round(n * .8); i++)
    back.appendChild(el('buff', { left: px(r() * W * .8 - W * .1), top: px(r() * H), width: px(160 + r() * 380), height: px(70 + r() * 190) }));

  // wheat-pasted posters along the edges (half off the wall, where the content does not cover them),
  // sometimes pasted twice in a row like a real poster run
  for (let i = 0, m = Math.round(n * .9); i < m; i++) {
    const P = POSTERS[i % POSTERS.length], w = (150 + r() * 70) * k, left = i % 2 === 1;
    const x = left ? -w * .45 + r() * W * .03 : W - w * .55 - r() * W * .03, y = i * (H / m) + r() * band * .4;
    const run = r() < .35 ? 2 : 1, rot = r() * 8 - 4, op = (.3 + r() * .12).toFixed(2), flat = r() < .35, tear = torn(r);
    for (let c = 0; c < run; c++) {
      const d = el('poster' + (flat ? ' flat' : ''), {
        left: px(x + (left ? -1 : 1) * c * (w + 6 * k)), top: px(y + c * 6), width: px(w), fontSize: px(w * .2),
        rotate: (rot + c * 1.5).toFixed(1) + 'deg', opacity: op, '--torn': c ? torn(r) : tear,
        ...(P.bg ? { backgroundColor: P.bg } : {}), ...(P.fg ? { color: P.fg } : {}),
      });
      P.lines.forEach(l => { const b = document.createElement('b'); b.textContent = l; d.appendChild(b); });
      if (P.sub) { const s = document.createElement('i'); s.textContent = P.sub; d.appendChild(s); }
      mid.appendChild(d);
    }
  }

  // stencil of the Palio with its caption
  for (let i = 0; i < Math.max(2, Math.round(n / 3)); i++) {
    const color = pick(['#d6cfbf', '#a8343a', '#a88c3a']), w = (200 + r() * 140) * k, x = r() * (W - w), y = (i + .5) * (H / Math.max(2, Math.round(n / 3))) + r() * band * .3;
    mid.appendChild(el('stencil-car', { left: px(x), top: px(y), width: px(w), color, opacity: '.13', '--car': CAR, rotate: (r() * 6 - 3).toFixed(1) + 'deg' }));
    mid.appendChild(el('stencil-txt', { left: px(x + w * .1), top: px(y + w * .42), fontSize: px(w * .07), color, opacity: '.14' }, pick(['PIEZA X PIEZA', 'SE VENDE', 'PALIO 13'])));
  }

  // tags: overspray halo + the piece + drips running down
  for (let i = 0; i < n; i++) {
    const [t, c] = TAGS[i % TAGS.length], color = COLS[Math.floor(r() * COLS.length)];
    const fs = (c.includes('stencil') ? 34 : 70 + r() * 120) * k, x = r() * W * .9 - W * .12, y = i * band + r() * band * .6;
    const op = c.includes('stencil') ? .16 : .13 + r() * .1;
    if (!c.includes('stencil')) front.appendChild(el('mist', { left: px(x - fs * .3), top: px(y - fs * .5), width: px(fs * t.length * .65 + fs * .6), height: px(fs * 2), color }));
    const d = el('tag ' + c, { fontSize: px(fs), color, opacity: op.toFixed(2), left: px(x), top: px(y), rotate: (r() * 22 - 14).toFixed(1) + 'deg' }, t);
    if (!c.includes('stencil')) for (let j = 0, m = 2 + Math.floor(r() * 4); j < m; j++)
      d.appendChild(el('drip', { left: (5 + r() * 90).toFixed(1) + '%', height: px(fs * (.15 + r() * .55)) }));
    front.appendChild(d);
  }

  // sticker slaps, in little clusters
  for (let i = 0; i < Math.round(n * .7); i++) {
    let cx = r() * W * .9, cy = r() * H;
    for (let j = 0, m = 2 + Math.floor(r() * 3); j < m; j++) {
      const kind = pick(['hello', 'dot', 'tagbox', 'check', 'hello']), rot = (r() * 30 - 15).toFixed(1) + 'deg';
      const base = { left: px(cx), top: px(cy), rotate: rot, opacity: (.45 + r() * .2).toFixed(2), scale: String(k < 1 ? .8 : 1) };
      let s: HTMLDivElement;
      if (kind === 'hello') { s = el('slap hello', base, 'HELLO my name is'); const n2 = document.createElement('span'); n2.textContent = pick(HELLO); s.appendChild(n2); }
      else if (kind === 'dot') { const [bg, fg] = pick([['#f1c232', '#141214'], ['#141214', '#f1c232'], ['#e2252e', '#ece6d6']]); s = el('slap dot', { ...base, background: bg, color: fg }, '13'); }
      else if (kind === 'tagbox') { const [bg, fg] = pick([['#ece6d6', '#141214'], ['#3fb36b', '#141214'], ['#2f6fe0', '#ece6d6']]); s = el('slap tagbox', { ...base, background: bg, color: fg }, pick(['MTY · NL', 'full gas', 'palio 13', 'regio'])); }
      else s = el('slap check', base);
      top.appendChild(s); cx += 40 + r() * 70; cy += r() * 50 - 25;
    }
  }

  g.append(back, mid, front, top);
  g.style.height = H + 'px';
}

export function Graffiti() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const g = ref.current!;
    let to: ReturnType<typeof setTimeout> | undefined, lastW = -1, lastH = -1;
    const run = () => {
      const W = document.documentElement.clientWidth, H = document.body.offsetHeight;
      if (W === lastW && H === lastH) return; lastW = W; lastH = H; place(g);
    };
    const later = () => { clearTimeout(to); to = setTimeout(run, 250); };
    run();
    document.fonts?.ready.then(later);
    const ro = new ResizeObserver(later); ro.observe(document.body);
    addEventListener('resize', later);
    return () => { clearTimeout(to); ro.disconnect(); removeEventListener('resize', later); };
  }, []);
  return <div id="graffiti" aria-hidden="true" ref={ref} />;
}
