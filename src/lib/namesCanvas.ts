import { rng } from './rng';

/* The supporters' roof: a paper sheet with a header and every name hand-written in a grid,
   alternating marker colors. Same canvas for the 3D roof and the checkout preview. */
const INKS = ['#141214', '#c41d25', '#1d4fb8', '#141214', '#2a7a4a'];

export function namesCanvas(names: string[], capacity: number, w = 512, h = 664, title = 'LOS QUE SE SUBIERON', highlight?: string) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d')!;
  g.fillStyle = '#ece6d6'; g.fillRect(0, 0, w, h);
  // header band
  const head = Math.round(h * .085);
  g.fillStyle = '#f1c232'; g.fillRect(0, 0, w, head);
  g.fillStyle = '#141214'; g.textAlign = 'center'; g.textBaseline = 'middle';
  let fs = head * .62; g.font = `${fs}px "Bowlby One", Impact, sans-serif`;
  while (g.measureText(title).width > w * .92 && fs > 8) { fs -= 1; g.font = `${fs}px "Bowlby One", Impact, sans-serif`; }
  g.fillText(title, w / 2, head / 2 + 1);
  // grid sized for the full capacity, so names keep their size as the roof fills up
  const cols = Math.max(1, Math.round(Math.sqrt(capacity * w / (h - head) / 3.2))), rows = Math.ceil(capacity / cols);
  const cw = w / cols, rh = (h - head - 8) / rows, r = rng(13);
  names.forEach((name, i) => {
    const col = i % cols, row = Math.floor(i / cols), x = col * cw + cw / 2, y = head + 6 + row * rh + rh / 2;
    let size = rh * .78; g.font = `${size}px "Permanent Marker", "Comic Sans MS", cursive`;
    while (g.measureText(name).width > cw * .92 && size > 4) { size -= .5; g.font = `${size}px "Permanent Marker", "Comic Sans MS", cursive`; }
    if (name === highlight) { g.fillStyle = 'rgba(241,194,50,.75)'; g.fillRect(col * cw + 1, y - rh / 2 + 1, cw - 2, rh - 2); }
    g.save(); g.translate(x, y); g.rotate((r() - .5) * .08);
    g.fillStyle = INKS[i % INKS.length]; g.fillText(name, 0, 0); g.restore();
  });
  return c;
}
