/* ===================== CONFIG =====================
   PAY_MODE 'test' simula el pago. Para cobrar de verdad:
   1) Crea un Payment Link por pieza en Mercado Pago o Stripe (modo prueba primero).
   2) Pega los enlaces en mp / stripe de cada pieza (src/data/parts.ts) y cambia PAY_MODE a 'live'.
   3) Para marcar piezas como vendidas automáticamente hace falta un backend con webhook. */
export type PayMode = 'test' | 'live';
export const PAY_MODE: PayMode = 'test';
export const GOAL_MXN = 120000;
/* MODELO 3D: public/models/palio.glb. Cada pieza en venta es una malla con el mismo nombre que su id
   (cofre, techo, puerta-di, ...). */
export const MODEL_URL = '/models/palio.glb';
