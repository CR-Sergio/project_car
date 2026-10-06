import { usdOf } from './currency';

export type Zone = 'Frente' | 'Arriba' | 'Lado izq.' | 'Lado der.' | 'Atrás';

export interface Part {
  id: string;
  name: string;
  en: string;
  /** precio final en MXN */
  price: number;
  /** precio en USD de referencia (se calcula con el tipo de cambio de src/data/currency.ts) */
  usd: number;
  zone: Zone;
  /** medida aproximada del vinil */
  size: string;
  /** Payment Links (modo live) */
  mp: string;
  stripe: string;
  stripeUsd?: string;
  /** barras del garage, 1-10 */
  vis: number;
  tam: number;
  cuadro: number;
  glass?: boolean;
  /** no se vende a una marca: 'messages' = cada persona compra un mensaje (salpicaderas);
      'names' = el techo, donde van gratis los nombres de quienes dejan mensaje */
  kind?: 'messages' | 'names';
}

type PartInput = Omit<Part, 'usd' | 'mp' | 'stripe'> & Partial<Pick<Part, 'mp' | 'stripe'>>;
const RAW: PartInput[] = [
  {id:'cofre',      name:'Cofre',                           en:'Hood',                   price:18000, zone:'Frente',    size:'≈ 115 × 150 cm', vis:9, tam:8, cuadro:9},
  {id:'parabrisas', name:'Franja del parabrisas',           en:'Windshield banner',      price:13000, zone:'Frente',    size:'≈ 130 × 20 cm',  vis:9, tam:4, cuadro:9, glass:true},
  {id:'defensa-d',  name:'Defensa delantera',               en:'Front bumper',           price:8000,  zone:'Frente',    size:'≈ 160 × 25 cm',  vis:7, tam:3, cuadro:6},
  {id:'techo',      name:'Techo de la raza',                en:'Supporters’ roof',       price:0,     zone:'Arriba',    size:'≈ 150 × 120 cm', vis:6, tam:9, cuadro:7, kind:'names'},
  {id:'puerta-di',  name:'Puerta delantera izquierda',      en:'Front left door',        price:9500,  zone:'Lado izq.', size:'≈ 90 × 60 cm',   vis:8, tam:6, cuadro:8},
  {id:'puerta-ti',  name:'Puerta trasera izquierda',        en:'Rear left door',         price:10500, zone:'Lado izq.', size:'≈ 125 × 60 cm',  vis:7, tam:7, cuadro:7},
  {id:'vidrio-ti',  name:'Ventana trasera izquierda',       en:'Rear left window',       price:7500,  zone:'Lado izq.', size:'≈ 85 × 40 cm',   vis:7, tam:4, cuadro:6, glass:true},
  {id:'salpi-i',    name:'Salpicadera de mensajes (izq.)',  en:'Message fender (left)',  price:100,   zone:'Lado izq.', size:'≈ 95 × 45 cm',   vis:7, tam:5, cuadro:6, kind:'messages'},
  {id:'puerta-dd',  name:'Puerta delantera derecha',        en:'Front right door',       price:9500,  zone:'Lado der.', size:'≈ 90 × 60 cm',   vis:8, tam:6, cuadro:8},
  {id:'puerta-td',  name:'Puerta trasera derecha',          en:'Rear right door',        price:10500, zone:'Lado der.', size:'≈ 125 × 60 cm',  vis:7, tam:7, cuadro:7},
  {id:'vidrio-td',  name:'Ventana trasera derecha',         en:'Rear right window',      price:7500,  zone:'Lado der.', size:'≈ 85 × 40 cm',   vis:7, tam:4, cuadro:6, glass:true},
  {id:'salpi-d',    name:'Salpicadera de mensajes (der.)',  en:'Message fender (right)', price:100,   zone:'Lado der.', size:'≈ 95 × 45 cm',   vis:7, tam:5, cuadro:6, kind:'messages'},
  {id:'porton',     name:'Portón trasero',                  en:'Tailgate',               price:12000, zone:'Atrás',     size:'≈ 120 × 45 cm',  vis:8, tam:6, cuadro:7},
  {id:'medallon',   name:'Medallón (vidrio trasero)',       en:'Rear window',            price:12000, zone:'Atrás',     size:'≈ 95 × 45 cm',   vis:8, tam:5, cuadro:7, glass:true},
  {id:'defensa-t',  name:'Defensa trasera',                 en:'Rear bumper',            price:8000,  zone:'Atrás',     size:'≈ 160 × 25 cm',  vis:8, tam:3, cuadro:6},
];
export const PARTS: Part[] = RAW.map(p => ({ mp: '', stripe: '', ...p, usd: usdOf(p.price) }));

export const ZONES: Zone[] = ['Frente', 'Arriba', 'Lado izq.', 'Lado der.', 'Atrás'];
export const ZONE_EN: Record<Zone, string> = {'Frente':'Front','Arriba':'Top','Lado izq.':'Left side','Lado der.':'Right side','Atrás':'Rear'};
/** order used by the garage menu and the prev/next arrows */
export const ORDER: Part[] = ZONES.flatMap(z => PARTS.filter(p => p.zone === z));
export const PART_BY_ID: Record<string, Part> = Object.fromEntries(PARTS.map(p => [p.id, p]));
/** las piezas que se venden a marcas */
export const BRAND_PARTS = PARTS.filter(p => !p.kind);

/* ===================== MENSAJES Y TECHO DE LA RAZA =====================
   Las salpicaderas delanteras no se venden a marcas: cada persona compra un mensaje de hasta MESSAGE_MAX
   caracteres, al precio de la salpicadera en PARTS. De regalo, su nombre va en el techo (que ya no se vende). */
export const MESSAGE_PARTS = PARTS.filter(p => p.kind === 'messages');
export const MESSAGE_PRICE_MXN = MESSAGE_PARTS[0].price;
/** caracteres por mensaje */
export const MESSAGE_MAX = 24;
/** límite interno de mensajes por salpicadera (≈95 × 45 cm, letras de ≈1.3 cm: 4 columnas × 30 renglones).
    En la página NO se muestra: se venden "hasta agotar existencias". 120 por lado (240 en total) es lo que hace
    que, vendiendo todo, se llegue a la meta de $150,000. */
export const MESSAGES_PER_PART = 120;
export const MESSAGES_CAPACITY = MESSAGES_PER_PART * MESSAGE_PARTS.length;
/** a partir de cuántos lugares libres se avisa "quedan pocos" */
export const MESSAGES_LOW = 20;
/** lugares libres en total y en una salpicadera, y si ya hay que avisar que quedan pocos */
export function messagesStock(list: Message[], part?: string) {
  const left = part ? MESSAGES_PER_PART - messagesOn(list, part).length : MESSAGES_CAPACITY - list.length;
  return { left: Math.max(0, left), low: left > 0 && left <= MESSAGES_LOW * (part ? 1 / MESSAGE_PARTS.length : 1) };
}
/** el techo: un nombre de regalo por cada mensaje */
export const NAMES_PART_ID = 'techo';
export const NAME_MAX = 22;

export interface Message {
  text: string;
  /** salpicadera donde va */
  part: string;
  /** nombre para el techo (opcional, gratis) */
  name?: string;
  email?: string;
  news?: boolean;
  acceptedAt?: string;
}
/* Mensajes de EJEMPLO para ver cómo se ven las salpicaderas y el techo. Bórralos al lanzar. */
export const EXAMPLE_MESSAGES: Message[] = ([
  ['¡Arre con el project!', 'Doña Lupe'], ['Pura vida regia', 'El Primo'], ['Que ruede el 13', '@mau.mty'],
  ['Te queremos, Palio', 'Fer y Caro'], ['De MTY pa’l mundo', 'Tío Beto'], ['Sin frenos ni miedo', 'La Güera'],
  ['Aquí andamos, compa', 'Chuy 81'], ['Full gas siempre', 'Los del 13'], ['Echale ganas', 'Rafa G.'],
  ['Para mi papá, que soñó', 'Mamá'], ['Vamos por el 2.0', 'Pollo'], ['Aguanta, carnal', 'Toño Garza'],
] as const).map(([text, name], i) => ({ text, name, part: i % 2 ? 'salpi-d' : 'salpi-i' }));

/** mensajes: letras, números, espacios y puntuación común (el vinil no imprime emojis) */
export const MESSAGE_RE = /^[\p{L}\p{N} .,;:!¡?¿'’"&@#_()-]+$/u;
/** nombres: letras, números, espacios y . , ' & @ _ - */
export const NAME_RE = /^[\p{L}\p{N} .,'’&@_-]+$/u;
export function cleanName(raw: string) { return raw.replace(/\s+/g, ' ').trim(); }
export const messagesOn = (list: Message[], part: string) => list.filter(m => m.part === part);
export const roofNames = (list: Message[]) => list.flatMap(m => (m.name ? [m.name] : []));
/** the fender with more room left, so both fill up evenly */
export function roomiestMessagePart(list: Message[]) {
  return [...MESSAGE_PARTS].sort((a, b) => messagesOn(list, a.id).length - messagesOn(list, b.id).length)[0].id;
}

export interface Sale {
  brand: string;
  color: string;
  /** logo subido en el checkout (solo en memoria) */
  img?: HTMLImageElement | null;
  email?: string;
  link?: string;
  /** aceptó recibir noticias (finalidad secundaria del aviso de privacidad) */
  news?: boolean;
  /** cuándo aceptó términos, aviso de privacidad y la política de no reembolsos */
  acceptedAt?: string;
}
export type SoldMap = Record<string, Sale>;

/* Ventas de EJEMPLO para ver cómo se ve una pieza vendida. Bórralas al lanzar. */
export const EXAMPLE_SOLD: SoldMap = {
  'puerta-dd': {brand:'Llantera Demo', color:'#2f6fe0'},
  'defensa-d': {brand:'Taller Demo',   color:'#e2252e'},
};

/* proporción ancho/alto de cada pieza en el modelo 3D (para acomodar el logo).
   Las puertas traseras (puerta + costado) y las ventanas traseras se recalculan al cargar el modelo (src/three/model.ts). */
export const PALIO_ASPECT: Record<string, number> = {"cofre": 1.472, "techo": 0.771, "puerta-di": 1.293, "puerta-ti": 0.901, "puerta-dd": 1.293, "puerta-td": 0.901, "vidrio-ti": 2.1, "vidrio-td": 2.1, "salpi-i": 1.642, "salpi-d": 1.642, "porton": 1.93, "defensa-d": 4.933, "defensa-t": 4.767, "parabrisas": 10.045, "medallon": 3.026};
