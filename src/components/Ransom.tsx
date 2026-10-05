import { useMemo, type CSSProperties } from 'react';
import { layoutRansom } from '../lib/ransom';
import { useLocale } from '../state/locale';

interface Props {
  es: string;
  en?: string;
  seed: number;
  bold?: boolean;
  as?: 'h1' | 'h2' | 'span';
  className?: string;
}

/** Cut-paper headline on a torn paper frame. Screen readers get the plain text. */
export function Ransom({ es, en, seed, bold = false, as: Tag = 'span', className }: Props) {
  const { lang } = useLocale();
  const text = (lang === 'en' && en) || es;
  const { tear, words } = useMemo(() => layoutRansom(text, seed, bold), [text, seed, bold]);
  return (
    <Tag className={['ransom', className, 'pframe'].filter(Boolean).join(' ')} data-style={bold ? 'bold' : undefined}
      style={{ '--tear': tear } as CSSProperties}>
      <span className="sr">{text}</span>
      {words.map((w, wi) => (
        <span className="word" aria-hidden="true" key={wi}>
          {w.map(l => l.img
            ? <span key={l.i} className="rl img" style={{ '--i': l.i, transform: l.transform } as CSSProperties}><img src={l.img} alt="" /></span>
            : <span key={l.i} className="rl paper" style={{
                '--i': l.i, transform: l.transform, backgroundColor: l.bg, color: l.color, fontFamily: l.font,
                backgroundPosition: l.bgPos, fontSize: l.fontSize, fontWeight: l.fontWeight,
                textTransform: l.lower ? 'lowercase' : undefined, clipPath: l.clip,
              } as CSSProperties}>{l.ch}</span>)}
        </span>
      ))}
    </Tag>
  );
}
