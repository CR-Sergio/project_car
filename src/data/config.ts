import { MXN_PER_USD } from './currency';

/* ===================== CONFIG =====================
   PAY_MODE 'test' simula el pago. Para cobrar de verdad:
   1) Crea un Payment Link por pieza en Mercado Pago o Stripe (modo prueba primero).
   2) Pega los enlaces en mp / stripe de cada pieza (src/data/parts.ts) y cambia PAY_MODE a 'live'.
      El monto de cada link es el precio de la pieza (precio final).
   3) Para marcar piezas como vendidas automáticamente hace falta un backend con webhook. */
export type PayMode = 'test' | 'live';
export const PAY_MODE: PayMode = 'test';
/** la meta del proyecto, en pesos (precio final, todo incluido) */
export const GOAL_MXN = 150000;
export const GOAL_USD = Math.round(GOAL_MXN / MXN_PER_USD / 50) * 50;
/* MODELO 3D: public/models/palio.glb. Cada pieza en venta es una malla con el mismo nombre que su id
   (cofre, techo, puerta-di, ...). */
export const MODEL_URL = '/models/palio.glb';
