import type { Sale } from '../data/parts';

/** The brand "vinyl": a solid color with the logo, or the brand name, centered. Used on the 3D parts and in the checkout preview. */
export function brandCanvas(info: Sale, w = 512, h = 256) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d')!;
  g.fillStyle = info.color; g.fillRect(0, 0, w, h);
  const v = parseInt(info.color.slice(1), 16), lum = ((v >> 16) * .299 + ((v >> 8) & 255) * .587 + (v & 255) * .114) / 255;
  if (info.img) { const im = info.img, s = Math.min(w * .7 / im.width, h * .7 / im.height); g.drawImage(im, (w - im.width * s) / 2, (h - im.height * s) / 2, im.width * s, im.height * s); }
  else {
    g.fillStyle = lum > .6 ? '#141214' : '#ece6d6'; let fs = h * (w / h > 4 ? .62 : .34); const set = () => (g.font = `${fs}px "Bowlby One", Impact, sans-serif`); set();
    while (g.measureText(info.brand).width > w * .72 && fs > 10) { fs -= 2; set(); }
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(info.brand.toUpperCase(), w / 2, h / 2);
  }
  return c;
}
