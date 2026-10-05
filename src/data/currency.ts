/** pesos por dólar para mostrar precios en USD (solo referencia; Stripe cobra con el tipo de cambio del día) */
export const MXN_PER_USD = 18.5;
export const usdOf = (mxn: number) => Math.round(mxn / MXN_PER_USD / 5) * 5;
