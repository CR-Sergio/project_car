# Lanzamiento: lista de lo que hay que tener en regla

Base práctica, no asesoría legal ni fiscal: revísala con un abogado y un contador antes de cobrar.
En el código ya está lo que vive en la página; esta lista es lo que tienes que hacer tú.

## 1. Impuestos (decisión pendiente)

La página ya **no habla de IVA ni de factura**: los precios son finales. Aun así, lo que cobres es un ingreso:

- [ ] Platica con un contador antes de cobrar. Mercado Pago y Stripe reportan al SAT lo que recibes, y sin RFC no puedes acreditar gastos ni dar factura.
- [ ] Si más adelante te das de alta en RESICO (en línea, con e.firma), puedes facturar gratis desde el portal del SAT. Muchas empresas solo compran publicidad con factura: eso puede destrabar ventas.
- [ ] Si te das de alta, revisa con el contador si el IVA queda incluido en los precios actuales.

### Números internos (no se muestran en la página)

Meta pública: **$150,000 MXN**. Las 12 piezas para marcas suman $126,000; las salpicaderas llenas (240 mensajes × $100) agregan $24,000. **Vendiendo todo se llega justo a la meta.**

| Concepto | Estimado |
|---|---|
| Vinil impreso + laminado (≈$900/m²) o microperforado en vidrios (≈$750/m²), +15% merma, instalación y retiro | ≈ $17,550 |
| Comisión de pasarela (≈3.6% + $3 por pago) | ≈ $5,450 sobre $150,000 |
| **Te quedaría para el carro, vendiendo $150,000** | **≈ $127,000** antes de impuestos |

Vinil por pieza: cofre $2,450 · techo de nombres $2,550 por plancha · franja del parabrisas $750 · defensas $900 c/u · puertas delanteras $1,050 c/u ·
puertas traseras (con costado) $1,300 c/u · ventanas traseras $750 c/u · salpicaderas (planchas de mensajes) $950 c/u · portón $1,050 · medallón $850.
Cotiza con 2 o 3 talleres para confirmarlo.

## 2. Textos legales en la página

- [x] Llenar tus datos en `src/data/legal.ts` (Sergio Mondragon, contacto@proyectcar.com, Monterrey, N.L., proyectcar.com). Completado: sin advertencias de pendientes en `/terminos` y `/aviso-de-privacidad`.
- [ ] Revisar las condiciones del servicio en el mismo archivo: vigencia (6 meses), videos mínimos (3) y plazos para logo, diseño, aprobación e instalación. **No subas `diasDiseno` de 10 días hábiles**: es lo que sostiene la política de ventas finales frente al derecho de revocación de 5 días (art. 56 LFPC, que no aplica a servicios que se prestan dentro de 10 días hábiles).
- [ ] Domicilio: puede ser una oficina o un domicilio para notificaciones; no tiene que ser tu casa.
- [ ] Pasarle `/terminos` y `/aviso-de-privacidad` a un abogado. Están escritos con base en la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (DOF 20/03/2025) y la Ley Federal de Protección al Consumidor.
- [ ] Tener un correo real de contacto que revises: por ahí llegan logos, aclaraciones, contracargos y derechos ARCO (plazo de respuesta: 20 días hábiles).
- [ ] Guardar por cada venta la evidencia: fecha y hora de aceptación de términos y de la política de ventas finales, correos con el logo y la aprobación del diseño, y fotos de la instalación. Es lo que te defiende en un contracargo.

## 3. Pagos y Base de Datos (Cloudflare D1 + Stripe Checkout)

El backend serverless ya está implementado en `functions/api/` y el esquema SQL en `d1/schema.sql`.

Pasos para activar en producción:
- [ ] **Crear la base de datos en Cloudflare D1**:
  - En Cloudflare Dashboard > *Workers & Pages* > *D1* > *Create Database* con el nombre `proyect_car_db` (o ejecuta: `npx wrangler d1 create proyect_car_db`).
  - En tu proyecto de Cloudflare Pages > *Settings* > *Functions* > *D1 database bindings*, vincula la variable `DB` apuntando a `proyect_car_db`.
  - Ejecuta el esquema en la base de datos: copia y pega el contenido de `d1/schema.sql` en la consola SQL de D1 en Cloudflare (o ejecuta: `npx wrangler d1 execute proyect_car_db --file=./d1/schema.sql`).
- [ ] **Configurar Stripe**:
  - Crear cuenta en Stripe (a tu nombre y RFC).
  - En Stripe Dashboard > *Developers* > *API keys*, copia la Secret Key (`sk_live_...` o `sk_test_...` para pruebas).
  - En Cloudflare Pages > *Settings* > *Environment variables*, agrega:
    - `STRIPE_SECRET_KEY`: Tu clave secreta de Stripe.
    - `VITE_PAY_MODE`: `live` (o `test` para pruebas).
- [ ] **Configurar el Webhook de Stripe**:
  - En Stripe Dashboard > *Developers* > *Webhooks* > *Add endpoint*.
  - Endpoint URL: `https://tudominio.com/api/webhook`
  - Eventos a escuchar: `checkout.session.completed` y `checkout.session.expired`.
  - Copia el *Signing secret* (`whsec_...`) y agrégalo en las variables de Cloudflare Pages como `STRIPE_WEBHOOK_SECRET`.
- [ ] **Crear el bucket de almacenamiento Cloudflare R2 (para logos PNG)**:
  - En Cloudflare Dashboard > *R2* > *Create Bucket* con el nombre `proyect-car-assets` (o ejecuta: `npx wrangler r2 bucket create proyect-car-assets`).
  - En Cloudflare Pages > *Settings* > *Functions* > *R2 bucket bindings*, vincula la variable `BUCKET` apuntando a `proyect-car-assets`.
  - Con esto, los logos subidos en el checkout se guardan automáticamente en R2, se sirven con caché en `/api/logo/logos/...` y se pintan en el auto 3D, teniendo además el archivo original de hasta 10 MB para la impresión en vinil.
- [ ] **Verificar recibos automáticos**:
  - En Stripe Dashboard > *Settings* > *Customer emails*, activa el envío automático de recibos por compra exitosa.

## 4. Mensajes de la raza y nombres en el techo

Con el backend en Cloudflare Pages Functions y D1, los mensajes y nombres de cortesía se guardan automáticamente en la tabla `messages` cuando Stripe confirma el pago:
- [ ] Revisar cada mensaje y nombre antes de imprimir (sin marcas, anuncios, links, groserías, política ni datos personales) y guardar el correo de confirmación.
- [ ] Imprimir por tandas, al menos una vez al mes mientras haya pendientes (cláusula 13). La página dice "hasta agotar existencias" y no muestra el límite; el límite real es `MESSAGES_PER_PART` (120 por lado, 240 en total, letras de ≈1.3 cm), que es lo que cuadra la meta. Confírmalo con el rotulador en la primera tanda.
- [ ] Ojo con la comisión: en $100 la pasarela se lleva ≈$7 (≈7%).
- [x] Borrar `EXAMPLE_MESSAGES` y `EXAMPLE_SOLD` antes del lanzamiento público definitivo (Completado: base limpia para producción en `src/data/parts.ts`).

## 5. El carro en la calle

- [ ] Avisar a tu aseguradora que el carro va rotulado y se usa para publicidad; confirmar que la póliza sigue cubriendo.
- [ ] Vidrios: usar **vinil microperforado** en medallón y ventanas traseras. En el parabrisas, solo la franja superior. Confirmar con el Reglamento de Tránsito de Monterrey / Nuevo León.
- [ ] Preguntar en Desarrollo Urbano del municipio de Monterrey si la publicidad en un vehículo particular necesita permiso de anuncios.

## 6. Contenido y redes

- [ ] Marcar cada video con pieza pagada como **promoción pagada** en YouTube, TikTok e Instagram.
- [ ] Revisar cada marca antes de rotularla (lista de marcas no aceptadas en `src/data/legal.ts`, `RESTRICTED`). Alcohol, medicamentos y suplementos necesitan permiso de publicidad de COFEPRIS; mejor no aceptarlos.
- [ ] Guardar la aprobación por escrito (correo) de cada diseño antes de imprimir.
- [ ] Opcional: registrar "Proyect Car" en el IMPI. Fiat y Palio son marcas de Stellantis: úsalas solo para describir tu carro.
- [ ] Cambiar la foto de la portada (`public/img/palio-foto.webp`) por una foto tuya: la actual parece foto oficial de Fiat.
