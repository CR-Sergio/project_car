import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

const Ctx = createContext<((msg: string) => void) | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const toast = useCallback((m: string) => {
    setMsg(m); clearTimeout(timer.current); timer.current = setTimeout(() => setMsg(null), 3200);
  }, []);
  return (
    <Ctx.Provider value={toast}>
      {children}
      <div className="toast" role="status" hidden={msg === null}>{msg}</div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useToast needs <ToastProvider>');
  return v;
}
