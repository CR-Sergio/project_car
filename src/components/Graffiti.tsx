import { useEffect, useRef } from 'react';
import { rng } from '../lib/rng';

/* Tags sprayed on the wall behind the content. Placed once per layout (seeded, so always the same wall)
   and re-placed when the page height changes: fonts, language, the newspaper unfolding, resizes. */
const TAGS: [string, string][] = [['PROYECT', 'sedg throw'], ['palio 13', 'wet'], ['MTY', 'sedg'], ['FULL GAS', 'marker'], ['NL 81', 'sedg throw'], ['RÁPIDO', 'wet'], ['13', 'sedg throw'], ['SIN FRENOS', 'marker'], ['NO ESTACIONARSE', 'stencil'], ['VROOM', 'wet'], ['REGIO', 'sedg'], ['PIEZA X PIEZA', 'marker']];
const COLS = ['#8b2b2f', '#8a7432', '#3a5578', '#cfc8b8', '#5d5a62', '#cfc8b8'];

function place(g: HTMLDivElement) {
  g.style.height = '0px'; g.replaceChildren();
  const H = document.documentElement.scrollHeight, W = document.documentElement.clientWidth, r = rng(81), k = W < 640 ? .45 : 1;
  const n = Math.max(5, Math.round(H / 720));
  const frag = document.createDocumentFragment();
  for (let i = 0; i < Math.round(n * .8); i++) {
    const b = document.createElement('div'); b.className = 'buff';
    b.style.left = Math.round(r() * W * .8 - W * .1) + 'px'; b.style.top = Math.round(r() * H) + 'px'; b.style.width = Math.round(160 + r() * 380) + 'px'; b.style.height = Math.round(70 + r() * 190) + 'px'; frag.appendChild(b);
  }
  for (let i = 0; i < n; i++) {
    const [t, c] = TAGS[i % TAGS.length], d = document.createElement('div'); d.className = 'tag ' + c; d.textContent = t;
    const fs = (c.includes('stencil') ? 34 : 70 + r() * 120) * k;
    d.style.fontSize = fs + 'px'; d.style.color = COLS[Math.floor(r() * COLS.length)];
    d.style.opacity = (c.includes('stencil') ? .12 : .09 + r() * .08).toFixed(2);
    d.style.left = Math.round(r() * W * .9 - W * .12) + 'px'; d.style.top = Math.round(i * (H / n) + r() * (H / n) * .6) + 'px';
    d.style.rotate = (r() * 22 - 14).toFixed(1) + 'deg'; frag.appendChild(d);
  }
  g.appendChild(frag);
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
