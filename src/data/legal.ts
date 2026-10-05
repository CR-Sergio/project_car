/* ===================== DATOS LEGALES =====================
   Llena todo lo que está entre [CORCHETES] antes de cobrar de verdad: mientras falte algo,
   las páginas legales lo marcan en amarillo. Haz que un abogado revise los textos
   (src/pages/legal/) antes de lanzar: son una base, no asesoría legal. */
export const LEGAL = {
  /** nombre completo de la persona física responsable (quien se da de alta en el SAT) */
  responsable: '[TU NOMBRE COMPLETO]',
  rfc: '[TU RFC]',
  regimen: 'Régimen Simplificado de Confianza (RESICO)',
  domicilio: '[CALLE Y NÚMERO, COLONIA, C.P., MONTERREY, NUEVO LEÓN]',
  email: '[contacto@proyectcar.com]',
  sitio: 'proyectcar.com',
  /** fecha de la última actualización de los textos legales */
  actualizado: '5 de octubre de 2026',

  /* condiciones del servicio (también salen en las Dudas) */
  /** meses que se queda el vinil desde que se instala */
  vigenciaMeses: 12,
  /** videos mínimos del canal donde aparece la pieza */
  videosMinimos: 6,
  /** días hábiles para mandar el logo después de pagar */
  diasLogo: 10,
  /** días hábiles para instalar después de aprobar el diseño */
  diasInstalacion: 20,
  /** días hábiles para cancelar con reembolso completo (si el vinil no se ha impreso) */
  diasCancelacion: 5,
};

/** placeholder still to fill in */
export const isPending = (v: string | number) => typeof v === 'string' && v.startsWith('[');

/** CFDI 4.0: regímenes fiscales más comunes de quien compra publicidad */
export const REGIMENES: [string, string][] = [
  ['601', '601 · General de Ley Personas Morales'],
  ['603', '603 · Personas Morales con Fines no Lucrativos'],
  ['612', '612 · Personas Físicas con Actividades Empresariales y Profesionales'],
  ['626', '626 · Régimen Simplificado de Confianza'],
  ['621', '621 · Incorporación Fiscal'],
  ['606', '606 · Arrendamiento'],
  ['616', '616 · Sin obligaciones fiscales'],
];
/** RFC: 3 letras (moral) o 4 (física), fecha AAMMDD y homoclave */
export const RFC_RE = /^([A-ZÑ&]{3,4})(\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])([A-Z\d]{2}[A\d])$/;

/** marcas que no se aceptan (Términos, Dudas y checkout) */
export const RESTRICTED = {
  es: ['partidos, candidatos y campañas políticas', 'alcohol, tabaco y vapeadores', 'apuestas y casinos', 'contenido para adultos',
    'armas', 'medicamentos, suplementos o tratamientos sin permiso de publicidad de COFEPRIS', 'esquemas de inversión, préstamos o criptomonedas',
    'cualquier cosa ilegal, discriminatoria u ofensiva, o que use marcas ajenas sin permiso'],
  en: ['political parties, candidates and campaigns', 'alcohol, tobacco and vapes', 'gambling and casinos', 'adult content',
    'weapons', 'medicines, supplements or treatments without a COFEPRIS advertising permit', 'investment schemes, loans or crypto',
    'anything illegal, discriminatory or offensive, or using someone else’s trademarks without permission'],
};
