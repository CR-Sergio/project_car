import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { useLocale } from '../state/locale';
import { REDUCED, wait } from '../lib/motion';

/* The roll-up garage door that travels between sections and between the landing and the garage page.
   transition(label, mid): door slams down, mid() runs behind it (scroll or route change), door rolls back up. */
type Transition = (label: string, mid: () => void) => Promise<void>;
const Ctx = createContext<Transition | null>(null);

export function DoorProvider({ children }: { children: ReactNode }) {
  const { t } = useLocale();
  const door = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const [label, setLabel] = useState('');
  const [active, setActive] = useState(false);

  const transition = useCallback<Transition>(async (dest, mid) => {
    const el = door.current;
    if (REDUCED || busy.current || !el) { mid(); return; }
    busy.current = true; setLabel(dest); setActive(true);
    // heavy door: fast first push, long slow settle
    await el.animate([{ transform: 'translateY(-104%)' }, { transform: 'translateY(0)' }],
      { duration: 520, easing: 'cubic-bezier(.12,.82,.26,1)', fill: 'forwards' }).finished;
    const sh = document.querySelectorAll('main,header.top');
    sh.forEach(e => e.classList.add('shake')); setTimeout(() => sh.forEach(e => e.classList.remove('shake')), 300);
    mid(); await wait(260);
    await el.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-104%)' }],
      { duration: 680, easing: 'cubic-bezier(.16,.78,.3,1)', fill: 'forwards' }).finished;
    setActive(false); busy.current = false;
  }, []);

  return (
    <Ctx.Provider value={transition}>
      {children}
      <div id="door" className={active ? 'active' : undefined} aria-hidden="true" ref={door}>
        <div className="slats" />
        <div className="spray">PROYECT CAR</div>
        <div className="sign paper"><span className="tape" /><small>{t('door.next')}</small><strong>{label}</strong></div>
        <div className="seal"><div className="handle" /></div>
      </div>
    </Ctx.Provider>
  );
}

export function useDoor() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useDoor needs <DoorProvider>');
  return v;
}
