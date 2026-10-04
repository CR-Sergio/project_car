# Proyect Car

Página web del proyecto **Proyect Car**: vendo mi Fiat Palio 2013 en pedazos. Cada pieza del carro se vende como espacio publicitario (estilo Million Dollar Homepage) para juntar **$120,000 MXN** y comprar un project car.

> Versión de prueba: los pagos están simulados.

## Qué tiene

- Portada con letras recortadas, video teaser y medidor de la meta.
- **Vitrina 3D** del Palio (Three.js). Al tocar una pieza, una cortina de garage te lleva al **garage estilo videojuego**: menú de piezas, ficha con estadísticas, cámara que vuela a cada pieza y botón de compra.
- 15 piezas a la venta (puertas, cofre, techo, defensas, salpicaderas, costados, portón, medallón y franja del parabrisas).
- Periódico doblado que se desenrolla al tocarlo.
- Mapa de zonas en Monterrey (base: Tec de Monterrey).
- Español / inglés y pesos / dólares (detección automática + botones manuales).
- Encabezado fijo con la sección actual y un carrito que avanza con el scroll.

## Estructura

```
index.html        Toda la página (HTML, CSS y JS en un solo archivo)
palio.json        Modelo 3D del Palio (GLB en base64) que carga la página
models/palio.glb  El mismo modelo en .glb, con cada pieza como malla con nombre
img/              Letras recortadas, textura de papel y foto en puntos
teaser.mp4/.jpg   Video teaser y su portada
```

## Correrla en tu compu

La página carga `palio.json` con `fetch`, así que necesita un servidor (no funciona abriendo el archivo con doble clic):

```bash
npx serve .
# o
python3 -m http.server 8000
```

## Configuración

Todo se edita al inicio del primer `<script>` de `index.html`:

- `window.PARTS`: piezas, precios en MXN (`price`) y USD (`usd`), zona, medidas y barras del garage (`vis`, `tam`, `cuadro`).
- `window.SOLD`: ventas de **ejemplo** para ver cómo se ven las piezas vendidas. Bórralas antes de lanzar.
- `window.PAY_MODE`: `'test'` simula el pago. Para cobrar de verdad:
  1. Crea un Payment Link por pieza en Mercado Pago (`mp`) y/o Stripe (`stripe`; `stripeUsd` para cobrar en dólares).
  2. Pégalos en cada pieza de `window.PARTS` y cambia `PAY_MODE` a `'live'`.
  3. Para marcar piezas como vendidas automáticamente hace falta un backend pequeño con webhook (por ejemplo Supabase o Vercel Functions).

## Publicarla

Funciona en cualquier hosting de archivos estáticos: Vercel, Netlify, Cloudflare Pages o GitHub Pages (Settings → Pages → rama `main`, carpeta raíz).
