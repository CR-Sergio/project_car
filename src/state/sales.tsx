import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { EXAMPLE_MESSAGES, EXAMPLE_SOLD, MESSAGE_PARTS, PART_BY_ID, messagesOn, roofNames, type Message, type Sale, type SoldMap } from '../data/parts';
import { priceIn, type Currency } from '../lib/format';

/* Ventas. Hoy viven en memoria (pagos simulados); cuando haya backend, este es el único lugar que cambia. */
interface Sales {
  /** piezas vendidas a marcas */
  sold: SoldMap;
  markSold: (id: string, sale: Sale) => void;
  /** mensajes en las salpicaderas (cada uno puede traer un nombre para el techo) */
  messages: Message[];
  addMessage: (m: Message) => void;
  /** mensajes por salpicadera y nombres del techo, ya separados */
  wall: { byPart: Record<string, string[]>; names: string[] };
  raisedIn: (cur: Currency) => number;
}
const Ctx = createContext<Sales | null>(null);

export function SalesProvider({ children }: { children: ReactNode }) {
  const [sold, setSold] = useState<SoldMap>(() => ({ ...EXAMPLE_SOLD }));
  const [messages, setMessages] = useState<Message[]>(() => [...EXAMPLE_MESSAGES]);
  const markSold = useCallback((id: string, sale: Sale) => setSold(s => ({ ...s, [id]: sale })), []);
  const addMessage = useCallback((m: Message) => setMessages(list => [...list, m]), []);
  const wall = useMemo(() => ({
    byPart: Object.fromEntries(MESSAGE_PARTS.map(p => [p.id, messagesOn(messages, p.id).map(m => m.text)])),
    names: roofNames(messages),
  }), [messages]);
  const value = useMemo<Sales>(() => ({
    sold, markSold, messages, addMessage, wall,
    raisedIn: cur => Object.keys(sold).reduce((a, id) => a + priceIn(PART_BY_ID[id], cur), 0)
      + messages.reduce((a, m) => a + priceIn(PART_BY_ID[m.part], cur), 0),
  }), [sold, markSold, messages, addMessage, wall]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSales() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSales needs <SalesProvider>');
  return v;
}
