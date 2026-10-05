/* ===================== PRESUPUESTO =====================
   De aquí sale la meta: lo que cuesta el project car más todo lo que cuesta venderlo.
   Precios de las piezas: MÁS IVA. El IVA (16%) se cobra aparte y se entera al SAT, no es parte de la meta;
   el IVA que pagas en vinil, comisiones y contador se acredita contra ese, por eso aquí todo va SIN IVA.
   Todos los montos son estimados de Monterrey (octubre 2026): cámbialos con tus cotizaciones reales. */

/** lo que cuesta el project car */
export const PROJECT_CAR_MXN = 120000;

export const IVA = 0.16;

/** pesos por dólar para mostrar precios en USD */
export const MXN_PER_USD = 18.5;
export const usdOf = (mxn: number) => Math.round(mxn / MXN_PER_USD / 5) * 5;

/** vinil por pieza = área × (1 + merma) × precio por m² + instalación + retiro al terminar */
export const VINYL = {
  /** vinil fundido (cast) impreso + laminado, para lámina */
  printPerM2: 900,
  /** vinil microperforado impreso, para vidrios (se ve hacia afuera, se ve a través desde adentro) */
  microperfPerM2: 750,
  /** sangrado, recortes y errores */
  waste: 0.15,
  /** instalación: base + extra por m² (cofre y techo cuestan más que una defensa) */
  installBase: 250,
  installPerM2: 150,
  /** quitar el vinil al terminar la vigencia */
  removal: 150,
};

/** comisión de la pasarela (Stripe MX ≈ 3.6% + $3; Mercado Pago es parecido). Se cobra sobre el total con IVA.
    El IVA de la comisión se acredita, por eso no se suma aquí. */
export const PAYMENT_FEE = { pct: 0.036, fixedPerSale: 3 };

/** ISR en RESICO: 1% a 2.5% según lo que cobres al mes. 2% es conservador si vendes ~$100k-$200k en pocos meses. */
export const ISR_RESICO = 0.02;

/** gastos fijos para operar legalmente */
export const OPERATING: { es: string; en: string; amount: number }[] = [
  { es: 'Contador (6 meses)', en: 'Accountant (6 months)', amount: 4800 },
  { es: 'Revisión legal de términos y aviso', en: 'Legal review of terms and privacy notice', amount: 5000 },
  { es: 'Dominio y hosting (1 año)', en: 'Domain and hosting (1 year)', amount: 600 },
];
