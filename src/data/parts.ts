export type Zone = 'Frente' | 'Arriba' | 'Lado izq.' | 'Lado der.' | 'Atrás';

export interface Part {
  id: string;
  name: string;
  en: string;
  /** precio en MXN */
  price: number;
  usd: number;
  zone: Zone;
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
}

export const PARTS: Part[] = [
  {id:'cofre',      name:'Cofre',                           en:'Hood',                   price:14000, usd:750, zone:'Frente',    size:'≈ 115 × 150 cm', mp:'', stripe:'', vis:9, tam:8, cuadro:9},
  {id:'parabrisas', name:'Franja del parabrisas',           en:'Windshield banner',      price:10000, usd:550, zone:'Frente',    size:'≈ 130 × 20 cm',  mp:'', stripe:'', vis:9, tam:4, cuadro:9, glass:true},
  {id:'defensa-d',  name:'Defensa delantera',               en:'Front bumper',           price:6000,  usd:325, zone:'Frente',    size:'≈ 160 × 25 cm',  mp:'', stripe:'', vis:7, tam:3, cuadro:6},
  {id:'techo',      name:'Techo',                           en:'Roof',                   price:14000, usd:750, zone:'Arriba',    size:'≈ 150 × 120 cm', mp:'', stripe:'', vis:6, tam:9, cuadro:7},
  {id:'puerta-di',  name:'Puerta delantera izquierda',      en:'Front left door',        price:7000,  usd:380, zone:'Lado izq.', size:'≈ 90 × 60 cm',   mp:'', stripe:'', vis:8, tam:6, cuadro:8},
  {id:'puerta-ti',  name:'Puerta trasera izquierda',        en:'Rear left door',         price:7000,  usd:380, zone:'Lado izq.', size:'≈ 85 × 60 cm',   mp:'', stripe:'', vis:7, tam:5, cuadro:7},
  {id:'salpi-i',    name:'Salpicadera delantera izquierda', en:'Front left fender',      price:6000,  usd:325, zone:'Lado izq.', size:'≈ 95 × 45 cm',   mp:'', stripe:'', vis:7, tam:5, cuadro:6},
  {id:'costado-i',  name:'Costado trasero izquierdo',       en:'Rear left quarter panel',price:6000,  usd:325, zone:'Lado izq.', size:'≈ 100 × 60 cm',  mp:'', stripe:'', vis:6, tam:6, cuadro:6},
  {id:'puerta-dd',  name:'Puerta delantera derecha',        en:'Front right door',       price:7000,  usd:380, zone:'Lado der.', size:'≈ 90 × 60 cm',   mp:'', stripe:'', vis:8, tam:6, cuadro:8},
  {id:'puerta-td',  name:'Puerta trasera derecha',          en:'Rear right door',        price:7000,  usd:380, zone:'Lado der.', size:'≈ 85 × 60 cm',   mp:'', stripe:'', vis:7, tam:5, cuadro:7},
  {id:'salpi-d',    name:'Salpicadera delantera derecha',   en:'Front right fender',     price:6000,  usd:325, zone:'Lado der.', size:'≈ 95 × 45 cm',   mp:'', stripe:'', vis:7, tam:5, cuadro:6},
  {id:'costado-d',  name:'Costado trasero derecho',         en:'Rear right quarter panel',price:6000, usd:325, zone:'Lado der.', size:'≈ 100 × 60 cm',  mp:'', stripe:'', vis:6, tam:6, cuadro:6},
  {id:'porton',     name:'Portón trasero',                  en:'Tailgate',               price:9000,  usd:490, zone:'Atrás',     size:'≈ 120 × 45 cm',  mp:'', stripe:'', vis:8, tam:6, cuadro:7},
  {id:'medallon',   name:'Medallón (vidrio trasero)',       en:'Rear window',            price:9000,  usd:490, zone:'Atrás',     size:'≈ 95 × 45 cm',   mp:'', stripe:'', vis:8, tam:5, cuadro:7, glass:true},
  {id:'defensa-t',  name:'Defensa trasera',                 en:'Rear bumper',            price:6000,  usd:325, zone:'Atrás',     size:'≈ 160 × 25 cm',  mp:'', stripe:'', vis:8, tam:3, cuadro:6},
];

export const ZONES: Zone[] = ['Frente', 'Arriba', 'Lado izq.', 'Lado der.', 'Atrás'];
export const ZONE_EN: Record<Zone, string> = {'Frente':'Front','Arriba':'Top','Lado izq.':'Left side','Lado der.':'Right side','Atrás':'Rear'};
/** order used by the garage menu and the prev/next arrows */
export const ORDER: Part[] = ZONES.flatMap(z => PARTS.filter(p => p.zone === z));
export const PART_BY_ID: Record<string, Part> = Object.fromEntries(PARTS.map(p => [p.id, p]));

export interface Sale {
  brand: string;
  color: string;
  /** logo subido en el checkout (solo en memoria) */
  img?: HTMLImageElement | null;
}
export type SoldMap = Record<string, Sale>;

/* Ventas de EJEMPLO para ver cómo se ve una pieza vendida. Bórralas al lanzar. */
export const EXAMPLE_SOLD: SoldMap = {
  'techo':     {brand:'Marca ejemplo', color:'#f1c232'},
  'puerta-dd': {brand:'Llantera Demo', color:'#2f6fe0'},
  'defensa-d': {brand:'Taller Demo',   color:'#e2252e'},
};

/* proporción ancho/alto de cada pieza en el modelo 3D (para acomodar el logo) */
export const PALIO_ASPECT: Record<string, number> = {"cofre": 1.472, "techo": 0.771, "puerta-di": 1.293, "puerta-ti": 0.901, "puerta-dd": 1.293, "puerta-td": 0.901, "salpi-i": 1.642, "salpi-d": 1.642, "costado-i": 0.948, "costado-d": 1.084, "porton": 1.93, "defensa-d": 4.933, "defensa-t": 4.767, "parabrisas": 10.045, "medallon": 3.026};
