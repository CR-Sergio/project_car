import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { EXAMPLE_SOLD, EXAMPLE_SUPPORTERS, NAMES_PART_ID, PART_BY_ID, type Sale, type SoldMap, type Supporter } from '../data/parts';
import { priceIn, type Currency } from '../lib/format';

/* Ventas. Hoy viven en memoria (pagos simulados); cuando haya backend, este es el único lugar que cambia. */
interface Sales {
  /** piezas vendidas a marcas */
  sold: SoldMap;
  markSold: (id: string, sale: Sale) => void;
  /** nombres en el techo de la raza */
  supporters: Supporter[];
  addSupporter: (s: Supporter) => void;
  raisedIn: (cur: Currency) => number;
}
const Ctx = createContext<Sales | null>(null);

export function SalesProvider({ children }: { children: ReactNode }) {
  const [sold, setSold] = useState<SoldMap>(() => ({ ...EXAMPLE_SOLD }));
  const [supporters, setSupporters] = useState<Supporter[]>(() => [...EXAMPLE_SUPPORTERS]);
  const markSold = useCallback((id: string, sale: Sale) => setSold(s => ({ ...s, [id]: sale })), []);
  const addSupporter = useCallback((s: Supporter) => setSupporters(list => [...list, s]), []);
  const value = useMemo<Sales>(() => ({
    sold, markSold, supporters, addSupporter,
    raisedIn: cur => Object.keys(sold).reduce((a, id) => a + priceIn(PART_BY_ID[id], cur), 0)
      + supporters.length * priceIn(PART_BY_ID[NAMES_PART_ID], cur),
  }), [sold, markSold, supporters, addSupporter]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSales() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSales needs <SalesProvider>');
  return v;
}
