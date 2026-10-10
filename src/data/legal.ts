/* ===================== DATOS LEGALES =====================
   Llena todo lo que está entre [CORCHETES] antes de cobrar de verdad: mientras falte algo,
   las páginas legales lo marcan en amarillo. Haz que un abogado revise los textos
   (src/pages/legal/) antes de lanzar: son una base, no asesoría legal. */
export const LEGAL = {
  /** nombre completo de la persona responsable del proyecto */
  responsable: 'Sergio Mondragon',
  /** domicilio para recibir notificaciones (general por el momento) */
  domicilio: 'Monterrey, Nuevo León',
  email: 'contacto@proyectcar.com',
  sitio: 'proyectcar.com',
  /** fecha de la última actualización de los textos legales */
  actualizado: '9 de octubre de 2026',

  /* condiciones del servicio (también salen en las Dudas y en el checkout) */
  /** meses que se queda el vinil desde que se instala */
  vigenciaMeses: 6,
  /** videos mínimos del canal en los que aparece la pieza durante la vigencia */
  videosMinimos: 3,
  /** días hábiles para mandar el logo después de pagar */
  diasLogo: 5,
  /** días hábiles para mandar la prueba de diseño después de recibir el logo.
      Junto con el apartado inmediato, el servicio empieza dentro de 10 días hábiles: así no aplica la
      revocación de 5 días del art. 56 de la Ley Federal de Protección al Consumidor. No lo subas de 10. */
  diasDiseno: 5,
  /** días hábiles para aprobar o pedir cambios; si no contestas, el diseño se da por aprobado */
  diasAprobacion: 3,
  /** días hábiles para instalar después de aprobar el diseño */
  diasInstalacion: 15,
  /** días naturales sin logo tras los cuales rotulamos el nombre de la marca en texto */
  diasSinLogo: 30,
};

/** placeholder still to fill in */
export const isPending = (v: string | number) => typeof v === 'string' && v.startsWith('[');

/** marcas que no se aceptan (Términos, Dudas y checkout) */
export const RESTRICTED = {
  es: ['partidos, candidatos y campañas políticas', 'alcohol, tabaco y vapeadores', 'apuestas y casinos', 'contenido para adultos',
    'armas', 'medicamentos, suplementos o tratamientos sin permiso de publicidad de COFEPRIS', 'esquemas de inversión, préstamos o criptomonedas',
    'cualquier cosa ilegal, discriminatoria u ofensiva, o que use marcas ajenas sin permiso'],
  en: ['political parties, candidates and campaigns', 'alcohol, tobacco and vapes', 'gambling and casinos', 'adult content',
    'weapons', 'medicines, supplements or treatments without a COFEPRIS advertising permit', 'investment schemes, loans or crypto',
    'anything illegal, discriminatory or offensive, or using someone else’s trademarks without permission'],
};
