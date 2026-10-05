# Proyect Car

Página web del proyecto **Proyect Car**: vendo mi Fiat Palio 2013 en pedazos. Cada pieza del carro se vende como espacio publicitario (estilo Million Dollar Homepage) para juntar **$120,000 MXN** y comprar un project car.

> Versión de prueba: los pagos están simulados.

## Stack

- **React 19 + TypeScript**, empaquetado con **Vite 7**
- **React Router 7**: dos páginas, la landing (`/`) y el garage (`/garage`, `/garage/:pieza`)
- **Three.js 0.160** (la misma versión del sitio original, para que el 3D se vea igual)
- Tipografías servidas desde el propio sitio con **Fontsource** (ya no se piden a Google Fonts)
- **Vitest** para las pruebas unitarias

## Páginas

| Ruta | Qué es |
|---|---|
| `/` | Landing: portada, medidor de la meta, cómo funciona, vitrina 3D, mapa, periódico y dudas |
| `/garage` | Garage estilo videojuego: menú de piezas, ficha con estadísticas, cámara que vuela a cada pieza y checkout |
| `/garage/cofre` | El garage abierto directo en una pieza (el link se puede compartir) |
| `/terminos` | Términos y condiciones |
| `/aviso-de-privacidad` | Aviso de privacidad |

Entre las dos páginas se viaja con la cortina de garage. El garage es una descarga aparte: quien solo ve la landing no baja ese código.

## Correrla en tu compu

Necesitas Node.js 20 o más nuevo.

```bash
npm install
npm run dev        # http://localhost:5173
```

Otros comandos:

```bash
npm run build      # revisa tipos y genera dist/ para publicar
npm run preview    # sirve dist/ como en producción
npm test           # pruebas unitarias
```

## Estructura

```
public/                 Archivos tal cual: modelo 3D, imágenes, foto de la portada
  models/palio.glb      Modelo 3D del Palio, cada pieza es una malla con nombre
src/
  main.tsx              Entrada
  app/                  Router, cortina de garage y avisos (toast)
  pages/landing/        Landing y sus secciones (Hero, Meter, Showroom, Where, News, Faq…)
  pages/garage/         Página del garage y el checkout
  pages/legal/          Términos y condiciones, aviso de privacidad
  components/           Piezas compartidas: letras recortadas, header, ticker, graffiti
  three/                Escenas 3D: visor, vitrina, garage, carga del modelo, pintura de piezas
  data/                 Configuración, piezas y precios
  state/                Idioma/moneda y ventas
  i18n/strings.ts       Todos los textos en español e inglés
  styles/               CSS: base, landing, garage, checkout
```

## Configuración

- `src/data/parts.ts`
  - `PARTS`: piezas, precios en MXN **más IVA** (`price`; el de USD se calcula con el tipo de cambio), zona, medidas del vinil, barras del garage (`vis`, `tam`, `cuadro`) y links de pago (`mp`, `stripe`, `stripeUsd`).
  - `EXAMPLE_SOLD`: ventas de **ejemplo** para ver cómo se ven las piezas vendidas. Bórralas antes de lanzar.
- `src/data/config.ts`: `PAY_MODE` (`'test'` simula el pago) y la ruta del modelo.
- `src/data/budget.ts`: **presupuesto**. Costo del project car, vinil (precio por m², merma, instalación, retiro), comisión de la pasarela, ISR de RESICO, gastos fijos y tipo de cambio. La meta se calcula sola (`src/lib/budget.ts`) y sale desglosada en la sección "¿A dónde va el dinero?".
- `src/data/legal.ts`: **datos legales**. Tu nombre, RFC, domicilio y correo (mientras falten, las páginas legales los marcan en amarillo), vigencia, videos mínimos, plazos, marcas no aceptadas y regímenes fiscales del checkout.
- `src/i18n/strings.ts`: textos en español (`es`) e inglés (`en`).
- **Foto de la portada**: `public/img/palio-foto.webp`, horizontal 13:9 (650 × 450 o más grande). Para cambiarla, reemplaza el archivo con el mismo nombre.

### Piezas y modelo 3D

Son 15 piezas. Los costados traseros ya no se venden solos: van incluidos en las puertas traseras. En su lugar se venden las dos ventanas traseras (las de las puertas de atrás). El archivo `palio.glb` no cambió; al cargarlo, `src/three/remap.ts` junta cada costado con su puerta y recorta las ventanas traseras de la malla de vidrio, para que el logo de cada pieza cubra toda su superficie.

Para cobrar de verdad:

1. Crea un Payment Link por pieza en Mercado Pago (`mp`) y/o Stripe (`stripe`; `stripeUsd` para cobrar en dólares), por el precio **con IVA**.
2. Pégalos en cada pieza de `PARTS` y cambia `PAY_MODE` a `'live'`.
3. Para marcar piezas como vendidas automáticamente hace falta un backend con webhook (por ejemplo Supabase o Vercel Functions). En el código, `src/state/sales.tsx` es el único lugar que tendría que cambiar.

Todo lo que hay que tener en regla fuera del código (SAT, seguro, vidrios, municipio, redes) está en [`docs/LANZAMIENTO.md`](docs/LANZAMIENTO.md).

## Rendimiento

- La landing carga ~125 KB. Three.js, el modelo 3D y el garage se descargan solo cuando la vitrina está por aparecer en pantalla, o en segundo plano cuando el navegador está libre (no se hace si el teléfono tiene activado el ahorro de datos).
- El modelo se carga una vez del `.glb`, sin el base64 que lo hacía 33% más pesado, y lo comparten la vitrina y el garage.
- Cada escena 3D dibuja solo mientras se ve: la vitrina se pausa al salir de pantalla o al cambiar de pestaña.
- Las sombras se calculan una sola vez, no en cada cuadro, porque nada en la escena se mueve. En celulares se dibuja a máximo 1.5× de densidad de pixeles.
- El video teaser solo se reproduce mientras está en pantalla.

## Publicarla

Es un sitio estático: `npm run build` y se sube la carpeta `dist/`.

- **Vercel**: funciona tal cual, `vercel.json` ya manda las rutas como `/garage` a la app.
- **Netlify / Cloudflare Pages**: build `npm run build`, carpeta `dist`. `public/_redirects` ya está incluido.
