import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { API_BASE, PAY_MODE } from '../data/config';
import { EXAMPLE_MESSAGES, EXAMPLE_SOLD, MESSAGE_PARTS, PART_BY_ID, messagesOn, roofNames, type Message, type Sale, type SoldMap } from '../data/parts';
import { priceIn, type Currency } from '../lib/format';

export interface ReservedMap {
  [partId: string]: { expiresAt: number };
}

/* Ventas y mensajes sincronizados con la API / D1 */
interface Sales {
  /** piezas vendidas a marcas */
  sold: SoldMap;
  markSold: (id: string, sale: Sale) => void;
  /** piezas temporalmente apartadas en proceso de pago (15 min) */
  reserved: ReservedMap;
  /** mensajes en las salpicaderas (cada uno puede traer un nombre para el techo) */
  messages: Message[];
  addMessage: (m: Message) => void;
  /** mensajes por salpicadera y nombres del techo, ya separados */
  wall: { byPart: Record<string, string[]>; names: string[] };
  raisedIn: (cur: Currency) => number;
}
const Ctx = createContext<Sales | null>(null);

export function SalesProvider({ children }: { children: ReactNode }) {
  const [sold, setSold] = useState<SoldMap>(() => (PAY_MODE === 'live' ? {} : { ...EXAMPLE_SOLD }));
  const [reserved, setReserved] = useState<ReservedMap>({});
  const [messages, setMessages] = useState<Message[]>(() => (PAY_MODE === 'live' ? [] : [...EXAMPLE_MESSAGES]));
  const [remoteWall, setRemoteWall] = useState<{ byPart: Record<string, string[]>; names: string[] } | null>(null);

  const markSold = useCallback((id: string, sale: Sale) => setSold(s => ({ ...s, [id]: sale })), []);
  const addMessage = useCallback((m: Message) => setMessages(list => [...list, m]), []);

  // Carga inicial y sondeo periódico de ventas reales desde /api/sales (D1)
  useEffect(() => {
    let cancelled = false;
    async function fetchSales() {
      try {
        const res = await fetch(`${API_BASE}/api/sales`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;

        if (data.sold && Object.keys(data.sold).length > 0) {
          const loadedSold: SoldMap = {};
          for (const [id, s] of Object.entries(data.sold) as [string, any][]) {
            loadedSold[id] = {
              brand: s.brand,
              color: s.color,
              link: s.link,
              img: null,
            };
            if (s.img && typeof s.img === 'string') {
              const im = new Image();
              im.crossOrigin = 'anonymous';
              im.src = s.img;
              im.onload = () => {
                if (!cancelled) {
                  setSold(current => ({
                    ...current,
                    [id]: { ...current[id], img: im },
                  }));
                }
              };
            }
          }
          setSold(prev => ({ ...prev, ...loadedSold }));
        }
        if (data.reserved) {
          setReserved(data.reserved);
        }
        if (data.wall && (data.wall.names?.length > 0 || Object.values(data.wall.byPart || {}).some((arr: any) => arr.length > 0))) {
          setRemoteWall(data.wall);
        }
      } catch {
        // En desarrollo local sin Cloudflare Pages Functions activas, se mantiene el estado local
      }
    }

    fetchSales();
    const interval = setInterval(fetchSales, 20000); // Actualiza cada 20 segundos
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const localWall = useMemo(() => ({
    byPart: Object.fromEntries(MESSAGE_PARTS.map(p => [p.id, messagesOn(messages, p.id).map(m => m.text)])),
    names: roofNames(messages),
  }), [messages]);

  const wall = remoteWall || localWall;

  const value = useMemo<Sales>(() => ({
    sold, markSold, reserved, messages, addMessage, wall,
    raisedIn: cur => Object.keys(sold).reduce((a, id) => a + (PART_BY_ID[id] ? priceIn(PART_BY_ID[id], cur) : 0), 0)
      + messages.reduce((a, m) => a + (PART_BY_ID[m.part] ? priceIn(PART_BY_ID[m.part], cur) : 0), 0),
  }), [sold, markSold, reserved, messages, addMessage, wall]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSales() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSales needs <SalesProvider>');
  return v;
}
