import { REDUCED } from './motion';

export function confetti(color: string) {
  if (REDUCED) return; const cols = [color, '#f1c232', '#ece6d6', '#e2252e', '#141214'];
  for (let i = 0; i < 46; i++) {
    const d = document.createElement('div'); d.className = 'confetti'; d.style.backgroundColor = cols[i % cols.length];
    d.style.left = (innerWidth / 2) + 'px'; d.style.top = (innerHeight / 2) + 'px'; d.style.clipPath = 'polygon(0 10%,100% 0,90% 100%,8% 86%)'; document.body.appendChild(d);
    const a = Math.random() * Math.PI * 2, v = 180 + Math.random() * 320;
    d.animate([{ transform: 'translate(0,0) rotate(0)' }, { transform: `translate(${Math.cos(a) * v}px,${Math.sin(a) * v + 260}px) rotate(${Math.random() * 900 - 450}deg)`, opacity: 0 }],
      { duration: 1300 + Math.random() * 700, easing: 'cubic-bezier(.2,.7,.4,1)' }).finished.then(() => d.remove());
  }
}
