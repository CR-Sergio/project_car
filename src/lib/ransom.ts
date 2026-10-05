import { rng } from './rng';

/* Cut-paper "ransom note" letters. Pure layout: given text + seed it always returns the same letters,
   so the headline looks identical on every visit (same algorithm, same random call order as the original page). */
const A_UP = ['a1.webp', 'a2.webp', 'a3.webp', 'a4.webp', 'a5.webp', 'a9.webp'];
const FONTS = ["'Bowlby One'", "'Abril Fatface'", "'Rubik Mono One'", "'Bungee'", "'Alfa Slab One'", "'Special Elite'", "'Tinos'", "'UnifrakturMaguntia'"];
const SKINS = [['#ece6d6', '#141214'], ['#141214', '#ece6d6'], ['#e2252e', '#ece6d6'], ['#f1c232', '#141214'], ['#2f6fe0', '#141214'],
  ['#c4a273', '#141214'], ['#ece6d6', '#e2252e'], ['#3fb36b', '#141214'], ['#d9d0bb', '#2f6fe0'], ['#141214', '#f1c232'], ['#e6e1d3', '#141214']];
const A_B = ['a5.webp', 'a4.webp', 'a1.webp'];
const FONTS_B = ["'Bowlby One'", "'Alfa Slab One'", "'Archivo'"];
const SKINS_B = [['#ece6d6', '#141214'], ['#141214', '#ece6d6'], ['#e2252e', '#ffffff'], ['#f1c232', '#141214'], ['#141214', '#f1c232'], ['#ffffff', '#e2252e']];

type R = () => number;
function tear(r: R) {
  const pts: string[] = [], n = 18, j = (a: number) => (r() * a).toFixed(2);
  for (let i = 0; i <= n; i++) pts.push(`${(i / n * 100).toFixed(1)}% ${j(9)}%`);
  for (let i = 1; i <= 8; i++) pts.push(`${100 - +j(2.2)}% ${(i / 8 * 100).toFixed(1)}%`);
  for (let i = n - 1; i >= 0; i--) pts.push(`${(i / n * 100).toFixed(1)}% ${100 - +j(9)}%`);
  for (let i = 7; i > 0; i--) pts.push(`${j(2.2)}% ${(i / 8 * 100).toFixed(1)}%`);
  return `polygon(${pts.join(',')})`;
}
function torn(r: R) {
  const pts: string[] = [], j = () => (r() * 7).toFixed(1), n = 5;
  for (let i = 0; i <= n; i++) pts.push(`${(i / n * 100).toFixed(1)}% ${j()}%`);
  for (let i = 1; i <= n; i++) pts.push(`${100 - +j()}% ${(i / n * 100).toFixed(1)}%`);
  for (let i = n - 1; i >= 0; i--) pts.push(`${(i / n * 100).toFixed(1)}% ${100 - +j()}%`);
  for (let i = n - 1; i > 0; i--) pts.push(`${j()}% ${(i / n * 100).toFixed(1)}%`);
  return `polygon(${pts.join(',')})`;
}
function cut(r: R) {
  const k = () => (r() * 9).toFixed(1);
  return `polygon(${k()}% ${k()}%,${100 - +k()}% ${k()}%,${100 - +k()}% ${100 - +k()}%,${k()}% ${100 - +k()}%)`;
}

export interface Letter {
  i: number;
  transform: string;
  /** cut-out "A" photo, or a paper letter */
  img?: string;
  ch?: string;
  bg?: string;
  color?: string;
  font?: string;
  bgPos?: string;
  fontSize?: string;
  fontWeight?: string;
  lower?: boolean;
  clip?: string;
}
export interface RansomLayout { tear: string; words: Letter[][] }

export function layoutRansom(text: string, seed: number, bold: boolean): RansomLayout {
  const r = rng(seed * 9973 + text.length);
  const fonts = bold ? FONTS_B : FONTS, skins = bold ? SKINS_B : SKINS, aset = bold ? A_B : A_UP;
  const frame = tear(r);
  let aIdx = Math.floor(r() * 6), i = 0;
  const words = text.split(' ').map(w => {
    const out: Letter[] = [];
    for (const ch of w) {
      const rot = (r() * (bold ? 6 : 12) - (bold ? 3 : 6)).toFixed(1), dy = (r() * .12 - .06).toFixed(2), sc = (bold ? .96 + r() * .1 : .88 + r() * .24).toFixed(2);
      const L: Letter = { i: i++, transform: `translateY(${dy}em) rotate(${rot}deg) scale(${sc})` };
      if (ch === 'A') { L.img = '/img/' + aset[aIdx % aset.length]; aIdx += 1 + Math.floor(r() * 2); }
      else {
        const sk = skins[Math.floor(r() * skins.length)], f = fonts[Math.floor(r() * fonts.length)];
        L.bg = sk[0]; L.color = sk[1]; L.font = f + ",'Arial Black',sans-serif";
        L.bgPos = `${Math.floor(r() * 300)}px ${Math.floor(r() * 300)}px`;
        if (f.includes('Rubik') || f.includes('Bungee')) L.fontSize = '.82em';
        if (f.includes('Archivo')) L.fontWeight = '800';
        if (!bold && r() < .5 && !f.includes('Unifraktur')) L.lower = true;
        L.clip = r() < .55 ? torn(r) : cut(r);
        L.ch = ch;
      }
      out.push(L);
    }
    return out;
  });
  return { tear: frame, words };
}
