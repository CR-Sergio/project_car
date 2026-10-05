import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { EXAMPLE_SOLD, PART_BY_ID, type Sale, type SoldMap } from '../data/parts';
import { priceIn, type Currency } from '../lib/format';

/* Ventas. Hoy viven en memoria (pagos simulados); cuando haya backend, este es el único lugar que cambia. */
interface Sales {
  sold: SoldMap;
  markSold: (id: string, sale: Sale) => void;
  raisedIn: (cur: Currency) => number;
}
const Ctx = createContext<Sales | null>(null);

export function SalesProvider({ children }: { children: ReactNode }) {
  const [sold, setSold] = useState<SoldMap>(() => ({ ...EXAMPLE_SOLD }));
  const markSold = useCallback((id: string, sale: Sale) => setSold(s => ({ ...s, [id]: sale })), []);
  const value = useMemo<Sales>(() => ({
    sold, markSold,
    raisedIn: cur => Object.keys(sold).reduce((a, id) => a + priceIn(PART_BY_ID[id], cur), 0),
  }), [sold, markSold]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSales() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSales needs <SalesProvider>');
  return v;
}
